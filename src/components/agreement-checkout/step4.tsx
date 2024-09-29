import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import successAnimation from "../../../public/success-animation.json";

interface Step4Props {
  handlePrev: () => void;
}

export default function Step4({ handlePrev }: Step4Props) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          // Uncomment the following line to enable redirection
          // router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen lg:w-1/2 mx-auto md:w-2/3 w-full">
      <div className="flex flex-col items-center">
        <Lottie
          animationData={successAnimation}
          loop={false}
          style={{ width: 200, height: 200 }}
        />
        <p className="text-xl font-semibold text-gray-800">
          Booking Successful!
        </p>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">
A confirmation email has been sent to your registered email address.
          </p>
          <p className="text-gray-400 mb-4">(After payment verification you&apos;ll receive the invoice and hostel ID card)</p>
          <p className="text-gray-600 mb-4">
            You will be redirected in{" "}
            <span className="font-bold">{countdown}</span> seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
