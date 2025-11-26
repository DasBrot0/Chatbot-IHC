import { createTheme, alpha } from '@mui/material';

// Color base para Login/Registro (Azul Moderno)
const primaryColor = '#3b82f6'; 

export const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryColor,
      contrastText: '#ffffff',
    },
    background: {
      // Usamos tonos azulados muy oscuros (Slate) para la base
      default: '#020617', // Slate 950 (Casi negro azulado)
      paper: '#0f172a',   // Slate 900
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8', // Slate 400
    },
    divider: alpha(primaryColor, 0.15),
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    button: { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' }, // Títulos (Login)
  },
  shape: {
    borderRadius: 16, // Bordes modernos
  },
  components: {
    // 1. FONDO GLOBAL INMERSIVO
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#020617',
          // Un degradado sutil azulado de fondo
          backgroundImage: `
            radial-gradient(circle at 50% 0%, ${alpha(primaryColor, 0.15)} 0%, transparent 50%),
            linear-gradient(${alpha('#000', 0.8)}, ${alpha('#000', 0.8)})
          `,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    // 2. TARJETAS (El cuadro de Login)
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f172a',
          backgroundImage: 'none',
          // Borde brillante sutil
          border: `1px solid ${alpha(primaryColor, 0.2)}`,
          // Sombra profunda azulada
          boxShadow: `0 25px 50px -12px ${alpha('#000', 0.5)}`, 
        },
      },
    },
    // 3. BOTONES
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingBlock: '10px',
        },
        contained: {
          backgroundColor: primaryColor,
          boxShadow: `0 4px 14px ${alpha(primaryColor, 0.4)}`, // Resplandor azul
          '&:hover': {
            backgroundColor: alpha(primaryColor, 0.9),
            boxShadow: `0 6px 20px ${alpha(primaryColor, 0.6)}`,
          }
        },
        text: {
            color: primaryColor,
            '&:hover': { backgroundColor: alpha(primaryColor, 0.1) }
        }
      },
    },
    // 4. INPUTS DE TEXTO
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha('#000', 0.2), // Fondo oscuro para el input
            borderRadius: 12,
            '& fieldset': {
              borderColor: alpha(primaryColor, 0.2),
            },
            '&:hover fieldset': {
              borderColor: primaryColor,
            },
            '&.Mui-focused fieldset': {
              borderColor: primaryColor,
              borderWidth: 2,
              boxShadow: `0 0 0 4px ${alpha(primaryColor, 0.1)}`, // Anillo de enfoque
            },
            '& input': {
                color: '#fff', // Texto blanco siempre
            }
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
            '&.Mui-focused': {
                color: primaryColor
            }
          }
        },
      },
    },
    // 5. ALERTAS (Errores o Éxito en el registro)
    MuiAlert: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                border: '1px solid',
            },
            standardError: {
                backgroundColor: alpha('#ef4444', 0.1), // Rojo transparente
                borderColor: alpha('#ef4444', 0.2),
                color: '#fca5a5'
            },
            standardSuccess: {
                backgroundColor: alpha('#22c55e', 0.1), // Verde transparente
                borderColor: alpha('#22c55e', 0.2),
                color: '#86efac'
            }
        }
    }
  },
});