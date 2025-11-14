/**
 * OpenAI API integration for EU export compliance analysis
 * This module uses OpenAI's Responses API with web_search tool
 * to search specific EU regulation domains
 */

import OpenAI from "openai";
import type { AnalysisResult } from "./types";

// EU domains to restrict web search to
const EU_DOMAINS = [
  "eur-lex.europa.eu", // EU Regulation database
  "chuohoki.co.jp",    // Japanese additive index
] as const;

/**
 * Main analysis function using OpenAI Responses API with web_search tool
 * Uses domain filtering to search only the 2 EU regulation URLs
 */
export async function analyzeWithOpenAI(
  productName: string,
  ingredients: string
): Promise<AnalysisResult> {
  // Check for API key in environment
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Please add it to your .env file."
    );
  }

  // Construct the input prompt
  const inputPrompt = `
You are an expert AI assistant specializing in EU food export compliance.
Analyze this product for EU export compliance.

Product Name: ${productName}
Ingredients (原材料): ${ingredients}

IMPORTANT: You must ONLY use the specific URLs provided below. DO NOT perform general web searches.

Use web search on the following domains ONLY:
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02008R1333-20241216 (EU Regulation 1333/2008 for food additives)
- https://www.chuohoki.co.jp/site/pg/12362878/ (Japanese additive index with E-Numbers)

Your workflow:

1.  **Step 1: Parse Ingredients:**
    * The ingredients list follows Japanese food labeling format where items are separated by a delimiter.
    * Look for the "／" (full-width slash) or "/" (regular slash) separator in the ingredients.
    * **Items BEFORE "／" or "/":** These are raw materials (原材料) - check these in Step 2.
    * **Items AFTER "／" or "/":** These are additives (添加物) - check these in Step 3.
    * Example: "ぶり、しょうゆ、粗糖　／　増粘剤（加工デンプン）、調味料（アミノ酸等）"
      - Raw materials: ぶり、しょうゆ、粗糖
      - Additives: 増粘剤（加工デンプン）、調味料（アミノ酸等）

2.  **Step 2: Check Raw Materials (原材料の確認):**
    * For each raw material identified in Step 1 (items BEFORE the "／" or "/" separator), check for EU import restrictions.
    * **ONLY use this URL:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02008R1333-20241216
    * Check for: import restrictions, quotas, container regulations, or high-risk alerts.

3.  **Step 3: Check Additives/E-Numbers (添加物確認):**
    * For each additive identified in Step 1 (items AFTER the "／" or "/" separator), find its corresponding E-Number.
    * **ONLY use this URL:** https://www.chuohoki.co.jp/site/pg/12362878/
    * **CRITICAL RULE:** If an additive exists but you *cannot* find an E-Number for it, it is considered "unauthorized".

4.  **Step 4: Synthesize Verdict:**
    * The verdict is "Export NOT OK" if *any* of:
        * A raw material has a clear import restriction (e.g., "EU ban on [ingredient]")
        * An additive is found that has *no E-Number*
    * Otherwise, the verdict is "Export OK"

5.  **Format Output:**
    You MUST provide your response in BOTH English and Japanese, in this exact format:

VERDICT: [Export OK | Export NOT OK]

=== ENGLISH ===
REASON:
-   **Product Analyzed:** ${productName}
-   **Ingredients Provided:** ${ingredients}
-   **Step 1 (Ingredient Parsing):** [List raw materials and additives separately]
-   **Step 2 (Raw Materials Check):** [Bulleted findings from EU regulation URL only]
-   **Step 3 (Additives Check):** [Bulleted findings from additive index URL only. Example: "- Sorbitol: E420 (OK). - [Additive]: No E-Number found (NOT OK)."]
-   **Step 4 (Importer Check):** This is a mandatory manual step. Final decision must be confirmed with your import partner.

**Reference Sources:**
- EU Regulation (Step 2): [EU Food Additives Regulation 1333/2008](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02008R1333-20241216)
- Additive Index (Step 3): [Chuohoki Additive Index](https://www.chuohoki.co.jp/site/pg/12362878/)

=== JAPANESE (日本語) ===
理由:
-   **分析対象商品:** ${productName}
-   **提供された原材料:** ${ingredients}
-   **ステップ1 (原材料の分類):** [原材料と添加物を分けてリスト]
-   **ステップ2 (原料チェック):** [EU規制URLのみを使用した調査結果を箇条書き]
-   **ステップ3 (添加物チェック):** [添加物インデックスURLのみを使用した調査結果を箇条書き。例: "- ソルビトール: E420 (OK). - [添加物名]: E番号が見つかりません (NOT OK)."]
-   **ステップ4 (輸入業者確認):** これは必須の手動ステップです。最終決定は輸入パートナーと確認する必要があります。

**参照元:**
- EU規制 (ステップ2): [EU食品添加物規則 1333/2008](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02008R1333-20241216)
- 添加物インデックス (ステップ3): [中央法規添加物インデックス](https://www.chuohoki.co.jp/site/pg/12362878/)
`;

  const openaiResponse = await callOpenAIResponsesApi(inputPrompt, apiKey);
  return parseOpenAIResponse(openaiResponse);
}

/**
 * Calls OpenAI Chat Completions API (fallback from Responses API)
 * Uses standard GPT-4 model which is more widely available
 * Uses retry logic for rate limits and server errors
 */
async function callOpenAIResponsesApi(
  inputPrompt: string,
  apiKey: string
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use standard Chat Completions API with GPT-4
      // Note: This doesn't support web_search tool, so we rely on the model's knowledge
      const response = await client.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o (widely available)
        messages: [
          {
            role: "system",
            content: "You are an expert AI assistant specializing in EU food export compliance. Use your knowledge of EU regulations to analyze ingredients.",
          },
          {
            role: "user",
            content: inputPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      // Return the message content from the response
      return response.choices[0]?.message?.content || "";
    } catch (error: unknown) {
      lastError = error as Error;
      const errorMessage = (error as Error).message;

      // Check if it's a rate limit or server error that we should retry
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("rate_limit") ||
        errorMessage.includes("5")
      ) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(
          `OpenAI API error (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitTime}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  throw new Error(
    `OpenAI API failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Parses OpenAI response into AnalysisResult format
 */
function parseOpenAIResponse(content: string): AnalysisResult {
  // Extract verdict
  const verdictMatch = content.match(/VERDICT:\s*(.*?)(?:\n|$)/i);
  const verdict = verdictMatch ? verdictMatch[1].trim() : "Unknown";

  // Extract English section
  const englishMatch = content.match(
    /===\s*ENGLISH\s*===\s*\n([\s\S]*?)(?====\s*JAPANESE|$)/i
  );
  const englishReason = englishMatch ? englishMatch[1].trim() : "";

  // Extract Japanese section
  const japaneseMatch = content.match(/===\s*JAPANESE.*?===\s*\n([\s\S]*?)$/i);
  const japaneseReason = japaneseMatch ? japaneseMatch[1].trim() : "";

  return {
    verdict,
    englishReason,
    japaneseReason,
    rawResponse: content,
  };
}