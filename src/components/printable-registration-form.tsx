import React from "react";
import Image from "next/image";
import { AgreementForm } from "@/interface";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PrintableFormProps extends AgreementForm {
  className?: string;
}

const PrintableForm: React.ForwardRefRenderFunction<
  HTMLDivElement,
  PrintableFormProps
> = ({ className, ...formData }, ref) => (
  <div
    ref={ref}
    className={cn(
      className,
      "p-12 max-w-5xl mx-auto text-base text-gray-900 leading-relaxed font-serif border border-gray-300 shadow-md bg-white",
    )}
  >
    <header className="mb-12">
      <div className="flex justify-between items-center border-b pb-6 mb-6">
        <Image src="/logo.png" alt="Logo" width={100} height={80} />
        <div className="text-right">
          <p className="font-bold text-lg">Campus View Apartment</p>
          <p>Shamshad Market, Aligarh, 202001</p>
          <p>Mobile: 8791476473</p>
          <p>www.aligarhhostel.com</p>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-center uppercase tracking-wide">
        Applicant/Guest Registration
      </h1>
    </header>

    <section className="mb-12">
      <div className="grid grid-cols-2 gap-5 mt-8">
        <div className="space-y-4">
          <p>
            <strong>Name:</strong> {formData.name}
          </p>
          <p>
            <strong>Phone:</strong> {formData.phone}
          </p>
          <p>
            <strong>Guardian&apos;s Name:</strong> {formData.guardianName}
          </p>
          <p>
            <strong>Guardian&apos;s Phone:</strong> {formData.guardianPhone}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {formData.dob ? formatDate(new Date(formData.dob)) : "Not provided"}
          </p>
        </div>
        <div className="flex justify-evenly">
          {formData.applicantPhoto && (
            <div>
              <Image
                src={formData.applicantPhoto}
                width={140}
                height={150}
                className="border h-44"
                alt="Guest Image"
              />
              <span className="text-center">Applicant</span>
            </div>
          )}
          {formData.guardianPhoto && (
            <div>
              <Image
                src={formData.guardianPhoto}
                width={140}
                height={150}
                className="border h-44"
                alt="Parent Image"
              />
              <span>Guardian</span>
            </div>
          )}
        </div>
        <p>
          <strong>Address:</strong> {formData.address}
        </p>
        <p>
          <strong>Pin Code:</strong> {formData.pin}
        </p>
        <p>
          <strong>City:</strong> {formData.city}
        </p>
        <p>
          <strong>State:</strong> {formData.state}
        </p>
      </div>
    </section>

    {formData.guests.length > 0 && (
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          People staying in Guest Room
        </h2>
        <div className="grid gap-8">
          {formData.guests.map((guest, index) => (
            <div
              key={index}
              className="border relative border-gray-300 p-6"
              style={{ pageBreakInside: "avoid" }}
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Guest {index + 1}
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-800 mb-3">
                    <strong>Name:</strong> {guest.name}
                  </p>
                  <p className="text-gray-800 mb-3">
                    <strong>Phone:</strong> {guest.phone}
                  </p>
                  <p className="text-gray-800 mb-3">
                    <strong>Email:</strong> {guest.email}
                  </p>
                  <p className="text-gray-800 mb-3">
                    <strong>Date of Birth:</strong> {guest.dob}
                  </p>
                </div>
                <div className="flex gap-6 mb-10">
                  <div>
                    <h4 className="text-gray-700 font-semibold mb-3">
                      ID Proof
                    </h4>
                    <Image
                      width={180}
                      height={140}
                      src={guest.aadhaarUrl}
                      alt="ID Proof"
                      className="border border-gray-300 h-36 w-60"
                    />
                  </div>
                  <div>
                    <h4 className="text-gray-700 font-semibold mb-3">
                      Guest Photo
                    </h4>
                    <Image
                      width={140}
                      height={140}
                      src={guest.photoUrl}
                      alt="Guest Photo"
                      className="border border-gray-300"
                    />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 flex justify-around w-full">
                  <p className="text-gray-800 mb-3">
                    <strong>Room No.:</strong> {guest?.roomCode}
                  </p>
                  <p className="text-gray-800 mb-3">
                    <strong>Bed No.:</strong> {guest?.bedCode}
                  </p>
                  <p className="text-gray-800 mb-3">
                    <strong>Check-in:</strong>{" "}
                    {formatDate(new Date(guest?.checkIn))}
                  </p>
                  <p className="text-gray-800 mb-3">
                    <strong>Check-out:</strong>{" "}
                    {formatDate(new Date(guest?.checkOut))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-4">
        Declaration
      </h2>
      <ol className="list-decimal pl-6 space-y-3">
        <li>
          I understand and accept the general conditions for booking of hostel
          accommodation & Guest Room.
        </li>
        <li>
          Thank you for choosing KGH GUEST ROOMS. We are here to assist you 24
          hours a day. Please reach out with any questions or inquiries.
        </li>
        <li>
          All hostel and room areas are non-smoking. Alcohol, drugs, and other
          prohibited substances are not tolerated.
        </li>
        <li>
          If any prohibited activities are detected, management reserves the
          right to charge a fine up to Rs. 1500 and proceed with an early
          check-out.
        </li>
        <li>
          By signing this form, I agree to follow the hostel’s and Guest Rooms’
          rules and consent to the usage of my personal information for
          administrative and marketing purposes.
        </li>
        <li>
          <strong>All staying guests must provide ID Proof.</strong>
        </li>
      </ol>
    </section>

    <section className="flex justify-between items-center mt-12">
      <div className="flex flex-col items-center">
        <p>Applicant/Guest Signature</p>
        {formData.signature && (
          <Image
            src={formData.signature}
            width={220}
            height={100}
            alt="Applicant Signature"
            className="border mt-4 h-32"
          />
        )}
      </div>
      <div className="flex flex-col items-center">
        <p>Aadhaar Card</p>
        {formData.userIdImage && (
          <Image
            src={formData.userIdImage}
            width={220}
            height={100}
            className="border mt-4 h-32"
            alt="Aadhaar Card"
          />
        )}
      </div>
    </section>

    <footer className="mt-12 text-center border-t pt-8">
      <p className="font-semibold uppercase text-lg">Check-out time: 11AM</p>
      <p className="mt-4">
        Campus View Apartment, Shamshad Market Aligarh, 202001. Mobile:
        8791476473
      </p>
    </footer>
  </div>
);

const ForwardedPrintableForm = React.forwardRef<
  HTMLDivElement,
  PrintableFormProps
>(PrintableForm);

ForwardedPrintableForm.displayName = "PrintableForm";

export default ForwardedPrintableForm;
