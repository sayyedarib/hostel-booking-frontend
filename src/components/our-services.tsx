import { services } from "@/constant";
import ServiceCard from "./service-card";

export default function OurServices() {
  return (
    <>
      <div className="relative flex flex-col items-center w-full gap-8">
        <h3 className="text-2xl md:text-6xl text-red-500">
          What we have for you...
        </h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 mx-auto lg:w-2/3 w-full">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              icon={service.icon}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </>
  );
}
