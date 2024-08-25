import React from "react";
import Image from "next/image";

import { AgreementForm } from "@/interface";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
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
      "max-w-5xl mx-auto text-base leading-relaxed font-serif shadow-md bg-white",
    )}
  >
    <header className="bg-white h-52">
      <div className="flex justify-between items-center">
        <img src="/logo.png" className="w-32 h-32" alt="Logo" />
        <div className="text-right">
          <p className="font-bold text-lg">Campus View Apartment</p>
          <p>Shamshad Market, Aligarh, 202001</p>
          <p>Mobile: 8791476473</p>
          <p>www.aligarhhostel.com</p>
        </div>
      </div>
      <div className="h-2 bg-white" />
      <Separator />
      <div className="h-2 bg-white" />
      <h1 className="text-3xl font-bold text-center uppercase tracking-wide">
        Applicant/Guest Registration
      </h1>
    </header>

    <div className="bg-white h-8" />

    <section className="bg-white pb-2">
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white space-y-5">
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
            <>
              <Image
                src={formData.applicantPhoto}
                width={112}
                height={144}
                className="border w-28 h-36"
                alt="Guest Image"
              />
              {/* <span className="text-center">Applicant</span> */}
            </>
          )}
          {formData.guardianPhoto && (
            <>
              <Image
                src={formData.guardianPhoto}
                width={112}
                height={144}
                className="border w-28 h-36"
                alt="Parent Image"
              />
              {/* <span>Guardian</span> */}
            </>
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
    <div className="bg-white h-8" />
    <Separator />

    {formData.guests.length > 0 && (
      <section className="bg-white">
        <h2 className="text-2xl font-bold pb-4 text-gray-800 bg-white">
          People staying in Guest Room
        </h2>
        <div className="grid gap-8 bg-white w-full">
          {formData.guests.map((guest, index) => (
            <div
              key={index}
              className={cn(
                index == 0 ? "html2pdf__page-break" : "",
                "relative bg-white p-2 col-span-full",
              )}
              style={{ pageBreakInside: "avoid" }}
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-700 bg-white">
                Guest {index + 1}
              </h3>
              <div className="grid grid-cols-8 gap-3 bg-white w-full">
                <div className="bg-white space-y-2 col-span-4">
                  <p className="text-gray-800 bg-white">
                    <strong>Name:</strong> {guest.name}
                  </p>
                  <p className="text-gray-800 bg-white">
                    <strong>Phone:</strong> {guest.phone}
                  </p>
                  <p className="text-gray-800 bg-white">
                    <strong>Email:</strong> {guest.email}
                  </p>
                  <p className="text-gray-800 bg-white">
                    <strong>Date of Birth:</strong> {guest.dob}
                  </p>
                </div>
                <div className="bg-white space-y-2 col-span-3">
                  <p className="text-gray-800 bg-white">
                    <strong>Room No.:</strong> {guest?.roomCode}
                  </p>
                  <p className="text-gray-800 bg-white">
                    <strong>Bed No.:</strong> {guest?.bedCode}
                  </p>
                  <p className="text-gray-800 bg-white">
                    <strong>Check-in:</strong>{" "}
                    {formatDate(new Date(guest?.checkIn))}
                  </p>
                  <p className="text-gray-800 bg-white">
                    <strong>Check-out:</strong>{" "}
                    {formatDate(new Date(guest?.checkOut))}
                  </p>
                </div>
                <div className="col-span-1">
                  <Image
                    width={112}
                    height={144}
                    src={guest.photoUrl}
                    alt="Guest Photo"
                    className="w-28 h-36"
                  />
                </div>
                {/* <div className="flex gap-6">
                  <div className="bg-white space-y-3">
                    <h4 className="text-gray-700 font-semibold bg-white">
                      ID Proof
                    </h4>
                    <Image
                      width={240}
                      height={144}
                      src={guest.aadhaarUrl}
                      alt="ID Proof"
                      className="border border-gray-300 h-36 w-60 bg-white"
                    />
                  </div>
                  <div className="bg-white space-y-3">
                    <h4 className="text-gray-700 font-semibold bg-white">
                      Guest Photo
                    </h4>
                    <Image
                      width={112}
                      height={144}
                      src={guest.photoUrl}
                      alt="Guest Photo"
                      className="border border-gray-300 w-28 h-36"
                    />
                  </div>
                </div> */}
                {/* <Separator className="my-2 w-full" /> */}
              </div>
            </div>
          ))}
        </div>
      </section>
    )}
    <div className="bg-white h-7" />
    <Separator />
    <div className="bg-white h-2" />
    <section>
      <h2 className="text-2xl font-semibold text-gray-800 h-10 bg-white">
        Declaration
      </h2>
      <div className="bg-white h-4" />
      <ol className="list-decimal space-y-3 bg-white">
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
          By signing this form, I agree to follow the hostel&apos;s and Guest
          Rooms&apos; rules and consent to the usage of my personal information
          for administrative and marketing purposes.
        </li>
        <li>
          <strong>All staying guests must provide ID Proof.</strong>
        </li>
      </ol>
    </section>
    <div className="bg-white h-7" />
    <section className="flex justify-between items-center bg-white">
      {/* <div className="flex flex-col items-center bg-white gap-3">
        <p>Applicant/Guest Signature</p> */}
      {formData.signature && (
        <Image
          src={formData.signature}
          width={208}
          height={128}
          alt="Applicant Signature"
          className="border w-52 h-32"
        />
      )}
      {/* </div> */}
      {/* <div className="flex flex-col items-center bg-white gap-3">
        <p>Aadhaar Card</p> */}
      {formData.userIdImage && (
        <Image
          src={formData.userIdImage}
          width={208}
          height={128}
          className="border w-52 h-32"
          alt="Aadhaar Card"
        />
      )}
      {/* </div> */}
    </section>

    <div className="bg-white h-2" />
    <Separator />
    <div className="bg-white h-2" />

    <footer className="text-center bg-white">
      <p className="font-semibold uppercase text-lg bg-white">
        Check-out time: 11AM
      </p>
      <p className="mt-4 bg-white">
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
