import { useState, useEffect } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { LoaderCircle, MoveLeft } from "lucide-react";

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
import { useToast } from "@/components/ui/use-toast";

export const AddToCartStep3 = ({
  handleBack,
  handleAddToCart,
  loading = false,
}: {
  handleBack: () => void;
  handleAddToCart: () => void;
  loading: boolean;
}) => {
  const supabase = createClient();

  const [name, setName] = useQueryState("name");
  const [email, setEmail] = useQueryState("email");
  const [phone, setPhone] = useQueryState("phone");
  const [dob, setDob] = useQueryState("dob");
  const [photoUrl, setPhotoUrl] = useQueryState("photoUrl");
  const [aadhaarUrl, setAadhaarUrl] = useQueryState("aadhaarUrl");
  const [guestId, setGuestId] = useQueryState("guestId", parseAsInteger);

  const [purpose, setPurpose] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [creatingGuest, setCreatingGuest] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (guestId !== null) {
      handleAddToCart();
    }
  }, [guestId]);

  const handleGuestImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    const fileName = `${name}_${Date.now()}`;
    toast({
      description: (
        <div className="flex items-center">
          <LoaderCircle className="animate-spin mr-2" /> Uploading guest image
        </div>
      ),
    });
    logger("info", "Uploading guest image", { fileName });
    const { data, error } = await supabase.storage
      .from("guest_image")
      .upload(fileName, file);

    const { data: publicUrlData } = supabase.storage
      .from("guest_image")
      .getPublicUrl(fileName);

    setUploading(false);
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
    toast({
      description: (
        <div className="flex items-center">
          <LoaderCircle className="animate-spin mr-2" /> Uploading aadhaar image
        </div>
      ),
    });
    logger("info", "Uploading aadhaar image", { fileName });

    setUploading(true);
    const { data, error } = await supabase.storage
      .from("guest_aadhaar")
      .upload(fileName, file);

    const { data: publicUrlData } = supabase.storage
      .from("guest_aadhaar")
      .getPublicUrl(fileName);

    setUploading(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error in uploading aadhaar image",
      });
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
      toast({
        variant: "destructive",
        title: "All fields are required",
      });
      return;
    }

    toast({
      description: (
        <div className="flex items-center">
          <LoaderCircle className="animate-spin mr-2" /> Creating guest
        </div>
      ),
    });
    logger("info", "Creating guest", { name, phone, email });
    setCreatingGuest(true);
    const { status, data: id } = await createGuest({
      name,
      phone,
      email,
      dob,
      purpose,
      photoUrl,
      aadhaarUrl,
    });
    setCreatingGuest(false);
    
    setGuestId(Number(id));
    
    if (status === "error" || !id) {
      toast({
        variant: "destructive",
        title: "Error in creating guest",
      });
      logger("error", "Error in creating guest", { name, phone, email });
      return;
    }

    toast({
      title: "Guest created successfully",
    });
    logger("info", "Guest created successfully", { id });

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
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-700"
            >
              Purpose
            </Label>
            <Input
              id="purpose"
              type="text"
              placeholder="Meeting"
              className="h-12 rounded-lg p-4 w-full border border-gray-300"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
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
              disabled={uploading}
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
              disabled={uploading}
              required
            />
          </div>
        </div>
        <DrawerFooter className="mt-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full h-12 bg-blue-600 text-white rounded-lg"
            disabled={
              loading ||
              !name ||
              !email ||
              !phone ||
              !dob ||
              !aadhaarUrl ||
              !photoUrl
            }
          >
            {loading || creatingGuest ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Add to Cart"
            )}
          </Button>
        </DrawerFooter>
      </div>
    </>
  );
};
