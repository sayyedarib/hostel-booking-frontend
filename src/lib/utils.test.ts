import { describe, expect, it } from "vitest";

import { calculateRent, checkOverlap, cn, formatDate } from "./utils";

const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("cn", () => {
  it("merges conditional classes", () => {
    expect(cn("p-2", false && "hidden", "text-sm")).toBe("p-2 text-sm");
  });

  it("lets a later Tailwind class win over an earlier conflicting one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatDate", () => {
  it("renders a readable date", () => {
    expect(formatDate(new Date(2025, 0, 15))).toBe("Wed, Jan 15, 2025");
  });
});

describe("calculateRent", () => {
  const MONTHLY = 6000;

  it("prorates a stay shorter than a month", () => {
    const result = calculateRent(MONTHLY, date("2025-01-01"), date("2025-01-11"));
    // 10 days at 6000/30 = 200/day
    expect(result.totalRent).toBe(2000);
    expect(result.payableRent).toBe(2000);
    expect(result.pendingRent).toBe(0);
  });

  it("charges one month up front for a stay of exactly 30 days", () => {
    const result = calculateRent(MONTHLY, date("2025-01-01"), date("2025-01-31"));
    expect(result.totalRent).toBe(MONTHLY);
    expect(result.payableRent).toBe(MONTHLY);
    expect(result.pendingRent).toBe(0);
  });

  it("splits a multi-month stay into payable now and pending", () => {
    // 75 days = 2 months + 15 days
    const result = calculateRent(MONTHLY, date("2025-01-01"), date("2025-03-17"));
    expect(result.totalRent).toBe(2 * MONTHLY + 15 * (MONTHLY / 30));
    expect(result.payableRent).toBe(MONTHLY);
    expect(result.pendingRent).toBe(result.totalRent - result.payableRent);
  });

  it("keeps total = payable + pending for every stay length", () => {
    for (let days = 1; days <= 200; days++) {
      const checkOut = new Date(date("2025-01-01"));
      checkOut.setUTCDate(checkOut.getUTCDate() + days);
      const { totalRent, payableRent, pendingRent } = calculateRent(
        MONTHLY,
        date("2025-01-01"),
        checkOut,
      );
      expect(payableRent + pendingRent).toBeCloseTo(totalRent, 6);
    }
  });

  it("never returns a negative amount", () => {
    const result = calculateRent(MONTHLY, date("2025-01-10"), date("2025-01-10"));
    expect(result.totalRent).toBeGreaterThanOrEqual(0);
    expect(result.payableRent).toBeGreaterThanOrEqual(0);
    expect(result.pendingRent).toBeGreaterThanOrEqual(0);
  });
});

describe("checkOverlap", () => {
  const occupied = [
    { startDate: date("2025-03-10"), endDate: date("2025-03-20") },
    { startDate: date("2025-04-01"), endDate: date("2025-04-05") },
  ];

  it("detects a range fully inside a booked range", () => {
    expect(
      checkOverlap({ from: date("2025-03-12"), to: date("2025-03-15") }, occupied),
    ).toBe(true);
  });

  it("detects a range that straddles the start of a booking", () => {
    expect(
      checkOverlap({ from: date("2025-03-05"), to: date("2025-03-12") }, occupied),
    ).toBe(true);
  });

  it("treats a shared boundary date as an overlap", () => {
    expect(
      checkOverlap({ from: date("2025-03-20"), to: date("2025-03-25") }, occupied),
    ).toBe(true);
  });

  it("returns false for a gap between bookings", () => {
    expect(
      checkOverlap({ from: date("2025-03-22"), to: date("2025-03-28") }, occupied),
    ).toBe(false);
  });

  it("returns false when nothing is booked", () => {
    expect(
      checkOverlap({ from: date("2025-03-22"), to: date("2025-03-28") }, []),
    ).toBe(false);
  });
});
