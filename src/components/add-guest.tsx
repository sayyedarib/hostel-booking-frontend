"use client";

import { BedDouble, MinusCircle, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "./ui/checkbox";

interface AddGuestProps {
  className?: string;
  currBedCount: number;
  handleBed: (bedCount: number) => void;
  girlsOnly: boolean;
  handleGirlsOnly: (girlsOnly: boolean) => void;
}

export default function AddGuest({
  className,
  currBedCount,
  handleBed,
  girlsOnly,
  handleGirlsOnly,
}: AddGuestProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger className="p-0 h-full" asChild>
          <Button
            id="currentBooking"
            variant={"ghost"}
            className={cn("flex w-full h-full rounded-[40px] text-lg px-4")}
          >
            {currBedCount ? (
              <span className="flex items-center justify-center gap-4">
                <span className="flex gap-1">
                  <BedDouble /> {currBedCount}
                </span>
                <span className="hidden md:block">
                  Bed{currBedCount > 1 ? "s" : ""}
                </span>
              </span>
            ) : (
              <>
                <BedDouble />
                <span>Add Beds</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] px-5 py-3 flex flex-col justify-center"
          align="center"
        >
          <div className="flex justify-between items-center">
            <span>
              <h3>Bed</h3>
              <div className="flex items-center space-x-2">
                <Checkbox onClick={() => handleGirlsOnly(true)} id="girls" />
                <label
                  htmlFor="girls"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Girls only
                </label>
              </div>
            </span>
            <div className="flex items-center">
              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleBed(Math.max(currBedCount - 1, 1))}
                >
                  <MinusCircle />
                </Button>
              </span>

              <span>{currBedCount}</span>

              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleBed(currBedCount + 1)}
                >
                  <PlusCircle />
                </Button>
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
