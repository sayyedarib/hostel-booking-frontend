"use server";

import AgreementCheckout from "@/components/agreement-checkout";

// import GuestRoomRegistrationForm from "@/components/registration-form";

export default async function AgreementCheckoutPage() {
  return (
    <div className="max-w-screen min-h-[80vh] flex items-center justify-center m-auto">
      {" "}
      <AgreementCheckout />
    </div>
  );
}