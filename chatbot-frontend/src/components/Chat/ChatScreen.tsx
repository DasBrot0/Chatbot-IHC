import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, type PaletteMode, CircularProgress } from '@mui/material';
import debounce from 'lodash.debounce';

// Componentes
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import SettingsDialog from './Settings/SettingsDialog';
import WelcomeView from './Settings/WelcomeView';

// Utilidades
import { getTheme } from '../../themes/theme'; 
import { USER_SETTINGS_URL } from '../../api';
import ConfirmDialog from '../Dialogs/ConfimDialog';

function ChatScreen() {
  const navigate = useNavigate();

  // Estados de UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Estados de Navegación del Chat
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [refreshSidebarKey, setRefreshSidebarKey] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  // Estados de Configuración y Modales
  const [mode, setMode] = useState<PaletteMode>('dark');
  const [primaryColor, setPrimaryColor] = useState('#2196f3');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // --- 1. CARGA INICIAL Y PROTECCIÓN ---
  useEffect(() => {
    const user_id = localStorage.getItem('user_id');

    if (!user_id) {
      navigate('/login');
      return;
    }

    setUserId(user_id);
    
    // Cargar configuración
    fetch(`${USER_SETTINGS_URL}/${user_id}/settings`)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("No settings");
        })
        .then(data => {
            if (data.theme_mode) setMode(data.theme_mode);
            if (data.primary_color) setPrimaryColor(data.primary_color);
        })
        .catch(() => console.log("Usando tema por defecto"))
        .finally(() => setIsLoadingAuth(false));

  }, [navigate]);

  // --- 2. AUTO-GUARDADO PREFERENCIAS ---
  const saveToApi = useCallback(
    debounce(async (uid: string, newMode: string, newColor: string) => {
      if (!uid) return;
      try {
        await fetch(`${USER_SETTINGS_URL}/${uid}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme_mode: newMode, primary_color: newColor })
        });
      } catch (error) {
        console.error("Error guardando settings:", error);
      }
    }, 1000), 
    [] 
  );

  const handleModeChange = (newMode: 'light' | 'dark') => {
    setMode(newMode); 
    if (userId) saveToApi(userId, newMode, primaryColor);
  };

  const handleColorChange = (newColor: string) => {
    setPrimaryColor(newColor);
    if (userId) saveToApi(userId, mode, newColor);
  };

  // --- 3. LÓGICA DE NAVEGACIÓN (Chat vs Bienvenida) ---
  
  // Click en "Nueva Conversación" (Sidebar o Botón Bienvenida)
  const handleNewChat = () => {
    setSelectedConversationId(null); // ID null = Chat Nuevo
    setShowWelcome(false);           // Ocultar bienvenida, mostrar ChatWindow
  };

  // Click en una conversación del historial (Sidebar)
  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setShowWelcome(false);           // Ocultar bienvenida, mostrar ChatWindow con historial
  };

  const handleConversationDeleted = () => {
    setSelectedConversationId(null);
    setRefreshSidebarKey(prev => prev + 1);
    setShowWelcome(true); // Si borra el chat actual, volvemos a la bienvenida
  };

  // Callback cuando se crea el chat real (primer mensaje enviado)
  const handleConversationStarted = (newId: number) => {
    setSelectedConversationId(newId);
    setRefreshSidebarKey(prev => prev + 1);
  };

  // --- 4. LÓGICA DE LOGOUT ---
  
  // Abre el modal (llamado desde SettingsDialog)
  const handleLogoutClick = () => {
    setIsSettingsOpen(false); // Cerramos settings
    setIsLogoutDialogOpen(true); // Abrimos confirmación
  };

  // Ejecuta la salida real (llamado desde LogoutDialog)
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  const theme = useMemo(() => getTheme(mode, primaryColor), [mode, primaryColor]);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Spinner de carga inicial
  if (isLoadingAuth || !userId) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a1929' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        
        <Sidebar
          isOpen={isSidebarOpen}
          userId={userId}
          onSelectConversation={handleSelectConversation} // Usamos la nueva función
          onNewChat={handleNewChat}                       // Usamos la nueva función
          onConversationDeleted={handleConversationDeleted}
          refreshKey={refreshSidebarKey}
          selectedConversationId={selectedConversationId}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        
        <Box component="main" sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            {/* AQUÍ ESTÁ LA MAGIA: Si showWelcome es true, mostramos la presentación. Si no, el Chat. */}
            {showWelcome ? (
                <WelcomeView onNewChat={handleNewChat} />
            ) : (
                <ChatWindow 
                   userId={userId}
                   conversationId={selectedConversationId}
                   onConversationStarted={handleConversationStarted}
                   onToggleSidebar={toggleSidebar}
                />
            )}

        </Box>

        {/* Modal de Configuración */}
        <SettingsDialog 
            open={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            mode={mode}
            primaryColor={primaryColor}
            onModeChange={handleModeChange}
            onColorChange={handleColorChange}
            onLogout={handleLogoutClick} // Pasamos la función que abre el modal
        />

        {/* Modal de Confirmación de Logout */}
        <ConfirmDialog 
          open={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
          onConfirm={confirmLogout}
          title="¿Cerrar Sesión?"
          content="Tendrás que ingresar tus credenciales nuevamente para acceder."
          confirmText="Salir"
          isDanger={true}
        />

      </Box>
    </ThemeProvider>
  );
}

export default ChatScreen;