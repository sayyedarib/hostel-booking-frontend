"use client";

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
    <div
      className={cn(
        className,
        "fixed md:absolute bottom-0 md:bottom-36 left-0 md:left-[15%] lg:left-[30%] right-0 lg:right-[30%] md:right-[15%] bg-white md:rounded-[40px] h-16 flex md:gap-4 items-center shadow-2xl border-gray-100 z-50",
      )}
    >
      <DatePickerWithRange className="h-full rounded-[40px] w-[55%] md:w-1/3" />
      <AddGuest className="md:w-1/3 h-full" />
      <Button
        onClick={() => router.push("/form")}
        className="bg-red-500 text-white hidden lg:block md:w-1/3 flex-grow h-full rounded-[40px]"
      >
        Book Now
      </Button>
      <Link href="/form" className="lg:hidden">
        <Search className="absolute right-2 md:right-10 bottom-5" />
      </Link>
    </div>
  );
}
