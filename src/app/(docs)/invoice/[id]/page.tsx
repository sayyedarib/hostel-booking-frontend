
import { toWords } from "number-to-words";
import Image from "next/image";

import { cn, formatDate, calculateRent } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getInvoiceDetails } from "@/db/queries";


export default async function InvoicePage({ params, searchParams }: { params: { id: string }, searchParams: { userId: string } }) {
  const userId = Number(searchParams.userId)

  console.log("userId in invoice page", userId);
  const { data: invoiceDetails } = await getInvoiceDetails(Number(params.id), userId);

  return (
    <div
      className={cn(
        "max-w-4xl mx-auto text-base leading-relaxed font-serif p-4",
      )}
    >
      <header>
        <h2 className="text-3xl font-bold text-center uppercase tracking-wide mb-4">
          Invoice
        </h2>
        <div className="flex justify-between">
          <p className="mb-2">
            <strong>Invoice #:</strong> KH_{Date.now()}
          </p>
          <p className="mb-2">
            <strong>Invoice Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">KHAN GROUP OF PG</h1>
            <p>Mobile: 8791476473</p>
            <p>
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

      <div className="w-full h-[1px] bg-slate-200 my-2" />
      <section>
        <div>
          <p>
            <strong>Bill To:</strong>
          </p>
          <p>{invoiceDetails?.userName}</p>
          <p>Ph: {invoiceDetails?.userPhone}</p>
          <p>Enrollment No: GM6697</p>
          <p>Institute Name: Aligarh Muslim University</p>
          <div className="flex gap-4 justify-between mt-3">
            <div className="mb-2">
              <p>
                <strong>Permanent Address:</strong>
              </p>
              <p>
                {invoiceDetails?.address},<br />
                {invoiceDetails?.city},{" "}
                {invoiceDetails?.pin},{" "}
                {invoiceDetails?.state}
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
            {invoiceDetails?.beds?.map((item: any, index: number) => (
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
                ₹{invoiceDetails?.securityDeposit}
              </td>
            </tr>
            <tr>
              <td className="border p-2">Additional Charges</td>
              <td className="border p-2 text-right">₹{invoiceDetails?.additionalCharges}</td>
              <td className="border p-2 text-right">1</td>
              <td className="border p-2 text-right">₹{invoiceDetails?.additionalCharges}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <Separator />
      <section className="h-36">
        <div className="flex justify-between">
          <div>
            <p>
              <strong>Total Items:</strong> {(invoiceDetails?.beds?.length ?? 0) + 1}
            </p>
          </div>
          <div>
            <p>
              <strong>Subtotal:</strong> ₹{invoiceDetails?.rentAmount}
            </p>
            <p>
              <strong>Security Deposit:</strong> ₹{invoiceDetails?.securityDeposit}
            </p>
            <p>
              <strong>Total Amount:</strong> ₹{invoiceDetails?.totalAmount}
            </p>
            <p>
              <strong>Amount in words:</strong> {toWords(invoiceDetails?.totalAmount ?? 0)} Rupees
              Only
            </p>
          </div>
        </div>
      </section>
      <Separator className="my-2" />
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
        <div className="pt-2">
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
