/**
 * Barrel for the query modules.
 *
 * Import sites use "@/db/queries" and do not need to know which domain module
 * an action lives in.
 *
 * No `"use server"` directive here on purpose: that directive only permits
 * async function exports, which `export *` is not. Each domain module carries
 * its own directive, so the re-exported functions are still server actions.
 */

export * from "./users";
export * from "./rooms";
export * from "./cart";
export * from "./guests";
export * from "./bookings";
export * from "./billing";
