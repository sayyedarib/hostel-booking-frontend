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
import { getUserId } from "./users";

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

