"use server";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { bedTable, buildingTable, roomTable, roomTypeTable } from "@/db/schema";
import { BedInfo } from "@/interface";

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
            'monthlyPrice', CAST(${bedTable.monthlyPrice} AS NUMERIC)
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
            'monthlyPrice', CAST(${bedTable.monthlyPrice} AS NUMERIC)
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

  return roomData[0];
}
