import React, { forwardRef, useCallback } from "react";
import { toWords } from "number-to-words";
import Image from "next/image";

import type { ExtendGuest } from "@/interface";

import { cn, formatDate, calculateRent } from "@/lib/utils";
import { Separator } from "./ui/separator";

interface InvoiceProps {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: {
    address: string;
    city: string;
    pin: string;
    state: string;
  };
  items: ExtendGuest[];
  securityDeposit: number;
  discount: number;
  fine: number;
  roomCode: string;
  className?: string;
}

const PrintableInvoice = forwardRef<HTMLDivElement, InvoiceProps>(
  (
    {
      invoiceNumber,
      invoiceDate,
      customerName,
      customerPhone,
      customerAddress,
      items,
      securityDeposit,
      discount,
      fine,
      roomCode,
      className,
    },
    ref,
  ) => {
    const calculateSubtotal = useCallback(() => {
      return items.reduce(
        (sum, item) =>
          sum +
          calculateRent(
            item.monthlyRent,
            new Date(item.checkIn),
            new Date(item.checkOut),
          ).payableRent,
        0,
      );
    }, [items]);

    const subtotal = calculateSubtotal();
    const grandTotal = subtotal + securityDeposit;

    return (
      <div
        ref={ref}
        className={cn(
          className,
          "max-w-4xl mx-auto text-base leading-relaxed font-serif shadow-md bg-white",
        )}
      >
        <header className=" bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">KHAN GROUP OF PG</h1>
              <p className="mb-1 bg-white">Mobile: 8791476473</p>
              <p className="mb-2 bg-white">
                Campus View Appartment, <br /> Beside Sultan Jahan Coaching,
                Shamshad Market, <br /> Aligarh 202001, <br /> Uttar Pradesh,
                India
              </p>
            </div>
            <div className="flex flex-col items-center bg-white">
              <Image
                src="/logo.png"
                className="w-28 h-28 object-contain"
                alt="Khan Group of PG Logo"
                width={112}
                height={112}
              />
              <p className="text-sm mb-1">www.aligarhhostel.com</p>
            </div>
          </div>
          <div className="h-1 bg-white w-full" />
          <h2 className="text-3xl font-bold text-center uppercase tracking-wide mb-4 bg-white">
            Invoice
          </h2>
          <div className="flex justify-between bg-white">
            <p className="mb-2">
              <strong>Invoice #:</strong> {invoiceNumber}
            </p>
            <p className="mb-2">
              <strong>Invoice Date:</strong> {formatDate(invoiceDate)}
            </p>
          </div>
        </header>

        <div className="h-1 bg-white w-full" />
        <Separator />
        <div className="h-3 bg-white w-full" />
        <section className=" bg-white">
          <div className="">
            <div>
              <p>
                <strong>Bill To:</strong>
              </p>
              <p>{customerName}</p>
              <p>Ph: {customerPhone}</p>
              <div className="flex gap-4 justify-between">
                <div className="mb-2">
                  <p>
                    <strong>Permanent Address:</strong>
                  </p>
                  <p>
                    {customerAddress.address},<br />
                    {customerAddress.city}, {customerAddress.pin} <br />
                    {customerAddress.state}
                  </p>
                </div>
                <div className="mb-2">
                  <p>
                    <strong>Correspondence Address:</strong>
                    <br />
                    Campus Of View Appartment,
                    <br /> Beside Sultan Jahan Coaching,
                    <br />
                    Shamshad Market, Aligarh 202001, <br />
                    Uttar Pradesh, India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-3 bg-white w-full" />

        <section className=" bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-right">Rate</th>
                <th className="border p-2 text-right">Qty</th>
                <th className="border p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">
                    Room {item.roomCode} | Bed {item.bedCode}
                  </td>
                  <td className="border p-2 text-right">
                    ₹{item.monthlyRent}/month
                  </td>
                  <td className="border p-2 text-right">1</td>
                  <td className="border p-2 text-right">
                    ₹
                    {
                      calculateRent(
                        item.monthlyRent,
                        new Date(item.checkIn),
                        new Date(item.checkOut),
                      ).payableRent
                    }
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border p-2">Security Deposit (Refundable)</td>
                <td className="border p-2 text-right">₹1000</td>
                <td className="border p-2 text-right">1</td>
                <td className="border p-2 text-right">{securityDeposit}</td>
              </tr>
              <tr>
                <td className="border p-2">Additional Charges</td>
                <td className="border p-2 text-right">₹{fine}</td>
                <td className="border p-2 text-right">1</td>
                <td className="border p-2 text-right">₹{fine}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <div className="h-2 bg-white w-full" />
        <section className=" bg-white h-36">
          <div className="flex justify-between">
            <div>
              <p>
                <strong>Total Items:</strong> {items.length + 1}
              </p>
            </div>
            <div>
              <p>
                <strong>Subtotal:</strong> ₹{subtotal}
              </p>
              <p>
                <strong>Security Deposit:</strong> ₹{securityDeposit}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{grandTotal}
              </p>
              <p>
                <strong>Amount in words:</strong> {toWords(grandTotal)} Rupees
                Only
              </p>
            </div>
          </div>
        </section>
        <div className="h-1 bg-white w-full" />
        <Separator />
        <div className="h-1 bg-white w-full" />
        <footer className="bg-white h-52 flex flex-col justify-between">
          <div>
            <p className="font-bold text-lg mb-2">For KHAN GROUP OF PG</p>
            <Image
              src="/signature.png"
              alt="Authorized Signature"
              className="h-20 w-48 object-contain mb-2"
              width={192}
              height={80}
            />
            <p className="text-sm font-semibold">Authorized Signatory</p>
          </div>
          <div className="border-t pt-2">
            <p className="text-xs text-center text-gray-600">
              This is a computer-generated document. No physical signature is
              required.
            </p>
            <p className="text-xs text-center text-gray-600 font-semibold mb-2">
              ORIGINAL FOR RECIPIENT
            </p>
          </div>
        </footer>
      </div>
    );
  },
);

PrintableInvoice.displayName = "PrintableInvoice";

export default PrintableInvoice;
