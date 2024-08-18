import { useState, useEffect } from "react";
import {
  parseAsIsoDateTime,
  useQueryState,
  parseAsInteger,
  parseAsString,
} from "nuqs";
import { addDays, differenceInDays } from "date-fns";
import { MoveLeft } from "lucide-react";
import { toast } from "sonner";

import type { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { BedInRoomCard } from "@/interface";
import { Button } from "@/components/ui/button";
import {
  calculateRent,
  checkOverlap,
  formatDate,
  getFirstAvailableRange,
} from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "../ui/label";

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
    bedData?.occupiedDateRanges
  );
  console.log("bedData: ", bedData);
  const [checkIn, setCheckIn] = useQueryState(
    "checkIn",
    parseAsIsoDateTime.withDefault(firstAvailableRange?.from || new Date())
  );
  const [checkOut, setCheckOut] = useQueryState(
    "checkOut",
    parseAsIsoDateTime.withDefault(
      firstAvailableRange?.to || addDays(new Date(), 30)
    )
  );
  const [numberOfMonths, setNumberOfMonths] = useQueryState(
    "numberOfMonths",
    parseAsString.withDefault("1")
  );

  const [amount, setAmount] = useQueryState("amount", parseAsInteger);

  const [date, setDate] = useState<DateRange | undefined>({
    from: checkIn,
    to: checkOut,
  });

  useEffect(() => {
    setCheckIn(firstAvailableRange?.from || new Date());
    setCheckOut(firstAvailableRange?.to || addDays(new Date(), 30));
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

  const handleNumberOfMonthsChange = (value: string) => {
    setNumberOfMonths(value);
    const from = new Date(checkIn);
    const to = addDays(new Date(checkIn), Number(value) * 30);
    const overlap = checkOverlap({ from, to }, bedData?.occupiedDateRanges);

    if (overlap) {
      toast.info("Date range is not avaliable");
      return;
    }
    setCheckOut(to);
    setAmount(bedData?.monthlyRent * Number(numberOfMonths));
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
          <Tabs defaultValue="months" className="w-full">
            <TabsList>
              <TabsTrigger value="days">Days</TabsTrigger>
              <TabsTrigger value="months">Months</TabsTrigger>
            </TabsList>
            <TabsContent value="days">
              {" "}
              <div className="flex flex-col w-full items-center mt-4">
                <span>
                  Total days:{" "}
                  {differenceInDays(
                    date?.to || new Date(),
                    date?.from || new Date()
                  )}{" "}
                </span>
                <span>
                  Total rent:{" "}
                  {calculateRent(
                    bedData?.dailyRent,
                    bedData?.monthlyRent,
                    checkIn,
                    checkOut
                  )}
                </span>
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
              </div>
            </TabsContent>
            <TabsContent value="months" className="space-y-2 flex flex-col">
              <span>
                <b>NOTE:</b>
                Only you will have to pay for the first month in advance
              </span>
              <div className="space-x-11">
                <span>Total days: {Number(numberOfMonths) * 30}</span>
                <span>
                  Total rent: {bedData?.monthlyRent * Number(numberOfMonths)}
                </span>
              </div>
              <div className="space-x-11">
                <span>CheckIn: {formatDate(checkIn)} </span>
                <span>CheckOut: {formatDate(checkOut)}</span>
              </div>
              <Separator className="my-8" />
              <DropdownMenu>
                <span className="font-extrabold textlg text-center">
                  Select number of months
                </span>
                <DropdownMenuTrigger className="border p-2 rounded-lg min-w-32">
                  {numberOfMonths
                    ? numberOfMonths + " Month"
                    : "Select number of month"}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={numberOfMonths}
                    onValueChange={handleNumberOfMonthsChange}
                  >
                    <DropdownMenuRadioItem value="1">
                      1 Month
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="2">
                      2 Months
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="3">
                      3 Months
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="4">
                      4 Months
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="5">
                      5 Months
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TabsContent>
          </Tabs>
          <DrawerFooter>
            <Button onClick={handleNext} className="w-full h-12 rounded-lg">
              Next
            </Button>
          </DrawerFooter>
        </DrawerHeader>
      </div>
    </>
  );
};
