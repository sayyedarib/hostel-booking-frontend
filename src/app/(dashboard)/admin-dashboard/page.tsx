"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, subMonths } from "date-fns";
import { AlertCircle, BedDouble, IndianRupee, UserCheck, Users } from "lucide-react";

import { StatTile } from "@/components/admin/stat-tile";
import {
  TrendChart,
  TrendTable,
  type TrendPoint,
} from "@/components/admin/trend-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAnalyticsData, getRevenueAndBookingsData } from "@/db/queries";
import { fillMissingMonths } from "@/lib/time-series";

/**
 * Categorical hues, slots 1 and 3 of the validated palette. Revenue and
 * bookings are separate charts, so these carry identity between each chart and
 * its matching stat tile rather than separating series within one plot.
 */
const SERIES_COLOR = { revenue: "#2a78d6", bookings: "#1baf7a" } as const;

const RANGE_OPTIONS = [
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 },
  { label: "24 months", months: 24 },
] as const;

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const count = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export default function AdminDashboard() {
  const [months, setMonths] = useState<number>(6);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    return { startDate: startOfMonth(subMonths(now, months - 1)), endDate: now };
  }, [months]);

  const analytics = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await getAnalyticsData();
      if (response.status !== "success" || !response.data) {
        throw new Error("Could not load dashboard totals.");
      }
      return response.data;
    },
  });

  const trend = useQuery({
    queryKey: ["revenueAndBookings", startDate.toISOString(), months],
    queryFn: async () => {
      const response = await getRevenueAndBookingsData(startDate, endDate);
      if (response.status !== "success" || !response.data) {
        throw new Error("Could not load the revenue and bookings trend.");
      }
      return response.data as TrendPoint[];
    },
  });

  const rangeLabel = `${format(startDate, "MMMM yyyy")} – ${format(endDate, "MMMM yyyy")}`;

  // Zero-fill months with no transactions so the line does not imply growth
  // across periods that had none.
  const series = useMemo(
    () => (trend.data ? fillMissingMonths(trend.data, startDate, endDate) : []),
    [trend.data, startDate, endDate],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of occupancy, revenue and registrations.
        </p>
      </div>

      {analytics.error ? (
        <ErrorCard message={(analytics.error as Error).message} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Total revenue"
            value={inr(analytics.data?.totalRevenue ?? 0)}
            icon={IndianRupee}
            isLoading={analytics.isLoading}
          />
          <StatTile
            label="Total bookings"
            value={count(analytics.data?.totalBookings ?? 0)}
            icon={BedDouble}
            isLoading={analytics.isLoading}
          />
          <StatTile
            label="Registered users"
            value={count(analytics.data?.totalUsers ?? 0)}
            icon={Users}
            isLoading={analytics.isLoading}
          />
          <StatTile
            label="Guests"
            value={count(analytics.data?.totalGuests ?? 0)}
            icon={UserCheck}
            isLoading={analytics.isLoading}
          />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1">
            <CardTitle>Revenue and bookings</CardTitle>
            <CardDescription>{rangeLabel}</CardDescription>
          </div>

          {/* Filters sit in one row above the charts and drive both of them. */}
          <div
            role="group"
            aria-label="Time range"
            className="inline-flex rounded-lg border p-1"
          >
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.months}
                type="button"
                onClick={() => setMonths(option.months)}
                aria-pressed={months === option.months}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  months === option.months
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {trend.isLoading ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="h-[260px] animate-pulse rounded bg-gray-100" />
              <div className="h-[260px] animate-pulse rounded bg-gray-100" />
            </div>
          ) : trend.error ? (
            <ErrorCard message={(trend.error as Error).message} />
          ) : (
            <>
              {/* Two charts, not one dual-axis chart: rupees and counts do not
                  share a scale, and overlaying them invents crossings that do
                  not mean anything. */}
              <div className="grid gap-8 lg:grid-cols-2">
                <figure className="m-0">
                  <figcaption className="mb-2 text-sm font-medium">
                    Revenue per month
                  </figcaption>
                  <TrendChart
                    data={series}
                    measure="revenue"
                    color={SERIES_COLOR.revenue}
                  />
                </figure>
                <figure className="m-0">
                  <figcaption className="mb-2 text-sm font-medium">
                    Bookings per month
                  </figcaption>
                  <TrendChart
                    data={series}
                    measure="bookings"
                    color={SERIES_COLOR.bookings}
                  />
                </figure>
              </div>
              <TrendTable data={series} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
