import { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

// Tema oscuro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    primary: {
      main: '#90caf9',
    },
    error: {
      main: '#f44336', // Rojo para el botón de borrar
    }
  },
});

/**
 * Este componente es el "Padre" de la interfaz de chat.
 * Se carga en la ruta /chat y gestiona el estado principal.
 */
function ChatScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  
  // Este estado 'refresca' la sidebar cuando se crea o borra un chat
  const [refreshSidebarKey, setRefreshSidebarKey] = useState(0);

  // Generar o recuperar el user_id al iniciar
  useEffect(() => {
    let storedUserId = localStorage.getItem('chat_user_id');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chat_user_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Callback: Se llama desde ChatWindow cuando se crea una nueva conversación
  const handleConversationStarted = (newId: number) => {
    setSelectedConversationId(newId);
    setRefreshSidebarKey(prev => prev + 1); // Forzar refresh de sidebar
  };

  // Callback: Se llama desde la Sidebar
  const handleNewChat = () => {
    setSelectedConversationId(null);
  };

  // Callback: Se llama desde la Sidebar
  const handleConversationDeleted = () => {
    setSelectedConversationId(null); // Volver a "nuevo chat"
    setRefreshSidebarKey(prev => prev + 1); // Forzar refresh
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          userId={userId}
          onSelectConversation={setSelectedConversationId}
          onNewChat={handleNewChat}
          onConversationDeleted={handleConversationDeleted}
          refreshKey={refreshSidebarKey}
          selectedConversationId={selectedConversationId}
        />
        
        {/* Ventana de Chat Principal */}
        <Box component="main" sx={{ flexGrow: 1, height: '100vh' }}>
          {userId && ( // Solo renderiza el chat si tenemos userId
            <ChatWindow
              // Forzar re-render completo al cambiar de chat
              key={selectedConversationId} 
              userId={userId}
              conversationId={selectedConversationId}
              onConversationStarted={handleConversationStarted}
              onToggleSidebar={toggleSidebar}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default ChatScreen;