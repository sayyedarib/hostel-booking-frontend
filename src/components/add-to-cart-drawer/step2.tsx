import { useState, useEffect } from "react";
import {
  parseAsIsoDateTime,
  useQueryState,
  parseAsInteger,
  parseAsString,
} from "nuqs";
import { addDays, differenceInDays } from "date-fns";
import { IndianRupee, MoveLeft } from "lucide-react";

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
  formatDateWithoutYear,
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
import { useToast } from "@/components/ui/use-toast";

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
    30,
  );

  const { toast } = useToast();

  const [checkIn, setCheckIn] = useQueryState(
    "checkIn",
    parseAsIsoDateTime.withDefault(firstAvailableRange?.from || new Date()),
  );
  const [checkOut, setCheckOut] = useQueryState(
    "checkOut",
    parseAsIsoDateTime.withDefault(
      firstAvailableRange?.to || addDays(new Date(), 30),
    ),
  );
  const [numberOfMonths, setNumberOfMonths] = useState<string | undefined>();

  const [totalRent, setTotalRent] = useState(0);
  const [payableRent, setPayableRent] = useState(0);

  const [date, setDate] = useState<DateRange | undefined>();

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
            className="lg:w-2/3 w-full h-12 rounded-lg"
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
      toast({
        variant: "destructive",
        title: "Selected date range is not avaliable",
      });
      setDate(undefined);
      setCheckIn(firstAvailableRange?.from || new Date());
      setCheckOut(firstAvailableRange?.to || addDays(new Date(), 30));
    } else {
      setDate(selectedRange);
      if (selectedRange.from) {
        setCheckIn(selectedRange.from);
      }
      if (selectedRange.to) {
        setCheckOut(selectedRange.to);
      }

      const { totalRent: totalAmount, payableRent: payableAmount } =
        calculateRent(
          bedData?.monthlyRent,
          selectedRange.from || new Date(),
          selectedRange.to || new Date(),
        );

      setPayableRent(payableAmount);
      setTotalRent(totalAmount);
    }
  };

  const handleNumberOfMonthsChange = (value: string) => {
    setNumberOfMonths(value);
    const from = new Date(); // Use current date as check-in
    const to = addDays(from, Number(value) * 30);
    const overlap = checkOverlap({ from, to }, bedData?.occupiedDateRanges);

    if (overlap) {
      toast({
        variant: "destructive",
        title: "Selected date range is not avaliable",
      });
      return;
    }

    setCheckIn(from);
    setCheckOut(to);
    setDate({ from, to });

    const { totalRent: totalAmount, payableRent: payableAmount } =
      calculateRent(bedData?.monthlyRent, from, to);

    setPayableRent(payableAmount);
    setTotalRent(totalAmount);
  };

  return (
    <>
      <div className="flex flex-col items-center px-2 mx-auto w-full md:w-1/2 bg-white shadow-lg rounded-lg">
        <DrawerHeader>
          <DrawerTitle className="flex gap-2 items-center text-2xl font-semibold w-full justify-center">
            <MoveLeft
              size={24}
              onClick={handleBack}
              className="cursor-pointer"
            />
            <span className="text-center text-lg lg:text-xl">
              Select Check-In Date
            </span>
          </DrawerTitle>
        </DrawerHeader>
        <Tabs defaultValue="days" className="w-full">
          <TabsList>
            <TabsTrigger value="days">Days</TabsTrigger>
            <TabsTrigger value="months">Months</TabsTrigger>
          </TabsList>
          <TabsContent value="days">
            {" "}
            <div className="flex flex-col w-full items-center mt-4 text-sm md:text-md">
              <span className="flex items-center">
                Total days:{" "}
                {differenceInDays(
                  date?.to || new Date(),
                  date?.from || new Date(),
                )}{" "}
                | Total rent: ₹{totalRent}
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
                  today: "border-amber-500",
                  booked:
                    "!line-through !text-red-500 hover:bg-none hover:!cursor-not-allowed !cursor-not-allowed",
                  selected: "!bg-yellow-400 !rounded-none",
                }}
                required
              />
            </div>
          </TabsContent>
          <TabsContent
            value="months"
            className="space-y-2 flex flex-col text-sm md:text-md"
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="border p-2 rounded-lg min-w-32">
                {numberOfMonths
                  ? numberOfMonths + " Month"
                  : "Select number of months you want to stay"}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={numberOfMonths ?? undefined}
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
                today: "border-amber-500",
                booked:
                  "!line-through !text-red-500 hover:bg-none hover:!cursor-not-allowed !cursor-not-allowed",
                selected: "!bg-yellow-400 !rounded-none",
              }}
              required
            />
            <Separator className="my-8" />
            <span className="text-center">
              <b className="mr-1">NOTE:</b>
              Only you will have to pay for the first month in advance
            </span>
            <div className="flex justify-between w-full">
              <span>
                Total days:{" "}
                {date?.from && date?.to
                  ? differenceInDays(date.to, date.from)
                  : 0}
              </span>
              <span>Total rent: ₹{totalRent}</span>
            </div>
            <div className="flex justify-between w-full">
              <span>
                CheckIn:{" "}
                {date?.from ? formatDateWithoutYear(date?.from) : "N/A"}{" "}
              </span>
              <span>
                CheckOut: {date?.to ? formatDateWithoutYear(date?.to) : "N/A"}
              </span>
            </div>
          </TabsContent>
        </Tabs>
        <DrawerFooter className="w-full">
          <Button
            onClick={handleNext}
            className="w-full h-12 rounded-lg"
            disabled={!date}
          >
            Next
          </Button>
        </DrawerFooter>
      </div>
    </>
  );
};
