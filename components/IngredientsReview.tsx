"use client";

import React from "react";
import { Card, CardContent, Typography, TextField, Button, Box } from "@mui/material";

interface IngredientsReviewProps {
  productName: string;
  ingredients: string;
  show: boolean;
  onIngredientsChange: (ingredients: string) => void;
  onConfirm: () => void;
}

/**
 * IngredientsReview Component
 * Displays extracted product information for user review and editing
 * before sending to Gemini API for compliance analysis
 * Uses MUI Card, Typography, TextField, and Button components
 */
export default function IngredientsReview({
  productName,
  ingredients,
  show,
  onIngredientsChange,
  onConfirm,
}: IngredientsReviewProps) {
  if (!show) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Step 1: Extracted Product Information
      </Typography>

      <Card
        sx={{
          mb: 2,
          bgcolor: 'info.light',
          borderColor: 'info.main',
          borderWidth: 1,
          borderStyle: 'solid',
        }}
      >
        <CardContent>
          {/* Product Name Display */}
          <Typography variant="body2" color="info.dark" sx={{ mb: 1 }}>
            <strong>Product Name:</strong>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              fontWeight: 500,
              color: 'info.dark',
            }}
          >
            {productName}
          </Typography>

          {/* Ingredients Textarea */}
          <Typography variant="body2" color="info.dark" sx={{ mb: 1 }}>
            <strong>Ingredients (原材料):</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={ingredients}
            onChange={(e) => onIngredientsChange(e.target.value)}
            placeholder="Loading ingredients..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                bgcolor: 'background.paper',
              },
            }}
          />
          <Typography variant="caption" color="info.dark" sx={{ mt: 0.5, display: 'block' }}>
            You can edit the ingredients above if needed before analysis.
          </Typography>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <Button
        fullWidth
        variant="contained"
        color="success"
        onClick={onConfirm}
        sx={{ py: 1.5 }}
      >
        ✓ Confirm & Analyze Compliance
      </Button>
    </Box>
  );
}
