import type { Metadata } from "next";

import Header from "@/components/header";
import HeroSection from "@/components/landing-page/hero-section";
import FAQ from "@/components/landing-page/faq";
import Footer from "@/components/landing-page/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/config/faq";
import { siteConfig } from "@/config/site";
import { faqSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Hostel & PG in Aligarh — Furnished Rooms Near AMU",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

const highlights = [
  {
    title: "Private rooms & shared dorms",
    body: "Two, three and four-sharing rooms with sturdy bunk beds, personal storage and a study desk for every resident.",
  },
  {
    title: "Built for studying",
    body: "Quiet floors, 24/7 power backup and dedicated study areas — the environment that has produced AMUEEE, NEET and JEE toppers.",
  },
  {
    title: "Everything included",
    body: "Wi-Fi, purified drinking water, daily room cleaning, laundry and in-house hygienic meals, all covered in one predictable monthly rent.",
  },
];

export default function Home() {
  return (
    <>
      <Header className="fixed left-0 right-0 top-0 z-30" />

      <main id="main-content">
        <HeroSection />

        <section className="bg-white px-4 py-16 text-[#212529] md:py-24">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="text-5xl font-bold lg:text-8xl">
              Aligarh <br /> City&apos;s PG
            </h2>
            <p className="text-lg leading-relaxed">
              We have <span className="font-semibold">private rooms</span>, we
              have <span className="font-semibold">shared dorms</span>, we have
              a <span className="font-semibold">study environment</span>
              &nbsp;&mdash;{" "}
              <span className="font-bold">but above all: we have the vibe</span>
              . Khan&apos;s PG is where students from across the country live,
              study together and actually enjoy the years they spend in Aligarh.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="why-heading"
          className="bg-black px-4 py-16 text-white md:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              id="why-heading"
              className="mb-6 text-center text-5xl font-extrabold lg:text-7xl"
            >
              Why Khan&apos;s PG?
            </h2>
            <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-gray-200">
              It&apos;s about more than just a bed. We look after the daily
              details — meals, cleaning, safety and power — so residents can put
              their energy into their studies.
            </p>

            <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {highlights.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-white/15 bg-white/5 p-6"
                >
                  <h3 className="mb-3 text-xl font-bold text-primary">
                    {item.title}
                  </h3>
                  <p className="text-gray-200">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />
      <JsonLd data={faqSchema(faqs)} />
    </>
  );
}
