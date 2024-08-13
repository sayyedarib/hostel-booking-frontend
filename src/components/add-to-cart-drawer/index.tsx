import { useState } from "react";
import { addDays } from "date-fns";

import type { DateRange } from "react-day-picker";
import type { OccupiedDateRange, RoomCard } from "@/interface";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { DayPicker } from "react-day-picker";

export default function AddToCartDrawer({ roomData }: { roomData: RoomCard }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedBed, setSelectedBed] = useState<number | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleBedSelect = (bedId: number) => {
    setSelectedBed(bedId);
    handleNext();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full py-2 bg-primary text-white rounded-lg text-center font-semibold hover:bg-primary-dark transition-colors">
          Add Bed to Cart
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        {currentStep === 1 && (
          <AddToCartStep1
            roomData={roomData}
            handleBedSelect={handleBedSelect}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {currentStep === 2 && selectedBed && (
          <AddToCartStep2
            occupiedDateRanges={roomData?.bedInfo[0]?.occupiedDateRanges}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {currentStep === 3 && <AddToCartStep3 handleBack={handleBack} />}
      </DrawerContent>
    </Drawer>
  );
}

const AddToCartStep1 = ({
  roomData,
  handleBedSelect,
  handleNext,
  handleBack,
}: {
  roomData: RoomCard;
  handleBedSelect: (bedId: number) => void;
  handleNext: () => void;
  handleBack: () => void;
}) => {
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
              key={index}
              className={cn(
                "h-24 rounded-lg flex justify-center items-center font-semibold",
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

const checkOverlap = (
  selectedRange: DateRange,
  occupiedDateRanges: OccupiedDateRange[],
) => {
  console.log("checking overlap...");
  if (!selectedRange) return false;

  return occupiedDateRanges.some((range) => {
    const bookedStart = new Date(range.startDate);
    const bookedEnd = new Date(range.endDate);
    return (
      (selectedRange?.from ?? new Date()) <= bookedEnd &&
      (selectedRange?.to ?? new Date()) >= bookedStart
    );
  });
};

export const AddToCartStep2 = ({
  occupiedDateRanges,
  handleNext,
  handleBack,
}: {
  occupiedDateRanges: OccupiedDateRange[];
  handleNext: () => void;
  handleBack: () => void;
}) => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleSelect = (selectedRange: DateRange) => {
    if (checkOverlap(selectedRange, occupiedDateRanges)) {
      // Reset the selected date if there's an overlap
      setDate(undefined);
    } else {
      setDate(selectedRange);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mx-auto w-full md:w-1/2 lg:w-1/3">
        <DrawerHeader>
          <DrawerTitle>Select CheckIn Date</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col w-full items-center">
          <Calendar
            autoFocus
            mode="range"
            numberOfMonths={2}
            selected={date}
            onSelect={handleSelect}
            modifiers={{
              booked: occupiedDateRanges?.map((range) => ({
                from: new Date(range.startDate),
                to: new Date(range.endDate),
              })),
            }}
            modifiersClassNames={{
              booked: "line-through text-red-500",
            }}
            required
          />
          <Button onClick={handleNext} className="lg:w-2/3 w-full">
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export const AddToCartStep3 = ({ handleBack }: { handleBack: () => void }) => {
  return (
    <>
      <div className="mx-auto w-full md:w-1/2 lg:w-1/3">
        <DrawerHeader>
          <DrawerTitle>Guest Information</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        <div className="grid grid-cols-1 gap-2">
          <Input
            type="text"
            placeholder="Name"
            className="h-12 rounded-lg p-4 w-full"
          />
          <Input
            type="email"
            placeholder="Email"
            className="h-12 rounded-lg p-4 w-full"
          />
          <Input
            type="tel"
            placeholder="Phone"
            className="h-12 rounded-lg p-4 w-full"
          />
        </div>
        <DrawerFooter>
          <Button>Next</Button>
        </DrawerFooter>
      </div>
    </>
  );
};
