import { useState, useEffect } from "react";
import { parseAsIsoDateTime, useQueryState } from "nuqs";
import { addDays } from "date-fns";
import { MoveLeft } from "lucide-react";

import type { DateRange } from "react-day-picker";

import { BedInRoomCard } from "@/interface";
import { Button } from "@/components/ui/button";
import { checkOverlap, getFirstAvailableRange } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { MonthSelector } from "@/components/ui/month-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AddToCartStep2 = ({
  bedData,
  handleNext,
  handleBack,
}: {
  bedData: BedInRoomCard;
  handleNext: () => void;
  handleBack: () => void;
}) => {
  const firstAvailableRange = getFirstAvailableRange(
    bedData?.occupiedDateRanges,
  );

  const [checkIn, setCheckIn] = useQueryState(
    "checkIn",
    parseAsIsoDateTime.withDefault(firstAvailableRange?.from || new Date()),
  );
  const [checkOut, setCheckOut] = useQueryState(
    "checkOut",
    parseAsIsoDateTime.withDefault(
      firstAvailableRange?.to || addDays(new Date(), 5),
    ),
  );

  const [date, setDate] = useState<DateRange | undefined>({
    from: checkIn,
    to: checkOut,
  });

  useEffect(() => {
    setCheckIn(firstAvailableRange?.from || new Date());
    setCheckOut(firstAvailableRange?.to || addDays(new Date(), 5));
  }, []);

  if (bedData?.occupiedDateRanges) {
    if (!firstAvailableRange) {
      return (
        <div className="flex flex-col items-center mx-auto w-full md:w-1/2 lg:w-1/3 p-6 bg-white shadow-lg rounded-lg">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-semibold">
              No Available Dates
            </DrawerTitle>
            <DrawerClose />
          </DrawerHeader>
          <Button
            onClick={handleBack}
            className="lg:w-2/3 w-full h-12 bg-blue-600 text-white rounded-lg"
          >
            Back
          </Button>
        </div>
      );
    }
  }

  const handleSelect = (selectedRange: DateRange) => {
    if (checkOverlap(selectedRange, bedData?.occupiedDateRanges)) {
      // Reset the selected date if there's an overlap
      setDate(undefined);
    } else {
      setDate(selectedRange);
      if (selectedRange.from) {
        setCheckIn(selectedRange.from);
      }
      if (selectedRange.to) {
        setCheckOut(selectedRange.to);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mx-auto w-full md:w-1/2 p-6 bg-white shadow-lg rounded-lg">
        <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center text-2xl font-semibold">
            <MoveLeft
              size={24}
              onClick={handleBack}
              className="cursor-pointer"
            />
            <span className="text-center">Select Check-In Date</span>
          </DrawerTitle>
          <Tabs defaultValue="days" className="w-full">
            <TabsList>
              <TabsTrigger value="days">Days</TabsTrigger>
              <TabsTrigger value="months">Months</TabsTrigger>
            </TabsList>
            <TabsContent value="days">
              {" "}
              <div className="flex flex-col w-full items-center mt-4">
                <Calendar
                  autoFocus
                  mode="range"
                  numberOfMonths={2}
                  selected={date}
                  onSelect={handleSelect}
                  modifiers={{
                    booked: bedData?.occupiedDateRanges?.map((range) => ({
                      from: new Date(range.startDate),
                      to: new Date(range.endDate),
                    })),
                  }}
                  modifiersClassNames={{
                    booked: "line-through text-red-500",
                  }}
                  required
                />
                <Button
                  onClick={handleNext}
                  className="lg:w-2/3 w-full h-12 bg-blue-600 text-white rounded-lg mt-4"
                >
                  Next
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="months">
              <MonthSelector />
            </TabsContent>
          </Tabs>
        </DrawerHeader>
      </div>
    </>
  );
};
