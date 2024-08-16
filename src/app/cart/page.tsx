"use client";

import { useState, useEffect } from "react";
import { getCartItems, removeFromCart } from "@/db/queries";
import { logger } from "@/lib/utils";
import { CartItem } from "@/interface";
import Image from "next/image";
import { Trash } from "lucide-react";

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
    return cartItems
      .reduce((total, item) => total + item.dailyRent, 0)
      .toFixed(2);
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
                <p className="text-lg font-semibold mr-4">
                  ${item.dailyRent.toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:text-red-700 transition duration-200"
                >
                  <Trash size={24} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-0">
            Total: ${calculateTotal()}
          </h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
