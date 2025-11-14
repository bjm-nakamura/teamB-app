/**
 * API Route for OpenAI-based EU export compliance analysis
 * This route handles server-side OpenAI API calls using the OPENAI_API_KEY environment variable
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeWithOpenAI } from "@/lib/openaiApi";

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

    // Call OpenAI analysis function
    const result = await analyzeWithOpenAI(productName, ingredients);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error in OpenAI analysis:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Analysis failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
