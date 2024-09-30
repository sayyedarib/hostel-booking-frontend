// in app/api/email/payment-confirmation/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { BedBookingTable, TransactionTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils";

export async function GET(request: NextRequest) {
  logger("info", "Confirming payment");
  const id = request.nextUrl.searchParams.get("id"); // id = bookingId
  const token = request.nextUrl.searchParams.get("token");

  if (!id || !token) {
    logger("error", "Booking ID or token not provided", { id, token });
    return NextResponse.json(
      { message: "Booking ID or token not provided" },
      { status: 400 },
    );
  }

  try {
    logger("info", `Updating booking status for ID: ${id}`);

    // TODO: it should done automatically when the checkin date is today
    await db
      .update(BedBookingTable)
      .set({ status: "checked_in" })
      .where(eq(BedBookingTable.bookingId, parseInt(id)))
      .execute();

    await db
      .update(TransactionTable)
      .set({ verified: true })
      .where(eq(TransactionTable.token, token))
      .execute();

    const { invoiceUrl } = await db
      .select({ invoiceUrl: TransactionTable.invoiceUrl })
      .from(TransactionTable)
      .where(eq(TransactionTable.token, token))
      .execute()
      .then((results) => results[0] || {});

    await fetch(
      `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://aligarhhostel.com"}/api/payment-verified`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: id,
          token,
        }),
      },
    );

    logger("info", "Payment confirmed");
    return NextResponse.redirect(new URL("/payment-confirmed", request.url));
  } catch (error) {
    logger("error", "Failed to confirm payment", error as Error);
    return NextResponse.json(
      { message: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
