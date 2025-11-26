import {
  Container,
  Box,
  Typography,
  Button,
  useTheme, // Importar hook para colores
  alpha     // Importar alpha para transparencias
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

function WelcomeScreen() {
  const navigate = useNavigate();
  const theme = useTheme(); // Accedemos al tema para el color exacto
  
  const handleUnderstandClick = () => {
    navigate('/limits');
  };

  return (
    // 1. CAMBIO PRINCIPAL: Usamos Box en lugar de Container aquí
    // Box ocupa el 100% del ancho por defecto.
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%', // Asegura ancho total
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6 },
        
        // 2. APLICAMOS EL FONDO AQUÍ
        bgcolor: 'background.default',
        backgroundImage: `
            radial-gradient(circle at 40% 0%, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 60%),
            linear-gradient(${alpha('#000', 0.6)}, ${alpha('#000', 0.8)})
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      {/* 3. Usamos el Container AQUÍ ADENTRO para centrar el contenido */}
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Caja superior de BIENVENIDO */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 300,
            p: 1.5,
            mb: { xs: 6, sm: 8 },
            bgcolor: 'background.paper',
            borderRadius: 2, // Un poco más redondeado
            boxShadow: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` // Borde sutil
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.primary', letterSpacing: 4, textAlign: 'center', fontWeight: 'bold' }}>
            BIENVENIDO
          </Typography>
        </Box>

        {/* Caja de mensaje del bot */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            p: { xs: 4, sm: 5 },
            mb: { xs: 8, sm: 10 },
            borderRadius: 3, 
            bgcolor: 'background.paper', // Usa el color semitransparente del tema
            boxShadow: 10,
            minHeight: { sm: 250 },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.7 }}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>👋</Box> 
            Soy <strong>IA Boy</strong>, un asistente conversacional diseñado para ser tu espacio seguro.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
            Estoy aquí para escucharte cuando sientas ansiedad, estrés, o simplemente necesites un
            momento para procesar tus emociones.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            Mi propósito es ofrecerte apoyo y ayudarte a encontrar un poco de calma.
          </Typography>
        </Box>

        {/* Botón Entendido */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUnderstandClick}
          size="large"
          sx={{
            minWidth: 220,
            py: 1.5,
            fontSize: '1rem',
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`, // Sombra brillante
            '&:hover': {
                boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.6)}`,
            }
          }}
        >
          Entendido
        </Button>

      </Container>
    </Box>
  );
}

export default WelcomeScreen;