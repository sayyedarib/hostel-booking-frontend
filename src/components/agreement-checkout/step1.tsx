import { useState, ChangeEvent } from "react";
import { LoaderCircle } from "lucide-react";

import type { UserSubProfile } from "@/interface";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { updateUserSubProfile, createAddress } from "@/db/queries";
import { logger } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function Step1({ handleNext }: { handleNext: () => void }) {
  const supabase = createClient();

  const { toast } = useToast();

  const [formData, setFormData] = useState<UserSubProfile>({
    applicantPhoto: "",
    dob: "",
    userIdImage: "",
    guardianIdImage: "",
    guardianName: "",
    guardianPhone: "",
    guardianPhoto: "",
    address: "",
    pin: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

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
          case "applicantPhoto":
            bucketName = "user_photo";
            break;
          case "userIdImage":
            bucketName = "user_id_image";
            break;
          case "guardianPhoto":
            bucketName = "guardian_photo";
            break;
          case "guardianIdImage":
            bucketName = "guardian_id_image";
            break;
          default:
            logger("error", "Invalid field for image upload");
            return;
        }

        toast({
          description: (
            <div className="flex items-center">
              <LoaderCircle className="animate-spin mr-2" /> Uploading {field}
            </div>
          ),
        });
        logger("info", `Uploading ${field}`);
        setImageUploading(true);
        // Upload file to the appropriate Supabase bucket
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);
        setImageUploading(false);

        if (error) {
          toast({
            variant: "destructive",
            title: `Error uploading image: ${error}`,
          });
          logger("error", "Error uploading image:", error);
          return;
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
          toast({
            variant: "destructive",
            title: "Failed to get public URL of uploaded image",
          });
          logger("error", "Failed to get public URL of uploaded image");
          return;
        }

        // Optionally, you can show a success message to the user
        logger("info", `${field} uploaded successfully`);
      } catch (error) {
        setImageUploading(false);
        logger("error", "Error uploading image:", error as Error);
        toast({
          variant: "destructive",
          title: "Something went wrong",
        });
        return;
      }
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data: addressId } = await createAddress({
        address: formData.address,
        pin: formData.pin,
        city: formData.city,
        state: formData.state,
      });

      if (!addressId) {
        toast({
          variant: "destructive",
          title: "Failed to create address",
        });
        logger("error", "Failed to create address");
        return;
      }

      const { status } = await updateUserSubProfile({
        imageUrl: formData.applicantPhoto,
        dob: formData.dob,
        idUrl: formData.userIdImage,
        guardianIdUrl: formData.guardianIdImage,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianPhoto: formData.guardianPhoto,
        addressId: addressId,
        onboarded: true,
      });

      if (status !== "success") {
        toast({
          variant: "destructive",
          title: "Failed to update user sub-profile",
        });
        setLoading(false);
        logger("error", "Failed to update user sub-profile");
        return;
      }

      setLoading(false);

      handleNext();
    } catch (error) {
      setLoading(false);
      logger("error", "Error updating user sub-profile:", error as Error);

      toast({
        variant: "destructive",
        title: "Error updating user sub-profile:",
      });
      return;
    }
  };

  return (
    <div className="p-8 md:max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">
        User Profile
        <p className="text-gray-500 text-xs font-normal">
          (You should complete your profile before proceeding further)
        </p>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Take parent image and applicant image as input here */}
        <div className="md:flex items-center">
          <Label htmlFor="applicantPhoto" className="w-52">
            User Photo:
          </Label>
          <Input
            type="file"
            id="applicantPhoto"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "applicantPhoto")}
            disabled={imageUploading}
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="guardianPhoto" className="w-52">
            Guardian Photo:
          </Label>
          <Input
            type="file"
            id="guardianPhoto"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "guardianPhoto")}
            disabled={imageUploading}
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="userIdImage" className="w-52">
            User Valid ID:
          </Label>
          <Input
            type="file"
            id="userIdImage"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "userIdImage")}
            disabled={imageUploading}
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="guardianIdImage" className="w-52">
            Guardian Valid ID:
          </Label>
          <Input
            type="file"
            id="guardianIdImage"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "guardianIdImage")}
            disabled={imageUploading}
          />
        </div>

        <Separator className="md:col-span-2" />
        <div className="md:flex items-center">
          <Label htmlFor="dob" className="w-52">
            User&apos;s Date of Birth:
          </Label>
          <Input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            placeholder="Date of Birth"
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="guardianName" className="w-52">
            Guardian&apos;s Name:
          </Label>
          <Input
            id="guardianName"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleInputChange}
            placeholder="Guardian's Name"
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="guardianPhone" className="w-52">
            Guardian&apos;s Phone:
          </Label>
          <Input
            id="guardianPhone"
            name="guardianPhone"
            value={formData.guardianPhone}
            onChange={handleInputChange}
            placeholder="Guardian's Phone"
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="address" className="w-52">
            Permanent Address:
          </Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Permanent Address"
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="pin" className="w-52">
            Pin Code:
          </Label>
          <Input
            id="pin"
            name="pin"
            value={formData.pin}
            onChange={handleInputChange}
            placeholder="Pin Code"
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="city" className="w-52">
            City:
          </Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City"
          />
        </div>
        <div className="md:flex items-center">
          <Label htmlFor="state" className="w-52">
            State:
          </Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="State"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={
          !formData.applicantPhoto ||
          !formData.guardianPhoto ||
          !formData.userIdImage ||
          !formData.guardianIdImage ||
          !formData.dob ||
          !formData.guardianName ||
          !formData.guardianPhone ||
          !formData.address ||
          !formData.pin ||
          !formData.city ||
          !formData.state ||
          loading ||
          imageUploading
        }
      >
        {loading ? <LoaderCircle className="animate-spin" /> : "Next"}
      </Button>
    </div>
  );
}
