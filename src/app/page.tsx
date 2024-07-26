import Image from "next/image";
import SearchBar from "@/components/search-bar";
import Header from "@/components/header";
import OurServices from "@/components/our-services";
import { Gallery } from "@/components/gallery";
import { Testimonials } from "@/components/testimonials";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-10 items-center">
        <section className="w-full relative min-h-screen w-100vw flex flex-col gap-10 items-start justify-center bg-green-100">
          <Header />
          <div className="md:w-[60%] ml-4 lg:ml-14 space-y-5 relative z-10">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-red-500">
              Looking for a hostel?
            </h1>
            <p className="text-gray-700 text-xl">
              We have for you the cheapest and best hostel in Aligarh at your
              fingertip.
            </p>
          </div>
          <Image
            width={650}
            height={650}
            src="/building.png"
            className="absolute bottom-0 right-0 scale-x-[-1]"
            alt="building"
          />
          <SearchBar className="absolute lg:last:left-[25%] bottom-36 z-10" />
        </section>
        <OurServices />
        <Gallery />
        <Testimonials />
        <Footer />
      </div>
    </>
  );
}
