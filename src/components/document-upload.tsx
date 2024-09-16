import { useState, useRef } from "react";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";
import {
  updateUserSignatureByUserId,
  updateUserIdImage,
  updateGuardianIdImage,
  updateGuardianPhoto,
} from "@/db/queries";

interface DocumentUploadProps {
  title: string;
  imageUrl?: string;
  field: string;
  userId: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  imageUrl,
  field,
  userId,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));

      const fileName = `${field}_${userId}.${new Date().getTime()}`;

      try {
        const { data, error } = await supabase.storage
          .from(field)
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading image:", error);
        } else {
          console.log("Image uploaded successfully:", data);

          const { data: publicUrlData } = supabase.storage
            .from(field)
            .getPublicUrl(fileName);

          const imageUrl = publicUrlData.publicUrl;

          console.log("Updating user image URL:", { userId, field, imageUrl });
          console.log("User image URL:", {
            [field]: imageUrl,
          });

          switch (field) {
            case "user_id_image":
              updateUserIdImage(userId, imageUrl);
              break;
            case "guardian_id_image":
              updateGuardianIdImage(userId, imageUrl);
              break;
            case "guardian_photo":
              updateGuardianPhoto(userId, imageUrl);
              break;
            case "signature":
              updateUserSignatureByUserId(userId, imageUrl);
              break;
          }
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-center">{title}</h3>
      <div
        className="mt-2 flex items-center justify-center cursor-pointer md:w-72 md:h-60 lg:w-96 lg:h-64"
        onClick={handleDivClick}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={title}
            className="object-contain w-full h-full"
            width={500}
            height={500}
            layout="fixed"
          />
        ) : (
          <div className="flex w-full h-full items-center justify-center rounded-md border-2 border-dashed border-gray-300">
            <span className="text-gray-500">Click to upload</span>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default DocumentUpload;
