import { useState, useEffect } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import type { BedInRoomCard, CartItemShort } from "@/interface";

import { AddToCartStep1 } from "@/components/add-to-cart-drawer/step1";
import { AddToCartStep2 } from "@/components/add-to-cart-drawer/step2";
import { AddToCartStep3 } from "@/components/add-to-cart-drawer/step3";
import { AddToCartStep4 } from "@/components/add-to-cart-drawer/step4";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { getBedData, addToCart, getBedsInCart } from "@/db/queries";
import { logger, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

export default function AddToCartDrawer({
  roomId,
  className,
}: {
  roomId: number;
  className?: string;
}) {
  const { userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { data: bedData, isLoading: isBedDataLoading } = useQuery({
    queryKey: ["bedData", roomId],
    queryFn: async () => {
      const { status, data } = await getBedData(roomId);
      if (status === "error" || !data) {
        throw new Error("Error in fetching bed data");
      }
      return data;
    },
  });

  const { data: cartData, isLoading: isCartDataLoading } = useQuery({
    queryKey: ["cartData", roomId],
    queryFn: async () => {
      const { status, data } = await getBedsInCart(roomId);
      if (status === "error" || !data) {
        throw new Error("Error in fetching cart data");
      }
      return data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!checkIn || !checkOut || !guestId || !bedId) {
        throw new Error("Missing required fields");
      }
      const { status, data } = await addToCart(guestId, bedId, checkIn, checkOut);
      if (status === "error" || !data) {
        throw new Error("Error in adding to cart");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartData"] });
      setCartItemsCount((prev) => prev + 1);
      logger("info", "Added to cart", { guestId, bedId, checkIn, checkOut });
      setCurrentStep(4);
      setTimeout(() => {
        setIsOpen(false);
        setCurrentStep(1);
      }, 3000);
    },
    onError: (error) => {
      logger("error", "Error in adding to cart", { error });
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Error in adding to cart, Please try again later",
      });
    },
  });

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);
  const handleBedSelect = (bedId: number) => {
    setBedId(bedId);
    handleNext();
  };

  const handleAddToCart = () => addToCartMutation.mutate();

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
        <Progress value={((currentStep - 1) / 4) * 100} className="w-full mb-4 mt-2" />
        {currentStep === 1 && (
          <AddToCartStep1
            cartData={cartData || []}
            bedData={bedData || []}
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
            loading={addToCartMutation.isPending}
          />
        )}
        {currentStep === 4 && (
          <AddToCartStep4 />
        )}
      </DrawerContent>
    </Drawer>
  );
}
