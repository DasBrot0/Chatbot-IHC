import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Conversation } from '../../types.ts';
import { CONVERSATIONS_URL, DELETE_CONVERSATION_URL } from '../../api';

interface SidebarProps {
  isOpen: boolean;
  userId: string;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onConversationDeleted: () => void;
  refreshKey: number; // Para forzar el refresh
  selectedConversationId: number | null;
}

function Sidebar({
  isOpen,
  userId,
  onSelectConversation,
  onNewChat,
  onConversationDeleted,
  refreshKey,
  selectedConversationId,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar conversaciones
  const fetchConversations = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${CONVERSATIONS_URL}/${userId}`);
      if (!response.ok) throw new Error('Error al cargar conversaciones');
      const data: Conversation[] = await response.json();
      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar conversaciones cuando el userId esté listo o cuando 'refreshKey' cambie
  useEffect(() => {
    fetchConversations();
  }, [userId, refreshKey]);

  // Manejar borrado
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Evitar que se seleccione el chat al borrar
    if (window.confirm('¿Seguro que quieres borrar esta conversación?')) {
      try {
        const response = await fetch(`${DELETE_CONVERSATION_URL}/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al borrar');
        onConversationDeleted(); // Informar al padre que se borró
      } catch (error) {
        console.error('Error al borrar:', error);
      }
    }
  };

  return (
    <Box
      sx={{
        width: isOpen ? 280 : 0,
        flexShrink: 0,
        bgcolor: 'background.paper',
        height: '100vh',
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        transition: (theme) => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: 'hidden'
      }}
    >
      {/* Botón de Nuevo Chat */}
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          fullWidth
          onClick={onNewChat}
          sx={{ mb: 1 }}
        >
          Nueva Conversación
        </Button>
      </Box>
      <Divider sx={{ flexShrink: 0 }} />

      {/* Lista de Conversaciones */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {!isLoading && conversations.length === 0 && (
             <Typography variant="caption" sx={{p: 2, display: 'block', textAlign: 'center', color: 'text.secondary'}}>
                Inicia un nuevo chat para comenzar.
             </Typography>
          )}
          {conversations.map((convo) => (
            <ListItem key={convo.id} disablePadding>
              <ListItemButton
                selected={selectedConversationId === convo.id}
                onClick={() => onSelectConversation(convo.id)}
              >
                <ListItemText
                  primary={convo.title}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                />
                {/* Botón Rojo de Borrar */}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => handleDelete(e, convo.id)}
                  sx={{
                    color: 'error.main', // Color rojo del tema
                    opacity: 0.7,
                    '&:hover': { opacity: 1, bgcolor: 'rgba(244, 67, 54, 0.1)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default Sidebar;