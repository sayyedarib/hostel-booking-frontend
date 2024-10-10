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
    const { bookingId, token, userEmail, userName, userPhone, amount } =
      requestData;

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
      <p>Please confirm the payment from ${userName}</p>
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
      <p><strong>Guest Phone:</strong> ${userPhone}</p>
      <p><strong>Total Amount:</strong> ₹${amount}</p>
      <p>To confirm the payment, please click the link below:</p>
      <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Confirm Payment</a>
      <p>Best Regards,<br>Your Hostel Team</p>
    `;

    try {
      logger("info", "Sending emails to owner");

      await transporter.sendMail({
        from: "support@aligarhhostel.com",
        to: ["sayyedaribhussain4321@gmail.com"],
        subject: `Booking Verification for ${userName}`,
        html: mailContent,
        // attachments: [
        //   {
        //     filename: "invoice.pdf",
        //     content: invoicePdf.data,
        //   },
        // ],
      });
    } catch (error) {
      console.log("error in sending email ", error);
      logger("error", "Error sending emails to owner", error as Error);
      return NextResponse.json(
        { message: "COULD NOT SEND MESSAGES TO OWNER" },
        { status: 500 },
      );
    }

    // Send email to user
    const userMailContent = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${userName},</p>
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
      <p><strong>Total Amount:</strong> ₹${amount}</p>
      <p>An Invoice will be sent shortly after payment verification.</p>
      <p>Best Regards,<br>Khan Group Of Hostel</p>
    `;

    try {
      logger("info", "Sending emails to user", {
        email: userEmail,
      });
      await transporter.sendMail({
        from: "support@aligarhhostel.com",
        to: userEmail,
        subject: "Booking Confirmation",
        html: userMailContent,
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
