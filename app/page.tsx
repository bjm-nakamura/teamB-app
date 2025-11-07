"use client";

import React, { useState } from "react";
import { Container, Box, Paper, Typography } from "@mui/material";
import ProductInput from "@/components/ProductInput";
import ProgressIndicator from "@/components/ProgressIndicator";
import IngredientsReview from "@/components/IngredientsReview";
import ComplianceResults from "@/components/ComplianceResults";
import ErrorDisplay from "@/components/ErrorDisplay";
import { fetchProductPage } from "@/lib/fetchProduct";
import { parseKokubuProduct } from "@/lib/parseProduct";
import { analyzeWithGemini } from "@/lib/geminiApi";
import { ProductData, AnalysisResult } from "@/lib/types";

export default function Home() {
  // Form inputs
  const [productUrl, setProductUrl] = useState(
    "https://www.kokubu.co.jp/brand/100/0317811.html"
  );
  const [apiKey, setApiKey] = useState("");

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [showProgress, setShowProgress] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  /**
   * Hide all sections
   */
  const hideAllSections = () => {
    setShowProgress(false);
    setShowReview(false);
    setShowResults(false);
    setShowError(false);
  };

  /**
   * Show error message
   */
  const displayError = (message: string) => {
    setError(message);
    setShowError(true);
    hideAllSections();
  };

  /**
   * Step 1: Fetch and extract product information
   */
  const handleAnalyze = async () => {
    // Validation
    if (!productUrl || !apiKey) {
      displayError("Please enter both a product URL and your API key.");
      return;
    }

    // Reset state
    setIsLoading(true);
    hideAllSections();
    setProductData(null);
    setAnalysisResult(null);

    try {
      // Phase 1: Fetch product page
      setProgressMessage("📥 Fetching product page...");
      setShowProgress(true);
      const html = await fetchProductPage(productUrl);

      // Phase 2: Parse product information
      setProgressMessage("🔍 Extracting product information and ingredients...");
      const extractedData = parseKokubuProduct(html, productUrl);
      setProductData(extractedData);

      // Phase 3: Display for review
      setProgressMessage(
        "✓ Extraction complete! Please review the information below."
      );

      // Show review section after a brief delay
      setTimeout(() => {
        setShowProgress(false);
        setShowReview(true);
      }, 1000);
    } catch (err) {
      console.error(err);
      displayError(
        `Failed to extract product information: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 2: Confirm and analyze compliance with Gemini
   */
  const handleConfirmAnalysis = async () => {
    if (!apiKey) {
      displayError("API key is required.");
      return;
    }

    if (!productData) {
      displayError("No product data available. Please analyze a product first.");
      return;
    }

    if (!productData.ingredients.trim()) {
      displayError("Ingredients list cannot be empty.");
      return;
    }

    // Show loading state
    setIsLoading(true);
    hideAllSections();

    try {
      // Phase 4: Analyze with Gemini
      setProgressMessage("🤖 Analyzing ingredients against EU regulations...");
      setShowProgress(true);

      const result = await analyzeWithGemini(
        productData.productName,
        productData.ingredients,
        apiKey
      );

      setAnalysisResult(result);
      setShowProgress(false);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      displayError(
        `Analysis error: ${
          err instanceof Error ? err.message : String(err)
        }. Check the console for details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update ingredients in product data
   */
  const handleIngredientsChange = (ingredients: string) => {
    if (productData) {
      setProductData({ ...productData, ingredients });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Typography variant="h1" sx={{ mb: 1 }}>
            EU Export Compliance AI (Demo)
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter a product URL to check its ingredients against EU regulations.
          </Typography>

          {/* Input Section */}
          <ProductInput
            productUrl={productUrl}
            apiKey={apiKey}
            isLoading={isLoading}
            onProductUrlChange={setProductUrl}
            onApiKeyChange={setApiKey}
            onAnalyze={handleAnalyze}
          />

          {/* Progress Indicator */}
          <ProgressIndicator message={progressMessage} show={showProgress} />

          {/* Ingredients Review Section */}
          <IngredientsReview
            productName={productData?.productName || ""}
            ingredients={productData?.ingredients || ""}
            show={showReview}
            onIngredientsChange={handleIngredientsChange}
            onConfirm={handleConfirmAnalysis}
          />

          {/* Results Section */}
          <ComplianceResults result={analysisResult} show={showResults} />

          {/* Error Display */}
          <ErrorDisplay error={error} show={showError} />
        </Paper>
      </Container>
    </Box>
  );
}
