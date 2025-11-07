"use client";

import React from "react";
import { Alert } from "@mui/material";

interface ProgressIndicatorProps {
  message: string;
  show: boolean;
}

/**
 * ProgressIndicator Component
 * Displays progress messages during different stages of analysis using MUI Alert
 */
export default function ProgressIndicator({
  message,
  show,
}: ProgressIndicatorProps) {
  if (!show) return null;

  return (
    <Alert severity="info" sx={{ mt: 3 }}>
      {message}
    </Alert>
  );
}
