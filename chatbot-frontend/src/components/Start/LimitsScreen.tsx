import {
  Container,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LimitsScreen() {
    const navigate = useNavigate();

    const handleAcknowledge = () => {
        navigate('/privacy');
    };

    const handleGoBack = () => {
        navigate(-1);
    }

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
          maxWidth: 350, // Ajustado para el nuevo título
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
          LÍMITES Y SEGURIDAD
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
          ¡Genial! Antes de empezar, es muy importante que sepas dos cosas:
        </Typography>
        
        <Typography variant="body1" sx={{ color: 'text.primary', mb: 3 }}>
          <Box component="span" sx={{ fontWeight: 'bold' }}>1. Soy un bot 🤖 (IA), no un humano.</Box> Estoy
          aprendiendo, pero no puedo reemplazar a un terapeuta o profesional de la salud mental.
        </Typography>
        
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          <Box component="span" sx={{ fontWeight: 'bold' }}>2. No soy un servicio de crisis. ⚠️</Box> Si sientes
          que tu vida está en riesgo o necesitas ayuda urgente, por favor contacta a
          [Número/Nombre de la línea de ayuda local]. Tu seguridad es lo primero.
        </Typography>
      </Box>

      {/* Botones */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAcknowledge}
          sx={{ minWidth: 220, boxShadow: 8 }}
        >
          Lo tengo claro
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

export default LimitsScreen;