import CheckoutCard from "@/components/checkout-card";

export default function Checkout() {
  return (
    <div className="min-h-screen w-screen m-auto flex items-center justify-center flex-col">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutCard />
    </div>
  );
}
