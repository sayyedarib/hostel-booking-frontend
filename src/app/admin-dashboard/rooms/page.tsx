"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminRoomData, createRoom } from "@/db/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddRoomDialogue from "@/components/add-room-dialogue";

interface Room {
  id: number;
  roomCode: string;
  floor: number;
  gender: string;
  bedCount: number;
}

export default function Rooms() {
  const [formData, setFormData] = useState({
    roomCode: "",
    floor: 0,
    gender: "male",
  });

  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminRoomData"],
    queryFn: async () => {
      const response = await getAdminRoomData();
      if (response.status === "success" && response.data !== null) {
        return response.data;
      }
      throw new Error("Failed to fetch admin room data");
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <AddRoomDialogue />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Code</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Number of Beds</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms?.map((room: Room) => (
            <TableRow key={room.id}>
              <TableCell>
                <Link href={`/admin-dashboard/rooms/${room.id}`}>
                  {room.roomCode}
                </Link>
              </TableCell>
              <TableCell>{room.floor}</TableCell>
              <TableCell>{room.gender}</TableCell>
              <TableCell>{room.bedCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
