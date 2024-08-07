"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateGuestName,
  updateGooglePic,
  updateGuestPhone,
  updateGuestAddress,
  updateGuestGuardianName,
} from "@/db/queries";
import { roomTypeTable } from "@/db/schema";

const GuestRoomRegistrationForm: React.FC<{
  name: string;
  phone: string;
  imageUrl: string;
}> = () => {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roomType, setRoomType] = useState<string>("Rs.4000/bed");
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    guestPhone: "",
    guestEmail: "",
    fatherName: "",
    fatherPhone: "",
    purpose: "",
    permanentAddress: "",
    policeStation: "",
    city: "",
    state: "",
    guests: [{ name: "", adhaar: "", dob: "", sex: "" }],
    checkInDate: "",
    checkOutDate: "",
    block: "",
    floor: "",
  });
  const [guestImage, setGuestImage] = useState<string>("");
  const [parentImage, setParentImage] = useState<string>("");
  const [guestAadhaarImage, setGuestAadhaarImage] = useState<string>("");
  const [signatureImage, setSignatureImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aadhaarUploaded, setAadhaarUploaded] = useState<boolean>(false);
  const [roomTypeDescription, setRoomTypeDescription] =
    useState<string>("4-Seater");

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parentFileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarFileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);

  const handleRoomTypeChange = (value: string) => {
    setRoomType(value);
    switch (value) {
      case "Rs. 4000/bed":
        setRoomTypeDescription("4-Seater");
        break;
      case "Rs. 4500/bed":
        setRoomTypeDescription("3-Seater");
        break;
      case "Rs. 5000/bed":
        setRoomTypeDescription("2-seater");
        break;
    }
  };

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

  const handleParentImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        setParentImage(event.target?.result as string);

        const fileName = `${guestInfo.fatherName}_${new Date().toISOString()}.png`;
        const { data, error } = await supabase.storage
          .from("parent_image")
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

  const handleSignatureImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        setSignatureImage(event.target?.result as string);

        const fileName = `${guestInfo.name}_${new Date().toISOString()}.png`;
        const { data, error } = await supabase.storage
          .from("signature_image")
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading image:", error);
        } else {
          console.log("Image uploaded successfully:", data);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  const handleAadhaarImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (event) => {
        setGuestAadhaarImage(event.target?.result as string);

        const fileName = `${guestInfo.name}_${new Date().toISOString()}.png`;
        const { data, error } = await supabase.storage
          .from("guest_aadhaar")
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading image:", error);
        } else {
          console.log("Image uploaded successfully:", data);
          setAadhaarUploaded(true);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleParentImageClick = () => {
    parentFileInputRef.current?.click();
  };

  const handleAadhaarImageClick = () => {
    aadhaarFileInputRef.current?.click();
  };

  const handleSignatureImageClick = () => {
    signatureFileInputRef.current?.click();
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
        pdf.save("guest_room_registration_form.pdf");

        return pdf.output("blob"); // Return the PDF as a Blob
      }
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
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

      await fetch("/api/email/payment-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestName: guestInfo.name,
          guestPhone: guestInfo.guestPhone,
          guestEmail: guestInfo.guestEmail,
          checkIn: guestInfo.checkInDate,
          checkOut: guestInfo.checkOutDate,
          roomNumber: guestInfo.block,
          totalAmount: extractAndAdd(roomType),
        }),
      });

      // await Promise.all([
      //   updateGuestName(guestInfo.name),
      //   updateGuestPhone(guestInfo.guestPhone),
      //   updateGuestAddress(guestInfo.permanentAddress),
      //   updateGuestGuardianName(guestInfo.fatherName),
      //   updateGooglePic(guestImage),
      // ]);
    } catch (error) {
      console.error("Error updating guest info", error);
    }
    setIsLoading(false);
    router.push("/thanks");
  };

  const extractAndAdd = (priceString: string) => {
    const match = priceString.match(/Rs\.\s*(\d+)/);
    if (match) {
      const price = parseInt(match[1], 10);
      return price + 1000;
    }
    throw new Error("Invalid price string");
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

        <div className="flex justify-between w-full">
          {/* Logo */}
          <Image
            width={100}
            height={80}
            src="/logo.png"
            alt="Khan Group of Hostels"
            className="h-24"
          />

          <div className="flex gap-2">
            {/* Photo upload area */}
            <div
              className="w-24 h-32 md:w-32 md:h-40 border-2 border-black flex items-center justify-center mb-8 cursor-pointer"
              onClick={handleImageClick}
            >
              {guestImage ? (
                <img
                  src={guestImage}
                  alt="Guest"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs">Applicant Photo</span>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div
              className="w-24 h-32 md:w-32 md:h-40 border-2 border-black flex items-center justify-center mb-8 cursor-pointer"
              onClick={handleParentImageClick}
            >
              {parentImage ? (
                <img
                  src={parentImage}
                  alt="Guest"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs">Parent Photo</span>
              )}
              <input
                type="file"
                ref={parentFileInputRef}
                onChange={handleParentImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>
        {/* Form fields */}
        <div className="mt-10 space-y-6">
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
            label="Guest Email"
            name="guestEmail"
            value={guestInfo.guestEmail || ""}
            onChange={handleInputChange}
          />
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
              {/* <InputField
                label="Adhaar #"
                name="adhaar"
                value={guest.adhaar}
                onChange={(e) => handleGuestInputChange(index, e)}
                className="w-1/4"
              /> */}
              <div
                onClick={handleAadhaarImageClick}
                className="relative -top-1 "
              >
                <span className="text-xs md:text-md font-bold">Aadhaar</span>
                <input
                  type="file"
                  ref={aadhaarFileInputRef}
                  onChange={handleAadhaarImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="border-b border-dotted border-black mt-2 text-xs md:text-md">
                  {aadhaarUploaded ? "success" : "pending"}
                </div>
              </div>
              <InputField
                label="Date of Birth"
                name="dob"
                value={guest.dob}
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
          <h2 className="font-bold text-xs md:text-md text-red-500">
            Declaration
          </h2>
          <ul className="space-y-1 text-xs md:text-sm">
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
        <div className="mt-8 flex justify-between space-x-2 md:space-x-4">
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
            label="Block"
            name="block"
            value={guestInfo.block || ""}
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

        {/* payment */}
        <div className="flex space-x-2 lg:space-x-4 my-4">
          <InputField
            label="Secuity Deposit(Refundable)"
            name="securityDeposit"
            value="Rs. 1000"
            onChange={handleInputChange}
            className="w-1/3"
          />
          <InputField
            label="Room Type"
            name="roomType"
            value={roomType}
            onChange={handleInputChange}
            className="w-1/3"
          />
          <InputField
            label="Total"
            name="total"
            value={extractAndAdd(roomType).toString()}
            onChange={handleInputChange}
            className="w-1/3"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{roomTypeDescription}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Room Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={roomType}
                onValueChange={handleRoomTypeChange}
              >
                <DropdownMenuRadioItem value="Rs.4000/bed">
                  4-Seater
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Rs. 4500/bed">
                  3-Seater
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Rs. 5000/bed">
                  2-seater
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Signature */}
        <span className="font-extrabold">Guest Signature</span>
        <div
              className="w-24 h-10 border-2 border-black flex items-center justify-center mb-8 cursor-pointer"
              onClick={handleSignatureImageClick}
            >
              {signatureImage ? (
                <img
                  src={signatureImage}
                  alt="Guest"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs">Guest Signature Photo</span>
              )}
              <input
                type="file"
                ref={signatureFileInputRef}
                onChange={handleSignatureImageChange}
                accept="image/*"
                className="hidden"
              />
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
        disabled={isLoading}
      >
        {isLoading ? <LoaderCircle className="animate-spin" /> : "Submit"}
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
    <label className="font-bold mb-1 text-xs md:text-md">{label}</label>
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
