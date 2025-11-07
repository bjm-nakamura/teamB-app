/**
 * List of CORS proxy services to try in order
 */
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Fetches product page HTML with fallback to multiple CORS proxies
 * @param url - The product page URL to fetch
 * @returns Promise<string> - The HTML content of the product page
 * @throws Error if all fetch attempts fail
 */
export async function fetchProductPage(url: string): Promise<string> {
  // Try direct fetch first
  try {
    console.log("Attempting direct fetch...");
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    if (response.ok) {
      console.log("Direct fetch successful");
      return await response.text();
    }
    console.warn(`Direct fetch failed with status: ${response.status}`);
  } catch (err) {
    console.warn(
      "Direct fetch failed (likely CORS), trying proxies:",
      err instanceof Error ? err.message : String(err)
    );
  }

  // Try each CORS proxy in sequence
  const errors: string[] = [];
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i](url);
      console.log(`Attempting CORS proxy ${i + 1}/${CORS_PROXIES.length}...`);

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 0) {
          console.log(`CORS proxy ${i + 1} fetch successful`);
          return text;
        }
        throw new Error('Empty response from proxy');
      }

      errors.push(`Proxy ${i + 1} returned status ${response.status}`);
      console.warn(errors[errors.length - 1]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Proxy ${i + 1}: ${errorMsg}`);
      console.warn(errors[errors.length - 1]);
    }
  }

  // All attempts failed
  throw new Error(
    `Failed to fetch product page after trying all methods.\n\nErrors:\n${errors.join('\n')}\n\nThe product URL may be invalid, blocked, or the proxy services may be unavailable. Please try again later.`
  );
}
