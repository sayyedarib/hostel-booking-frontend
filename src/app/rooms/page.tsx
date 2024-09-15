"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/header";
import { getAllRoomCards } from "@/db/queries";
import { RoomCardComponent } from "@/components/room-card";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function Rooms() {
  const { toast } = useToast();

  const {
    isLoading,
    error,
    data: rooms,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { status, data } = await getAllRoomCards();
      if (status === "error" || !data) {
        toast({
          title: "Something went wrong",
          description: "Failed to fetch rooms, Please try again later",
        });
        logger("error", "Failed to fetch rooms");
        throw new Error("Failed to fetch rooms");
      }
      return data;
    },
  });

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-10" />

      <div className="flex justify-center items-center min-h-[80vh] max-w-screen mt-20 relative -z-1">
        {isLoading ? (
          <Image
            src="/Loading.gif"
            width={100}
            height={100}
            alt="loading"
            unoptimized={true}
          />
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : rooms?.length === 0 ? (
          <div>No rooms found</div>
        ) : (
          <div className="my-12 md:my-20 relative flex flex-wrap gap-10 items-center justify-center -z-1">
            {rooms?.map((room) => (
              <RoomCardComponent key={room.roomCode} roomData={room} />
            ))}
          </div>
        )}
        <Button className="md:hidden fixed bottom-0 left-0 right-0 rounded-none">
          <Link href="/cart">Go to Cart</Link>
        </Button>
      </div>
    </>
  );
}
