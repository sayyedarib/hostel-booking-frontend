"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsersData } from "@/db/queries";

const joinedOn = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function UsersPage() {
  const [query, setQuery] = useState("");

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await getUsersData();
      if (response.status !== "success" || response.data === null) {
        throw new Error("Could not load users.");
      }
      return response.data;
    },
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle) ||
        user.phone.includes(needle),
    );
  }, [users, query]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${filtered.length} of ${users.length} registered users`}
          </p>
        </div>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email or phone"
          aria-label="Search users"
          className="sm:max-w-xs"
        />
      </div>

      {isError ? (
        <p className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          Could not load users.
        </p>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Users className="h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="font-medium">No users found</p>
          <p className="text-sm text-muted-foreground">
            {query ? "Try a different search term." : "No one has signed up yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  {/*
                    The link lives inside the cell. It previously wrapped the
                    <TableCell>, putting an <a> directly inside a <tr>, which is
                    invalid and breaks the row layout.
                  */}
                  <TableCell>
                    <Link
                      href={`/admin-dashboard/users/${user.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="break-all">{user.email}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {user.phone || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {joinedOn(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.role === "admin" && <Badge>Admin</Badge>}
                      <Badge variant={user.onboarded ? "secondary" : "outline"}>
                        {user.onboarded ? "Onboarded" : "Incomplete"}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
