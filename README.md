# EU Export Compliance AI (Demo)

A Next.js application that analyzes product ingredients against EU regulations using Google's Gemini AI with Google Search grounding.

## Overview

This application helps check whether food products comply with EU export regulations by:

1. Fetching product information from Kokubu product pages
2. Extracting product name and ingredients (原材料)
3. Analyzing ingredients using Gemini AI with Google Search
4. Providing bilingual (English/Japanese) compliance analysis

## Features

- **Two-Stage Workflow**: Extract ingredients first, then analyze after user review
- **CORS Proxy Fallback**: Automatic fallback to proxy if direct fetch fails
- **Editable Ingredients**: Users can review and edit extracted ingredients before analysis
- **Bilingual Output**: Results in both English and Japanese
- **Google Search Grounding**: Gemini uses real-time Google Search for accurate compliance checking
- **Retry Logic**: Exponential backoff for API failures

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Google Gemini 2.5 Flash** (with Google Search grounding)

## Project Structure

```
kokubu-nextjs/
├── app/
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Global styles and animations
├── components/
│   ├── ProductInput.tsx      # URL and API key input form
│   ├── ProgressIndicator.tsx # Progress messages during analysis
│   ├── IngredientsReview.tsx # Review/edit extracted ingredients
│   ├── ComplianceResults.tsx # Display verdict and bilingual results
│   └── ErrorDisplay.tsx      # Error message display
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── fetchProduct.ts       # Product page fetching with CORS fallback
│   ├── parseProduct.ts       # HTML parsing for Kokubu pages
│   └── geminiApi.ts          # Gemini API integration with retry logic
└── public/                   # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone or navigate to the project directory:

```bash
cd kokubu-nextjs
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. Enter a Kokubu product URL (e.g., `https://www.kokubu.co.jp/brand/100/0317811.html`)
2. Enter your Google Gemini API key
3. Click "Analyze Product"
4. Review the extracted product name and ingredients
5. Edit ingredients if needed
6. Click "Confirm & Analyze Compliance"
7. View the bilingual compliance analysis results

## Key Implementation Details

### HTML Parsing

The `parseKokubuProduct` function in `lib/parseProduct.ts` is specifically tuned for Kokubu product pages. It uses multiple selectors and regex patterns to extract product names and ingredients reliably.

### Gemini System Prompt

The system prompt in `lib/geminiApi.ts` is preserved exactly from the original implementation and instructs Gemini to:

- Check raw materials against EU import restrictions
- Verify additives have valid E-Numbers
- Use Google Search for real-time compliance data
- Provide bilingual output in a specific format

### CORS Handling

The `fetchProductPage` function attempts direct fetch first, then falls back to `https://api.allorigins.win/raw?url=...` if CORS blocks the request.

### Error Handling

- Input validation before API calls
- Try-catch blocks for all async operations
- Retry logic with exponential backoff (3 retries, 1s initial delay)
- User-friendly error messages

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Important Notes

- **API Key Security**: The API key is entered at runtime and not stored. In production, consider using environment variables and server-side API calls.
- **Client-Side Only**: This is a fully client-side application with no backend required.
- **Kokubu-Specific Parsing**: The HTML parsing is optimized for Kokubu product pages and may need adjustment for other sites.

## Migrated from HTML

This Next.js application is a migration from a single HTML file implementation. Key improvements:

- Modular component architecture
- Type-safe TypeScript codebase
- Better state management with React hooks
- Cleaner separation of concerns (UI, logic, API)
- Improved maintainability and testability

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Gemini API](https://ai.google.dev/)
