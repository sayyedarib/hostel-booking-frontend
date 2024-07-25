"use client"

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AddGuest from "@/components/add-guest";
import DatePickerWithRange from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SearchBar({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  return (
    <>
      <div
        className={cn(
          className,
          "w-full lg:w-1/2 bg-white rounded-[40px] h-16 flex items-center justify-evenly md:justify-normal shadow-xl border-gray-100 border-[1px]"
        )}
      >
        <DatePickerWithRange className="h-full rounded-[40px] w-[55%] md:w-1/3" />
        <AddGuest className="md:w-1/3" />

        {/* for large screen only */}
        <Button
          onClick={() => router.push("/coming-soon")}
          variant="link"
          className=" bg-red-500 text-white hidden lg:block md:w-1/3 h-full rounded-[40px]"
        >
          Search
        </Button>

        {/* for small and medium screen */}
        <Link href="/coming-soon">
          <Search className="md:hidden" />
        </Link>
      </div>
    </>
  );
}
