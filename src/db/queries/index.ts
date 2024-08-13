"use server";
import { eq, sql, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

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
import { CreateUser } from "@/interface";

export const createUser = async ({
  clerkId,
  name,
  phone,
  email,
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
      })
      .returning();
    logger("info", "User created successfully");
    return { status: "success", data: user[0].id };
  } catch (error) {
    logger("error", "Error in creating user", { error });

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
        roomName: RoomTable.name,
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

export const getBedInfo = async (roomId: number) => {
  try {
    logger("info", "Fetching bed info", { roomId });
    const bedInfo = await db
      .select()
      .from(BedTable)
      .where(eq(BedTable.roomId, roomId));
    logger("info", "Fetched bed info");
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
        bedCode: BedTable.name,
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
        checkIn: BedOccupancyTable.checkInDate,
        checkOut: BedOccupancyTable.checkOutDate,
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
