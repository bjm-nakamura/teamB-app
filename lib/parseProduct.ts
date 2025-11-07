import { ProductData } from "./types";

/**
 * Parses Kokubu product page HTML to extract name and ingredients
 * This parsing logic is specifically tuned for Kokubu product pages
 * @param html - The HTML content of the product page
 * @param url - The source URL of the product page
 * @returns ProductData object containing product name, ingredients, and source URL
 * @throws Error if ingredients cannot be found
 */
export function parseKokubuProduct(html: string, url: string): ProductData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Extract product name
  let productName = "Unknown Product";

  // Try multiple selectors for product name
  const nameSelectors = [
    "h1",
    ".product-name",
    '[class*="product"][class*="name"]',
    "title",
  ];

  for (const selector of nameSelectors) {
    const elem = doc.querySelector(selector);
    if (elem && elem.textContent?.trim()) {
      productName = elem.textContent.trim();
      break;
    }
  }

  // Extract ingredients (原材料)
  let ingredients = "";

  // Search for text containing "原材料" or "Ingredients"
  const allText = doc.body.textContent || "";
  const patterns = [
    /原材料[名：:]\s*([^\n]+(?:\n(?!\s*$)[^\n]+)*)/i,
    /原材料\s*[：:]\s*([^<\n]+)/i,
    /ingredients[：:]\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      ingredients = match[1].trim();
      break;
    }
  }

  // Fallback: look for table rows or divs containing ingredient info
  if (!ingredients) {
    const tables = doc.querySelectorAll(
      'table tr, .spec-table tr, [class*="ingredient"]'
    );
    for (const row of tables) {
      const text = row.textContent || "";
      if (text.includes("原材料") || text.includes("Ingredients")) {
        // Extract the content after the label
        const parts = text.split(/原材料[名：:]|Ingredients[:：]/i);
        if (parts[1]) {
          ingredients = parts[1].trim();
          break;
        }
      }
    }
  }

  if (!ingredients) {
    throw new Error(
      "Could not find ingredients (原材料) on the product page. Please check the URL or enter ingredients manually."
    );
  }

  return {
    productName,
    ingredients,
    sourceUrl: url,
  };
}