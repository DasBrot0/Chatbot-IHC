import {
  Container,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function PrivacyScreen() {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate('/chat');
  };

  const handleGoBack = () => {
    navigate(-1);
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
      {/* 1. Caja superior de TÍTULO */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 450,
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
        <Typography variant="h6" sx={{ color: 'text.primary', letterSpacing: 3, textAlign: 'center' }}>
          PRIVACIDAD Y CONFIANZA
        </Typography>
      </Box>

      {/* 2. Caja de mensaje principal */}
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
          Finalmente, hablemos de tu privacidad.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary', mb: 3 }}>
          Esta conversación es confidencial. Los datos que recopilamos son anónimos y se usan solo para
          mejorar mi funcionamiento.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          Puedes confiar en que este es un espacio seguro para ti. 😉
        </Typography>
      </Box>

      {/* 3. Botones */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartChat}
          sx={{ minWidth: 220, boxShadow: 8, textTransform: 'none' }}
        >
          ¡Estoy list@ para empezar!
        </Button>
        <Button
          variant="text"
          color="primary"
          onClick={handleGoBack}
          sx={{ minWidth: 220 }}
        >
          Volver
        </Button>
      </Box>
    </Container>
  );
}

export default PrivacyScreen;