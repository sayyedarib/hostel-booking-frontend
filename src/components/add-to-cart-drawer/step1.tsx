import { OccupiedDateRange, RoomCard } from "@/interface";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";

export default function AddToCartStep1({
  roomData,
  handleNext,
}: {
  roomData: RoomCard;
  handleNext: () => void;
}) {
  // if current date lies in the range of occupiedDateRanges, then the bed is occupied
  const getStatus = (bedId: number) => {
    const bedInfo = roomData.bedInfo.find((bed) => bed.id === bedId);
    return bedInfo?.occupiedDateRanges?.some((range) => {
      return (
        new Date() >= new Date(range.startDate) &&
        new Date() <= new Date(range.endDate)
      );
    })
      ? "occupied"
      : "available";
  };

  const getStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "reserved":
        return "bg-yellow-500";
      default:
        return "bg-neutral-100";
    }
  };

  return (
    <>
      <div className="mx-auto w-full md:w-1/2 lg:w-1/3">
        <DrawerHeader>
          <DrawerTitle>Select Your Bed</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {roomData.bedInfo.map((bed, index) => (
            <div
              className={cn(
                "h-24 rounded-lg flex justify-center items-center font-semibold",
                getStyle(getStatus(bed.id)),
              )}
            >
              {bed.bedCode}
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button>Next</Button>
        </DrawerFooter>
      </div>
    </>
  );
}
