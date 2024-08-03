"use server";
import { eq, sql, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db";
import {
  bedTable,
  bookingTable,
  buildingTable,
  guestTable,
  roomTable,
  roomTypeTable,
} from "@/db/schema";
import { BedInfo, Guest } from "@/interface";

export const getGuestByClerkId = async () => {
  const userId = auth().userId;
  if(!userId) {
    console.error("No user id found");
    return;
  }

  const guestData = await db
    .select()
    .from(guestTable)
    .where(eq(guestTable.clerkId, userId));

  console.log("guestData", guestData);
  return guestData[0];
}

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


interface BookingParams {
  roomId: number;
  bedId: number;
  checkIn: string;
  checkOut: string;
}

export async function createBooking({
  roomId,
  bedId,
  checkIn,
  checkOut,
}: BookingParams) {
  const guest = await getGuestByClerkId();
  if (!guest) {
    console.log("No guest found");
    return;
  }

  try {
    const booking = await db
      .insert(bookingTable)
      .values({
        guestId: guest.id as number, // Use guest.id directly
        roomId: roomId,
        bedId: bedId,
        checkInDate: new Date(checkIn),
        checkOutDate: new Date(checkOut),
        status: "active",
        isActive: true,
      })
      .returning();

    return { success: true, booking }; // Return the booking object if needed
  } catch (error) {
    console.error("Booking error:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateBedStatus(bedIds: number[], occupied: boolean) {
  try {
    await db
      .update(bedTable)
      .set({ occupied })
      .where(inArray(bedTable.id, bedIds));

    return { success: true };
  } catch (error) {
    console.error("Bed status update error:", error);
    return { success: false, error: (error as Error).message };
  }
}



interface RoomDetails {
  roomNumber: string;
  bedCodes: string[];
  roomMonthlyPrice: number;
  roomDailyPrice: number;
}

export async function getRoomDetails(roomId: number, bedIdsString: string): Promise<RoomDetails | null> {
  try {
    const bedIds = bedIdsString.split("+").map(Number);

    const roomData = await db
      .select({
        roomNumber: roomTable.roomNumber,
        roomDailyPrice: sql<number>`CAST(${roomTable.dailyPrice} AS NUMERIC)`,
        roomMonthlyPrice: sql<number>`CAST(${roomTable.monthlyPrice} AS NUMERIC)`,
      })
      .from(roomTable)
      .where(eq(roomTable.id, roomId))
      .limit(1);

    if (roomData.length === 0) {
      return null;
    }

    console.log("roomData", roomData);
    console.log("bed ", bedIds);
    const bedCodesForSelectedBeds = await db
      .select({ bedCode: bedTable.bedCode })
      .from(bedTable)
      .where(inArray(bedTable.id, bedIds));



    return {
      roomNumber: roomData[0].roomNumber,
      roomMonthlyPrice: roomData[0].roomMonthlyPrice,
      roomDailyPrice: roomData[0].roomDailyPrice,
      bedCodes: bedCodesForSelectedBeds.map(bed => bed.bedCode),
    };
  } catch (error) {
    console.error("Error fetching room details:", error);
    return null;
  }
}