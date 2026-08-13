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

export const markRoomAsOccupied = async (roomId: number) => {
  try {
    await requireAdmin();
    logger("info", "Marking room as occupied", { roomId });
    await db
      .update(RoomTable)
      .set({
        available: false,
      })
      .where(eq(RoomTable.id, roomId));
  } catch (error) {
    logger("error", "Error marking room as occupied", { error });
  }
};

export const markRoomAsAvailable = async (roomId: number) => {
  try {
    await requireAdmin();
    logger("info", "Marking room as occupied", { roomId });
    await db
      .update(RoomTable)
      .set({
        available: true,
      })
      .where(eq(RoomTable.id, roomId));
  } catch (error) {
    logger("error", "Error marking room as occupied", { error });
  }
};

export const getAllRoomCards = async () => {
  try {
    logger("info", "Fetching all room cards");

    /*
     * A bed counts as unavailable when either
     *   - an admin has flagged it unavailable (`bed.available = false`), or
     *   - it is booked at any point in the next BOOKING_LEAD_DAYS.
     *
     * Both conditions have to match `getBedData`, which is what the booking
     * drawer renders. They previously disagreed on both counts: this query
     * ignored the admin flag entirely and only looked at bookings covering
     * today, so a room with every bed flagged unavailable still advertised
     * "2 available" and an enabled "Add Bed to Cart" — and the drawer then
     * showed both beds greyed out, leaving the guest at a dead end.
     *
     * COUNT(DISTINCT …) because the join to bookings repeats a bed row once
     * per booking it has.
     */
    const rooms = await db
      .select({
        id: RoomTable.id,
        buildingName: PropertyTable.name,
        roomCode: RoomTable.roomCode,
        imageUrls: RoomTable.imageUrls,
        gender: RoomTable.gender,
        bedCount: sql<number>`COUNT(DISTINCT ${BedTable.id})::int`,
        availableForBooking: RoomTable.available,
        occupiedCount: sql<number>`
          COUNT(DISTINCT CASE
            WHEN ${BedTable.available} = false THEN ${BedTable.id}
            WHEN ${BedBookingTable.checkIn} <= NOW() + (${BOOKING_LEAD_DAYS} || ' days')::interval
             AND ${BedBookingTable.checkOut} >= NOW() THEN ${BedTable.id}
          END)::int
        `,
      })
      .from(RoomTable)
      .innerJoin(PropertyTable, eq(RoomTable.propertyId, PropertyTable.id))
      .leftJoin(BedTable, eq(RoomTable.id, BedTable.roomId))
      .leftJoin(BedBookingTable, eq(BedTable.id, BedBookingTable.bedId))
      .groupBy(RoomTable.id, PropertyTable.name)
      .orderBy(RoomTable.roomCode);

    logger("info", "Fetched all room cards");
    return { status: "success", data: rooms };
  } catch (error) {
    logger("error", "Error fetching room cards", { error });
    return { status: "error", data: null };
  }
};

// TODO: optimize query

export const getBedData = async (roomId: number) => {
  try {
    logger("info", "Fetching bed info", { roomId });
    const currentDate = new Date();
    const fifteenDaysLater = new Date(
      currentDate.getTime() + BOOKING_LEAD_DAYS * 24 * 60 * 60 * 1000,
    );

    const bedInfo = await db
      .select({
        id: BedTable.id,
        bedCode: BedTable.bedCode,
        dailyRent: BedTable.dailyRent,
        monthlyRent: BedTable.monthlyRent,
        bedType: BedTable.type,
        available: BedTable.available,
        occupiedDateRanges: sql<OccupiedDateRange[]>`
          array_agg(json_build_object(
            'startDate', ${BedBookingTable.checkIn},
            'endDate', ${BedBookingTable.checkOut}
          )) FILTER (WHERE ${BedBookingTable.checkIn} IS NOT NULL)
        `,
        status: sql<string>`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${BedBookingTable}
            WHERE ${BedBookingTable.bedId} = ${BedTable.id}
            AND ${BedBookingTable.checkIn} <= ${fifteenDaysLater.toISOString()}
            AND ${BedBookingTable.checkOut} >= ${currentDate.toISOString()}
          ) THEN 'occupied' ELSE 'available' END
        `,
      })
      .from(BedTable)
      .leftJoin(BedBookingTable, eq(BedTable.id, BedBookingTable.bedId))
      .where(eq(BedTable.roomId, roomId))
      .groupBy(BedTable.id);

    logger("info", "Fetched bed info", { bedInfo });
    return { status: "success", data: bedInfo };
  } catch (error) {
    logger("error", "Error fetching bed info", { error });
    return { status: "error", data: null };
  }
};

