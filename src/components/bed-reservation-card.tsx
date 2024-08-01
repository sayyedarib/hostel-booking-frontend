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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Room as RoomDataType } from "@/interface";

type Props = {
  className: React.HTMLAttributes<HTMLDivElement>;
  roomData: RoomDataType;
};

export default function BedReservationCard({ className, roomData }: Props) {
  const [guest, setGuest] = useState<number>(1);
  const { currentBooking, setCurrentBooking } = useContext(
    CurrentBookingContext
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
    <Card className={cn("w-full shadow-xl", className)}>
      <CardContent className="flex md:flex-col md:items-stretch items-center gap-2 pb-0 w-full">
        <DatePickerWithRange className="hover:bg-white rounded-none" />
        <div className="hidden md:flex md:flex-col md:items-stretch items-center gap-2">
          {/* male counts */}
          <div className="flex flex-col md:flex-row justify-between items-center">
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
          <div className="flex justify-between flex-col md:flex-row items-center">
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

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          {/* room counts */}
          <div className="flex justify-between flex-col md:flex-row items-center">
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
        </div>
        <div className="flex md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Details</Button>
            </PopoverTrigger>

            <PopoverContent>
              {/* male counts */}
              <div className="flex flex-col md:flex-row justify-between items-center">
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
              <div className="flex justify-between flex-col md:flex-row items-center">
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

              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>

              {/* room counts */}
              <div className="flex justify-between flex-col md:flex-row items-center">
                <span>
                  <h3>Room</h3>
                </span>

                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleDecrement("room")}
                  >
                    <MinusCircle size={16} />
                  </Button>
                  <span>{currentBooking?.room}</span>
                  <Button
                    variant="ghost"
                    onClick={() => handleIncrement("room")}
                  >
                    <PlusCircle size={16} />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <SelectBed roomData={roomData} />
      </CardContent>
    </Card>
  );
}
