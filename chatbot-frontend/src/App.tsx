import { Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/Start/WelcomeScreen';
import LimitsScreen from './components/Start/LimitsScreen';
import PrivacyScreen from './components/Start/PrivacyScreen';
import ChatScreen from './components/Chat/ChatScreen';

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/limits" element={<LimitsScreen />} />
      <Route path="/privacy" element={<PrivacyScreen />} />
      <Route path="/chat" element={<ChatScreen />} />
    </Routes>
  );
}

export default App;