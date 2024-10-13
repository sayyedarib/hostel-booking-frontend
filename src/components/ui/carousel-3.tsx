"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MoveRight } from "lucide-react";

interface CarouselItem {
  src: string;
  alt: string;
}

interface CarouselProps {
  items: CarouselItem[];
  Nextbutton: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ items, Nextbutton }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <div className="relative">
      <div className="flex overflow-x-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0 px-2">
              <div className="relative overflow-hidden rounded-lg group">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-4">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full mx-1 ${
              index === activeIndex ? "bg-yellow-500" : "bg-gray-300"
            } focus:outline-none`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      {Nextbutton && (
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
          <button
            className="hover:bg-black border text-white transition-all aspect-square py-2 px-4 rounded-full"
            onClick={handleNext}
          >
            <MoveRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Carousel;
