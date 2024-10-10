import { useState } from "react";
import Image from "next/image";
import { LoaderCircle, MoveLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  createBooking,
  getSecurityDepositStatus,
  getCheckoutData,
} from "@/db/queries";
import { logger, calculateRent } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface CheckoutData {
  guestName: string;
  monthlyRent: number;
  checkIn: string;
  checkOut: string;
}

export default function Step3({
  handleNext,
  handlePrev,
}: {
  handleNext: () => void;
  handlePrev: () => void;
}) {
  const { toast } = useToast();

  const [isPaidChecked, setIsPaidChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: checkoutData } = useQuery<CheckoutData[]>({
    queryKey: ["checkoutData"],
    queryFn: async () => {
      const result = await getCheckoutData();
      if (!result.data) {
        logger("info", "Failed to fetch data");
        throw new Error("Failed to fetch checkout data");
      }
      return result.data;
    },
  });

  const { data: securityDepositStatus } = useQuery({
    queryKey: ["securityDepositStatus"],
    queryFn: getSecurityDepositStatus,
  });

  const securityDeposit = securityDepositStatus?.status !== "paid" ? 1000 : 0;

  const totalAmount =
    checkoutData?.reduce(
      (total, data) =>
        total +
        calculateRent(
          data.monthlyRent,
          new Date(data.checkIn),
          new Date(data.checkOut),
        ).payableRent,
      0,
    ) || 0;

  const handlePayment = async () => {
    setLoading(true);
    const result = await createBooking({
      payableRent: totalAmount,
      securityDeposit,
    });
    handleNext();
    if (result.status === "success") {
      toast({
        title: "Payment successful",
        description: "Your payment has been processed",
      });
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl flex flex-col md:flex-row relative">
      <Button
        variant="ghost"
        onClick={handlePrev}
        className="absolute top-0 left-0"
      >
        <MoveLeft size={40} />
      </Button>
      <div className="flex md:flex-col gap-3 md:w-1/2 items-center">
        <div>
          <Image
            width={250}
            height={250}
            src="/img/qr.png"
            alt="Scanner"
            className="rounded-lg"
          />
        </div>

        <div>
          <p className="text-gray-600">UPI: sayyedaribhussain4321@okhdfcbank</p>
          <p className="text-gray-600">Account: 50100430236612</p>
          <p className="text-gray-600">IFSC: HDFC0009579</p>
          <p className="text-gray-600">Branch: MANGLI NICHI</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 md:w-1/2">
        <span className="text-gray-600">
          Total Bed(s): <strong>{checkoutData?.length}</strong>
        </span>
        <span className="text-gray-600">
          Guest(s):{" "}
          <strong>
            {checkoutData
              ?.map((item) => item.guestName.split(" ")[0])
              .join(", ")}
          </strong>
        </span>
        <span className="text-gray-600">
          Total Rent: <strong>₹ {totalAmount}</strong>
        </span>
        {securityDeposit > 0 && (
          <span className="text-gray-600">
            Security Deposit(Refundable): <strong>₹ {securityDeposit}</strong>
          </span>
        )}
        <Separator />
        <span className="text-gray-800 font-semibold">
          Total Amount: <strong>₹ {totalAmount + securityDeposit}</strong>
        </span>
        <div className="flex items-center gap-2 mt-4">
          <Checkbox
            id="paymentConfirmation"
            checked={isPaidChecked}
            onCheckedChange={(checked) => setIsPaidChecked(checked === true)}
          />
          <Label htmlFor="paymentConfirmation" className="text-gray-600">
            I have paid the rent and security deposit
          </Label>
        </div>
        <Button
          onClick={handlePayment}
          disabled={!isPaidChecked || loading}
          className="mt-4 font-semibold text-black"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Confirm Payment"
          )}
        </Button>
      </div>
    </div>
  );
}
