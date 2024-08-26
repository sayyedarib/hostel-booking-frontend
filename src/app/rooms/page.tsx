"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RoomCard } from "@/interface";

import { getAllRoomCards } from "@/db/queries";
import { RoomCardComponent } from "@/components/room-card";
import { Button } from "@/components/ui/button";

export default function Rooms() {
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomCard[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { status, data } = await getAllRoomCards();

      if (status === "error" || !data) {
        // TODO: show toast
        return;
      }

      if (status === "success") {
        //TODO: if there are no rooms, then show a message in center of the screen that no rooms found
        setRooms(data);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div className="my-12 relative flex flex-wrap gap-10 items-center justify-center -z-1">
        {rooms.map((room) => (
          <RoomCardComponent key={room.roomCode} roomData={room} />
        ))}

        <Button
          onClick={() => router.push("/cart")}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-black"
        >
          Go to Cart
        </Button>
      </div>
    </div>
  );
}
