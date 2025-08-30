'use client';

import { useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import { AddToCartStep1 } from "@/components/add-to-cart-drawer/step1";
import { AddToCartStep2 } from "@/components/add-to-cart-drawer/step2";
import { AddToCartStep3 } from "@/components/add-to-cart-drawer/step3";
import { AddToCartStep4 } from "@/components/add-to-cart-drawer/step4";
import { AddToCartStep5 } from "@/components/add-to-cart-drawer/step5";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  getBedData,
  addToCart,
  getCartBedsOfRoom,
  getUserOnboardingStatus,
} from "@/db/queries";
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
  console.log("roomId", roomId);
  const { userId } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  // user states
  const [isOpen, setIsOpen] = useState(false);
  const [bedId, setBedId] = useQueryState("bedId", parseAsInteger);
  const [checkIn, setCheckIn] = useQueryState("checkIn");
  const [checkOut, setCheckOut] = useQueryState("checkOut");
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);

  const { data: bedDataRoomId, isFetching: isBedDataLoading } = useQuery({
    queryKey: ["bedData", roomId],
    queryFn: async () => {
      const { status, data } = await getBedData(roomId);
      if (status === "error" || !data) {
        throw new Error("Error in fetching bed data");
      }
      return data;
    },
    enabled: isOpen && !!roomId,
    placeholderData: keepPreviousData,
  });

  const { data: cartData, isLoading: isCartDataLoading } = useQuery({
    queryKey: ["cartData", roomId],
    queryFn: async () => {
      const { status, data } = await getCartBedsOfRoom(roomId);
      if (status === "error" || !data) {
        throw new Error("Error in fetching cart data");
      }
      return data;
    },
    enabled: isOpen && !!roomId,
    placeholderData: keepPreviousData,
  });

  const { data: onboardingStatus } = useQuery({
    queryKey: ["onboardingStatus", roomId],
    queryFn: async () => {
      const { status, data } = await getUserOnboardingStatus();
      if (status === "error" || !data) {
        throw new Error("Error in fetching onboarding status");
      }
      return data;
    },
    enabled: isOpen && !!roomId,
    placeholderData: keepPreviousData,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (guestId: number) => {
      if (!checkIn || !checkOut || !guestId || !bedId) {
        logger("info", "Missing required fields", {
          checkIn,
          checkOut,
          guestId,
          bedId,
        });
        toast({
          variant: "destructive",
          title: "Missing required fields",
          description: "Please fill all the fields",
        });
        throw new Error("Missing required fields");
      }
      const { status } = await addToCart(guestId, bedId, checkIn, checkOut);
      if (status === "error") {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Error in adding to cart, Please try again later",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartData"] });
      queryClient.invalidateQueries({ queryKey: ["cartItemsCount"] });
      logger("info", "Added to cart", { bedId, checkIn, checkOut });
      setCurrentStep(5);
      setTimeout(() => {
        setIsOpen(false);
        setCurrentStep(1);
      }, 3000);
    },
  });

  const handleNext = () => {
    if (currentStep === 2 && onboardingStatus?.onboarded) {
      setCurrentStep(4);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    if (currentStep === 4 && onboardingStatus?.onboarded) {
      setCurrentStep(2);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const handleBedSelect = (bedId: number) => {
    setBedId(bedId);
    handleNext();
  };

  const handleAddToCart = (guestId: number) => {
    addToCartMutation.mutate(guestId);
  };

  const handleOpenDrawer = () => {
    if (!userId) {
      router.push("/sign-in?redirect_url=/rooms");
    } else {
      setIsOpen(true);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} key={roomId}>
      <DrawerTrigger asChild>
        <Button
          className={cn(
            className,
            "w-full py-2 bg-primary text-center font-semibold hover:bg-primary-dark transition-colors text-black",
          )}
          onClick={handleOpenDrawer}
        >
          Add Bed to Cart
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[60vh]">
        <Progress
          value={((currentStep - 1) / 4) * 100}
          className="w-full mt-1 mb-2"
        />
        {currentStep === 1 && (
          <AddToCartStep1
            cartData={cartData || []}
            bedData={bedDataRoomId || []}
            handleBedSelect={handleBedSelect}
            handleNext={handleNext}
            handleBack={handleBack}
            isBedDataLoading={isBedDataLoading || isCartDataLoading}
          />
        )}
        {currentStep === 2 && bedDataRoomId && bedId && (
          <AddToCartStep2
            bedData={bedDataRoomId.find((bed) => Number(bed.id) === bedId)!}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {currentStep === 3 && !onboardingStatus?.onboarded && (
          <AddToCartStep3 handleBack={handleBack} handleNext={handleNext} />
        )}
        {currentStep === 4 && (
          <AddToCartStep4
            handleAddToCart={handleAddToCart}
            handleBack={handleBack}
            handleNext={handleNext}
            loading={addToCartMutation.isPending}
          />
        )}
        {currentStep === 5 && <AddToCartStep5 />}
      </DrawerContent>
    </Drawer>
  );
}
