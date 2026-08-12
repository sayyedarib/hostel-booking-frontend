import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { UserTable } from "@/db/schema";
import type { CreateUser } from "@/interface";
import { logger } from "@/lib/utils";

/**
 * User provisioning used by the Clerk webhook.
 *
 * These deliberately live outside `src/db/queries`, which is a `"use server"`
 * module: every export there becomes a publicly callable endpoint, and account
 * creation must only ever be driven by a signature-verified webhook.
 */

/** Returns the internal user id for a Clerk id, or null when absent. */
export async function findUserIdByClerkId(
  clerkId: string,
): Promise<number | null> {
  const [user] = await db
    .select({ id: UserTable.id })
    .from(UserTable)
    .where(eq(UserTable.clerkId, clerkId))
    .limit(1);

  return user?.id ?? null;
}

/**
 * Creates the user record for a newly registered Clerk account.
 *
 * Idempotent: Clerk retries webhook deliveries, so an existing record is
 * returned rather than duplicated.
 */
export async function provisionUser({
  clerkId,
  name,
  phone = "",
  email,
  imageUrl,
}: CreateUser): Promise<number | null> {
  try {
    const existingId = await findUserIdByClerkId(clerkId);
    if (existingId) {
      logger("info", "User already provisioned", { clerkId });
      return existingId;
    }

    const [user] = await db
      .insert(UserTable)
      .values({ clerkId, name, phone, email, imageUrl })
      .returning({ id: UserTable.id });

    logger("info", "User provisioned", { clerkId });
    return user?.id ?? null;
  } catch (error) {
    logger("error", "Failed to provision user", { clerkId, error });
    return null;
  }
}
