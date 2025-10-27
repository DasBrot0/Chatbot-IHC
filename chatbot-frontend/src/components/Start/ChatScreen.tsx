import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// Definimos la estructura de un mensaje
interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: '¡Hola! Qué gusto verte por aquí. ¿Sobre qué te gustaría conversar hoy?' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === '') return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');

    setTimeout(() => {
      const botResponse: Message = {
        id: updatedMessages.length + 1,
        sender: 'bot',
        text: 'Entiendo. Gracias por compartir eso conmigo. ¿Puedes contarme un poco más?'
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
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
      {/* 1. Barra Superior (Header) - Botón Back eliminado */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1, color: 'text.primary' }}>
            Chat de Asistencia
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 2. Área de Mensajes (Scrollable) */}
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
        {messages.map((msg) => (
          <Paper
            key={msg.id}
            elevation={3}
            sx={{
              p: 1.5,
              maxWidth: '75%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
              color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
              borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
            }}
          >
            <Typography variant="body1">{msg.text}</Typography>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* 3. Área de Entrada de Texto (Footer) */}
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
        />
        <IconButton type="submit" color="primary" aria-label="enviar mensaje">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatScreen;