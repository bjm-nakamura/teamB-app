/**
 * Client-side wrapper for OpenAI API route
 * This provides a simple interface for calling the server-side OpenAI analysis
 */

import type { AnalysisResult } from "./types";

/**
 * Analyzes product ingredients using OpenAI via API route
 * Unlike Gemini, this uses server-side API key from environment variable
 */
export async function analyzeWithOpenAIClient(
  productName: string,
  ingredients: string
): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze-openai", {
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
