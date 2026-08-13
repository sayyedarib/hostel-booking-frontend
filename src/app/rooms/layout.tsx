import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/structured-data";

/**
 * `/rooms` is a client component (it fetches live availability), and a client
 * component cannot export metadata — so it lives here.
 */
export const metadata: Metadata = {
  title: "Available Rooms & Beds in Aligarh",
  description:
    "Live availability for shared and private rooms at Khan Group of PG, Aligarh. See how many beds are free in each room and reserve one online.",
  alternates: { canonical: "/rooms" },
  openGraph: {
    title: "Available Rooms & Beds in Aligarh",
    description:
      "Live availability for shared and private rooms at Khan Group of PG, Aligarh.",
    url: "/rooms",
  },
};

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Rooms", path: "/rooms" },
        ])}
      />
    </>
  );
}
