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
import BedReservationCard from "@/components/bed-reservation-card";
import { Separator } from "@/components/ui/separator";

export default function Room({ params }: { params: { roomid: string } }) {
  return (
    <>
      <Separator className="fixed top-16 my-4" />
      <div className="w-2/3 flex justify-center mx-auto">
        <div className="mt-32 border-neutral-600 p-2 space-y-4">
          <div className="grid md:grid-cols-4 md:grid-rows-2 gap-2 rounded-xl">
            <Image
              height={2000}
              width={2000}
              src="/bg.jpg"
              className="md:col-span-2 md:row-span-2"
              alt=""
            />
            <Image height={2000} width={2000} src="/bg.jpg" alt="" />
            <Image height={2000} width={2000} src="/bg.jpg" alt="" />
            <Image height={2000} width={2000} src="/bg.jpg" alt="" />
            <Image height={2000} width={2000} src="/bg.jpg" alt="" />
          </div>
          <div className="flex justify-between">
            <span className="text-4xl">Room 66</span>
            <Share />
          </div>

          <div className="flex w-full gap-2">
            <div className="w-2/3 flex">
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
            <BedReservationCard className="w-1/3" />
          </div>
        </div>
      </div>
    </>
  );
}
