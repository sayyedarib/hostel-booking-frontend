"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAnalyticsData, getRevenueAndBookingsData } from "@/db/queries";
import { BarChartComponent } from "@/components/ui/chart/bar-chart";
import { AreaChartComponent } from "@/components/ui/chart/area-chart";
import { PieChartComponent } from "@/components/ui/chart/pie-chart";
import { LineChartComponent } from "@/components/ui/chart/line-chart";
import { useQuery } from "@tanstack/react-query";

interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalGuests: number;
}

interface AnalyticsResponse {
  status?: string;
  data?: Analytics | null;
}

const description =
  "An application shell with a header and main content area. The header has a navbar, a search input and and a user nav dropdown. The user nav is toggled by a button with an avatar image.";

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 6),
    endDate: new Date(),
  });

  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response: AnalyticsResponse = await getAnalyticsData();
      console.log(response);
      if (response.status === "success" && response.data !== undefined) {
        return (
          response.data || {
            totalRevenue: 0,
            totalBookings: 0,
            totalUsers: 0,
            totalGuests: 0,
          }
        );
      }
      throw new Error("Failed to fetch analytics data");
    },
  });

  const {
    data: revenueAndBookingsData,
    isLoading: revenueAndBookingsLoading,
    error: revenueAndBookingsError,
  } = useQuery({
    queryKey: ["revenueAndBookings", dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const response: {
        status: string;
        data: { month: string; revenue: number; bookings: number }[] | null;
      } = await getRevenueAndBookingsData(
        new Date("2024-09-01"),
        new Date("2024-09-30"),
      );
      console.log(response);
      if (response.status === "success" && response.data !== null) {
        return response.data;
      }
      throw new Error("Failed to fetch revenue and bookings data");
    },
  });

  if (analyticsLoading || revenueAndBookingsLoading)
    return <div>Loading...</div>;
  if (analyticsError)
    return <div>An error occurred: {analyticsError.message}</div>;
  if (revenueAndBookingsError)
    return <div>An error occurred: {revenueAndBookingsError.message}</div>;

  const formattedDateRange = `${format(
    dateRange.startDate,
    "MMMM yyyy",
  )} - ${format(dateRange.endDate, "MMMM yyyy")}`;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics?.totalRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalGuests}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Revenue and Bookings</CardTitle>
              <CardDescription>{formattedDateRange}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent />
            <LineChartComponent />
            <PieChartComponent />
            <AreaChartComponent />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
