"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { addDays, format } from "date-fns";

import type { CurrentBooking, CurrentBookingContextType } from "@/interface";

import { getAllRooms } from "@/db/queries";

const CurrentBookingContext = createContext<CurrentBookingContextType>({
  currentBooking: {
    male: 0,
    female: 0,
    room: 0,
    checkIn: new Date(),
    checkOut: addDays(new Date(), 30),
  },
  setCurrentBooking: () => {},
});

const CurrentBookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentBooking, setCurrentBooking] = useState<CurrentBooking>({
    male: 0,
    female: 0,
    room: 0,
    checkIn: new Date(),
    checkOut: addDays(new Date(), 30),
  });

  useEffect(() => {
    async function fetchData() {
      const roomsData = await getAllRooms();
      console.log("rooms", roomsData);
    }

    fetchData();
  }, []);

  return (
    <CurrentBookingContext.Provider
      value={{ currentBooking, setCurrentBooking }}
    >
      {children}
    </CurrentBookingContext.Provider>
  );
};

export { CurrentBookingContext, CurrentBookingProvider };
