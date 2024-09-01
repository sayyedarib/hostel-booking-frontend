import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface CarouselProps {
  images: string[];
}

const CarouselFlowbite: React.FC<CarouselProps> = ({ images }) => {
  return (
    <div
      id="default-carousel"
      className="relative w-full"
      data-carousel="slide"
    >
      <div className="relative h-56 overflow-hidden rounded-lg md:h-[50vh]">
        {images.map((image, index) => (
          <div
            key={index}
            className="duration-700 ease-in-out"
            data-carousel-item
          >
            <Image
              width={2000}
              height={2000}
              src={image}
              className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              alt={`Slide ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
        {(images ?? ["1"]).map((_, index) => (
          <button
            key={index}
            type="button"
            className="w-3 h-3 rounded-full"
            aria-current={index === 0 ? "true" : "false"}
            aria-label={`Slide ${index + 1}`}
            data-carousel-slide-to={index}
          ></button>
        ))}
      </div>

      <Button
        variant="ghost"
        className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer"
        data-carousel-prev
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 ">
          <ChevronLeft className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" />
          <span className="sr-only">Previous</span>
        </span>
      </Button>
      <Button
        variant="ghost"
        className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer"
        data-carousel-next
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30  ">
          <ChevronRight className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" />
          <span className="sr-only">Next</span>
        </span>
      </Button>
    </div>
  );
};

export default CarouselFlowbite;
