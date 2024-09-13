"use client";

import { useState, useEffect } from "react";
import { getAdminRoomData } from "@/db/queries";
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

interface Bed {
  id: number;
  bedCode: string;
  type: string;
  monthlyRent: number;
  dailyRent: number;
}

interface Room {
  id: number;
  roomCode: string;
  floor: number;
  gender: string;
  beds: Bed[];
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    async function fetchRooms() {
      const response = await getAdminRoomData();
      if (response.status === "success" && response.data !== null) {
        setRooms(response.data as Room[]);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="p-4">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Code</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Bed Codes</TableHead>
              <TableHead>Bed Types</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.roomCode}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>{room.gender}</TableCell>
                <TableCell>
                  {room.beds.map((bed) => bed.bedCode).join(", ")}
                </TableCell>
                <TableCell>
                  {room.beds.map((bed) => bed.type).join(", ")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="block md:hidden">
        {rooms.map((room) => (
          <Card key={room.id} className="mb-4">
            <CardHeader>
              <CardTitle>{room.roomCode}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Floor: {room.floor}</p>
              <p>Gender: {room.gender}</p>
              <p>Bed Codes: {room.beds.map((bed) => bed.bedCode).join(", ")}</p>
              <p>Bed Types: {room.beds.map((bed) => bed.type).join(", ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
