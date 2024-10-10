import { useState, useEffect, useRef } from "react";
import { LoaderCircle, MoveLeft, Upload } from "lucide-react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createGuest, getGuests, getUserData } from "@/db/queries";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { logger } from "@/lib/utils";

export const AddToCartStep4 = ({
  handleBack,
  handleNext,
  handleAddToCart,
  loading = false,
}: {
  handleBack: () => void;
  handleNext: () => void;
  handleAddToCart: (guestId: number) => void;
  loading: boolean;
}) => {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [aadhaarUrl, setAadhaarUrl] = useState("");

  const [purpose, setPurpose] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [bookingForSomeoneElse, setBookingForSomeoneElse] = useState(false);
  const [selectedExistingGuest, setSelectedExistingGuest] = useState<
    string | null
  >(null);
  const [enrollemntNumber, setEnrollmentNumber] = useState<string | null>(null);
  const [institute, setInstitute] = useState<string | null>(null);

  const { toast } = useToast();

  const guestImageInputRef = useRef<HTMLInputElement>(null);
  const aadhaarImageInputRef = useRef<HTMLInputElement>(null);

  const { data: userData, isError: userDataFetchingError } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const { data, status } = await getUserData();

      if (status === "error") {
        toast({
          variant: "destructive",
          title: "Error fetching user data",
          description: "Please try again",
        });

        return null;
      }

      return data;
    },
  });

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setDob(userData.dob || "");
      setPurpose(userData.purpose || "");
      setPhotoUrl(userData.applicantPhoto || "");
      setAadhaarUrl(userData.userIdImage || "");
    }
  }, [userData]);

  const { data: existingGuests, isError: guestDataFetchingError } = useQuery({
    queryKey: ["existingGuests"],
    queryFn: async () => {
      const { data, status } = await getGuests();

      if (status === "error") {
        toast({
          variant: "destructive",
          title: "Error fetching guest data",
          description: "Please try again",
        });

        return null;
      }

      return data;
    },
  });

  useEffect(() => {
    if (selectedExistingGuest && existingGuests) {
      const guest = existingGuests.find(
        (g) => g.id.toString() === selectedExistingGuest,
      );
      if (guest) {
        setName(guest.name);
        setEmail(guest.email);
        setPhone(guest.phone);
        setDob(guest.dob);
        setPurpose(guest.purpose);
        setPhotoUrl(guest.photoUrl);
        setAadhaarUrl(guest.aadhaarUrl);
      }
    }
  }, [selectedExistingGuest, existingGuests]);

  const handleGuestImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.error("No file selected");
      return;
    }

    const file = e.target.files[0];
    setUploading(true);
    toast({
      title: "Uploading image",
      description: "Please wait...",
    });

    try {
      const { data, error } = await supabase.storage
        .from("guest_image")
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) {
        logger("error", "error in uploading image", { error });
        return;
      }

      if (data) {
        const { data: urlData } = supabase.storage
          .from("guest_image")
          .getPublicUrl(data.path);
        setPhotoUrl(urlData.publicUrl);
        toast({
          title: "Image uploaded successfully",
          description: "Your guest image has been uploaded.",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Error uploading file",
        description: "Please try again",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAadhaarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.error("No file selected");
      return;
    }

    const file = e.target.files[0];
    setUploading(true);
    toast({
      title: "Uploading ID proof",
      description: "Please wait...",
    });

    try {
      const { data, error } = await supabase.storage
        .from("guest_aadhaar")
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) {
        throw error;
      }

      if (data) {
        const { data: urlData } = supabase.storage
          .from("guest_aadhaar")
          .getPublicUrl(data.path);
        setAadhaarUrl(urlData.publicUrl);
        toast({
          title: "ID proof uploaded successfully",
          description: "Your ID proof has been uploaded.",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Error uploading file",
        description: "Please try again",
      });
    } finally {
      setUploading(false);
    }
  };

  const createGuestMutation = useMutation({
    mutationFn: createGuest,
    onSuccess: (data) => {
      if (data.status === "error") {
        toast({
          variant: "destructive",
          title: "Error creating guest",
          description: "Please try again",
        });

        return;
      }

      queryClient.invalidateQueries({ queryKey: ["existingGuests"] });
      handleAddToCart(data?.data!);
    },
    onError: (error) => {
      console.error("Error creating guest:", error);
      toast({
        variant: "destructive",
        title: "Error creating guest",
        description: "Please try again",
      });
    },
  });

  const handleSubmit = async () => {
    createGuestMutation.mutate({
      name,
      email,
      phone,
      dob: dob ?? "",
      purpose,
      photoUrl,
      aadhaarUrl,
    });
  };

  return (
    <>
      <div className="mx-auto w-full md:w-1/2 lg:w-1/3 p-3 bg-white shadow-lg rounded-lg">
        <DrawerHeader>
          <DrawerTitle className="flex items-center text-2xl font-semibold">
            <MoveLeft onClick={handleBack} className="mr-2 cursor-pointer" />
            <span>Guest Information</span>
          </DrawerTitle>
        </DrawerHeader>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bookingForSomeoneElse"
              checked={bookingForSomeoneElse}
              onCheckedChange={(checked) =>
                setBookingForSomeoneElse(checked as boolean)
              }
            />
            <label
              htmlFor="bookingForSomeoneElse"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Booking for someone else
            </label>
          </div>

          {bookingForSomeoneElse && (
            <div>
              <Label htmlFor="existingGuest">Select Existing Guest</Label>
              <Select
                onValueChange={setSelectedExistingGuest}
                value={selectedExistingGuest || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a guest" />
                </SelectTrigger>
                <SelectContent>
                  {existingGuests?.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id.toString()}>
                      {guest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              className="rounded-lg p-2 w-full border border-gray-300"
              value={name}
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
              className="rounded-lg p-2 w-full border border-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
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
                className="rounded-lg p-2 w-full border border-gray-300"
                value={phone}
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
                value={dob ? new Date(dob).toISOString().split("T")[0] : ""}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
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
              placeholder="e.g. Preparing for Competitive exam"
              className="rounded-lg p-2 w-full border border-gray-300"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label
                htmlFor="enrollment"
                className="block text-sm font-medium text-gray-700"
              >
                Enrollment/Registration Number (Optional)
              </Label>
              <Input
                id="enrollment"
                type="text"
                placeholder="e.g. GM9988"
                className="rounded-lg p-2 w-full border border-gray-300"
                value={enrollemntNumber ?? ""}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label
                htmlFor="institute"
                className="block text-sm font-medium text-gray-700"
              >
                Institute/College/Coaching Name (Optional)
              </Label>
              <Input
                id="institute"
                type="text"
                placeholder="e.g. Brix Academy"
                className="rounded-lg p-2 w-full border border-gray-300"
                value={institute ?? ""}
                onChange={(e) => setInstitute(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Label
                htmlFor="guestImage"
                className="block text-sm font-medium text-gray-700"
              >
                Photo
              </Label>
              <div
                className="mt-2 border-2 border-dashed border-gray-300 rounded-lg h-40 p-4 text-center flex flex-col items-center justify-center cursor-pointer"
                onClick={() => guestImageInputRef.current?.click()}
              >
                {photoUrl ? (
                  <Image
                    width={100}
                    height={300}
                    src={photoUrl}
                    alt="Guest"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      Upload passport size photo
                    </p>
                  </>
                )}
              </div>
              <Input
                id="guestImage"
                type="file"
                className="hidden"
                onChange={handleGuestImageUpload}
                disabled={uploading}
                required
                ref={guestImageInputRef}
              />
            </div>
            <div className="col-span-2">
              <Label
                htmlFor="aadhaarImage"
                className="block text-sm font-medium text-gray-700"
              >
                Valid ID proof
              </Label>
              <div
                className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => aadhaarImageInputRef.current?.click()}
              >
                {aadhaarUrl ? (
                  <Image
                    width={200}
                    height={300}
                    src={aadhaarUrl}
                    alt="Aadhaar"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      Upload ID proof
                    </p>
                  </>
                )}
              </div>
              <Input
                id="aadhaarImage"
                type="file"
                className="hidden"
                onChange={handleAadhaarUpload}
                disabled={uploading}
                required
                ref={aadhaarImageInputRef}
              />
            </div>
          </div>
        </div>
        <DrawerFooter className="mt-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-yellow-500 text-white rounded-lg"
            disabled={
              loading ||
              !name ||
              !email ||
              !phone ||
              !dob ||
              !aadhaarUrl ||
              !photoUrl ||
              createGuestMutation.isPending
            }
          >
            {loading || createGuestMutation.isPending ? (
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
