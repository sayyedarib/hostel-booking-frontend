"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Trash2, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteGuest, getGuestsAdmin } from "@/db/queries";

interface Guest {
  id: number;
  name: string;
  roomCode: string;
  bedCode: string;
  checkIn: string;
  checkOut: string;
}

/**
 * Includes the year: a stay listed as "Aug 4 – Jan 1" is unreadable without it,
 * because bookings routinely cross into the next year.
 */
const stayDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function GuestsPage() {
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<Guest | null>(null);

  const {
    data: guests = [],
    isLoading,
    isError,
  } = useQuery<Guest[]>({
    queryKey: ["guests"],
    queryFn: async () => {
      const response = await getGuestsAdmin();
      if (response.status !== "success" || response.data === null) {
        throw new Error("Could not load guests.");
      }
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGuest,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      setPendingDelete(null);
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">Guests</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading…"
            : `${guests.length} guest${guests.length === 1 ? "" : "s"} on record.`}
        </p>
      </div>

      {isError ? (
        <p className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          Could not load guests.
        </p>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : guests.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Users className="h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="font-medium">No guests yet</p>
          <p className="text-sm text-muted-foreground">
            Guests appear here once a booking is confirmed.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Bed</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <Link
                        href={`/admin-dashboard/guests/${guest.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {guest.name}
                      </Link>
                    </TableCell>
                    <TableCell>{guest.roomCode}</TableCell>
                    <TableCell>{guest.bedCode}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {stayDate(guest.checkIn)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {stayDate(guest.checkOut)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(guest)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Delete {guest.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {guests.map((guest) => (
              <Card key={guest.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    <Link
                      href={`/admin-dashboard/guests/${guest.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {guest.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    Room {guest.roomCode} · Bed {guest.bedCode}
                  </p>
                  <p>
                    {stayDate(guest.checkIn)} → {stayDate(guest.checkOut)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingDelete(guest)}
                    className="mt-3 text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/*
        Deleting used to happen on a single click of a dropdown item, with no
        confirmation and no undo — one mis-click destroyed a guest record.
      */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this guest?</DialogTitle>
            <DialogDescription>
              This permanently removes <strong>{pendingDelete?.name}</strong>{" "}
              and their booking history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                pendingDelete && deleteMutation.mutate(pendingDelete.id)
              }
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete guest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
