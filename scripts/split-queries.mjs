/**
 * One-off codemod: splits the monolithic src/db/queries/index.ts into modules
 * grouped by domain, leaving index.ts as a barrel that re-exports them.
 *
 * Every module keeps the `"use server"` directive, because each export is still
 * a server action and Next requires the directive per file. Import sites are
 * unchanged — they continue to import from "@/db/queries".
 *
 * Kept in the repo as a record of how the split was produced.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SOURCE = "src/db/queries/index.ts";
const OUT_DIR = "src/db/queries";

/** Which module each action belongs to. */
const DOMAINS = {
  users: [
    "getUserId",
    "getUserData",
    "getUserOnboardingStatus",
    "createAddress",
    "updateUserSubProfile",
    "updateUserSignature",
    "updateUserDetails",
    "updateAddressAndGuardian",
    "getUsersData",
    "getUserDataById",
    "updateUserPersonalDetails",
    "updateUserSignatureByUserId",
    "updateGuardianIdImage",
    "updateUserIdImage",
    "updateGuardianPhoto",
    "updateUserImageUrl",
  ],
  rooms: [
    "markRoomAsOccupied",
    "markRoomAsAvailable",
    "getAllRoomCards",
    "getBedData",
    "getRoomData",
    "getAdminRoomData",
    "getRoomById",
    "addBedToRoom",
    "updateRoomDetails",
    "updateBedDetails",
    "updateBedStatus",
    "addRoomImage",
    "deleteImage",
    "createRoom",
  ],
  cart: [
    "getCartBedsOfRoom",
    "getBedsInCart",
    "addToCart",
    "getCartItems",
    "getCheckoutData",
    "getCartItemsCount",
    "removeFromCart",
  ],
  guests: ["getGuests", "createGuest", "getGuestBookings", "getGuest", "getGuestsAdmin", "deleteGuest"],
  bookings: [
    "getSecurityDepositStatus",
    "getAgreementFormData",
    "createBooking",
    "getBookingDetails",
  ],
  billing: [
    "getUserTransactions",
    "getInvoiceDetails",
    "getAnalyticsData",
    "getRevenueAndBookingsData",
    "getTransactionsAdmin",
  ],
};

const source = readFileSync(SOURCE, "utf8");
const lines = source.split("\n");

// Everything before the first export is shared preamble: imports and helpers.
const firstExport = lines.findIndex((l) => /^export const \w+ = async/.test(l));
const preamble = lines.slice(0, firstExport).join("\n").trimEnd();

// Slice the file into one block per exported action.
const starts = [];
lines.forEach((line, index) => {
  if (/^export const \w+ = async/.test(line)) {
    starts.push({ index, name: line.match(/^export const (\w+)/)[1] });
  }
});

const blocks = new Map();
starts.forEach((start, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
  blocks.set(start.name, lines.slice(start.index, end).join("\n").trimEnd());
});

// Helpers defined in the preamble that individual modules need.
const SHARED_HELPERS = ["getClerkId", "BOOKING_LEAD_DAYS", "UPLOADABLE_DOCUMENT_COLUMNS", "updateUserDocument"];

const assigned = new Set(Object.values(DOMAINS).flat());
const unassigned = [...blocks.keys()].filter((name) => !assigned.has(name));
if (unassigned.length) {
  console.error("Unassigned actions:", unassigned.join(", "));
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const header = `"use server";
/*
 * Split out of a single 2,200-line module. Every export here is a Next.js
 * server action — a publicly reachable HTTP endpoint — so each one authorizes
 * itself via requireUser/requireAdmin from @/lib/auth.
 */
`;

for (const [domain, names] of Object.entries(DOMAINS)) {
  const body = names.map((name) => blocks.get(name)).join("\n\n");
  writeFileSync(`${OUT_DIR}/${domain}.ts`, `${header}\n${preamble}\n\n${body}\n`);
  console.log(`${domain}.ts: ${names.length} actions`);
}

const barrel = `"use server";
/**
 * Barrel for the query modules.
 *
 * Import sites use "@/db/queries" and do not need to know which domain module
 * an action lives in.
 */

${Object.keys(DOMAINS)
  .map((d) => `export * from "./${d}";`)
  .join("\n")}
`;
writeFileSync(`${OUT_DIR}/index.ts`, barrel);
console.log("index.ts: barrel written");
