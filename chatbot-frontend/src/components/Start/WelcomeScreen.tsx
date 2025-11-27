import {
  Container,
  Box,
  Typography,
  Button,
  useTheme, 
  alpha 
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import IABoyImage from '../../resources/IABOY.jpg';

function WelcomeScreen() {
  const navigate = useNavigate();
  const theme = useTheme(); 
  
  const handleUnderstandClick = () => {
    navigate('/limits');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6 },
        bgcolor: 'background.default',
        backgroundImage: `
            radial-gradient(circle at 40% 0%, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 60%),
            linear-gradient(${alpha('#000', 0.6)}, ${alpha('#000', 0.8)})
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* --- IMAGEN DE IA BOY --- */}
        <Box
          component="img"
          src={IABoyImage}
          alt="IA Boy"
          sx={{
            width: 140,
            height: 140,
            borderRadius: '50%', // Circular
            objectFit: 'cover',
            border: `4px solid ${theme.palette.background.paper}`, // Borde para separar del fondo
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`, // Resplandor del color del tema
            mb: -3, // Truco: Lo subimos un poco para que se superponga o quede pegadito
            zIndex: 2,
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.05)' }
          }}
        />

        {/* Caja superior de BIENVENIDO */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 300,
            pt: 4, // Un poco más de padding arriba por la imagen
            pb: 1.5,
            px: 1.5,
            mb: { xs: 6, sm: 8 },
            bgcolor: 'background.paper',
            borderRadius: 2, 
            boxShadow: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            position: 'relative',
            zIndex: 1
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
            bgcolor: 'background.paper', 
            boxShadow: 10,
            minHeight: { sm: 250 },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Typography variant="body1" sx={{ color: 'text.primary', mb: 2, lineHeight: 1.7 }}>
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
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`, 
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