"use client";

import { Suspense } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <div className="flex min-h-screen items-center justify-center">
        {children}
      </div>
    </Suspense>
  );
}
