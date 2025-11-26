import { Routes, Route, Navigate } from 'react-router-dom';
import type { JSX } from 'react';
import WelcomeScreen from './components/Start/WelcomeScreen';
import LimitsScreen from './components/Start/LimitsScreen';
import PrivacyScreen from './components/Start/PrivacyScreen';
import ChatScreen from './components/Chat/ChatScreen';
import LoginScreen from './components/Login/LoginScreen';
import RegisterScreen from './components/Login/RegisterScreen';
import VerifyScreen from './components/Login/VerifyScreen';

// Componente para proteger rutas
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const userId = localStorage.getItem('user_id');
  
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/limits" element={<LimitsScreen />} />
      <Route path="/privacy" element={<PrivacyScreen />} />
      
      {/* Rutas de autenticación */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/verify" element={<VerifyScreen />} />
      
      {/* Ruta protegida del chat */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatScreen />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;