"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MinusCircle, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DatePickerWithRange from "@/components/ui/date-picker";
import { SelectBed } from "@/components/select-bed";

export default function BedReservationCard({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [guest, setGuest] = useState<number>(1);
  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardContent className="space-y-4">
          <DatePickerWithRange className="hover:bg-white " />
          <div className="flex justify-between">
            <span>
              <h3>Person</h3>
              <span className="text-gray-400">Age 13 or above</span>
            </span>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setGuest((prev) => prev - 1)}
              >
                <MinusCircle />
              </Button>
              <span>{guest || 1}</span>
              <Button
                variant="ghost"
                onClick={() => setGuest((prev) => prev + 1)}
              >
                <PlusCircle />
              </Button>
            </div>
          </div>
          <SelectBed />
        </CardContent>
      </Card>
    </>
  );
}
