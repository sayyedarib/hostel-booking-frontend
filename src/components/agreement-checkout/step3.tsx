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
import { Description } from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";

export default function Step3({
  handleNext,
  handlePrev,
}: {
  handleNext: () => void;
  handlePrev: () => void;
}) {
  const { toast } = useToast();
  const supabase = createClient();

  const agreementRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [agreementForm, setAgreementForm] = useState<AgreementForm | null>(
    null
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
            new Date(guest.checkOut)
          ).totalRent,
          payableRent: calculateRent(
            guest.monthlyRent,
            new Date(guest.checkIn),
            new Date(guest.checkOut)
          ).payableRent,
        })),
      };

      setSecurityDeposit(securityDepositData != "paid" ? 1000 : 0);
      setTotalAmount(
        enhancedAgreementData.guests.reduce(
          (acc, item) => acc + item.payableRent,
          0
        )
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
            `File uploaded successfully: ${publicUrlData.publicUrl}`
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
    []
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
        toast({
          variant: "default",
          description: (
            <div className="space-x-2 flex gap-2">
              <LoaderCircle className="animate-spin" /> Generating Invoice...
            </div>
          ),
        });
        const pdfBlob = await html2pdf()
          .from(html)
          .set(options)
          .outputPdf("blob");

        if (pdfBlob instanceof Blob) {
          logger("info", "PDF generated successfully, downloading invoice PDF");
          toast({
            variant: "default",
            description: (
              <div className="space-x-2">Invoice Generated successfully!</div>
            ),
          });

          toast({
            variant: "default",
            description: (
              <div className="space-x-2">Downloading Invoice...</div>
            ),
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(pdfBlob);
          link.download = options.filename;
          link.click();

          logger("info", "Uploading invoice PDF to Supabase");
          toast({
            variant: "default",
            description: (
              <div className="space-x-2 flex gap-2">
                <LoaderCircle className="animate-spin" /> Uploading invoice...
              </div>
            ),
          });

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
        toast({
          variant: "default",
          description: (
            <div className="space-x-2 flex gap-2">
              <LoaderCircle className="animate-spin" /> Generating Agreement...
            </div>
          ),
        });
        const pdfBlob = await html2pdf()
          .from(html)
          .set(options)
          .outputPdf("blob");

        if (pdfBlob instanceof Blob) {
          logger(
            "info",
            "Agreement generated successfully, downloading agreement PDF"
          );

          toast({
            variant: "default",
            description: (
              <div className="space-x-2">Agreement Generated successfully!</div>
            ),
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(pdfBlob);
          link.download = options.filename;
          link.click();

          logger("info", "Uploading agreement PDF to Supabase");
          toast({
            variant: "default",
            description: (
              <div className="space-x-2 flex gap-2">
                <LoaderCircle className="animate-spin" /> Uploading agreement
                PDF...
              </div>
            ),
          });
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

        if (result?.status === "error") {
          logger("error", "Failed to create booking", result);
          toast({
            variant: "destructive",
            description: (
              <div>
                Error in creating booking, please try again or contact support
                email...
              </div>
            ),
          });
          return;
        }

        logger("info", "Booking created successfully", result);
        toast({
          variant: "default",
          description: (
            <div className="space-x-2 flex gap-2">
              <LoaderCircle className="animate-spin" /> Sending confirmation
              email...
            </div>
          ),
        });

        // Send confirmation emails
        logger("info", "Sending confirmation email to owner for booking id", {
          bookingId: result?.data?.id,
        });
        await fetch("/api/email/booking-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId: result?.data?.id }),
        }).catch((error) => {
          logger(
            "error",
            "Error in sending confirmation email",
            error as Error
          );

          return;
        });

        toast({
          variant: "default",
          description: (
            <div className="space-x-2">Email sent successfully!</div>
          ),
        });

        logger("info", "Booking created successfully", result);
        setLoading(false);
        handleNext();

        setLoading(false);
      }
    };

    createBookingIfUrlsExist();
  }, [invoiceUrl, agreementUrl]);

  const handlePaymentConfirmation = async () => {
    setLoading(true);

    try {
      logger("info", "Generating and uploading invoice");
      await handleBeforePrintInvoice();

      logger("info", "Generating and uploading agreement");
      await handleBeforePrintAgreement();
      setLoading(false);
    } catch (error) {
      logger("error", "Error in generating or uploading PDF", error as Error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl flex flex-col md:flex-row">
      <div className="flex md:flex-col gap-3 md:w-1/2 items-center">
        <div>
          <Image
            width={250}
            height={250}
            src="/img/qr.png"
            alt="Scanner"
            className="rounded-lg"
          />
        </div>

        <div>
          <p className="text-gray-600">UPI: sayyedaribhussain4321@okhdfcbank</p>
          <p className="text-gray-600">Account: 50100430236612</p>
          <p className="text-gray-600">IFSC: HDFC0009579</p>
          <p className="text-gray-600">Branch: MANGLI NICHI</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:w-1/2">
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
