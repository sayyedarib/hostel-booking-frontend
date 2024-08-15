export interface OccupiedDateRange {
  startDate: Date;
  endDate: Date;
}

export interface BedInRoomCard {
  id: number;
  bedCode: string;
  dailyPrice: number;
  monthlyPrice: number;
  status: string;
  occupiedDateRanges: OccupiedDateRange[];
}

export interface RoomCard {
  id: number;
  buildingName: string;
  roomCode: string;
  imageUrls: string[] | null;
  gender: string;
}

export interface CartItem {
  bedId: number;
  checkIn: Date;
  checkOut: Date;
}
