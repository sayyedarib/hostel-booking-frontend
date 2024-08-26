"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { RoomCard } from "@/interface";

import { getAllRoomCards } from "@/db/queries";
import { RoomCardComponent } from "@/components/room-card";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils";

export default function Rooms() {
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomCard[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { status, data } = await getAllRoomCards();

      if (status === "error" || !data) {
        // TODO: show toast
        setFetching(false);
        logger("error", "Failed to fetch rooms");
        return;
      }

      if (status === "success") {
        //TODO: if there are no rooms, then show a message in center of the screen that no rooms found
        setRooms(data);
      }
      setFetching(false);
    };

    fetchRooms();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[80vh] max-w-screen">
      {fetching ? (
        <Image
          src="/Loading.gif"
          width={100}
          height={100}
          alt="loading"
          unoptimized={true}
        />
      ) : (
        <div className="my-12 md:my-20 relative flex flex-wrap gap-10 items-center justify-center -z-1">
          {rooms.map((room) => (
            <RoomCardComponent key={room.roomCode} roomData={room} />
          ))}
        </div>
      )}
      <Button
        onClick={() => router.push("/cart")}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-black"
      >
        Go to Cart
      </Button>
    </div>
  );
}
