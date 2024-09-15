"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IndianRupee, Trash2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import Lottie from "lottie-react";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemsCount, setCartItemsCount] = useQueryState(
    "cartItemsCount",
    parseAsInteger.withDefault(0),
  );
  const { toast } = useToast();
  const [securityDepositStatus, setSecurityDepositStatus] = useState<
    "paid" | "pending" | "lost" | null
  >("pending");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      const { data: cartData } = await getCartItems();
      const { data: securityDepositData } = await getSecurityDepositStatus();

      if (!cartData) {
        logger("info", "Failed to fetch cart items");
        return;
      }

      const enhancedData = cartData.map((item) => ({
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

      setFetching(false);
      setCartItems(enhancedData);
      setCartItemsCount(enhancedData.length);
      setSecurityDepositStatus(
        securityDepositData as "paid" | "pending" | "lost",
      );
    };

    fetchCartItems();
  }, []);

  const handleRemove = async (cartId: number) => {
    const response = await removeFromCart(cartId);
    if (response.status === "success") {
      setCartItemsCount(cartItemsCount - 1);
      setCartItems(cartItems.filter((item) => item.id !== cartId));
    } else {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Failed to remove item from cart, Please try again later",
      });
      logger("error", "Failed to remove item from cart");
      return;
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item?.payableRent, 0);
  };

  return (
    <>
      <Header className="sticky top-0 z-50" />
      {fetching ? (
        <div className="min-h-[80vh] min-w-screen flex justify-center items-center">
          <Image
            src="/Loading.gif"
            width={100}
            height={100}
            alt="loading"
            unoptimized={true}
          />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="min-h-[80vh] min-w-screen flex flex-col justify-center items-center">
          <Lottie
            animationData={emptyCartAnimation}
            style={{ width: 300, height: 300 }}
          />
          <h2 className="text-2xl font-semibold mt-4">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">
            Add some items to your cart to get started!
          </p>
          <Button onClick={() => router.push("/rooms")} className="mt-6">
            Continue Booking
          </Button>
        </div>
      ) : (
        <div className="container mx-auto p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            Your Cart
          </h1>
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
            <ul className="divide-y divide-gray-200">
              {cartItems.map((item) => (
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
                Total: <IndianRupee />
                {calculateTotal() +
                  (securityDepositStatus !== "paid" ? 1000 : 0)}
              </h2>
              <Button
                onClick={() => router.push("/agreement-checkout")}
                className="hidden md:block"
              >
                Checkout
              </Button>
              <Button
                onClick={() => router.push("/agreement-checkout")}
                className="md:hidden fixed bottom-0 left-0 rounded-none w-full"
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
