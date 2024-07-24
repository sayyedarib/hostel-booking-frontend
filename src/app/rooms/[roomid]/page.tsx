import Image from "next/image";
import { Share } from "lucide-react";
import BedReservationCard from "@/components/bed-reservation-card";

export default function Room({ params }: { params: { roomid: string } }) {
  return (
    <div className="w-2/3 flex justify-center mx-auto">
      <div className="mt-32 border-t-2 border-neutral-600 p-2 space-y-4">
        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-2 rounded-xl">
          <Image
            height={2000}
            width={2000}
            src="/bg.jpg"
            className="md:col-span-2 md:row-span-2"
            alt=""
          />
          <Image height={2000} width={2000} src="/bg.jpg" alt="" />
          <Image height={2000} width={2000} src="/bg.jpg" alt="" />
          <Image height={2000} width={2000} src="/bg.jpg" alt="" />
          <Image height={2000} width={2000} src="/bg.jpg" alt="" />
        </div>
        <div className="flex justify-between">
          <span className="text-3xl">Room 66</span>
          <Share />
        </div>

        <div className="flex w-full gap-2">
          <span className="w-2/3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit
            esse ipsam suscipit voluptates eveniet placeat exercitationem
            distinctio porro saepe accusantium nobis, quam eaque debitis
            provident, adipisci ad! Nam natus quasi accusamus ipsam itaque,
            debitis a! Illo veniam maxime voluptatem suscipit iure quam quas
            architecto aspernatur temporibus amet, voluptatibus officia
            voluptatum obcaecati odit provident? Consequatur error ut omnis
            repudiandae neque? Minus sequi delectus vero molestias quas, minima
            dolore maxime excepturi, modi cupiditate mollitia quis dolor quod
            sit nam magni praesentium quibusdam eveniet ut nesciunt tempore
            commodi quia. Nihil non natus recusandae similique aperiam, quaerat
            quidem possimus! Repellat eius odit autem magnam?
          </span>

          <BedReservationCard className="w-1/3" />
        </div>
      </div>
    </div>
  );
}
