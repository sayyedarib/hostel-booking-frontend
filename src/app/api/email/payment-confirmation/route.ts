import { NextResponse, NextRequest } from "next/server";
import { transporter } from "@/lib/server-utils";
import { getBookingDetails, getConfirmation } from "@/db/queries";

export async function GET(request: NextRequest) {
  console.log("Email Request received");

  //   const { bookingId, guestEmail, guestName, room, checkIn, checkOut, totalAmount } = await request.json(); // Assume bookingId is sent in the request body
  const { searchParams } = new URL(request.url);
  const confirmationId = searchParams.get("id");

  const confirmationData = await getConfirmation(Number(confirmationId));

  if (!confirmationData.length) {
    return NextResponse.json(
      { message: "No confirmation found" },
      { status: 404 },
    );
  }

  const {
    guestName,
    guestEmail,
    guestPhone,
    room,
    checkIn,
    checkOut,
    totalAmount,
  } = confirmationData[0];
  try {
    // Fetch booking details from the database
    // const bookingDetails = await getBookingDetails(bookingId);

    // if (!bookingDetails.length) {
    //   return NextResponse.json(
    //     { message: "No booking found" },
    //     { status: 404 },
    //   );
    // }

    // const {
    //   guestName,
    //   guestEmail,
    //   guestPhone,
    //   roomNumber,
    //   bedCode,
    //   totalAmount,
    // } = bookingDetails[0];

    // Construct the email content
    const mailContent = `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
        }
        .content {
            margin: 20px 0;
        }
        .content p {
            line-height: 1.6;
        }
        .content ul {
            list-style: none;
            padding: 0;
        }
        .content ul li {
            padding: 5px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmed! 🌟</h1>
        </div>
        <div class="content">
            <p>Dear ${guestName},</p>
            <p>We are delighted to confirm your reservation at Campus View Apartment. Your stay is just around the corner, and we are excited to host you!</p>
            <p><strong>Reservation Details:</strong></p>
            <ul>
                <li><strong>Room:</strong> ${room}</li>
                <li><strong>Check-in Date:</strong> ${checkIn}</li>
                <li><strong>Check-out Date:</strong> ${checkOut}</li>
            </ul>

              <strong>Total Amount Paid:</strong> ₹${totalAmount}
            <p>Your comfortable retreat on the 5th floor is ready, and we are here to ensure you have a fantastic stay. If you have any questions or need assistance, don’t hesitate to reach out.</p>
        </div>
        <div class="footer">
            <p>Thank you for choosing Campus View Apartment. We look forward to welcoming you soon!</p>
            <p>Warm regards,<br>Team Khan Group of PG<br>Khan Group of PG<br>+91 8791476473<br><a href="mailto:[Your Email Address]">support@aligarhhostel.com</a></p>
        </div>
    </div>
</body>
</html>
    `;

    // Send the email
    await transporter.sendMail({
      from: "support@aligarhhostel.com",
      to: guestEmail,
      subject: `Payment Confirmed`,
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
