"use client";

import React, { useEffect, useState } from "react";
import { Star, MapPin, Bed, Building, Copy, CheckCircle } from "lucide-react";

import AddToCartDrawer from "@/components/add-to-cart-drawer";
import { Badge } from "@/components/ui/badge";
import CarouselFlowbite from "@/components/ui/carousel-flowbite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoomData } from "@/db/queries";
import { logger } from "@/lib/utils";

interface RoomData {
  roomCode: string;
  imageUrls: string[];
  floor: number;
  gender: string;
  buildingName: string;
  address: string;
  city: string;
  state: string;
  bedCount: number;
  monthlyRent: number | null;
  avgRating: number;
  reviews: { rating: number | null; review: string | null }[];
}

export default function Room({ params }: { params: { roomid: string } }) {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      const result = await getRoomData(parseInt(params.roomid));

      if (!result.data) {
        logger("error", "Room not found");
        return;
      }

      console.log("particular room data: ", result.data);

      if (result.status === "success") {
        setRoomData(result.data);
      }
    };
    fetchRoomData();
  }, [params.roomid]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  if (!roomData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <CarouselFlowbite images={roomData.imageUrls} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Room {roomData.roomCode}</span>
              <Badge variant="outline">{roomData.gender} Room</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <Building className="mr-2" size={20} />
              <span>{roomData.buildingName}</span>
            </div>
            <div className="flex items-center mb-2">
              <MapPin className="mr-2" size={20} />
              <span>{`${roomData.address}, ${roomData.city}, ${roomData.state}`}</span>
            </div>
            <div className="flex items-center mb-2">
              <Bed className="mr-2" size={20} />
              <span>{roomData.bedCount} beds</span>
            </div>
            <div className="flex items-center mb-4">
              <Star className="mr-2" size={20} fill="gold" />
              <span>{roomData.avgRating} / 5.0</span>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center text-blue-500 hover:text-blue-700"
            >
              {isLinkCopied ? <CheckCircle size={20} /> : <Copy size={20} />}
              <span className="ml-2">
                {isLinkCopied ? "Copied!" : "Copy Link"}
              </span>
            </button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <AddToCartDrawer
            className="hidden md:block"
            roomId={Number(params.roomid)}
          />
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {roomData.reviews.length > 0
                ? roomData.reviews.map((review, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < (review.rating ?? 0) ? "gold" : "gray"}
                          />
                        ))}
                      </div>
                      <p className="text-sm">{review.review}</p>
                    </div>
                  ))
                : "No reviews yet"}
            </CardContent>
          </Card>
        </div>
      </div>
      <AddToCartDrawer
        className="fixed md:hidden left-0 rounded-none bottom-0"
        roomId={Number(params.roomid)}
      />
    </div>
  );
}
