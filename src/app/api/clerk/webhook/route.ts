import { headers } from "next/headers";
import { Webhook } from "svix";
import type { UserJSON, WebhookEvent } from "@clerk/nextjs/server";

import { provisionUser } from "@/db/internal/users";
import { env } from "@/env";
import { logger } from "@/lib/utils";

/**
 * Clerk webhook receiver. Creates the local user record when a Clerk account is
 * created.
 *
 * The payload is only trusted after the Svix signature verifies — the previous
 * implementation logged the signing secret and the full request body, both of
 * which end up in the hosting provider's log store.
 */
export async function POST(req: Request) {
  const signingSecret = env.CLERK_WEBHOOK_SECRET;

  if (!signingSecret) {
    logger("error", "CLERK_WEBHOOK_SECRET is not configured");
    return new Response("Webhook not configured", { status: 500 });
  }

  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  let event: WebhookEvent;
  try {
    event = new Webhook(signingSecret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    logger("error", "Clerk webhook signature verification failed", { error });
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "user.created") {
    // Acknowledge everything else so Clerk does not retry.
    return new Response("", { status: 200 });
  }

  const { id, first_name, last_name, email_addresses, image_url } =
    event.data as UserJSON;

  const email = email_addresses[0]?.email_address;
  if (!email) {
    logger("error", "Clerk user.created without an email address", { id });
    return new Response("Missing email address", { status: 400 });
  }

  const userId = await provisionUser({
    clerkId: id,
    name: [first_name, last_name].filter(Boolean).join(" ").trim() || "Guest",
    email,
    imageUrl: image_url,
  });

  if (userId === null) {
    // Signal failure so Clerk retries the delivery.
    return new Response("Failed to provision user", { status: 500 });
  }

  return new Response("", { status: 200 });
}
