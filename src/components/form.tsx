"use client";

import React, { useState } from "react";
import { toWords } from "number-to-words";
import { jsPDF } from "jspdf";
import { CircleHelp, IndianRupee, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function PayingGuestAgreement() {
  const supabase = createClient();
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString().split("T")[0];
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    owner: "Khan Group of Hostels(Boys & Girls)",
    payingGuest: "",
    buildingName: "Campus View Appartment",
    guestAddress: "",
    address: "",
    city: "",
    agreementDate: formattedCurrentDate,
    agreementMonth: "",
    agreementYear: "",
    duration: "",
    startDate: formattedCurrentDate,
    amount: "4500",
    totalAmount: "",
    securityDeposit: "2000",
  });

  const [guestImage, setGuestImage] = useState<File | null>(null);

  type Clauses = {
    [key: string]: boolean;
  };

  const [clauses, setClauses] = useState<Clauses>({
    clause5: false,
    clause6: false,
    clause7: false,
    clause8: false,
    clause9: false,
    clause10: false,
    clause11: false,
    clause12: false,
  });

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGuestImage(e.target.files[0]);
    }
  };

  const handleClauseChange = (name: string) => {
    setClauses((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const allClausesChecked = Object.values(clauses).every(Boolean);

  const generatePDF = async () => {
    if (!allClausesChecked) {
      alert("Please agree to all clauses before downloading the agreement.");
      return;
    }

    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Paying Guest Agreement", 105, 20, { align: "center" });

    doc.setFontSize(12);
    let y = 30;

    const addText = (text: string, indent = 0, bold = false) => {
      if (bold) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }
      doc.text(text, 20 + indent, y, {
        maxWidth: 170 - indent,
        align: "justify",
      });
      y += doc.splitTextToSize(text, 170 - indent).length * 5;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    };

    // Add guest image if available
    if (guestImage) {
      try {
        const imgData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(guestImage);
        });

        doc.addImage(imgData, "JPEG", 150, y, 40, 40);
        y += 45;
      } catch (error) {
        console.error("Error adding image to PDF:", error);
      }
    }

    addText(`BETWEEN ${formData.owner} AND ${formData.payingGuest}`, 0, true);
    // addText(`Re: One room in Flat No. ${formData.flatNo}`, 0, true);
    y += 10;

    addText(
      `AGREEMENT made at ${formData.city} this ${weekday[currentDate.getDay()]} day of ${formattedCurrentDate} BETWEEN ${formData.owner} hereinafter referred to as "the Owner" of the One Part AND ${formData.payingGuest} hereinafter referred to as "the Paying Guest" of the Second Part;`,
      0,
      true,
    );

    addText(
      `WHEREAS the Owner is seized and possessed of and is occupying building named and known as ${formData.buildingName} situated at Shah Jahan Public School, Shamshad Market, Aligarh;`,
    );

    addText(
      "AND WHEREAS the Paying Guest have requested the Owner to allow them use of one bedroom in the flat in the aforesaid premises for their own use only on a temporary basis on the terms and conditions hereinafter written.",
    );

    addText("NOW THIS AGREEMENT WITNESSETH:");

    addText(
      "1. The Owner hereby agrees to permit the Paying Guest to use one bedroom in" +
        formData.buildingName +
        " situated at " +
        "Shah Jahan Public School, Shamshad Market, Aligarh" +
        " together with the use of the attached or shared bathroom, on paying guest basis.",
      10,
    );

    addText(
      `2. This Paying Guest Agreement shall be for a period of ${formData.duration} months only commencing from ${formData.startDate}.`,
      10,
    );

    addText(
      `3. The Paying Guest shall pay an amount of Rs.${formData.totalAmount} (Rupees ${toWords(Number(formData.totalAmount))} only) for every quarter (three months). The charges shall include the use of bathroom and other incidentals and society charges.`,
      10,
    );

    addText(
      `4. The Paying Guest have paid at the time of execution hereof a security deposit of Rs.2,000 (Rupees Two Thousands only) which shall remain with the Owner free of interest, until the termination of this agreement, and shall be returned to the Paying Guest, subject to any deduction for payments due hereunder.`,
      10,
    );

    // Add clauses 5 to 12
    const clausesText = [
      "The Owner may allot to the Paying Guest any of the bedrooms in the said flat for the use of the Paying Guest and the Owner may change the allocation at any time during the pendency of the Agreement.",
      "The Paying Guest hereby specifically confirm and agree that they have no right whatsoever to the said premises nor shall claim to be tenant/sub-tenant or licensees nor shall claim any other right whatsoever in or to the said premises.",
      "It is clearly agreed and understood that the Paying Guest have not been given any key to the entrance door of the flat nor even to the room that is allocated to them for their temporary use from time to time.",
      "The Paying Guest may use the passages in the flat for access to the room and may use the kitchen for cooking their own food only provided that no disturbance whatsoever is caused to the use of the kitchen and passages and other portions of the flat by the Owner and his servants and others.",
      "The Paying Guest shall not cause any disturbance at any time and may permit guests or any outsider to enter the flat only with the permission of the Owner.",
      "In the event that the Paying Guest misuse any of the facilities in the flat or cause any disturbance or delay in making payment of the Paying Guest charges, this Agreement shall stand terminated forthwith and it is hereby specifically agreed and confirmed that the Owner shall be entitled to enter the room allocated to the Paying Guest for the time being and to remove all the belongings of the Paying Guest and dispose of them.",
      "This Agreement shall stand terminated immediately upon the expiry of the period mentioned hereinabove.",
      "The Paying Guest shall be responsible for any damage caused by them or by any other outsider who has entered the flat through them to the said flat and to any of the furniture, fixtures and equipment therein, reasonable wear and tear excepted.",
    ];

    clausesText.forEach((clause, index) => {
      addText(`${index + 5}. ${clause}`, 10);
    });

    addText(
      "IN WITNESS WHEREOF the parties hereto have hereunto set and subscribed their respective hands the day and year first hereinabove written.",
    );

    addText("SIGNED AND DELIVERED by the within-");
    addText(`named ${formData.owner}`);
    addText("in the presence of");
    y += 10;
    addText("SIGNED AND DELIVERED by the within-");
    addText(`named ${formData.payingGuest}`);
    addText("in the presence of");

    y += 20;
    doc.setFontSize(14);
    addText("R E C E I P T");
    doc.setFontSize(12);

    addText(
      `Received this day ${formattedCurrentDate} the sum of Rs.${formData.securityDeposit} (Rupees ${toWords(Number(formData.securityDeposit))} only), by the Paying Guests towards security deposit.`,
    );

    addText("WE SAY RECEIVED");
    y += 10;
    addText(`${formData.owner}`);

    doc.save("paying-guest-agreement.pdf");
    return new Promise<Blob>((resolve) => {
      const pdfBlob: Blob = doc.output("blob");
      resolve(pdfBlob);
    });
  };

  const uploadPDF = async (pdfBlob: Blob | undefined) => {
    if (!pdfBlob) {
      console.log(
        "No PDF blob found. Please generate the PDF before uploading.",
      );
      return;
    }
    const { data, error } = await supabase.storage
      .from("agreement_docs")
      .upload(`${formData.payingGuest}-${Date.now()}.pdf`, pdfBlob);

    if (error) {
      console.error("Error uploading PDF:", error);
    } else {
      console.log("PDF uploaded successfully:", data);
    }
  };

  const uploadGuestImage = async () => {
    if (!guestImage) {
      console.log("No guest image selected.");
      return;
    }

    const { data, error } = await supabase.storage
      .from("guest_image")
      .upload(`${formData.payingGuest}-${Date.now()}.jpg`, guestImage);

    if (error) {
      console.error("Error uploading guest image:", error);
    } else {
      console.log("Guest image uploaded successfully:", data);
    }
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      console.log("generating PDF...");
      const pdfBlob = await generatePDF();
      console.log("uploading PDF...");
      await uploadPDF(pdfBlob);
      console.log("uploading guest image...");
      await uploadGuestImage();
      setIsLoading(false);
    } catch (error) {
      console.error("Error in upload process:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Paying Guest Agreement</h1>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guestImage">Guest Image</Label>
            <Input
              id="guestImage"
              name="guestImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <Label htmlFor="payingGuest">Guest Name</Label>
            <Input
              id="payingGuest"
              name="payingGuest"
              value={formData.payingGuest}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="guestAddress">Guest Address</Label>
            <Textarea
              id="guestAddress"
              name="guestAddress"
              value={formData.guestAddress}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="agreementDate">Agreement Date/Joining Date</Label>
            <Input
              id="agreementDate"
              name="agreementDate"
              type="date"
              value={formData.agreementDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (in months)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount" className="flex gap-3">
              Amount (per Month)
              <HoverCard>
                <HoverCardTrigger>
                  <CircleHelp size={14} />
                </HoverCardTrigger>
                <HoverCardContent>
                  <Card className="border-none">
                    <CardHeader>
                      <CardTitle>Amount Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <span className="flex justify-between">
                          <span className="flex items-center">
                            <IndianRupee size={14} /> 5000/bed
                          </span>
                          <span>2-seater rooms</span>
                        </span>
                        <span className="flex justify-between">
                          <span className="flex items-center">
                            <IndianRupee size={14} /> 4500/bed
                          </span>
                          <span>3-seater rooms</span>
                        </span>
                        <span className="flex justify-between">
                          <span className="flex items-center">
                            <IndianRupee size={14} /> 4000/bed
                          </span>
                          <span>4-seater rooms</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </HoverCardContent>
              </HoverCard>
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="securityDeposit">Security Deposit</Label>
            <Input
              id="securityDeposit"
              name="securityDeposit"
              type="number"
              value={formData.securityDeposit}
              onChange={handleInputChange}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="totalAmount">Total Amount to be paid</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              value={(
                Number(formData.amount) * Number(formData.duration) +
                Number(formData.securityDeposit)
              ).toString()}
              onChange={handleInputChange}
              disabled
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Agreement Clauses</h2>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Checkbox
                id="clause5"
                checked={clauses.clause5}
                onCheckedChange={() => handleClauseChange("clause5")}
              />
              <Label className="leading-5" htmlFor="clause5">
                The Owner may allot to the Paying Guest any of the bedrooms in
                the said flat for the use of the Paying Guest and the Owner may
                change the allocation at any time during the pendency of the
                Agreement.
              </Label>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="clause6"
                checked={clauses.clause6}
                onCheckedChange={() => handleClauseChange("clause6")}
              />
              <Label className="leading-5" htmlFor="clause6">
                The Paying Guest hereby specifically confirm and agree that they
                have no right whatsoever to the said premises nor shall claim to
                be tenant/sub-tenant or licensees nor shall claim any other
                right whatsoever in or to the said premises.
              </Label>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="clause7"
                checked={clauses.clause7}
                onCheckedChange={() => handleClauseChange("clause7")}
              />
              <Label className="leading-5" htmlFor="clause7">
                It is clearly agreed and understood that the Paying Guest have
                not been given any key to the entrance door of the flat nor even
                to the room that is allocated to them for their temporary use
                from time to time.
              </Label>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="clause8"
                checked={clauses.clause8}
                onCheckedChange={() => handleClauseChange("clause8")}
              />
              <Label className="leading-5" htmlFor="clause8">
                They Paying Guest may use the passages in the flat for access to
                the room and may use the kitchen for cooking their own food only
                provided that no disturbance whatsoever is caused to the use of
                the kitchen and passages and other portions of the flat by the
                Owner and his servants and others.
              </Label>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="clause9"
                checked={clauses.clause9}
                onCheckedChange={() => handleClauseChange("clause9")}
              />
              <Label className="leading-5" htmlFor="clause9">
                The Paying Guest shall not cause any disturbance at any time and
                may permit guests or any outsider to enter the flat only with
                the permission of the Owner.
              </Label>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="clause10"
                checked={clauses.clause10}
                onCheckedChange={() => handleClauseChange("clause10")}
              />
              <Label className="leading-5" htmlFor="clause10">
                In the event that the Paying Guest misuse any of the facilities
                in the flat or causes any disturbance or delays in making
                payment of the Paying Guest charges, this Agreement shall stand
                terminated forthwith and it is hereby specifically agreed and
                confirmed that the Owner shall be entitled to enter the room
                allocated to the Paying Guest for the time being and to remove
                all the belongings of the Paying Guest and dispose of them.
              </Label>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="clause11"
                checked={clauses.clause11}
                onCheckedChange={() => handleClauseChange("clause11")}
              />
              <Label className="leading-5" htmlFor="clause11">
                This Agreement shall stand terminated immediately upon the
                expiry of the period mentioned hereinabove.
              </Label>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="clause12"
                checked={clauses.clause12}
                onCheckedChange={() => handleClauseChange("clause12")}
              />
              <Label className="leading-5" htmlFor="clause12">
                The Paying Guest shall be responsible for any damage caused by
                them or by any other outsider who has entered the flat through
                them to the said flat and to any of the furniture, fixtures and
                equipment therein, reasonable wear and tear excepted.
              </Label>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={async () => await handleUpload()}
          disabled={!allClausesChecked || isLoading}
          className={`mt-6 ${!allClausesChecked ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {!isLoading ? (
            "Download Agreement"
          ) : (
            <LoaderCircle className="animate-spin" />
          )}
        </Button>
      </form>
    </div>
  );
}
