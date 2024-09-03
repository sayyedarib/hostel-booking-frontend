import { useState, useEffect } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useAuth } from '@clerk/nextjs'
import { useRouter } from "next/navigation";

import type { BedInRoomCard, CartItemShort } from "@/interface";

import { AddToCartStep1 } from "@/components/add-to-cart-drawer/step1";
import { AddToCartStep2 } from "@/components/add-to-cart-drawer/step2";
import { AddToCartStep3 } from "@/components/add-to-cart-drawer/step3";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { getBedData, addToCart, getBedsInCart } from "@/db/queries";
import { calculateRent, logger, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function AddToCartDrawer({
  roomId,
  className,
}: {
  roomId: number;
  className?: string;
}) {
  const { userId } = useAuth();
  const router = useRouter();
  // user states
  const [bedId, setBedId] = useQueryState("bedId", parseAsInteger);
  const [guestId, setGuestId] = useQueryState("guestId", parseAsInteger);
  const [checkIn, setCheckIn] = useQueryState("checkIn");
  const [checkOut, setCheckOut] = useQueryState("checkOut");
  const { toast } = useToast();
  const [cartItemsCount, setCartItemsCount] = useQueryState(
    "cartItemsCount",
    parseAsInteger.withDefault(0),
  );

  const [bedData, setBedData] = useState<BedInRoomCard[] | null>(null);
  const [cartData, setCartData] = useState<CartItemShort[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchBedData = async () => {
      const { status, data } = await getBedData(roomId);

      if (status === "error" || !data) {
        logger("error", "Error in fetching bed data", { roomId });
        return;
      }
      setBedData(data);
      setFetching(false);

      const { status: cartStatus, data: cartData } =
        await getBedsInCart(roomId);

      if (cartStatus === "error" || !cartData) {
        logger("error", "Error in fetching cart data", { roomId });
        return;
      }

      setCartData(cartData);
    };

    fetchBedData();
  }, []);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleBedSelect = (bedId: number) => {
    setBedId(bedId);
    handleNext();
  };

  const handleAddToCart = async () => {
    setLoading(true);

    if (!checkIn || !checkOut || !guestId || !bedId) {
      logger("error", "Missing required fields", {
        checkIn,
        checkOut,
        guestId,
        bedId,
      });
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Missing required fields, Please try again later",
      });
      return;
    }

    const { status, data } = await addToCart(guestId, bedId, checkIn, checkOut);

    if (status === "error" || !data) {
      logger("error", "Error in adding to cart", {
        guestId,
        bedId,
        checkIn,
        checkOut,
      });
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Error in adding to cart, Please try again later",
      });

      return;
    }

    setCartData((prev) => [
      ...prev,
      {
        guestId,
        bedId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
      },
    ]);

    setCartItemsCount((prev) => prev + 1);
    toast({
      title: "Added to cart",
    });
    logger("info", "Added to cart", { guestId, bedId, checkIn, checkOut });

    setCurrentStep(1);
    setLoading(false);
    setIsOpen(false);
  };

  const handleOpenDrawer = () => {
    if (!userId) {
      router.push("/sign-in?redirect_url=/rooms");
    } else {
      setIsOpen(true);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          className={cn(
            className,
            "w-full py-2 bg-primary text-white text-center font-semibold hover:bg-primary-dark transition-colors",
          )}
          onClick={handleOpenDrawer}
        >
          Add Bed to Cart
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[60vh]">
        {currentStep === 1 && (
          <AddToCartStep1
            cartData={cartData}
            bedData={bedData!}
            handleBedSelect={handleBedSelect}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {currentStep === 2 && bedData && bedId && (
          <AddToCartStep2
            bedData={bedData.find((bed) => Number(bed.id) === bedId)!}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <AddToCartStep3
            handleAddToCart={handleAddToCart}
            handleBack={handleBack}
            loading={loading}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
