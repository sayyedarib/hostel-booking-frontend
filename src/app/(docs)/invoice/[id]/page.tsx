import { useCallback } from "react";
import { toWords } from "number-to-words";
import Image from "next/image";
import { cn, formatDate, calculateRent } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const dummyInvoiceData = {
  invoiceNumber: "12345",
  invoiceDate: new Date(),
  customerName: "John Doe",
  customerPhone: "1234567890",
  customerAddress: {
    address: "123 Main St",
    city: "Aligarh",
    pin: "202001",
    state: "Uttar Pradesh",
  },
  instituteName: "Aligarh Muslim University",
  enrollmentNumber: "1234567890",
  items: [
    {
      roomCode: "A1",
      bedCode: "B1",
      monthlyRent: 5000,
      checkIn: new Date(),
      checkOut: new Date(),
    },
  ],
  securityDeposit: 1000,
  discount: 0,
  fine: 200,
};

export default function InvoicePage({ params }: { params: { id: string } }) {
  const invoiceData = dummyInvoiceData;

  const calculateSubtotal = useCallback(() => {
    return invoiceData.items.reduce(
      (sum, item) =>
        sum +
        calculateRent(
          item.monthlyRent,
          new Date(item.checkIn),
          new Date(item.checkOut),
        ).payableRent,
      0,
    );
  }, [invoiceData]);

  const subtotal = calculateSubtotal();
  const grandTotal = subtotal + invoiceData.securityDeposit;

  return (
    <div
      className={cn(
        "max-w-4xl mx-auto text-base leading-relaxed font-serif shadow-md p-8",
      )}
    >
      <header>
        <h2 className="text-3xl font-bold text-center uppercase tracking-wide mb-4">
          Invoice
        </h2>
        <div className="flex justify-between">
          <p className="mb-2">
            <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
          </p>
          <p className="mb-2">
            <strong>Invoice Date:</strong> {formatDate(invoiceData.invoiceDate)}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">KHAN GROUP OF PG</h1>
            <p className="mb-1">Mobile: 8791476473</p>
            <p className="mb-2">
              Campus View Apartment, <br /> Beside Sultan Jahan Coaching,
              Shamshad Market, <br /> Aligarh 202001, <br /> Uttar Pradesh,
              India
            </p>
          </div>
          <div className="flex flex-col items-center">
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
      </header>

      <div className="w-full h-[1px] bg-slate-300 my-2" />
      <section>
        <div>
          <p>
            <strong>Bill To:</strong>
          </p>
          <p>{invoiceData.customerName}</p>
          <p>Ph: {invoiceData.customerPhone}</p>
          <p>Enrollment No: {invoiceData.enrollmentNumber}</p>
          <p>Institute Name: {invoiceData.instituteName}</p>
          <div className="flex gap-4 justify-between mt-3">
            <div className="mb-2">
              <p>
                <strong>Permanent Address:</strong>
              </p>
              <p>
                {invoiceData.customerAddress.address},<br />
                {invoiceData.customerAddress.city},{" "}
                {invoiceData.customerAddress.pin},{" "}
                {invoiceData.customerAddress.state}
              </p>
            </div>
            <div className="mb-2">
              <p>
                <strong>Correspondence Address:</strong>
                <br />
                Bed No. 101, Room No. 101
                <br />
                Campus View Apartment, Beside Sultan Jahan Coaching,
                <br />
                Shamshad Market, Aligarh 202001, Uttar Pradesh
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section>
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
            {invoiceData.items.map((item, index) => (
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
              <td className="border p-2 text-right">
                {invoiceData.securityDeposit}
              </td>
            </tr>
            <tr>
              <td className="border p-2">Additional Charges</td>
              <td className="border p-2 text-right">₹{invoiceData.fine}</td>
              <td className="border p-2 text-right">1</td>
              <td className="border p-2 text-right">₹{invoiceData.fine}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <Separator />
      <section className="h-36">
        <div className="flex justify-between">
          <div>
            <p>
              <strong>Total Items:</strong> {invoiceData.items.length + 1}
            </p>
          </div>
          <div>
            <p>
              <strong>Subtotal:</strong> ₹{subtotal}
            </p>
            <p>
              <strong>Security Deposit:</strong> ₹{invoiceData.securityDeposit}
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
      <Separator />
      <footer className="h-52 flex flex-col justify-between">
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
}
