import {
  Container,
  Box,
  Typography,
  Button,
  useTheme, 
  alpha     
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

function LimitsScreen() {
    const navigate = useNavigate();
    const theme = useTheme(); 

    const handleAcknowledge = () => {
        navigate('/privacy');
    };

    const handleGoBack = () => {
        navigate(-1);
    }

    return (
    // 1. Contenedor de pantalla completa (Box) con el fondo
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6 },
        
        // --- FONDO: IDÉNTICO AL WELCOME SCREEN (Luz desde arriba) ---
        bgcolor: 'background.default',
        backgroundImage: `
            radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 50%),
            linear-gradient(${alpha('#000', 0.8)}, ${alpha('#000', 0.8)})
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      }}
    >
        {/* 2. Contenedor de contenido centrado (Container) */}
        <Container 
            maxWidth="sm" 
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            {/* 1. Caja superior de TÍTULO */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 350,
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
                    LÍMITES Y SEGURIDAD
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
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 3, lineHeight: 1.7 }}>
                    ¡Genial! Antes de empezar, es muy importante que sepas dos cosas:
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 3, lineHeight: 1.7 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>1. Soy un bot 🤖 (IA), no un humano.</Box> Estoy
                    aprendiendo, pero no puedo reemplazar a un terapeuta o profesional de la salud mental.
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: theme.palette.error.main || '#f44336' }}>2. No soy un servicio de crisis. ⚠️</Box> Si sientes
                    que tu vida está en riesgo o necesitas ayuda urgente, por favor contacta al
                    113. Tu seguridad es lo primero.
                </Typography>
            </Box>

            {/* Botones */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAcknowledge}
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
    </Box>
    );
}

export default LimitsScreen;