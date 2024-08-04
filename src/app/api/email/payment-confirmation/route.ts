import { NextResponse, NextRequest } from 'next/server';
import { transporter } from "@/lib/server-utils";
import { getBookingDetails } from "@/db/queries";

export async function POST(request: NextRequest) {
    console.log("Email Request received");

    const { bookingId } = await request.json(); // Assume bookingId is sent in the request body
    const token = "abcd";
    try {
        // Fetch booking details from the database
        const bookingDetails = await getBookingDetails(bookingId);

        if (!bookingDetails.length) {
            return NextResponse.json({ message: "No booking found" }, { status: 404 });
        }

        const { guestName, guestEmail, guestPhone, roomNumber, bedCode, totalAmount } = bookingDetails[0];

        // Construct the email content
        const mailContent = `
            <h1>Hurrah! Your payment has been verified</h1>
            <p>Dear ${guestName},</p>
            <p>Thank you for your booking!</p>
            <h2>Booking Details:</h2>
            <ul>
                <li><strong>Room Number:</strong> ${roomNumber}</li>
                <li><strong>Bed Code:</strong> ${bedCode}</li>
                <li><strong>Guest Phone:</strong> ${guestPhone}</li>
                <li><strong>Total Amount:</strong> ₹${totalAmount}</li>
            </ul>
            <p>Best Regards,<br>Your Hostel Team</p>
            <p>support@aligarhhostel.com</p>
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
        return NextResponse.json({ message: "COULD NOT SEND MESSAGE" }, { status: 500 });
    }
}