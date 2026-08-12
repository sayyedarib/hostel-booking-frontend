/**
 * One-off codemod: inserts an authorization guard as the first statement of the
 * `try` block of each server action in src/db/queries/index.ts.
 *
 * Kept in the repo as a record of how the guards were applied; it is idempotent
 * and safe to re-run.
 */
import fs from "node:fs";

const FILE = "src/db/queries/index.ts";

/** Actions only an admin may invoke. */
const ADMIN = [
  "markRoomAsOccupied",
  "markRoomAsAvailable",
  "getAdminRoomData",
  "getGuestBookings",
  "getGuest",
  "getUsersData",
  "getAnalyticsData",
  "getGuestsAdmin",
  "deleteGuest",
  "getRoomById",
  "addBedToRoom",
  "updateRoomDetails",
  "updateBedDetails",
  "updateBedStatus",
  "addRoomImage",
  "deleteImage",
  "createRoom",
  "getRevenueAndBookingsData",
  "getBookingDetails",
];

/** Actions that require a signed-in user (any role). */
const AUTHENTICATED = ["createAddress", "getCheckoutData"];

/** Deliberately public: browsing rooms does not require an account. */
const PUBLIC = ["getAllRoomCards", "getBedData", "getRoomData"];

const GUARDS = {
  admin: "    await requireAdmin();",
  user: "    await requireUser();",
};

const source = fs.readFileSync(FILE, "utf8");
const lines = source.split("\n");

const guardFor = (name) => {
  if (ADMIN.includes(name)) return GUARDS.admin;
  if (AUTHENTICATED.includes(name)) return GUARDS.user;
  return null;
};

let inserted = 0;
const out = [];

for (let i = 0; i < lines.length; i++) {
  out.push(lines[i]);

  const match = lines[i].match(/^export const (\w+) = async/);
  if (!match) continue;

  const guard = guardFor(match[1]);
  if (!guard) continue;

  // Find the opening `try {` that starts this action's body.
  let j = i;
  while (j < lines.length && lines[j].trim() !== "try {") j++;
  if (j >= lines.length || j - i > 12) continue;

  // Already guarded?
  if (lines[j + 1]?.includes("requireAdmin()") || lines[j + 1]?.includes("requireUser()")) {
    continue;
  }

  for (let k = i + 1; k <= j; k++) out.push(lines[k]);
  out.push(guard);
  inserted++;
  i = j;
}

fs.writeFileSync(FILE, out.join("\n"));
console.log(`Inserted ${inserted} guards.`);
console.log(`Public by design (${PUBLIC.length}): ${PUBLIC.join(", ")}`);
