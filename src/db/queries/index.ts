"use server";
import { eq, and, sql, inArray } from "drizzle-orm";

import type { OccupiedDateRange } from "@/interface";

import { logger } from "@/lib/utils";
import { getClerkId } from "@/lib/server-utils";
import { db } from "@/db";
import {
  BedTable,
  BedOccupancyTable,
  CartTable,
  GuestTable,
  PropertyTable,
  RoomTable,
  UserTable,
} from "@/db/schema";
import { CreateUser, CreateGuest, BedInRoomCard } from "@/interface";

export const createUser = async ({
  clerkId,
  name,
  phone,
  email,
  imageUrl,
}: CreateUser) => {
  try {
    logger("info", "Creating user", { clerkId, name, phone, email });
    const user = await db
      .insert(UserTable)
      .values({
        clerkId,
        name,
        phone,
        email,
        imageUrl,
      })
      .returning();
    logger("info", "User created successfully");
    return { status: "success", data: user[0].id };
  } catch (error) {
    logger("error", "Error in creating user", { error });

    return { status: "error", data: null };
  }
};

export const checkUserExists = async (clerkId: string) => {
  try {
    logger("info", "Checking if user exists", { clerkId });
    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.clerkId, clerkId));
    logger("info", "User exists", { clerkId });
    return { status: "success", data: user[0].id };
  } catch (error) {
    logger("error", "Error in checking user exists", { error });
    return { status: "error", data: null };
  }
};

export const getUserId = async () => {
  try {
    const clerkId = getClerkId();
    if (!clerkId) {
      logger("info", "Clerk ID not found");
      return { status: "error", data: null };
    }

    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.clerkId, clerkId));

    logger("info", "UserId found", { userId: user[0].id, clerkId });
    return { status: "success", data: user[0].id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger("error", "Error fetching user", { error: errorMessage });
    return { status: "error", data: null };
  }
};

export const getAllRoomCards = async () => {
  try {
    logger("info", "Fetching all room cards");
    const rooms = await db
      .select({
        id: RoomTable.id,
        buildingName: PropertyTable.name,
        roomCode: RoomTable.roomCode,
        imageUrls: RoomTable.imageUrls,
        gender: RoomTable.gender,
      })
      .from(RoomTable)
      .innerJoin(PropertyTable, eq(RoomTable.propertyId, PropertyTable.id));
    logger("info", "Fetched all room cards");
    return { status: "success", data: rooms };
  } catch (error) {
    logger("error", "Error fetching room cards", { error });
    return { status: "error", data: null };
  }
};

export const getBedData = async (roomId: number) => {
  try {
    logger("info", "Fetching bed info", { roomId });
    const currentDate = new Date();
    const fifteenDaysLater = new Date(
      currentDate.getTime() + 15 * 24 * 60 * 60 * 1000,
    );

    const bedInfo = await db
      .select({
        id: BedTable.id,
        bedCode: BedTable.bedCode,
        dailyPrice: BedTable.dailyRent,
        monthlyPrice: BedTable.monthlyRent,
        occupiedDateRanges: sql<OccupiedDateRange[]>`
          array_agg(json_build_object(
            'startDate', ${BedOccupancyTable.checkInDate},
            'endDate', ${BedOccupancyTable.checkOutDate}
          )) FILTER (WHERE ${BedOccupancyTable.checkInDate} IS NOT NULL)
        `,
        status: sql<string>`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${BedOccupancyTable}
            WHERE ${BedOccupancyTable.bedId} = ${BedTable.id}
            AND ${BedOccupancyTable.checkInDate} <= ${fifteenDaysLater.toISOString()}
            AND ${BedOccupancyTable.checkOutDate} >= ${currentDate.toISOString()}
          ) THEN 'occupied' ELSE 'available' END
        `,
      })
      .from(BedTable)
      .leftJoin(BedOccupancyTable, eq(BedTable.id, BedOccupancyTable.bedId))
      .where(eq(BedTable.roomId, roomId))
      .groupBy(BedTable.id);

    logger("info", "Fetched bed info", { bedInfo });
    return { status: "success", data: bedInfo };
  } catch (error) {
    logger("error", "Error fetching bed info", { error });
    return { status: "error", data: null };
  }
};

export const getBedsInCart = async (roomId: number) => {
  try {
    logger("info", "Fetching beds in cart", { roomId });
    const beds = await db
      .select({
        id: BedTable.id,
        bedCode: BedTable.bedCode,
      })
      .from(CartTable)
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id))
      .where(eq(BedTable.roomId, roomId));
    logger("info", "Fetched beds in cart");
    return { status: "success", data: beds };
  } catch (error) {
    return { status: "error", data: null };
  }
};

export const getOccupancyOfBed = async (bedId: number) => {
  try {
    logger("info", "Fetching occupancy of bed", { bedId });
    const occupancy = await db
      .select({
        startDate: BedOccupancyTable.checkInDate,
        endDate: BedOccupancyTable.checkOutDate,
      })
      .from(BedOccupancyTable)
      .where(eq(BedOccupancyTable.bedId, bedId));

    logger("info", "Fetched occupancy dates");
    return { status: "success", data: occupancy };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger("error", "Error fetching occupancy of bed", {
      bedId,
      error: errorMessage,
    });
    return { status: "error", data: null };
  }
};

export const createGuest = async ({
  userId,
  name,
  phone,
  email,
  dob,
  aadhaarImage,
}: CreateGuest) => {
  try {
    logger("info", "Creating guest", { userId, name, phone, email });
    const guest = await db
      .insert(GuestTable)
      .values({
        userId,
        name,
        phone,
        email,
        dob,
        aadhaarImage,
      })
      .returning();
    logger("info", "Guest created successfully");
    return { status: "success", data: guest[0].id };
  } catch (error) {
    logger("error", "Error in creating guest", { error });
    return { status: "error", data: null, message: "Error creating guest" };
  }
};

export const addToCart = async (
  userId: number,
  guestId: number,
  bedId: number,
  checkInDate: string,
  checkOutDate: string,
) => {
  try {
    logger("info", "Adding to cart", {
      userId,
      guestId,
      bedId,
      checkInDate,
      checkOutDate,
    });
    await db
      .insert(CartTable)
      .values({
        userId,
        guestId,
        bedId,
        checkInDate,
        checkOutDate,
      })
      .execute();
    logger("info", "Added to cart successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in adding to cart", { error });
    return { status: "error", message: "Error adding to cart" };
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
        bedId: CartTable.bedId,
        checkInDate: CartTable.checkInDate,
        checkOutDate: CartTable.checkOutDate,
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
      message: "Fetched cart items",
    };
  } catch (error) {
    logger("error", "Error fetching cart items", { error });
    return {
      status: "error",
      data: null,
      message: "Error fetching cart items",
    };
  }
};

export const removeFromCart = async (userId: number, bedId: number) => {
  try {
    logger("info", "Removing from cart", { userId, bedId });
    await db
      .delete(CartTable)
      .where(and(eq(CartTable.userId, userId), eq(CartTable.bedId, bedId)))
      .execute();
    logger("info", "Removed from cart successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in removing from cart", { error });
    return { status: "error", message: "Error removing from cart" };
  }
};
