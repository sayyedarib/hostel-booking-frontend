"use server";
import { eq, and, count, sql, inArray } from "drizzle-orm";

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

import { auth } from "@clerk/nextjs/server";

const getClerkId = () => {
  return auth().userId;
};

export const createUser = async ({
  clerkId,
  name,
  phone="",
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

// In your queries file (e.g., db/queries.ts)

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

    let bookingId: { id: number }[];

    await db.transaction(async (trx) => {
      try {
        bookingId = await trx
          .insert(BookingTable)
          .values({
            userId: userId.data,
            agreementUrl,
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
          status: "booked" | "checked_in" | "checked_out" | "cancelled";
        }[] = cartItems.map((item) => ({
          bedId: item.bedId,
          guestId: item.guestId,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          bookingId: bookingId[0].id,
          status: "booked",
        }));

        try {
          await trx.insert(BedBookingTable).values(bedBookings);
        } catch (error) {
          console.error(
            `[ERROR] ${new Date().toISOString()} - Error inserting bed bookings:`,
            error,
          );
          throw error;
        }

        try {
          await trx
            .update(securityDepositTable)
            .set({
              userId: userId.data,
              status: "paid",
            })
            .where(eq(securityDepositTable.userId, userId.data))
            .execute();
        } catch (error) {
          console.error(
            `[ERROR] ${new Date().toISOString()} - Error updating security deposit:`,
            error,
          );
          throw error;
        }

        try {
          console.log(
            "Inserting transaction",
            userId.data,
            amount,
            token,
            invoiceUrl,
          );
          await trx.insert(TranscationTable).values({
            userId: userId.data,
            amount,
            token,
            invoiceUrl,
          });
        } catch (error) {
          console.error(
            `[ERROR] ${new Date().toISOString()} - Error inserting transaction:`,
            error,
          );
          throw error;
        }

        try {
          await trx
            .delete(CartTable)
            .where(eq(CartTable.userId, userId.data))
            .execute();
        } catch (error) {
          console.error(
            `[ERROR] ${new Date().toISOString()} - Error deleting cart items:`,
            error,
          );
          throw error;
        }
        logger("info", "Booking created successfully");
        return {
          status: "success",
          message: "Booking created successfully",
          data: bookingId[0].id,
        };
      } catch (error) {
        console.error(
          `[ERROR] ${new Date().toISOString()} - Error in transaction:`,
          error,
        );
        throw error;
      }
    });
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
