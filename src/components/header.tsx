"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";

import { getCartItemsCount } from "@/db/queries";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export default function Header({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState<number | null>(null);

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
          "flex justify-between w-full md:w-[584px] sticky rounded-full bg-[#EDE8F5] md:left-1/2 top-2 md:top-8 z-10 md:-translate-x-1/2 items-center pl-6 pr-4 py-2 backdrop-blur-3xl shadow-md",
        )}
      >
        <Link href="/" className="font-extrabold text-2xl text-[#3D5280]">
          Khan PG
        </Link>

        <div className="hidden md:flex gap-3 items-center">
          <ul className="flex gap-4">
            <li>
              <Link href="/rooms">Rooms</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <SignedIn>
                <Link href="/cart" className="relative">
                  <ShoppingCart />
                  <span className="absolute -right-2 -top-1 bg-primary h-4 w-4 p-1 rounded-full text-sm text-white flex items-center justify-center font-extrabold">
                    {cartItemsCount}
                  </span>
                </Link>
              </SignedIn>
            </li>
          </ul>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <button onClick={toggleMenu} className="md:hidden">
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-14 left-2 right-2 bg-neutral-100/50 backdrop-blur-3xl rounded-3xl rounded-t z-20 shadow-md">
          <ul className="flex flex-col items-center py-4">
            <li className="py-2">
              <Link href="/rooms" onClick={toggleMenu}>
                Rooms
              </Link>
            </li>
            <li className="py-2">
              <Link href="/about" onClick={toggleMenu}>
                About
              </Link>
            </li>
            <li className="py-2">
              <Link href="/contact" onClick={toggleMenu}>
                Contact
              </Link>
            </li>
            <li className="py-2">
              <div className="bg-[#3D5280] px-5 py-2 rounded-full text-white font-extrabold">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
