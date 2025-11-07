/**
 * Type definitions for EU Export Compliance AI application
 */

/**
 * Represents extracted product information from a product page
 */
export interface ProductData {
  productName: string;
  ingredients: string;
  sourceUrl: string;
}

/**
 * Represents the compliance analysis result from Gemini API
 */
export interface AnalysisResult {
  verdict: string;
  englishReason: string;
  japaneseReason: string;
  rawResponse: string;
}

/**
 * Gemini API response structure
 */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Error response from Gemini API
 */
export interface GeminiErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Progress stage types
 */
export type ProgressStage =
  | "idle"
  | "fetching"
  | "parsing"
  | "extracted"
  | "analyzing"
  | "complete"
  | "error";

/**
 * Application state interface
 */
export interface AppState {
  stage: ProgressStage;
  productData: ProductData | null;
  analysisResult: AnalysisResult | null;
  error: string | null;
  isLoading: boolean;
}
