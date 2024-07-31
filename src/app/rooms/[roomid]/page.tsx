"use client";

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
import { useContext, useEffect, useState } from "react";

import type { Room as RoomDataType } from "@/interface";

import BedReservationCard from "@/components/bed-reservation-card";
import { CurrentBookingContext } from "@/contexts/CurrentBookingContext";
import { getRoomById } from "@/db/queries";

export default function Room({ params }: { params: { roomid: string } }) {

  const { setCurrentBooking } = useContext(CurrentBookingContext);
  const [roomData, setRoomData] = useState<RoomDataType | null>(null);

  useEffect(() => {
    async function fetchData() {
      const roomData = await getRoomById(parseInt(params.roomid));
      setRoomData(roomData);
      setCurrentBooking(prev => ({ ...prev, roomData }));
      console.log("roomData", roomData);
    }

    fetchData();
  }, [params.roomid]);

  return (
    <>
      <div className="w-2/3 flex justify-center mx-auto">
        <div className="mt-32 border-neutral-600 p-2 space-y-4">
          <div className="grid md:grid-cols-4 md:grid-rows-2 gap-2 rounded-xl">
            {/* TODO: These images should be from image roomData.imageUrls and in smaller screen these should come one by in  carousel. */}
            <Image
              height={2000}
              width={2000}
              src="/bg.webp"
              className="md:col-span-2 md:row-span-2"
              alt=""
            />
            <Image height={2000} width={2000} src="/bg.webp" alt="" />
            <Image height={2000} width={2000} src="/bg.webp" alt="" />
            <Image height={2000} width={2000} src="/bg.webp" alt="" />
            <Image height={2000} width={2000} src="/bg.webp" alt="" />
          </div>
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
            <BedReservationCard className="lg:w-[33%] w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
