"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Star, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { RoomCard } from "@/interface";
import AddToCartDrawer from "./add-to-cart-drawer";

export function RoomCardComponent({ roomData }: { roomData: RoomCard }) {
  const availableBeds = roomData.bedCount - roomData.occupiedCount;

  return (
    <Card className="w-full p-2 md:w-[25rem] h-auto rounded-xl shadow-lg hover:shadow-2xl space-y-3">
      <Image
        src={roomData.imageUrls?.[0] || "/img/fall_back_room.jpg"}
        placeholder="data:image/img/fall_back_room.png"
        height="1000"
        width="1000"
        className="h-64 w-full object-cover rounded-xl"
        alt="thumbnail"
        quality={75}
        priority={false}
      />

      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          {roomData.buildingName}
        </CardTitle>
        <div className="flex items-center space-x-2 text-yellow-500">
          <Star fill="currentColor" size={16} />
          <span>4.{Math.floor(Math.random() * 10)}</span>
        </div>
      </div>
      <CardDescription className="text-sm text-gray-600">
        Room: {roomData.roomCode} | Max Persons: {roomData.bedCount} | Available
        Beds: {availableBeds}
      </CardDescription>
      {roomData.availableForBooking ? (
        <AddToCartDrawer roomId={Number(roomData.id)} />
      ) : (
        <div className="flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-md">
          <AlertCircle size={18} className="mr-2" />
          <p className="font-semibold">No Space Available</p>
        </div>
      )}
    </Card>
  );
}
