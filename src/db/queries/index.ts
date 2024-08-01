"use server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  bedTable,
  buildingTable,
  guestTable,
  roomTable,
  roomTypeTable,
} from "@/db/schema";
import { BedInfo, Guest } from "@/interface";

export const getAllRooms = async () => {
  console.log("fetching data getAllRooms...");

  const roomsData = await db
    .select({
      id: roomTable.id,
      buildingName: buildingTable.name,
      roomNumber: roomTable.roomNumber,
      roomDailyPrice: sql<number>`CAST(${roomTable.dailyPrice} AS NUMERIC)`,
      roomMonthlyPrice: sql<number>`CAST(${roomTable.monthlyPrice} AS NUMERIC)`,
      roomTypeName: roomTypeTable.name,
      roomCapacity: roomTypeTable.capacity,
      imageUrls: sql<string[]>`${roomTable.imageUrls}::text[]`,
      bedInfo: sql<BedInfo[]>`
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ${bedTable.id},
            'dailyPrice', CAST(${bedTable.dailyPrice} AS NUMERIC),
            'monthlyPrice', CAST(${bedTable.monthlyPrice} AS NUMERIC),
            'bedCode', ${bedTable.bedCode}
          )
        )
        FILTER (WHERE ${bedTable.id} IS NOT NULL)
      `,
    })
    .from(roomTable)
    .innerJoin(buildingTable, eq(roomTable.buildingId, buildingTable.id))
    .innerJoin(roomTypeTable, eq(roomTable.roomTypeId, roomTypeTable.id))
    .leftJoin(bedTable, eq(roomTable.id, bedTable.roomId))
    .groupBy(
      roomTable.id,
      buildingTable.name,
      roomTypeTable.name,
      roomTypeTable.capacity,
    );

  console.log("roomsData", roomsData);
  console.log("roomsData[0].bedInfo", roomsData[0].bedInfo);

  return roomsData;
};

export const getRoomById = async (roomId: number) => {
  console.log("fetching data getRoomById...");

  const roomData = await db
    .select({
      id: roomTable.id,
      buildingName: buildingTable.name,
      roomNumber: roomTable.roomNumber,
      roomDailyPrice: sql<number>`CAST(${roomTable.dailyPrice} AS NUMERIC)`,
      roomMonthlyPrice: sql<number>`CAST(${roomTable.monthlyPrice} AS NUMERIC)`,
      roomTypeName: roomTypeTable.name,
      roomCapacity: roomTypeTable.capacity,
      imageUrls: sql<string[]>`${roomTable.imageUrls}::text[]`,
      bedInfo: sql<BedInfo[]>`
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ${bedTable.id},
            'dailyPrice', CAST(${bedTable.dailyPrice} AS NUMERIC),
            'monthlyPrice', CAST(${bedTable.monthlyPrice} AS NUMERIC),
            'occupied', ${bedTable.occupied},
            'bedCode', ${bedTable.bedCode}
          )
        )
        FILTER (WHERE ${bedTable.id} IS NOT NULL)
      `,
    })
    .from(roomTable)
    .innerJoin(buildingTable, eq(roomTable.buildingId, buildingTable.id))
    .innerJoin(roomTypeTable, eq(roomTable.roomTypeId, roomTypeTable.id))
    .leftJoin(bedTable, eq(roomTable.id, bedTable.roomId))
    .where(eq(roomTable.id, roomId))
    .groupBy(
      roomTable.id,
      buildingTable.name,
      roomTypeTable.name,
      roomTypeTable.capacity,
    );

  console.log("roomData", roomData[0].bedInfo);
  return roomData[0];
};

export const bookBed = async (bedId: number) => {
  console.log("booking bed...");

  const bedData = await db
    .update(bedTable)
    .set({
      occupied: true,
    })
    .where(eq(bedTable.id, bedId));

  console.log("bedData", bedData);
  return bedData;
};

export const createGuestWithClerk = async (guestData: Guest) => {
  console.log("creating guest...");

  const guest = await db.insert(guestTable).values({
    name: guestData.name,
    userName:
      guestData.name.toLowerCase().replace(/\s/g, "").substring(0, 4) +
      Math.floor(Math.random() * 1000),
    email: guestData.email,
    phone: guestData.phone,
    clerkId: guestData.clerkId,
  });

  console.log("guest", guest);
  return guest;
};

export const checkIfGuestExistsByClerkId = async (clerkId: string) => {
  console.log("checking if guest exists...");

  const guest = await db
    .select()
    .from(guestTable)
    .where(eq(guestTable.clerkId, clerkId));

  console.log("guest", guest);
  return guest;
};
