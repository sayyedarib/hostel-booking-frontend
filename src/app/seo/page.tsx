import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/header";
import Footer from "@/components/landing-page/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { facilities } from "@/config/facilities";
import { faqs } from "@/config/faq";
import { siteConfig } from "@/config/site";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Hostel in Aligarh — Rent, Room Types and Amenities",
  description:
    "What it costs to live at a PG in Aligarh, what is included, and answers to the questions students and parents ask most. Rooms from ₹4,500 per month near AMU.",
  alternates: { canonical: "/seo" },
};

const { pricing } = siteConfig;

const roomOptions = [
  { sharing: "Double sharing", detail: "Two residents, the quietest option" },
  { sharing: "Triple sharing", detail: "Three residents, our most popular" },
  { sharing: "Four & six sharing", detail: "The most economical choice" },
];

export default function GuidePage() {
  return (
    <>
      <Header className="fixed left-0 right-0 top-0 z-30" />

      <main id="main-content" className="bg-white px-4 pb-16 pt-28 md:pt-36">
        <article className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-extrabold text-[#212529] md:text-4xl">
            Living at a hostel in Aligarh: rent, rooms and what&apos;s included
          </h1>
          <p className="mb-10 text-lg text-gray-700">
            {siteConfig.legalName} has housed students in Shamshad Market since
            2019, a short walk from Aligarh Muslim University. This page answers
            what it costs, what you get, and the questions parents ask us most
            often before booking.
          </p>

          <section aria-labelledby="rent" className="mb-10">
            <h2
              id="rent"
              className="mb-3 text-2xl font-bold text-[#212529] md:text-3xl"
            >
              What it costs
            </h2>
            <p className="mb-4 text-gray-700">
              Rent starts at{" "}
              <strong>
                ₹{pricing.monthlyFrom.toLocaleString("en-IN")} per month
              </strong>{" "}
              or <strong>₹{pricing.dailyFrom} per day</strong>, depending on how
              many residents share the room. That covers the bed, electricity
              with backup, water, Wi-Fi and daily housekeeping — meals are an
              add-on tiffin service. Only the first month is payable in advance.
            </p>
            <ul className="space-y-2">
              {roomOptions.map((option) => (
                <li key={option.sharing} className="flex gap-2 text-gray-700">
                  <span className="font-semibold">{option.sharing}:</span>
                  <span>{option.detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="amenities" className="mb-10">
            <h2
              id="amenities"
              className="mb-3 text-2xl font-bold text-[#212529] md:text-3xl"
            >
              What&apos;s included
            </h2>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {facilities.map((facility) => (
                <li key={facility.title} className="flex gap-2 text-gray-700">
                  <span aria-hidden="true">•</span>
                  {facility.title}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="study" className="mb-10">
            <h2
              id="study"
              className="mb-3 text-2xl font-bold text-[#212529] md:text-3xl"
            >
              Built around studying
            </h2>
            <p className="text-gray-700">
              Residents here have gone on to clear <strong>AMUEEE</strong>,{" "}
              <strong>NEET</strong>, <strong>JEE Main</strong> and{" "}
              <strong>JEE Advanced</strong>. That is not an accident of the
              building — it comes from quiet floors during exam season, a desk
              and reading light for every resident, and power backup so a cut
              does not end a study session.
            </p>
          </section>

          <section aria-labelledby="girls" className="mb-10">
            <h2
              id="girls"
              className="mb-3 text-2xl font-bold text-[#212529] md:text-3xl"
            >
              Accommodation for girls
            </h2>
            <p className="text-gray-700">
              Girls are housed in a separate building with its own entrance, a
              female warden on site, CCTV coverage and visitor logging at the
              gate. Parents are welcome to visit and see it before booking.
            </p>
          </section>

          <section aria-labelledby="faq" className="mb-10">
            <h2
              id="faq"
              className="mb-4 text-2xl font-bold text-[#212529] md:text-3xl"
            >
              Frequently asked questions
            </h2>
            <dl className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-[#212529]">
                    {faq.question}
                  </dt>
                  <dd className="mt-1 text-gray-700">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl bg-[#f3f3f0] p-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-[#212529]">
              Ready to have a look?
            </h2>
            <p className="mb-6 text-gray-700">
              Check which beds are free right now, or arrange a visit and see
              the place in person.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="h-auto rounded-full px-8 py-3 font-bold"
              >
                <Link href="/rooms">See available rooms</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto rounded-full border-2 border-black px-8 py-3 font-bold"
              >
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </section>
        </article>
      </main>

      <Footer />
      <JsonLd
        data={[
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Hostel in Aligarh: rent and amenities", path: "/seo" },
          ]),
        ]}
      />
    </>
  );
}
