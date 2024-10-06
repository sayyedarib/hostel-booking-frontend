"use client";

import { EllipsisVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { getGuestsAdmin, deleteGuest } from "@/db/queries";
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
  const queryClient = useQueryClient();

  const {
    data: guests = [],
    isLoading,
    isError,
  } = useQuery<Guest[]>({
    queryKey: ["guests"],
    queryFn: async () => {
      const response = await getGuestsAdmin();
      if (response.status === "success" && response.data !== null) {
        return response.data;
      }
      throw new Error("Failed to fetch guests");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });

  const handleDelete = (guestId: number) => {
    deleteMutation.mutate(guestId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching guests</div>;

  return (
    <div className="p-4">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest Name</TableHead>
              {/* TODO: Add phone number */}
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
                <TableCell>
                  <Link href={`/admin-dashboard/guests/${guest.id}`}>
                    {guest.name}
                  </Link>
                </TableCell>
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
                      <DropdownMenuItem>
                        <Link href={`/admin-dashboard/${guest.id}`}>Edit</Link>
                      </DropdownMenuItem>
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
