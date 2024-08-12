"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

let interval: any;

type Card = {
  src: string;
  name: string;
  rank: string;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative h-32 w-32">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.src}
            className="absolute bg-white h-40 w-32 rounded-3xl p-3 border border-neutral-200 flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, //  decrease z-index for the cards that are behind
            }}
          >
            <div className="flex flex-col bg-white h-full">
              <Image src={card.src} height={120} width={120} alt="" />
              <div className="p-2 overflow-hidden flex-1">
                <span className="block">{card.name}</span>
                {/* <span className="block">Rank {card.rank}</span> */}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