export const getRoomData = async (roomId: number) => {
  try {
    const roomData = await db
      .select({
        id: RoomTable.id,
        roomCode: RoomTable.roomCode,
        imageUrls: RoomTable.imageUrls,
        floor: RoomTable.floor,
        gender: RoomTable.gender,
        buildingName: PropertyTable.name,
        address: PropertyTable.address,
        city: PropertyTable.city,
        state: PropertyTable.state,
        monthlyRent: BedTable.monthlyRent,
        bedCount: sql<number>`count(${BedTable.id})`,
        avgRating: sql<number>`coalesce(avg(${ReviewTable.rating}), 0)`,
      })
      .from(RoomTable)
      .innerJoin(PropertyTable, eq(RoomTable.propertyId, PropertyTable.id))
      .leftJoin(BedTable, eq(RoomTable.id, BedTable.roomId))
      .leftJoin(ReviewTable, eq(RoomTable.id, ReviewTable.roomId))
      .where(eq(RoomTable.id, roomId))
      .groupBy(RoomTable.id, PropertyTable.id)
      .execute();

    const reviews = await db
      .select({
        rating: ReviewTable.rating,
        review: ReviewTable.review,
      })
      .from(ReviewTable)
      .where(eq(ReviewTable.roomId, roomId))
      .limit(3)
      .execute();

    return { status: "success", data: { ...roomData[0], reviews } };
  } catch (error) {
    logger("error", "Error fetching room data", { error: error });
    return { status: "error", data: null };
  }
};

export const getAdminRoomData = async () => {
  try {
    await requireAdmin();
    const rooms = await db
      .select({
        id: RoomTable.id,
        roomCode: RoomTable.roomCode,
        floor: RoomTable.floor,
        gender: RoomTable.gender,
        bedCount: sql<number>`COUNT(${BedTable.id})::int`,
        availableBedCount: sql<number>`COUNT(CASE WHEN ${BedTable.available} THEN 1 END)::int`,
        isOpen: RoomTable.available,
      })
      .from(RoomTable)
      .leftJoin(BedTable, eq(RoomTable.id, BedTable.roomId))
      .groupBy(RoomTable.id)
      .orderBy(RoomTable.roomCode);

    return { status: "success", data: rooms };
  } catch (error) {
    logger("error", "Error fetching room data", { error });
    return { status: "error", data: null };
  }
};

export const getRoomById = async (roomId: number) => {
  try {
    await requireAdmin();
    logger("info", "Fetching room by ID", { roomId });
    const room = await db
      .select({
        id: RoomTable.id,
        roomCode: RoomTable.roomCode,
        floor: RoomTable.floor,
        gender: RoomTable.gender,
        imageUrls: RoomTable.imageUrls,
        available: RoomTable.available,
        beds: {
          id: BedTable.id,
          bedCode: BedTable.bedCode,
          type: BedTable.type,
          available: BedTable.available,
          monthlyRent: BedTable.monthlyRent,
        },
        property: {
          id: PropertyTable.id,
          name: PropertyTable.name,
          address: PropertyTable.address,
        },
      })
      .from(RoomTable)
      .leftJoin(BedTable, eq(RoomTable.id, BedTable.roomId))
      .innerJoin(PropertyTable, eq(RoomTable.propertyId, PropertyTable.id))
      .where(eq(RoomTable.id, roomId));
    const roomWithBeds = {
      ...room[0],
      beds: room.map((r) => r.beds).filter((bed) => bed?.id !== null),
    };

    logger("info", "Room fetched successfully", { roomWithBeds });
    return { status: "success", data: [roomWithBeds] };
  } catch (error) {
    logger("error", "Error fetching room by ID", { error });
    return { status: "error", data: null };
  }
};

export const addBedToRoom = async (
  roomId: number,
  bedCode: string,
  type: string,
  monthlyRent: number,
  dailyRent: number,
) => {
  try {
    await requireAdmin();
    logger("info", "Adding bed to room", {
      roomId,
      bedCode,
      type,
      monthlyRent,
      dailyRent,
    });

    const newBed = await db
      .insert(BedTable)
      .values({
        roomId,
        bedCode,
        type,
        monthlyRent,
        dailyRent,
      })
      .returning();

    logger("info", "Bed added successfully", { newBed });
    return { status: "success", data: newBed[0] };
  } catch (error) {
    logger("error", "Error adding bed to room", { error });
    return { status: "error", data: null };
  }
};

