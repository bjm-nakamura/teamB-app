"use client";

import React from "react";
import { Alert, Card, CardContent, Typography, Box } from "@mui/material";
import { AnalysisResult } from "@/lib/types";

interface ComplianceResultsProps {
  result: AnalysisResult | null;
  show: boolean;
}

/**
 * ComplianceResults Component
 * Displays the compliance analysis verdict and bilingual detailed explanation
 * Uses MUI Alert, Card, Typography components
 */
export default function ComplianceResults({
  result,
  show,
}: ComplianceResultsProps) {
  if (!show || !result) return null;

  const isExportNotOk = result.verdict.includes("NOT OK");

  return (
    <Box sx={{ mt: 4 }}>
      {/* Verdict Banner */}
      <Alert
        severity={isExportNotOk ? "error" : "success"}
        sx={{
          fontSize: '1.5rem',
          fontWeight: 700,
          justifyContent: 'center',
          '& .MuiAlert-message': {
            textAlign: 'center',
            width: '100%',
          },
        }}
      >
        {result.verdict}
      </Alert>

      {/* Analysis Details */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Analysis Details (English / 日本語)
        </Typography>
        <Card
          sx={{
            bgcolor: 'grey.50',
            borderColor: 'grey.300',
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        >
          <CardContent>
            {/* Using pre to respect whitespace and newlines from the AI response */}
            <Typography
              component="pre"
              sx={{
                color: 'text.primary',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {`=== ENGLISH ===
${result.englishReason}

=== JAPANESE (日本語) ===
${result.japaneseReason}`}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
