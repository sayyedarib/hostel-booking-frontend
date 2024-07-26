"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { gallery } from "@/constant";

export function Gallery() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  );

  return (
    <section className="w-full mx-24 md:space-y-4 flex flex-col items-center">
      <h3 className="text-2xl md:text-6xl">Look inside before you get in...</h3>
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "start",
        }}
        className="w-2/3"
      >
        <CarouselContent>
          {gallery.map((src, index) => (
            <CarouselItem
              key={index}
              className="md:basis-1/2 lg:basis-1/3 hover:translate-z-4"
            >
              <Card className="border-none">
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <Image
                    src={src}
                    alt="room"
                    layout="intrinsic"
                    width={2000}
                    height={2000}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
