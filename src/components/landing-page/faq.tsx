"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/config/faq";

const COLLAPSED_COUNT = 3;

export default function FAQ() {
  const [expanded, setExpanded] = useState(false);
  const canExpand = faqs.length > COLLAPSED_COUNT;
  const visibleFaqs = expanded ? faqs : faqs.slice(0, COLLAPSED_COUNT);

  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto px-4 py-16 md:px-20"
    >
      <div className="mx-auto grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="order-1">
          <h2
            id="faq-heading"
            className="mb-6 text-4xl font-extrabold text-[#212529] md:text-6xl lg:text-7xl"
          >
            frequently <br /> asked <br /> questions
          </h2>
          <p className="text-base text-gray-700 md:text-lg">
            Everything you need to know about rooms, rent and moving in. Still
            unsure? We are always happy to help with anything more specific.
          </p>
        </div>

        <div className="order-2">
          <Accordion type="single" collapsible className="w-full">
            {visibleFaqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-left text-base font-semibold md:text-lg lg:text-xl">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-700 lg:text-base">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {canExpand && (
            <div className="mt-8 text-center lg:text-left">
              <Button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="rounded-full bg-primary px-8 py-3 text-base font-bold text-black hover:bg-primary/85"
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
