"use server";
/*
 * Split out of a single 2,200-line module. Every export here is a Next.js
 * server action — a publicly reachable HTTP endpoint — so each one authorizes
 * itself via requireUser/requireAdmin from @/lib/auth.
 */

import { eq, and, count, sql, inArray, gte, lte, or } from "drizzle-orm";

import type { OccupiedDateRange } from "@/interface";

import { logger } from "@/lib/utils";
import { db } from "@/db";
import {
  AddressBookTable,
  BedTable,
  BedBookingTable,
  BookingTable,
  CartTable,
  GuestTable,
  PropertyTable,
  ReviewTable,
  RoomTable,
  securityDepositTable,
  TransactionTable,
  UserTable,
} from "@/db/schema";
import {
  AgreementForm,
  CreateUser,
  CreateGuest,
  CreateAddress,
  UpdateUser,
} from "@/interface";

import { auth } from "@clerk/nextjs/server";
import { generateToken } from "@/lib/utils";
import { requireAdmin, requireUser, resolveTargetUserId } from "@/lib/auth";
import { getUserId, updateUserDetails } from "./users";

const getClerkId = () => {
  return auth().userId;
};

/**
 * How far ahead a booking makes a bed unavailable.
 *
 * A bed booked to start within this window cannot be taken by someone else,
 * because the incoming resident needs it prepared. Room cards and the booking
 * drawer must agree on this number or the two views contradict each other.
 */
const BOOKING_LEAD_DAYS = 15;

export const getGuests = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    const guests = await db
      .select()
      .from(GuestTable)
      .where(eq(GuestTable.userId, userId.data));

    return { status: "success", data: guests };
  } catch (error) {
    logger("error", "Error fetching guests", { error });
    return { status: "error", data: null };
  }
};

export const createGuest = async ({
  name,
  phone,
  email,
  dob,
  purpose,
  photoUrl,
  aadhaarUrl,
  enrollment,
  institute,
  someoneElse,
}: CreateGuest) => {
  try {
    logger("info", "Creating guest", { name, phone, email });
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null, message: "User not found" };
    }

    if (!someoneElse) {
      await updateUserDetails({
        name,
        phone,
        dob,
        purpose,
        photoUrl,
        aadhaarUrl,
        enrollment,
        institute,
      });
    }

    const existingGuest = await db
      .select()
      .from(GuestTable)
      .where(
        and(
          eq(GuestTable.userId, userId.data),
          eq(GuestTable.name, name),
          eq(GuestTable.phone, phone),
          eq(GuestTable.email, email),
        ),
      );

    if (existingGuest.length > 0) {
      logger("info", "Guest already exists, updating guest");
      const updatedGuest = await db
        .update(GuestTable)
        .set({
          dob,
          purpose,
          photoUrl,
          aadhaarUrl,
        })
        .where(eq(GuestTable.id, existingGuest[0].id))
        .returning();

      return { status: "success", data: updatedGuest[0].id };
    }

    const guest = await db
      .insert(GuestTable)
      .values({
        userId: userId?.data,
        name,
        phone,
        email,
        purpose,
        dob,
        photoUrl,
        aadhaarUrl,
      })
      .returning();
    logger("info", "Guest created successfully");
    return { status: "success", data: guest[0].id };
  } catch (error) {
    logger("error", "Error in creating guest", { error });
    return { status: "error", data: null, message: "Error creating guest" };
  }
};

export const getGuestBookings = async (guestId: number) => {
  try {
    await requireAdmin();
    const bookings = await db
      .select({
        id: BedBookingTable.id,
        roomCode: RoomTable.roomCode,
        bedCode: BedTable.bedCode,
        checkIn: BedBookingTable.checkIn,
        checkOut: BedBookingTable.checkOut,
        status: BedBookingTable.status,
      })
      .from(BedBookingTable)
      .innerJoin(BookingTable, eq(BedBookingTable.bookingId, BookingTable.id))
      .innerJoin(BedTable, eq(BedBookingTable.bedId, BedTable.id))
      .innerJoin(RoomTable, eq(BedTable.roomId, RoomTable.id))
      .innerJoin(UserTable, eq(BookingTable.userId, UserTable.id))
      .innerJoin(GuestTable, eq(UserTable.id, GuestTable.userId))
      .where(eq(GuestTable.id, guestId));

    logger("info", "Fetched user bookings", { bookings });
    return { status: "success", data: bookings };
  } catch (error) {
    logger("error", "Error fetching user bookings", { error });
    return { status: "error", data: null };
  }
};

export const getGuest = async (guestId: number) => {
  try {
    await requireAdmin();
    const guest = await db
      .select({
        id: GuestTable.id,
        name: GuestTable.name,
        email: GuestTable.email,
        phone: GuestTable.phone,
        photoUrl: GuestTable.photoUrl,
        aadhaarUrl: GuestTable.aadhaarUrl,
        purpose: GuestTable.purpose,
        dob: GuestTable.dob,
        userId: UserTable.id,
        userName: UserTable.name,
      })
      .from(GuestTable)
      .innerJoin(UserTable, eq(GuestTable.userId, UserTable.id))
      .where(eq(GuestTable.id, guestId));

    logger("info", "Fetched guest", { guest });
    return { status: "success", data: guest };
  } catch (error) {
    logger("error", "Error fetching guest", { error });
    return { status: "error", data: null };
  }
};

export const getGuestsAdmin = async () => {
  try {
    await requireAdmin();
    logger("info", "Fetching guests");
    const guests = await db
      .select({
        id: GuestTable.id,
        name: GuestTable.name,
        roomCode: RoomTable.roomCode,
        bedCode: BedTable.bedCode,
        checkIn: BedBookingTable.checkIn,
        checkOut: BedBookingTable.checkOut,
      })
      .from(GuestTable)
      .innerJoin(BedBookingTable, eq(GuestTable.id, BedBookingTable.guestId))
      .innerJoin(BedTable, eq(BedBookingTable.bedId, BedTable.id))
      .innerJoin(RoomTable, eq(BedTable.roomId, RoomTable.id));
    logger("info", "Fetched guests successfully");
    return { status: "success", data: guests };
  } catch (error) {
    logger("error", "Error fetching guests", { error });
    return { status: "error", data: null };
  }
};

export const deleteGuest = async (guestId: number) => {
  try {
    await requireAdmin();
    logger("info", "Deleting guest", { guestId });
    await db.delete(GuestTable).where(eq(GuestTable.id, guestId)).execute();
    logger("info", "Guest deleted successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in deleting guest", { error });
    return { status: "error", data: null };
  }
};
