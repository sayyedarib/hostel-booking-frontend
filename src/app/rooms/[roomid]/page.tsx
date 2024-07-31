"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import {
  Share,
  Zap,
  Wifi,
  ShowerHead,
  CircleParking,
  Droplets,
  Fan,
  LampDesk,
  DoorOpen,
  Soup,
  GraduationCap,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Room as RoomDataType } from "@/interface";

import BedReservationCard from "@/components/bed-reservation-card";
import { getRoomById } from "@/db/queries";

export default function Room({ params }: { params: { roomid: string } }) {
  const [roomData, setRoomData] = useState<RoomDataType | null>(null);

  useEffect(() => {
    const fetchCurrentRoom = async () => {
      const roomData = await getRoomById(Number(params.roomid));
      setRoomData(roomData);
    };

    fetchCurrentRoom();
  }, [params.roomid]);

  return (
    <>
      <div className="w-2/3 flex justify-center mx-auto">
        <div className="mt-32 border-neutral-600 p-2 space-y-4">
          <Carousel>
            <CarouselContent>
              {/* TODO: These images should be from image roomData.imageUrls and in smaller screen these should come one by in  carousel. */}
              {roomData?.imageUrls.map((imgURL) => (
                <CarouselItem key={imgURL}>
                  <Image
                    height={0}
                    width={0}
                    sizes="100vw"
                    src={imgURL}
                    className="w-full h-auto"
                    alt="room-image"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="flex justify-between">
            <div className="flex flex-col">
              {/* TODO: Add skeleton here untill fetching */}
              <span className="text-3xl">{roomData?.buildingName}</span>
              <span className="text-xl text-neutral-500">
                Room: {roomData?.roomNumber}
              </span>
            </div>
            {/* TODO: Use Dialogue component from shadcn ui, show the url and copy button */}
            <Share />
          </div>

          <div className="flex w-full flex-col lg:flex-row gap-2">
            {/* TODO: Make it responsive. */}
            <div className="lg:w-[66%] w-full flex">
              <div className="w-1/3">
                <h2 className="text-2xl mb-3 text-neutral-900">
                  Free Services
                </h2>
                <ul className="text-md font-thin space-y-2 text-neutral-500">
                  <li className="flex gap-2">
                    <Wifi />
                    Free WIFI
                  </li>
                  {/* <li className="flex gap-2">Daily Room Cleaning for free</li> */}
                  <li className="flex gap-2">
                    <Droplets /> Purified Water
                  </li>
                  <li className="flex gap-2">
                    <Zap />
                    24*7 Electricity
                  </li>
                  <li className="flex gap-2">
                    <CircleParking />
                    Free Parking
                  </li>
                </ul>
              </div>
              <div className="w-1/3">
                <h2 className="text-2xl mb-3 text-neutral-900">Inside Room</h2>
                <ul className="text-md font-thin space-y-2 text-neutral-500">
                  <li className="flex gap-2">
                    <DoorOpen />
                    Dedicated almirah with lock to every individual
                  </li>
                  <li className="flex gap-2">
                    <LampDesk />
                    Dedicated Workspace to every individual
                  </li>
                  <li className="flex gap-2">
                    <ShowerHead />
                    Attached washroom
                  </li>
                  <li className="flex gap-2">
                    <Fan />
                    Air Cooler
                  </li>
                </ul>
              </div>

              <div className="w-1/3">
                <h2 className="text-2xl mb-3 text-neutral-900">
                  At walking distance
                </h2>
                <ul className="text-md font-thin space-y-2 text-neutral-500">
                  <li className="flex gap-2">
                    <GraduationCap />
                    AMU Campus (Main Gate)
                  </li>
                  <li className="flex gap-2">
                    <Soup />
                    Restraunts and hotels
                  </li>
                </ul>
              </div>
            </div>
            <BedReservationCard className="lg:w-[33%] md:static md:w-full w-screen fixed bottom-0 left-0 right-0" />
          </div>
        </div>
      </div>
    </>
  );
}
