import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { bookBed } from "@/db/queries";
import { BedInfo, Room as RoomDataType } from "@/interface";

export default function RoomMaps({
  type,
  roomData,
}: {
  type: "1-bed" | "2-bed" | "3-bed" | "4-bed";
  roomData: RoomDataType;
}) {
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const listOfRoomCapacity = new Array(Number(roomData.roomCapacity!)).fill("");

  const roomLayout = {
    "1-bed": [["A1"]],
    "2-bed": [["A1", "A2"]],
    "3-bed": [["A1"], ["B1", "B2"]],
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

  const getBedStatus = (bed: BedInfo) => {
    if (selectedBeds.includes(bed.id.toString())) return "selected";
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

  const getBedBackgroundImage = () => {
    if (type === "3-bed") {
      return "bg-[url('/img/bedbg3.webp')]";
    }
    return "bg-[url('/img/bedbg.webp')]";
  };

  return (
    <div className="max-w-md mx-auto p-4 border">
      <div
        className={`grid ${listOfRoomCapacity.length > 1 && "grid-cols-2"} w-fit mx-auto`}
      >
        {listOfRoomCapacity.map((_, index) => (
          <div className="flex w-fit justify-center space-x-0 mb-8" key={index}>
            {beds.map((column, columnIndex) => (
              <React.Fragment key={columnIndex}>
                <div
                  className={`flex flex-col ${getBedBackgroundImage()} bg-contain ${
                    index % 2 !== 0 && "scale-x-[-1]"
                  }`}
                >
                  {column.map((bed) => (
                    <Button
                      key={bed}
                      className={`w-32 h-16 rounded-lg bg-contain bg-transparent ${getBedStyle(getBedStatus(bed))}`}
                      // TODO: here bed is an string that is bed type e.g. 2-b 3-bed but that's not correct how can we update the database just based on bedtype(that is 2-bed, 3-bed) instead we need complete bed info like id, occupied, etc. from database
                      onClick={() => handleBedClick(bed)}
                      disabled={getBedStatus(bed) === "occupied"}
                    ></Button>
                  ))}
                </div>
              </React.Fragment>
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
