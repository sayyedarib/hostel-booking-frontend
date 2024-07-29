"use client";

import { useState, useContext } from "react";
import { BedDouble, MinusCircle, PlusCircle, UserRound } from "lucide-react";

import type { CurrentBooking } from "@/interface";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CurrentBookingContext } from "@/contexts/CurrentBookingContext";

export default function AddGuest({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { currentBooking, setCurrentBooking } = useContext(
    CurrentBookingContext,
  );

  const [isRoomModified, setIsRoomModified] = useState<number | boolean>(false);

  const handleIncrement = (key: keyof CurrentBooking) => {
    setCurrentBooking((prev: CurrentBooking) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }));
    if (key === "room") {
      setIsRoomModified(true);
    }
  };

  const handleDecrement = (key: keyof CurrentBooking) => {
    setCurrentBooking((prev: CurrentBooking) => {
      const updatedGuest = {
        ...prev,
        [key]: Math.max(0, prev[key] - 1),
      };

      if (key === "room") {
        setIsRoomModified(updatedGuest.room);
      }

      return updatedGuest;
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger className="p-0 h-full" asChild>
          <Button
            id="currentBooking"
            variant={"ghost"}
            className={cn(
              "flex w-full h-full rounded-[40px] text-lg px-4",
              !currentBooking && "text-muted-foreground",
            )}
          >
            {currentBooking?.room ? (
              <span className="flex items-center justify-center gap-4">
                <span className="flex gap-1">
                  <BedDouble /> {currentBooking.room}
                </span>
                <span className="hidden md:block">Room</span>
              </span>
            ) : currentBooking?.male || currentBooking?.female ? (
              <span className="flex items-center justify-center gap-2">
                <span className="flex gap-1 items-center text-2xl">
                  <UserRound />{" "}
                  {(currentBooking?.male ?? 0) + (currentBooking?.female ?? 0)}
                </span>
                <span className="hidden md:block">Head</span>
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
          className="w-[400px] px-5 py-3 h-44 flex flex-col justify-center"
          align="center"
        >
          <div className="flex justify-between border-b">
            <span>
              <h3>Male</h3>
              <span className="text-gray-400">Age 13 or above</span>
            </span>

            <div className="flex items-center">
              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleDecrement("male")}
                  disabled={isRoomModified as boolean}
                >
                  <MinusCircle />
                </Button>
              </span>

              <span>{currentBooking?.male}</span>

              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleIncrement("male")}
                  disabled={isRoomModified as boolean}
                >
                  <PlusCircle />
                </Button>
              </span>
            </div>
          </div>

          {/* female counts*/}
          <div className="flex justify-between border-b">
            <span>
              <h3>Female</h3>
              <span className="text-gray-400">Age 13 or above</span>
            </span>

            <div className="flex items-center">
              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleDecrement("female")}
                  disabled={isRoomModified as boolean}
                >
                  <MinusCircle />
                </Button>
              </span>

              <span>{currentBooking?.female}</span>

              <span>
                <Button
                  variant="ghost"
                  onClick={() => handleIncrement("female")}
                  disabled={isRoomModified as boolean}
                >
                  <PlusCircle />
                </Button>
              </span>
            </div>
          </div>

          {/* room counts */}
          <div className="flex justify-between pt-3">
            <span>
              <h3>Room</h3>
            </span>

            <div className="flex items-center">
              <Button variant="ghost" onClick={() => handleDecrement("room")}>
                <MinusCircle />
              </Button>
              <span>{currentBooking?.room}</span>
              <Button variant="ghost" onClick={() => handleIncrement("room")}>
                <PlusCircle />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
