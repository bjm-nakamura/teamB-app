/**
 * API Route for Gemini-based EU export compliance analysis
 * This route handles server-side Gemini API calls using the GEMINI_API_KEY environment variable
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/geminiApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, ingredients } = body;

    // Validate input
    if (!productName || !ingredients) {
      return NextResponse.json(
        { error: "Missing required fields: productName and ingredients" },
        { status: 400 }
      );
    }

    // Call Gemini analysis function
    const result = await analyzeWithGemini(productName, ingredients);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error in Gemini analysis:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Analysis failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}