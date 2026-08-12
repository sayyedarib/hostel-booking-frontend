"use client";

import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  /** ISO timestamp for the first day of the bucket. */
  month: string;
  revenue: number;
  bookings: number;
}

type Measure = "revenue" | "bookings";

interface TrendChartProps {
  data: TrendPoint[];
  measure: Measure;
  /** Categorical hue for this measure. */
  color: string;
}

const monthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });

const formatRevenue = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

/**
 * A single-series area chart over time.
 *
 * Revenue and bookings are rendered as two of these rather than one dual-axis
 * chart: they are measured in different units, and overlaying two y-scales
 * makes the crossover points meaningless.
 */
export function TrendChart({ data, measure, color }: TrendChartProps) {
  const gradientId = useId();
  const format = measure === "revenue" ? formatRevenue : formatCount;

  const points = useMemo(
    () => data.map((point) => ({ ...point, label: monthLabel(point.month) })),
    [data],
  );

  if (points.length === 0) {
    return (
      <p className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No transactions in this period.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={points}
        margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Recessive grid: horizontal only, so it reads as a reference not a cage. */}
        <CartesianGrid
          vertical={false}
          stroke="currentColor"
          className="text-gray-200"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
          stroke="currentColor"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={measure === "revenue" ? 72 : 40}
          // Bookings are whole things; "1.5 bookings" is not a readable tick.
          allowDecimals={measure === "revenue"}
          tickFormatter={(value: number) =>
            measure === "revenue"
              ? `₹${new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value)}`
              : formatCount(value)
          }
          className="text-xs"
          stroke="currentColor"
        />
        <Tooltip
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
          formatter={(value) => [format(Number(value)), ""] as [string, string]}
          labelFormatter={(label) => String(label)}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid rgb(229 231 235)",
            fontSize: 12,
          }}
        />
        <Area
          // Straight segments between monthly buckets. A smoothed curve bulges
          // above the real values between two points, inventing revenue in
          // months that had none.
          type="linear"
          dataKey={measure}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
          name={measure === "revenue" ? "Revenue" : "Bookings"}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Accessible table equivalent of the charts.
 *
 * Required rather than optional: the aqua series sits below 3:1 contrast on a
 * light surface, and the palette's relief rule makes a table view or visible
 * labels mandatory in that case.
 */
export function TrendTable({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return null;

  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
        View as table
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Monthly revenue and bookings for the selected period
          </caption>
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">
                Month
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Revenue
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Bookings
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.month} className="border-b last:border-0">
                <th scope="row" className="py-2 pr-4 font-normal">
                  {monthLabel(point.month)}
                </th>
                <td className="py-2 pr-4 text-right tabular-nums">
                  {formatRevenue(point.revenue)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatCount(point.bookings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
