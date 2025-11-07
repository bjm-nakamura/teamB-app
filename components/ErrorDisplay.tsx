"use client";

import React from "react";
import { Alert } from "@mui/material";

interface ErrorDisplayProps {
  error: string | null;
  show: boolean;
}

/**
 * ErrorDisplay Component
 * Displays error messages using MUI Alert component
 */
export default function ErrorDisplay({ error, show }: ErrorDisplayProps) {
  if (!show || !error) return null;

  return (
    <Alert severity="error" sx={{ mt: 3 }}>
      {error}
    </Alert>
  );
}
