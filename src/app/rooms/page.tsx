import { ThreeDCardDemo } from "@/components/3d-card-demo";
import Header from "@/components/header";
import SearchBar from "@/components/search-bar";

export default function Rooms() {
  return (
    <>
      <div className="flex justify-center bg-gray-100">
        <SearchBar className="fixed top-16 mb-8 z-9999" />
        <hr className="w-full h-2 text-black fixed top-40 z-1" />
        <div className="mt-44 relative flex flex-wrap gap-10 items-center justify-center -z-1">
          <ThreeDCardDemo />
          <ThreeDCardDemo />
          <ThreeDCardDemo />
          <ThreeDCardDemo />
          <ThreeDCardDemo />
          <ThreeDCardDemo />
        </div>
      </div>
    </>
  );
}
