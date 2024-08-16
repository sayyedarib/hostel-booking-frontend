"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IndianRupee, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCartItems, removeFromCart } from "@/db/queries";
import { logger } from "@/lib/utils";
import { CartItem } from "@/interface";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const { data } = await getCartItems();

      if (!data) {
        logger("info", "Failed to fetch cart items");
        return;
      }
      console.log(data);
      setCartItems(data);
    };

    fetchCartItems();
  }, []);

  const handleRemove = async (cartId: number) => {
    const response = await removeFromCart(cartId);
    if (response.status === "success") {
      setCartItems(cartItems.filter((item) => item.id !== cartId));
    } else {
      logger("error", "Failed to remove item from cart");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.amount, 0);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your Cart</h1>
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
                  src={item?.roomImage?.[0] ?? ""}
                  alt="room image"
                  className="hidden md:block w-64 h-48 object-cover rounded-lg mr-4"
                />
                <div>
                  <h2 className="text-lg font-semibold">{item.buildingName}</h2>
                  <p className="text-gray-500">Room Code: {item.roomCode}</p>
                  <p className="text-gray-500">Bed Code: {item.bedCode}</p>
                  <p className="text-gray-500">Bed Type: {item.bedType}</p>
                  <p className="text-gray-500">Guest Name: {item.guestName}</p>
                  <p className="text-gray-500">
                    Check-In:{" "}
                    {new Date(item.checkIn).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-500">
                    Check-Out:{" "}
                    {new Date(item.checkOut).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right sm:text-left flex items-center">
                <p className="text-lg font-semibold mr-4 flex items-center">
                  <IndianRupee />
                  {item.amount}
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
        <div className="mt-6 flex flex-col items-start">
          <span className="flex items-center">
            Total Rent for 1 month: <IndianRupee size={14} /> {calculateTotal()}
          </span>
          <span className="flex items-center">
            Security Deposit: <IndianRupee size={14} /> 1000
          </span>
          <Separator className="my-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-2 flex items-center">
            Total: <IndianRupee />
            {calculateTotal()}
          </h2>
          <Button>Checkout</Button>
        </div>
      </div>
    </div>
  );
}
