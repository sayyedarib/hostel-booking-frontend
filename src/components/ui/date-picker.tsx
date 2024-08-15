"use client";

import { useContext, useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  currCheckIn: string;
  currCheckOut: string;
  handleCheckIn: (date: string) => void;
  handleCheckOut: (date: string) => void;
}

export default function DatePickerWithRange({
  className,
  currCheckIn,
  currCheckOut,
  handleCheckIn,
  handleCheckOut,
}: DatePickerWithRangeProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"ghost"}
            className={cn(
              "w-full h-full rounded-[40px] text-lg text-start",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 hidden md:block" />
            {date?.from ? (
              date.to ? (
                <>
                  <div className="flex gap-2 md:gap-6 lg:gap-14">
                    <div className="flex flex-col">
                      <span>Check in</span>
                      <span className="text-sm text-neutral-500">
                        {format(date.from, "LLL dd, y")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span>Check out</span>
                      <span className="text-sm text-neutral-500">
                        {format(date.to, "LLL dd, y")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(date) => {
              handleCheckIn(date?.from?.toISOString() ?? "");
              handleCheckOut(date?.to?.toISOString() ?? "");
              setDate(date);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface DatePickerProps {
  selected: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholderText: string;
}

export function DatePicker({
  selected,
  onChange,
  placeholderText,
}: DatePickerProps) {
  const [date, setDate] = useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar autoFocus mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  );
}
