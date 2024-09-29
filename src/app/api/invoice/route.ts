import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, res: NextResponse) {

  const { userId, bookingId } = await req.json();
  console.log("userID in api route: ", userId);
  console.log("bookingId in api route: ", bookingId);

  const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/invoice/${bookingId}?userId=${userId}`;

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v127.0.0/chromium-v127.0.0-pack.tar"),
    headless: true,
  });
  console.log("opening page");
  const page = await browser.newPage();
  await page.goto(url);
  try {
    console.log("generating pdf");
    const pdfBuffer = await page.pdf({ 
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      scale: 0.8,
    });
    await browser.close();

    // Initialize Supabase client
    const supabase = createClient();

    // Upload PDF to Supabase storage
    const fileName = `invoice_${Date.now()}.pdf`;
    const { data, error } = await supabase.storage
      .from("invoice")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf"
      });

    if (error) {
      console.error("Error uploading PDF:", error);
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
    }

    // Get public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("invoice")
      .getPublicUrl(fileName);

    if (!publicUrlData) {
      console.error("Failed to get public URL of uploaded PDF");
      return NextResponse.json({ error: 'Failed to get public URL of uploaded PDF' }, { status: 500 });
    }

    return NextResponse.json({ pdfUrl: publicUrlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 });
  }
}

// Curl command to test this API endpoint:
// curl -X POST http://localhost:3000/api/invoice \
//   -H "Content-Type: application/json" \
//   -d '{"userId": 123, "bookingId": 456}'
