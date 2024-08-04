"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

import {
  updateGuestName,
  updateGooglePic,
  updateGuestPhone,
  updateGuestAddress,
  updateGuestGuardianName,
} from "@/db/queries";

const GuestRoomRegistrationForm: React.FC<{
  name: string;
  phone: string;
  imageUrl: string;
}> = () => {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [guestInfo, setGuestInfo] = useState({
    name: "",
    guestPhone: "",
    fatherName: "",
    fatherPhone: "",
    purpose: "",
    permanentAddress: "",
    policeStation: "",
    city: "",
    state: "",
    guests: [{ name: "", adhaar: "", age: "", sex: "" }],
    checkInDate: "",
    checkOutDate: "",
    flatNumber: "",
    floor: "",
  });
  const [guestImage, setGuestImage] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => {
      const newGuests = [...prev.guests];
      newGuests[index] = { ...newGuests[index], [name]: value };
      return { ...prev, guests: newGuests };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        setGuestImage(event.target?.result as string);

        const fileName = `${guestInfo.name}_${new Date().toISOString()}.png`;
        const { data, error } = await supabase.storage
          .from("guest_image")
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading image:", error);
        } else {
          console.log("Image uploaded successfully:", data);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const generatePDF = async () => {
    try {
      if (formRef.current) {
        const canvas = await html2canvas(formRef.current);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", [canvas.width, canvas.height]);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        // pdf.save("guest_room_registration_form.pdf");

        return pdf.output("blob"); // Return the PDF as a Blob
      }
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  const handleSubmit = async () => {
    const pdfBlob = await generatePDF();
    const fileName = `${guestInfo.name}_${new Date().toISOString()}.pdf`;
    try {
      if (pdfBlob) {
        console.log("uploading pdf...");
        const { data, error } = await supabase.storage
          .from("agreement_docs")
          .upload(fileName, pdfBlob);
        console.log("uploaded pdf response", data, error);
      }

      await Promise.all([
        updateGuestName(guestInfo.name),
        updateGuestPhone(guestInfo.guestPhone),
        updateGuestAddress(guestInfo.permanentAddress),
        updateGuestGuardianName(guestInfo.fatherName),
        updateGooglePic(guestImage),
      ]);
    } catch (error) {
      console.error("Error updating guest info", error);
    }

    router.push(`/checkout?${searchParams.toString()}`);
  };

  return (
    <>
      <div
        ref={formRef}
        className="max-w-full lg:w-[210mm] h-full mx-auto my-10 bg-white p-8 relative"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <h1 className="text-center text-red-500 font-bold text-xl mb-14">
          Guest Room Registration Form
        </h1>

        {/* Logo */}
        <Image
          width={100}
          height={100}
          src="/logo.png"
          alt="Khan Group of Hostels"
          className="absolute top-20 left-8"
        />

        {/* Photo upload area */}
        <div
          className="absolute top-14 right-8 w-32 h-40 border-2 border-black flex items-center justify-center mb-8 cursor-pointer"
          onClick={handleImageClick}
        >
          {guestImage ? (
            <img
              src={guestImage}
              alt="Guest"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>Photo</span>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Form fields */}
        <div className="mt-44 space-y-6">
          <div className="flex w-full gap-2">
            <InputField
              className="w-2/3"
              label="Name"
              name="name"
              value={guestInfo.name || ""}
              onChange={handleInputChange}
            />
            <InputField
              className="w-1/3"
              label="Phone"
              name="guestPhone"
              value={guestInfo.guestPhone || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex w-full gap-2">
            <InputField
              className="w-2/3"
              label="Father's Name"
              name="fatherName"
              value={guestInfo.fatherName || ""}
              onChange={handleInputChange}
            />
            <InputField
              className="w-1/3"
              label="Phone"
              name="fatherPhone"
              value={guestInfo.fatherPhone || ""}
              onChange={handleInputChange}
            />
          </div>
          <InputField
            label="Purpose of Stay in Hostel/Guest Room"
            name="purpose"
            value={guestInfo.purpose || ""}
            onChange={handleInputChange}
          />
          <InputField
            label="Permanent Address"
            name="permanentAddress"
            value={guestInfo.permanentAddress || ""}
            onChange={handleInputChange}
          />
          <div className="flex justify-between space-x-4">
            <InputField
              label="Police Station"
              name="policeStation"
              value={guestInfo.policeStation || ""}
              onChange={handleInputChange}
              className="w-1/3"
            />
            <InputField
              label="City"
              name="city"
              value={guestInfo.city || ""}
              onChange={handleInputChange}
              className="w-1/3"
            />
            <InputField
              label="State"
              name="state"
              value={guestInfo.state || ""}
              onChange={handleInputChange}
              className="w-1/3"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="mt-8">
          <h2 className="font-bold">Name of people staying in Guest Room</h2>
          {guestInfo.guests.map((guest, index) => (
            <div key={index} className="flex justify-between mt-2">
              <InputField
                label={`${index + 1}.`}
                name="name"
                value={guest.name}
                onChange={(e) => handleGuestInputChange(index, e)}
                className="w-1/4"
              />
              <InputField
                label="Adhaar #"
                name="adhaar"
                value={guest.adhaar}
                onChange={(e) => handleGuestInputChange(index, e)}
                className="w-1/4"
              />
              <InputField
                label="Age"
                name="age"
                value={guest.age}
                onChange={(e) => handleGuestInputChange(index, e)}
                className="w-1/6"
              />
              <InputField
                label="Sex"
                name="sex"
                value={guest.sex}
                onChange={(e) => handleGuestInputChange(index, e)}
                className="w-1/6"
              />
            </div>
          ))}
        </div>

        {/* Declaration */}
        <div className="mt-8">
          <h2 className="font-bold text-red-500">Declaration</h2>
          <ul className="space-y-2 text-sm">
            <li>
              I understand and accept the general conditions for booking of
              hostel accommodation & Guest Room.
            </li>
            <li>
              Thank you for choosing KGH GUEST ROOMS. We want to let you know
              that our online booking open 24 hours for all your questions and
              inquiries. www.hostelinaligarh.com Please don&apos;t hesitate to
              contact us if you have any questions. We are happy to help!
            </li>
            <li>
              We kindly remind you that the hostel and all rooms are non-smoking
              alcohol, drugs and bad thinks are not tolerated.
            </li>
            <li>
              If smoking or any kind of bad thing use is noticed by the hostel
              management, they are allowed to charge a fine up to 1500/Rs. and
              precede an early check out.
            </li>
            <li>
              By signing this form, you agree on following the hostel&apos;s and
              Guest Rooms rules and the purpose described above, plus consenting
              to the usage of your personal Information for administrative and
              marketing purposes.
            </li>
            <li>
              By signing this form, I consent to the use of my personal
              information for the purpose described above.
            </li>
            <li className="font-bold">
              All staying people please provide ID Proof.
            </li>
          </ul>
        </div>

        {/* Check-in/out details */}
        <div className="mt-8 flex justify-between space-x-2 md:space-x-4 text-xs md:text-md">
          <InputField
            label="Check-in Date"
            name="checkInDate"
            value={guestInfo.checkInDate || ""}
            onChange={handleInputChange}
            className="w-1/4"
          />
          <InputField
            label="Check-out Date"
            name="checkOutDate"
            value={guestInfo.checkOutDate || ""}
            onChange={handleInputChange}
            className="w-1/4"
          />
          <InputField
            label="Flat #"
            name="flatNumber"
            value={guestInfo.flatNumber || ""}
            onChange={handleInputChange}
            className="w-1/4"
          />
          <InputField
            label="Floor"
            name="floor"
            value={guestInfo.floor || ""}
            onChange={handleInputChange}
            className="w-1/4"
          />
        </div>

        {/* Signature */}
        <div className="mt-8">
          <p>Guest Signature: ____________________________</p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-bold underline">
            We respectfully remind you that check-out time is 11AM
          </p>
          <p className="mt-2">
            Campus View Apartment, Shamshad Market Aligarh. 202001 Mobile#
            8791476473
          </p>
        </div>
      </div>
      <Button
        onClick={handleSubmit}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Proceed to Payment
      </Button>
    </>
  );
};

const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ label, name, value, onChange, className }) => (
  <div className={cn(className, "flex flex-col")}>
    <label className="font-bold mb-1">{label}</label>
    <div className="relative pb-1">
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full bg-transparent outline-none absolute bottom-1 mb-1"
      />
      <div className="border-b border-dotted border-black mt-6"></div>
    </div>
  </div>
);

export default GuestRoomRegistrationForm;
