"use client";

import React, { createContext, useState, ReactNode } from "react";

import type { CurrentBooking, CurrentBookingContextType } from "@/interface";

const CurrentBookingContext = createContext<CurrentBookingContextType>({
  currentBooking: { male: 0, female: 0, room: 0 },
  setCurrentBooking: () => {},
});

const CurrentBookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentBooking, setCurrentBooking] = useState<CurrentBooking>({
    male: 0,
    female: 0,
    room: 0,
  });

  return (
    <CurrentBookingContext.Provider
      value={{ currentBooking, setCurrentBooking }}
    >
      {children}
    </CurrentBookingContext.Provider>
  );
};

export { CurrentBookingContext, CurrentBookingProvider };
