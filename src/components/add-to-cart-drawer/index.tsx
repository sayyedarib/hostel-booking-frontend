import { useState, useEffect } from "react";
import { parseAsInteger, useQueryState } from "nuqs";

import type { BedInRoomCard, CartItem } from "@/interface";

import { AddToCartStep1 } from "@/components/add-to-cart-drawer/step1";
import { AddToCartStep2 } from "@/components/add-to-cart-drawer/step2";
import { AddToCartStep3 } from "@/components/add-to-cart-drawer/step3";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { getBedData, getOccupancyOfBed } from "@/db/queries";
import { logger } from "@/lib/utils";

export default function AddToCartDrawer({ roomId }: { roomId: number }) {
  const [bedId, setBedId] = useQueryState("bedId", parseAsInteger);

  const [bedData, setBedData] = useState<BedInRoomCard[] | null>(null);
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBed, setSelectedBed] = useState<number | null>(bedId);

  useEffect(() => {
    const fetchBedData = async () => {
      const { status, data } = await getBedData(roomId);

      if (status === "error" || !data) {
        logger("error", "Error in fetching bed data", { roomId });
        return;
      }

      setBedData(data);
      setLoading(false);
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
    setSelectedBed(bedId);
    handleNext();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full py-2 bg-primary text-white rounded-lg text-center font-semibold hover:bg-primary-dark transition-colors">
          Add Bed to Cart
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        {currentStep === 1 && (
          <AddToCartStep1
            cartData={cartData}
            bedData={bedData!}
            handleBedSelect={handleBedSelect}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {currentStep === 2 && bedData && selectedBed && (
          <AddToCartStep2
            bedData={bedData[selectedBed]}
            handleNext={handleNext}
            handleBack={handleBack}
          />
        )}
        {currentStep === 3 && <AddToCartStep3 handleBack={handleBack} />}
      </DrawerContent>
    </Drawer>
  );
}
