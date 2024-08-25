"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CardStack } from "../ui/card-stack";

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

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="space-y-4 flex flex-col items-center">
      {/* <CardStack items={acheievers} /> */}
      <div className="text-2xl sm:text-4xl md:text-6xl text-[#3D5280]">
        Experience Premium Hostel Living, <br className="hidden sm:block" />{" "}
        Designed for Your Children&apos;s Success.
      </div>
      <p className="text-sm md:text-xl lg:text-3xl text-neutral-500">
        Your children is our responsibility. <br className="hidden sm:block" />{" "}
        We provide home away from home.
      </p>
      <Button
        onClick={() => router.push("/rooms")}
        className="bg-primary rounded-full"
      >
        Book Now
      </Button>
    </div>
  );
}
