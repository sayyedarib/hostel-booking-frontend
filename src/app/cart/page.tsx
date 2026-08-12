"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
// Lottie ships its own renderer; load it only when the animation shows.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IndianRupee, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  getCartItems,
  removeFromCart,
  getSecurityDepositStatus,
} from "@/db/queries";
import { calculateRent, logger } from "@/lib/utils";
import { CartItem } from "@/interface";
import { Separator } from "@/components/ui/separator";
import { differenceInDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import emptyCartAnimation from "../../../public/empty_cart.json";

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [enhancedCartItems, setEnhancedCartItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: securityDepositStatus } = useQuery({
    queryKey: ["securityDepositStatus"],
    queryFn: async () => {
      const { status, data } = await getCartItems();
      if (status === "error") {
        return [];
      }
      return data;
    },
  });

  const { data: cartItems, isLoading: fetching } = useQuery({
    queryKey: ["cartItems"],
    queryFn: async () => {
      const { status, data } = await getCartItems();
      if (status === "error") {
        return [];
      }
      return data;
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartItems"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Failed to remove item from cart, Please try again later",
      });
      logger("error", "Failed to remove item from cart");
    },
  });

  useEffect(() => {
    if (cartItems) {
      const enhancedData = cartItems.map((item) => ({
        ...item,
        totalRent: calculateRent(
          item.monthlyRent,
          new Date(item.checkIn),
          new Date(item.checkOut),
        ).totalRent,
        payableRent: calculateRent(
          item.monthlyRent,
          new Date(item.checkIn),
          new Date(item.checkOut),
        ).payableRent,
      }));
      setEnhancedCartItems(enhancedData);
    }
  }, [cartItems]);

  const handleRemove = (cartId: number) => {
    removeMutation.mutate(cartId);
  };

  const calculateTotal = () => {
    return (
      enhancedCartItems?.reduce(
        (total, item) => total + item?.payableRent,
        0,
      ) || 0
    );
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    router.push("/agreement-checkout");
  };

  return (
    <>
      <Header className="sticky top-0 z-50" />
      {fetching ? (
        <div className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-gray-400"
            aria-hidden="true"
          />
          <p className="text-gray-500">Loading your cart…</p>
        </div>
      ) : cartItems?.length === 0 ? (
        <main
          id="main-content"
          className="flex min-h-[80vh] w-full flex-col items-center justify-center px-4 text-center"
        >
          <Lottie
            animationData={emptyCartAnimation}
            style={{ width: 300, height: 300 }}
            aria-hidden="true"
          />
          <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-gray-500">
            Pick a bed from an available room to start your booking.
          </p>
          <Button onClick={() => router.push("/rooms")} className="mt-6">
            Browse rooms
          </Button>
        </main>
      ) : (
        <div className="container mx-auto p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            Your Cart
          </h1>
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
            <ul className="divide-y divide-gray-200">
              {enhancedCartItems.map((item) => (
                <li
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                >
                  <div className="flex items-center mb-4 sm:mb-0">
                    <Image
                      width={1500}
                      height={1500}
                      src={item?.roomImage?.[0] ?? "/bg.webp"}
                      alt="room image"
                      className="hidden md:block w-64 h-48 object-cover rounded-lg mr-4"
                    />
                    <div className="text-xs md:text-md lg:text-lg">
                      <span className="flex">
                        <h2 className="font-semibold">{item.buildingName}</h2> |
                        Room {item.roomCode} | Bed {item.bedCode} |{" "}
                        {item.bedType}
                      </span>
                      <p className="text-gray-500">{item.guestName}</p>
                      <p className="text-gray-500">
                        {differenceInDays(
                          new Date(item.checkOut),
                          new Date(item.checkIn),
                        )}{" "}
                        Days |{" "}
                        {new Date(item.checkIn).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        -
                        {new Date(item.checkOut).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-gray-500 flex items-center">
                        Total Rent: <IndianRupee size={14} />
                        {item.totalRent}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:text-left text-xs md:text-md lg:text-lg flex items-center justify-between md:justify-normal w-full md:w-auto">
                    <p className="font-semibold mr-4 flex items-center">
                      <IndianRupee size={16} />
                      {item.payableRent}
                    </p>
                    <Trash2
                      onClick={() => handleRemove(item.id)}
                      size={24}
                      className="cursor-pointer text-red-500"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="mt-6 flex flex-col items-start text-xs md:text-md lg:text-lg">
              <span className="flex items-center">
                Total Rent to be paid: <IndianRupee size={14} />{" "}
                {calculateTotal()}
              </span>
              <span className="flex items-center">
                Security Deposit(Refundable): <IndianRupee size={14} /> 1000
              </span>
              <Separator className="my-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-2 flex items-center">
                Total: <IndianRupee size={18} />
                {calculateTotal() + (securityDepositStatus ? 1000 : 0)}
              </h2>
              <Button
                onClick={handleCheckout}
                className="hidden md:flex gap-2 text-black"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
              <Button
                onClick={handleCheckout}
                className="md:hidden fixed bottom-0 left-0 right-0 rounded-none w-full flex gap-2"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
