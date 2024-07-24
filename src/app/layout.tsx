import type { Metadata } from "next";
import { Lobster } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Lobster({ subsets: ["latin"], weight: "400" });

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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
