import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, type PaletteMode, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
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
  const theme = useTheme();

  // --- RESPONSIVIDAD ---
  // Usamos 'lg' (1200px) como punto de quiebre. 
  // Si la ventana es menor a eso (laptop pequeña, tablet, celular), se comporta como móvil.
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Estados de UI
  // Si es "móvil/pequeño", arranca cerrado. Si es escritorio grande, arranca abierto.
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
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

  const [preferredName, setPreferredName] = useState('');
  const [fontScale, setFontScale] = useState(1.0);

  // Sincronizar estado del menú si cambia el tamaño de ventana
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

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
            if (data.preferred_name) setPreferredName(data.preferred_name);
            if (data.font_scale) setFontScale(data.font_scale);
        })
        .catch(() => console.log("Usando tema por defecto"))
        .finally(() => setIsLoadingAuth(false));

  }, [navigate]);

  // --- 2. AUTO-GUARDADO PREFERENCIAS ---
  const saveToApi = useCallback(
    debounce(async (uid: string, m: string, c: string, name: string, fs: number) => {
      await fetch(`${USER_SETTINGS_URL}/${uid}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              theme_mode: m, 
              primary_color: c,
              preferred_name: name,
              font_scale: fs
           })
      });
    }, 1000), []
  );

  const handleModeChange = (newMode: 'light' | 'dark') => {
    setMode(newMode); 
    if (userId) saveToApi(userId, newMode, primaryColor, preferredName, fontScale);
  };

  const handleColorChange = (newColor: string) => {
    setPrimaryColor(newColor);
    if (userId) saveToApi(userId, mode, newColor, preferredName, fontScale);
  };

  const handleNameChange = (val: string) => {
      setPreferredName(val);
      if(userId) saveToApi(userId, mode, primaryColor, val, fontScale);
  }
  const handleFontChange = (val: number) => {
      setFontScale(val);
      if(userId) saveToApi(userId, mode, primaryColor, preferredName, val);
  }

  // --- 3. LÓGICA DE NAVEGACIÓN ---
  
  const handleNewChat = () => {
    setSelectedConversationId(null); 
    setShowWelcome(false);           
    // Si estamos en móvil, cerramos el menú al crear chat
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setShowWelcome(false);           
    // Si estamos en móvil, cerramos el menú al seleccionar
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleConversationDeleted = () => {
    setSelectedConversationId(null);
    setRefreshSidebarKey(prev => prev + 1);
    setShowWelcome(true); 
  };

  const handleConversationStarted = (newId: number) => {
    setSelectedConversationId(newId);
    setRefreshSidebarKey(prev => prev + 1);
  };

  // --- 4. LÓGICA DE LOGOUT ---
  
  const handleLogoutClick = () => {
    setIsSettingsOpen(false); 
    setIsLogoutDialogOpen(true); 
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  const themeConfig = useMemo(() => getTheme(mode, primaryColor, fontScale), [mode, primaryColor, fontScale]);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false); // Para el overlay en móvil

  if (isLoadingAuth || !userId) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a1929' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={themeConfig}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        
        <Sidebar
          isOpen={isSidebarOpen}
          userId={userId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onConversationDeleted={handleConversationDeleted}
          refreshKey={refreshSidebarKey}
          selectedConversationId={selectedConversationId}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClose={closeSidebar}
          isMobile={isMobile}
        />
        
        <Box 
            component="main" 
            sx={{ 
                flexGrow: 1, 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                
                minWidth: 0, 
                overflow: 'hidden',
                transition: theme.transitions.create('margin', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
            }}
        >
            
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
            onLogout={handleLogoutClick}
            preferredName={preferredName}
            onNameChange={handleNameChange}
            fontScale={fontScale}
            onFontScaleChange={handleFontChange}
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