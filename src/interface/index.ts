import { Dispatch, SetStateAction } from "react";

export interface CurrentBooking {
  bed: number;
  checkIn: Date;
  checkOut: Date;
  roomData?: Room | null;
}

export interface CurrentBookingContextType {
  currentBooking: CurrentBooking;
  setCurrentBooking: Dispatch<SetStateAction<CurrentBooking>>;
}

export interface Room {
  id: number;
  buildingName: string;
  roomNumber: string;
  roomDailyPrice: number;
  roomMonthlyPrice: number;
  roomTypeName: string;
  roomCapacity: number;
  imageUrls: string[];
  bedInfo: BedInfo[];
}

// export interface RoomCard extends Room {
//   totalRoomPrice: number;
//   totalBedPrice: number;
// }
export interface BedInfo {
  id: number;
  dailyPrice: number;
  monthlyPrice: number;
  occupied?: boolean;
  bedCode?: string;
}

export interface Guest {
  id?: number;
  name: string;
  email: string;
  phone: string;
  clerkId: string;
  roomId?: number;
  bedId?: number;
  paymentId?: string;
}

// refactoring
export interface OccupiedDateRange {
  startDate: Date;
  endDate: Date;
}

export interface BedInRoomCard {
  id: number;
  dailyPrice: number;
  monthlyPrice: number;
  bedCode: string;
  status: string;
  occupiedDateRanges: OccupiedDateRange[];
}

export interface RoomCard {
  id: number;
  buildingName: string;
  roomNumber: string;
  imageUrls: string[];
  bedInfo: BedInRoomCard[];
  gender: string;
  availableBeds: number;
}

import { CreateUser } from "./user";
import { LogLevel, LogContext } from "./utils";

export type { CreateUser, LogLevel, LogContext };
