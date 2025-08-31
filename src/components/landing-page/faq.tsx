import Image from "next/image";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="mx-auto px-4 md:px-20 py-16 relative z-0">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className="order-2 lg:order-1">
          <Accordion type="single" collapsible>
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-md lg:text-xl md:text-lg text-left lg:font-bold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm lg:text-lg text-gray-700">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="order-1 lg:order-2">
         
          <h2 className="text-4xl text-[#212529] md:text-6xl lg:text-8xl font-extrabold mb-12">
            frequently <br /> asked <br /> questions
          </h2>
          <p>
            Where do I get the best rates (here!) do you have safe luggage storage
            (yes!), Have a deep dive into Wombat&apos;s basics in our FAQ section. Of course, we are
            always happy to assist personally if you have more specific
            requests!
          </p>
        </div>
      </div>
      <div className="text-center mt-12">
        <button className="bg-yellow-400 text-black text-lg font-bold px-8 py-3 rounded-full">
          Show more
        </button>
      </div>
    </div>
  );
}

const faqData = [
  {
    question: "How do I make a reservation?",
    answer:
      "You can make a reservation through our website or by contacting our reservations team directly.",
  },
  {
    question: "Is there a minimum age restriction?",
    answer: "Yes, the canditdate must be at least 12 years old to make a reservation",
  },
  
  {
    question: "What about group bookings?",
    answer:
      "We offer special rates and packages for group bookings. Please contact our group sales team for more information.",
  },
];
