import type { BedInRoomCard, CartItem } from "@/interface";

import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn, getFirstAvailableRange } from "@/lib/utils";
import { getOccupancyOfBed } from "@/db/queries";

export const AddToCartStep1 = ({
  cartData,
  bedData,
  handleBedSelect,
  handleNext,
  handleBack,
}: {
  cartData: CartItem[];
  bedData: BedInRoomCard[];
  handleBedSelect: (bedId: number) => void;
  handleNext: () => void;
  handleBack: () => void;
}) => {
  const getStatus = (bedId: number) => {
    const bedInfo = bedData.find((bed) => bed.id === bedId);

    const inCart = cartData.find((item) => item.bedId === bedId);

    if (inCart) {
      return "cart";
    }

    const today = new Date();
    const fifteenDaysFromToday = new Date();
    fifteenDaysFromToday.setDate(today.getDate() + 15);

    const isOccupied = bedInfo?.occupiedDateRanges?.some((range) => {
      const rangeStartDate = new Date(range.startDate);
      const rangeEndDate = new Date(range.endDate);
      return rangeStartDate <= fifteenDaysFromToday && rangeEndDate >= today;
    });

    return isOccupied ? "occupied" : "available";
  };

  const getStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "cart":
        return "bg-yellow-500";
      default:
        return "bg-neutral-100 hover:bg-green-200";
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
          {bedData.map((bed, index) => (
            <div
              key={index}
              className={cn(
                "h-24 rounded-lg flex justify-center items-center font-semibold cursor-pointer",
                getStyle(getStatus(bed.id)),
              )}
              onClick={() => handleBedSelect(bed.id)}
            >
              {bed.bedCode}
            </div>
          ))}
        </div>
        <DrawerFooter>
          <Button onClick={handleNext}>Next</Button>
        </DrawerFooter>
      </div>
    </>
  );
};
