"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn, calculateBedPrice } from "@/lib/utils";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useQueryParam } from "nextjs-query-param";
import { differenceInDays } from "date-fns";

import type { Room, BedInfo } from "@/interface";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DatePickerWithRange from "@/components/ui/date-picker";
import { Separator } from "./ui/separator";

interface BedReservationCardProps {
  className?: string;
  roomData: Room;
}

export default function BedReservationCard({
  className,
  roomData,
}: BedReservationCardProps) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useQueryParam(
    "checkIn",
    (value) => value?.toString() ?? "",
  );
  const [checkOut, setCheckOut] = useQueryParam(
    "checkOut",
    (value) => value?.toString() ?? "",
  );
  const [bedCount, setBedCount] = useQueryParam(
    "bedCount",
    (value) => value?.toString() ?? "1",
  );
  const [selectedBeds, setSelectedBeds] = useState<BedInfo[]>([]);

  const [availableBeds, setAvailableBeds] = useState<BedInfo[]>([]);

  useEffect(() => {
    if (!checkIn) {
      setCheckIn(new Date().toISOString().split("T")[0]);
    }

    if (!checkOut) {
      const defaultCheckOut = new Date();
      defaultCheckOut.setDate(defaultCheckOut.getDate() + 30);
      setCheckOut(defaultCheckOut.toISOString().split("T")[0]);
    }

    // Calculate available beds
    const notOccupiedBeds =
      roomData?.bedInfo?.filter((bed) => !bed.occupied) || [];
    setAvailableBeds(notOccupiedBeds);

    // Initialize selected beds
    setSelectedBeds(notOccupiedBeds.slice(0, Number(bedCount)));
  }, [checkIn, checkOut, setCheckIn, setCheckOut, roomData, bedCount]);

  const handleBedCountChange = (increment: boolean) => {
    const newCount = increment
      ? Math.min(Number(bedCount) + 1, availableBeds.length)
      : Math.max(Number(bedCount) - 1, 1);
    setBedCount(newCount.toString());
    setSelectedBeds(availableBeds.slice(0, newCount));
  };

  const getTotalPrice = () => {
    return selectedBeds.reduce((total, bed) => {
      return (
        total +
        calculateBedPrice(roomData, new Date(checkIn), new Date(checkOut), 1)
      );
    }, 0);
  };

  const handleBookNow = () => {
    const params = new URLSearchParams();
    params.append("checkIn", checkIn);
    params.append("checkOut", checkOut);
    params.append("bedCount", bedCount);
    selectedBeds.forEach((bed, index) => {
      params.append(`bedId${index + 1}`, bed.id.toString());
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <Card className={cn("w-full shadow-xl", className)}>
      <CardContent className="flex flex-col items-stretch gap-2 pb-0 w-full">
        <DatePickerWithRange
          currCheckIn={checkIn}
          currCheckOut={checkOut}
          handleCheckIn={setCheckIn}
          handleCheckOut={setCheckOut}
          className="rounded-none w-full"
        />
        <div className="flex md:flex-col md:items-stretch gap-2">
          <div className="flex justify-between items-center">
            <h3>Bed</h3>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => handleBedCountChange(false)}
              >
                <MinusCircle />
              </Button>
              <span>{bedCount}</span>
              <Button
                variant="ghost"
                onClick={() => handleBedCountChange(true)}
              >
                <PlusCircle />
              </Button>
            </div>
          </div>
        </div>
        {/* Summary */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Room</span>
                <span>{roomData?.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-in</span>
                <span>{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out</span>
                <span>{checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span>Nights</span>
                <span>
                  {differenceInDays(new Date(checkOut), new Date(checkIn))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Beds</span>
                <span>{selectedBeds.map((bed) => bed.bedCode).join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span>Price</span>
                <span>{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit</span>
                <span>{2000 * selectedBeds.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-extrabold text-black">
                <span>Total</span>
                <span>{getTotalPrice() + 2000 * selectedBeds.length}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col w-full">
            <Button onClick={handleBookNow} className="w-full">
              Book Now
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
}
