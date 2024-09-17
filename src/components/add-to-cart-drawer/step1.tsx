import { Loader2 } from "lucide-react";

import type { BedInRoomCard, CartItemShort } from "@/interface";

import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export const AddToCartStep1 = ({
  cartData,
  bedData,
  handleBedSelect,
  handleNext,
  handleBack,
  isBedDataLoading,
}: {
  cartData: CartItemShort[];
  bedData: BedInRoomCard[];
  handleBedSelect: (bedId: number) => void;
  handleNext: () => void;
  handleBack: () => void;
  isBedDataLoading: boolean;
}) => {
  if (isBedDataLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

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
        return "bg-green-500 text-white";
      case "occupied":
        return "bg-red-500 text-white";
      case "cart":
        return "bg-yellow-500 text-white cursor-not-allowed";
      default:
        return "bg-neutral-100 hover:bg-green-200";
    }
  };

  return (
    <>
      <div className="mx-auto w-full md:w-1/2 lg:w-1/3 p-6 h-full bg-white md:shadow-lg rounded-lg">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-semibold">
            Select Your Bed
          </DrawerTitle>
        </DrawerHeader>
        <div className="mt-4">
          <div className="flex justify-around mb-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 mr-2"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 mr-2"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
              <span>In Cart</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-neutral-100 mr-2"></div>
              <span>Available</span>
            </div>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 text-sm md:text-md">
            {bedData?.map((bed, index) => (
              <div
                key={index}
                className={cn(
                  "h-24 rounded-lg flex flex-col justify-center items-start p-3 cursor-pointer transition-colors duration-200",
                  getStyle(getStatus(bed.id)),
                )}
                onClick={() => handleBedSelect(bed.id)}
              >
                <span>
                  {bed.bedCode} | {bed.bedType}
                </span>
                <span>
                  ₹{bed.dailyRent}/dy - ₹{bed.monthlyRent}/mn
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
