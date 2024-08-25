import { useState, useEffect, useRef, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";

import type { AgreementForm } from "@/interface";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  createBooking,
  getAgreementFormData,
  getSecurityDepositStatus,
} from "@/db/queries";
import { logger, calculateRent, generateToken } from "@/lib/utils";
import ForwardedPrintableForm from "../printable-registration-form";
import PrintableInvoice from "../printable-invoice";

export default function Step3({
  handleNext,
  handlePrev,
}: {
  handleNext: () => void;
  handlePrev: () => void;
}) {
  const supabase = createClient();

  const agreementRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [agreementForm, setAgreementForm] = useState<AgreementForm | null>(
    null,
  );

  const [securityDeposit, setSecurityDeposit] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [agreementUrl, setAgreementUrl] = useState<string | null>(null);
  const [isPaidChecked, setIsPaidChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: agreementData } = await getAgreementFormData();
      const { data: securityDepositData } = await getSecurityDepositStatus();

      if (!agreementData) {
        logger("info", "Failed to fetch data");
        return;
      }

      const enhancedAgreementData = {
        ...agreementData,
        guests: agreementData.guests.map((guest) => ({
          ...guest,
          totalRent: calculateRent(
            guest.monthlyRent,
            new Date(guest.checkIn),
            new Date(guest.checkOut),
          ).totalRent,
          payableRent: calculateRent(
            guest.monthlyRent,
            new Date(guest.checkIn),
            new Date(guest.checkOut),
          ).payableRent,
        })),
      };

      setSecurityDeposit(securityDepositData != "paid" ? 1000 : 0);
      setTotalAmount(
        enhancedAgreementData.guests.reduce(
          (acc, item) => acc + item.payableRent,
          0,
        ),
      );
      setAgreementForm(agreementData);
    };

    fetchData();
  }, []);

  const uploadToSupabase = useCallback(
    async (file: Blob, bucket: string, fileName: string): Promise<void> => {
      try {
        logger("info", "Uploading file to bucket");
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (publicUrlData) {
          logger(
            "info",
            `File uploaded successfully: ${publicUrlData.publicUrl}`,
          );
          if (bucket === "invoice") {
            setInvoiceUrl(publicUrlData.publicUrl);
          } else {
            setAgreementUrl(publicUrlData.publicUrl);
          }
        }

        if (error) {
          logger("error", "Error uploading file to Supabase:", error);
          throw new Error(`Error uploading file to Supabase: ${error.message}`);
        } else {
          console.log("File uploaded successfully:", data);
        }
      } catch (error) {
        logger("error", "Error uploading file to Supabase:", error as Error);
        throw error;
      }
    },
    [],
  );

  const handleBeforePrintInvoice = useCallback(async () => {
    try {
      const html = invoiceRef.current;
      if (html) {
        const options = {
          margin: 10,
          filename: `invoice-${new Date().getTime()}.pdf`,
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        logger("info", "Starting PDF generation with html2pdf");
        const pdfBlob = await html2pdf()
          .from(html)
          .set(options)
          .outputPdf("blob");

        if (pdfBlob instanceof Blob) {
          logger("info", "PDF generated successfully, downloading invoice PDF");
          const link = document.createElement("a");
          link.href = URL.createObjectURL(pdfBlob);
          link.download = options.filename;
          link.click();

          logger("info", "Uploading invoice PDF to Supabase");
          await uploadToSupabase(pdfBlob, "invoice", options.filename);
        } else {
          throw new Error("Generated PDF is not a valid Blob object");
        }
      } else {
        throw new Error("invoiceRef.current is null or undefined");
      }
    } catch (error) {
      logger("error", "Error in generating or uploading PDF", error as Error);
    }
  }, []);

  const handleBeforePrintAgreement = useCallback(async () => {
    try {
      const html = agreementRef.current;
      if (html) {
        const options = {
          margin: 10,
          filename: `agreement-${new Date().getTime()}.pdf`,
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        logger("info", "Starting PDF generation with html2pdf");
        const pdfBlob = await html2pdf()
          .from(html)
          .set(options)
          .outputPdf("blob");

        if (pdfBlob instanceof Blob) {
          logger(
            "info",
            "PDF generated successfully, downloading agreement PDF",
          );
          const link = document.createElement("a");
          link.href = URL.createObjectURL(pdfBlob);
          link.download = options.filename;
          link.click();

          logger("info", "Uploading agreement PDF to Supabase");
          await uploadToSupabase(pdfBlob, "agreement", options.filename);
        } else {
          throw new Error("Generated PDF is not a valid Blob object");
        }
      } else {
        throw new Error("agreementRef.current is null or undefined");
      }
    } catch (error) {
      logger("error", "Error in generating or uploading PDF", error as Error);
    }
  }, []);
  const handleInvoice = useReactToPrint({
    content: () => invoiceRef.current,
    onBeforePrint: handleBeforePrintInvoice,
    onAfterPrint: async () => {
      logger("info", "Invoice printed successfully");
      logger("info", "generating token....");
      const token = generateToken();

      if (!invoiceUrl || !agreementUrl) {
        logger("error", "Invoice or agreement URL is missing", {
          invoiceUrl,
          agreementUrl,
        });
        setLoading(false);
        return;
      }

      logger("info", "Creating booking in database");
      const result = await createBooking({
        amount: totalAmount + securityDeposit,
        invoiceUrl,
        agreementUrl,
        token,
      });

      if (result?.status === "success") {
        // Send confirmation emails
        if (!result?.data?.id) {
          // TODO: Add toast
          logger("error", "Booking ID is missing in response", result);
          setLoading(false);
          return;
        }
        const response = await fetch("/api/email/booking-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId: result?.data?.id }),
        });

        if (!response.ok) {
          throw new Error("Failed to send confirmation emails");
        }
      }

      handleNext();
    },
  });

  const handlePrintInvoice = async () => {
    logger("info", "Printing invoice...");
    try {
      await handleInvoice();
    } catch (error) {
      logger("error", "Error in printing invoice", error as Error);
    }
  };

  const handleAgreement = useReactToPrint({
    content: () => agreementRef.current,
    onBeforePrint: handleBeforePrintAgreement,
    onAfterPrint: handlePrintInvoice,
  });

  const handlePrintAgreement = async () => {
    logger("info", "Printing invoice...");
    try {
      await handleAgreement();
    } catch (error) {
      logger("error", "Error in printing invoice", error as Error);
    }
  };

  useEffect(() => {
    const createBookingIfUrlsExist = async () => {
      if (invoiceUrl && agreementUrl) {
        logger("info", "Generating token....");
        const token = generateToken();

        logger("info", "Creating booking in database");
        const result = await createBooking({
          amount: totalAmount + securityDeposit,
          invoiceUrl,
          agreementUrl,
          token,
        });

        if (result?.status === "success") {
          // Send confirmation emails
          const response = await fetch("/api/email/booking-confirmation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookingId: result?.data }),
          });

          if (!response.ok) {
            throw new Error("Failed to send confirmation emails");
          }
        }

        handleNext();
        setLoading(false);
      }
    };

    createBookingIfUrlsExist();
  }, [invoiceUrl, agreementUrl]); // Dependency array

  const handlePaymentConfirmation = async () => {
    setLoading(true);

    try {
      logger("info", "Generating and uploading invoice");
      await handleBeforePrintInvoice();

      logger("info", "Generating and uploading agreement");
      await handleBeforePrintAgreement();
    } catch (error) {
      logger("error", "Error in generating or uploading PDF", error as Error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl flex flex-col md:flex-row">
      <div className="flex md:flex-col gap-3 md:w-1/2 items-center">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Bank Details:
          </h3>
          <Image
            width={250}
            height={250}
            src="/img/qr.png"
            alt="Scanner"
            className="rounded-lg"
          />
        </div>

        <div>
          <p className="text-gray-600">UPI: 1234567890@hdfcbank</p>
          <p className="text-gray-600">Account: 1234567890</p>
          <p className="text-gray-600">IFSC: HDFC0001234</p>
          <p className="text-gray-600">Branch: HDFC Bank, Bangalore</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:w-1/2">
        <h1 className="text-xl font-semibold text-gray-800">Summary</h1>
        <Separator />
        <span className="text-gray-600">
          Total Bed(s): <strong>{agreementForm?.guests.length}</strong>
        </span>
        <span className="text-gray-600">
          Guest(s):{" "}
          <strong>
            {agreementForm?.guests
              .map((item) => item.name.split(" ")[0])
              .join(", ")}
          </strong>
        </span>
        <span className="text-gray-600">
          Total Rent: <strong>Rs. {totalAmount}</strong>
        </span>
        {securityDeposit && (
          <span className="text-gray-600">
            Security Deposit(Refundable): <strong>Rs. 1000</strong>
          </span>
        )}
        <Separator />
        <span className="text-gray-800 font-semibold">
          Total Amount: <strong>Rs.{totalAmount + securityDeposit}</strong>
        </span>
        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="paymentConfirmation"
            checked={isPaidChecked}
            onCheckedChange={(checked) => setIsPaidChecked(checked === true)}
          />
          <Label htmlFor="paymentConfirmation" className="text-gray-600">
            I have paid the rent and security deposit
          </Label>
        </div>
        <Button
          onClick={handlePaymentConfirmation}
          disabled={!isPaidChecked || loading}
          className={`mt-4 ${isPaidChecked ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"} text-white font-semibold py-2 px-4 rounded-lg`}
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Confirm Payment"
          )}
        </Button>
      </div>

      {agreementForm && (
        <div className="hidden">
          <ForwardedPrintableForm ref={agreementRef} {...agreementForm} />
        </div>
      )}
      {agreementForm && (
        <div className="hidden">
          <PrintableInvoice
            ref={invoiceRef}
            invoiceNumber={`INV-${new Date().getTime()}`}
            invoiceDate={new Date()}
            customerName={agreementForm?.name}
            customerPhone={agreementForm?.phone}
            customerAddress={`${agreementForm?.address}, ${agreementForm?.city}, ${agreementForm?.state}, ${agreementForm?.pin}`}
            items={agreementForm.guests}
            securityDeposit={securityDeposit}
          />
        </div>
      )}
    </div>
  );
}
