"use client";

import { cn } from "@/lib/utils";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useQueryParam } from "nextjs-query-param";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import DatePickerWithRange from "@/components/ui/date-picker";
import { SelectBed } from "@/components/select-bed";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const CheckInSchema = z.string();
export const CheckOutSchema = z.string();
export const MaleSchema = z.string();
export const FemaleSchema = z.string();
export const RoomSchema = z.string();

export default function BedReservationCard({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
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
    (value) => value?.toString() ?? "",
  );
  const [girlsOnly, setGirlsOnly] = useQueryParam(
    "girlsOnly",
    (value) => value?.toString() ?? "false",
  );

  return (
    <>
      <Card className={cn("w-full shadow-xl", className)}>
        <CardContent className="flex md:flex-col md:items-stretch items-center gap-2">
          <DatePickerWithRange
            currCheckIn={checkIn}
            currCheckOut={checkOut}
            handleCheckIn={setCheckIn}
            handleCheckOut={setCheckOut}
            className="h-full rounded-[40px] w-[55%] md:w-1/3"
          />
          <div className="hidden md:flex md:flex-col md:items-stretch items-center gap-2">
            <div className="flex justify-between items-center">
              <span>
                <h3>Bed</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox onClick={() => setGirlsOnly("true")} id="girls" />
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
                    onClick={() => setBed((Number(bed) - 1).toString())}
                  >
                    <MinusCircle />
                  </Button>
                </span>

                <span>{bed}</span>

                <span>
                  <Button variant="ghost" onClick={() => setBed(bed + 1)}>
                    <PlusCircle />
                  </Button>
                </span>
              </div>
            </div>
          </div>
          <div className="flex md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Details</Button>
              </PopoverTrigger>
              <PopoverContent></PopoverContent>
            </Popover>
          </div>
          <SelectBed />
        </CardContent>
      </Card>
    </>
  );
}
