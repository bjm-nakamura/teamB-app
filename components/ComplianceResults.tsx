"use client";

import React from "react";
import { Alert, Card, CardContent, Typography, Box } from "@mui/material";
import { AnalysisResult } from "@/lib/types";

interface ComplianceResultsProps {
  result: AnalysisResult | null;
  show: boolean;
}

/**
 * Helper function to parse markdown to HTML with basic support
 * Converts markdown links, bold text, and line breaks to HTML
 */
function parseMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Convert markdown links [text](url) to HTML <a> tags
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Convert **bold** to <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Convert line breaks to <br> but preserve existing structure
  html = html.replace(/\n/g, "<br>");

  // Convert bullet points (- item) to unordered lists
  html = html.replace(/^-\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\s*)+/g, "<ul>$&</ul>");

  return html;
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
          fontSize: "1.5rem",
          fontWeight: 700,
          justifyContent: "center",
          "& .MuiAlert-message": {
            textAlign: "center",
            width: "100%",
          },
        }}
      >
        {result.verdict}
      </Alert>

      {/* Analysis Details */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Analysis Details
        </Typography>

        {/* English Section */}
        <Card
          sx={{
            bgcolor: "grey.50",
            borderColor: "grey.300",
            borderWidth: 1,
            borderStyle: "solid",
            mb: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                pb: 1,
                borderBottom: "2px solid",
                borderColor: "primary.main",
              }}
            >
              English
            </Typography>
            <Box
              sx={{
                "& p": { mb: 1.5, lineHeight: 1.7 },
                "& ul, & ol": { mb: 1.5, pl: 3 },
                "& li": { mb: 0.5 },
                "& a": {
                  color: "primary.main",
                  textDecoration: "underline",
                  "&:hover": { color: "primary.dark" },
                },
                "& strong": { fontWeight: 700 },
                "& pre": {
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                },
              }}
            >
              <Typography
                component="div"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}
                dangerouslySetInnerHTML={{
                  __html: parseMarkdownToHtml(result.englishReason),
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Japanese Section */}
        <Card
          sx={{
            bgcolor: "grey.50",
            borderColor: "grey.300",
            borderWidth: 1,
            borderStyle: "solid",
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                pb: 1,
                borderBottom: "2px solid",
                borderColor: "primary.main",
              }}
            >
              日本語 (Japanese)
            </Typography>
            <Box
              sx={{
                "& p": { mb: 1.5, lineHeight: 1.7 },
                "& ul, & ol": { mb: 1.5, pl: 3 },
                "& li": { mb: 0.5 },
                "& a": {
                  color: "primary.main",
                  textDecoration: "underline",
                  "&:hover": { color: "primary.dark" },
                },
                "& strong": { fontWeight: 700 },
                "& pre": {
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                },
              }}
            >
              <Typography
                component="div"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                }}
                dangerouslySetInnerHTML={{
                  __html: parseMarkdownToHtml(result.japaneseReason),
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
