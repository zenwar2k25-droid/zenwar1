import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Minus, Zap, CheckCircle2, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ZenwarChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('zenwar_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    } else {
      // Initial greeting
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hi there! I am Zenwar AI, your 24x7 Business Assistant. How can I help you manage your workshop today?',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('zenwar_chat_history', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send to our new backend endpoint via the API wrapper
      const response = await api.sendChatMessage({
        message: userMessage.content,
        history: messages,
        currentPage: location.pathname
      });

      if (!response.ok) {
        // Render the exact error message from the backend if available
        const errorMessage = response.data?.error || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        throw new Error(errorMessage);
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toISOString()
      }]);
      
    } catch (error: any) {
      console.error('Chatbot Request Error:', error);
      
      const errorMessage = error.message || "I'm sorry, I'm having trouble connecting right now. Please try again later.";
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **Error**: ${errorMessage}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = [
    "How do I create a Business?",
    "What is Website Builder?",
    "How to manage Inventory?"
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-600 shadow-[0_0_20px_rgba(0,198,255,0.4)] flex items-center justify-center border-2 border-white/10 hover:shadow-[0_0_30px_rgba(0,198,255,0.6)] transition-shadow group cursor-pointer"
          >
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[var(--bg-card)] shadow-sm animate-bounce" />
            <MessageSquare size={24} className="text-white relative z-10" />
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: isMinimized ? 'calc(100% - 60px)' : 0, 
              scale: 1 
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            className="fixed bottom-6 right-6 z-[100] w-[360px] max-w-[calc(100vw-32px)] h-[550px] max-h-[calc(100vh-100px)] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div 
              className="px-4 py-3 bg-gradient-to-r from-[var(--color-primary)] to-blue-700 flex items-center justify-between shrink-0 cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-sm">
                  <Zap size={16} className="text-white fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Zenwar AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/90 hover:text-white"
                >
                  {isMinimized ? <ChevronDown size={18} className="rotate-180" /> : <Minus size={18} />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
                  className="p-1.5 hover:bg-white/10 hover:bg-red-500/80 rounded-md transition-colors text-white/90 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-sidebar)] flex flex-col gap-4 relative">
              
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-[var(--color-primary)] text-white rounded-br-sm' 
                      : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] rounded-bl-sm'
                    }`}
                  >
                    {/* Render markdown-like text formatting safely in a real app, 
                        but for now we'll just output text preserving newlines */}
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    <div className={`text-[9px] mt-1.5 font-medium flex items-center justify-end gap-1
                      ${msg.role === 'user' ? 'text-white/60' : 'text-[var(--text-muted)]'}`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.role === 'user' && <CheckCircle2 size={10} />}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start w-full"
                >
                  <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 w-16">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies (only if at the bottom/not scrolling up much) */}
            {messages.length < 3 && (
              <div className="px-4 pb-2 bg-[var(--bg-sidebar)] overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => { setInputValue(qr); }}
                    className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--color-primary)]/30 text-[var(--color-primary)] rounded-full text-xs font-semibold hover:bg-[var(--color-primary-glow)] transition-colors inline-block cursor-pointer"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 bg-[var(--bg-card)] border-t border-[var(--border-card)] flex items-end gap-2 shrink-0"
            >
              <div className="flex-1 bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl relative overflow-hidden focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-all">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="w-full bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] outline-none resize-none max-h-32 min-h-[44px]"
                  rows={1}
                />
              </div>
              <button 
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-11 h-11 shrink-0 rounded-xl bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 transition-colors cursor-pointer"
              >
                <Send size={18} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
