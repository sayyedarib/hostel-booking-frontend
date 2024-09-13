"use client";

import { useState, useEffect } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ShoppingCart,
  ArrowRight,
  CircleX,
  MoveRight,
} from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { getCartItemsCount } from "@/db/queries";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Header({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useQueryState(
    "cartItemsCount",
    parseAsInteger.withDefault(0),
  );

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      const { data } = await getCartItemsCount();
      setCartItemsCount(data);
    };

    fetchCartItems();
  }, []);

  return (
    <>
      <div
        className={cn(
          className,
          "flex justify-between items-center p-4 bg-[#FFD600] lg:px-36",
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={toggleMenu}
            className="p-2 border-2 border-black rounded-full h-10 w-10 lg:h-14 lg:w-14"
          >
            <Menu strokeWidth={2} size={40} />
          </Button>
          {/* <Image src="/logo.png" alt="Wombat&apos;s logo" width={50} height={40} /> */}
          <h1 className="text-lg md:text-2xl lg:text-4xl font-extrabold">
            Khan Group of PG
          </h1>
        </div>
        <Button className="font-bold px-3 py-4 lg:text-2xl lg:px-12 lg:py-8 rounded-full bg-black text-[#FFD600]">
          <Link href="/rooms">BOOK NOW!</Link>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 bottom-0 bg-[#FFD600] z-20">
          <div className="flex justify-between items-center p-4">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="text-black p-2"
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
                href="/events"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                events
              </Link>
            </li>
            <li className="py-2 w-full">
              <Link
                href="/about"
                onClick={toggleMenu}
                className="flex items-center justify-between"
              >
                about Wombat&apos;s
                <MoveRight size={24} />
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
