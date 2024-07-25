import Image from "next/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export default function ServiceCard({
  title,
  icon,
  description,
}: {
  title: string;
  icon: string;
  description: string;
}) {
  return (
    <>
      <CardContainer className="w-[350px] -my-14">
        <CardBody className="relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl border">
          <CardItem translateZ="100" translateY="-25" className="mx-auto">
            <Image
              width={200}
              height={200}
              src={icon}
              alt={title}
              className="h-64 w-full object-cover rounded-xl"
            />
          </CardItem>
          <CardItem
            translate={20}
            className="px-4 py-2 rounded-xl text-s font-normal dark:text-white flex items-center"
          >
            {title}
          </CardItem>
          <CardItem
            translate={20}
            className="px-4 py-2 flex items-center gap-2 text-neutral-500 dark:text-white w-[350px]"
          >
            {description}
          </CardItem>
        </CardBody>
      </CardContainer>
    </>
  );
}
