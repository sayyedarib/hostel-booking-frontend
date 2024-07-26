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
    <section className="w-[calc(100% - 20rem)] mx-24 space-y-8 flex flex-col items-center">
      <h3 className="text-2xl md:text-6xl">Look inside before you get in...</h3>
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "start",
        }}
        className="w-4/5 lg:w-3/4"
      >
        <CarouselContent>
          {gallery.map((src, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <Card className="border-none">
                <CardContent className="flex items-center justify-center w-full h-full">
                  <Image
                    src={src}
                    alt="room"
                    layout="intrinsic"
                    width={4000}
                    height={4000}
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
