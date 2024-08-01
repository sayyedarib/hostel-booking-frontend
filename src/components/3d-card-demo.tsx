"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSearchParams } from "next/navigation";
import { IndianRupee, Star } from "lucide-react";
import { differenceInDays } from "date-fns";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { RoomCard } from "@/interface";

export function RoomCardComponent({ roomData }: { roomData: RoomCard }) {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const duration = differenceInDays(checkOut!, checkIn!);

  const searchParamsString = searchParams.toString();
  const roomUrl = `/rooms/${roomData.id}?${searchParamsString}`;

  return (
    <CardContainer
      as={Link}
      href={roomUrl}
      className="inter-var"
    >
      <CardBody className="bg-gray-50 relative group/card  shadow-lg hover:shadow:2xl w-auto sm:w-[30rem] h-auto rounded-xl border">
        <CardItem translateZ="100" className="w-full">
          <Image
            src="/bg.webp"
            height="1000"
            width="1000"
            className="h-64 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex justify-between items-center">
          <CardItem
            translateZ={0}
            className="px-4 mt-4 rounded-xl text-s font-normal flex items-center"
          >
            {roomData.buildingName}
          </CardItem>
          <CardItem
            translateZ={0}
            as="button"
            className="px-4 flex items-center gap-2"
          >
            <Star fill="" size={14} /> 4.2
          </CardItem>
        </div>
        <CardItem
          translateZ={0}
          as="button"
          className="px-4 flex items-center gap-2 text-neutral-500"
        >
          Room: {roomData.roomNumber}
        </CardItem>
        <CardItem
          translateZ={0}
          className="px-4 rounded-xl text-s font-normal flex items-center mb-2"
        >
          <IndianRupee size={16} />{" "}
          {Math.max(roomData.totalBedPrice, roomData.bedInfo[0].dailyPrice)} for{" "}
          {duration ? duration : duration} night{duration > 1 ? "s" : ""}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
