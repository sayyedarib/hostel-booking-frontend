import { Edit } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateBedDetails } from "@/db/queries";

const EditBedDialog = ({
  bed,
}: {
  bed: {
    id: number;
    bedCode: string;
    type: string;
    monthlyRent: number;
  } | null;
}) => {
  const [bedCode, setBedCode] = useState(bed?.bedCode || "");
  const [bedType, setBedType] = useState(bed?.type || "");
  const [monthlyRent, setMonthlyRent] = useState(bed?.monthlyRent || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleEditBed = async () => {
    setIsLoading(true);

    if (!bed) {
      console.error("Bed not found");
      setIsLoading(false);
      return;
    }

    const response = await updateBedDetails(
      bed.id,
      bedCode,
      bedType,
      monthlyRent,
    );
    setIsLoading(false);
    if (response.status === "success") {
      console.log("Bed updated successfully");
      setIsOpen(false);
    } else {
      console.error("Error updating bed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Bed Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bedCode" className="text-right">
              Bed Code
            </Label>
            <Input
              id="bedCode"
              value={bedCode}
              onChange={(e) => setBedCode(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bedType" className="text-right">
              Bed Type
            </Label>
            <Input
              id="bedType"
              value={bedType}
              onChange={(e) => setBedType(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monthlyRent" className="text-right">
              Monthly Rent
            </Label>
            <Input
              id="monthlyRent"
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleEditBed} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Bed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBedDialog;
