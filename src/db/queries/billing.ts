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
