"use client";
import { Suspense, useEffect, useState } from "react";
import { addDays } from "date-fns";

import type { RoomCard } from "@/interface";

import { getAllRoomCards } from "@/db/queries";
import { RoomCardComponent } from "@/components/room-card";
import { toast } from "sonner";

export default function Rooms() {
  const [rooms, setRooms] = useState<RoomCard[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { status, data } = await getAllRoomCards();

      if (status === "error" || !data) {
        toast.error("Something went wrong", {
          // className: "",
          description: "Error fetching Rooms",
        });
        return;
      }

      if (status === "success") {
        setRooms(data);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div className="mt-44 relative flex flex-wrap gap-10 items-center justify-center -z-1">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCardComponent key={room.roomCode} roomData={room} />
          ))
        ) : (
          <div className="text-center">
            <h2 className="text-lg font-bold">No rooms found</h2>
            <p>Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
