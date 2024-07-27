"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function Testimonials() {
  return (
    <div className="h-[30rem] rounded-md flex flex-col antialiased space-y-4 items-center justify-center relative max-w-full overflow-hidden">
      <h3 className="text-2xl md:text-6xl text-red-500">
        Don&apos;t just take our words
      </h3>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="fast"
      />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Cheapest hostel in Aligarh, Overall Good Experience. I would recommend this to everyone.",
    name: "Sayyed Arib Hussain",
    title: "",
  },
  {
    quote:
      "The room was clean and well-maintained. The staff was friendly and always ready to help. Great value for money!",
    name: "Ravi Kumar",
    title: "",
  },
  {
    quote:
      "I had a comfortable stay at the hostel. The amenities were good, and the location was convenient for my needs.",
    name: "Priya Sharma",
    title: "",
  },
  {
    quote:
      "The hostel room was spacious and had all the necessary facilities. The common areas were also well-kept and inviting.",
    name: "Anjali Verma",
    title: "",
  },
  {
    quote:
      "A decent place to stay for a short trip. The room was tidy, and the Wi-Fi connection was strong. Would stay here again.",
    name: "Vikram Singh",
    title: "",
  },
];
