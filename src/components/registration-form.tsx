"use client";

import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import SignatureCanvas from "react-signature-canvas";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PrintableForm from "@/components/printable-registration-form";
import { Separator } from "@/components/ui/separator";
import { Label } from "./ui/label";

interface Guest {
  name: string;
  adhaar: string;
  dob: string;
}

interface FormData {
  name: string;
  guestImage: string;
  phone: string;
  dob: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  parentImage: string;
  purposeOfStay: string;
  permanentAddress: string;
  policeStation: string;
  city: string;
  state: string;
  guests: Guest[];
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  floor: string;
  aadhaarImage: string;
  signature: string;
  securityDeposit: string;
  roomType: string;
  totalAmount: string;
}

const RegistrationForm = () => {
  const supabase = createClient();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    guestImage: "",
    phone: "",
    dob: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    parentImage: "",
    purposeOfStay: "",
    permanentAddress: "",
    policeStation: "",
    city: "",
    state: "",
    guests: [],
    checkInDate: "",
    checkOutDate: "",
    roomNumber: "",
    floor: "",
    aadhaarImage: "",
    signature: "",
    securityDeposit: "1000", // Default value
    roomType: "4-Seater", // Default value
    totalAmount: "",
  });
  const [roomType, setRoomType] = useState<string>("Rs.4000/bed");
  const [roomTypeDescription, setRoomTypeDescription] =
    useState<string>("4-Seater");

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

  useEffect(() => {
    const totalAmount = extractPriceAndAddSecurity(roomType);
    setFormData((prev) => ({ ...prev, totalAmount: totalAmount.toString() }));
  }, [roomType]);

  const extractPriceAndAddSecurity = (priceString: string) => {
    const match = priceString.match(/Rs\.\s*(\d+)/);
    if (match) {
      const price = parseInt(match[1], 10);
      return price + 1000;
    }
    throw new Error("Invalid price string");
  };

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Generate a unique file name
        const fileName = `${Date.now()}_${file.name}`;

        // Determine the bucket based on the field
        let bucketName: string;
        switch (field) {
          case "guestImage":
            bucketName = "guest_image";
            break;
          case "parentImage":
            bucketName = "parent_image";
            break;
          case "aadhaarImage":
            bucketName = "guest_aadhaar";
            break;
          default:
            throw new Error("Invalid field for image upload");
        }

        // Upload file to the appropriate Supabase bucket
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (error) {
          throw error;
        }

        // Get public URL of the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        if (publicUrlData) {
          // Update form data with the public URL
          setFormData((prev) => ({
            ...prev,
            [field]: publicUrlData.publicUrl,
          }));
        } else {
          throw new Error("Failed to get public URL for uploaded file");
        }

        // Optionally, you can show a success message to the user
        console.log(`${field} uploaded successfully`);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle error (e.g., show error message to user)
        // You might want to use a toast or alert component to show this error to the user
        alert(
          `Error uploading ${field}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestChange = (
    index: number,
    field: keyof Guest,
    value: string,
  ) => {
    setFormData((prev: FormData) => {
      const newGuests = [...prev.guests];
      newGuests[index][field] = value;
      return { ...prev, guests: newGuests };
    });
  };

  const addGuest = () => {
    setFormData((prev) => ({
      ...prev,
      guests: [...prev.guests, { name: "", adhaar: "", dob: "" }],
    }));
  };

  const removeGuest = (index: number) => {
    setFormData((prev) => {
      const newGuests = [...prev.guests];
      newGuests.splice(index, 1);
      return { ...prev, guests: newGuests };
    });
  };

  const printableRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<SignatureCanvas>(null);

  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
  });

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    setFormData((prev) => ({ ...prev, signature: "" }));
  };

  const handleSaveSignature = () => {
    if (signatureRef.current) {
      const signatureDataUrl = signatureRef.current.toDataURL();
      setFormData((prev) => ({ ...prev, signature: signatureDataUrl }));
    }
  };

  return (
    <div className="p-8 md:max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">
        Applicant/Guest Registration
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Take parent image and applicant image as input here */}
        <div className="md:flex">
          <label htmlFor="guestImage" className="w-52">
            Applicant Image:
          </label>
          <Input
            type="file"
            id="guestImage"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "guestImage")}
          />
        </div>
        <div className="md:flex">
          <label htmlFor="parentImage" className="w-52">
            Parent Image:
          </label>
          <Input
            type="file"
            id="parentImage"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "parentImage")}
          />
        </div>
        {/* Take aadhaar image as input here. */}
        <div className="md:flex">
          <label htmlFor="aadhaarImage" className="w-52">
            Aadhaar Image:
          </label>
          <Input
            type="file"
            id="aadhaarImage"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "aadhaarImage")}
          />
        </div>

        <Separator className="md:col-span-2" />
        <Input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Name"
          required
        />
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Phone"
        />
        <Input
          name="dob"
          value={formData.dob}
          onChange={handleInputChange}
          placeholder="Date of Birth"
        />
        <Input
          name="fatherName"
          value={formData.fatherName}
          onChange={handleInputChange}
          placeholder="Father's Name"
        />
        <Input
          name="fatherPhone"
          value={formData.fatherPhone}
          onChange={handleInputChange}
          placeholder="Father's Phone"
        />
        <Input
          name="motherName"
          value={formData.motherName}
          onChange={handleInputChange}
          placeholder="Mother's Name"
        />
        <Input
          name="purposeOfStay"
          value={formData.purposeOfStay}
          onChange={handleInputChange}
          placeholder="Purpose of Stay"
        />
        <Textarea
          name="permanentAddress"
          value={formData.permanentAddress}
          onChange={handleInputChange}
          placeholder="Permanent Address"
        />
        <Input
          name="policeStation"
          value={formData.policeStation}
          onChange={handleInputChange}
          placeholder="Police Station"
        />
        <Input
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          placeholder="City"
        />
        <Input
          name="state"
          value={formData.state}
          onChange={handleInputChange}
          placeholder="State"
        />
        <Separator className="md:col-span-2" />
        <Input
          name="checkInDate"
          value={formData.checkInDate}
          onChange={handleInputChange}
          placeholder="Check In Date e.g. 24 Aug 2024"
        />
        <Input
          name="checkOutDate"
          value={formData.checkOutDate}
          onChange={handleInputChange}
          placeholder="Check Out Date"
        />
        <Input
          name="roomNumber"
          value={formData.roomNumber}
          onChange={handleInputChange}
          placeholder="Room Number"
        />
        <Input
          name="floor"
          value={formData.floor}
          onChange={handleInputChange}
          placeholder="Floor"
        />
        <Separator className="md:col-span-2" />
        <div>
          <Label htmlFor="securityDeposit" className="w-52">
            Security Deposit(Refundable)
          </Label>
          <Input
            name="securityDeposit"
            value={formData.securityDeposit}
            onChange={handleInputChange}
            placeholder="Security Deposit"
            disabled
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex flex-col text-sm mt-1">
              <span>Room Type</span>
              <Button variant="outline">{roomTypeDescription}</Button>
            </div>
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
        <div>
          <Label htmlFor="totalAmount" className="w-52">
            Total Amount
          </Label>
          <Input
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleInputChange}
            placeholder="Total Amount"
            disabled
          />
        </div>
        <Separator className="md:col-span-2" />
      </div>
      <Separator className="my-8" />
      <h2 className="text-xl font-semibold mb-2">Guests(Optional)</h2>
      {formData.guests.map((guest, index) => (
        <div key={index} className="grid md:grid-cols-3 gap-4 py-4">
          <Input
            value={guest.name}
            onChange={(e) => handleGuestChange(index, "name", e.target.value)}
            placeholder="Name"
          />
          <Input
            value={guest.adhaar}
            onChange={(e) => handleGuestChange(index, "adhaar", e.target.value)}
            placeholder="Aadhaar"
          />
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <Input
              value={guest.dob}
              onChange={(e) => handleGuestChange(index, "dob", e.target.value)}
              placeholder="Date of Birth"
            />
            <Trash2
              onClick={() => removeGuest(index)}
              className="cursor-pointer "
            />
          </div>
          <Separator />
        </div>
      ))}
      <Button onClick={addGuest} className="mb-4">
        Add Guest
      </Button>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Signature</h2>
        <div className="border border-gray-300 mb-2">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 350,
              height: 200,
              className: "signature-canvas",
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClearSignature}>Clear Signature</Button>
          <Button onClick={handleSaveSignature}>Save Signature</Button>
        </div>
      </div>

      <Button onClick={handlePrint}>Print Form</Button>

      <div className="hidden">
        <PrintableForm ref={printableRef} formData={formData} />
      </div>
    </div>
  );
};

export default RegistrationForm;
