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
    logger("info", "User have been found");
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
        applicantPhoto: UserTable.imageUrl,
        dob: UserTable.dob,
        purpose: UserTable.purpose,
        userIdImage: UserTable.idUrl,
      })
      .from(UserTable)
      .where(eq(UserTable.id, userId.data));

    logger("info", "Fetched user data", { user: user[0] });
    return { status: "success", data: user[0] };
  } catch (error) {
    logger("error", "Error fetching user data", { error });
    return { status: "error", data: null };
  }
};

export const getUserOnboardingStatus = async () => {
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
    await requireUser();
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


export const getGuests = async () => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    const guests = await db
      .select()
      .from(GuestTable)
      .where(eq(GuestTable.userId, userId.data));

    return { status: "success", data: guests };
  } catch (error) {
    logger("error", "Error fetching guests", { error });
    return { status: "error", data: null };
  }
};

export const updateUserDetails = async ({
  name,
  phone,
  dob,
  purpose,
  photoUrl,
  aadhaarUrl,
  enrollment,
  institute,
}: UpdateUser) => {
  try {
    logger("info", "Updating user details", { name, phone, dob, purpose });
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null, message: "User not found" };
    }

    const updatedUser = await db
      .update(UserTable)
      .set({
        name,
        phone,
        dob,
        purpose,
        imageUrl: photoUrl,
        idUrl: aadhaarUrl,
        enrollment,
        institute,
      })
      .where(eq(UserTable.id, userId.data))
      .returning();

    if (updatedUser.length === 0) {
      logger("error", "Failed to update user details");
      return {
        status: "error",
        data: null,
        message: "Failed to update user details",
      };
    }

    logger("info", "User details updated successfully");
    return {
      status: "success",
      data: updatedUser[0],
      message: "User details updated successfully",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    logger("error", "Error updating user details", { error: errorMessage });
    return {
      status: "error",
      data: null,
      message: "Error updating user details",
    };
  }
};

