import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const limitMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({ auth: () => authMock() }));

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({ limit: (...args: unknown[]) => limitMock(...args) }),
      }),
    }),
  },
}));

import {
  ForbiddenError,
  UnauthorizedError,
  getSessionUser,
  isAdmin,
  requireAdmin,
  requireUser,
  resolveTargetUserId,
} from "./auth";

const GUEST = { id: 7, clerkId: "clerk_guest", role: "guest" as const };
const ADMIN = { id: 1, clerkId: "clerk_admin", role: "admin" as const };

/** Simulates a session: `null` means no signed-in Clerk user. */
function signedInAs(user: typeof GUEST | typeof ADMIN | null) {
  authMock.mockReturnValue({ userId: user?.clerkId ?? null });
  limitMock.mockResolvedValue(user ? [user] : []);
}

describe("auth", () => {
  beforeEach(() => {
    authMock.mockReset();
    limitMock.mockReset();
  });

  describe("getSessionUser", () => {
    it("returns null when there is no Clerk session", async () => {
      signedInAs(null);
      await expect(getSessionUser()).resolves.toBeNull();
    });

    it("returns null when the Clerk user has no local record", async () => {
      authMock.mockReturnValue({ userId: "clerk_unknown" });
      limitMock.mockResolvedValue([]);
      await expect(getSessionUser()).resolves.toBeNull();
    });

    it("returns the local user for a valid session", async () => {
      signedInAs(GUEST);
      await expect(getSessionUser()).resolves.toEqual(GUEST);
    });
  });

  describe("requireUser", () => {
    it("throws for an anonymous caller", async () => {
      signedInAs(null);
      await expect(requireUser()).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("returns the user when signed in", async () => {
      signedInAs(GUEST);
      await expect(requireUser()).resolves.toEqual(GUEST);
    });
  });

  describe("requireAdmin", () => {
    it("throws Unauthorized for an anonymous caller", async () => {
      signedInAs(null);
      await expect(requireAdmin()).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("throws Forbidden for a signed-in non-admin", async () => {
      signedInAs(GUEST);
      await expect(requireAdmin()).rejects.toBeInstanceOf(ForbiddenError);
    });

    it("returns the user for an admin", async () => {
      signedInAs(ADMIN);
      await expect(requireAdmin()).resolves.toEqual(ADMIN);
    });
  });

  describe("isAdmin", () => {
    it.each([
      ["anonymous", null, false],
      ["guest", GUEST, false],
      ["admin", ADMIN, true],
    ])("is %s -> %s", async (_label, user, expected) => {
      signedInAs(user);
      await expect(isAdmin()).resolves.toBe(expected);
    });
  });

  describe("resolveTargetUserId", () => {
    it("falls back to the session user when no id is given", async () => {
      signedInAs(GUEST);
      await expect(resolveTargetUserId()).resolves.toBe(GUEST.id);
      await expect(resolveTargetUserId(null)).resolves.toBe(GUEST.id);
    });

    it("allows a user to target their own id", async () => {
      signedInAs(GUEST);
      await expect(resolveTargetUserId(GUEST.id)).resolves.toBe(GUEST.id);
    });

    // The regression this whole module exists to prevent: passing an explicit
    // userId used to override the session and expose another user's records.
    it("refuses to let a guest target another user", async () => {
      signedInAs(GUEST);
      await expect(resolveTargetUserId(GUEST.id + 1)).rejects.toBeInstanceOf(
        ForbiddenError,
      );
    });

    it("lets an admin target another user", async () => {
      signedInAs(ADMIN);
      await expect(resolveTargetUserId(999)).resolves.toBe(999);
    });

    it("refuses an anonymous caller even with an explicit id", async () => {
      signedInAs(null);
      await expect(resolveTargetUserId(1)).rejects.toBeInstanceOf(
        UnauthorizedError,
      );
    });
  });
});
