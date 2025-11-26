import { Box, Typography, Button, Paper, alpha, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import AddCommentIcon from '@mui/icons-material/AddComment';

interface WelcomeViewProps {
  onNewChat: () => void;
}

export default function WelcomeView({ onNewChat }: WelcomeViewProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Fondo transparente con un borde muy sutil del color principal
          bgcolor: alpha(theme.palette.background.paper, 0.6), 
          backdropFilter: 'blur(10px)',
          maxWidth: 600,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        {/* Círculo del Icono */}
        <Box 
            sx={{ 
                width: 100, 
                height: 100,
                // Usamos el color principal con mucha transparencia
                bgcolor: alpha(theme.palette.primary.main, 0.15), 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 4,
                boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.2)}` // Resplandor
            }}
        >
            <ChatIcon sx={{ fontSize: 50, color: 'primary.main' }} />
        </Box>

        <Typography variant="h3" gutterBottom fontWeight="800">
          IA Boy
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 5, maxWidth: 450, color: 'text.secondary', fontSize: '1.1rem' }}>
          Tu espacio personal. Todo el entorno se adapta a tu color favorito para una experiencia inmersiva.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<AddCommentIcon />}
          onClick={onNewChat}
          sx={{ 
            px: 5, 
            py: 1.8, 
            fontSize: '1rem'
          }}
        >
          Iniciar Nueva Conversación
        </Button>
      </Paper>
    </Box>
  );
}