"use server";
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
  TranscationTable,
  UserTable,
} from "@/db/schema";
import {
  AgreementForm,
  CreateUser,
  CreateGuest,
  CreateAddress,
} from "@/interface";

import { createClient } from "@/lib/supabase/server";

import { auth } from "@clerk/nextjs/server";

const getClerkId = () => {
  return auth().userId;
};

export const createUser = async ({
  clerkId,
  name,
  phone = "",
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
    logger("info", "Fetching user ID", { clerkId });
    if (!clerkId) {
      logger("info", "Clerk ID not found");
      return { status: "error", data: null };
    }

    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.clerkId, clerkId));
    logger("info", "User have been found", user);
    logger("info", "UserId found", { userId: user[0]?.id, clerkId });
    return { status: "success", data: user[0]?.id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger("error", "Error fetching user", { error: errorMessage });
    return { status: "error", data: null };
  }
};

export const getUserData = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching user data", { userId: userId.data });
    const user = await db
      .select({
        name: UserTable.name,
        phone: UserTable.phone,
        email: UserTable.email,
        guardianName: UserTable.guardianName,
        guardianPhone: UserTable.guardianPhone,
        guardianPhoto: UserTable.guardianPhoto,
        guardianIdImage: UserTable.guardianIdUrl,
        applicantPhoto: UserTable.imageUrl,
        dob: UserTable.dob,
        userIdImage: UserTable.idUrl,
        address: AddressBookTable.address,
        city: AddressBookTable.city,
        state: AddressBookTable.state,
        pin: AddressBookTable.pin,
      })
      .from(UserTable)
      .innerJoin(AddressBookTable, eq(UserTable.addressId, AddressBookTable.id))
      .where(eq(UserTable.id, userId.data));

    logger("info", "Fetched user data", { user: user[0] });
    return { status: "success", data: user[0] };
  } catch (error) {
    logger("error", "Error fetching user data", { error });
    return { status: "error", data: null };
  }
};

export const getUserOnboadingStatus = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching user onboarding status", { userId: userId.data });
    const user = await db
      .select({
        onboarded: UserTable.onboarded,
      })
      .from(UserTable)
      .where(eq(UserTable.id, userId.data));

    logger("info", "Fetched user onboarding status", { user: user[0] });
    return { status: "success", data: user[0] };
  } catch (error) {
    logger("error", "Error fetching user onboarding status", { error });
    return { status: "error", data: null };
  }
};

export const createAddress = async ({
  address,
  city,
  state,
  pin,
}: CreateAddress) => {
  try {
    logger("info", "Creating address", { address, city, state, pin });
    const addressId = await db
      .insert(AddressBookTable)
      .values({
        address,
        city,
        state,
        pin,
      })
      .returning({
        id: AddressBookTable.id,
      });
    logger("info", "Address created successfully");
    return { status: "success", data: addressId[0].id };
  } catch (error) {
    logger("error", "Error in creating address", { error });
    return { status: "error", data: null };
  }
};

export const updateUserSubProfile = async ({
  imageUrl,
  dob,
  idUrl,
  guardianName,
  guardianPhone,
  guardianPhoto,
  guardianIdUrl,
  addressId,
  onboarded,
}: {
  imageUrl: string;
  dob: string;
  idUrl: string;
  guardianName: string;
  guardianPhone: string;
  guardianPhoto: string;
  guardianIdUrl: string;
  addressId: number;
  onboarded: boolean;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Updating user", { userId: userId.data });
    await db
      .update(UserTable)
      .set({
        imageUrl,
        dob,
        idUrl,
        guardianName,
        guardianPhone,
        guardianPhoto,
        guardianIdUrl,
        addressId,
        onboarded,
      })
      .where(eq(UserTable.id, userId.data))
      .execute();
    logger("info", "User updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in updating user", { error });
    return { status: "error", data: null };
  }
};

