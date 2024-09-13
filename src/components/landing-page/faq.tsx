import Image from "next/image";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="mx-auto px-4 py-16 relative z-0">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="order-2 lg:order-1">
          <Accordion type="single" collapsible>
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-xl font-bold">
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
          <Image
            src="/faq.png"
            alt="FAQ"
            width={500}
            height={500}
            className="absolute top-0 right-8 object-cover -z-10 h-28 w-28 md:h-36 md:w-36 lg:h-60 lg:w-60"
          />
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-extrabold mb-12">
            frequently <br /> asked <br /> questions
          </h2>
          <p>
            Where do I get the best rates (here!), what is check-in time (2 pm),
            are bed sheets included (yes!), do you have safe luggage storage
            (yes!), when is the reception open (always!)...? Have a deep dive
            into Wombat&apos;s basics in our FAQ section. Of course, we are always
            happy to assist personally if you have more specific requests!
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
    answer: "Yes, guests must be at least 18 years old to make a reservation.",
  },
  {
    question: "Is breakfast included in the booking?",
    answer:
      "Breakfast is included with most of our room rates. Please check the details of your specific booking.",
  },
  {
    question: "What about group bookings?",
    answer:
      "We offer special rates and packages for group bookings. Please contact our group sales team for more information.",
  },
];
