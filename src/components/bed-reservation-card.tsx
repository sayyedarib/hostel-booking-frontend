"use client";

import { cn } from "@/lib/utils";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useQueryParam } from "nextjs-query-param";
import { z } from "zod";

import type { Room } from "@/interface";

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

interface BedReservationCardProps {
  className?: string;
  roomData: Room;
}

export default function BedReservationCard({
  className,
  roomData,
}: BedReservationCardProps) {
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

  return (
    <>
      <Card className={cn("w-full shadow-xl", className)}>
        <CardContent className="flex md:flex-col md:items-stretch items-center gap-2 pb-0 w-full">
          <DatePickerWithRange
            currCheckIn={checkIn}
            currCheckOut={checkOut}
            handleCheckIn={setCheckIn}
            handleCheckOut={setCheckOut}
            className="h-full rounded-[40px] w-[55%] md:w-1/3"
          />
          <div className="hidden md:flex md:flex-col md:items-stretch items-center gap-2">
            <div className="flex justify-between items-center">
              <h3>Bed</h3>
              <div className="flex items-center">
                <span>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setBed(Math.max(Number(bed) - 1, 1).toString())
                    }
                  >
                    <MinusCircle />
                  </Button>
                </span>

                <span>{bed}</span>

                <span>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setBed(
                        Math.min(
                          Number(bed) + 1,
                          roomData.roomCapacity,
                        ).toString(),
                      )
                    }
                  >
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
