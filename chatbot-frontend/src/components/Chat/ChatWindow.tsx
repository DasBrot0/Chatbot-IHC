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

  // Manejar envío
  const handleSend = async () => {
    if (input.trim() === '' || isLoading || !userId) return;

    const userMessageText = input;
    
    const newUserMessage: Message = {
      sender: 'user',
      text: userMessageText,
    };
    
    // Si el primer mensaje es del bot (bienvenida), lo reemplazamos
    const baseMessages = messages.length === 1 && messages[0].sender === 'bot'
      ? []
      : messages;

    const updatedMessages = [...baseMessages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedMessages,
          user_id: userId,
          conversation_id: currentConversationId // Enviar ID actual (puede ser null)
        }),
      });

      if (!response.ok) throw new Error('Error en la respuesta de la API');

      const data = await response.json(); 
      // data = { reply: "...", conversation_id: 123, conversation_title: "..." }

      const botResponse: Message = {
        sender: 'bot',
        text: data.reply,
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);

      if (!currentConversationId && data.conversation_id) {
        setCurrentConversationId(data.conversation_id);
        
        // ¡Avisamos a ChatScreen.tsx que se creó un nuevo chat!
        onConversationStarted(data.conversation_id);
      }

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

  // El JSX es idéntico a tu 'ChatScreen' original
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

      {/* Área de Mensajes (Idéntica a la tuya) */}
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
                 },
                 '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    margin: '16px 0',
                    fontSize: '0.9rem',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  },
                  '& th, & td': {
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    padding: '8px 12px',
                    textAlign: 'left',
                  },
                  '& th': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    fontWeight: 600,
                  },
                  '& tr:nth-of-type(even)': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  }
            }}
          >
            {msg.sender === 'bot' ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {msg.text}
              </ReactMarkdown>
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