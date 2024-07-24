import React, { useState } from "react";

import { Button } from "@/components/ui/button";

export default function RoomMaps({
  type,
}: {
  type: "1-bed" | "2-bed" | "4-bed";
}) {
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);

  const roomLayout = {
    "1-bed": [["A1", "A2"]],
    "2-bed": [["A1", "A2"]],
    "4-bed": [
      ["A1", "A2"],
      ["B1", "B2"],
    ],
  };

  const beds = roomLayout[type] ?? [];

  const handleBedClick = (bed: string) => {
    setSelectedBeds((prev) =>
      prev.includes(bed)
        ? prev.filter((selectedBed) => selectedBed !== bed)
        : [...prev, bed],
    );
  };

  const getBedStatus = (bed: string) => {
    if (selectedBeds.includes(bed)) return "selected";
    if (["A2", "B1"].includes(bed)) return "occupied";
    return "available";
  };

  const getBedStyle = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-500 text-white";
      case "occupied":
        return "bg-red-500 text-white cursor-not-allowed";
      default:
        return "hover:border-green-500 border-2";
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border">
      <div className="flex justify-center space-x-8 mb-8">
        {beds.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col space-y-2">
            {column.map((bed, bedIndex) => (
              <Button
                key={bed}
                className={`w-20 h-16 rounded-lg ${getBedStyle(getBedStatus(bed))}`}
                onClick={() => handleBedClick(bed)}
                disabled={getBedStatus(bed) === "occupied"}
              >
                <div className="text-sm">
                  {bedIndex === 0 ? "Upper" : "Lower"}
                </div>
                <div className="font-bold">{bed}</div>
              </Button>
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
