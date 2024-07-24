"use client";

import Image from "next/image";
import React from "react";
import {
  IndianRupee,
  Star,
  BedSingle,
  ShowerHead,
  Fan,
  Wifi,
} from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";

export function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl border">
        <CardItem translateZ="100" className="w-full">
          <Image
            src="/bg.jpg"
            height="1000"
            width="1000"
            className="h-64 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex justify-between items-center py-1 px-2">
          <CardItem
            translateZ={0}
            as={Link}
            href="https://twitter.com/mannupaaji"
            target="__blank"
            className="px-4 py-2 rounded-xl text-s font-normal dark:text-white flex items-center"
          >
            Room C4-66
          </CardItem>
          <CardItem
            translateZ={0}
            as="button"
            className="px-4 py-2 flex items-center gap-2"
          >
            <Star fill="" size={14} /> 4.2
          </CardItem>
        </div>
        <CardItem
          translateZ={0}
          as="button"
          className="px-4 py-2 flex items-center gap-2 text-neutral-500 dark:text-white"
        >
          <span className="flex">
            <BedSingle />4 beds
          </span>
          <ShowerHead />
          <Fan />
          <Wifi />
        </CardItem>
        <CardItem
          translateZ={0}
          as={Link}
          href="https://twitter.com/mannupaaji"
          target="__blank"
          className="px-4 py-2 rounded-xl text-s font-normal dark:text-white flex items-center"
        >
          <IndianRupee size={16} /> 399/bed/night
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
