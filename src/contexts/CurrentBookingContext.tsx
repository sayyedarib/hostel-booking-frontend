"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { addDays, format } from "date-fns";
import NextAdapterApp from "next-query-params/app";
import { QueryParamProvider } from "use-query-params";

import type { CurrentBooking, CurrentBookingContextType } from "@/interface";

import { getAllRooms } from "@/db/queries";

const CurrentBookingContext = createContext<CurrentBookingContextType>({
  currentBooking: {
    bed: 1,
    checkIn: new Date(),
    checkOut: addDays(new Date(), 30),
    roomData: null,
  },
  setCurrentBooking: () => {},
});

const CurrentBookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentBooking, setCurrentBooking] = useState<CurrentBooking>({
    bed: 1,
    checkIn: new Date(),
    checkOut: addDays(new Date(), 30),
    roomData: null,
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
      <QueryParamProvider adapter={NextAdapterApp}>
        {children}
      </QueryParamProvider>
    </CurrentBookingContext.Provider>
  );
};

export { CurrentBookingContext, CurrentBookingProvider };
