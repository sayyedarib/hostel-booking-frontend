import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BedInfo, Room as RoomDataType } from "@/interface";

export default function RoomMaps({
  type,
  roomData,
}: {
  type: "1-bed" | "2-bed" | "3-bed" | "4-bed";
  roomData: RoomDataType;
}) {
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const listOfRoomCapacity = new Array(Number(roomData.roomCapacity!)).fill("");
  let beds: BedInfo[][] = [];
  for (let i = 0; i < roomData.bedInfo.length; i += 2) {
    if (roomData.bedInfo[i] && roomData.bedInfo[i + 1]) {
      beds.push([roomData.bedInfo[i], roomData.bedInfo[i + 1]]);
    } else {
      beds.push([roomData.bedInfo[i]]);
    }
  }

  const handleBedClick = (bed: string) => {
    setSelectedBeds((prev) =>
      prev.includes(bed)
        ? prev.filter((selectedBed) => selectedBed !== bed)
        : [...prev, bed]
    );
  };

  const getBedStatus = (bedName: string) => {
    if (selectedBeds.includes(bedName)) return "selected";
    let isOccupied = false;
    beds.find((listBed) =>
      listBed.some((bed) => {
        if (bed.occupied && bed.bedCode === bedName) isOccupied = true;
      })
    );
    if (isOccupied) return "occupied";
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
      <div className="flex w-fit justify-center space-x-0 mb-8 mx-auto">
        {beds.map((column, columnIndex) => (
          <React.Fragment key={columnIndex}>
            <div
              className={`flex flex-col ${getBedBackgroundImage()} bg-contain ${
                columnIndex % 2 !== 0 && "scale-x-[-1]"
              }`}
            >
              {column.map((bed) => (
                <Button
                  key={bed.bedCode}
                  className={`w-32 h-16 rounded-lg bg-contain bg-transparent ${getBedStyle(getBedStatus(bed.bedCode))}`}
                  onClick={() => handleBedClick(bed.bedCode)}
                  disabled={getBedStatus(bed.bedCode) === "occupied"}
                ></Button>
              ))}
            </div>
          </React.Fragment>
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
