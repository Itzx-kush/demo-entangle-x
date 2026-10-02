import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';
import { qh } from '../lib/api';

export type Message = { role: 'user' | 'model', content: string };

interface AiContextType {
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
  isPopupOpen: boolean;
  setInput: (value: string) => void;
  setPopupOpen: (open: boolean) => void;
  handleSend: (text: string) => Promise<void>;
  clearChat: () => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setPopupOpen] = useState(false);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setInput('');
  }, []);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const conversation = messages.slice(-10);
    
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const response = await qh.aiChat({
        message: trimmed,
        conversation: conversation
      });
      setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      // Remove the optimistic user message so it doesn't break role alternation
      setMessages(prev => prev.slice(0, -1));
      let msg = "AI Assistant is temporarily unavailable.";
      if (err instanceof Error) {
         msg = err.message;
      } else if (err?.message) {
         msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  return (
    <AiContext.Provider value={{
      messages,
      input,
      loading,
      error,
      isPopupOpen,
      setInput,
      setPopupOpen,
      handleSend,
      clearChat
    }}>
      {children}
    </AiContext.Provider>
  );
}

export function useAi() {
  const context = useContext(AiContext);
  if (context === undefined) {
    throw new Error('useAi must be used within an AiProvider');
  }
  return context;
}
