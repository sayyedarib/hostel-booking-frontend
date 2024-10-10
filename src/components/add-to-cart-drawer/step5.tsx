import { CheckCircle2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import successAnimation from "../../../public/success-animation.json";

export const AddToCartStep5 = () => {
  const router = useRouter();

  const handleGoToCart = () => {
    router.push("/cart");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Lottie
        animationData={successAnimation}
        loop={false}
        className="w-64 h-64"
      />
      <div className="flex items-center mb-4">
        <CheckCircle2 className="text-green-500 mr-2" size={24} />
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
