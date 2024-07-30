"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { RoomCard } from "@/interface";

import { RoomCardComponent } from "@/components/3d-card-demo";
import { getAllRooms } from "@/db/queries";
import { calculateBedPrice, calculateRoomPrice } from "@/lib/utils";

export default function Rooms() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<RoomCard[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const checkIn = new Date(searchParams.get("checkIn")!);
      const checkOut = new Date(searchParams.get("checkOut")!);
      const allRooms = await getAllRooms();

      const roomsWithPrices = allRooms.map((room) => ({
        ...room,
        totalRoomPrice: calculateRoomPrice(room, checkIn, checkOut),
        totalBedPrice: calculateBedPrice(room, checkIn, checkOut),
      }));

      setRooms(roomsWithPrices);
    };

    fetchRooms();
  }, [searchParams]);

  return (
    <>
      <div className="flex justify-center bg-gray-100">
        <div className="mt-44 relative flex flex-wrap gap-10 items-center justify-center -z-1">
          {rooms.map((room) => (
            <RoomCardComponent key={room.roomNumber} roomData={room} />
          ))}
        </div>
      </div>
    </>
  );
}
