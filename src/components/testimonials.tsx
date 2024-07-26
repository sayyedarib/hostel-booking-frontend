"use client";

import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export function Testimonials() {
  return (
    <div className="h-[30rem] rounded-md flex flex-col antialiased space-y-4 bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative max-w-full overflow-hidden">
      <h3 className="text-4xl md:text-6xl">Don't just take our words</h3>
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
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
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
];
