import {
  Container,
  Box,
  Typography,
  Button,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

function WelcomeScreen(){
  const navigate = useNavigate();
  
  const handleUnderstandClick = () => {
    navigate('/limits');
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 3, sm: 6 },
      }}
    >
      {/* Caja superior de BIENVENIDO */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 300,
          p: 1.5,
          mb: { xs: 6, sm: 8 },
          bgcolor: 'background.paper',
          borderRadius: 1, 
          boxShadow: 6,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: 'text.primary', letterSpacing: 4, textAlign: 'center' }}>
          BIENVENIDO
        </Typography>
      </Box>

      {/* Caja de mensaje del bot */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          p: { xs: 4, sm: 6 },
          mb: { xs: 8, sm: 10 },
          borderRadius: 2, 
          bgcolor: 'background.paper',
          boxShadow: 10,
          minHeight: {sm: 300}
        }}
      >
        <Typography variant="body1" sx={{ color: 'text.primary', mb: 3 }}>
          <Box component="span" sx={{ mr: 1 }}>👋</Box> Soy [Nombre genérico de Bot], un asistente conversacional diseñado para ser tu
          espacio seguro.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary', mb: 3 }}>
          Estoy aquí para escucharte cuando sientas ansiedad, estrés, o simplemente necesites un
          momento para procesar tus emociones.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          Mi propósito es ofrecerte apoyo y ayudarte a encontrar un poco de calma.
        </Typography>
      </Box>

      {/* 3. Botón Entendido */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleUnderstandClick}
        sx={{
          minWidth: 220,
          boxShadow: 8,
        }}
      >
        Entendido
      </Button>
    </Container>
  );
}

export default WelcomeScreen;