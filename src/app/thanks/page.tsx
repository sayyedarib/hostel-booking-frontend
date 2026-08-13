import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default function Thanks() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <CheckCircle2
        className="h-14 w-14 text-green-600"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <h1 className="text-3xl font-bold md:text-5xl">Thank you!</h1>
      <p className="max-w-md text-gray-600">
        We have received your request. Our team will get in touch with you
        shortly to confirm the details.
      </p>
      <Button asChild className="mt-2 rounded-full px-8">
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
