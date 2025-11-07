'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Custom MUI theme configuration
 * Provides consistent styling across the application with support for Japanese text
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // blue-600 from Tailwind
      dark: '#1d4ed8', // blue-700 for hover states
      light: '#3b82f6', // blue-500
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a', // green-600
      dark: '#15803d', // green-700
      light: '#22c55e', // green-500
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626', // red-600
      dark: '#b91c1c', // red-700
      light: '#ef4444', // red-500
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6', // blue-500
      light: '#dbeafe', // blue-50
      dark: '#1e40af', // blue-800
    },
    background: {
      default: '#f3f4f6', // gray-100 background
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // gray-900
      secondary: '#6b7280', // gray-500
    },
  },
  typography: {
    fontFamily: [
      'Arial',
      'Helvetica',
      'sans-serif',
      // Japanese fonts
      'Hiragino Sans',
      'Hiragino Kaku Gothic ProN',
      'Yu Gothic',
      'Meiryo',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '1.875rem', // 3xl
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#111827',
    },
    h3: {
      fontSize: '1.25rem', // xl
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1f2937', // gray-800
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem', // text-sm
      lineHeight: 1.5,
    },
  },
  spacing: 8, // Base spacing unit (8px)
  shape: {
    borderRadius: 12, // rounded-lg equivalent
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Disable uppercase transformation
          fontWeight: 700,
          padding: '12px 24px',
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16, // rounded-xl for main card
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
