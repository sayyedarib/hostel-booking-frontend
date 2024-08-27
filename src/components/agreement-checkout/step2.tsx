import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Eraser, LoaderCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updateUserSignature } from "@/db/queries";
import { logger } from "@/lib/utils";

const checkboxItems = [
  {
    id: "item1",
    label:
      "I understand and accept the general conditions for booking of hostel accommodation & Guest Room.",
  },
  {
    id: "item2",
    label:
      "We kindly remind you that the hostel and all rooms are non-smoking; alcohol, drugs, and bad things are not tolerated.",
  },
  {
    id: "item3",
    label:
      "If smoking or any kind of bad thing use is noticed by the hostel management, they are allowed to charge a fine of up to Rs. 1500 and proceed with an early check out.",
  },
  {
    id: "item4",
    label:
      "By signing this form, you agree to follow the hostel’s and Guest Rooms rules and the purpose described above, plus consenting to the usage of your personal information for administrative and marketing purposes.",
  },
  {
    id: "item5",
    label:
      "By signing this form, I consent to the use of my personal information for the purpose described above.",
  },
];

export default function Step2({
  handleNext,
  handlePrev,
}: {
  handleNext: () => void;
  handlePrev: () => void;
}) {
  const supabase = createClient();

  const signatureRef = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [checkedItems, setCheckedItems] = useState(
    checkboxItems.reduce(
      (acc, item) => {
        acc[item.id] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const allChecked = Object.values(checkedItems).every(Boolean);

  const toggleCheckbox = (name: string, checked: boolean) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }

    setSignature("");
  };

  const base64ToBlob = (base64: string) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleSaveSignature = async () => {
    setIsLoading(true);
    if (signatureRef.current) {
      const signatureDataUrl = signatureRef.current.toDataURL();
      const signatureBlob = base64ToBlob(signatureDataUrl);

      const filename = `signatures/${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from("signature")
        .upload(filename, signatureBlob);

      if (error) {
        logger("error", "Error uploading signature:", error);
      } else {
        logger("info", "Signature uploaded successfully:", data);

        const { data: publicUrlData } = supabase.storage
          .from("signature")
          .getPublicUrl(filename);

        if (!publicUrlData) {
          logger("error", "Failed to get public URL for signature");
          return;
        }

        const { status } = await updateUserSignature({
          signature: publicUrlData.publicUrl,
        });

        if (status !== "success") {
          logger("error", "Failed to update user signature");
          // TODO: Add toast
          return;
        }

        setSignature(signatureDataUrl);
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    await handleSaveSignature();
    handleNext();
  };

  return (
    <div className="w-full p-3 md:p-8">
      <h2 className="text-lg font-semibold mt-4 mb-2 underline">Declaration</h2>
      <ol className="mb-4 space-y-2 text-xs md:text-md lg:text-lg">
        {checkboxItems.map(({ id, label }) => (
          <li key={id} className="grid grid-cols-6 md:grid-cols-12">
            <Checkbox
              id={id}
              checked={checkedItems[id]}
              onCheckedChange={(checked: boolean) =>
                toggleCheckbox(id, checked)
              }
              aria-label={label}
              className="col-span-1"
            />
            <Label
              htmlFor={id}
              className="col-span-5 md:col-span-11 -ml-4 md:-ml-7 lg:-ml-9"
            >
              {label}
            </Label>
          </li>
        ))}
      </ol>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Signature</h2>
        <div className="border border-gray-300 mb-2 h-32">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: "signature-canvas max-w-full h-32",
            }}
          />
        </div>
        <Eraser
          onClick={handleClearSignature}
          className="cursor-pointer text-red-500"
        />
      </div>
      <div className="flex justify-between">
        <Button onClick={handlePrev}>Previous</Button>
        <Button onClick={handleSubmit} disabled={!allChecked || isLoading}>
          {isLoading ? <LoaderCircle className="animate-spin" /> : "Next"}
        </Button>
      </div>
    </div>
  );
}
