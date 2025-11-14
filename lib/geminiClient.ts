/**
 * Client-side wrapper for Gemini API route
 * This provides a simple interface for calling the server-side Gemini analysis
 */

import type { AnalysisResult } from "./types";

/**
 * Analyzes product ingredients using Gemini via API route
 * Uses server-side API key from environment variable
 */
export async function analyzeWithGeminiClient(
  productName: string,
  ingredients: string
): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze-gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productName,
      ingredients,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result: AnalysisResult = await response.json();
  return result;
}