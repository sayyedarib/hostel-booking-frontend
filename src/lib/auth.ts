import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { UserTable } from "@/db/schema";

/**
 * Authorization helpers for server actions and route handlers.
 *
 * Everything in `src/db/queries` runs as a Next.js server action, which means
 * each exported function is a publicly reachable HTTP endpoint. Middleware
 * cannot protect them — an action can be invoked from any route, including
 * public ones — so authorization has to happen inside the action itself. These
 * helpers are the single place that decision is made.
 */

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have access to this resource.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface SessionUser {
  /** Internal `user.id`, the foreign key used across the schema. */
  id: number;
  clerkId: string;
  role: "guest" | "admin";
}

/** Returns the signed-in user, or null when there is no valid session. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const { userId: clerkId } = auth();
  if (!clerkId) return null;

  const [user] = await db
    .select({
      id: UserTable.id,
      clerkId: UserTable.clerkId,
      role: UserTable.role,
    })
    .from(UserTable)
    .where(eq(UserTable.clerkId, clerkId))
    .limit(1);

  return user ?? null;
}

/** Requires a signed-in user. Throws {@link UnauthorizedError} otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Requires an admin. Throws {@link ForbiddenError} for signed-in non-admins. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new ForbiddenError();
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === "admin";
}

/**
 * Resolves the user a request may act on.
 *
 * Callers may pass an explicit id, but only an admin is allowed to target
 * somebody other than themselves. This closes the IDOR where an optional
 * `userId` argument silently overrode the session.
 */
export async function resolveTargetUserId(
  requestedUserId?: number | null,
): Promise<number> {
  const user = await requireUser();

  if (requestedUserId == null || requestedUserId === user.id) {
    return user.id;
  }

  if (user.role !== "admin") throw new ForbiddenError();
  return requestedUserId;
}
