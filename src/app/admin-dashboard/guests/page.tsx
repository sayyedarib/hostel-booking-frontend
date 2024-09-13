"use client";

import { useState, useEffect } from "react";
import { EllipsisVertical } from "lucide-react";

import { getGuests, deleteGuest } from "@/db/queries";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface Guest {
  id: number;
  name: string;
  roomCode: string;
  bedCode: string;
  checkIn: string;
  checkOut: string;
}

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    async function fetchGuests() {
      const response = await getGuests();
      if (response.status === "success" && response.data !== null) {
        setGuests(response.data);
      }
    }
    fetchGuests();
  }, []);

  const handleDelete = async (guestId: number) => {
    const response = await deleteGuest(guestId);
    if (response.status === "success") {
      setGuests(guests.filter((guest) => guest.id !== guestId));
    }
  };

  return (
    <div className="p-4">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest Name</TableHead>
              <TableHead>Room Code</TableHead>
              <TableHead>Bed Code</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Check-Out</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>{guest.name}</TableCell>
                <TableCell>{guest.roomCode}</TableCell>
                <TableCell>{guest.bedCode}</TableCell>
                <TableCell>
                  {format(new Date(guest.checkIn), "MMM d")}
                </TableCell>
                <TableCell>
                  {format(new Date(guest.checkOut), "MMM d")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(guest.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="block md:hidden">
        {guests.map((guest) => (
          <Card key={guest.id} className="mb-4">
            <CardHeader>
              <CardTitle>{guest.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Room Code: {guest.roomCode}</p>
              <p>Bed Code: {guest.bedCode}</p>
              <p>Check-In: {format(new Date(guest.checkIn), "MMM d")}</p>
              <p>Check-Out: {format(new Date(guest.checkOut), "MMM d")}</p>
              <div className="flex space-x-2 md:hidden">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(guest.id)}
                >
                  Delete
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 hidden md:block"
                  >
                    <EllipsisVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(guest.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
