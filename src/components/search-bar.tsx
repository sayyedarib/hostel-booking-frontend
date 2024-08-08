"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryParam } from "nextjs-query-param";
import { z } from "zod";

import AddGuest from "@/components/add-guest";
import DatePickerWithRange from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SearchBar({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useQueryParam(
    "checkIn",
    (value) => value?.toString() ?? "",
  );
  const [checkOut, setCheckOut] = useQueryParam(
    "checkOut",
    (value) => value?.toString() ?? "",
  );
  const [bed, setBed] = useQueryParam(
    "bed",
    (value) => value?.toString() ?? "1",
  );
  const [girlsOnly, setGirlsOnly] = useQueryParam(
    "girlsOnly",
    (value) => value?.toString() ?? "false",
  );

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      checkIn: checkIn,
      checkOut: checkOut,
      bed: bed.toString(),
    });
    // router.push(`/rooms?${queryParams.toString()}`);
    router.push("/coming-soon");
  };

  return (
    <div
      className={cn(
        className,
        "fixed md:absolute bottom-0 md:bottom-36 left-0 md:left-[15%] lg:left-[30%] right-0 lg:right-[30%] md:right-[15%] bg-white md:rounded-[40px] h-16 flex md:gap-4 items-center shadow-2xl border-gray-100 z-50",
      )}
    >
      <DatePickerWithRange
        currCheckIn={checkIn}
        currCheckOut={checkOut}
        handleCheckIn={setCheckIn}
        handleCheckOut={setCheckOut}
        className="h-full rounded-[40px] w-[55%] md:w-1/3"
      />
      <AddGuest
        currBedCount={Math.max(Number(bed), 1)}
        handleBed={(bedCount: number) =>
          setBed(Math.max(bedCount, 1).toString())
        }
        girlsOnly={Boolean(girlsOnly)}
        handleGirlsOnly={(girlsOnly: boolean) =>
          setGirlsOnly(girlsOnly.toString())
        }
        className="md:w-1/3 h-full"
      />
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
