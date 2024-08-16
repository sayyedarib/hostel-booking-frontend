import React from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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
}

interface PrintableFormProps {
  formData: FormData;
}

const PrintableForm: React.ForwardRefRenderFunction<
  HTMLDivElement,
  PrintableFormProps
> = ({ formData }, ref) => (
  <div ref={ref} className="p-8 max-w-4xl mx-auto text-xs">
    <h1 className="text-lg font-bold underline text-center mb-4">
      Applicant/Guest Registration
    </h1>
    <div className="flex items-center justify-between mb-4">
      <Image src="/logo.png" alt="Logo" width={100} height={80} />

      <div className="flex gap-3">
        {formData.guestImage && (
          <Image
            src={formData.guestImage}
            width={110}
            height={150}
            className="border h-44"
            alt="Guest Image"
          />
        )}
        {formData.parentImage && (
          <Image
            src={formData.parentImage}
            width={110}
            height={150}
            className="border h-44"
            alt="Parent Image"
          />
        )}
      </div>
    </div>

    <div className="grid grid-cols-2 grid-rows-6 gap-4 mb-4">
      <p>
        <strong>Name:</strong> {formData.name}
      </p>
      <p>
        <strong>Phone:</strong> {formData.phone}
      </p>
      <p>
        <strong>Father&apos;s Name:</strong> {formData.fatherName}
      </p>
      <p>
        <strong>Father&apos;s Phone:</strong> {formData.fatherPhone}
      </p>
      <p className="col-span-2">
        <strong>Purpose of Stay in PG/Guest Room:</strong>{" "}
        {formData.purposeOfStay}
      </p>
      <p className="col-span-2">
        <strong>Permanent Address:</strong> {formData.permanentAddress}
      </p>
      <p>
        <strong>Police Station:</strong> {formData.policeStation}
      </p>
      <p>
        <strong>City:</strong> {formData.city}
      </p>
      <p>
        <strong>State:</strong> {formData.state}
      </p>
      <p>
        <strong>Date of Birth:</strong>{" "}
        {formData.dob ? formData.dob : "Not provided"}
      </p>
    </div>

    {formData.guests.length > 0 && (
      <>
        <h2 className="text-lg font-semibold mb-2">
          Name of people staying in Guest Room
        </h2>
        <div className="grid grid-cols-3">
          {formData.guests.map((guest, index) => (
            <div key={index}>
              <p>
                {index + 1}. {guest.name}
              </p>
              <p>Adhaar: {guest.adhaar}</p>
              <p>Date of Birth: {guest.dob}</p>
            </div>
          ))}
        </div>
      </>
    )}

    <h2 className="text-lg font-semibold mt-4 mb-2 underline">Declaration</h2>
    <ol className="list-decimal pl-5 mb-4">
      <li>
        I understand and accept the general conditions for booking of hostel
        accommodation & Guest Room.
      </li>
      <li>
        Thank you for choosing KGH GUEST ROOMS. We want to let you know that our
        online booking open 24 hours for all your questions and inquiries.
        www.aligarhhostel.com Please don&apos;t hesitate to contact us if you
        have any questions. We are happy to help!
      </li>
      <li>
        We kindly remind you that the hostel and all rooms are non-smoking
        alcohol, drugs and bad thinks are not tolerated.
      </li>
      <li>
        If smoking or any kind of bad thing use is noticed by the hostel
        management, they are allowed to charge a fine up to 1500/Rs. and precede
        an early check out.
      </li>
      <li>
        By signing this form, you agree on following the hostel&apos;s and Guest
        Rooms rules and the purpose described above, plus consenting to the
        usage of your personal Information for administrative and marketing
        purposes.
      </li>
      <li>
        By signing this form, I consent to the use of my personal information
        for the purpose described above.
      </li>
      <li>
        <strong>All staying people please provide ID Proof.</strong>
      </li>
    </ol>

    <div className="grid grid-cols-4 gap-4 mb-4">
      <p>
        <strong>Check-in Date:</strong> {formData.checkInDate}
      </p>
      <p>
        <strong>Check-out Date:</strong> {formData.checkOutDate}
      </p>
      <p>
        <strong>Room:</strong> {formData.roomNumber}
      </p>
      <p>
        <strong>Floor:</strong> {formData.floor}
      </p>
    </div>

    <div className="flex gap-4 mt-8 justify-between">
      <div className="flex flex-col">
        <p>Applicant/Guest Signature</p>
        {formData.signature && (
          <Image
            src={formData.signature}
            width={200}
            height={100}
            alt="Applicant Signature"
          />
        )}
      </div>
      <div className="flex flex-col">
        <p>Aadhaar Card</p>
        {formData.aadhaarImage && (
          <Image
            src={formData.aadhaarImage}
            width={200}
            height={100}
            className="border"
            alt="Aadhaar Card"
          />
        )}
      </div>
    </div>
    <p className="mt-4 font-semibold underline text-center">
      We respectfully remind you that check-out time is 11AM
    </p>

    <p className="mt-8 text-center">
      Campus View Apartment, Shamshad Market Aligarh. 202001 Mobile# 8791476473
    </p>
  </div>
);

const ForwardedPrintableForm = React.forwardRef<
  HTMLDivElement,
  PrintableFormProps
>(PrintableForm);

ForwardedPrintableForm.displayName = "PrintableForm";

export default ForwardedPrintableForm;
