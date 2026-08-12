"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTransactionsAdmin } from "@/db/queries";

const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const shortDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function TransactionsPage() {
  const [query, setQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminTransactions"],
    queryFn: async () => {
      const response = await getTransactionsAdmin();
      if (response.status !== "success" || !response.data) {
        throw new Error("Could not load transactions.");
      }
      return response.data;
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter(
      (transaction) =>
        transaction.userName.toLowerCase().includes(needle) ||
        transaction.userEmail.toLowerCase().includes(needle) ||
        String(transaction.id).includes(needle),
    );
  }, [data, query]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, transaction) => ({
          count: acc.count + 1,
          amount: acc.amount + transaction.totalAmount,
          verified: acc.verified + (transaction.verified ? 1 : 0),
        }),
        { count: 0, amount: 0, verified: 0 },
      ),
    [filtered],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Every payment recorded against a booking.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <CardTitle>
              {isLoading
                ? "Loading…"
                : `${totals.count} transaction${totals.count === 1 ? "" : "s"}`}
            </CardTitle>
            <CardDescription>
              {isLoading
                ? " "
                : `${inr(totals.amount)} total · ${totals.verified} verified`}
            </CardDescription>
          </div>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email or ID"
            aria-label="Search transactions"
            className="sm:max-w-xs"
          />
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              {(error as Error).message}
            </p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Receipt className="h-8 w-8 text-gray-400" aria-hidden="true" />
              <p className="font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground">
                {query
                  ? "Try a different search term."
                  : "Payments will appear here once a booking is paid for."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead className="text-right">Rent</TableHead>
                    <TableHead className="text-right">Deposit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        #{transaction.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {shortDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {transaction.userName}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {transaction.userEmail}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inr(transaction.rentAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {inr(transaction.securityDeposit)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {inr(transaction.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.verified ? "default" : "secondary"
                          }
                        >
                          {transaction.verified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.invoiceUrl ? (
                          <a
                            href={transaction.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm underline"
                          >
                            View
                            <ExternalLink
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            <span className="sr-only">
                              Invoice for transaction {transaction.id} (opens in
                              a new tab)
                            </span>
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
