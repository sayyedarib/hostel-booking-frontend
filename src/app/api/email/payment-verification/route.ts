import { NextResponse, NextRequest } from "next/server";
import { transporter } from "@/lib/server-utils";
import { getBookingDetails, createConfirmation } from "@/db/queries";

export async function POST(request: NextRequest) {
  console.log("Email Request received");

  const {
    guestName,
    guestPhone,
    guestEmail,
    roomNumber,
    totalAmount,
    checkIn,
    checkOut,
  } = await request.json(); // Assume bookingId is sent in the request body

  // if (typeof bookingIds == "string") {
  // }

  // let bookingId = Number(bookingIds.split(",")[0]);

  const confirmationId = await createConfirmation({
    guestName,
    guestPhone,
    guestEmail,
    room: roomNumber,
    totalAmount,
    checkIn,
    checkOut,
  });

  try {
    // Fetch booking details from the database
    // const bookingDetails = await getBookingDetails(bookingId);

    // if (!bookingDetails.length) {
    //   return NextResponse.json(
    //     { message: "No booking found" },
    //     { status: 404 },
    //   );
    // }

    // const { guestName, guestPhone, roomNumber, bedCode, totalAmount, token } =
    //   bookingDetails[0];

    // // Construct the email content

    const handleClick = async () => {
      await fetch("/api/email/payment-confirmation", {
        method: "POST",
        body: JSON.stringify({
          guestName,
          guestPhone,
          guestEmail,
          roomNumber,
          totalAmount,
          checkIn,
          checkOut,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      return NextResponse.redirect(
        `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://aligarhhostel.com"}/api/payment-verification`,
      );
    };

    const confirmationLink = `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://aligarhhostel.com"}/api/email/payment-confirmation?id=${confirmationId}`;
    const mailContent = `
            <h1>Booking Confirmation</h1>
            <p>Dear Owner,</p>
            <p>Please confirm the payment of ${guestName}</p>
            <h2>Booking Details:</h2>
            <ul>
                <li><strong>Room Number:</strong> ${roomNumber}</li>
                <li><strong>Check In:</strong> ${checkIn}</li>
                <li><strong>Check Out:</strong> ${checkOut}</li>
                <li><strong>Guest Phone:</strong> ${guestPhone}</li>
                <li><strong>Total Amount:</strong> ₹${totalAmount}</li>
            </ul>
            <p>To confirm your payment, please click the link below:</p>
    <a href="${confirmationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Confirm Payment</a>
            <p>Best Regards,<br>Your Hostel Team</p>
            `;

    // Send the email
    await transporter.sendMail({
      from: "support@aligarhhostel.com",
      to: [
        "sayyedaribhussain4321@gmail.com",
        "support@aligarhhostel.com",
        "hamzayaarkhan24@gmail.com",
      ], // Replace with the owner's email
      subject: `Booking Verification for ${guestName}`,
      html: mailContent,
    });

    return NextResponse.json({ message: "Success: email was sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "COULD NOT SEND MESSAGE" },
      { status: 500 },
    );
  }
}
