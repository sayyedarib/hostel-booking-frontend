"use client";

import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import HeroSection from "@/components/landing-page/hero-section";
import Header from "@/components/header";
import Footer from "@/components/landing-page/footer";
import Carousel from "@/components/ui/carousel-2";
import FAQ from "@/components/landing-page/faq";

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
      <Header className="fixed top-0 left-0 right-0 z-10" />

      <section className="flex flex-col gap-3 min-w-screen min-h-[90vh] items-center justify-center px-6 text-center mt-20">
 
      <p className="text-sky-200 font-bold text-xl animate-pulse bg-stone-900 px-4 py-2 rounded-xl shadow-lg inline-block mb-4">
    <Link
      href="https://drive.google.com/drive/folders/1H-PjDk9Qu6x3JkYJ1ELCYvSD1ud_MaVC?usp=share_link" 
      target="_blank"
      rel="noopener noreferrer"
    >
     🌟 Hall of Fame, Our Proud Achievers. Click here!
    </Link>
  </p>
  
  <p className="text-yellow-400 font-bold text-xl animate-pulse bg-black px-4 py-2 rounded-xl shadow-lg inline-block mb-4">
    <Link
      href="https://forms.gle/4DJnTpds7MP1h5J48" 
      target="_blank"
      rel="noopener noreferrer"
    >
      We also provide full scholarship to deserving and meritorious students. Click here!
    </Link>
  </p>

  <p className="bg-emerald-800 text-white animate-pulse font-bold text-xl px-4 py-2 rounded-xl shadow-lg inline-block mb-4 hover:bg-emerald-600 transition">
    <Link
      href="https://tally.so/r/wvZZ9X" 
      target="_blank"
      rel="noopener noreferrer"
    >
     Click here to update your Hostel Information!
    </Link>
  </p>

  <HeroSection />
</section>


      <section className="flex flex-col items-center justify-center py-8 px-4 bg-white text-[#212529]">
        <div className="max-w-4xl text-center space-y-20">
          <h2 className="text-5xl lg:text-9xl font-bold mb-6">
            Aligarh <br />
            City&apos;s PG
          </h2>
          <p className="text-lg mb-8">
            We have <span className="font-semibold">private rooms</span>, we
            have <span className="font-semibold">dorms</span>, we have{" "}
            <span className="font-semibold">study environment</span>...{" "}
            <span className="font-bold">but above all: we have the vibe</span>.
            Khan&apos;s PG is the right place to{" "}
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
          <h2 className="text-5xl font-extrabold mb-8 lg:text-8xl text-center">
            Why Choose Khan&apos;s PG? <br className="hidden lg:block" /> 
           
           </h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-center " >
             It&apos;s about more than just a bed. Khan&apos;s PG is your city
             host, offering lovingly hostel and mess facilty,as well as
             events on a regular basis.
             <span className="block mt-1 font-extrabold text-yellow-300">We also provide optional Mess Facility<br></br>Mess charges are at additional ₹2,500/month</span> </p>
          
        </div>
        {/*<div className="w-full md:w-1/2 lg:w-1/3 ">
          <Carousel items={carouselItems} />  Remove the AI generated Carousel
    </div> */}
      </section>

      <div className="my-8 mx-4 md:mx-10">
        <FAQ />
      </div>

      <div className="w-full flex flex-col items-center justify-cetner px-4 md:px-14 py-4 md:pb-4 pb-24 gap-4 bg-neutral-100 backdrop-blur-3xl shadow-md">
        <Footer />
        <div className="mt-2 pt-2 border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image
                src="/logo.png"
                alt="Khan Group of PG Logo"
                width={100}
                height={50}
              />
            </div>
            <div className="text-sm">
              <Link href="/privacy-policy" className="mr-4 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:underline">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm mt-4 md:mt-0">
              &copy; 2024 Khan Group of PG. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
