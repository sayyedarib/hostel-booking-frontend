"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, CircleX, MoveRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignOutButton } from "@clerk/nextjs";

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
          isMenuOpen ? "fixed top-0 left-0 right-0 z-50" : ""
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
        <Button className="font-bold px-3 py-4 lg:text-2xl lg:px-12 lg:py-8 rounded-full bg-black text-[#FFD600] hover:bg-black/85">
          <Link href="/rooms">BOOK NOW!</Link>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={cn(
            "fixed top-0 left-0 right-0 bottom-0 bg-[#FFD600] z-40 flex flex-col justify-center items-center",
            isMenuOpen ? "block" : "hidden"
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
          <ul className="flex flex-col items-start py-4 px-8 lg:px-36 text-2xl space-y-2 font-extrabold text-black">
            <li className="py-2">
              <Link
                href="/rooms"
                onClick={toggleMenu}
                className="flex items-center justify-between gap-10 hover:text-white"
              >
                Rooms
                <MoveRight size={24} />
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/room-facilities"
                onClick={toggleMenu}
                className="flex items-center justify-between gap-10 hover:text-white"
              >
                Room Facilties
                <MoveRight size={24} />
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/about"
                onClick={toggleMenu}
                className="flex items-center justify-between gap-10 hover:text-white"
              >
                About
                <MoveRight size={24} />
              </Link>
            </li>
            <li className="py-2">
              <Link
                href="/contact"
                onClick={toggleMenu}
                className="flex items-center justify-between gap-10 hover:text-white"
              >
                Contact
                <MoveRight size={24} />
              </Link>
            </li>

            {/* signin */}
            <SignedOut>
              <li className="py-2">
                <Link
                  href="/sign-in?redirect_url=/rooms"
                  className="flex items-center justify-between  bg-black text-yellow-400 text-lg gap-10 px-2 py-2 rounded-lg"
                >
                  sign in
                  <MoveRight size={24} />
                </Link>
              </li>
            </SignedOut>

            {/* signout */}
            <li className="py-2">
              <SignedIn>
                <Link
                  href="/user"
                  className="flex items-center justify-between gap-10 hover:text-white"
                >
                  Dashboard
                  <MoveRight size={24} />
                </Link>
              </SignedIn>
            </li>

            <li className="py-2">
              <SignedIn>
                <SignOutButton>
                  <Button
                    className="flex items-center justify-between w-full bg-black text-yellow-400 text-lg"
                    variant="ghost"
                  >
                    Sign out
                  </Button>
                </SignOutButton>
              </SignedIn>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
