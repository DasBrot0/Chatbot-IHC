import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Paper,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';

// Estructura de un mensaje
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

// URLs de tu API de Backend
const API_BASE_URL = 'http://127.0.0.1:8000';
const CHAT_URL = `${API_BASE_URL}/chat`;
const HISTORY_URL = `${API_BASE_URL}/history`;

function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generar o recuperar el user_id al iniciar
  useEffect(() => {
    let storedUserId = localStorage.getItem('chat_user_id');
    
    if (!storedUserId) {
      // Generar un ID único para este usuario
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chat_user_id', storedUserId);
    }
    
    setUserId(storedUserId);
    
    // Cargar el historial desde el backend
    loadHistory(storedUserId);
  }, []);

  // Función para cargar el historial
  const loadHistory = async (uid: string) => {
    try {
      const response = await fetch(`${HISTORY_URL}/${uid}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }
      
      const history: Message[] = await response.json();
      
      if (history.length === 0) {
        // Si no hay historial, mostrar mensaje de bienvenida
        setMessages([
          { sender: 'bot', text: '¡Hola! Qué gusto verte por aquí. ¿Sobre qué te gustaría conversar hoy?' }
        ]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
      // Mostrar mensaje de bienvenida por defecto
      setMessages([
        { sender: 'bot', text: '¡Hola! Qué gusto verte por aquí. ¿Sobre qué te gustaría conversar hoy?' }
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessageText = input;
    
    // 1. Añadir el mensaje del usuario a la UI
    const newUserMessage: Message = {
      sender: 'user',
      text: userMessageText,
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Enviar TODO el historial al backend
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: updatedMessages, // ← Enviar el historial completo
          user_id: userId,          // ← Enviar el ID del usuario
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }

      const data = await response.json();

      // 3. Añadir la respuesta del bot
      const botResponse: Message = {
        sender: 'bot',
        text: data.reply,
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);

    } catch (error) {
      console.error("Error al contactar la IA:", error);
      const errorResponse: Message = {
        sender: 'bot',
        text: 'Lo siento, algo salió mal. Por favor, intenta de nuevo.',
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Barra Superior */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1, color: 'text.primary' }}>
            Chat de Asistencia
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            ID: {userId.substring(0, 12)}...
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Área de Mensajes */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((msg, index) => (
          <Paper
            key={index}
            elevation={3}
            sx={{
              p: 1.5,
              maxWidth: '75%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
              color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
              borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
              '& h2': {
                fontSize: '1.25rem',
                fontWeight: 600,
                marginTop: '16px',
                marginBottom: '8px',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                paddingBottom: '4px',
              },
              '& p': {
                fontSize: '1rem',
                lineHeight: 1.6,
                margin: '0 0 12px 0',
              },
              '& ul, & ol': {
                paddingLeft: '24px',
                margin: '0 0 12px 0',
              },
              '& li': {
                marginBottom: '4px',
              },
              '& blockquote': {
                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                paddingLeft: '16px',
                margin: '16px 0',
                fontStyle: 'italic',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              },
              '& hr': {
                border: 'none',
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                margin: '24px 0',
              }
            }}
          >
            {msg.sender === 'bot' ? (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            ) : (
              <Typography variant="body1">{msg.text}</Typography>
            )}
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Área de Entrada */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderTop: '1px solid #333',
        }}
      >
        <TextField
          fullWidth
          variant="filled"
          label="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          sx={{ flexGrow: 1 }}
          disabled={isLoading}
        />
        <IconButton 
          type="submit" 
          color="primary" 
          aria-label="enviar mensaje"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatScreen;