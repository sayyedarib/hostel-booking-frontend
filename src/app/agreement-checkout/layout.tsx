import type { Metadata } from "next";

/** Private route: never index, never follow. */
export const metadata: Metadata = {
  title: "Complete Your Booking",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
