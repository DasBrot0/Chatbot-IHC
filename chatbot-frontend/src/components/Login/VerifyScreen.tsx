import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { VERIFICATION_URL } from '../../api';

export default function VerifyScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${VERIFICATION_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al verificar el email');
      }

      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          {status === 'loading' && (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">Verificando tu email...</Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon
                sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                ¡Email Verificado!
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ py: 1.5 }}
              >
                Ir al Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Error en la Verificación
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/register')}
                sx={{ py: 1.5 }}
              >
                Volver al Registro
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}