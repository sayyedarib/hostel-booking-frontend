"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BedDouble } from "lucide-react";

import Header from "@/components/header";
import { RoomCardComponent } from "@/components/room-card";
import { CartFab } from "@/components/rooms/cart-fab";
import { RoomGridSkeleton } from "@/components/rooms/room-grid-skeleton";
import { Button } from "@/components/ui/button";
import { getAllRoomCards, getCartItemsCount } from "@/db/queries";
import { logger } from "@/lib/utils";

export default function Rooms() {
  const {
    isLoading,
    error,
    data: rooms,
    refetch,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { status, data } = await getAllRoomCards();
      if (status === "error" || !data) {
        logger("error", "Failed to fetch rooms");
        throw new Error("We couldn't load rooms right now.");
      }
      return data;
    },
    staleTime: 60_000,
  });

  const {
    isLoading: isCartCountLoading,
    error: cartCountError,
    data: cartItemsCount,
  } = useQuery({
    queryKey: ["cartItemsCount"],
    queryFn: async () => {
      const { status, data } = await getCartItemsCount();
      if (status === "error") {
        logger("error", "Failed to fetch cart items count");
        throw new Error("Failed to fetch cart items count");
      }
      return data ?? 0;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const availableCount =
    rooms?.filter((room) => room.availableForBooking).length ?? 0;

  return (
    <>
      <Header className="fixed left-0 right-0 top-0 z-30" />

      <main
        id="main-content"
        className="min-h-screen bg-gray-50 pb-24 pt-28 md:pt-36"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#212529] md:text-4xl">
              Rooms &amp; Beds
            </h1>
            <p className="mt-2 text-gray-600">
              {isLoading
                ? "Checking live availability…"
                : `${availableCount} of ${rooms?.length ?? 0} rooms currently accepting bookings.`}
            </p>
          </header>

          {isLoading ? (
            <RoomGridSkeleton />
          ) : error ? (
            <EmptyState
              icon={<AlertCircle className="h-8 w-8" aria-hidden="true" />}
              title="Something went wrong"
              body={error.message}
              action={
                <Button onClick={() => refetch()} className="mt-4">
                  Try again
                </Button>
              }
            />
          ) : !rooms?.length ? (
            <EmptyState
              icon={<BedDouble className="h-8 w-8" aria-hidden="true" />}
              title="No rooms listed yet"
              body="Please check back soon — new rooms are added regularly."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <li key={room.id}>
                  <RoomCardComponent roomData={room} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <CartFab
        count={cartItemsCount}
        isLoading={isCartCountLoading}
        hasError={Boolean(cartCountError)}
      />
    </>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <div className="mb-3 text-gray-400">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-gray-600">{body}</p>
      {action}
    </div>
  );
}
