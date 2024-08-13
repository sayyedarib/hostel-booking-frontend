"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { addDays } from "date-fns";

import type { RoomCard } from "@/interface";

import { RoomCardComponent } from "@/components/room-card";
import { getAllRooms } from "@/db/queries";
import { calculateBedPrice, calculateRoomPrice } from "@/lib/utils";

function RoomsContent() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<RoomCard[]>([
    {
      id: 1,
      buildingName: "Building 1",
      roomNumber: "101",
      imageUrls: ["https://images.unsplash.com/photo-1532635246-7a1f0e3b8d0d"],
      availableBeds: 2,
      gender: "male",
      bedInfo: [
        {
          id: 1,
          dailyPrice: 100,
          monthlyPrice: 1000,
          status: "selected",
          bedCode: "L1",
        },
      ],
    },
    {
      id: 2,
      buildingName: "Building 1",
      roomNumber: "102",
      imageUrls: ["https://images.unsplash.com/photo-1532635246-7a1f0e3b8d0d"],
      availableBeds: 2,
      gender: "male",
      bedInfo: [
        {
          id: 2,
          dailyPrice: 200,
          monthlyPrice: 2000,
          status: "available",
          bedCode: "L1",
        },
        {
          id: 3,
          dailyPrice: 200,
          monthlyPrice: 2000,
          status: "available",
          bedCode: "U1",
        },
      ],
    },
    {
      id: 3,
      buildingName: "Building 1",
      roomNumber: "103",
      imageUrls: ["https://images.unsplash.com/photo-1532635246-7a1f0e3b8d0d"],
      availableBeds: 2,
      gender: "male",
      bedInfo: [
        {
          id: 4,
          dailyPrice: 300,
          monthlyPrice: 3000,
          status: "available",
          bedCode: "L1",
        },
        {
          id: 5,
          dailyPrice: 300,
          monthlyPrice: 3000,
          status: "occupied",
          bedCode: "L2",
        },
        {
          id: 6,
          dailyPrice: 300,
          monthlyPrice: 3000,
          status: "available",
          bedCode: "U1",
        },
      ],
    },
  ]);
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
      // const allRooms = await getAllRooms();

      // const roomsWithPrices = allRooms.map((room) => ({
      //   ...room,
      //   totalRoomPrice: calculateRoomPrice(room, checkIn, checkOut),
      //   totalBedPrice: calculateBedPrice(room, checkIn, checkOut, bed),
      // }));

      // setRooms(roomsWithPrices);
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
