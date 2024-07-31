"use client";

import { useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { MinusCircle, PlusCircle } from "lucide-react";

import type { CurrentBooking } from "@/interface";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrentBookingContext } from "@/contexts/CurrentBookingContext";
import DatePickerWithRange from "@/components/ui/date-picker";
import { SelectBed } from "@/components/select-bed";
import { Separator } from "./ui/separator";

export default function BedReservationCard({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { currentBooking, setCurrentBooking } = useContext(
    CurrentBookingContext,
  );

  const [isRoomModified, setIsRoomModified] = useState<number | boolean>(false);

  const handleIncrement = (key: keyof CurrentBooking) => {
    setCurrentBooking((prev: CurrentBooking) => {
      if (typeof prev[key] === "number") {
        return {
          ...prev,
          [key]: (prev[key] as number) + 1,
        };
      }
      return prev;
    });
    if (key === "room") {
      setIsRoomModified(true);
    }
  };

  const handleDecrement = (key: keyof CurrentBooking) => {
    setCurrentBooking((prev: CurrentBooking) => {
      if (typeof prev[key] === "number") {
        return {
          ...prev,
          [key]: Math.max(0, (prev[key] as number) - 1),
        };
      }
      return prev;
    });

    if (key === "room") {
      setCurrentBooking((prev: CurrentBooking) => {
        if (typeof prev.room === "number") {
          setIsRoomModified(prev.room > 0);
        }
        return prev;
      });
    }
  };

  return (
    <>
      <Card className={cn("w-full shadow-xl", className)}>
        <CardContent>
          <DatePickerWithRange className="hover:bg-white rounded-none" />
          {/* male counts */}
          <div className="flex justify-between">
            <h3>Male</h3>

            <div className="flex items-center">
              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleDecrement("male")}
                  disabled={isRoomModified as boolean}
                >
                  <MinusCircle size={16} />
                </Button>
              </span>

              <span>{currentBooking?.male}</span>

              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleIncrement("male")}
                  disabled={isRoomModified as boolean}
                >
                  <PlusCircle size={16} />
                </Button>
              </span>
            </div>
          </div>

          {/* female counts*/}
          <div className="flex justify-between">
            <h3>Female</h3>

            <div className="flex items-center">
              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleDecrement("female")}
                  disabled={isRoomModified as boolean}
                >
                  <MinusCircle size={16} />
                </Button>
              </span>

              <span>{currentBooking?.female}</span>

              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleIncrement("female")}
                  disabled={isRoomModified as boolean}
                >
                  <PlusCircle size={16} />
                </Button>
              </span>
            </div>
          </div>

          {/* TODO: fix UI @sayyid */}
          <div className="flex w-fit text-neutral-500">
            <Separator /> OR <Separator />
          </div>

          {/* room counts */}
          <div className="flex justify-between">
            <span>
              <h3>Room</h3>
            </span>

            <div className="flex items-center">
              <Button variant="ghost" onClick={() => handleDecrement("room")}>
                <MinusCircle size={16} />
              </Button>
              <span>{currentBooking?.room}</span>
              <Button variant="ghost" onClick={() => handleIncrement("room")}>
                <PlusCircle size={16} />
              </Button>
            </div>
          </div>
          <SelectBed />
        </CardContent>
      </Card>
    </>
  );
}
