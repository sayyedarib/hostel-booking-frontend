"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { createClient } from "@/lib/supabase/client";
import {
  getRoomById,
  updateRoomDetails,
  addRoomImage,
  deleteImage,
} from "@/db/queries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddBedDialogue from "@/components/add-bed-dialogue";
import EditBedDialogue from "@/components/edit-bed-dialogue";

export default function RoomPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();
  const { data: room, isLoading } = useQuery({
    queryKey: ["room", id],
    queryFn: () => getRoomById(Number(id)),
  });

  const [roomCode, setRoomCode] = useState("");
  const [gender, setGender] = useState("");
  const [floor, setFloor] = useState("");

  useEffect(() => {
    if (room?.status === "success" && room.data) {
      setRoomCode(room.data[0]?.roomCode || "");
      setGender(room.data[0]?.gender || "");
      setFloor(room.data[0]?.floor?.toString() || "");
    }
  }, [room]);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filename = `${Date.now()}-${file?.name}`;
    const { data, error } = await supabase.storage
      .from("room_image")
      .upload(filename, file);

    if (error) {
      console.error(error);
      return;
    }

    const publicUrl = supabase.storage
      .from("room_image")
      .getPublicUrl(filename);

    if (file) {
      const result = await addRoomImage(Number(id), publicUrl.data.publicUrl);
      console.log(result);
    }
  };

  return (
    <div className="container mx-auto py-10">
      {isLoading ? (
        <div>Loading...</div>
      ) : room?.status === "success" && room.data ? (
        <Tabs defaultValue="basic-info">
          <TabsList>
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="beds">Beds</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="basic-info">
            <Card>
              <CardHeader>
                <CardTitle>Room Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="roomCode">Room Code</Label>
                      <Input
                        id="roomCode"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder="Enter room code"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="floor">Floor</Label>
                      <Input
                        id="floor"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        placeholder="Enter floor number"
                        type="number"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium">
                      Number of Beds:{" "}
                      <span className="font-bold">
                        {room.data[0].beds.length}
                      </span>
                    </p>
                    <p className="text-sm font-medium">
                      Building Name:{" "}
                      <Link
                        href={`/admin-dashboard/properties/${room.data[0].property.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {room.data[0].property.name}
                      </Link>
                    </p>
                  </div>
                  <Button
                    className="w-full md:w-auto"
                    onClick={async () =>
                      await updateRoomDetails(
                        room.data[0].id,
                        roomCode,
                        parseInt(floor),
                        gender,
                      )
                    }
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beds">
            <Card>
              <CardHeader>
                <CardTitle>Beds</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bed Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Monthly Rent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {room?.data[0]?.beds?.map((bed) => (
                      <TableRow key={bed?.id.toString()}>
                        <TableCell>{bed?.bedCode.toString()}</TableCell>
                        <TableCell>{bed?.type.toString()}</TableCell>
                        <TableCell>{bed?.monthlyRent.toString()}</TableCell>
                        <TableCell>
                          <EditBedDialogue bed={bed} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <AddBedDialogue roomId={room.data[0].id} />
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Room Images</CardTitle>
                <div className="mt-6 flex justify-center">
                  <Label
                    htmlFor="file-upload"
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload New Image</span>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleUploadImage}
                    />
                  </Label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {room?.data[0]?.imageUrls?.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url}
                        alt={`Room image ${index + 1}`}
                        width={300}
                        height={200}
                        className="rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => {
                          deleteImage(Number(room.data[0].id), url);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div>Error loading room data</div>
      )}
    </div>
  );
}