export const updateUserSignature = async ({
  signature,
}: {
  signature: string;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Updating user signature", { userId: userId.data });
    await db
      .update(UserTable)
      .set({
        signature,
      })
      .where(eq(UserTable.id, userId.data))
      .execute();
    logger("info", "User signature updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in updating user signature", { error });
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
        bedCount: sql<number>`COUNT(${BedTable.id})::int`,
      })
      .from(RoomTable)
      .innerJoin(PropertyTable, eq(RoomTable.propertyId, PropertyTable.id))
      .leftJoin(BedTable, eq(RoomTable.id, BedTable.roomId))
      .groupBy(RoomTable.id, PropertyTable.name);
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
        bedType: BedTable.type,
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

export const getCartItemsGrouped = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching grouped cart items", { userId: userId.data });
    const cartItems = await db
      .select({
        monthlyRent: BedTable.monthlyRent,
        count: sql<number>`count(*)`,
        totalRent: sql<number>`sum(${CartTable.checkOut} - ${CartTable.checkIn}) * ${BedTable.monthlyRent} / 30`,
      })
      .from(CartTable)
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id))
      .where(eq(CartTable.userId, userId.data))
      .groupBy(BedTable.monthlyRent);

    logger("info", "Fetched grouped cart items");
    return {
      status: "success",
      data: cartItems,
      message: "Fetched grouped cart items",
    };
  } catch (error) {
    logger("error", "Error fetching grouped cart items", { error });
    return {
      status: "error",
      data: null,
      message: "Error fetching grouped cart items",
    };
  }
};

export const getOccupancyOfBed = async (bedId: number) => {
  try {
    logger("info", "Fetching occupancy of bed", { bedId });
    const occupancy = await db
      .select({
        startDate: BedBookingTable.checkIn,
        endDate: BedBookingTable.checkOut,
      })
      .from(BedBookingTable)
      .where(eq(BedBookingTable.bedId, bedId));

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
  purpose,
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

    const cartItem = await db
      .insert(CartTable)
      .values({
        userId: userId.data,
        guestId,
        bedId,
        checkIn,
        checkOut,
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
    console.error("Error fetching room data:", error);
    return { status: "error", data: null };
  }
};

export const getAdminRoomData = async () => {
  try {
    const rooms = await db
      .select({
        id: RoomTable.id,
        roomCode: RoomTable.roomCode,
        floor: RoomTable.floor,
        gender: RoomTable.gender,
        bedCount: sql<number>`count(${BedTable.id})`,
      })
      .from(RoomTable)
      .leftJoin(BedTable, eq(RoomTable.id, BedTable.roomId))
      .groupBy(RoomTable.id);

    return { status: "success", data: rooms };
  } catch (error) {
    logger("error", "Error fetching room data", { error });
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

export const getSecurityDepositStatus = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching security deposit status", { userId: userId.data });
    const securityDeposit = await db
      .select({
        status: securityDepositTable.status,
      })
      .from(securityDepositTable)
      .where(eq(securityDepositTable.userId, userId.data));
    logger("info", "Fetched security deposit status");

    if (securityDeposit.length === 0) {
      await db
        .insert(securityDepositTable)
        .values({
          userId: userId.data,
          status: "pending",
          warningLevel: 0,
        })
        .execute();
      return { status: "success", data: "pending" };
    }

    return { status: "success", data: securityDeposit[0].status };
  } catch (error) {
    logger("error", "Error fetching security deposit status", error as Error);
    return { status: "error", data: null };
  }
};

export const getAgreementFormData = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Fetching agreement form data", { userId: userId.data });

    // Fetch user data
    const userData = await db
      .select({
        name: UserTable.name,
        phone: UserTable.phone,
        email: UserTable.email,
        applicantPhoto: UserTable.imageUrl,
        dob: UserTable.dob,
        userIdImage: UserTable.idUrl,
        guardianIdImage: UserTable.guardianIdUrl,
        guardianName: UserTable.guardianName,
        guardianPhone: UserTable.guardianPhone,
        guardianPhoto: UserTable.guardianPhoto,
        signature: UserTable.signature,
        address: AddressBookTable.address,
        pin: AddressBookTable.pin,
        city: AddressBookTable.city,
        state: AddressBookTable.state,
      })
      .from(UserTable)
      .leftJoin(AddressBookTable, eq(UserTable.addressId, AddressBookTable.id))
      .where(eq(UserTable.id, userId.data))
      .limit(1);

    // Fetch guest data with room and bed information
    const guestData = await db
      .select({
        name: GuestTable.name,
        phone: GuestTable.phone,
        email: GuestTable.email,
        purpose: GuestTable.purpose,
        dob: GuestTable.dob,
        photoUrl: GuestTable.photoUrl,
        aadhaarUrl: GuestTable.aadhaarUrl,
        roomCode: RoomTable.roomCode,
        monthlyRent: BedTable.monthlyRent,
        bedCode: BedTable.bedCode,
        checkIn: CartTable.checkIn,
        checkOut: CartTable.checkOut,
      })
      .from(GuestTable)
      .innerJoin(CartTable, eq(GuestTable.id, CartTable.guestId))
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id))
      .innerJoin(RoomTable, eq(BedTable.roomId, RoomTable.id))
      .where(eq(GuestTable.userId, userId.data));

    const agreementFormData: AgreementForm = {
      ...userData[0],
      guests: guestData.map((guest) => ({
        ...guest,
        checkIn: new Date(guest.checkIn),
        checkOut: new Date(guest.checkOut),
      })),
    };

    logger("info", "Fetched agreement form data");
    return { status: "success", data: agreementFormData };
  } catch (error) {
    logger("error", "Error fetching agreement form data", { error });
    return { status: "error", data: null };
  }
};

