import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { siteConfig } from "@/config/site";
import { clientIp, escapeHtml, rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/server-utils";
import { logger } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("A valid email address is required").max(254),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export async function POST(request: NextRequest) {
  // The endpoint sends mail to a caller-supplied address, which makes it a
  // spam relay without a cap. Five submissions per IP per 10 minutes.
  const { allowed, retryAfterSeconds } = rateLimit({
    key: `contact:${clientIp(request)}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 },
    );
  }

  const { name, email, phone, message } = parsed.data;

  try {
    // Every interpolated value is escaped: these strings come straight from a
    // public form and previously went into the email HTML unmodified.
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: phone ? escapeHtml(phone) : "",
      message: escapeHtml(message).replace(/\n/g, "<br>"),
    };

    await sendEmail({
      to: [...siteConfig.contact.notificationRecipients],
      subject: `Website enquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <p><strong>Name:</strong> ${safe.name}</p>
        <p><strong>Email:</strong> ${safe.email}</p>
        ${safe.phone ? `<p><strong>Phone:</strong> ${safe.phone}</p>` : ""}
        <p><strong>Message:</strong><br>${safe.message}</p>
      `,
    });

    // The acknowledgement deliberately echoes none of the submitted content,
    // so the endpoint cannot be used to deliver text to a third party. It also
    // used to sign off as "Your Company".
    await sendEmail({
      to: email,
      subject: `We received your message — ${siteConfig.name}`,
      text: `Hi ${name},\n\nThanks for getting in touch with ${siteConfig.name}. We have received your message and will reply shortly.\n\nIf it is urgent, call us on ${siteConfig.contact.phone}.\n\n— ${siteConfig.name}`,
      html: `
        <p>Hi ${safe.name},</p>
        <p>Thanks for getting in touch with ${siteConfig.name}. We have received
           your message and will reply shortly.</p>
        <p>If it is urgent, call us on ${siteConfig.contact.phone}.</p>
        <p>— ${siteConfig.name}</p>
      `,
    });

    return NextResponse.json({ message: "Message sent" });
  } catch (error) {
    logger("error", "Failed to send contact email", { error });
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 },
    );
  }
}
