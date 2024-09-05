"use client";

import { useState, useEffect } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";

import { getCartItemsCount } from "@/db/queries";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

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
    <nav className={cn(className, "bg-white shadow-md")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center justify-between flex-1 ml-6">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
            <div className="flex items-center flex-col">
              <Link href="/">
                <span className="ml-2 text-2xl font-bold text-gray-800">Khan PG</span>
              </Link>
              <span className="ml-2 text-xs text-gray-500">The Aligarh Hostel</span>
            </div>
            <div className="flex items-center space-x-4">
              <SignedIn>
                <Link href="/cart" className="relative text-gray-600 hover:text-gray-900">
                  <ShoppingCart />
                  <span className="absolute -right-2 -top-1 bg-orange-500 h-4 w-4 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-gray-600 hover:text-gray-900 font-medium">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                BOOK NOW!
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Menu */}
      {isMenuOpen && (
        <div>
          <div className="px-2 pt-2 pb-3 space-y-1 h-screen"> 
            {/* can be add background yellow if want */}
            <ul className="space-y-1">
              <li>
                <Link href="/rooms" className="text-black hover:text-white hover:bg-black block py-2 rounded-full px-9 w-2/5 min-w-fit text-base font-medium" onClick={toggleMenu}>
                  Rooms
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-black hover:text-white hover:bg-black block py-2 rounded-full px-9 w-2/5 min-w-fit text-base font-medium" onClick={toggleMenu}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-black hover:text-white hover:bg-black block py-2 rounded-full px-9 w-2/5 min-w-fit text-base font-medium" onClick={toggleMenu}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}