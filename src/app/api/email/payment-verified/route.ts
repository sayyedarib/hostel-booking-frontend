import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { TransactionTable, UserTable, BookingTable } from "@/db/schema";
import { transporter } from "@/lib/server-utils";
import { logger } from "@/lib/utils";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const { bookingId, token } = await request.json();

    if (!bookingId || !token) {
      return NextResponse.json(
        { error: "Booking ID and token are required" },
        { status: 400 },
      );
    }

    // Verify the transaction
    const transaction = await db
      .select()
      .from(TransactionTable)
      .where(eq(TransactionTable.token, token))
      .execute();

    if (transaction.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Update transaction status
    await db
      .update(TransactionTable)
      .set({ verified: true })
      .where(eq(TransactionTable.token, token))
      .execute();

    // Get user details
    const booking = await db
      .select({
        userId: BookingTable.userId,
        invoiceUrl: TransactionTable.invoiceUrl,
      })
      .from(BookingTable)
      .innerJoin(
        TransactionTable,
        eq(BookingTable.transactionId, TransactionTable.id),
      )
      .where(eq(BookingTable.id, bookingId))
      .execute();

    if (booking.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const user = await db
      .select({
        name: UserTable.name,
        email: UserTable.email,
      })
      .from(UserTable)
      .where(eq(UserTable.id, booking[0].userId))
      .execute();

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch invoice PDF
    // const invoicePdf = await axios.get(booking[0].invoiceUrl, {
    //   responseType: "arraybuffer",
    // });

    // Send email to user
    const mailContent = `
      <h1>Payment Confirmation</h1>
      <p>Dear ${user[0].name},</p>
      <p>Your payment has been verified successfully. Please find the invoice attached to this email.</p>
      <p>Thank you for choosing our service!</p>
      <p>Best Regards,<br>Khan Group Of Hostel</p>
    `;

    try {
      logger("info", "sending email invoice to user", {
        to: user[0].email,
        invoiceUrl: booking[0].invoiceUrl,
      });
      await transporter.sendMail({
        from: "support@aligarhhostel.com",
        to: user[0].email,
        subject: "Payment Confirmation and Invoice",
        html: mailContent,
        // attachments: [
        //   {
        //     filename: "invoice.pdf",
        //     content: invoicePdf.data,
        //   },
        // ],
      });

      logger("info", "Payment verification email sent to user");
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      logger(
        "error",
        "Error sending payment verification email to user",
        emailError as Error,
      );
    }

    return NextResponse.json({
      message: "Payment verified and email sent successfully",
    });
  } catch (error) {
    console.error("Error in payment verification process:", error);
    logger("error", "Error in payment verification process", error as Error);
    return NextResponse.json(
      { error: "An error occurred during payment verification" },
      { status: 500 },
    );
  }
}
