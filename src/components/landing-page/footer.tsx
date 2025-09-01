import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8 px-4 rounded-3xl w-full">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start">
          <div className="mb-8 lg:mb-0">
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4">
              food & drinks
            </h2>
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4">
              rooms & facilities
            </h2>
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4">
              events
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm md:text-md lg:text-lg">
            <Link href="/gallery" className="hover:underline">
              gallery
            </Link>
            
            <Link href="/room-types" className="hover:underline">
              room types
            </Link>
            <Link href="/virtual-tour" className="hover:underline">
              virtual tour
            </Link>
            <Link href="/your-hosts" className="hover:underline">
              your hosts
            </Link>
            
            <Link href="/covid19" className="hover:underline">
              covid19 & hygiene
            </Link>
            <Link href="/blog" className="hover:underline">
              blog & news
            </Link>
          </div>

          <div className="mt-8 lg:mt-0 text-sm md:text-md lg:text-lg text-gray-300 flex md:flex-col gap-2">
            <Link href="/data-privacy" className="hover:underline">
              data privacy
            </Link>
            <Link href="/terms-of-service" className="hover:underline">
              terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
