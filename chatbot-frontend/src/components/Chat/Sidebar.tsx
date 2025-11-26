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
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import type { Conversation } from '../../types';
import { CONVERSATIONS_URL, DELETE_CONVERSATION_URL } from '../../api';
import ConfirmDialog from '../Dialogs/ConfimDialog';

interface SidebarProps {
  isOpen: boolean;
  userId: string | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onConversationDeleted: () => void;
  refreshKey: number;
  selectedConversationId: number | null;
  onOpenSettings: () => void;
}

function Sidebar({
  isOpen,
  userId,
  onSelectConversation,
  onNewChat,
  onConversationDeleted,
  refreshKey,
  selectedConversationId,
  onOpenSettings
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS PARA EL MODAL DE BORRAR ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);

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

  useEffect(() => {
    fetchConversations();
  }, [userId, refreshKey]);

  // 1. Al hacer clic en el tachito, solo abrimos el modal y guardamos el ID
  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    setChatToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 2. Si el usuario confirma en el modal, ejecutamos el borrado real
  const confirmDelete = async () => {
    if (chatToDelete === null) return;

    try {
      const response = await fetch(`${DELETE_CONVERSATION_URL}/${chatToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al borrar');
      
      onConversationDeleted(); // Actualizar UI
    } catch (error) {
      console.error('Error al borrar:', error);
    } finally {
      setDeleteDialogOpen(false);
      setChatToDelete(null);
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
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={onNewChat}
          sx={{ 
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
                 bgcolor: 'primary.dark',
                 boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.6)}`,
            }
          }}
        >
          Nueva Conversación
        </Button>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ p: 1 }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {!isLoading && conversations.length === 0 && (
             <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}>
               Sin historial reciente.
             </Typography>
          )}
          {conversations.map((convo) => (
            <ListItem key={convo.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selectedConversationId === convo.id}
                onClick={() => onSelectConversation(convo.id)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.25) },
                    '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 }
                  },
                  '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }
                }}
              >
                <ListItemText
                  primary={convo.title}
                  primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem', color: 'text.primary' }}
                />
                
                {/* Botón de borrar llama a handleDeleteClick */}
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => handleDeleteClick(e, convo.id)}
                  sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />
      
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          variant="text"
          startIcon={<SettingsIcon />}
          onClick={onOpenSettings}
          sx={{ color: 'text.secondary', justifyContent: 'flex-start', px: 2 }}
        >
          Configuración
        </Button>
      </Box>

      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Borrar conversación?"
        content="Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este chat de tu historial?"
        confirmText="Borrar"
        isDanger={true}
      />

    </Box>
  );
}

export default Sidebar;