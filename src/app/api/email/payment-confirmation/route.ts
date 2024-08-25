// in app/api/email/payment-confirmation/route.ts

import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { BedBookingTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Invalid confirmation ID" },
      { status: 400 },
    );
  }

  try {
    await db
      .update(BedBookingTable)
      .set({ status: "checked_in" })
      .where(eq(BedBookingTable.bookingId, parseInt(id)))
      .execute();

    return NextResponse.redirect("/payment-confirmed");
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
