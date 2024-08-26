import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentConfirmed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Payment Confirmed</h1>
      <p className="text-xl mb-8">Thank you for confirming the payment.</p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
}
