"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, CircleX, MoveRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Header({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div
        className={cn(
          className,
          "flex justify-between items-center p-4 bg-[#FFD600] lg:px-36",
          isMenuOpen ? "fixed top-0 left-0 right-0 z-50" : "",
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={toggleMenu}
            className="p-2 border-2 border-black rounded-full h-10 w-10 lg:h-14 lg:w-14 hover:bg-transparent"
          >
            <Menu strokeWidth={2} size={40} />
          </Button>
          {/* <Image src="/logo.png" alt="Wombat&apos;s logo" width={50} height={40} /> */}
          <h1 className="text-lg md:text-2xl lg:text-4xl font-extrabold">
            <Link href="/">Khan Group of PG</Link>
          </h1>
        </div>
        <Button className="font-bold px-3 py-4 lg:text-2xl lg:px-12 lg:py-8 rounded-full bg-black text-[#FFD600]">
          <Link href="/rooms">BOOK NOW!</Link>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={cn(
            "fixed top-0 left-0 right-0 bottom-0 bg-[#FFD600] z-40 flex flex-col justify-center items-center",
            isMenuOpen ? "block" : "hidden",
          )}
        >
          <div className="flex justify-between items-center p-4">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="text-black p-2 hover:bg-transparent"
            >
              <CircleX strokeWidth={1} size={48} />
            </Button>
            <Image src="/logo.png" alt="Wombat's logo" width={50} height={40} />
            <Button
              variant="outline"
              className="px-4 py-5 rounded-full bg-transparent border-white text-white border-2 font-extrabold"
            >
              BOOK NOW!
            </Button>
          </div>
          <ul className="flex flex-col items-start py-4 px-8 text-2xl space-y-2 font-extrabold text-black">
            <li className="py-2 w-full">
              <Link
                href="/rooms"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                booking
                <MoveRight size={24} />
              </Link>
            </li>
            <li className="py-2 w-full">
              <Link
                href="/locations"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                locations
                <MoveRight size={24} />
              </Link>
            </li>
            <li className="py-2 w-full">
              <Link
                href="/rooms-and-facilities"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                rooms & facilities
              </Link>
            </li>
            <li className="py-2 w-full">
              <Link
                href="/food-and-drinks"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                food & drinks
              </Link>
            </li>
            <li className="py-2 w-full">
              <Link
                href="/about"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                about Aligarh&apos;s
                <MoveRight size={24} />
              </Link>
            </li>
            <li className="py-2 w-full">
              <Link
                href="/contact"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                events
              </Link>
            </li>
            {/* signin */}
            <li className="py-2 w-full">
              <SignedOut>
                <Link
                  href="/sign-in?redirect_url=https://aligarhhostel.com/rooms"
                  className="flex items-center justify-between"
                >
                  sign in
                </Link>
              </SignedOut>
            </li>

            {/* signout */}
            <li className="py-2 w-full">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
