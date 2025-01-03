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
      <CardContainer className="w-[300px] max-w-full -my-16 lg:-my-14">
        <CardBody className="relative group/card  dark:hover:shadow-2xl min-w-full w-auto sm:w-[30rem] h-auto rounded-xl border">
          <CardItem translateZ="100" translateY="-25" className="mx-auto">
            <Image
              width={200}
              height={200}
              src={icon}
              alt={title}
              className="h-60 w-full object-cover rounded-xl"
            />
          </CardItem>
          <CardItem
            translateZ={20}
            className="px-4 py-2 rounded-xl text-s font-normal flex items-center w-full justify-center"
          >
            {title}
          </CardItem>
          {/* <CardItem
            translate={20}
            className="px-4 py-2 flex items-center gap-2 text-neutral-500 w-[350px]"
          >
            {description}
          </CardItem> */}
        </CardBody>
      </CardContainer>
    </>
  );
}
