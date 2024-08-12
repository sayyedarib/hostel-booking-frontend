import Image from "next/image";

export default function BedTypes() {
  return (
    <section className="flex flex-col">
      <h2 className="text-4xl font-bold">Bed Types</h2>
      <p className="text-lg">
        We have a variety of bed types to suit your needs.
      </p>
      <div className="flex">
        <div className="flex flex-col w-1/2">2 Seater Room</div>
        <div className="flex w-1/2 justify-end">
          <Image
            src="/images/bed-types.png"
            width={400}
            height={400}
            alt="Bed Types"
          />
        </div>
      </div>
    </section>
  );
}