export const getUserTransactions = async (userId: number) => {
  try {
    const transactions = await db
      .select({
        id: TranscationTable.id,
        amount: TranscationTable.amount,
        createdAt: TranscationTable.createdAt,
        verified: TranscationTable.verified,
      })
      .from(TranscationTable)
      .where(eq(TranscationTable.userId, userId));

    logger("info", "Fetched user transactions", { transactions });
    return { status: "success", data: transactions };
  } catch (error) {
    logger("error", "Error fetching user transactions", { error });
    return { status: "error", data: null };
  }
};

export const getGuestBookings = async (guestId: number) => {
  try {
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

export const getUsersData = async () => {
  try {
    const users = await db
      .select({
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        phone: UserTable.phone,
        // Add more columns as needed
      })
      .from(UserTable);

    return { status: "success", data: users };
  } catch (error) {
    logger("error", "Error fetching user data", { error });
    return { status: "error", data: null };
  }
};

export const getUserDataById = async (userId: number) => {
  try {
    const user = await db
      .select({
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        phone: UserTable.phone,
        applicantPhoto: UserTable.imageUrl,
        dob: UserTable.dob,
        userIdImage: UserTable.idUrl,
        guardianIdImage: UserTable.guardianIdUrl,
        guardianName: UserTable.guardianName,
        guardianPhone: UserTable.guardianPhone,
        guardianPhoto: UserTable.guardianPhoto,
        signature: UserTable.signature,
        address: AddressBookTable.address,
        pin: AddressBookTable.pin,
        city: AddressBookTable.city,
        state: AddressBookTable.state,
      })
      .from(UserTable)
      .leftJoin(AddressBookTable, eq(UserTable.addressId, AddressBookTable.id))
      .where(eq(UserTable.id, userId));

    logger("info", "Fetched user data", { user });
    return { status: "success", data: user };
  } catch (error) {
    logger("error", "Error fetching user data", { error });
    return { status: "error", data: null };
  }
};

export const updateUserPersonalDetails = async (
  data: FormData,
  userId: number,
) => {
  try {
    logger("info", "User data", {
      user: data.get("name") as string,
      email: data.get("email") as string,
      phone: data.get("phone") as string,
      dob: data.get("dob") as string,
    });

    await db.transaction(async (trx) => {
      try {
        logger("info", "Updating user personal data", { userId });
        await trx
          .update(UserTable)
          .set({
            name: data.get("name") as string,
            email: data.get("email") as string,
            phone: data.get("phone") as string,
            dob:
              data.has("dob") && data.get("dob") !== ""
                ? new Date(data.get("dob") as string).toISOString()
                : null,
          })
          .where(eq(UserTable.id, userId));
      } catch (error) {
        logger("error", "Error updating user personal data", { error });
        throw error;
      }

      logger("info", "Fetching user address id");
      const user = await trx
        .select({
          addressId: UserTable.addressId,
        })
        .from(UserTable)
        .where(eq(UserTable.id, userId))
        .limit(1);

      logger("info", "User address id found", {
        addressId: user[0]?.addressId,
      });

      if (user[0]?.addressId) {
        try {
          logger("info", "Updating user address data", {
            addressId: user[0]?.addressId,
          });
          await trx
            .update(AddressBookTable)
            .set({
              address: data.get("address") as string,
              city: data.get("city") as string,
              state: data.get("state") as string,
              pin: data.get("pin") as string,
            })
            .where(eq(AddressBookTable.id, user[0].addressId))
            .execute();
          logger("info", "User address data updated");
        } catch (error) {
          logger("error", "Error updating user address data", { error });
          throw error;
        }
      } else {
        try {
          logger("info", "Creating user new address");
          const newAddressId = await trx
            .insert(AddressBookTable)
            .values({
              address: data.get("address") as string,
              city: data.get("city") as string,
              state: data.get("state") as string,
              pin: data.get("pin") as string,
            })
            .returning({ id: AddressBookTable.id });

          logger("info", "User new address created", {
            newAddressId: newAddressId[0].id,
          });

          await trx
            .update(UserTable)
            .set({ addressId: newAddressId[0].id })
            .where(eq(UserTable.id, userId));
          logger("info", "User new address updated");
        } catch (error) {
          logger("error", "Error creating user new address", { error });
          throw error;
        }
      }
    });

    return { status: "success" };
  } catch (error) {
    logger("error", "Error updating user data", { error });
    return { status: "error" };
  }
};

export const getAnalyticsData = async () => {
  try {
    const totalRevenue = await db
      .select({
        total: sql<number>`SUM(${TranscationTable.amount})`,
      })
      .from(TranscationTable);

    const totalBookings = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(BookingTable);

    const totalUsers = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(UserTable);

    const totalGuests = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(GuestTable);

    return {
      totalRevenue: totalRevenue[0].total,
      totalBookings: totalBookings[0].count,
      totalUsers: totalUsers[0].count,
      totalGuests: totalGuests[0].count,
    };
  } catch (error) {
    logger("error", "Error fetching analytics data", { error });
    return { status: "error", data: null };
  }
};

export const getGuests = async () => {
  try {
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
    logger("info", "Deleting guest", { guestId });
    await db.delete(GuestTable).where(eq(GuestTable.id, guestId)).execute();
    logger("info", "Guest deleted successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in deleting guest", { error });
    return { status: "error", data: null };
  }
};

export const getAvailableRooms = async () => {
  try {
    const rooms = await db.select().from(RoomTable);
    return { status: "success", data: rooms };
  } catch (error) {
    return { status: "error", data: null };
  }
};

export const getAvailableBeds = async (roomId: number) => {
  try {
    const beds = await db
      .select()
      .from(BedTable)
      .where(eq(BedTable.roomId, roomId));
    return { status: "success", data: beds };
  } catch (error) {
    return { status: "error", data: null };
  }
};

export const checkOccupiedRange = async (
  bedId: number,
  checkIn: Date,
  checkOut: Date,
) => {
  try {
    const occupiedRanges = await db
      .select()
      .from(BedBookingTable)
      .where(
        and(
          eq(BedBookingTable.bedId, bedId),
          or(
            and(
              gte(BedBookingTable.checkIn, checkIn.toISOString()),
              lte(BedBookingTable.checkIn, checkOut.toISOString()),
            ),
            and(
              gte(BedBookingTable.checkOut, checkIn.toISOString()),
              lte(BedBookingTable.checkOut, checkOut.toISOString()),
            ),
          ),
        ),
      );
    return occupiedRanges.length > 0;
  } catch (error) {
    return true;
  }
};

export const createBooking = async ({
  amount,
  invoiceUrl,
  agreementUrl,
  token,
}: {
  amount: number;
  invoiceUrl: string;
  agreementUrl: string;
  token: string;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", message: "User not found" };
    }
    logger("info", "Creating booking", { userId });

    const cartItems = await db
      .select({
        guestId: CartTable.guestId,
        bedId: CartTable.bedId,
        checkIn: CartTable.checkIn,
        checkOut: CartTable.checkOut,
      })
      .from(CartTable)
      .where(eq(CartTable.userId, userId.data));

    let bookingId: { id: number }[] = [{ id: 0 }];
    let transactionId: { id: number }[] = [{ id: 0 }];

    await db.transaction(async (trx) => {
      try {
        transactionId = await trx
          .insert(TranscationTable)
          .values({
            userId: userId.data,
            amount,
            token,
            invoiceUrl,
          })
          .returning({
            id: TranscationTable.id,
          });

        bookingId = await trx
          .insert(BookingTable)
          .values({
            userId: userId.data,
            agreementUrl,
            transactionId: transactionId[0].id,
          })
          .returning({
            id: BookingTable.id,
          });

        const bedBookings: {
          bedId: number;
          guestId: number;
          checkIn: string;
          checkOut: string;
          bookingId: number;
          transactionId: number;
          status: "booked" | "checked_in" | "checked_out" | "cancelled";
        }[] = cartItems.map((item) => ({
          bedId: item.bedId,
          guestId: item.guestId,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          bookingId: bookingId[0].id,
          transactionId: transactionId[0].id,
          status: "booked",
        }));

        await trx.insert(BedBookingTable).values(bedBookings);

        await trx
          .update(securityDepositTable)
          .set({
            userId: userId.data,
            status: "paid",
          })
          .where(eq(securityDepositTable.userId, userId.data))
          .execute();

        await trx
          .delete(CartTable)
          .where(eq(CartTable.userId, userId.data))
          .execute();

        logger("info", "Booking created successfully");
      } catch (error) {
        console.error(
          `[ERROR] ${new Date().toISOString()} - Error in transaction:`,
          error,
        );
        throw error;
      }
    });

    if (bookingId[0].id == 0) {
      logger("error", "Error in creating booking");
      return {
        status: "error",
        message: "Error in creating booking",
        data: null,
      };
    }

    if (transactionId[0].id == 0) {
      logger("error", "Error in creating transaction");
      return {
        status: "error",
        message: "Error in creating transaction",
        data: null,
      };
    }

    return {
      status: "success",
      message: "Booking created successfully",
      data: { bookingId: bookingId[0].id },
    };
  } catch (error) {
    logger("error", "Error in creating booking: ", error as Error);
    return {
      status: "error",
      message: "Error in creating booking",
      data: { id: null },
    };
  }
};

export const getBookingDetails = async (bookingId: number) => {
  try {
    const bookingDetails = await db
      .select({
        id: BookingTable.id,
        userId: BookingTable.userId,
        agreementUrl: BookingTable.agreementUrl,
        createdAt: BookingTable.createdAt,
        userName: UserTable.name,
        userEmail: UserTable.email,
        userPhone: UserTable.phone,
        amount: TranscationTable.amount,
        invoiceUrl: TranscationTable.invoiceUrl,
      })
      .from(BookingTable)
      .innerJoin(UserTable, eq(BookingTable.userId, UserTable.id))
      .innerJoin(
        TranscationTable,
        eq(BookingTable.userId, TranscationTable.userId),
      )
      .where(eq(BookingTable.id, bookingId))
      .limit(1);

    if (bookingDetails.length === 0) {
      return { status: "error", data: null };
    }

    const bedBookings = await db
      .select({
        bedCode: BedTable.bedCode,
        roomCode: RoomTable.roomCode,
        checkIn: BedBookingTable.checkIn,
        checkOut: BedBookingTable.checkOut,
      })
      .from(BedBookingTable)
      .innerJoin(BedTable, eq(BedBookingTable.bedId, BedTable.id))
      .innerJoin(RoomTable, eq(BedTable.roomId, RoomTable.id))
      .where(eq(BedBookingTable.bookingId, bookingId));

    return {
      status: "success",
      data: {
        ...bookingDetails[0],
        bedBookings,
      },
    };
  } catch (error) {
    logger("error", "Error fetching booking details", { error });
    return { status: "error", data: null };
  }
};

export const updateUserData = async (
  userId: number,
  field: string,
  value: string,
) => {
  try {
    logger("info", "Updating user data", { userId, field, value });
    await db.transaction(async (trx) => {
      await trx
        .update(UserTable)
        .set({ [field]: value })
        .where(eq(UserTable.id, userId));
    });
  } catch (error) {
    logger("error", "Error updating user data", { error });
  }
};

export const updateUserSignatureByUserId = async (
  userId: number,
  signatureUrl: string,
) => {
  try {
    logger("info", "Updating user signature", { userId, signatureUrl });
    const result = await db
      .update(UserTable)
      .set({ signature: signatureUrl })
      .where(eq(UserTable.id, userId))
      .returning();

    if (result.length === 0) {
      logger("error", "User not found", { userId });
      return { status: "error", data: null };
    }

    logger("info", "User signature updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error updating user signature", { error });
    return { status: "error", data: null };
  }
};

export const updateGuardianIdImage = async (
  userId: number,
  guardianIdImageUrl: string,
) => {
  try {
    logger("info", "Updating guardian ID image", {
      userId,
      guardianIdImageUrl,
    });
    const result = await db
      .update(UserTable)
      .set({ guardianIdUrl: guardianIdImageUrl })
      .where(eq(UserTable.id, userId))
      .returning();

    if (result.length === 0) {
      logger("error", "User not found", { userId });
      return { status: "error", data: null };
    }

    logger("info", "Guardian ID image updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error updating guardian ID image", { error });
    return { status: "error", data: null };
  }
};

export const updateUserIdImage = async (
  userId: number,
  userIdImageUrl: string,
) => {
  try {
    logger("info", "Updating user ID image", { userId, userIdImageUrl });
    const result = await db
      .update(UserTable)
      .set({ idUrl: userIdImageUrl })
      .where(eq(UserTable.id, userId))
      .returning();

    if (result.length === 0) {
      logger("error", "User not found", { userId });
      return { status: "error", data: null };
    }

    logger("info", "User ID image updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error updating user ID image", { error });
    return { status: "error", data: null };
  }
};

export const updateGuardianPhoto = async (
  userId: number,
  guardianPhotoUrl: string,
) => {
  try {
    logger("info", "Updating guardian photo", { userId, guardianPhotoUrl });
    const result = await db
      .update(UserTable)
      .set({ guardianPhoto: guardianPhotoUrl })
      .where(eq(UserTable.id, userId))
      .returning();

    if (result.length === 0) {
      logger("error", "User not found", { userId });
      return { status: "error", data: null };
    }

    logger("info", "Guardian photo updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error updating guardian photo", { error });
    return { status: "error", data: null };
  }
};

export const updateUserImageUrl = async ({
  userId,
  imageUrl,
}: {
  userId: number;
  imageUrl: string;
}) => {
  try {
    logger("info", "Updating user image URL", { userId, imageUrl });

    logger("info", "Updating user image URL", { imageUrl });
    const result = await db
      .update(UserTable)
      .set({ imageUrl })
      .where(eq(UserTable.id, userId))
      .returning();

    if (result.length === 0) {
      logger("error", "User not found", { userId });
      return { status: "error", data: null };
    }

    logger("info", "User image URL updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error updating user image URL", { error });
    return { status: "error", data: null };
  }
};

export const getRoomById = async (roomId: number) => {
  try {
    logger("info", "Fetching room by ID", { roomId });
    const room = await db
      .select({
        id: RoomTable.id,
        roomCode: RoomTable.roomCode,
        floor: RoomTable.floor,
        gender: RoomTable.gender,
        imageUrls: RoomTable.imageUrls,
        beds: {
          id: BedTable.id,
          bedCode: BedTable.bedCode,
          type: BedTable.type,
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

export const addRoomImage = async (roomId: number, imageUrl: string) => {
  try {
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

export const createRoom = async (roomCode: string, floor: number, gender: string, propertyId: number) => {
  try {
    logger("info", "Creating room", { roomCode, floor, gender, propertyId });

    const newRoom = await db.insert(RoomTable).values({
      roomCode,
      floor,
      gender,
      propertyId,
    }).returning();

    logger("info", "Room created successfully", { newRoom });
    return { status: "success", data: newRoom[0] };
  } catch (error) {
    logger("error", "Error creating room", { error, roomCode, floor, gender, propertyId });
    return {
      status: "error",
      data: null,
      message: "Failed to create room",
    };
  }
};