// in app/api/email/payment-confirmation/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { BedBookingTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/utils";

export async function GET(request: NextRequest) {
  logger("info", "Confirming payment");
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    logger("error", "Invalid confirmation ID");
    return NextResponse.json(
      { message: "Invalid confirmation ID" },
      { status: 400 }
    );
  }

  try {
    logger("info", `Updating booking status for ID: ${id}`);
    await db
      .update(BedBookingTable)
      .set({ status: "checked_in" })
      .where(eq(BedBookingTable.bookingId, parseInt(id)))
      .execute();

    logger("info", "Payment confirmed");
    return NextResponse.redirect("/payment-confirmed");
  } catch (error) {
    logger("error", "Failed to confirm payment", error as Error);
    return NextResponse.json(
      { message: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
