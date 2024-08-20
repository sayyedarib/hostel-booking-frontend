import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Html2Pdf from "html2pdf.js";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";

import type { AgreementForm } from "@/interface";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { getAgreementFormData, getSecurityDepositStatus } from "@/db/queries";
import { logger, calculateRent } from "@/lib/utils";
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

  const agreementFormRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [agreementForm, setAgreementForm] = useState<AgreementForm | null>(
    null,
  );

  const [securityDeposit, setSecurityDeposit] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState(0);
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

  const uploadToSupabase = async (
    file: Blob,
    bucket: string,
    fileName: string,
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading file to Supabase:", error);
    } else {
      console.log("File uploaded successfully:", data);
    }
  };

  const handlePrintInvoice = useReactToPrint({
    content: () => invoiceRef.current,
    print: async (printIframe) => {
      const document = printIframe.contentDocument;
      if (document) {
        const html = document.getElementsByClassName("App")[0];
        const options = {
          margin: 0,
          filename: `invoice-${new Date().getTime()}.pdf`,
        };
        const exporter = new Html2Pdf(html, options);
        const pdfBlob = await exporter.getPdf(options);

        // Automatically download the PDF
        const link = document.createElement("a");
        link.href = URL.createObjectURL(pdfBlob);
        link.download = options.filename;
        link.click();

        // Upload to Supabase
        await uploadToSupabase(pdfBlob, "invoice", options.filename);
      }
    },
  });

  const handlePrintAgreement = useReactToPrint({
    content: () => agreementFormRef.current,
    print: async (printIframe) => {
      const document = printIframe.contentDocument;
      if (document) {
        const html = document.getElementsByClassName("App")[0];
        const options = {
          margin: 0,
          filename: `agreement-${new Date().getTime()}.pdf`,
        };
        const exporter = new Html2Pdf(html, options);
        const pdfBlob = await exporter.getPdf(options);

        // Automatically download the PDF
        const link = document.createElement("a");
        link.href = URL.createObjectURL(pdfBlob);
        link.download = options.filename;
        link.click();

        // Upload to Supabase
        await uploadToSupabase(pdfBlob, "agreement", options.filename);
      }
    },
  });

  const handlePaymentConfirmation = async () => {
    setLoading(true);
    handlePrintInvoice();
    handlePrintAgreement();
    setLoading(false);

    handleNext();
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
        <ForwardedPrintableForm
          ref={agreementFormRef}
          className="hidden"
          {...agreementForm}
        />
      )}
      {agreementForm && (
        <PrintableInvoice
          ref={invoiceRef}
          invoiceNumber={`INV-${new Date().getTime()}`}
          invoiceDate={new Date()}
          customerName={agreementForm?.name}
          customerPhone={agreementForm?.phone}
          customerAddress={`${agreementForm?.address}, ${agreementForm?.city}, ${agreementForm?.state}, ${agreementForm?.pin}`}
          items={agreementForm.guests}
          securityDeposit={securityDeposit}
          className="my-invoice mt-10 hidden"
        />
      )}
    </div>
  );
}
