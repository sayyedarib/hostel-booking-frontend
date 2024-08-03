import { Webhook } from "svix";

import { headers } from "next/headers";
import { UserJSON, WebhookEvent } from "@clerk/nextjs/server";

import {
  checkIfGuestExistsByClerkId,
  createGuestWithClerk,
} from "@/db/queries";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  const eventType = evt.type;
  console.log("clerk webhook body:", body);

  const {
    id,
    first_name,
    last_name,
    email_addresses,
    image_url,
    phone_numbers,
  } = evt.data as UserJSON;

  let userInfo = await checkIfGuestExistsByClerkId(id);

  if (eventType === "user.created") {
    const newUser = {
      name: first_name + " " + last_name,
      email: email_addresses[0]?.email_address as string,
      googlePic: image_url,
      phone: phone_numbers[0]?.phone_number as string,
      clerkId: id,
    };
    userInfo = await createGuestWithClerk(newUser);
  }

  return new Response("", { status: 200 });
}
