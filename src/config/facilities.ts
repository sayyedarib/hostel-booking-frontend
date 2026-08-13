import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bus,
  Camera,
  Droplets,
  Fan,
  Refrigerator,
  ShieldCheck,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Wifi,
  Zap,
} from "lucide-react";

export interface Facility {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * What the property actually provides.
 *
 * The previous list was copied verbatim from the design reference — a European
 * backpacker hostel — and advertised luggage storage, a guest kitchen, towel
 * rental, a bar and "50 international HOSCARS awards", none of which apply to a
 * student PG in Aligarh.
 */
export const facilities: Facility[] = [
  {
    title: "24/7 Electricity",
    description:
      "Inverter and generator backup on every floor, so studying never stops for a power cut.",
    icon: Zap,
  },
  {
    title: "High-Speed Wi-Fi",
    description:
      "Unlimited broadband across all buildings, sized for video lectures and online tests.",
    icon: Wifi,
  },
  {
    title: "In-House Meals",
    description:
      "Fresh vegetarian and non-vegetarian tiffin prepared on site, served hot three times a day.",
    icon: UtensilsCrossed,
  },
  {
    title: "Purified Drinking Water",
    description:
      "RO water plants on every floor, serviced regularly and tested for safety.",
    icon: Droplets,
  },
  {
    title: "CCTV Surveillance",
    description:
      "Cameras on entrances, corridors and stairwells, monitored round the clock.",
    icon: Camera,
  },
  {
    title: "Dedicated Study Space",
    description:
      "A study desk and reading light for every resident, plus quiet common areas for group revision.",
    icon: BookOpen,
  },
  {
    title: "Daily Housekeeping",
    description:
      "Rooms, bathrooms and common areas cleaned every day by our in-house staff.",
    icon: Sparkles,
  },
  {
    title: "Laundry Service",
    description:
      "Weekly laundry pickup and delivery, with washing machines available for daily use.",
    icon: Shirt,
  },
  {
    title: "Air Cooler in Every Room",
    description:
      "Coolers fitted as standard for the Aligarh summer, with fans and cross-ventilation.",
    icon: Fan,
  },
  {
    title: "Secure Storage",
    description:
      "A lockable cupboard for every resident to keep documents, laptops and valuables safe.",
    icon: ShieldCheck,
  },
  {
    title: "Refrigerator Access",
    description:
      "Shared fridge on each floor for keeping food, medicines and cold drinks.",
    icon: Refrigerator,
  },
  {
    title: "Walking Distance to AMU",
    description:
      "Minutes from Shamshad Market and the university, with autos and buses at the gate.",
    icon: Bus,
  },
];

export interface RoomType {
  name: string;
  sharing: string;
  description: string;
  features: string[];
  image: string;
}

export const roomTypes: RoomType[] = [
  {
    name: "Double Sharing",
    sharing: "2 residents",
    description:
      "The quietest option, for residents preparing for competitive exams who need space to concentrate.",
    features: [
      "Two single beds with mattress and bedding",
      "A study desk and chair each",
      "Personal lockable cupboard",
      "Air cooler and ceiling fan",
    ],
    image: "/img/rooms/Room_7_1.jpeg",
  },
  {
    name: "Triple Sharing",
    sharing: "3 residents",
    description:
      "Our most popular room: a balance of company, study space and affordable monthly rent.",
    features: [
      "Sturdy wooden bunk beds with bedding",
      "Individual study desk and reading light",
      "Personal lockable cupboard",
      "Attached or shared bathroom by floor",
    ],
    image: "/img/rooms/room8.jpg",
  },
  {
    name: "Four & Six Sharing",
    sharing: "4–6 residents",
    description:
      "The most economical choice, popular with first-year students settling into the city.",
    features: [
      "Bunk beds with personal storage under each",
      "Shared study table and floor reading room",
      "Cupboard space per resident",
      "Shared bathrooms cleaned daily",
    ],
    image: "/img/rooms/room9.jpg",
  },
];
