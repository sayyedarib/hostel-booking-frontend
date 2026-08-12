export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Shared FAQ content. Rendered by the landing page accordion and emitted as
 * FAQPage structured data, so both stay in sync automatically.
 */
export const faqs: FaqEntry[] = [
  {
    question: "How do I make a reservation?",
    answer:
      "Browse the Rooms page to see live availability, add a bed to your cart and complete the booking form. Our team confirms your reservation over a call or WhatsApp within 24 hours.",
  },
  {
    question: "Is there a minimum age restriction?",
    answer:
      "Yes. Residents must be at least 12 years old. Guests under 18 need a parent or guardian to sign the accommodation agreement.",
  },
  {
    question: "What does the rent include?",
    answer:
      "Rent covers a furnished bed, electricity with 24/7 backup, Wi-Fi, purified drinking water, room cleaning and access to the shared study areas. Meals are available as an add-on tiffin service.",
  },
  {
    question: "Do you have separate accommodation for girls?",
    answer:
      "Yes. Girls are housed in dedicated rooms in a separate building with its own entrance, CCTV coverage and a female warden on site.",
  },
  {
    question: "What about group bookings?",
    answer:
      "We offer discounted rates for groups of four or more sharing a floor. Contact us with your dates and group size and we will put together a quote.",
  },
  {
    question: "What documents do I need to check in?",
    answer:
      "A government photo ID (Aadhaar, passport or driving licence) for the resident, a parent or guardian ID, and two passport-size photographs.",
  },
];
