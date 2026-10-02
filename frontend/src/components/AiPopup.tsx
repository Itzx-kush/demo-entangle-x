import React, { useRef, useEffect } from 'react';
import { Bot, User, Send, X, Loader2, AlertCircle, Maximize2, RefreshCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAi } from '../contexts/AiContext';
import { EXAMPLE_PROMPTS, formatContent } from '../pages/AiAssistantPage';
import { Button } from './ui';

export function AiPopup() {
  const { messages, input, loading, error, isPopupOpen, setInput, handleSend, setPopupOpen, clearChat } = useAi();
  const navigate = useNavigate();
  const location = useLocation();
  
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (messages.length > 0 && isPopupOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isPopupOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setPopupOpen(!isPopupOpen);
      }
      if (e.key === 'Escape' && isPopupOpen) {
        setPopupOpen(false);
        triggerRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPopupOpen, setPopupOpen]);
  
  useEffect(() => {
    if (isPopupOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isPopupOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleExpand = () => {
    setPopupOpen(false);
    navigate('/ai');
  };

  const handleClearChat = () => {
    if (window.confirm('Clear current conversation?')) {
      clearChat();
    }
  };

  const hideTrigger = location.pathname === '/ai';

  return (
    <>
      {!isPopupOpen && !hideTrigger && (
        <button
          ref={triggerRef}
          onClick={() => setPopupOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 hover:shadow-xl hover:shadow-primary/40 transition-all z-50 animate-in zoom-in duration-300"
          aria-label="Open EntangleX AI Assistant (Ctrl + /)"
          title="Open EntangleX AI Assistant (Ctrl + /)"
        >
          <Bot size={28} />
        </button>
      )}

      {/* Floating Popup Panel */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none sm:p-6 md:p-8">
          {/* Mobile Overlay (blocks background only on small screens) */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm sm:hidden pointer-events-auto" 
            onClick={() => setPopupOpen(false)}
          />
          
          <div 
            ref={popupRef}
            className="relative w-full sm:w-[400px] md:w-[440px] h-[90vh] sm:h-[650px] max-h-screen sm:max-h-[85vh] bg-background border-t sm:border border-border sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 fade-in duration-300"
            role="dialog"
            aria-label="AI Assistant"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight text-foreground">EntangleX AI</h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">Research Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={handleClearChat} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="New Conversation" aria-label="New Conversation">
                    <RefreshCcw size={16} />
                  </button>
                )}
                <button onClick={handleExpand} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Expand to full page" aria-label="Expand to full page">
                  <Maximize2 size={16} />
                </button>
                <button onClick={() => { setPopupOpen(false); triggerRef.current?.focus(); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" title="Close" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center animate-in fade-in duration-500 pb-8">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Bot size={24} className="text-primary" />
                  </div>
                  <h4 className="text-center font-medium mb-1 text-foreground">How can I help you?</h4>
                  <p className="text-center text-xs text-muted-foreground mb-6 px-4">
                    Ask about the architecture, workflows, models, or how to use this platform.
                  </p>
                  <div className="flex flex-col gap-2">
                    {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-left text-xs bg-card border border-border hover:border-primary hover:bg-accent/50 text-foreground transition-colors p-2.5 rounded-lg shadow-sm w-full"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'model' && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={14} className="text-primary" />
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-[13px] sm:text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-card border border-border text-card-foreground rounded-tl-sm'
                      }`}>
                        {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          formatContent(msg.content)
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                          <User size={14} className="text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={14} className="text-primary" />
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </>
              )}
            </div>

            {error && (
              <div className="px-4 pb-2">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2 text-xs flex items-center gap-2 w-full">
                  <AlertCircle size={14} className="shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-background border-t border-border">
              <div className="bg-card border border-border rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all p-1.5 flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="flex-1 max-h-32 min-h-[36px] bg-transparent resize-none border-0 focus:ring-0 px-2 py-1.5 text-foreground text-[13px] sm:text-sm scrollbar-thin outline-none"
                  disabled={loading}
                  rows={1}
                />
                <Button 
                  onClick={() => handleSend(input)} 
                  disabled={!input.trim() || loading}
                  className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center p-0 rounded-lg mb-0.5"
                >
                  <Send size={16} />
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                AI may be inaccurate. Press Ctrl + / to open/close.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
