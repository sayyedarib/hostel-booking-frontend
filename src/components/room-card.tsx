"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Star } from "lucide-react";
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

  return (
    <Card className="w-full p-2 md:w-[25rem] h-auto rounded-xl shadow-lg hover:shadow-2xl space-y-3">
      <Image
        src={roomData.imageUrls?.[0] || "/img/fall_back_room.png"}
        height="1000"
        width="1000"
        className="h-64 w-full object-cover rounded-xl"
        alt="thumbnail"
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
        Room: {roomData.roomCode} | Max Persons: {roomData.bedCount}
      </CardDescription>
      <AddToCartDrawer roomId={Number(roomData.id)} />
    </Card>
  );
}
