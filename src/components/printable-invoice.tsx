import React, { forwardRef, useCallback } from "react";
import { toWords } from "number-to-words";

import type { ExtendGuest } from "@/interface";

import { cn, formatDate, calculateRent } from "@/lib/utils";
import { Separator } from "./ui/separator";

interface InvoiceProps {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: ExtendGuest[];
  securityDeposit: number;
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
              <h1 className="text-2xl font-bold">KHAN GROUP OF PG</h1>
              <p>Mobile: 8791476473</p>
              <p>Website: www.aligarhhostel.com</p>
            </div>
            <img src="/logo.png" className="w-32 h-32" alt="Logo" />
          </div>
          <h2 className="text-3xl font-bold text-center uppercase tracking-wide">
            Invoice
          </h2>
          <p className="text-center text-gray-600 h-14">
            ORIGINAL FOR RECIPIENT
          </p>
        </header>

        <div className="h-1 bg-white w-full" />
        <Separator />
        <div className="h-3 bg-white w-full" />
        <section className=" bg-white h-32">
          <div className="flex justify-between">
            <div>
              <p>
                <strong>Invoice #:</strong> {invoiceNumber}
              </p>
              <p>
                <strong>Invoice Date:</strong> {formatDate(invoiceDate)}
              </p>
            </div>
            <div>
              <p>
                <strong>Bill To:</strong>
              </p>
              <p>{customerName}</p>
              <p>Ph: {customerPhone}</p>
              <p>{customerAddress}</p>
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
        <footer className="bg-white h-28">
          <p className="font-bold pb-2">for KHAN GROUP OF PG</p>
          <img
            src="/signature.png"
            alt="signature of the property owner"
            className="h-36 w-40 object-cover"
          />
          <div>
            <p>Authorized Signatory</p>
          </div>
          <p className="text-sm text-center text-gray-600 pb-2">
            This is a computer generated document and requires no signature |
            ORIGINAL FOR RECIPIENT
          </p>
        </footer>
      </div>
    );
  },
);

PrintableInvoice.displayName = "PrintableInvoice";

export default PrintableInvoice;
