// src/theme.ts

import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
  },
  components: {
    // Estilos para el Botón (Correcto)
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '14px 48px',
          fontSize: '1.1rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.6)',
            backgroundColor: '#1976d2',
          },
        },
      },
    },
    // Estilos para el Contenedor (Correcto)
    MuiContainer: {
        styleOverrides: {
            root: {
                paddingLeft: '24px !important', 
                paddingRight: '24px !important',
                '@media (min-width:600px)': {
                    paddingLeft: '32px !important',
                    paddingRight: '32px !important',
                }
            }
        }
    }
  }
});