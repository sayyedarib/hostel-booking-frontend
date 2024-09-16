import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  Menu,
  Package2,
  Search,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const description =
  "An application shell with a header and main content area. The header has a navbar, a search input and and a user nav dropdown. The user nav is toggled by a button with an avatar image.";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen max-w-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Image
              src="/logo.png"
              alt="Aligarh Hostel"
              width={32}
              height={32}
            />
            <span className="sr-only">Aligarh Hostel</span>
          </Link>
          <Link
            href="/admin-dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin-dashboard/rooms"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Rooms
          </Link>
          <Link
            href="/admin-dashboard/users"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Users
          </Link>
          <Link
            href="/admin-dashboard/guests"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Guests
          </Link>
          <Link
            href="/admin-dashboard/analytics"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Analytics
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Aligarh Hostel</span>
              </Link>
              <Link href="/admin-dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/admin-dashboard/rooms"
                className="text-muted-foreground hover:text-foreground"
              >
                Rooms
              </Link>
              <Link
                href="/admin-dashboard/users"
                className="text-muted-foreground hover:text-foreground"
              >
                Users
              </Link>
              <Link
                href="/admin-dashboard/guests"
                className="text-muted-foreground hover:text-foreground"
              >
                Guests
              </Link>
              <Link
                href="/admin-dashboard/analytics"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 md:hidden">
          <h2>
            <Link href="/">Khan Group of PG</Link>
          </h2>
        </div>
      </header>
      {children}
    </div>
  );
}
