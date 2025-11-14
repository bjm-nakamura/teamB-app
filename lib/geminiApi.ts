import { GeminiResponse, AnalysisResult } from "./types";

/**
 * Analyzes ingredients using Gemini API with bilingual system prompt
 * @param productName - The name of the product being analyzed
 * @param ingredients - The ingredients list to analyze
 * @param apiKey - Optional API key (uses GEMINI_API_KEY env var if not provided)
 * @returns Promise<AnalysisResult> - Parsed analysis result with verdict and bilingual reasons
 * @throws Error if API call fails or response parsing fails
 */
export async function analyzeWithGemini(
  productName: string,
  ingredients: string,
  apiKey?: string
): Promise<AnalysisResult> {
  // Use provided API key or environment variable
  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!effectiveApiKey) {
    throw new Error(
      "GEMINI_API_KEY is required. Either provide it as a parameter or set it in the .env file."
    );
  }

  // CRITICAL: Preserve the exact system prompt from the original implementation
  const systemPrompt = `
You are an expert AI assistant specializing in EU food export compliance.
You will receive structured product information (name and ingredients list) and must determine if the product is "Export OK" or "Export NOT OK" for the EU market.

IMPORTANT: You must ONLY use the specific URLs provided below. DO NOT perform general Google searches or search the entire web.

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
    * DO NOT use general Google search for this step.

3.  **Step 3: Check Additives/E-Numbers (添加物確認):**
    
    **Step 3A: Find E-Number**
    * For each additive identified in Step 1 (items AFTER the "／" or "/" separator), find its corresponding E-Number.
    * **ONLY use this URL:** https://www.chuohoki.co.jp/site/pg/12362878/
    * If an additive exists but you *cannot* find an E-Number for it, mark it as "No E-Number Found" and proceed to Step 4 (this will result in "Export NOT OK").
    
    **Step 3B: Verify EU Approval Status**
    * **CRITICAL:** Even if an E-Number is found, you MUST verify if it is approved for use in the EU.
    * **ONLY use these URLs:**
      - https://ec.europa.eu/food/food-feed-portal/screen/food-additives/search
      - https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02008R1333-20241216
    * Search for the E-Number and confirm its approval status in the EU.
    * **CRITICAL RULES:**
      - E-Number found + EU approved = OK
      - E-Number found + NOT EU approved = NOT OK
      - E-Number not found = NOT OK
    * DO NOT use general Google search for this step.

4.  **Step 4: Synthesize Verdict:**
    * The verdict is "Export NOT OK" if *any* of the following:
        * A raw material has a clear import restriction (e.g., "EU ban on [ingredient]")
        * An additive has *no E-Number*
        * An additive has an E-Number but is *NOT approved in the EU*
    * The verdict is "Export OK" only if:
        * All raw materials have no import restrictions
        * All additives have E-Numbers AND all are approved in the EU

5.  **Format Output:**
    You MUST provide your response in BOTH English and Japanese, in this exact format:

---

VERDICT: [Export OK | Export NOT OK]

=== ENGLISH ===
REASON:
-   **Product Analyzed:** ${productName}
-   **Ingredients Provided:** [List the ingredients]
-   **Step 1 (Ingredient Parsing):**
    - Raw Materials: [list]
    - Additives: [list]
-   **Step 2 (Raw Materials Check):** [Bulleted findings from EU regulation URL only]
-   **Step 3 (Additives Check):**
    - **Step 3A (E-Number Identification):** [For each additive, state the E-Number found or "No E-Number Found"]
    - **Step 3B (EU Approval Verification):** [For each E-Number found, confirm EU approval status. Example: "E420 (Sorbitol): Approved in EU (OK)" or "E127: NOT approved in EU (NOT OK)" or "Unknown additive: No E-Number found (NOT OK)"]
-   **Step 4 (Final Assessment):** [Summary of why the product is OK or NOT OK]
-   **Step 5 (Importer Confirmation):** This is a mandatory manual step. Final decision must be confirmed with your EU import partner.

**Reference Sources:**
- EU Food Additives Regulation: [Regulation 1333/2008](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02008R1333-20241216)
- EU Food Additives Database: [EC Food Additives Portal](https://ec.europa.eu/food/food-feed-portal/screen/food-additives/search)
- Additive E-Number Index: [Chuohoki Additive Index](https://www.chuohoki.co.jp/site/pg/12362878/)

=== JAPANESE (日本語) ===
理由:
-   **分析対象商品:** ${productName}
-   **提供された原材料:** [原材料のリスト]
-   **ステップ1 (原材料の分類):**
    - 原材料: [リスト]
    - 添加物: [リスト]
-   **ステップ2 (原料チェック):** [EU規制URLのみを使用した調査結果を箇条書き]
-   **ステップ3 (添加物チェック):**
    - **ステップ3A (E番号の特定):** [各添加物について、見つかったE番号または「E番号が見つかりません」と記載]
    - **ステップ3B (EU承認状況の確認):** [見つかった各E番号について、EU承認状況を確認。例: "E420 (ソルビトール): EUで承認済み (OK)" または "E127: EUで未承認 (NOT OK)" または "不明な添加物: E番号が見つかりません (NOT OK)"]
-   **ステップ4 (最終評価):** [製品がOKまたはNOT OKである理由のまとめ]
-   **ステップ5 (輸入業者確認):** これは必須の手動ステップです。最終決定はEU輸入パートナーと確認する必要があります。

**参照元:**
- EU食品添加物規則: [規則 1333/2008](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02008R1333-20241216)
- EU食品添加物データベース: [EC食品添加物ポータル](https://ec.europa.eu/food/food-feed-portal/screen/food-additives/search)
- 添加物E番号インデックス: [中央法規添加物インデックス](https://www.chuohoki.co.jp/site/pg/12362878/)
`;

  const userQuery = `
Product Name: ${productName}
Ingredients (原材料): ${ingredients}

Please analyze these ingredients for EU export compliance following the workflow above.
Provide the analysis in BOTH English and Japanese as specified in the format.
IMPORTANT: Include the Reference Sources section with clickable markdown links at the end of each language section.
`;

  const geminiResponse = await callGeminiApi(userQuery, systemPrompt, effectiveApiKey);
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
  const verdictMatch = responseText.match(/^VERDICT:\s*(.*)$/m);

  if (!verdictMatch) {
    throw new Error(
      `AI response was not in the expected format. Raw response:\n\n${responseText}`
    );
  }

  const verdict = verdictMatch[1].trim();

  // Split into English and Japanese sections
  // New format: VERDICT, then === ENGLISH ===, then === JAPANESE ===
  const englishMatch = responseText.match(/=== ENGLISH ===\s*([\s\S]*?)(?=\s*=== JAPANESE|$)/);
  const japaneseMatch = responseText.match(/=== JAPANESE.*?===\s*([\s\S]*?)$/);

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