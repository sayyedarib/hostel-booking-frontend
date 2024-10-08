"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Loader2 } from "lucide-react";

import Header from "@/components/header";
import { getAllRoomCards, getCartItemsCount } from "@/db/queries";
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
          variant: "destructive",
          title: "Something went wrong",
          description: "Failed to fetch rooms, Please try again later",
        });
        logger("error", "Failed to fetch rooms");
        throw new Error("Failed to fetch rooms");
      }
      return data;
    },
  });

  const {
    isLoading: isCartItemsCountLoading,
    error: cartItemsCountError,
    data: cartItemsCount,
  } = useQuery({
    queryKey: ["cartItemsCount"],
    queryFn: async () => {
      const { status, data } = await getCartItemsCount();
      if (status === "error") {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Failed to fetch cart items, Please try again later",
        });
        logger("error", "Failed to fetch cart items count");
      }
      return data;
    },
    enabled: true,
    refetchOnWindowFocus: false,
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
        <Button className="fixed bottom-3 right-3 md:bottom-6 md:right-6 rounded-full h-14 w-14 md:h-16 md:w-16 bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <Link
            href="/cart"
            className="flex items-center justify-center relative"
          >
            <ShoppingCart size={48} color="black" strokeWidth={2} />
            {cartItemsCountError ? (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center z-2">
                !
              </span>
            ) : (
              cartItemsCount && (
                <span className="absolute -top-3 -right-2 bg-black text-white text-lg rounded-full w-5 h-5 flex items-center justify-center z-2">
                  {isCartItemsCountLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    cartItemsCount
                  )}
                </span>
              )
            )}
          </Link>
        </Button>
      </div>
    </>
  );
}
