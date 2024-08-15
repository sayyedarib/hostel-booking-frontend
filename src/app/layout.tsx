import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { cn } from "@/lib/utils";
import { CurrentBookingProvider } from "@/contexts/CurrentBookingContext";
import { Inter } from "next/font/google";

// const inter = Playfair_Display({ subsets: ["latin"], weight: "400" });
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hostel in Aligarh",
  description: "Cheapest online booking for hostel in Aligarh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={cn(inter.className, "relative")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CurrentBookingProvider>
              <Header className="fixed top-0 left-0 right-0 z-50" />
              {children}
              <SpeedInsights />
            </CurrentBookingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
