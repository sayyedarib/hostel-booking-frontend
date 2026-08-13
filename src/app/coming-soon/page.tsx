import type { Metadata } from "next";
import Link from "next/link";
import { Hammer } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Coming soon",
  robots: { index: false, follow: false },
};

export default function ComingSoon() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <Hammer
        className="h-14 w-14 text-gray-400"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <h1 className="text-4xl font-extrabold md:text-6xl">Coming soon</h1>
      <p className="max-w-md text-gray-600">
        We are still building this page. In the meantime, you can browse live
        room availability.
      </p>
      <Button asChild className="mt-2 rounded-full px-8">
        <Link href="/rooms">See available rooms</Link>
      </Button>
    </main>
  );
}
