import Image from "next/image";

const bedTypes = [
  {
    name: "Double Bed",
    src: "/img/rooms/room9.jpg",
    description:
      "A room with a double bed for two people. A room with a double bed for two people. A room with a double bed for two people.",
  },
  {
    name: "Triple Bed",
    src: "/img/rooms/room8.jpg",
    description: "A room with a triple bed for three people.",
  },
];

export default function BedTypes() {
  return (
    <section className="flex flex-col items-center py-12 ">
      <h2 className="text-2xl md:text-4xl lg:text-6xl font-extrabold mb-6 text-primary">
        Bed Variants
      </h2>
      <p className="text-lg mb-8 text-center max-w-2xl">
        We have a variety of bed types to suit your needs. Choose the one that
        fits you best.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:w-2/3">
        {bedTypes.map((bedType, index) => (
          <div
            key={bedType.name}
            className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? "md:flex-row-reverse" : ""} gap-8`}
          >
            <Image
              src={bedType.src}
              height={1000}
              width={1000}
              alt={bedType.name}
              className="rounded-xl h-[50vh] w-[80vh] mb-4 md:mb-0"
            />
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-5xl font-bold text-primary mb-2">
                {bedType.name}
              </h3>
              <p className="text-sm text-gray-600 text-center md:text-left">
                {bedType.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
