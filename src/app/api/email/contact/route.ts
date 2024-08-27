// pages/api/contact.js

import { sendEmail } from "@/lib/server-utils";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    logger("info", "Received contact form submission email request");
    const data = await request.json(); // Ensure data is awaited if it's a promise

    logger("info", "Contact form data", data);

    try {
      // Send email to the user
      await sendEmail({
        to: data.email,
        subject: "Thank you for your query",
        text: `Hi ${data.name},\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest regards,\nYour Company`,
        html: `<p>Hi ${data.name},</p><p>Thank you for reaching out to us. We have received your message and will get back to you shortly.</p><p>Best regards,<br>Your Company</p>`,
      });

      // Send email to the admin
      await sendEmail({
        to: "support@aligarhhostel.com",
        subject: "New Contact Form Submission",
        text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
        html: `<p><strong>Name:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Message:</strong> ${data.message}</p>`,
      });
    } catch (error) {
      logger("error", "Failed to send email", error as Error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
