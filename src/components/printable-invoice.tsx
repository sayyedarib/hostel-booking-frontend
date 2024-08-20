import React, { forwardRef } from "react";
import Image from "next/image";
import { toWords } from "number-to-words";

import type { ExtendGuest } from "@/interface";

import { cn, formatDate, calculateRent } from "@/lib/utils";

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
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        calculateRent(
          item.monthlyRent,
          new Date(item.checkIn),
          new Date(item.checkOut),
        ).payableRent,
      0,
    );
    const grandTotal = subtotal + securityDeposit;

    return (
      <div
        ref={ref}
        className={cn(
          className,
          "p-8 max-w-4xl mx-auto text-base text-gray-900 leading-relaxed font-serif border border-gray-300 shadow-md bg-white",
        )}
      >
        <header className="mb-8">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">KHAN GROUP OF PG</h1>
              <p>Mobile: 8791476473</p>
              <p>Website: www.aligarhhostel.com</p>
            </div>
            <Image src="/logo.png" alt="Logo" width={100} height={80} />
          </div>
          <h2 className="text-3xl font-bold text-center uppercase tracking-wide">
            Invoice
          </h2>
          <p className="text-center text-gray-600">ORIGINAL FOR RECIPIENT</p>
        </header>

        <section className="mb-8">
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

        <section className="mb-8">
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

        <section className="mb-8">
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

        <footer className="mt-12 pt-8 border-t">
          <p className="font-bold">for KHAN GROUP OF PG</p>
          <div className="mt-8">
            <p>Authorized Signatory</p>
          </div>
          <p className="mt-8 text-sm text-center text-gray-600">
            This is a computer generated document and requires no signature |
            ORIGINAL FOR RECIPIENT
          </p>
        </footer>
      </div>
    );
  },
);

// Helper function to convert number to words (you'll need to implement this)
function numberToWords(num: number): string {
  return ""; // Placeholder
}

export default PrintableInvoice;
