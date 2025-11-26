import { createTheme, type PaletteMode, alpha } from '@mui/material';

export const PRESET_COLORS = [
  '#2563eb', // Azul
  '#dc2626', // Rojo
  '#7c3aed', // Violeta
  '#059669', // Verde
  '#d97706', // Naranja
  '#db2777', // Rosa
];

export const getTheme = (mode: PaletteMode, primaryColor: string) => {
  const isDark = mode === 'dark';

  // Definimos qué tan fuerte es el tinte del fondo
  const tintOpacity = isDark ? 0.1 : 0.05; 

  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: primaryColor,
        contrastText: '#ffffff', // Texto dentro de botones SIEMPRE blanco
      },
      background: {
        // Colores base sólidos (Negro o Blanco)
        default: isDark ? '#000000' : '#ffffff',
        paper: isDark ? '#0a0a0a' : '#ffffff',
      },
      text: {
        // --- CORRECCIÓN: TEXTO NEUTRO Y LEGIBLE ---
        // Nada de mezclar el color principal aquí. Blanco sobre negro, Negro sobre blanco.
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      button: { fontWeight: 600, textTransform: 'none' },
      // Aseguramos que los títulos se vean bien
      h1: { color: isDark ? '#ffffff' : '#000000' },
      h2: { color: isDark ? '#ffffff' : '#000000' },
      h3: { color: isDark ? '#ffffff' : '#000000' },
      h4: { color: isDark ? '#ffffff' : '#000000' },
      h5: { color: isDark ? '#ffffff' : '#000000' },
      h6: { color: isDark ? '#ffffff' : '#000000' },
    },
    shape: { borderRadius: 16 },
    components: {
      // 1. FONDO GLOBAL (El tinte inmersivo)
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#000000' : '#ffffff',
            // Aquí aplicamos la capa de color SOBRE el fondo, pero DETRÁS del texto
            backgroundImage: `linear-gradient(${alpha(primaryColor, tintOpacity)}, ${alpha(primaryColor, tintOpacity)})`,
            backgroundAttachment: 'fixed',
            transition: 'background 0.4s ease',
          },
        },
      },
      // 2. TARJETAS Y SIDEBAR (Tinte un poco más fuerte para diferenciar)
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            backgroundImage: `linear-gradient(${alpha(primaryColor, tintOpacity + 0.05)}, ${alpha(primaryColor, tintOpacity + 0.05)}) !important`,
            border: `1px solid ${alpha(primaryColor, 0.1)}`, 
            transition: 'background 0.4s ease, border 0.4s ease',
          },
        },
      },
      // 3. BOTONES
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none', // Evita mayúsculas forzadas
            fontWeight: 600,
          },
          // ESTILO PARA BOTONES NORMALES (PRIMARY)
          containedPrimary: {
            backgroundColor: primaryColor,
            color: '#ffffff',
            boxShadow: `0 4px 14px ${alpha(primaryColor, 0.4)}`,
            '&:hover': {
              backgroundColor: alpha(primaryColor, 0.9),
              boxShadow: `0 6px 20px ${alpha(primaryColor, 0.6)}`,
            }
          },
          // ESTILO PARA BOTONES DE PELIGRO (ERROR)
          containedError: {
            backgroundColor: '#d32f2f', // Rojo estándar de Material
            color: '#ffffff',
            boxShadow: `0 4px 14px ${alpha('#d32f2f', 0.4)}`, // Resplandor rojo
            '&:hover': {
              backgroundColor: '#c62828', // Rojo más oscuro al hover
              boxShadow: `0 6px 20px ${alpha('#d32f2f', 0.6)}`,
            }
          },
          // Botones de texto (sin fondo)
          text: {
            color: primaryColor, 
            '&:hover': { backgroundColor: alpha(primaryColor, 0.1) }
          },
          // Botones de texto de error (ej: cancelar peligroso)
          textError: {
             color: '#d32f2f',
             '&:hover': { backgroundColor: alpha('#d32f2f', 0.1) }
          },
          // Botones con borde
          outlined: {
            borderColor: alpha(primaryColor, 0.5),
            color: primaryColor,
            '&:hover': {
                borderColor: primaryColor,
                backgroundColor: alpha(primaryColor, 0.05),
            }
          }
        },
      },
      // 4. ITEMS DEL SIDEBAR
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 4,
            // El texto normal del sidebar es gris/blanco (legible)
            color: isDark ? '#e0e0e0' : '#424242', 
            '&.Mui-selected': {
              backgroundColor: alpha(primaryColor, 0.15),
              borderLeft: `4px solid ${primaryColor}`,
              // SOLO cuando está seleccionado se pinta del color principal
              color: isDark ? '#ffffff' : primaryColor, 
              '& .MuiListItemIcon-root': {
                color: primaryColor,
              },
              '& .MuiListItemText-primary': {
                fontWeight: 'bold',
                color: isDark ? '#ffffff' : primaryColor,
              }
            },
            '&:hover': {
                backgroundColor: alpha(primaryColor, 0.08),
            }
          },
        },
      },
      // 5. INPUTS
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(primaryColor, 0.04),
            color: isDark ? '#ffffff' : '#000000', // Texto que escribes: BLANCO/NEGRO
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor,
            },
          }
        }
      },
      // 6. MODALES
      MuiDialog: {
        styleOverrides: {
          paper: {
            boxShadow: `0 20px 60px -10px ${alpha(primaryColor, 0.3)}`, // Resplandor alrededor del modal
          }
        }
      },
      // 7. ICONOS GENERALES
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
          }
        }
      }
    },
  });
};