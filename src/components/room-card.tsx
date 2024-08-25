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
    <Card className="w-auto sm:w-[25rem] h-auto rounded-xl shadow-lg hover:shadow-2xl">
      <Link href="/">
        <Image
          src={roomData.imageUrls?.[0] || "/bg.webp"}
          height="1000"
          width="1000"
          className="h-64 w-full object-cover rounded-t-xl"
          alt="thumbnail"
        />
      </Link>
      <CardContent className="w-full">
        <CardHeader className="flex">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {roomData.buildingName}
            </CardTitle>
            <div className="flex items-center space-x-2 text-yellow-500">
              <Star fill="currentColor" size={16} />
              <span>4.2</span>
            </div>
          </div>
          <CardDescription className="text-sm text-gray-600">
            Room: {roomData.roomCode}
          </CardDescription>
        </CardHeader>
        {/* TODO: why roomData.id is string here, it should be number always no need to convert */}
        <AddToCartDrawer roomId={Number(roomData.id)} />
      </CardContent>
    </Card>
  );
}
