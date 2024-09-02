import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Step4Props {
  handlePrev: () => void;
}

export default function Step4({ handlePrev }: Step4Props) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      clearInterval(timer);
      // router.push("/");
    }

    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Booking Confirmed
        </h1>
        <p className="text-gray-600 mb-4">
          Your bed has been successfully booked. A confirmation email has been
          sent to your registered email address.
        </p>
        <p className="text-gray-600 mb-4">
          You will be redirected in{" "}
          <span className="font-bold">{countdown}</span> seconds.
        </p>
        <p className="text-gray-600 mb-4">Payment will be verified shortly.</p>
      </div>
    </div>
  );
}
