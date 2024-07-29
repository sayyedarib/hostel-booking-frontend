import { Dispatch, SetStateAction } from "react";

export interface CurrentBooking {
  male: number;
  female: number;
  room: number;
}

export interface CurrentBookingContextType {
  currentBooking: CurrentBooking;
  setCurrentBooking: Dispatch<SetStateAction<CurrentBooking>>;
}
