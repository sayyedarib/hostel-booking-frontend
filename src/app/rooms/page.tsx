"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { addDays } from "date-fns";

import type { RoomCard } from "@/interface";

import { RoomCardComponent } from "@/components/3d-card-demo";
import { getAllRooms } from "@/db/queries";
import { calculateBedPrice, calculateRoomPrice } from "@/lib/utils";

function RoomsContent() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<RoomCard[]>([]);
  console.log(
    "🚀 ~ file: page.tsx ~ line 31 ~ RoomsContent ~ searchParams",
    searchParams.get("checkIn"),
  );
  useEffect(() => {
    const fetchRooms = async () => {
      const checkInParam = searchParams.get("checkIn");
      const checkOutParam = searchParams.get("checkOut");
      const bedParam = searchParams.get("bed");

      const checkIn = checkInParam ? new Date(checkInParam) : new Date();
      const checkOut = checkOutParam
        ? new Date(checkOutParam)
        : addDays(new Date(), 30);
      const bed = bedParam ? parseInt(bedParam) : 1;
      const allRooms = await getAllRooms();

      const roomsWithPrices = allRooms.map((room) => ({
        ...room,
        totalRoomPrice: calculateRoomPrice(room, checkIn, checkOut),
        totalBedPrice: calculateBedPrice(room, checkIn, checkOut, bed),
      }));

      setRooms(roomsWithPrices);
    };

    fetchRooms();
  }, [searchParams]);

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="mt-44 relative flex flex-wrap gap-10 items-center justify-center -z-1">
        {rooms.map((room) => (
          <RoomCardComponent key={room.roomNumber} roomData={room} />
        ))}
      </div>
    </div>
  );
}

export default function Rooms() {
  return (
    <Suspense fallback={<div>Loading rooms...</div>}>
      <RoomsContent />
    </Suspense>
  );
}
