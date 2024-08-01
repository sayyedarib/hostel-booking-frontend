import * as React from "react";

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
import type { Room as RoomDataType } from "@/interface";

export function SelectBed({ roomData }: { roomData: RoomDataType }) {
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
          <RoomMaps roomData={roomData} type={"2-bed"} />
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
