"use client";

import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-[#212529]">
        Experience Premium PG Living <br /> Designed for Your
        Children&apos;s Success
      </h1>
      <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-8">
        Your children are our responsibility. We provide a home away from home.
      </p>
      <Button className="bg-primary font-semibold py-8 px-11 rounded-full text-black text-2xl border-4 border-black">
        <Link href="/rooms">Book Now</Link>
      </Button>
    </div>
  );
}
