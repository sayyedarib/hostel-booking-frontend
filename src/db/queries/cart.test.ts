import { beforeEach, describe, expect, it, vi } from "vitest";
import { drizzle } from "drizzle-orm/pg-proxy";

/**
 * These tests run the real query builders against a proxy driver, so the SQL
 * asserted on here is the SQL the action would send to Postgres. A missing
 * `where` clause shows up as a missing predicate in the captured statement,
 * which is exactly the failure mode being guarded against.
 */

const authMock = vi.fn();

interface ExecutedQuery {
  sql: string;
  params: unknown[];
}

const executed: ExecutedQuery[] = [];

/** Rows the driver hands back, matched by a fragment of the statement. */
let stubbedRows: { fragment: string; rows: unknown[][] }[] = [];

vi.mock("@clerk/nextjs/server", () => ({ auth: () => authMock() }));

vi.mock("@/db", () => ({
  db: drizzle(async (sql: string, params: unknown[]) => {
    executed.push({ sql, params });
    const stub = stubbedRows.find((candidate) =>
      sql.includes(candidate.fragment),
    );
    return { rows: stub ? stub.rows : [] };
  }),
}));

import { getCheckoutData } from "./cart";

const GUEST = { id: 7, clerkId: "clerk_guest", role: "guest" as const };

function signedInAs(user: typeof GUEST | null) {
  authMock.mockReturnValue({ userId: user?.clerkId ?? null });
  // The session lookup in requireUser() selects id, clerkId, role in that order.
  stubbedRows = [
    {
      fragment: 'from "user"',
      rows: user ? [[user.id, user.clerkId, user.role]] : [],
    },
  ];
}

/** The statement that reads the cart, as opposed to the session lookup. */
function cartQuery(): ExecutedQuery | undefined {
  return executed.find((query) => query.sql.includes('from "cart"'));
}

describe("getCheckoutData", () => {
  beforeEach(() => {
    authMock.mockReset();
    executed.length = 0;
    stubbedRows = [];
  });

  // Regression: the checkout summary used to read every row in the cart table
  // because the query had no `where` clause. A user with one bed in their cart
  // saw all 24 beds in the system, the names of other users' guests, and was
  // asked to pay the sum of everybody's rent.
  it("reads only the signed-in user's cart rows", async () => {
    signedInAs(GUEST);

    await getCheckoutData();

    const query = cartQuery();
    expect(query).toBeDefined();
    expect(query!.sql).toContain('"cart"."user_id" =');
    expect(query!.params).toContain(GUEST.id);
  });

  it("does not touch the cart for an anonymous caller", async () => {
    signedInAs(null);

    const result = await getCheckoutData();

    expect(result.status).toBe("error");
    expect(result.data).toBeNull();
    expect(cartQuery()).toBeUndefined();
  });
});