export const updateAddressAndGuardian = async ({
  address,
  city,
  state,
  pin,
  guardianName,
  guardianPhone,
}: {
  address: string;
  city: string;
  state: string;
  pin: string;
  guardianName: string;
  guardianPhone: string;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null };
    }

    logger("info", "Updating user address and guardian details", {
      userId: userId.data,
    });

    // Create a new address
    const newAddressId = await db
      .insert(AddressBookTable)
      .values({
        address,
        city,
        state,
        pin,
      })
      .returning({ id: AddressBookTable.id });

    // Update user with new address and guardian details
    await db
      .update(UserTable)
      .set({
        addressId: newAddressId[0].id,
        guardianName,
        guardianPhone,
        onboarded: true, // Set onboarded status to true
      })
      .where(eq(UserTable.id, userId.data))
      .execute();

    logger("info", "User address and guardian details updated successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in updating user address and guardian details", {
      error,
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
  enrollment,
  institute,
  someoneElse,
}: CreateGuest) => {
  try {
    logger("info", "Creating guest", { name, phone, email });
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", data: null, message: "User not found" };
    }

    if (!someoneElse) {
      await updateUserDetails({
        name,
        phone,
        dob,
        purpose,
        photoUrl,
        aadhaarUrl,
        enrollment,
        institute,
      });
    }

    const existingGuest = await db
      .select()
      .from(GuestTable)
      .where(
        and(
          eq(GuestTable.userId, userId.data),
          eq(GuestTable.name, name),
          eq(GuestTable.phone, phone),
          eq(GuestTable.email, email),
        ),
      );

    if (existingGuest.length > 0) {
      logger("info", "Guest already exists, updating guest");
      const updatedGuest = await db
        .update(GuestTable)
        .set({
          dob,
          purpose,
          photoUrl,
          aadhaarUrl,
        })
        .where(eq(GuestTable.id, existingGuest[0].id))
        .returning();

      return { status: "success", data: updatedGuest[0].id };
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
    await requireUser();
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
      .innerJoin(BedTable, eq(CartTable.bedId, BedTable.id));

    return { status: "success", data: checkoutData };
  } catch (error) {
    logger("error", "Error fetching checkout data", { error });
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

export const getUserTransactions = async (requestedUserId?: number | null) => {
  try {
    // Only an admin may read somebody else's transactions.
    const userId = await resolveTargetUserId(requestedUserId);

    const transactions = await db
      .select({
        id: TransactionTable.id,
        amount: TransactionTable.totalAmount,
        createdAt: TransactionTable.createdAt,
        verified: TransactionTable.verified,
      })
      .from(TransactionTable)
      .where(eq(TransactionTable.userId, userId!));

    logger("info", "Fetched user transactions", { transactions });
    return { status: "success", data: transactions };
  } catch (error) {
    logger("error", "Error fetching user transactions", { error });
    return { status: "error", data: null };
  }
};

export const getGuestBookings = async (guestId: number) => {
  try {
    await requireAdmin();
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
    await requireAdmin();
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
    await requireAdmin();
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

export const getUserDataById = async (requestedUserId?: number | null) => {
  try {
    // This row carries ID-document URLs and a signature; only the owner or an
    // admin may read it.
    const userId = await resolveTargetUserId(requestedUserId);

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
  userId?: number | null,
) => {
  if (!userId) {
    const { data } = await getUserId();
    userId = data;
  }

  if (!userId) {
    logger("error", "User not found");
    return { status: "error" };
  }

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
          .where(eq(UserTable.id, userId!));
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
        .where(eq(UserTable.id, userId!))
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
    await requireAdmin();

    // Four independent aggregates — run them concurrently rather than in
    // series, so the dashboard waits one round trip instead of four.
    const [totalRevenue, totalBookings, totalUsers, totalGuests] =
      await Promise.all([
        db
          .select({
            total: sql<number>`COALESCE(SUM(${TransactionTable.totalAmount}), 0)::float`,
          })
          .from(TransactionTable),
        db.select({ count: count() }).from(BookingTable),
        db.select({ count: count() }).from(UserTable),
        db.select({ count: count() }).from(GuestTable),
      ]);

    return {
      status: "success",
      data: {
        totalRevenue: Number(totalRevenue[0].total),
        totalBookings: Number(totalBookings[0].count),
        totalUsers: Number(totalUsers[0].count),
        totalGuests: Number(totalGuests[0].count),
      },
    };
  } catch (error) {
    logger("error", "Error fetching analytics data", { error });
    return { status: "error", data: null };
  }
};

export const getGuestsAdmin = async () => {
  try {
    await requireAdmin();
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
    await requireAdmin();
    logger("info", "Deleting guest", { guestId });
    await db.delete(GuestTable).where(eq(GuestTable.id, guestId)).execute();
    logger("info", "Guest deleted successfully");
    return { status: "success" };
  } catch (error) {
    logger("error", "Error in deleting guest", { error });
    return { status: "error", data: null };
  }
};




export const getInvoiceDetails = async (
  bookingId: number,
  requestedUserId: number,
) => {
  // An invoice exposes billing and address data; scope it to the owner unless
  // the caller is an admin.
  const userId = await resolveTargetUserId(requestedUserId);

  const invoiceDetails = await db
    .select({
      id: TransactionTable.id,
      userId: TransactionTable.userId,
      token: TransactionTable.token,
      discount: TransactionTable.discount,
      rentAmount: TransactionTable.rentAmount,
      securityDeposit: TransactionTable.securityDeposit,
      additionalCharges: TransactionTable.additionalCharges,
      totalAmount: TransactionTable.totalAmount,
      verified: TransactionTable.verified,
      invoiceUrl: TransactionTable.invoiceUrl,
      createdAt: TransactionTable.createdAt,
      bedCode: BedTable.bedCode,
      roomCode: RoomTable.roomCode,
      userName: UserTable.name,
      userPhone: UserTable.phone,
      userEmail: UserTable.email,
      addressId: UserTable.addressId,
      address: AddressBookTable.address,
      city: AddressBookTable.city,
      state: AddressBookTable.state,
      pin: AddressBookTable.pin,
    })
    .from(BookingTable)
    .innerJoin(
      TransactionTable,
      eq(BookingTable.transactionId, TransactionTable.id),
    )
    .innerJoin(UserTable, eq(BookingTable.userId, UserTable.id))
    .innerJoin(BedBookingTable, eq(BookingTable.id, BedBookingTable.bookingId))
    .innerJoin(BedTable, eq(BedBookingTable.bedId, BedTable.id))
    .innerJoin(RoomTable, eq(BedTable.roomId, RoomTable.id))
    .innerJoin(AddressBookTable, eq(UserTable.addressId, AddressBookTable.id))
    .where(
      and(eq(BookingTable.id, bookingId), eq(BookingTable.userId, userId)),
    );


  const bedDetails = await db
    .select({
      bedCode: BedTable.bedCode,
      roomCode: RoomTable.roomCode,
      bedType: BedTable.type,
      monthlyRent: BedTable.monthlyRent,
      checkIn: BedBookingTable.checkIn,
      checkOut: BedBookingTable.checkOut,
    })
    .from(BookingTable)
    .innerJoin(BedBookingTable, eq(BookingTable.id, BedBookingTable.bookingId))
    .innerJoin(BedTable, eq(BedBookingTable.bedId, BedTable.id))
    .innerJoin(RoomTable, eq(BedTable.roomId, RoomTable.id))
    .where(eq(BookingTable.id, bookingId));


  const invoiceDetailsWithBeds = { ...invoiceDetails[0], beds: bedDetails };
  return { status: "success", data: invoiceDetailsWithBeds };
};

export const createBooking = async ({
  payableRent,
  securityDeposit,
}: {
  payableRent: number;
  securityDeposit: number;
}) => {
  try {
    const userId = await getUserId();

    if (!userId.data) {
      logger("info", "User not found");
      return { status: "error", message: "User not found" };
    }
    logger("info", "Creating booking", { userId });
    logger("info", "Generating token");
    const token: string = generateToken();

    let bookingId: number | null = null;
    let transactionId: number | null = null;

    await db.transaction(async (trx) => {
      try {
        const [transactionResult] = await trx
          .insert(TransactionTable)
          .values({
            userId: userId.data,
            token,
            discount: 0,
            rentAmount: payableRent,
            securityDeposit,
            additionalCharges: 0,
            totalAmount: payableRent + securityDeposit,
            verified: false,
            invoiceUrl: "", // We'll update this later
          })
          .returning({
            id: TransactionTable.id,
          });

        transactionId = transactionResult.id;

        const [bookingResult] = await trx
          .insert(BookingTable)
          .values({
            userId: userId.data,
            transactionId: transactionId,
          })
          .returning({
            id: BookingTable.id,
          });

        bookingId = bookingResult.id;

        const cartItems = await db
          .select({
            guestId: CartTable.guestId,
            bedId: CartTable.bedId,
            checkIn: CartTable.checkIn,
            checkOut: CartTable.checkOut,
          })
          .from(CartTable)
          .where(eq(CartTable.userId, userId.data));

        if (!bookingId) {
          logger("error", "No booking ID found");
          return;
        }

        const bedBookings = cartItems.map((item) => ({
          bedId: item.bedId,
          guestId: item.guestId,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          bookingId: Number(bookingId),
          status: "booked" as const,
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
        logger("error", "Booking transaction failed, rolling back", { error });
        throw error;
      }
    });

    if (!bookingId || !transactionId) {
      logger("error", "Error in creating booking");
      return {
        status: "error",
        message: "Error in creating booking",
        data: null,
      };
    }

    // Now that we have the bookingId, we can generate the invoice URL and send email
    generateInvoiceAndUpdateTransaction(
      bookingId,
      userId.data,
      transactionId,
      token,
    );

    return {
      status: "success",
      message: "Booking created successfully",
      data: { bookingId },
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

// Function to send the email
export async function sendEmail({
  bookingId,
  token,
  userEmail,
  userName,
  userPhone,
  amount,
}: {
  bookingId: number;
  token: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  amount: number;
}) {
  try {
    logger("info", "sending email: ", {
      bookingId,
      token,
      userEmail,
      userName,
      userPhone,
      amount,
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/email/booking-confirmation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          token,
          userEmail,
          userName,
          userPhone,
          amount,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    logger("info", "Email sent successfully");
  } catch (error) {
    logger("error", "Error sending email:", error as Error);
  }
}

// Function to generate invoice and update transaction
export async function generateInvoiceAndUpdateTransaction(
  bookingId: number,
  userId: number,
  transactionId: number,
  token: string,
) {
  try {
    // const invoiceUrl = await generateInvoice(bookingId, userId);

    // await db
    //   .update(TransactionTable)
    //   .set({ invoiceUrl })
    //   .where(eq(TransactionTable.id, transactionId));

    // logger("info", "Invoice generated and transaction updated successfully");

    const userDetails = await db
      .select({
        name: UserTable.name,
        email: UserTable.email,
        phone: UserTable.phone,
      })
      .from(UserTable)
      .where(eq(UserTable.id, userId))
      .limit(1);


    if (userDetails.length === 0) {
      logger("error", "User details not found");
      return;
    }

    const {
      name: userName,
      email: userEmail,
      phone: userPhone,
    } = userDetails[0];


    const transaction = await db
      .select({
        totalAmount: TransactionTable.totalAmount,
      })
      .from(TransactionTable)
      .where(eq(TransactionTable.id, transactionId))
      .limit(1);

    if (transaction.length === 0) {
      logger("error", "Transaction details not found");
      return;
    }

    const amount = transaction[0].totalAmount;

    try {
      logger("info", "sending email", { userEmail });
      await sendEmail({
        bookingId,
        token,
        userEmail,
        userName,
        userPhone,
        amount,
      });
    } catch (error) {
      logger("error", "Error sending email:", error as Error);
    }
  } catch (error) {
    logger(
      "error",
      "Error generating invoice and updating transaction:",
      error as Error,
    );
  }
}

// Function to generate invoice
async function generateInvoice(bookingId: number, userId: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/invoice`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingId,
          userId: userId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to generate invoice");
    }

    const { invoiceUrl } = await response.json();
    logger("info", "Invoice generated successfully");
    return invoiceUrl;
  } catch (error) {
    logger("error", "Error generating invoice:", error as Error);
    throw error;
  }
}

export const getBookingDetails = async (bookingId: number) => {
  try {
    await requireAdmin();
    logger("info", "fetching booking details of: ", { bookingId: bookingId });
    const bookingDetails = await db
      .select({
        id: BookingTable.id,
        userId: BookingTable.userId,
        createdAt: BookingTable.createdAt,
        userName: UserTable.name,
        userEmail: UserTable.email,
        userPhone: UserTable.phone,
        amount: TransactionTable.totalAmount,
        invoiceUrl: TransactionTable.invoiceUrl,
      })
      .from(BookingTable)
      .innerJoin(UserTable, eq(BookingTable.userId, UserTable.id))
      .innerJoin(
        TransactionTable,
        eq(BookingTable.userId, TransactionTable.userId),
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

/**
 * Columns a user is allowed to set on their own record by uploading a file.
 *
 * The previous `updateUserData(userId, field, value)` accepted an arbitrary
 * column name straight from the caller, letting anyone write to any column on
 * any row. Restricting writes to this map removes that mass-assignment hole.
 */
const UPLOADABLE_DOCUMENT_COLUMNS = {
  signature: UserTable.signature,
  idUrl: UserTable.idUrl,
  guardianIdUrl: UserTable.guardianIdUrl,
  guardianPhoto: UserTable.guardianPhoto,
  imageUrl: UserTable.imageUrl,
} as const;

type UploadableDocument = keyof typeof UPLOADABLE_DOCUMENT_COLUMNS;

/**
 * Stores the URL of an uploaded document against a user record. The row is
 * always resolved through {@link resolveTargetUserId}, so a caller can only
 * write to their own record unless they are an admin.
 */
const updateUserDocument = async (
  document: UploadableDocument,
  url: string,
  requestedUserId?: number | null,
) => {
  try {
    const userId = await resolveTargetUserId(requestedUserId);

    if (!(document in UPLOADABLE_DOCUMENT_COLUMNS)) {
      logger("error", "Rejected write to non-uploadable column", { document });
      return { status: "error", data: null };
    }

    const result = await db
      .update(UserTable)
      .set({ [document]: url })
      .where(eq(UserTable.id, userId))
      .returning({ id: UserTable.id });

    if (result.length === 0) {
      logger("error", "User not found", { userId });
      return { status: "error", data: null };
    }

    logger("info", "Updated user document", { userId, document });
    return { status: "success", data: null };
  } catch (error) {
    logger("error", "Error updating user document", { document, error });
    return { status: "error", data: null };
  }
};

export const updateUserSignatureByUserId = async (
  userId: number,
  signatureUrl: string,
) => updateUserDocument("signature", signatureUrl, userId);

export const updateGuardianIdImage = async (
  userId: number,
  guardianIdImageUrl: string,
) => updateUserDocument("guardianIdUrl", guardianIdImageUrl, userId);

export const updateUserIdImage = async (
  userId: number,
  userIdImageUrl: string,
) => updateUserDocument("idUrl", userIdImageUrl, userId);

export const updateGuardianPhoto = async (
  userId: number,
  guardianPhotoUrl: string,
) => updateUserDocument("guardianPhoto", guardianPhotoUrl, userId);

export const updateUserImageUrl = async ({
  userId,
  imageUrl,
}: {
  userId?: number | null;
  imageUrl: string;
}) => updateUserDocument("imageUrl", imageUrl, userId);

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

export const getRevenueAndBookingsData = async (
  startDate: Date,
  endDate: Date,
) => {
  try {
    await requireAdmin();
    logger("info", "Fetching revenue and bookings data", {
      startDate,
      endDate,
    });
    /*
     * Three bugs made this chart wrong or permanently empty:
     *
     * 1. Buckets came from `to_char(created_at, 'Month')`, so July 2025 and
     *    July 2026 collapsed into one "July" and the series sorted
     *    alphabetically (April, August, December…). Now grouped and ordered by
     *    `date_trunc`.
     * 2. It required a bed booking with status checked_in/checked_out. Every
     *    bed booking in production is still 'booked', so the join discarded
     *    100% of rows. Revenue is recognised when the transaction is recorded,
     *    so booking status is not a revenue filter.
     * 3. Joining bookings multiplied each transaction row per booking, so the
     *    revenue sum double-counted. Amounts are now totalled per transaction
     *    in the inner query before being summed per month.
     */
    const rows = await db.execute<{
      month: string;
      revenue: number;
      bookings: number;
    }>(sql`
      SELECT
        month,
        SUM(total_amount)::float AS revenue,
        SUM(booking_count)::int  AS bookings
      FROM (
        SELECT
          date_trunc('month', ${TransactionTable.createdAt}) AS month,
          ${TransactionTable.id}                             AS transaction_id,
          MAX(${TransactionTable.totalAmount})               AS total_amount,
          COUNT(${BookingTable.id})                          AS booking_count
        FROM ${TransactionTable}
        LEFT JOIN ${BookingTable}
          ON ${BookingTable.transactionId} = ${TransactionTable.id}
        -- Bound as ISO strings: a raw execute() passes a JS Date straight to
        -- the driver, which cannot serialise it without column type info.
        WHERE ${TransactionTable.createdAt} >= ${startDate.toISOString()}::timestamp
          AND ${TransactionTable.createdAt} <= ${endDate.toISOString()}::timestamp
        GROUP BY 1, 2
      ) per_transaction
      GROUP BY month
      ORDER BY month
    `);

    const formattedData = Array.from(rows).map((item) => ({
      /** ISO timestamp of the first day of the month. */
      month: new Date(item.month).toISOString(),
      revenue: Number(item.revenue),
      bookings: Number(item.bookings),
    }));

    logger("info", "Revenue and bookings data fetched successfully", {
      formattedData,
    });

    return { status: "success", data: formattedData };
  } catch (error) {
    logger("error", "Error fetching revenue and bookings data", { error: error });
    return { status: "error", data: null };
  }
};

export const getTransactionsAdmin = async () => {
  try {
    await requireAdmin();
    const transactions = await db
      .select({
        id: TransactionTable.id,
        createdAt: TransactionTable.createdAt,
        userName: UserTable.name,
        userEmail: UserTable.email,
        rentAmount: TransactionTable.rentAmount,
        securityDeposit: TransactionTable.securityDeposit,
        additionalCharges: TransactionTable.additionalCharges,
        discount: TransactionTable.discount,
        totalAmount: TransactionTable.totalAmount,
        verified: TransactionTable.verified,
        invoiceUrl: TransactionTable.invoiceUrl,
      })
      .from(TransactionTable)
      .innerJoin(UserTable, eq(TransactionTable.userId, UserTable.id))
      .orderBy(sql`${TransactionTable.createdAt} DESC`);

    return { status: "success", data: transactions };
  } catch (error) {
    logger("error", "Error fetching transactions", { error });
    return { status: "error", data: null };
  }
};
