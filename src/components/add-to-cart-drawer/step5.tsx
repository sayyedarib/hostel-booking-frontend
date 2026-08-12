import { CheckCircle2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrawerTitle } from "@/components/ui/drawer";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import successAnimation from "../../../public/success-animation.json";

export const AddToCartStep5 = () => {
  const router = useRouter();

  const handleGoToCart = () => {
    router.push("/cart");
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {/* Radix requires every dialog to be labelled; this step's heading is
          rendered below with an icon, so the title itself is visually hidden. */}
      <DrawerTitle className="sr-only">Guest added to cart</DrawerTitle>
      <Lottie
        animationData={successAnimation}
        loop={false}
        className="h-64 w-64"
        aria-hidden="true"
      />
      <div className="mb-4 flex items-center">
        <CheckCircle2 className="mr-2 text-green-500" size={24} aria-hidden="true" />
        <h2 className="text-2xl font-bold">Guest added to cart!</h2>
      </div>
      <p className="text-gray-500 mb-6">
        Your guest has been successfully added to the cart.
      </p>
      <Button
        onClick={handleGoToCart}
        className="bg-primary text-white flex items-center justify-center"
      >
        <ShoppingCart className="mr-2" size={18} />
        Go to Cart
      </Button>
    </div>
  );
};
