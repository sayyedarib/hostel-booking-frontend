import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { bookBed } from "@/db/queries";
import { BedInfo, RoomCard } from "@/interface";

export default function RoomMaps({ roomData } : {roomData: RoomCard}) {
  const [selectedBeds, setSelectedBeds] = useState<number[]>([]);

  const handleBedClick = async (bedId: number) => {
    console.log("bedId", bedId);
    if (selectedBeds.includes(bedId)) {
      setSelectedBeds(selectedBeds.filter(id => id !== bedId));
    } else {
      setSelectedBeds([...selectedBeds, bedId]);
      await bookBed(bedId);
    }
  };

  const getBedStatus = (bed: BedInfo) => {
    if (selectedBeds.includes(bed.id)) return "selected";
    if (bed.occupied) return "occupied";
    return "available";
  };

  const getBedStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-500/40 hover:bg-green-500/40 text-white";
      case "occupied":
        return "bg-red-500/40 hover:bg-red-500/40 text-white cursor-not-allowed";
      default:
        return "hover:border-green-500 hover:bg-green-500/20";
    }
  };

  const beds = roomData?.bedInfo || [];
  const columns = Math.ceil(beds.length / 2);

  return (
    <div className="max-w-md mx-auto p-4 border">
      <div className="flex justify-center space-x-0 mb-8">
        {Array.from({ length: columns }).map((_, columnIndex) => (
          <div key={columnIndex} className={`flex flex-col bg-[url('/img/bedbg.webp')] bg-contain ${columnIndex % 2 !== 0 ? "scale-x-[-1]" : ""}`}>
            {beds.slice(columnIndex * 2, columnIndex * 2 + 2).map((bed) => (
              <Button
                key={bed.id}
                className={`w-32 h-16 rounded-lg bg-contain bg-transparent ${getBedStyle(getBedStatus(bed))}`}
                onClick={() => handleBedClick(bed.id)}
                disabled={bed.occupied}
              ></Button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-foreground border mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2"></div>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
}