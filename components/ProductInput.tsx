"use client";

import React from "react";
import { TextField, Button, CircularProgress, Box, Typography } from "@mui/material";

interface ProductInputProps {
  productUrl: string;
  apiKey: string;
  isLoading: boolean;
  onProductUrlChange: (url: string) => void;
  onApiKeyChange: (key: string) => void;
  onAnalyze: () => void;
}

/**
 * ProductInput Component
 * Renders the input form for product URL and API key with analyze button
 * Uses MUI TextField and Button components
 */
export default function ProductInput({
  productUrl,
  apiKey,
  isLoading,
  onProductUrlChange,
  onApiKeyChange,
  onAnalyze,
}: ProductInputProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Product URL Input */}
      <TextField
        fullWidth
        label="Product URL"
        type="url"
        placeholder="https://www.example.com/product..."
        value={productUrl}
        onChange={(e) => onProductUrlChange(e.target.value)}
        disabled={isLoading}
        variant="outlined"
      />

      {/* API Key Input */}
      <Box>
        <TextField
          fullWidth
          label="Google Gemini API Key"
          type="password"
          placeholder="Enter your API key here"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          disabled={isLoading}
          variant="outlined"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Get a free key from Google AI Studio.
        </Typography>
      </Box>

      {/* Analyze Button */}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={onAnalyze}
        disabled={isLoading}
        sx={{
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <span>{isLoading ? "Extracting..." : "Analyze Product"}</span>
        {isLoading && <CircularProgress size={20} color="inherit" />}
      </Button>
    </Box>
  );
}
