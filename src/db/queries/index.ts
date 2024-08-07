"use server";
import { eq, sql, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
  bedTable,
  bookingTable,
  buildingTable,
  guestTable,
  roomTable,
  roomTypeTable,
  tempConfirmationTable,
  paymentTable,
} from "@/db/schema";
import { BedInfo, Guest } from "@/interface";

export const getGuestByClerkId = async () => {
  const userId = auth().userId;
  if (!userId) {
    console.error("No user id found");
    return;
  }

  const guestData = await db
    .select()
    .from(guestTable)
    .where(eq(guestTable.clerkId, userId));

  console.log("guestData", guestData);
  return guestData[0];
};

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

// TODO: for now single guest is allowed to book multiple rooms, but later refactor such that each bed is assigned to a single guestid but multiple booking can be done by a single guest
export const updateGuestName = async (name: string) => {
  console.log("updating guest name...");

  const guestId = auth().userId;
  if (!guestId) {
    console.error("No user id found");
    return;
  }

  const guest = await db
    .update(guestTable)
    .set({
      name,
    })
    .where(eq(guestTable.clerkId, guestId));

  console.log("guest", guest);
  return guest;
};

export const updateGooglePic = async (googlePic: string) => {
  console.log("updating google pic...");

  const guestId = auth().userId;
  if (!guestId) {
    console.error("No user id found");
    return;
  }

  const guest = await db
    .update(guestTable)
    .set({
      googlePic,
    })
    .where(eq(guestTable.clerkId, guestId));

  console.log("guest", guest);
  return guest;
};

export const updateGuestPhone = async (phone: string) => {
  console.log("updating guest phone...");
  const guestId = auth().userId;
  if (!guestId) {
    console.error("No user id found");
    return;
  }

  const guest = await db
    .update(guestTable)
    .set({
      phone,
    })
    .where(eq(guestTable.clerkId, guestId));

  console.log("guest", guest);
  return guest;
};

export const updateGuestAddress = async (address: string) => {
  console.log("updating guest address...");
  const guestId = auth().userId;
  if (!guestId) {
    console.error("No user id found");
    return;
  }
  const guest = await db
    .update(guestTable)
    .set({
      address,
    })
    .where(eq(guestTable.clerkId, guestId));

  console.log("guest", guest);
  return guest;
};

export const updateGuestGuardianName = async (guardianName: string) => {
  console.log("updating guest guardian's name...");

  const guestId = auth().userId;
  if (!guestId) {
    console.error("No user id found");
    return;
  }

  const guest = await db
    .update(guestTable)
    .set({
      guardianName,
    })
    .where(eq(guestTable.clerkId, guestId));

  return guest;
};

interface BookingParams {
  roomId: number;
  bedId?: number; // Optional if bedId can be null
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
}

interface Booking {
  id: number;
  roomId: number;
  guestId: number;
  bedId: number | null;
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export async function createBooking({
  roomId,
  bedId,
  checkIn,
  checkOut,
}: BookingParams): Promise<Booking | null> {
  const guest = await getGuestByClerkId();
  if (!guest) {
    console.log("No guest found");
    return null;
  }

  console.log("creating booking....");

  try {
    const result = await db
      .insert(bookingTable)
      .values({
        guestId: guest.id as number,
        roomId: roomId,
        bedId: bedId ?? null,
        checkInDate: new Date(checkIn).toISOString(),
        checkOutDate: new Date(checkOut).toISOString(),
        status: "active",
      })
      .returning();

    if (result.length > 0) {
      return result[0] as Booking; // Typecast to Booking
    } else {
      return null; // No booking created
    }
  } catch (error) {
    console.error("Booking error:", error);
    return null;
  }
}

export async function updateBookingStatus(bookingId: number, status: string) {
  try {
    await db
      .update(bookingTable)
      .set({ status })
      .where(eq(bookingTable.id, bookingId));

    return { success: true };
  } catch (error) {
    console.error("Booking status update error:", error);
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

export async function getRoomDetails(
  roomId: number,
  bedIdsString: string,
): Promise<RoomDetails | null> {
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
      bedCodes: bedCodesForSelectedBeds.map((bed) => bed.bedCode),
    };
  } catch (error) {
    console.error("Error fetching room details:", error);
    return null;
  }
}

export async function getBookingDetails(bookingId: number) {
  console.log("fetching booking details...");

  const bookingDetails = await db
    .select({
      guestName: guestTable.name,
      guestEmail: guestTable.email,
      guestPhone: guestTable.phone,
      roomNumber: roomTable.roomNumber,
      bedCode: bedTable.bedCode,
      totalAmount: paymentTable.amount,
      token: paymentTable.token,
    })
    .from(bookingTable)
    .innerJoin(guestTable, eq(bookingTable.guestId, guestTable.id))
    .innerJoin(roomTable, eq(bookingTable.roomId, roomTable.id))
    .innerJoin(bedTable, eq(bookingTable.bedId, bedTable.id))
    .innerJoin(paymentTable, eq(bookingTable.id, paymentTable.bookingId))
    .where(eq(bookingTable.id, bookingId))
    .limit(1);

  console.log("bookingDetails", bookingDetails);
  return bookingDetails;
}

export async function createPayment({
  bookingId,
  amount,
  token,
}: {
  bookingId: number;
  amount: number;
  token: string;
}) {
  await db.insert(paymentTable).values({
    bookingId,
    amount,
    token,
  });
}

export const createConfirmation = async (data: {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
}): Promise<number> => {
  console.log("creating confirmation...");

  const [result] = await db
    .insert(tempConfirmationTable)
    .values({
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      room: data.room,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      totalAmount: data.totalAmount,
    })
    .returning({ id: tempConfirmationTable.id });

  console.log("confirmation created with id:", result.id);
  return result.id;
};

export const getConfirmation = async (id: number) => {
  console.log("fetching confirmation...");

  const confirmation = await db
    .select()
    .from(tempConfirmationTable)
    .where(eq(tempConfirmationTable.id, id));

  console.log("confirmation", confirmation);
  return confirmation;
};
