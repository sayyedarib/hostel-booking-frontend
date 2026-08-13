"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, MoveRight } from "lucide-react";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { primaryNav } from "@/config/routes";
import { siteConfig } from "@/config/site";

export default function Header({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Close on Escape and prevent the page behind the overlay from scrolling.
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  return (
    <>
      <header
        className={cn(
          "flex items-center justify-between bg-[#FFD600] p-4 lg:px-36",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="h-10 w-10 rounded-full border-2 border-black p-2 hover:bg-black/10 lg:h-14 lg:w-14"
          >
            <Menu strokeWidth={2} className="h-6 w-6 lg:h-8 lg:w-8" />
          </Button>
          <p className="text-lg font-extrabold md:text-2xl lg:text-4xl">
            <Link href="/">{siteConfig.name}</Link>
          </p>
        </div>

        <Button
          asChild
          className="h-auto rounded-full bg-black px-4 py-3 font-bold text-[#FFD600] hover:bg-black/85 lg:px-10 lg:py-5 lg:text-2xl"
        >
          <Link href="/rooms">BOOK NOW!</Link>
        </Button>
      </header>

      {isMenuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#FFD600]"
        >
          <div className="flex items-center justify-between p-4 lg:px-36">
            <Button
              variant="ghost"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              autoFocus
              className="h-10 w-10 rounded-full border-2 border-black p-2 hover:bg-black/10"
            >
              <X strokeWidth={2} className="h-6 w-6" />
            </Button>
            <Button
              asChild
              className="h-auto rounded-full bg-black px-4 py-3 font-bold text-[#FFD600] hover:bg-black/85"
            >
              <Link href="/rooms" onClick={closeMenu}>
                BOOK NOW!
              </Link>
            </Button>
          </div>

          <nav
            aria-label="Main"
            className="flex flex-1 flex-col justify-center px-8 lg:px-36"
          >
            <ul className="space-y-2 text-2xl font-extrabold text-black">
              {primaryNav.map((route) => (
                <li key={route.path} className="py-2">
                  <Link
                    href={route.path}
                    onClick={closeMenu}
                    className="flex items-center justify-between gap-10 hover:text-white"
                  >
                    {route.label}
                    <MoveRight size={24} aria-hidden="true" />
                  </Link>
                </li>
              ))}

              <SignedIn>
                <li className="py-2">
                  <Link
                    href="/user"
                    onClick={closeMenu}
                    className="flex items-center justify-between gap-10 hover:text-white"
                  >
                    Dashboard
                    <MoveRight size={24} aria-hidden="true" />
                  </Link>
                </li>
                <li className="py-2">
                  <SignOutButton>
                    <Button className="w-full justify-between bg-black text-lg text-[#FFD600] hover:bg-black/85">
                      Sign out
                      <MoveRight size={24} aria-hidden="true" />
                    </Button>
                  </SignOutButton>
                </li>
              </SignedIn>

              <SignedOut>
                <li className="py-2">
                  <Button
                    asChild
                    className="w-full justify-between bg-black text-lg text-[#FFD600] hover:bg-black/85"
                  >
                    <Link href="/sign-in?redirect_url=/rooms" onClick={closeMenu}>
                      Sign in
                      <MoveRight size={24} aria-hidden="true" />
                    </Link>
                  </Button>
                </li>
              </SignedOut>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
