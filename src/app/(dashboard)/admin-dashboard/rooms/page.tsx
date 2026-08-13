"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, DoorOpen } from "lucide-react";

import AddRoomDialogue from "@/components/add-room-dialogue";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminRoomData } from "@/db/queries";

export default function RoomsPage() {
  const {
    data: rooms = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminRoomData"],
    queryFn: async () => {
      const response = await getAdminRoomData();
      if (response.status !== "success" || response.data === null) {
        throw new Error("Could not load rooms.");
      }
      return response.data;
    },
  });

  const totalBeds = rooms.reduce((sum, room) => sum + room.bedCount, 0);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${rooms.length} rooms · ${totalBeds} beds`}
          </p>
        </div>
        <AddRoomDialogue />
      </div>

      {error ? (
        <p className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {(error as Error).message}
        </p>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <DoorOpen className="h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="font-medium">No rooms yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first room to start tracking availability.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Beds</TableHead>
                <TableHead className="text-right">Beds in service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <Link
                      href={`/admin-dashboard/rooms/${room.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {room.roomCode}
                    </Link>
                  </TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell className="capitalize">{room.gender}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {room.bedCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {room.availableBedCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={room.isOpen ? "default" : "secondary"}>
                      {room.isOpen ? "Open" : "Closed"}
                    </Badge>
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
