export interface MonthlyPoint {
  /** ISO timestamp for the first day of the month, in UTC. */
  month: string;
  revenue: number;
  bookings: number;
}

const monthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

/**
 * Expands a sparse monthly series into one point per month in the range.
 *
 * The query only returns months that had transactions. Plotting those directly
 * draws a straight line from one populated month to the next, which reads as
 * steady growth across months that in fact had no revenue at all. Filling the
 * gaps with explicit zeros makes the flat periods visible.
 */
export function fillMissingMonths(
  points: ReadonlyArray<MonthlyPoint>,
  start: Date,
  end: Date,
): MonthlyPoint[] {
  const byMonth = new Map(
    points.map((point) => [monthKey(new Date(point.month)), point]),
  );

  const filled: MonthlyPoint[] = [];
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
  );
  const last = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1);

  while (cursor.getTime() <= last) {
    const key = monthKey(cursor);
    filled.push(
      byMonth.get(key) ?? {
        month: cursor.toISOString(),
        revenue: 0,
        bookings: 0,
      },
    );
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return filled;
}
