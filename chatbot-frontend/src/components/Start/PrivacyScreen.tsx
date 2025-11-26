import {
  Container,
  Box,
  Typography,
  Button,
  useTheme,
  alpha
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

function PrivacyScreen() {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleStartChat = () => {
    navigate('/chat');
  };

  const handleGoBack = () => {
    navigate(-1);
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
        
        // --- FONDO: LUZ DESDE ARRIBA ---
        bgcolor: 'background.default',
        backgroundImage: `
            radial-gradient(circle at 60% 0%, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 50%),
            linear-gradient(${alpha('#000', 0.8)}, ${alpha('#000', 0.8)})
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* 1. Caja superior de TÍTULO */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 450,
            p: 1.5,
            mb: { xs: 6, sm: 8 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.primary', letterSpacing: 3, textAlign: 'center', fontWeight: 'bold' }}>
            PRIVACIDAD Y CONFIANZA
          </Typography>
        </Box>

        {/* 2. Caja de mensaje principal */}
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
            Finalmente, hablemos de tu 
            <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}> privacidad</Box>.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
            Esta conversación es 
            <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}> confidencial</Box>. Los datos que recopilamos son 
            <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}> anónimos</Box> y se usan solo para
            mejorar mi funcionamiento.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            Puedes confiar en que este es un espacio seguro para ti. 😉
          </Typography>
        </Box>

        {/* 3. Botones */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartChat}
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
    </Box>
  );
}

export default PrivacyScreen;