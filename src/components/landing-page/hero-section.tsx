import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6 pb-16 pt-32 text-center md:min-h-[85vh] md:pt-36">
      <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-[#212529] md:text-5xl lg:text-6xl">
        Experience Premium PG Living <br className="hidden sm:block" /> Designed
        for Your Children&apos;s Success
      </h1>
      <p className="max-w-2xl text-lg text-gray-600 md:text-2xl">
        Your children are our responsibility. We provide a home away from home.
      </p>
      <Button
        asChild
        className="h-auto rounded-full border-4 border-black bg-primary px-11 py-5 text-xl font-semibold text-black hover:bg-primary/85 md:text-2xl"
      >
        <Link href="/rooms">Book Now</Link>
      </Button>
    </section>
  );
}
