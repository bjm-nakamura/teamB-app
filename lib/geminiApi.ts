import { GeminiResponse, AnalysisResult } from "./types";

/**
 * Analyzes ingredients using Gemini API with bilingual system prompt
 * @param productName - The name of the product being analyzed
 * @param ingredients - The ingredients list to analyze
 * @param apiKey - Google Gemini API key
 * @returns Promise<AnalysisResult> - Parsed analysis result with verdict and bilingual reasons
 * @throws Error if API call fails or response parsing fails
 */
export async function analyzeWithGemini(
  productName: string,
  ingredients: string,
  apiKey: string
): Promise<AnalysisResult> {
  // CRITICAL: Preserve the exact system prompt from the original implementation
  const systemPrompt = `
You are an expert AI assistant specializing in EU food export compliance.
You will receive structured product information (name and ingredients list) and must determine if the product is "Export OK" or "Export NOT OK" for the EU market.

Your workflow:

1.  **Step 2: Check Raw Materials:**
    * For each major raw material (e.g., "peanuts", "tuna", "soy"), perform a Google search to check for known EU import restrictions, quotas, or high-risk alerts (like aflatoxins in peanuts).
    * Check EUR-Lex database information via Google Search.

2.  **Step 3: Check Additives (E-Numbers):**
    * For each chemical-sounding ingredient or additive (e.g., "ソルビトール" (sorbitol), "リン酸塩" (phosphate)), perform a Google search to find its corresponding E-Number.
    * **CRITICAL RULE:** If an additive exists but you *cannot* find an E-Number for it, it is considered "unauthorized".

3.  **Step 4: Synthesize Verdict:**
    * The verdict is "Export NOT OK" if *any* of:
        * A major ingredient has a clear import restriction (e.g., "EU ban on [ingredient]")
        * An additive is found that has *no E-Number*
    * Otherwise, the verdict is "Export OK"

4.  **Format Output:**
    You MUST provide your response in BOTH English and Japanese, in this exact format:

VERDICT: [Export OK | Export NOT OK]

=== ENGLISH ===
REASON:
-   **Product Analyzed:** ${productName}
-   **Ingredients Provided:** [List the ingredients]
-   **Step 2 (Raw Materials Check):** [Bulleted findings with Google Search results]
-   **Step 3 (Additives Check):** [Bulleted findings. Example: "- Sorbitol: E420 (OK). - [Additive]: No E-Number found (NOT OK)."]
-   **Step 4 (Importer Check):** This is a mandatory manual step. Final decision must be confirmed with your import partner.

=== JAPANESE (日本語) ===
理由:
-   **分析対象商品:** ${productName}
-   **提供された原材料:** [原材料のリスト]
-   **ステップ2 (原料チェック):** [Googleサーチ結果による調査結果を箇条書き]
-   **ステップ3 (添加物チェック):** [調査結果を箇条書き。例: "- ソルビトール: E420 (OK). - [添加物名]: E番号が見つかりません (NOT OK)."]
-   **ステップ4 (輸入業者確認):** これは必須の手動ステップです。最終決定は輸入パートナーと確認する必要があります。
`;

  const userQuery = `
Product Name: ${productName}
Ingredients (原材料): ${ingredients}

Please analyze these ingredients for EU export compliance following the workflow above.
Provide the analysis in BOTH English and Japanese as specified in the format.
`;

  const geminiResponse = await callGeminiApi(userQuery, systemPrompt, apiKey);
  return parseGeminiResponse(geminiResponse);
}

/**
 * Calls Gemini API with retry logic and exponential backoff
 * @param userQuery - The user's query
 * @param systemPrompt - The system instruction prompt
 * @param apiKey - Google Gemini API key
 * @returns Promise<GeminiResponse> - The API response
 * @throws Error if all retries fail
 */
async function callGeminiApi(
  userQuery: string,
  systemPrompt: string,
  apiKey: string
): Promise<GeminiResponse> {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: userQuery }],
      },
    ],
    // Enable Google Search grounding
    tools: [
      {
        google_search: {},
      },
    ],
    // Provide the detailed system instructions
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
  };

  const retries = 3;
  let delay = 1000; // 1 second initial delay

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return (await response.json()) as GeminiResponse;
      }

      // Retry on rate limit (429) or server errors (5xx)
      if (response.status === 429 || response.status >= 500) {
        console.warn(
          `Attempt ${i + 1} failed with status ${response.status}. Retrying in ${delay / 1000}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        const errorData = await response.json();
        throw new Error(
          `API Error: ${errorData.error?.message || response.statusText}`
        );
      }
    } catch (err) {
      if (i === retries - 1) {
        // Last retry failed
        throw err;
      }
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error("Failed to get response from Gemini API after retries");
}

/**
 * Parses the Gemini API response to extract verdict and bilingual reasons
 * @param response - The Gemini API response
 * @returns AnalysisResult - Parsed analysis result
 * @throws Error if response format is unexpected
 */
function parseGeminiResponse(response: GeminiResponse): AnalysisResult {
  const responseText = response.candidates[0]?.content.parts[0]?.text;

  if (!responseText) {
    throw new Error("No text content in Gemini API response");
  }

  // Parse the formatted response
  const verdictMatch = responseText.match(/^VERDICT: (.*)$/m);
  const reasonMatch = responseText.match(/REASON:([\s\S]*)/);

  if (!verdictMatch || !reasonMatch) {
    throw new Error(
      `AI response was not in the expected format. Raw response:\n\n${responseText}`
    );
  }

  const verdict = verdictMatch[1].trim();
  const fullReason = reasonMatch[1].trim();

  // Split into English and Japanese sections
  const englishMatch = fullReason.match(/=== ENGLISH ===([\s\S]*?)(?:===|$)/);
  const japaneseMatch = fullReason.match(/=== JAPANESE.*?===([\s\S]*?)$/);

  const englishReason = englishMatch
    ? englishMatch[1].trim()
    : "No English reason provided";
  const japaneseReason = japaneseMatch
    ? japaneseMatch[1].trim()
    : "No Japanese reason provided";

  return {
    verdict,
    englishReason,
    japaneseReason,
    rawResponse: responseText,
  };
}