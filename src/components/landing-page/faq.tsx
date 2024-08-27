import { useState } from "react";

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="py-24 px-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
      <div className="flex flex-col text-left basis-1/2">
        <p className="text-3xl md:text-4xl lg:text-6xl font-extrabold text-base-content">
          Frequently Asked Questions
        </p>
      </div>
      <ul className="basis-1/2">
        {faqData.map((faq, index) => (
          <li key={index}>
            <button
              className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
              aria-expanded={expandedIndex === index}
              onClick={() => toggleFAQ(index)}
            >
              <span className="flex-1 text-base-content">{faq.question}</span>
              <svg
                className="flex-shrink-0 w-4 h-4 ml-auto fill-current"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  y="7"
                  width="16"
                  height="2"
                  rx="1"
                  className={`transform origin-center transition duration-200 ease-out ${expandedIndex === index ? "rotate-90" : ""}`}
                ></rect>
                <rect
                  y="7"
                  width="16"
                  height="2"
                  rx="1"
                  className={`transform origin-center rotate-90 transition duration-200 ease-out ${expandedIndex === index ? "rotate-0" : ""}`}
                ></rect>
              </svg>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedIndex === index ? "max-h-screen" : "max-h-0"}`}
              style={{ maxHeight: expandedIndex === index ? "1000px" : "0" }}
            >
              <div className="pb-5 leading-relaxed">
                <div className="space-y-2 leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const faqData = [
  {
    question: "How to book beds?",
    answer:
      "Just click on the 'Book Now' or click on rooms in navbar. Add your desired beds into the cart. Click on 'Go to Cart' and proceed with the payment.",
  },
  {
    question: "Is there requirement of any document to book bed?",
    answer:
      "Yes, you need to provide a photo of valid ID proof while adding bed into the cart.",
  },
  {
    question: "Can I book more then one bed at a time?",
    answer:
      "Yes, you can book multiple beds at a time. Just add them into the cart and proceed with the payment.",
  },
  {
    question: "what is security deposit?",
    answer:
      "Security deposit is the amount which you need to pay while booking the bed. This amount will be refunded to you after you leave the hostel with the deduction of any damages if you have done.",
  },
  {
    question: "Can I smoke or drink?",
    answer:
      "Smoking and drinking is not allowed in the hostel premises. If you are found doing so, you will be fined.",
  },
];
