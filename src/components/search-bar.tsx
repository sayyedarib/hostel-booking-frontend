"use client";

import { Search } from "lucide-react";
import { useContext } from "react";
import { useRouter } from "next/navigation";

import AddGuest from "@/components/add-guest";
import DatePickerWithRange from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CurrentBookingContext } from "@/contexts/CurrentBookingContext";

export default function SearchBar({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const { currentBooking } = useContext(CurrentBookingContext);

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      checkIn: currentBooking.checkInDate.toISOString(),
      checkOut: currentBooking.checkOutDate.toISOString(),
      male: currentBooking.male.toString(),
      female: currentBooking.female.toString(),
      rooms: currentBooking.room.toString(),
    });
    router.push(`/rooms?${queryParams.toString()}`);
  };

  return (
    <div
      className={cn(
        className,
        "fixed md:absolute bottom-0 md:bottom-36 left-0 md:left-[15%] lg:left-[30%] right-0 lg:right-[30%] md:right-[15%] bg-white md:rounded-[40px] h-16 flex md:gap-4 items-center shadow-2xl border-gray-100 z-50",
      )}
    >
      <DatePickerWithRange className="h-full rounded-[40px] w-[55%] md:w-1/3" />
      <AddGuest className="md:w-1/3 h-full" />
      <Button
        onClick={handleSearch}
        className="bg-red-500 text-white hidden lg:block md:w-1/3 flex-grow h-full rounded-[40px]"
      >
        Search
      </Button>
      <Button
        onClick={handleSearch}
        className="lg:hidden absolute right-2 md:right-10 bottom-5"
      >
        <Search />
      </Button>
    </div>
  );
}
