import { differenceInDays } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";
import type { DateRange } from "react-day-picker";

import type { LogContext, LogLevel, OccupiedDateRange } from "@/interface";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

// export function calculateRoomPrice(room: Room, checkIn: Date, checkOut: Date) {
//   const days = differenceInDays(checkOut, checkIn);
//   const months = Math.floor(days / 30);
//   const remainingDays = days % 30;

//   let totalPrice = 0;

//   if (months > 0) {
//     totalPrice += months * room.roomMonthlyPrice;
//   }

//   totalPrice += remainingDays * room.roomDailyPrice;

//   return totalPrice;
// }

// export function calculateBedPrice(
//   room: Room,
//   checkIn: Date,
//   checkOut: Date,
//   bed: number,
// ) {
//   const days = differenceInDays(checkOut, checkIn);
//   const months = Math.floor(days / 29);
//   const remainingDays = days % 29;

//   let totalPrice = 0;

//   if (months > 0) {
//     // TODO: Assuming all beds in particular room have same price for now
//     totalPrice += months * (room?.bedInfo[0]?.monthlyPrice ?? 0) * bed;
//   }

//   totalPrice += remainingDays * (room?.bedInfo[0]?.dailyPrice ?? 0) * bed;

//   return totalPrice;
// }

export const generateToken = (length = 16) => {
  return crypto.randomBytes(length).toString("hex").substring(0, length);
};

export const logger = (
  level: LogLevel,
  message: string,
  context: LogContext | Error = {},
) => {
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  const dir = process.cwd();
  const logLevel = level.toUpperCase();

  const contextString = Object.keys(context)?.length
    ? JSON.stringify(context)
    : "";

  console.log(`[${date} ${time}] [${logLevel}] ${message} ${contextString}`);
};

export const checkOverlap = (
  selectedRange: DateRange,
  occupiedDateRanges: OccupiedDateRange[],
) => {
  logger("info", "checking overlap...");
  if (!selectedRange) {
    logger("error", "selectedRange is not provided");
    return false;
  }

  return occupiedDateRanges?.some((range) => {
    const bookedStart = new Date(range.startDate);
    const bookedEnd = new Date(range.endDate);
    return (
      (selectedRange?.from ?? new Date()) <= bookedEnd &&
      (selectedRange?.to ?? new Date()) >= bookedStart
    );
  });
};

export const getFirstAvailableRange = (
  occupiedDateRanges: OccupiedDateRange[],
): DateRange | undefined => {
  if (!occupiedDateRanges?.length) return undefined;

  const today = new Date();
  let firstAvailableDate = new Date(today);
  let availableDays = 0;

  while (
    checkOverlap(
      { from: firstAvailableDate, to: firstAvailableDate },
      occupiedDateRanges,
    )
  ) {
    firstAvailableDate.setDate(firstAvailableDate.getDate() + 1);
  }

  while (
    !checkOverlap(
      { from: firstAvailableDate, to: firstAvailableDate },
      occupiedDateRanges,
    ) &&
    availableDays < 7
  ) {
    firstAvailableDate.setDate(firstAvailableDate.getDate() + 1);
    availableDays++;
  }

  const toDate = new Date(
    firstAvailableDate.setDate(firstAvailableDate.getDate() + availableDays),
  );
  return { from: firstAvailableDate, to: toDate };
};

export const calculateRent = (
  monthlyRent: number,
  checkIn: Date,
  checkOut: Date,
): { totalRent: number; payableRent: number; pendingRent: number } => {
  const days = differenceInDays(checkOut, checkIn);

  if (days < 30)
    return {
      totalRent: Math.floor(days * (monthlyRent / 30)),
      payableRent: Math.floor(days * (monthlyRent / 30)),
      pendingRent: 0,
    };

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  return {
    totalRent: months * monthlyRent + remainingDays * (monthlyRent / 30),
    payableRent: monthlyRent,
    pendingRent:
      months * monthlyRent + remainingDays * (monthlyRent / 30) - monthlyRent,
  };
};
