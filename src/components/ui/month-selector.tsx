// components/MonthSelector.js
import React, { useState, useRef } from "react";

export const MonthSelector = () => {
  const [months, setMonths] = useState(1);
  const circleRef = useRef(null);

  const updateMonths = (e) => {
    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    // Adjust angle to start from the top (12 o'clock position)
    angle = angle - Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    let newMonths = Math.round((angle / (2 * Math.PI)) * 12);
    newMonths = newMonths === 0 ? 12 : newMonths;
    setMonths(newMonths);
  };

  const handleMouseMove = (e) => {
    if (e.buttons !== 1) return; // Only update when mouse is pressed
    updateMonths(e);
  };

  const handleClick = (e) => {
    updateMonths(e);
  };

  const getDateRange = () => {
    const startDate = new Date(2024, 8, 1); // September 1, 2024
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + months - 1);
    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} to ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={circleRef}
        className="w-64 h-64 rounded-full relative cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-gray-200 shadow-inner"></div>

        {/* Colored arc */}
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <path
            d={`M50,50 L50,5 A45,45 0 ${months > 6 ? 1 : 0},1 ${50 + 45 * Math.sin((2 * Math.PI * months) / 12)},${50 - 45 * Math.cos((2 * Math.PI * months) / 12)} Z`}
            fill="#FF385C"
            stroke="none"
          />
        </svg>

        {/* Center white circle with text */}
        <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center shadow-md">
          <span className="text-4xl font-bold">{months}</span>
          <span className="text-sm">months</span>
        </div>

        {/* Small circle indicator */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-md"
          style={{
            top: `${50 - 45 * Math.cos((2 * Math.PI * (months - 3)) / 12)}%`,
            left: `${50 + 45 * Math.sin((2 * Math.PI * (months - 3)) / 12)}%`,
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      </div>
      <div className="mt-4 text-sm text-gray-600">{getDateRange()}</div>
    </div>
  );
};
