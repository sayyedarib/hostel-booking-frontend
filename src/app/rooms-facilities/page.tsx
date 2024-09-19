"use client";

import * as React from "react";
import Image from "next/image";

import Header from "@/components/header";

import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Carousel3 from "@/components/ui/carousel-3";
import { Button } from "@/components/ui/button";

export default function CarouselPlugin() {
  const carouselItems = [
    { src: "/img/rooms/room3.webp", alt: "" },
    {
      src: "/img/rooms/Room_7_1.jpeg",
      alt: "",
    },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-10" />
      <Carousel plugins={[plugin.current]}>
        <CarouselContent>
          {/* {Array.from({ length: 5 }).map((_, index) => ( */}
          <CarouselItem>
            <div className="relative">
              <Card>
                <CardContent className="flex flex-col aspect-square w-screen h-screen items-center justify-center bg-[url('/img/rooms/Room_6_1.jpeg')] bg-cover relative">
                  <h3 className="text-3xl font-bold text-white">
                    by travellers for travellers
                  </h3>
                  <h4 className="text-white skew-x-[5deg] skew-y-[5deg]">
                    Since 1999
                  </h4>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="relative">
              <Card>
                <CardContent className="flex flex-col aspect-square w-screen h-screen items-center justify-center bg-[url('/img/rooms/room0.webp')] bg-cover relative">
                  <h3 className="text-3xl font-bold text-white">
                    rooms & facilities
                  </h3>
                  <h4 className="text-white skew-x-[5deg] skew-y-[5deg]">
                    Khan Group of PG
                  </h4>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="relative">
              <Card>
                <CardContent className="flex flex-col aspect-square w-screen h-screen items-center justify-center bg-[url('/img/rooms/room7.webp')] bg-cover relative"></CardContent>
              </Card>
            </div>
          </CarouselItem>

          {/* ))} */}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-3 z-10" />
        <CarouselNext className="absolute top-1/2 right-3 z-10" />
      </Carousel>
      <section className="flex flex-col items-center justify-center py-8 px-4 relative">
        <Image
          src="/beds_yellow.svg"
          width={120}
          height={120}
          alt=""
          className="absolute md:top-10 top-16 right-[10%]"
        />
        <div className="max-w-4xl text-center space-y-20">
          <h2 className="text-5xl font-bold my-4">rooms & facilities</h2>
          <p className="text-lg md:mx-24">
            Clean, safe, inviting, and inspiring: Wombat’s has been awarded many
            times and has all the facilities to ensure a carefree stay. Our goal
            is to create spaces where travellers feel invited to come together
            and connect. So, drop off your backpack, find your kindred spirits,
            and start your adventure with us.
          </p>
        </div>
      </section>
      <section className="flex flex-col justify-evenly lg:flex-row py-16 px-4 bg-black text-white">
        <div className="max-w-4xl">
          <h2 className="text-5xl font-bold mb-8">
            privacy please vs.
            <br /> bunk's not dead!
          </h2>
          <p className="text-xl mb-8 max-w-xl">
            No matter if you prefer a private room or a multi-bed dorm, it will
            be your reliably clean and safe space to relax from your travelling
            stress and adventures in town.
          </p>
        </div>
        <div className="w-full lg:w-1/2 xl:w-1/4 ">
          <Carousel3 items={carouselItems} />
        </div>
      </section>
      <section className="flex flex-col items-start justify-center py-8 pb-16 px-5 gap-12">
        <h2 className="text-5xl font-bold my-4">Facilities Wombat's Hostels</h2>
        <Carousel plugins={[plugin.current]} className="max-w-screen w-full">
          <CarouselContent className="-ml-1">
            <CarouselItem className="pl-1 md:basis-1/3 basis-1/2 lg:basis-1/4">
              <div className="p-5">
                <Card className="rounded-3xl bg-[url('/img/rooms/room7.webp')] bg-cover bg-center aspect-square"></Card>
              </div>
            </CarouselItem>
            <CarouselItem className="pl-1 md:basis-1/3 basis-1/2 lg:basis-1/4">
              <div className="p-5">
                <Card className="rounded-3xl bg-[url('/img/rooms/room3.webp')] bg-cover bg-center aspect-square"></Card>
              </div>
            </CarouselItem>
            <CarouselItem className="pl-1 md:basis-1/3 basis-1/2 lg:basis-1/4">
              <div className="p-5">
                <Card className="rounded-3xl bg-[url('/img/rooms/Room_7_1.jpeg')] bg-cover bg-center aspect-square"></Card>
              </div>
            </CarouselItem>
            <CarouselItem className="pl-1 md:basis-1/3 basis-1/2 lg:basis-1/4">
              <div className="p-5">
                <Card className="rounded-3xl bg-[url('/img/rooms/room8.jpg')] bg-cover bg-center aspect-square"></Card>
              </div>
            </CarouselItem>
            <CarouselItem className="pl-1 md:basis-1/3 basis-1/2 lg:basis-1/4">
              <div className="p-5">
                <Card className="rounded-3xl bg-[url('/bg.webp')] bg-cover bg-center aspect-square"></Card>
              </div>
            </CarouselItem>
            <CarouselItem className="pl-1 md:basis-1/3 basis-1/2 lg:basis-1/4">
              <div className="p-5">
                <Card className="rounded-3xl bg-[url('/food-service.png')] bg-cover bg-center aspect-square"></Card>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="absolute top-1/2 left-7 z-10" />
          <CarouselNext className="absolute top-1/2 right-7 z-10" />
        </Carousel>
        <Button className="text-black hover:bg-black hover:text-[#ffd500] group text-xl rounded-full px-8 py-7">
          Bring me to the gallery
          <Image
            src="/arrow.svg"
            width={50}
            height={50}
            alt=""
            className="ml-2 group-hover:w-10 w-0 transition-all"
          />
        </Button>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-10 bg-[#f3f3f0] py-16">
        <div className="flex flex-col items-center gap-2">
          <Image src="/24_7_wombats_200.svg" width={150} height={150} alt="" />
          <h4 className="font-bold">24hr Reception</h4>
          <p className="max-w-80 text-center tracking-wider">
            All of our hostels are staffed with a 24/7 reception. Our
            enthusiastic team can provide you with tips and insights anytime,
            day or night.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Image
            src="/luggage_wombats_200.svg"
            width={150}
            height={150}
            alt=""
          />
          <h4 className="font-bold">Luggage Storage</h4>
          <p className="max-w-80 text-center tracking-wider">
            We're more than happy to offer you luggage storage options before
            you check in or after checking out. Explore the city without the
            extra weight.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image src="/brekkie_200.svg" width={150} height={150} alt="" />
          <h4 className="font-bold">Tasty Brekkie</h4>
          <p className="max-w-80 text-center tracking-wider">
            Fuel up for a day of adventuring with our fresh, organic, and
            locally sourced breakfast. Unlimited coffee and tea included!
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/laundry_wombats_200.svg"
            width={150}
            height={150}
            alt=""
          />
          <h4 className="font-bold">Laundry</h4>
          <p className="max-w-80 text-center tracking-wider">
            Breathe new life into your backpack and freshen your clothes with
            our laundry facilities.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/guestkitchen_wombats_200.svg"
            width={150}
            height={150}
            alt=""
          />
          <h4 className="font-bold">Guest Kitchen</h4>
          <p className="max-w-80 text-center tracking-wider">
            Craving a home-cooked meal? Show off your signature dish with the
            help of our fully equipped guest kitchen!
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image src="/towels_wombats.svg" width={150} height={150} alt="" />
          <h4 className="font-bold">Towels</h4>
          <p className="max-w-80 text-center tracking-wider">
            You pre-order your towel online or rent one for a small fee at
            reception :) Towels are provided in double and twin rooms.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/lockers_wombats_200.svg"
            width={150}
            height={150}
            alt=""
          />
          <h4 className="font-bold">Lockers</h4>
          <p className="max-w-80 text-center tracking-wider">
            Every room is equipped with robust lockers for each individual
            guest. Keep your valuables safe and put your mind at ease.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/wombar_wombats_200.svg"
            width={150}
            height={150}
            alt=""
          />
          <h4 className="font-bold">WomBAR</h4>
          <p className="max-w-80 text-center tracking-wider">
            If you’re looking to meet fellow guests, cap off a long day of
            exploring, or begin a big night out, the WomBAR is open for you.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/rentables_wombats_200.svg"
            width={150}
            height={150}
            alt=""
          />
          <h4 className="font-bold">Rentables</h4>
          <p className="max-w-80 text-center tracking-wider">
            Irons, hairdryers, adapters, and more – we have an array of handy
            items available to you from reception.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image src="/250px.svg" width={150} height={150} alt="" />
          <h4 className="font-bold">Top Host</h4>
          <p className="max-w-80 text-center tracking-wider">
            Wombat's has collected more than 50 international HOSCARS
            (Hostelworld Customer Annual Ratings).
          </p>
        </div>
      </section>
    </>
  );
}
