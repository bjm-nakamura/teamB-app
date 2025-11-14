"use client";

import React from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";

type AIProvider = "gemini" | "openai";

interface ProductInputProps {
  productUrl: string;
  provider: AIProvider;
  isLoading: boolean;
  onProductUrlChange: (url: string) => void;
  onProviderChange: (provider: AIProvider) => void;
  onAnalyze: () => void;
}

/**
 * ProductInput Component
 * Renders the input form for product URL, AI provider selection, and analyze button
 * Uses MUI components
 */
export default function ProductInput({
  productUrl,
  provider,
  isLoading,
  onProductUrlChange,
  onProviderChange,
  onAnalyze,
}: ProductInputProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Product URL Input */}
      <TextField
        fullWidth
        label="Product URL"
        type="url"
        placeholder="https://www.kokubu.co.jp/brand/..."
        value={productUrl}
        onChange={(e) => onProductUrlChange(e.target.value)}
        disabled={isLoading}
        variant="outlined"
      />

      {/* AI Provider Toggle */}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Select AI Provider:
        </Typography>
        <ToggleButtonGroup
          value={provider}
          exclusive
          onChange={(_, newProvider) => {
            if (newProvider !== null) {
              onProviderChange(newProvider);
            }
          }}
          fullWidth
          disabled={isLoading}
          color="primary"
        >
          <ToggleButton value="gemini">
            <Box sx={{ display: "flex", flexDirection: "column", py: 0.5 }}>
              <Typography variant="button">Google Gemini</Typography>
              <Typography variant="caption" color="text.secondary">
                Google Search
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="openai">
            <Box sx={{ display: "flex", flexDirection: "column", py: 0.5 }}>
              <Typography variant="button">OpenAI GPT-4o</Typography>
              <Typography variant="caption" color="text.secondary">
                Training Data
              </Typography>
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Both providers use API keys from .env file
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <span>{isLoading ? "Extracting..." : "Analyze Product"}</span>
        {isLoading && <CircularProgress size={20} color="inherit" />}
      </Button>
    </Box>
  );
}
