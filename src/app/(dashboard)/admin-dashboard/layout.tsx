import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getSessionUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const navLinks = [
  { href: "/admin-dashboard", label: "Dashboard" },
  { href: "/admin-dashboard/rooms", label: "Rooms" },
  { href: "/admin-dashboard/users", label: "Users" },
  { href: "/admin-dashboard/guests", label: "Guests" },
  { href: "/admin-dashboard/transactions", label: "Transactions" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware runs on the Edge runtime and cannot reach the database, so the
  // role check lives here. Every admin server action re-checks independently.
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect_url=/admin-dashboard");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="sr-only">{siteConfig.name}</span>
        </Link>

        <nav
          aria-label="Admin"
          className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav aria-label="Admin" className="grid gap-6 text-lg font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <p className="ml-auto text-sm text-muted-foreground">
          Signed in as <span className="font-medium">admin</span>
        </p>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
