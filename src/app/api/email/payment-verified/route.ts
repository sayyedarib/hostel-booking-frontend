import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { TransactionTable } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    try {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Success</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .message-container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .message-container h1 {
                    color: #4CAF50;
                }
            </style>
        </head>
        <body>
            <div class="message-container">
                <h1>Success!</h1>
                <p>Payment has been verified successfully.</p>
            </div>
        </body>
        </html>
      `,
        { headers: { "Content-Type": "text/html" } },
      );
    } catch (dbError) {
      console.error("Error updating payment table", dbError);
      return NextResponse.json(
        { error: "Error updating payment table" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Got some error :(", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