export const updateRoomDetails = async (
  roomId: number,
  roomCode: string,
  floor: number,
  gender: string,
) => {
  try {
    await requireAdmin();
    logger("info", "Updating room details", {
      roomId,
      roomCode,
      floor,
      gender,
    });

    const updatedRoom = await db
      .update(RoomTable)
      .set({
        roomCode,
        floor,
        gender,
      })
      .where(eq(RoomTable.id, roomId))
      .returning();

    if (updatedRoom.length === 0) {
      logger("warn", "Room not found for update", { roomId });
      return { status: "error", data: null, message: "Room not found" };
    }

    logger("info", "Room details updated successfully", { updatedRoom });
    return { status: "success", data: updatedRoom[0] };
  } catch (error) {
    logger("error", "Error updating room details", { error, roomId });
    return {
      status: "error",
      data: null,
      message: "Failed to update room details",
    };
  }
};

export const updateBedDetails = async (
  bedId: number,
  bedCode: string,
  type: string,
  monthlyRent: number,
) => {
  try {
    await requireAdmin();
    logger("info", "Updating bed details", {
      bedId,
      bedCode,
      type,
      monthlyRent,
    });

    const updatedBed = await db
      .update(BedTable)
      .set({
        bedCode,
        type,
        monthlyRent,
      })
      .where(eq(BedTable.id, bedId))
      .returning();

    if (updatedBed.length === 0) {
      logger("warn", "Bed not found for update", { bedId });
      return { status: "error", data: null, message: "Bed not found" };
    }

    logger("info", "Bed details updated successfully", { updatedBed });
    return { status: "success", data: updatedBed[0] };
  } catch (error) {
    logger("error", "Error updating bed details", { error, bedId });
    return {
      status: "error",
      data: null,
      message: "Failed to update bed details",
    };
  }
};

export const updateBedStatus = async (bedId: number, available: boolean) => {
  try {
    await requireAdmin();
    logger("info", "Updating bed status", { bedId, available });

    const updatedBed = await db
      .update(BedTable)
      .set({ available })
      .where(eq(BedTable.id, bedId))
      .returning();

    if (updatedBed.length === 0) {
      logger("warn", "Bed not found for status update", { bedId });
      return { status: "error", data: null, message: "Bed not found" };
    }

    logger("info", "Bed status updated successfully", { updatedBed });
    return { status: "success", data: updatedBed[0] };
  } catch (error) {
    logger("error", "Error updating bed status", { error, bedId });
    return {
      status: "error",
      data: null,
      message: "Failed to update bed status",
    };
  }
};

export const addRoomImage = async (roomId: number, imageUrl: string) => {
  try {
    await requireAdmin();
    logger("info", "Adding image to room", { roomId, imageUrl });

    const insertedImage = await db
      .update(RoomTable)
      .set({
        imageUrls: sql`${RoomTable.imageUrls} || ARRAY[${imageUrl}]::text[]`,
      })
      .returning();

    if (insertedImage.length === 0) {
      logger("warn", "Failed to add image to room", { roomId });
      return { status: "error", data: null, message: "Failed to add image" };
    }

    logger("info", "Image added successfully", { insertedImage });
    return { status: "success", data: insertedImage[0] };
  } catch (error) {
    logger("error", "Error adding image to room", { error, roomId });
    return {
      status: "error",
      data: null,
      message: "Failed to add image to room",
    };
  }
};

export const deleteImage = async (roomId: number, imageUrl: string) => {
  try {
    await requireAdmin();
    logger("info", "Deleting image from room", { roomId, imageUrl });
    const updatedRoom = await db
      .update(RoomTable)
      .set({
        imageUrls: sql`array_remove(${RoomTable.imageUrls}, ${imageUrl}::text)`,
      })
      .where(eq(RoomTable.id, roomId))
      .returning();

    if (updatedRoom.length === 0) {
      logger("warn", "Failed to delete image from room", { roomId });
      return { status: "error", data: null, message: "Failed to delete image" };
    }

    logger("info", "Image deleted successfully", { updatedRoom });
    return { status: "success", data: updatedRoom[0] };
  } catch (error) {
    logger("error", "Error deleting image from room", {
      error: error as Error,
      roomId,
    });
    return {
      status: "error",
      data: null,
      message: "Failed to delete image from room",
    };
  }
};

export const createRoom = async (
  roomCode: string,
  floor: number,
  gender: string,
  propertyId: number,
) => {
  try {
    await requireAdmin();
    logger("info", "Creating room", { roomCode, floor, gender, propertyId });

    const newRoom = await db
      .insert(RoomTable)
      .values({
        roomCode,
        floor,
        gender,
        propertyId,
      })
      .returning();

    logger("info", "Room created successfully", { newRoom });
    return { status: "success", data: newRoom[0] };
  } catch (error) {
    logger("error", "Error creating room", {
      error,
      roomCode,
      floor,
      gender,
      propertyId,
    });
    return {
      status: "error",
      data: null,
      message: "Failed to create room",
    };
  }
};
