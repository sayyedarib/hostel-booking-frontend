import { NextResponse, NextRequest } from "next/server";
import { transporter } from "@/lib/server-utils";
import { getBookingDetails } from "@/db/queries";
import { logger } from "@/lib/utils";
import axios from "axios";

export const maxDuration = 55;

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    logger("info", "Sending emails for booking confirmation", requestData);
    const { bookingId, token } = requestData;

    logger("info", `Checking for Booking ID: ${bookingId}`);
    const { data: bookingDetails } = await getBookingDetails(Number(bookingId));

    if (!bookingDetails) {
      logger("error", "Booking not found");
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const confirmationLink = `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://aligarhhostel.com"}/api/email/payment-confirmation?id=${bookingDetails.id}&token=${token}`;


    logger("info", "Fetching invoice PDF");
    const invoicePdf = await axios.get(bookingDetails.invoiceUrl, {
      responseType: "arraybuffer",
    });

    const bedBookingsHtml = bookingDetails.bedBookings
      .map(
        (booking) => `
      <tr>
        <td>${booking.roomCode}</td>
        <td>${booking.bedCode}</td>
        <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
        <td>${new Date(booking.checkOut).toLocaleDateString()}</td>
      </tr>
    `,
      )
      .join("");

    const mailContent = `
      <h1>Booking Confirmation</h1>
      <p>Dear Owner,</p>
      <p>Please confirm the payment from ${bookingDetails.userName}</p>
      <h2>Booking Details:</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Room Code</th>
          <th>Bed Code</th>
          <th>Check In</th>
          <th>Check Out</th>
        </tr>
        ${bedBookingsHtml}
      </table>
      <p><strong>Guest Phone:</strong> ${bookingDetails.userPhone}</p>
      <p><strong>Total Amount:</strong> ₹${bookingDetails.amount}</p>
      <p>To confirm the payment, please click the link below:</p>
      <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Confirm Payment</a>
      <p>Best Regards,<br>Your Hostel Team</p>
    `;

    try {
      logger("info", "Sending emails to owner");

      await transporter.sendMail({
        from: "support@aligarhhostel.com",
        to: ["sayyedaribhussain4321@gmail.com"],
        subject: `Booking Verification for ${bookingDetails.userName}`,
        html: mailContent,
        attachments: [
          {
            filename: "invoice.pdf",
            content: invoicePdf.data,
          },
        ],
      });
    } catch (error) {
      logger("error", "Error sending emails to owner", error as Error);
      return NextResponse.json(
        { message: "COULD NOT SEND MESSAGES TO OWNER" },
        { status: 500 },
      );
    }

    // Send email to user
    const userMailContent = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${bookingDetails.userName},</p>
      <p>Thank you for your booking. Your payment is being processed and will be confirmed shortly.</p>
      <h2>Booking Details:</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Room Number</th>
          <th>Bed Number</th>
          <th>Check In</th>
          <th>Check Out</th>
        </tr>
        ${bedBookingsHtml}
      </table>
      <p><strong>Total Amount:</strong> ₹${bookingDetails.amount}</p>
      <p>We have attached your agreement and invoice to this email.</p>
      <p>Best Regards,<br>Your Hostel Team</p>
    `;

    try {
      logger("info", "Sending emails to user", {
        email: bookingDetails?.userEmail,
      });
      await transporter.sendMail({
        from: "support@aligarhhostel.com",
        to: bookingDetails.userEmail,
        subject: "Booking Confirmation",
        html: userMailContent,
        attachments: [
          {
            filename: "invoice.pdf",
            content: invoicePdf.data,
          },
        ],
      });
    } catch (error) {
      logger("error", "Error sending emails to user", error as Error);
      return NextResponse.json(
        { message: "COULD NOT SEND MESSAGES TO USER" },
        { status: 500 },
      );
    }

    logger("info", "Emails sent successfully");
    return NextResponse.json({ message: "Success: emails were sent" });
  } catch (error) {
    logger("error", "Error processing request", error as Error);
    return NextResponse.json(
      { message: "COULD NOT PROCESS REQUEST" },
      { status: 500 },
    );
  }
}
