"use client";

import Image from "next/image";
import { AlertCircle, BedDouble, Users } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FALLBACK_ROOM_IMAGE } from "@/constant";
import type { RoomCard } from "@/interface";

import AddToCartDrawer from "./add-to-cart-drawer";

export function RoomCardComponent({ roomData }: { roomData: RoomCard }) {
  const availableBeds = Math.max(roomData.bedCount - roomData.occupiedCount, 0);
  // `availableForBooking` is an admin toggle that closes the whole room; a room
  // with no free bed must not be bookable even when the toggle is still on.
  const isRoomOpen = Boolean(roomData.availableForBooking);
  const isBookable = isRoomOpen && availableBeds > 0;

  // Saying "2 available" next to "No Space Available" reads as a contradiction,
  // so a closed room reports why instead of quoting a bed count.
  const unavailableReason = !isRoomOpen
    ? "Not accepting bookings"
    : "No beds available";

  const thumbnail = roomData.imageUrls?.[0] || FALLBACK_ROOM_IMAGE;

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-xl shadow-lg transition-shadow hover:shadow-2xl">
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        <Image
          src={thumbnail}
          alt={`Room ${roomData.roomCode} at ${roomData.buildingName}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          quality={70}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold">
            {roomData.buildingName}
          </CardTitle>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700">
            {roomData.gender}
          </span>
        </div>

        <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          <span className="font-medium text-gray-800">
            Room {roomData.roomCode}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} aria-hidden="true" />
            {roomData.bedCount} max
          </span>
          {isRoomOpen && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} aria-hidden="true" />
              {availableBeds} available
            </span>
          )}
        </CardDescription>

        <div className="mt-auto pt-1">
          {isBookable ? (
            <AddToCartDrawer roomId={Number(roomData.id)} />
          ) : (
            <p className="flex items-center justify-center gap-2 rounded-md bg-red-50 p-2 font-semibold text-red-600">
              <AlertCircle size={18} aria-hidden="true" />
              {unavailableReason}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
