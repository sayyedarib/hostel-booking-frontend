import { describe, expect, it } from "vitest";

import { fillMissingMonths, type MonthlyPoint } from "./time-series";

const utc = (year: number, month: number) => new Date(Date.UTC(year, month - 1, 1));
const point = (
  year: number,
  month: number,
  revenue: number,
  bookings: number,
): MonthlyPoint => ({
  month: utc(year, month).toISOString(),
  revenue,
  bookings,
});

describe("fillMissingMonths", () => {
  it("emits one point per month across the range", () => {
    const filled = fillMissingMonths([], utc(2025, 1), utc(2025, 6));
    expect(filled).toHaveLength(6);
    expect(filled.every((p) => p.revenue === 0 && p.bookings === 0)).toBe(true);
  });

  // The reason this exists: two populated months a year apart used to be drawn
  // as one straight line, implying revenue in every month between them.
  it("inserts zero months between populated ones", () => {
    const filled = fillMissingMonths(
      [point(2025, 7, 42350, 1), point(2026, 7, 212781, 3)],
      utc(2025, 7),
      utc(2026, 7),
    );

    expect(filled).toHaveLength(13);
    expect(filled[0].revenue).toBe(42350);
    expect(filled[12].revenue).toBe(212781);
    expect(filled.slice(1, 12).every((p) => p.revenue === 0)).toBe(true);
  });

  it("preserves the values of populated months", () => {
    const filled = fillMissingMonths(
      [point(2025, 3, 2500, 1)],
      utc(2025, 1),
      utc(2025, 4),
    );
    expect(filled[2]).toMatchObject({ revenue: 2500, bookings: 1 });
  });

  it("returns months in chronological order", () => {
    const filled = fillMissingMonths(
      [point(2026, 7, 1, 1), point(2025, 7, 2, 2)],
      utc(2025, 7),
      utc(2026, 7),
    );
    const times = filled.map((p) => new Date(p.month).getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("keeps July 2025 and July 2026 as distinct buckets", () => {
    const filled = fillMissingMonths(
      [point(2025, 7, 100, 1), point(2026, 7, 900, 9)],
      utc(2025, 7),
      utc(2026, 7),
    );
    const july2025 = filled.find((p) => p.month.startsWith("2025-07"));
    const july2026 = filled.find((p) => p.month.startsWith("2026-07"));
    expect(july2025?.revenue).toBe(100);
    expect(july2026?.revenue).toBe(900);
  });

  it("handles a single-month range", () => {
    const filled = fillMissingMonths([], utc(2025, 5), utc(2025, 5));
    expect(filled).toHaveLength(1);
  });

  it("ignores the day-of-month in the range bounds", () => {
    const filled = fillMissingMonths(
      [],
      new Date(Date.UTC(2025, 0, 31)),
      new Date(Date.UTC(2025, 2, 2)),
    );
    expect(filled.map((p) => p.month.slice(0, 7))).toEqual([
      "2025-01",
      "2025-02",
      "2025-03",
    ]);
  });
});
