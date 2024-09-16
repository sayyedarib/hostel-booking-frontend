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
import { addBedToRoom } from "@/db/queries";

const AddBedDialog = ({ roomId }: { roomId: number }) => {
  const [bedCode, setBedCode] = useState("");
  const [bedType, setBedType] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [dailyRent, setDailyRent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddBed = async () => {
    setIsLoading(true);
    const response = await addBedToRoom(
      roomId,
      bedCode,
      bedType,
      monthlyRent,
      dailyRent,
    );
    setIsLoading(false);
    if (response.status === "success") {
      console.log("Bed added successfully");
      setIsOpen(false);
    } else {
      console.error("Error adding bed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button>Add Bed</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Bed</DialogTitle>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dailyRent" className="text-right">
              Daily Rent
            </Label>
            <Input
              id="dailyRent"
              type="number"
              value={dailyRent}
              onChange={(e) => setDailyRent(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAddBed} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Bed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBedDialog;
