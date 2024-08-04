"use server";
import GuestRoomRegistrationForm from "@/components/registration-form";
import { currentUser } from "@clerk/nextjs/server";

export default async function Form() {
  const user = await currentUser();

  const name = `${user?.firstName} ${user?.lastName}`;
  const phone =
    user?.phoneNumbers?.length && user?.phoneNumbers?.length > 0
      ? user?.phoneNumbers[0].phoneNumber
      : "No phone number available";
  const imageUrl = user?.imageUrl;

  return (
    <div className="max-w-screen min-h-screen flex flex-col items-center justify-center my-12">
      {" "}
      <GuestRoomRegistrationForm
        name={name}
        phone={phone}
        imageUrl={imageUrl ?? ""}
      />
    </div>
  );
}
