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
import Footer from "@/components/landing-page/footer";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MoveRight,
  Music2,
  Share2,
  Twitter,
  Youtube,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CarouselPlugin() {
  const carouselItems = [
    { src: "/img/rooms/room3.webp", alt: "" },
    {
      src: "/img/rooms/Room_7_1.jpeg",
      alt: "",
    },
  ];

  const carouselItems2 = [
    { src: "/img/rooms/Room_7_1.jpeg", alt: "" },
    {
      src: "/img/rooms/Room_6_1.jpeg",
      alt: "",
    },
    {
      src: "/img/rooms/room3.webp",
      alt: "",
    },
    {
      src: "/img/rooms/room8.jpg",
      alt: "",
    },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true }),
  );

  const [isHovered, setIsHovered] = React.useState(false);

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
                  <h3 className="md:text-6xl sm:text-4xl text-2xl font-bold text-white">
                    by travellers for travellers
                  </h3>
                  <h4 className="text-white md:text-5xl text-3xl skew-x-[5deg] skew-y-[5deg]">
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
                  <h3 className="md:text-6xl sm:text-4xl text-2xl font-bold text-white">
                    rooms & facilities
                  </h3>
                  <h4 className="text-white md:text-5xl text-3xl skew-x-[5deg] skew-y-[5deg]">
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
          <h2 className="text-[52px] font-bold my-4">rooms & facilities</h2>
          <p className="text-xl md:mx-24">
            Clean, safe, inviting, and inspiring: Aligarh&apos;s has been
            awarded many times and has all the facilities to ensure a carefree
            stay. Our goal is to create spaces where travellers feel invited to
            come together and connect. So, drop off your backpack, find your
            kindred spirits, and start your adventure with us.
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
          <Carousel3 Nextbutton={false} items={carouselItems} />
        </div>
      </section>
      <section className="flex flex-col items-start justify-center py-8 pb-16 px-5 gap-12">
        <h2 className="text-[40px] font-bold my-4">
          Facilities Aligarh&apos;s Hostels
        </h2>
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
          <h4 className="font-bold text-xl">24hr Reception</h4>
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
          <h4 className="font-bold text-xl">Luggage Storage</h4>
          <p className="max-w-80 text-center tracking-wider">
            We're more than happy to offer you luggage storage options before
            you check in or after checking out. Explore the city without the
            extra weight.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image src="/brekkie_200.svg" width={150} height={150} alt="" />
          <h4 className="font-bold text-xl">Tasty Brekkie</h4>
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
          <h4 className="font-bold text-xl">Laundry</h4>
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
          <h4 className="font-bold text-xl">Guest Kitchen</h4>
          <p className="max-w-80 text-center tracking-wider">
            Craving a home-cooked meal? Show off your signature dish with the
            help of our fully equipped guest kitchen!
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image src="/towels_wombats.svg" width={150} height={150} alt="" />
          <h4 className="font-bold text-xl">Towels</h4>
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
          <h4 className="font-bold text-xl">Lockers</h4>
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
          <h4 className="font-bold text-xl">WomBAR</h4>
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
          <h4 className="font-bold text-xl">Rentables</h4>
          <p className="max-w-80 text-center tracking-wider">
            Irons, hairdryers, adapters, and more – we have an array of handy
            items available to you from reception.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Image src="/250px.svg" width={150} height={150} alt="" />
          <h4 className="font-bold text-xl">Top Host</h4>
          <p className="max-w-80 text-center tracking-wider">
            Aligarh&apos;s has collected more than 50 international HOSCARS
            (Hostelworld Customer Annual Ratings).
          </p>
        </div>
      </section>
      <section className="flex flex-col-reverse lg:flex-row items-center justify-center py-8 pb-16 px-5 gap-12">
        <div className="flex flex-col">
          <Image
            src="/img/rooms/Room_7_1.jpeg"
            width={500}
            height={500}
            alt=""
            className="rounded-xl w-[75vw] lg:w-[unset]"
          />
          <ul className="list-disc pl-5 my-5 text-xl">
            <li>wooden bunk beds (bed sheets included)</li>
            <li>private shower and toilet facilities en-suite</li>
            <li>security lockers for your belongings</li>
            <li>free WIFI</li>
            <li>minimum age 18</li>
          </ul>
        </div>
        <div className="flex flex-col">
          <h3 className="text-5xl mb-3 font-black text-[#212529]">
            beds in dorms
          </h3>
          <Image
            src="/img/rooms/room6.webp"
            width={500}
            height={500}
            alt=""
            className="rounded-xl w-[75vw] lg:w-[unset]"
          />
        </div>
      </section>
      <section className="flex flex-col lg:flex-row items-center justify-center py-8 pb-16 px-5 gap-12 bg-black text-white">
        <div className="flex flex-col">
          <h3 className="text-5xl mb-3 font-black">private double rooms</h3>
          <Image
            src="/img/rooms/room9.jpg"
            width={500}
            height={500}
            alt=""
            className="rounded-xl w-[75vw] lg:w-[unset]"
          />
        </div>
        <div className="flex flex-col">
          <Image
            src="/img/rooms/room8.jpg"
            width={500}
            height={500}
            alt=""
            className="rounded-xl w-[75vw] lg:w-[unset]"
          />
          <p className="my-5 text-xl max-w-[50vw]">
            That's the reason why Aligarh&apos;s City Hostels are becoming
            increasingly popular for travelling couples and business trips.
            Where else can you find a double room in the city center at such
            rates? We are happy to welcome non-typical hostel guests; it makes
            our crowd even more colorful and exciting.
          </p>
        </div>
      </section>
      <section className="flex flex-col-reverse lg:flex-row items-center justify-center py-8 pb-16 px-5 gap-12">
        <div className="flex flex-col">
          <Image
            src="/img/rooms/room2.webp"
            width={500}
            height={500}
            alt=""
            className="rounded-xl w-[75vw] lg:w-[unset]"
          />
          <p className="my-5 text-xl max-w-[50vw]">
            Are you on a ladies' trip or do you prefer female-only travel
            parties inside your room? We are happy to offer special rooms where
            travelling ladies can share their dorm and have their own space.
            Just look out for "female-only" marked dorms in your booking
            process, or contact us; we are always happy to assist.
          </p>
        </div>
        <div className="flex flex-col">
          <h3 className="text-5xl mb-3 font-black text-[#212529]">
            female only rooms
          </h3>
          <Image
            src="/img/rooms/room0.webp"
            width={500}
            height={500}
            alt=""
            className="rounded-xl w-[75vw] lg:w-[unset]"
          />
        </div>
      </section>
      <section className="flex flex-col justify-evenly lg:flex-row py-16 px-4 bg-black text-white">
        <div className="max-w-4xl">
          <h2 className="text-5xl font-bold mb-8">
            why Aligarh&apos;s City Hostels?
          </h2>
          <p className="text-xl mb-8 max-w-xl">
            We have private rooms, we have dorms, we have guest kitchens, we
            have bars... but above all: we have the vibe. Aligarh&apos;s City
            Hostels are the right place to meet people from around the world,
            share travel stories, get in contact with locals, enjoy great food &
            drinks, and experience unforgettable moments.
          </p>
        </div>
        <div className="w-full lg:w-1/2 xl:w-1/4 ">
          <Carousel3 Nextbutton={true} items={carouselItems2} />
        </div>
      </section>
      <section className="w-full flex flex-col items-center justify-cetner px-4 md:px-14 py-4 md:pb-4 pb-24 gap-4 backdrop-blur-3xl shadow-md">
        <div className="flex flex-col rounded-3xl w-full overflow-hidden">
          <Image
            src="/img/rooms/Room_7_1.jpeg"
            width={500}
            height={500}
            alt=""
            className="w-full"
          />
          <div className="flex flex-col bg-black text-white py-16 px-16 gap-5 rounded-3xl w-full -translate-y-[17.5px]">
            <h3 className="text-5xl font-black ">better together</h3>
            <p className="text-xl">
              Are you a travel party of 15 people or more? Welcome to our group
              booking! This is where you can get the best rates!
            </p>
            <Button className="text-white bg-transparent hover:bg-white hover:text-black border border-white group text-md rounded-full px-8 py-3 w-fit">
              Groups booking
              <MoveRight className="ml-2 group-hover:w-10 w-0 transition-all" />
            </Button>
          </div>
        </div>
      </section>

      <div className="w-full flex flex-col items-center justify-center px-4 md:px-14 py-4 md:pb-4 pb-12 gap-4 backdrop-blur-3xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between gap-7">
          <div className="flex flex-col gap-3 bg-[#f3f3f0] p-10 py-12 rounded-2xl">
            <h4 className="font-bold text-xl">Subscribe to our newsletter</h4>
            <form action="">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="first name"
                  className="rounded-full"
                />
                <Input
                  type="text"
                  placeholder="last name"
                  className="rounded-full"
                />
              </div>
              <Input
                type="text"
                placeholder="your email"
                className="rounded-full mt-3"
                required
              />
              <p className="max-w-sm mt-7">
                <input type="checkbox" name="newsletter" id="newsletter" />
                Yes, I want to receive the latest news about Aligarh&apos;s City
                Hostels. I know I can choose to stop sharing my personal data at
                any time.
              </p>
              <Button className="text-white bg-black hover:bg-black hover:text-[#ffd500] group text-sm rounded-full px-8 py-3 mt-4">
                Subscribe
                <Image
                  src="/arrow.svg"
                  width={50}
                  height={50}
                  alt=""
                  className="ml-2 group-hover:w-5 w-0 transition-all"
                />
              </Button>
            </form>
          </div>
          <div className="flex flex-col gap-3 bg-[#f3f3f0] p-10 py-12 rounded-2xl">
            <h4 className="font-bold text-xl">
              Follow us on our social networks
            </h4>
            <div className="flex flex-wrap gap-3 md:w-[75%]">
              <p className="flex gap-2 group">
                <Instagram className="group-hover:text-[#ffd500]" />
                Instagram
              </p>
              <p className="flex gap-2 group">
                <Music2 className="group-hover:text-[#ffd500]" />
                Tiktok
              </p>
              <p className="flex gap-2 group">
                <Youtube className="group-hover:text-[#ffd500]" />
                Youtube
              </p>
              <p className="flex gap-2 group">
                <Facebook className="group-hover:text-[#ffd500]" />
                Facebook
              </p>
              <p className="flex gap-2 group">
                <Linkedin className="group-hover:text-[#ffd500]" />
                Linkedin
              </p>
              <div
                className="relative inline-block overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <button className="text-gray-600 py-2 rounded-full overflow-hidden">
                  <div className="flex items-center">
                    <div
                      className={`bg-white border border-gray-300 flex items-center justify-center mr-2 w-8 h-8 rounded-full transition-all duration-300 ${
                        isHovered ? "opacity-0 translate-y-full" : "opacity-100"
                      }`}
                    >
                      <Share2
                        className={`"w-5 h-5 transition-all duration-300 ${
                          isHovered
                            ? "opacity-0 translate-y-full"
                            : "opacity-100"
                        }`}
                      />
                    </div>
                    <span
                      className={`transition-all duration-300 ${
                        isHovered ? "opacity-0 translate-y-full" : "opacity-100"
                      }`}
                    >
                      Share Site
                    </span>
                  </div>
                  <div
                    className={`absolute inset-0 flex justify-center items-center transition-all duration-300 ${
                      isHovered ? "translate-y-0" : "-translate-y-full"
                    } ${isHovered ? " translate-y-0" : "-translate-y-full"}`}
                  >
                    <Facebook className="w-5 h-5 mx-1 text-gray-600 hover:text-yellow-500 transition-colors" />
                    <Mail className="w-5 h-5 mx-1 text-gray-600 hover:text-yellow-500 transition-colors" />
                    <Twitter className="w-5 h-5 mx-1 text-gray-600 hover:text-yellow-500 transition-colors" />
                    <Linkedin className="w-5 h-5 mx-1 text-gray-600 hover:text-yellow-500 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
