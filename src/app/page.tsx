"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import HeroSection from "@/components/landing-page/hero-section";
import Testimonials from "@/components/landing-page/testimonials";
import Header from "@/components/header";
import Footer from "@/components/landing-page/footer";
import Carousel from "@/components/ui/carousel-2";
import Quotes from "@/components/quotes";
import FAQ from "@/components/landing-page/faq";
import Facilities from "@/components/landing-page/facilities";
import BedTypes from "@/components/landing-page/bed-types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const router = useRouter();

  const carouselItems = [
    { src: "/bg.webp", alt: "Events at Wombat&apos;s", overlayText: "events" },
    {
      src: "/bg.webp",
      alt: "Rooms and Facilities",
      overlayText: "rooms & facilities",
    },
  ];

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-9999" />

      <section className="flex flex-col gap-3 min-w-screen min-h-[90vh] items-center justify-center px-6 text-center mt-20">
        <HeroSection />
      </section>

      <section className="flex flex-col items-center justify-center py-8 px-4 bg-white text-[#212529]">
        <div className="max-w-4xl text-center space-y-20">
          <h2 className="text-5xl lg:text-9xl font-bold mb-6">
            Aligarh&apos;s <br />
            City Hostels
          </h2>
          <p className="text-lg mb-8">
            We have <span className="font-semibold">private rooms</span>, we
            have <span className="font-semibold">dorms</span>, we have{" "}
            <span className="font-semibold">guest kitchens</span>, we have{" "}
            <span className="font-semibold">study environment</span>...{" "}
            <span className="font-bold">but above all: we have the vibe</span>.
            Wombat&apos;s City Hostels are the right place to{" "}
            <span className="font-semibold">
              meet people from around the world
            </span>
            , share travel stories, get in contact with locals, enjoy great food
            & drinks, and experience unforgettable moments.
          </p>
        </div>
      </section>

      {/* <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Our Locations</h2>
          <div className="relative">
            <div className="flex overflow-x-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {[
                  { name: "budapest", image: "/bg.webp" },
                  { name: "vienna", image: "/bg.webp" },
                  { name: "munich", image: "/bg.webp" },
                  { name: "london", image: "/bg.webp" },
                ].map((location, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-2">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={location.image}
                        alt={`Wombat&apos;s City Hostel ${location.name}`}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-2xl font-bold mb-2 capitalize">{location.name}</h3>
                        <p className="text-gray-600">Wombat&apos;s City Hostel {location.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-4">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full mx-1 focus:outline-none ${
                    index === activeIndex ? &apos;bg-blue-500&apos; : &apos;bg-gray-300&apos;
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section> */}

      <section className="flex flex-col lg:flex-row py-16 px-4 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-extrabold mb-8 lg:text-8xl relative">
            why Aligarh&apos;s <br className="hidden lg:block" /> City
            <span className="inline-block align-middle ml-2 absolute -top-8 right-0">
              <Image
                className="h-20 w-20 lg:h-52 lg:w-52"
                src="https://www.wombats-hostels.com/fileadmin/user_upload/Icons/big_womheart.svg"
                alt="heart icon"
                width={500}
                height={500}
              />
            </span>{" "}
            Hostels?
          </h2>
          <p className="text-lg mb-8 max-w-3xl">
            It&apos;s about more than just a bed. Wombat&apos;s is your city
            host, offering lovingly put-together breakfast variations, a WomBAR
            in each hostel with a great vibe and fantastic offerings, as well as
            events on a regular basis, including our WomBEATS concert series
            with free admission.
          </p>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3 ">
          <Carousel items={carouselItems} />
        </div>
      </section>
      
      <div className="my-8 mx-4 md:mx-10">
        <FAQ />
      </div>

      <div className="w-full flex flex-wrap items-center justify-between px-4 md:px-14 py-4 md:pb-4 pb-24 gap-4 bg-neutral-100 backdrop-blur-3xl shadow-md">
        <Footer />
      </div>
      <Button
        onClick={() => router.push("/rooms")}
        className="fixed w-full rounded-none bottom-0 md:hidden"
      >
        Book Now
      </Button>
    </>
  );
}
