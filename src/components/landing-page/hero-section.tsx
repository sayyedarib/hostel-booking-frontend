"use client";

import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ImagesSlider } from "@/components/ui/images-slider";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { CardStack } from "../ui/card-stack";

export default function HeroSection() {
  const images = [
    "/img/rooms/room6.webp",
    "/img/rooms/room7.webp",
    "/img/rooms/room5.webp",
  ];

  const acheievers = [
    {
      name: "Aarib",
      rank: "2",
      src: "/acheivers/11.png",
    },
    {
      name: "Aarib",
      rank: "2",
      src: "/acheivers/sumair.png",
    },
    {
      name: "Aarib",
      rank: "2",
      src: "/acheivers/11.png",
    },
  ];
  return (
    <div className="space-y-4 flex flex-col items-center">
      <CardStack items={acheievers} />
      <div className="text-2xl sm:text-4xl md:text-6xl text-[#3D5280]">
        Experience Premium Hostel Living, <br className="hidden sm:block" />{" "}
        Designed for Your Children&apos;s Success.
      </div>
      <p className="text-sm md:text-xl lg:text-3xl text-neutral-500">
        Your children is our responsibility. <br className="hidden sm:block" />{" "}
        We provide home away from home.
      </p>

      {/* <div className="pt-24 text-sm md:text-xl lg:text-2xl text-neutral-500">
        <span>we have acheived so far...</span>{" "}
        <div className="flex gap-7 text-xs md:text-md lg:text-lg justify-center">
          <div className="flex flex-col">
            <span>1472+</span>
            <span>Booking</span>
          </div>
          <div className="flex flex-col">
            <span>100+</span>
            <span className="w-16 md:w-full">Selection every year</span>
          </div>
          <div className="flex flex-col">
            <span>100+</span>
            <span>Beds</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
