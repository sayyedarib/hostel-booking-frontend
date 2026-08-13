import { Loader2 } from "lucide-react";

import type { BedInRoomCard, CartItemShort } from "@/interface";

import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { BOOKING_LEAD_DAYS } from "@/constant";

export const AddToCartStep1 = ({
  cartData,
  bedData,
  selectedBedId,
  handleBedSelect,
  handleNext,
  handleBack,
  isBedDataLoading,
}: {
  cartData: CartItemShort[];
  bedData: BedInRoomCard[];
  selectedBedId: number | null;
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

  /**
   * Resolves the single state a bed is in. Order matters: a bed already in the
   * cart is shown as such even if it is also the current selection.
   */
  const getStatus = (bed: BedInRoomCard) => {
    if (cartData.some((item) => item.bedId === bed.id)) return "cart";

    // The admin flag takes precedence over bookings — a bed taken out of
    // service is not bookable regardless of its calendar.
    if (!bed.available) return "occupied";

    const today = new Date();
    const leadWindowEnd = new Date();
    leadWindowEnd.setDate(today.getDate() + BOOKING_LEAD_DAYS);

    const isOccupied = bed.occupiedDateRanges?.some((range) => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      return start <= leadWindowEnd && end >= today;
    });

    if (isOccupied) return "occupied";
    return bed.id === selectedBedId ? "selected" : "available";
  };

  const getStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-500 text-white";
      case "occupied":
        return "bg-red-500 text-white cursor-not-allowed";
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
          <div className="md:text-md grid grid-cols-2 gap-4 text-sm">
            {bedData?.map((bed) => {
              const status = getStatus(bed);
              const isSelectable =
                status === "available" || status === "selected";

              return (
                <button
                  key={bed.id}
                  type="button"
                  disabled={!isSelectable}
                  aria-pressed={status === "selected"}
                  onClick={() => handleBedSelect(bed.id)}
                  className={cn(
                    "flex h-24 flex-col items-start justify-center rounded-lg p-3 text-left transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                    getStyle(status),
                  )}
                >
                  <span>
                    {bed.bedCode} | {bed.bedType}
                  </span>
                  <span>
                    ₹{bed.dailyRent}/dy - ₹{bed.monthlyRent}/mn
                  </span>
                  <span className="sr-only">
                    {status === "cart"
                      ? "Already in your cart"
                      : status === "occupied"
                        ? "Not available"
                        : status === "selected"
                          ? "Selected"
                          : "Available to book"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
