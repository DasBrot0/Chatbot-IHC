// Estructura de un mensaje
export interface Message {
  sender: 'user' | 'bot';
  text: string;
  options?: string[];
}

// Estructura de una conversación (para la sidebar)
export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}