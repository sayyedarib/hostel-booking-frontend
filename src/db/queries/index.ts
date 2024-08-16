"use server";
import { eq, and, count, sql, inArray } from "drizzle-orm";

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
        dailyRent: BedTable.dailyRent,
        monthlyRent: BedTable.monthlyRent,
        occupiedDateRanges: sql<OccupiedDateRange[]>`
          array_agg(json_build_object(
            'startDate', ${BedOccupancyTable.checkIn},
            'endDate', ${BedOccupancyTable.checkOut}
          )) FILTER (WHERE ${BedOccupancyTable.checkIn} IS NOT NULL)
        `,
        status: sql<string>`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${BedOccupancyTable}
            WHERE ${BedOccupancyTable.bedId} = ${BedTable.id}
            AND ${BedOccupancyTable.checkIn} <= ${fifteenDaysLater.toISOString()}
            AND ${BedOccupancyTable.checkOut} >= ${currentDate.toISOString()}
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
        guestId: CartTable.guestId,
        bedId: BedTable.id,
        checkIn: CartTable.checkIn,
        checkOut: CartTable.checkOut,
      })
      .from(CartTable)
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id))
      .where(eq(BedTable.roomId, roomId));
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

export const getOccupancyOfBed = async (bedId: number) => {
  try {
    logger("info", "Fetching occupancy of bed", { bedId });
    const occupancy = await db
      .select({
        startDate: BedOccupancyTable.checkIn,
        endDate: BedOccupancyTable.checkOut,
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
  name,
  phone,
  email,
  dob,
  photoUrl,
  aadhaarUrl,
}: CreateGuest) => {
  try {
    logger("info", "Creating guest", { name, phone, email });
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null, message: "User not found" };
    }

    const guest = await db
      .insert(GuestTable)
      .values({
        userId: userId?.data,
        name,
        phone,
        email,
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

export const addToCart = async (
  guestId: number,
  bedId: number,
  checkIn: string,
  checkOut: string,
  amount: number,
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
      amount,
    });
    const cartItem = await db
      .insert(CartTable)
      .values({
        userId: userId.data,
        guestId,
        bedId,
        checkIn,
        checkOut,
        amount,
      })
      .returning();
    logger("info", "Added to cart successfully");
    return { status: "success", data: cartItem[0] };
  } catch (error) {
    logger("error", "Error in adding to cart", { error });
    return { status: "error", data: null, message: "Error adding to cart" };
  }
};

export const getCartItemsCount = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching total cart items for user", { userId });
    const totalItems = await db
      .select({
        count: count(),
      })
      .from(CartTable)
      .where(eq(CartTable.userId, userId.data));

    logger("info", "Fetched total cart items for user", totalItems);

    return { status: "success", data: totalItems[0].count };
  } catch (error) {
    logger("error", "Error fetching total cart items for user", { error });
    return { status: "error", data: null };
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
        bedType: BedTable.type,
        guestName: GuestTable.name,
        checkIn: CartTable.checkIn,
        checkOut: CartTable.checkOut,
        amount: CartTable.amount,
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
