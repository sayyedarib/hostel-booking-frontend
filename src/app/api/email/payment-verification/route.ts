import { NextResponse, NextRequest } from "next/server";
import { transporter } from "@/lib/server-utils";
import { getBookingDetails } from "@/db/queries";

export async function POST(request: NextRequest) {
  console.log("Email Request received");

  const { bookingIds } = await request.json(); // Assume bookingId is sent in the request body
  
  if(typeof bookingIds == "string") {
  }
  
  let bookingId = Number(bookingIds.split(",")[0]);
    

  try {
    // Fetch booking details from the database
    const bookingDetails = await getBookingDetails(bookingId);

    if (!bookingDetails.length) {
      return NextResponse.json(
        { message: "No booking found" },
        { status: 404 }
      );
    }

    const { guestName, guestPhone, roomNumber, bedCode, totalAmount, token } =
      bookingDetails[0];

    // Construct the email content
    const mailContent = `
            <h1>Booking Confirmation</h1>
            <p>Dear Owner,</p>
            <p>Please confirm the payment of ${guestName}</p>
            <h2>Booking Details:</h2>
            <ul>
                <li><strong>Room Number:</strong> ${roomNumber}</li>
                <li><strong>Bed Code:</strong> ${bedCode}</li>
                <li><strong>Guest Phone:</strong> ${guestPhone}</li>
                <li><strong>Total Amount:</strong> ₹${totalAmount}</li>
            </ul>
            <p>To confirm your payment, please click the link below:</p>
            <a href="${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://aligarhhostel.com"}/api/payment-verification?token=${token}">Payment Confirmation</a>
            <p>Best Regards,<br>Your Hostel Team</p>
        `;

    // Send the email
    await transporter.sendMail({
      from: "support@aligarhhostel.com",
      to: "sayyedaribhussain4321@gmail.com", // Replace with the owner's email
      subject: `Booking Verification for ${guestName}`,
      html: mailContent,
    });

    return NextResponse.json({ message: "Success: email was sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "COULD NOT SEND MESSAGE" },
      { status: 500 }
    );
  }
}
