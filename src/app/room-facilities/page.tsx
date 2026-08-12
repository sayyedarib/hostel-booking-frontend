import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, MoveRight, ShieldCheck } from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/landing-page/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { facilities, roomTypes } from "@/config/facilities";
import { siteConfig } from "@/config/site";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Rooms & Facilities",
  description:
    "Double, triple and four-sharing rooms in Aligarh with 24/7 power backup, Wi-Fi, in-house meals, purified water, CCTV and daily housekeeping. Separate accommodation for girls.",
  alternates: { canonical: "/room-facilities" },
};

export default function RoomFacilitiesPage() {
  return (
    <>
      <Header className="fixed left-0 right-0 top-0 z-30" />

      <main id="main-content">
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
          <Image
            src="/img/rooms/Room_6_1.jpeg"
            alt="A furnished shared room at Khan Group of PG"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative px-6 pt-20 text-center text-white">
            <h1 className="text-4xl font-extrabold md:text-6xl">
              Rooms &amp; Facilities
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl">
              Furnished rooms built around one thing: giving students a clean,
              safe place to live and the quiet they need to study.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-[#212529] md:text-5xl">
              A home that works like one
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Rent covers the bed, the electricity, the water, the cleaning and
              the Wi-Fi — no surprise bills at the end of the month. Parents get
              a warden on site and CCTV on every entrance; residents get a desk
              of their own and floors that stay quiet during exam season.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="facilities-heading"
          className="bg-[#f3f3f0] px-4 py-16 md:px-10 md:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              id="facilities-heading"
              className="mb-12 text-center text-3xl font-bold text-[#212529] md:text-4xl"
            >
              What&apos;s included
            </h2>
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility) => (
                <li
                  key={facility.title}
                  className="flex flex-col items-start gap-3 rounded-2xl bg-white p-6 shadow-sm"
                >
                  <span className="rounded-xl bg-primary/20 p-3">
                    <facility.icon
                      className="h-6 w-6 text-black"
                      aria-hidden="true"
                      strokeWidth={1.75}
                    />
                  </span>
                  <h3 className="text-lg font-bold">{facility.title}</h3>
                  <p className="text-gray-700">{facility.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="room-types-heading"
          className="px-4 py-16 md:px-10 md:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              id="room-types-heading"
              className="mb-12 text-center text-3xl font-bold text-[#212529] md:text-4xl"
            >
              Room types
            </h2>

            <div className="flex flex-col gap-16">
              {roomTypes.map((room, index) => (
                <article
                  key={room.name}
                  className={`grid items-center gap-8 lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:[&>figure]:order-2" : ""
                  }`}
                >
                  <figure className="m-0">
                    <Image
                      src={room.image}
                      alt={`${room.name} room at ${siteConfig.name}`}
                      width={800}
                      height={600}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-auto w-full rounded-2xl object-cover"
                    />
                  </figure>
                  <div>
                    <p className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-sm font-bold">
                      {room.sharing}
                    </p>
                    <h3 className="mb-3 text-3xl font-black text-[#212529]">
                      {room.name}
                    </h3>
                    <p className="mb-5 text-lg text-gray-700">
                      {room.description}
                    </p>
                    <ul className="space-y-2">
                      {room.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check
                            className="mt-1 h-4 w-4 shrink-0 text-green-600"
                            aria-hidden="true"
                          />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-16 text-white md:px-10 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                For parents
              </span>
              <h2 className="mb-5 text-3xl font-bold md:text-5xl">
                Separate, secured accommodation for girls
              </h2>
              <p className="text-lg text-gray-200">
                Girls are housed in a dedicated building with its own entrance,
                a female warden on site, CCTV coverage and visitor logging at
                the gate. Parents are welcome to visit the property before
                booking — we would rather you saw it in person.
              </p>
              <Button
                asChild
                className="mt-8 h-auto rounded-full px-8 py-3 text-base font-bold"
              >
                <Link href="/contact">
                  Arrange a visit
                  <MoveRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <Image
              src="/img/rooms/room2.webp"
              alt="Room in the girls' building"
              width={800}
              height={600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-auto w-full rounded-2xl object-cover"
            />
          </div>
        </section>

        <section className="px-4 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#f3f3f0]">
            <div className="grid items-center gap-8 p-8 md:p-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 text-3xl font-black text-[#212529] md:text-4xl">
                  Booking for a group?
                </h2>
                <p className="mb-6 text-lg text-gray-700">
                  Four or more friends sharing a floor get a discounted monthly
                  rate. Tell us your dates and group size and we will put
                  together a quote.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="h-auto rounded-full px-8 py-3 text-base font-bold"
                  >
                    <Link href="/rooms">See available rooms</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto rounded-full border-2 border-black px-8 py-3 text-base font-bold"
                  >
                    <Link href="/contact">Talk to us</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/img/rooms/Room_7_1.jpeg"
                alt="Residents studying together in a shared room"
                width={800}
                height={600}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Rooms & Facilities", path: "/room-facilities" },
        ])}
      />
    </>
  );
}
