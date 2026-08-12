import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { UserTable } from "@/db/schema";
import { resolveTargetUserId } from "@/lib/auth";
import { logger } from "@/lib/utils";

/**
 * Helpers shared by the query modules.
 *
 * Deliberately *not* a `"use server"` module: nothing here should become a
 * publicly callable endpoint. The domain modules import from it; the browser
 * never can.
 */

/**
 * Columns a user may set on their own record by uploading a file.
 *
 * Replaces an earlier `updateUserData(userId, field, value)` that took the
 * column name from the caller, which allowed writing any column on any row.
 */
const UPLOADABLE_DOCUMENT_COLUMNS = {
  signature: UserTable.signature,
  idUrl: UserTable.idUrl,
  guardianIdUrl: UserTable.guardianIdUrl,
  guardianPhoto: UserTable.guardianPhoto,
  imageUrl: UserTable.imageUrl,
} as const;

export type UploadableDocument = keyof typeof UPLOADABLE_DOCUMENT_COLUMNS;

/**
 * Stores the URL of an uploaded document against a user record.
 *
 * The row is always resolved through {@link resolveTargetUserId}, so a caller
 * can only write to their own record unless they are an admin.
 */
export async function updateUserDocument(
  document: UploadableDocument,
  url: string,
  requestedUserId?: number | null,
) {
  try {
    const userId = await resolveTargetUserId(requestedUserId);

    if (!(document in UPLOADABLE_DOCUMENT_COLUMNS)) {
      logger("error", "Rejected write to non-uploadable column", { document });
      return { status: "error", data: null };
    }

    const result = await db
      .update(UserTable)
      .set({ [document]: url })
      .where(eq(UserTable.id, userId))
      .returning({ id: UserTable.id });

    if (result.length === 0) {
      logger("error", "User not found", { userId });
      return { status: "error", data: null };
    }

    logger("info", "Updated user document", { userId, document });
    return { status: "success", data: null };
  } catch (error) {
    logger("error", "Error updating user document", { document, error });
    return { status: "error", data: null };
  }
}
