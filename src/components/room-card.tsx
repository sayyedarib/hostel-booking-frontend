"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSearchParams } from "next/navigation";
import { IndianRupee, Star } from "lucide-react";
import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RoomCard } from "@/interface";
import AddToCartStep1 from "./add-to-cart-drawer/step1";
import AddToCartDrawer from "./add-to-cart-drawer";

export function RoomCardComponent({ roomData }: { roomData: RoomCard }) {
  const getStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "reserved":
        return "bg-yellow-500";
      default:
        return "bg-neutral-100";
    }
  };
  return (
    <Card className="w-auto sm:w-[25rem] h-auto rounded-xl shadow-lg hover:shadow-2xl">
      <Link href="/">
        <Image
          src="/bg.webp"
          height="1000"
          width="1000"
          className="h-64 w-full object-cover rounded-t-xl"
          alt="thumbnail"
        />
      </Link>
      <CardContent className="">
        <CardHeader className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {roomData.buildingName}
          </CardTitle>
          <div className="space-x-2 text-yellow-500">
            <Star fill="currentColor" size={16} /> 4.2
          </div>
        </CardHeader>
        <CardDescription className="text-sm text-gray-600">
          Room: {roomData.roomNumber}
        </CardDescription>
        <AddToCartDrawer roomData={roomData} />
      </CardContent>
    </Card>
  );
}
