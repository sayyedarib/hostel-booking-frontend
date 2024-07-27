"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import Header from "@/components/header";
import SearchBar from "@/components/search-bar"; // Updated import
import HeroSection from "@/components/hero-section";
import OurServices from "@/components/our-services";
import Gallery from "@/components/gallery";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";

export default function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-10 items-center"
    >
      <section className="w-full relative max-h-screen flex flex-col gap-10 items-start justify-center">
        <HeroSection />
        <SearchBar className="hidden md:flex" />
      </section>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center w-full gap-8"
      >
        <OurServices />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-full flex flex-col items-center gap-8"
      >
        <Gallery />
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

      <SearchBar className="md:hidden relative shadow-2xl border-t border-neutral-100" />
    </motion.div>
  );
}
