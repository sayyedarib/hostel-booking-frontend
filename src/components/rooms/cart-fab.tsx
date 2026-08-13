"use client";

import Link from "next/link";
import { Loader2, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";

interface CartFabProps {
  count: number | undefined;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Floating cart shortcut. Rendered as a link (not a button wrapping a link) so
 * it stays keyboard- and screen-reader-friendly.
 */
export function CartFab({ count, isLoading, hasError }: CartFabProps) {
  const showBadge = hasError || (!!count && count > 0);
  const label = hasError
    ? "Open cart (could not load item count)"
    : `Open cart${count ? ` (${count} item${count === 1 ? "" : "s"})` : ""}`;

  return (
    <Link
      href="/cart"
      aria-label={label}
      className={cn(
        "fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg",
        "transition-transform duration-200 hover:scale-105 hover:bg-yellow-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        "md:bottom-6 md:right-6 md:h-16 md:w-16",
      )}
    >
      <ShoppingCart size={28} color="black" strokeWidth={1.75} aria-hidden />
      {showBadge && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-bold text-white",
            hasError ? "bg-red-500" : "bg-black",
          )}
        >
          {hasError ? (
            "!"
          ) : isLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            count
          )}
        </span>
      )}
    </Link>
  );
}
