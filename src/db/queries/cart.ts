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
import { getUserId } from "./users";

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

export const getCartBedsOfRoom = async (roomId: number) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching beds in cart for particular room and user", {
      roomId,
    });
    const beds = await db
      .select({
        bedId: BedTable.id,
      })
      .from(BedTable)
      .innerJoin(CartTable, eq(BedTable.id, CartTable.bedId))
      .where(
        and(eq(BedTable.roomId, roomId), eq(CartTable.userId, userId.data)),
      );

    logger("info", "Fetched beds in cart of user for particular room");
    return { status: "success", data: beds };
  } catch (error) {
    logger("error", "Error fetching beds in cart of user for particular room", {
      error,
    });
    return { status: "error", data: null };
  }
};

export const getBedsInCart = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching beds in cart", { userId: userId.data });
    const beds = await db
      .select({
        guestId: CartTable.guestId,
        bedId: BedTable.id,
        checkIn: CartTable.checkIn,
        checkOut: CartTable.checkOut,
      })
      .from(CartTable)
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id))
      .where(eq(CartTable.userId, userId.data));
    logger("info", "Fetched beds in cart");

    const formattedBeds = beds.map((bed) => ({
      ...bed,
      checkIn: new Date(bed.checkIn),
      checkOut: new Date(bed.checkOut),
    }));

    return { status: "success", data: formattedBeds };
  } catch (error) {
    return { status: "error", data: null };
  }
};

export const addToCart = async (
  guestId: number,
  bedId: number,
  checkIn: string,
  checkOut: string,
) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", message: "User not found" };
    }

    logger("info", "Adding to cart", {
      userId,
      guestId,
      bedId,
      checkIn,
      checkOut,
    });

    await db.insert(CartTable).values({
      userId: userId.data,
      guestId,
      bedId,
      checkIn,
      checkOut,
    });
    logger("info", "Added to cart successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in adding to cart", { error });
    return { status: "error" };
  }
};

export const getCartItems = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching cart items", { userId: userId.data });
    const cartItems = await db
      .select({
        id: CartTable.id,
        buildingName: PropertyTable.name,
        roomCode: RoomTable.roomCode,
        roomImage: RoomTable.imageUrls,
        bedCode: BedTable.bedCode,
        monthlyRent: BedTable.monthlyRent,
        bedType: BedTable.type,
        guestName: GuestTable.name,
        checkIn: CartTable.checkIn,
        checkOut: CartTable.checkOut,
      })
      .from(CartTable)
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id))
      .innerJoin(RoomTable, eq(BedTable.roomId, RoomTable.id))
      .innerJoin(PropertyTable, eq(RoomTable.propertyId, PropertyTable.id))
      .innerJoin(GuestTable, eq(CartTable.guestId, GuestTable.id))
      .innerJoin(UserTable, eq(CartTable.userId, UserTable.id))
      .where(eq(CartTable.userId, userId.data));
    logger("info", "Fetched cart items");
    return {
      status: "success",
      data: cartItems,
    };
  } catch (error) {
    logger("error", "Error fetching cart items", { error });
    return {
      status: "error",
      data: null,
    };
  }
};

export const getCheckoutData = async () => {
  try {
    const user = await requireUser();
    const checkoutData = await db
      .select({
        id: CartTable.id,
        guestId: CartTable.guestId,
        bedId: CartTable.bedId,
        guestName: GuestTable.name,
        monthlyRent: BedTable.monthlyRent,
        checkIn: CartTable.checkIn,
        checkOut: CartTable.checkOut,
      })
      .from(CartTable)
      .innerJoin(GuestTable, eq(CartTable.guestId, GuestTable.id))
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id))
      .where(eq(CartTable.userId, user.id));

    return { status: "success", data: checkoutData };
  } catch (error) {
    logger("error", "Error fetching checkout data", { error });
    return { status: "error", data: null };
  }
};

export const getCartItemsCount = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "access_denied", data: null };
    }

    logger("info", "Fetching cart items count");
    const cartItemsCount = await db
      .select({
        count: count(),
      })
      .from(CartTable)
      .where(eq(CartTable.userId, userId.data));

    logger("info", "Fetched cart items count", {
      cartItemsCount: cartItemsCount[0].count,
    });

    return { status: "success", data: cartItemsCount[0].count };
  } catch (error) {
    logger("error", "Error fetching cart items count", { error });
    return { status: "error", data: null };
  }
};

export const removeFromCart = async (cartId: number) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", message: "User not found" };
    }

    logger("info", "Removing from cart", { cartId });
    await db
      .delete(CartTable)
      .where(and(eq(CartTable.userId, userId.data), eq(CartTable.id, cartId)))
      .execute();
    logger("info", "Removed from cart successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in removing from cart", { error });
    return { status: "error", message: "Error removing from cart" };
  }
};
