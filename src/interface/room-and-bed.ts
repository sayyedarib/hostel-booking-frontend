export interface OccupiedDateRange {
  startDate: Date;
  endDate: Date;
}

export interface BedInRoomCard {
  id: number;
  bedCode: string;
  dailyRent: number;
  monthlyRent: number;
  bedType: string;
  status: string;
  occupiedDateRanges: OccupiedDateRange[];
}

export interface RoomCard {
  id: number;
  buildingName: string;
  roomCode: string;
  imageUrls: string[];
  gender: string;
  bedCount: number;
  availableForBooking: boolean | null; // TODO: remove this null safely because default value is true
  occupiedCount: number;
}

export interface CartItemShort {
  bedId: number;
}

export interface CartItem {
  id: number;
  buildingName: string;
  roomCode: string;
  roomImage: string[] | null;
  bedCode: string;
  bedType: string;
  guestName: string;
  checkIn: Date | string;
  checkOut: Date | string;
  totalRent: number;
  payableRent: number;
}

export interface GroupedCartItem {
  monthlyRent: number;
  count: number;
  totalRent: number;
}
