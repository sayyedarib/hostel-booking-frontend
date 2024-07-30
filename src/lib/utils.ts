import { differenceInDays } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Room } from "@/interface";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function calculateRoomPrice(room: Room, checkIn: Date, checkOut: Date) {
  const days = differenceInDays(checkOut, checkIn);
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  let totalPrice = 0;

  if (months > 0) {
    totalPrice += months * room.roomMonthlyPrice;
  }

  totalPrice += remainingDays * room.roomDailyPrice;

  return totalPrice;
}

export function calculateBedPrice(room: Room, checkIn: Date, checkOut: Date) {
  const days = differenceInDays(checkOut, checkIn);
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  let totalPrice = 0;

  if (months > 0) {
    // TODO: Assuming all beds in particular room have same price for now
    totalPrice += months * (room?.bedInfo[0]?.monthlyPrice ?? 0);
  }

  totalPrice += remainingDays * (room?.bedInfo[0]?.dailyPrice ?? 0);

  return totalPrice;
}
