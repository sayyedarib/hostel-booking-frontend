"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import Lottie from "lottie-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGuest, getGuestBookings } from "@/db/queries";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id: userId } = params;

  const { data: guest, isLoading: isLoadingGuest } = useQuery({
    queryKey: ["guest", userId],
    queryFn: () => getGuest(Number(userId)),
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings", userId],
    queryFn: () => getGuestBookings(Number(userId)),
  });

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex items-center">
          <Avatar className="w-20 h-20">
            <AvatarImage src={guest?.data?.[0].photoUrl} alt="Avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <CardTitle>{guest?.data?.[0].name}</CardTitle>
          <CardDescription>
            Guest ID: {guest?.data?.[0].id}
            {guest?.data?.[0].userId && (
              <Link href={`/admin-dashboard/users/${guest?.data?.[0].userId}`}>
                <h3 className="text-sm font-medium text-gray-500">
                  Primary User ID: {guest?.data?.[0].userId}
                </h3>
              </Link>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              {guest?.data?.[0] && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Full Name
                      </h3>
                      <Input
                        className="mt-1"
                        defaultValue={guest.data[0].name}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Email Address
                      </h3>
                      <Input
                        className="mt-1"
                        defaultValue={guest.data[0].email}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Phone Number
                      </h3>
                      <Input
                        className="mt-1"
                        defaultValue={guest.data[0].phone}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Date of Birth
                      </h3>
                      <Input
                        className="mt-1"
                        type="date"
                        defaultValue={guest.data[0].dob}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Purpose of Stay
                      </h3>
                      <Input
                        className="mt-1"
                        defaultValue={guest.data[0].purpose}
                      />
                    </div>
                  </div>
                  <Button className="mt-4">Save Changes</Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="history">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBookings ? (
                    <TableRow>
                      <TableCell colSpan={5}>Loading bookings...</TableCell>
                    </TableRow>
                  ) : (
                    bookings?.data?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.roomCode}</TableCell>
                        <TableCell>{booking.bedCode}</TableCell>
                        <TableCell>
                          {new Date(booking.checkIn).toDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(booking.checkOut).toDateString()}
                        </TableCell>
                        <TableCell>{booking.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="documents">
              <div className="space-y-4">
                <div>
                  {guest?.data?.[0].aadhaarUrl ? (
                    <Image
                      src={guest?.data?.[0].aadhaarUrl}
                      alt="Aadhaar Card"
                      width={300}
                      height={200}
                    />
                  ) : (
                    // <Lottie
                    //   animationData={"/no_docs.json"}
                    //   style={{ width: 200, height: 200 }}
                    // />

                    <div>No documents uploaded</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
