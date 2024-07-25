"use client";

import * as React from "react";
import {
  BedDouble,
  MinusCircle,
  PlusCircle,
  UserRound,
} from "lucide-react";

import type { Guest } from "@/interface";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function AddGuest({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [guest, setGuest] = React.useState<Guest | undefined>({
    persons: 1,
    rooms: 1,
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <>
            {/* for medium and large screen */}
            <Button
              id="guest"
              variant={"ghost"}
              className={cn(
                "hidden md:block w-full h-full rounded-[40px] text-lg",
                !guest && "text-muted-foreground"
              )}
            >
              {guest?.persons ? (
                guest?.rooms ? (
                  <span className="flex items-center justify-center">
                    <UserRound />
                    {guest.persons} Person, {guest.rooms} Room
                  </span>
                ) : (
                  <>{guest.persons} Person</>
                )
              ) : (
                <span>Add Guest</span>
              )}
            </Button>
            {/* for small screen */}
            <Button
              id="guest"
              variant={"ghost"}
              className={cn(
                "md:hidden w-full h-full rounded-[40px] text-lg gap-3 lg:gap-6",
                !guest && "text-muted-foreground"
              )}
            >
              {guest?.persons ? (
                guest?.rooms ? (
                  <>
                    <span className="flex items-center justify-center gap-1">
                      <UserRound size={14} /> {guest.persons}
                    </span>
                    <span className="flex items-center justify-center gap-1">
                      <BedDouble /> {guest.rooms}
                    </span>
                  </>
                ) : (
                  <>{guest.persons} Person</>
                )
              ) : (
                <span>Add Guest</span>
              )}
            </Button>
          </>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] px-5 py-3 h-36 flex flex-col justify-center"
          align="center"
        >
          <div className="flex justify-between border-b ">
            <span>
              <h3>Person</h3>
              <span className="text-gray-400">Age 13 or above</span>
            </span>

            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() =>
                  setGuest((prev) => ({
                    persons: Math.max(1, (prev?.persons ?? 1) - 1),
                    rooms: prev?.rooms ?? 1,
                  }))
                }
              >
                <MinusCircle />
              </Button>
              <span>{guest?.persons || 1}</span>
              <Button
                variant="ghost"
                onClick={() =>
                  setGuest((prev) => ({
                    persons: (prev?.persons ?? 1) + 1,
                    rooms: prev?.rooms ?? 1,
                  }))
                }
              >
                <PlusCircle />
              </Button>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <span>
              <h3>Room</h3>
            </span>

            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() =>
                  setGuest((prev) => ({
                    persons: prev?.persons ?? 1,
                    rooms: Math.max(prev?.rooms ?? 1 - 1, 1),
                  }))
                }
              >
                <MinusCircle />
              </Button>
              <span>{guest?.persons || 1}</span>
              <Button
                variant="ghost"
                onClick={() =>
                  setGuest((prev) => ({
                    persons: prev?.persons ?? 1,
                    rooms: (prev?.rooms ?? 1) + 1,
                  }))
                }
              >
                <PlusCircle />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
