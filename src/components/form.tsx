"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { jsPDF } from "jspdf";

export default function PayingGuestAgreement() {
  const [formData, setFormData] = useState({
    owner: "",
    payingGuest1: "",
    payingGuest2: "",
    flatNo: "",
    floor: "",
    buildingName: "",
    address: "",
    city: "",
    agreementDate: "",
    agreementMonth: "",
    agreementYear: "",
    duration: "",
    startDate: "",
    amount: "",
    amountInWords: "",
    securityDeposit: "",
    securityDepositInWords: "",
    additionalDeposit: "",
    additionalDepositInWords: "",
    additionalDepositDate: "",
    electricityDeduction: "200",
  });

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

  const handleClauseChange = (name: string) => {
    setClauses((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const allClausesChecked = Object.values(clauses).every(Boolean);

  const generatePDF = () => {
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

    addText(
      `BETWEEN ${formData.owner} AND ${formData.payingGuest1}${formData.payingGuest2 ? `, ${formData.payingGuest2}` : ""}`,
      0,
      true,
    );
    addText(`Re: One room in Flat No. ${formData.flatNo}`, 0, true);
    y += 10;

    addText(
      `AGREEMENT made at ${formData.city} this ${new Date(formData.agreementDate).getDate()} day of ${new Date(formData.agreementDate).toLocaleString("default", { month: "long" })} ${new Date(formData.agreementDate).getFullYear()} BETWEEN ${formData.owner} hereinafter referred to as "the Owner" of the One Part AND ${formData.payingGuest1}${formData.payingGuest2 ? ` and ${formData.payingGuest2}` : ""} hereinafter referred to as "the Paying Guest" of the Second Part;`,
      0,
      true,
    );

    addText(
      `WHEREAS the Owner is seized and possessed of and is occupying Flat No.${formData.flatNo} on the ${formData.floor} floor of the building named and known as ${formData.buildingName} situated at ${formData.address};`,
    );

    addText(
      "AND WHEREAS the Paying Guest have requested the Owner to allow them use of one bedroom in the flat in the aforesaid premises for their own use only on a temporary basis on the terms and conditions hereinafter written.",
    );

    addText("NOW THIS AGREEMENT WITNESSETH:");

    addText(
      "1. The Owner hereby agrees to permit the Paying Guest to use one bedroom in the aforesaid premises being Flat No." +
        formData.flatNo +
        " in " +
        formData.buildingName +
        " situated at " +
        formData.address +
        " together with the use of the attached bathroom, on paying guest basis.",
      10,
    );

    addText(
      `2. This Paying Guest Agreement shall be for a period of ${formData.duration} months only commencing from ${formData.startDate}.`,
      10,
    );

    addText(
      `3. The Paying Guest shall pay an amount of Rs.${formData.amount} (Rupees ${formData.amountInWords} only) for every quarter (three months). The charges shall include the use of bathroom and other incidentals and society charges. The Paying Guest have agreed to pay the entire electricity bill, less an amount of Rs.${formData.electricityDeduction}/- (Rupees ${formData.electricityDeduction === "200" ? "two hundred" : formData.electricityDeduction}) per month.`,
      10,
    );

    addText(
      `4. The Paying Guest have paid at the time of execution hereof a security deposit of Rs.${formData.securityDeposit} (Rupees ${formData.securityDepositInWords} only) which shall remain with the Owner free of interest, until the termination of this agreement, and shall be returned to the Paying Guest, subject to any deduction for payments due hereunder. The Paying Guest shall pay a further sum of Rs.${formData.additionalDeposit} (Rupees ${formData.additionalDepositInWords} only) as Security Deposit on or before ${formData.additionalDepositDate}.`,
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
    addText(`named ${formData.payingGuest1}`);
    if (formData.payingGuest2) {
      addText(`and ${formData.payingGuest2}`);
    }
    addText("in the presence of");

    y += 20;
    doc.setFontSize(14);
    addText("R E C E I P T");
    doc.setFontSize(12);

    addText(
      `Received this day the sum of Rs.${formData.securityDeposit} (Rupees ${formData.securityDepositInWords} only) by cheque bearing No. __________ and Rs.${formData.additionalDeposit} (Rupees ${formData.additionalDepositInWords} only) by cheque bearing No. __________ dated ${formData.additionalDepositDate} both drawn on __________ Bank __________ Branch from ${formData.payingGuest1}${formData.payingGuest2 ? ` and ${formData.payingGuest2}` : ""}, the Paying Guests towards security deposit.`,
    );

    addText("WE SAY RECEIVED");
    y += 10;
    addText(`${formData.owner}`);

    doc.save("paying-guest-agreement.pdf");
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Paying Guest Agreement</h1>
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="owner">Owner Name</Label>
            <Input
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="payingGuest1">Paying Guest 1</Label>
            <Input
              id="payingGuest1"
              name="payingGuest1"
              value={formData.payingGuest1}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="payingGuest2">Paying Guest 2</Label>
            <Input
              id="payingGuest2"
              name="payingGuest2"
              value={formData.payingGuest2}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="flatNo">Flat No.</Label>
            <Input
              id="flatNo"
              name="flatNo"
              value={formData.flatNo}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="floor">Floor</Label>
            <Input
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="buildingName">Building Name</Label>
            <Input
              id="buildingName"
              name="buildingName"
              value={formData.buildingName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="agreementDate">Agreement Date</Label>
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
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (per quarter)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="amountInWords">Amount in Words</Label>
            <Input
              id="amountInWords"
              name="amountInWords"
              value={formData.amountInWords}
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
            />
          </div>
          <div>
            <Label htmlFor="securityDepositInWords">
              Security Deposit in Words
            </Label>
            <Input
              id="securityDepositInWords"
              name="securityDepositInWords"
              value={formData.securityDepositInWords}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="additionalDeposit">Additional Deposit</Label>
            <Input
              id="additionalDeposit"
              name="additionalDeposit"
              type="number"
              value={formData.additionalDeposit}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="additionalDepositInWords">
              Additional Deposit in Words
            </Label>
            <Input
              id="additionalDepositInWords"
              name="additionalDepositInWords"
              value={formData.additionalDepositInWords}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="additionalDepositDate">
              Additional Deposit Date
            </Label>
            <Input
              id="additionalDepositDate"
              name="additionalDepositDate"
              type="date"
              value={formData.additionalDepositDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="electricityDeduction">
              Electricity Deduction (Rs.)
            </Label>
            <Input
              id="electricityDeduction"
              name="electricityDeduction"
              type="number"
              value={formData.electricityDeduction}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Agreement Clauses</h2>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause5"
                checked={clauses.clause5}
                onCheckedChange={() => handleClauseChange("clause5")}
              />
              <Label htmlFor="clause5">
                The Owner may allot to the Paying Guest any of the bedrooms in
                the said flat for the use of the Paying Guest and the Owner may
                change the allocation at any time during the pendency of the
                Agreement.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause6"
                checked={clauses.clause6}
                onCheckedChange={() => handleClauseChange("clause6")}
              />
              <Label htmlFor="clause6">
                The Paying Guest hereby specifically confirm and agree that they
                have no right whatsoever to the said premises nor shall claim to
                be tenant/sub-tenant or licensees nor shall claim any other
                right whatsoever in or to the said premises.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause7"
                checked={clauses.clause7}
                onCheckedChange={() => handleClauseChange("clause7")}
              />
              <Label htmlFor="clause7">
                It is clearly agreed and understood that the Paying Guest have
                not been given any key to the entrance door of the flat nor even
                to the room that is allocated to them for their temporary use
                from time to time.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause8"
                checked={clauses.clause8}
                onCheckedChange={() => handleClauseChange("clause8")}
              />
              <Label htmlFor="clause8">
                They Paying Guest may use the passages in the flat for access to
                the room and may use the kitchen for cooking their own food only
                provided that no disturbance whatsoever is caused to the use of
                the kitchen and passages and other portions of the flat by the
                Owner and his servants and others.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause9"
                checked={clauses.clause9}
                onCheckedChange={() => handleClauseChange("clause9")}
              />
              <Label htmlFor="clause9">
                The Paying Guest shall not cause any disturbance at any time and
                may permit guests or any outsider to enter the flat only with
                the permission of the Owner.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause10"
                checked={clauses.clause10}
                onCheckedChange={() => handleClauseChange("clause10")}
              />
              <Label htmlFor="clause10">
                In the event that the Paying Guest misuse any of the facilities
                in the flat or causes any disturbance or delays in making
                payment of the Paying Guest charges, this Agreement shall stand
                terminated forthwith and it is hereby specifically agreed and
                confirmed that the Owner shall be entitled to enter the room
                allocated to the Paying Guest for the time being and to remove
                all the belongings of the Paying Guest and dispose of them.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause11"
                checked={clauses.clause11}
                onCheckedChange={() => handleClauseChange("clause11")}
              />
              <Label htmlFor="clause11">
                This Agreement shall stand terminated immediately upon the
                expiry of the period mentioned hereinabove.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="clause12"
                checked={clauses.clause12}
                onCheckedChange={() => handleClauseChange("clause12")}
              />
              <Label htmlFor="clause12">
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
          onClick={generatePDF}
          disabled={!allClausesChecked}
          className={`mt-6 ${!allClausesChecked ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Download Agreement
        </Button>
      </form>
    </div>
  );
}
