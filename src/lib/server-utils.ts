import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import { env, isEmailConfigured } from "@/env";
import { logger } from "@/lib/utils";

const SMTP_HOST = "smtpout.secureserver.net";
const SMTP_PORT = 465;

let cachedTransporter: Transporter | null = null;

/**
 * Lazily creates the SMTP transport.
 *
 * Built on demand rather than at module load so that importing this file does
 * not fail when SMTP credentials are absent (local development, CI).
 */
function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
  });

  return cachedTransporter;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
}) => {
  if (!isEmailConfigured) {
    logger("error", "Email not sent: SMTP credentials are not configured", {
      to,
      subject,
    });
    throw new Error("Email is not configured on this deployment.");
  }

  try {
    const info = await getTransporter().sendMail({
      from: env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    logger("info", "Email sent", { to, subject, messageId: info.messageId });
    return info;
  } catch (error) {
    logger("error", "Error sending email", { to, subject, error });
    throw error;
  }
};
