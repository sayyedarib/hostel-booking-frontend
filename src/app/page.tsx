"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import HeroSection from "@/components/landing-page/hero-section";
import OurServices from "@/components/landing-page/our-services";
import Gallery from "@/components/landing-page/gallery";
import Testimonials from "@/components/landing-page/testimonials";
import Footer from "@/components/landing-page/footer";
import Quotes from "@/components/quotes";
import FAQ from "@/components/landing-page/faq";
import Facilities from "@/components/landing-page/facilities";
import BedTypes from "@/components/landing-page/bed-types";

export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <>
      <section className="flex flex-col gap-3 min-w-screen min-h-[90vh] items-center justify-center px-6 text-center">
        <HeroSection />
      </section>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="w-full h-[50vh]"
      >
        <Quotes text="test" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-full bg-[#EDE8F5]/50 min-h-[70vh]"
      >
        <Facilities />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-full min-h-[70vh]"
      >
        <BedTypes />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <FAQ />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-full"
      >
        <Testimonials />
      </motion.div>

      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="w-full flex flex-wrap items-center justify-between px-4 md:px-14 py-4 md:pb-4 pb-24 gap-4 bg-neutral-100 backdrop-blur-3xl shadow-md"
      >
        <Footer />
      </motion.footer>
      <Button className="fixed bg-black w-full rounded-none bottom-0 md:hidden">
        Book Now
      </Button>
    </>
  );
}
