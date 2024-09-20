import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest, res: NextResponse) {
  const url = "http://localhost:3000/invoice/2";

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
    const invoiceDir = path.resolve("public/invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }
    await page.pdf({ path: path.join(invoiceDir, "4.pdf"), format: "A4" });
    await browser.close();
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, { status: 500 });
  }
}
