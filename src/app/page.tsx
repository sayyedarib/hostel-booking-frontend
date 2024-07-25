import Image from "next/image";
import SearchBar from "@/components/search-bar";
import Header from "@/components/header";
import OurServices from "@/components/our-services";
import { Gallery } from "@/components/gallery";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-10 items-center">
        <section className="w-full relative min-h-screen w-100vw flex flex-col gap-10 items-start justify-center bg-neutral-100">
          <Header />
          <div className="md:w-[60%] ml-14 space-y-5">
            <h1 className="text-6xl font-extrabold text-red-500">
              Looking for a hostel?
            </h1>
            <p className="text-neutral-500">
              We have for you the cheapest and best hostel in Aligarh at your
              fingertip.
            </p>
            <Image
              width={650}
              height={650}
              src="/building.png"
              className="hidden md:block absolute bottom-0 right-0 scale-x-[-1]"
              alt="building"
            />
          </div>
          <SearchBar className="absolute left-[25%] bottom-36" />
        </section>
        <OurServices />
        <Gallery />
      </div>
    </>
  );
}
