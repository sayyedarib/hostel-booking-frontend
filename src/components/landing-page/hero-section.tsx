"use client";

import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-[#212529]">
        Experience Premium PG Living <br /> Designed for Your
        Children&apos;s Success
      </h1>
      <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-8">
        Your children are our responsibility. We provide a home away from home.
      </p>
      <Button className="relative font-semibold py-6 px-12 rounded-full text-2xl text-black bg-primary animate-glow">
  <Link href="/rooms">Book Now</Link>
</Button>
    </div>
  );
}
