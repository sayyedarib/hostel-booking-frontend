import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BedInfo, Room as RoomDataType } from "@/interface";
import Spinner from "./spinner";

export default function RoomMaps({
  type,
  roomData,
}: {
  type: "1-bed" | "2-bed" | "3-bed" | "4-bed";
  roomData: RoomDataType | null;
}) {
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [beds, setBeds] = useState<BedInfo[]>([]);

  useEffect(() => {
    if (roomData?.beds) {
      const initialBeds: BedInfo[] = roomData.beds.map((bed) => ({
        id: bed.id.toString(),
        occupied: bed.occupied,
      }));
      setBeds(initialBeds);
    }
  }, [roomData]);

  const roomLayout: { [key: string]: string[][] } = {
    "1-bed": [["A1"]],
    "2-bed": [["A1", "A2"]],
    "3-bed": [["A1"], ["B1", "B2"]],
    "4-bed": [
      ["A1", "A2"],
      ["B1", "B2"],
    ],
  };

  const bedLayout = roomLayout[type] || [];

  const handleBedClick = (bedId: string) => {
    setSelectedBeds((prev) =>
      prev.includes(bedId)
        ? prev.filter((selectedBed) => selectedBed !== bedId)
        : [...prev, bedId]
    );
  };

  const getBedStatus = (
    bedId: string
  ): "selected" | "occupied" | "available" => {
    const bed = beds.find((b) => b.id === bedId);
    if (selectedBeds.includes(bedId)) return "selected";
    if (bed?.occupied) return "occupied";
    return "available";
  };

  const getBedStyle = (
    status: "selected" | "occupied" | "available"
  ): string => {
    switch (status) {
      case "selected":
        return "bg-green-500/40 hover:bg-green-500/40 text-white";
      case "occupied":
        return "bg-red-500/40 hover:bg-red-500/40 text-white cursor-not-allowed";
      default:
        return "hover:border-green-500 hover:bg-green-500/20";
    }
  };

  if (!roomData) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 border">
      <div
        className={`grid ${bedLayout.length > 1 ? "grid-cols-2" : ""} w-fit mx-auto gap-5`}
      >
        {bedLayout.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex w-fit justify-center space-x-0 mb-8"
          >
            <div className="flex flex-col bg-[url('/img/bed-cover.png')] bg-contain bg-bottom bg-no-repeat">
              {column.map((bedId) => {
                const status = getBedStatus(bedId);
                return (
                  <Button
                    key={bedId}
                    className={`w-32 h-16 rounded-lg bg-transparent ${getBedStyle(status)}`}
                    onClick={() => handleBedClick(bedId)}
                    disabled={status === "occupied"}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-foreground border mr-2" />
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2" />
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2" />
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
}
