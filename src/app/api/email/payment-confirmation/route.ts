// in app/api/email/payment-confirmation/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { BedBookingTable, TranscationTable } from "@/db/schema";
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
    await db
      .update(BedBookingTable)
      .set({ status: "checked_in" })
      .where(eq(BedBookingTable.bookingId, parseInt(id)))
      .execute();

    await db
      .update(TranscationTable)
      .set({ verified: true })
      .where(eq(TranscationTable.token, token))
      .execute();

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
