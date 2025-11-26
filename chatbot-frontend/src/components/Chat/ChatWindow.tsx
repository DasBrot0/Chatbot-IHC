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
  Chip,
  Fade
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Message } from '../../types';
import { CHAT_URL, HISTORY_URL } from '../../api';

interface ChatWindowProps {
  userId: string;
  conversationId: number | null; // ID del chat seleccionado
  onConversationStarted: (newId: number) => void; // Callback para avisar a App
  onToggleSidebar: () => void;
}

function ChatWindow({ userId, conversationId, onConversationStarted, onToggleSidebar}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mantenemos una referencia interna al ID, que viene de las props
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(conversationId);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sincronizar el ID de la conversación
  useEffect(() => {
    setCurrentConversationId(conversationId);
  }, [conversationId]);


  // Cargar historial cuando cambia el ID de conversación
  useEffect(() => {
    if (currentConversationId) {
      // Si hay un ID, cargar su historial
      loadHistory(currentConversationId);
    } else {
      // Es un chat nuevo, mostrar bienvenida
      setMessages([
        { sender: 'bot', text: '¡Hola! Qué gusto verte por aquí. ¿Sobre qué te gustaría conversar hoy?' }
      ]);
    }
  }, [currentConversationId]); // Se ejecuta cuando el ID cambia

  const loadHistory = async (cid: number) => {
    setIsLoading(true);
    setMessages([]); // Limpiar mensajes anteriores
    try {
      const response = await fetch(`${HISTORY_URL}/${cid}`);
      if (!response.ok) throw new Error('Error al cargar el historial');
      
      const history: Message[] = await response.json();
      
      if (history.length === 0) {
        setMessages([
          { sender: 'bot', text: 'Retomando nuestra conversación...' }
        ]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setMessages([
        { sender: 'bot', text: 'No pude cargar nuestro historial. ¿Empezamos de nuevo?' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input; // Si viene del botón, usa ese. Si no, el input.
    
    if (textToSend.trim() === '' || isLoading || !userId) return;

    // 1. Limpiamos las opciones del mensaje anterior del bot para que no se puedan volver a clickear
    setMessages(prev => prev.map(msg => ({...msg, options: undefined})));

    const newUserMsg: Message = { sender: 'user', text: textToSend };
    
    const base = messages.length === 1 && messages[0].sender === 'bot' && !currentConversationId ? [] : messages;
    const updated = [...base, newUserMsg];
    
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updated,
          user_id: userId,
          conversation_id: currentConversationId
        }),
      });

      if (!response.ok) throw new Error('Error API');
      const data = await response.json();
      
      // AQUI RECIBIMOS LAS OPCIONES Y LAS GUARDAMOS EN EL MENSAJE
      setMessages(prev => [
          ...prev, 
          { 
              sender: 'bot', 
              text: data.reply, 
              options: data.options // <--- Guardamos las sugerencias
          }
      ]);

      if (!currentConversationId && data.conversation_id) {
        setCurrentConversationId(data.conversation_id);
        onConversationStarted(data.conversation_id);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error de conexión.' }]);
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
      <AppBar position="static" sx={{ bgcolor: 'background.paper', boxShadow: 'none', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onToggleSidebar}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1, color: 'text.primary' }}>
            Chat de Asistencia
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {currentConversationId ? `Chat ID: ${currentConversationId}` : 'Chat Nuevo'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Área de Mensajes */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg, index) => (
          <Box 
            key={index} 
            sx={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
                elevation={0}
                sx={{
                p: 2,
                borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                border: (theme) => msg.sender === 'bot' ? `1px solid ${theme.palette.divider}` : 'none'
                }}
            >
                {msg.sender === 'bot' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {msg.text}
                </ReactMarkdown>
                ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                )}
            </Paper>

            {/* --- RENDERIZADO DE OPCIONES DE RESPUESTA RÁPIDA --- */}
            {msg.sender === 'bot' && msg.options && msg.options.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {msg.options.map((option, idx) => (
                        <Fade in={true} style={{ transitionDelay: `${idx * 100}ms` }} key={idx}>
                            <Chip 
                                label={option} 
                                onClick={() => handleSend(option)} // Al hacer click, envía el texto
                                clickable
                                disabled={isLoading} // Desactivar si ya se está enviando
                                sx={{
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                    }
                                }}
                            />
                        </Fade>
                    ))}
                </Box>
            )}
          </Box>
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
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
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
          disabled={isLoading || !userId}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatWindow;