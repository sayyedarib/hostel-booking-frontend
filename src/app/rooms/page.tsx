"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { RoomCard } from "@/interface";

import Header from "@/components/header";
import { getAllRoomCards } from "@/db/queries";
import { RoomCardComponent } from "@/components/room-card";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function Rooms() {
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomCard[]>([]);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRooms = async () => {
      const { status, data } = await getAllRoomCards();

      if (status === "error" || !data) {
        toast({
          title: "Something went wrong",
          description: "Failed to fetch rooms, Please try again later",
        });
        setFetching(false);
        logger("error", "Failed to fetch rooms");
        return;
      }

      if (status === "success") {
        setFetching(false);
        //TODO: if there are no rooms, then show a message in center of the screen that no rooms found
        setRooms(data);
      }
      setFetching(false);
    };

    fetchRooms();
  }, []);

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-9999" />

      <div className="flex justify-center items-center min-h-[80vh] max-w-screen mt-20 relative -z-1">
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
          className="md:hidden fixed bottom-0 left-0 right-0 rounded-none"
        >
          Go to Cart
        </Button>
      </div>
    </>
  );
}
