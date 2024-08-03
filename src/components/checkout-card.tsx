"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { useQueryParam } from "nextjs-query-param";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { createBooking, updateBedStatus, getRoomDetails } from "@/db/queries";
import { calculateBedPrice } from "@/lib/utils";

interface RoomDetails {
  roomNumber: string;
  bedCodes: string[];
}

export default function CheckoutCard() {
  const [checkIn] = useQueryParam(
    "checkIn",
    (value: string | null) => value ?? "",
  );
  const [checkOut] = useQueryParam(
    "checkOut",
    (value: string | null) => value ?? "",
  );
  const [bedCount] = useQueryParam(
    "bedCount",
    (value: string | null) => value ?? "1",
  );
  const [roomId] = useQueryParam(
    "roomId",
    (value: string | null) => value ?? "",
  );

  const [bedIds] = useQueryParam(
    "bedIds",
    (value: string | null) => value ?? "",
  );
  const [totalAmount] = useQueryParam(
    "totalAmount",
    (value: string | null) => value ?? "",
  );

  const totalCharge = Number(totalAmount);
  const [securityDeposit, setSecurityDeposit] = useState<number>(0);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);

  useEffect(() => {
    // Calculate total amount and security deposit
    const days = differenceInDays(new Date(checkOut), new Date(checkIn));
    const calculatedDeposit = 2000 * parseInt(bedCount);
    setSecurityDeposit(calculatedDeposit);

    // Fetch room details
    const fetchRoomDetails = async () => {
      const details = await getRoomDetails(parseInt(roomId), bedIds);
      if (details) {
        setRoomDetails(details);
      }
    };
    fetchRoomDetails();
  }, [checkIn, checkOut, bedCount, roomId, bedIds]);

  const handleConfirmPayment = async () => {
    await handleBooking();

    try {
      const bedIdsArray = bedIds.split("+").map(Number);
      const updateResult = await updateBedStatus(bedIdsArray, true);

      if (updateResult.success) {
        setIsPaymentConfirmed(true);
        alert("Payment confirmed! Beds have been marked as occupied.");
      } else {
        alert("Failed to update bed status: " + updateResult.error);
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      alert("An error occurred during payment confirmation");
    }
  };

  const handleBooking = async () => {
    if (!isPaymentConfirmed) {
      alert("Please confirm payment before booking");
      return;
    }
    const bedId = bedIds.split("+").map(Number);
    try {
      bedId.map(async (id) => {
        await createBooking({
          roomId: parseInt(roomId),
          bedId: id,
          checkIn,
          checkOut,
        });
      });
      // const bookingResult = await createBooking({
      //   userId,
      //   roomId: parseInt(roomId),
      //   bedId: bedId[0],
      //   checkIn,
      //   checkOut,
      // });

      // if (bookingResult?.success) {
      //   alert("Booking successful!");
      //   // Redirect to a confirmation page or update UI
      // } else {
      //   alert("Booking failed: " + bookingResult?.error);
      // }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred during booking");
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-xl w-full md:w-2/3 lg:w-1/2 flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2">
        <h3 className="text-2xl font-bold mb-4">Bank Details:</h3>
        <Image width={250} height={250} src="/img/qr.png" alt="Scanner" />
        <p>UPI: 1234567890@hdfcbank</p>
        <p>Account: 1234567890</p>
        <p>IFSC: HDFC0001234</p>
        <p>Branch: HDFC Bank, Bangalore</p>
      </div>
      <div className="md:w-1/2">
        <h2 className="text-2xl font-bold mb-4">Booking Summary</h2>
        <div className="space-y-2">
          <p>Check-in: {checkIn}</p>
          <p>Check-out: {checkOut}</p>
          <p>Number of beds: {bedCount}</p>
          {roomDetails && (
            <>
              <p>Room Number: {roomDetails.roomNumber}</p>
              <p>Bed Codes: {roomDetails.bedCodes.join(", ")}</p>
            </>
          )}
          <Separator />
          <p>Total Amount: ₹{totalCharge}</p>
        </div>
        <Button
          onClick={handleConfirmPayment}
          className="mt-4 w-full"
          disabled={isPaymentConfirmed}
        >
          {isPaymentConfirmed ? "Payment Confirmed" : "Confirm Payment"}
        </Button>
      </div>
    </div>
  );
}
