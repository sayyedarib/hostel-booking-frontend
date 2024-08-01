import * as React from "react";
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import RoomMaps from "@/components/room-maps";
import { CurrentBookingContext } from "@/contexts/CurrentBookingContext";

export function SelectBed() {
  const { currentBooking } = useContext(CurrentBookingContext);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full">
          Select Bed
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Select your bed</DrawerTitle>
          </DrawerHeader>
          <RoomMaps
            type={currentBooking?.roomData?.roomTypeName ?? ""}
            roomData={currentBooking?.roomData!}
          />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button>Proceed to Checkout</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
