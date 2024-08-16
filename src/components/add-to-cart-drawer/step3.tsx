import { parseAsInteger, useQueryState } from "nuqs";
import { MoveLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createGuest } from "@/db/queries";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { logger } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const AddToCartStep3 = ({
  handleBack,
  handleAddToCart,
}: {
  handleBack: () => void;
  handleAddToCart: () => void;
}) => {
  const supabase = createClient();

  const [name, setName] = useQueryState("name");
  const [email, setEmail] = useQueryState("email");
  const [phone, setPhone] = useQueryState("phone");
  const [dob, setDob] = useQueryState("dob");
  const [photoUrl, setPhotoUrl] = useQueryState("photoUrl");
  const [aadhaarUrl, setAadhaarUrl] = useQueryState("aadhaarUrl");
  const [guestId, setGuestId] = useQueryState("guestId", parseAsInteger);

  const handleGuestImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName = `${name}_${Date.now()}`;

    const { data, error } = await supabase.storage
      .from("guest_image")
      .upload(fileName, file);

    const { data: publicUrlData } = supabase.storage
      .from("guest_image")
      .getPublicUrl(fileName);

    if (error) {
      logger("error", "Error in uploading guest image", { error });
      return;
    } else {
      setPhotoUrl(publicUrlData.publicUrl);
    }
  };

  const handleAadhaarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName = `${name}_${Date.now()}`;
    logger("info", "Uploading aadhaar image", { fileName });
    const { data, error } = await supabase.storage
      .from("guest_aadhaar")
      .upload(fileName, file);

    const { data: publicUrlData } = supabase.storage
      .from("guest_aadhaar")
      .getPublicUrl(fileName);

    if (error) {
      logger("error", "Error in uploading aadhaar image", { error });
      return;
    } else {
      setAadhaarUrl(publicUrlData.publicUrl);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !phone || !dob || !aadhaarUrl || !photoUrl) {
      console.log(
        "All fields are required",
        name,
        email,
        phone,
        dob,
        aadhaarUrl,
        photoUrl,
      );
      logger("error", "All fields are required");
      // TODO: add toast
      return;
    }
    // Handle form submission
    const { status, data: id } = await createGuest({
      name,
      phone,
      email,
      dob,
      photoUrl,
      aadhaarUrl,
    });

    if (status === "error" || !id) {
      logger("error", "Error in creating guest", { name, phone, email });
      return;
    }

    logger("info", "Guest created successfully", { id });
    setGuestId(Number(id));
    handleAddToCart();
  };

  return (
    <>
      <div className="mx-auto w-full md:w-1/2 lg:w-1/3 p-6 bg-white shadow-lg rounded-lg">
        <DrawerHeader>
          <DrawerTitle className="flex items-center text-2xl font-semibold">
            <MoveLeft onClick={handleBack} className="mr-2 cursor-pointer" />
            <span>Guest Information</span>
          </DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="h-12 rounded-lg p-4 w-full border border-gray-300"
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              className="h-12 rounded-lg p-4 w-full border border-gray-300"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 864567890"
              className="h-12 rounded-lg p-4 w-full border border-gray-300"
              value={phone ?? ""}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={dob ?? ""}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor="guestImage"
              className="block text-sm font-medium text-gray-700"
            >
              Guest Image
            </Label>
            <Input
              id="guestImage"
              type="file"
              className="h-12 rounded-lg p-4 w-full border border-gray-300"
              onChange={handleGuestImageUpload}
              required
            />
          </div>
          <div>
            <Label
              htmlFor="aadhaarImage"
              className="block text-sm font-medium text-gray-700"
            >
              Aadhaar Image
            </Label>
            <Input
              id="aadhaarImage"
              type="file"
              className="h-12 rounded-lg p-4 w-full border border-gray-300"
              onChange={handleAadhaarUpload}
              required
            />
          </div>
        </div>
        <DrawerFooter className="mt-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full h-12 bg-blue-600 text-white rounded-lg"
          >
            Add to Cart
          </Button>
        </DrawerFooter>
      </div>
    </>
  );
};
