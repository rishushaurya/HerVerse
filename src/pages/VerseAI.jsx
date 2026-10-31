import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

import MobileNav from '@/components/common/MobileNav';
import ChatBubble from '@/components/ai/ChatBubble';
import SuggestionChips from '@/components/ai/SuggestionChips';

export default function VerseAI() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch user context
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });
  // Load chat history on mount
  const { data: chatHistory = [], isFetched: historyFetched } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => base44.entities.ChatHistory.list('-timestamp', 100)
  });

  // Restore messages once the history request has finished (the [] default is not "empty history")
  useEffect(() => {
    if (!historyFetched) return;
    if (!chatLoaded && chatHistory.length > 0) {
      const restoredMessages = [...chatHistory]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(h => ({
          role: h.role,
          content: h.content,
          timestamp: h.timestamp
        }));
      setMessages(restoredMessages);
      setChatLoaded(true);
    } else if (!chatLoaded && chatHistory.length === 0) {
      setChatLoaded(true);
    }
  }, [chatHistory, chatLoaded, historyFetched]);

  // Clear chat (one request; history is stored server-side)
  const clearChat = async () => {
    try {
      await base44.delete('/ai/history');
    } catch (e) {
      console.error('Failed to clear chat', e);
    }
    setMessages([]);
    queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessageId = Date.now();
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString(), id: aiMessageId, isStreaming: true }]);

    try {
      // The server adds the system prompt from her profile, check-ins, cycle, tasks and contacts.
      const apiMessages = [
        ...messages.filter(m => !m.isStreaming).slice(-20).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text }
      ];

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ messages: apiMessages, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      });

      if (!response.ok) {
        // Show the server's reason (e.g. "Database unavailable") rather than a generic error.
        const reason = (await response.json().catch(() => null))?.message;
        throw Object.assign(new Error(`VerseAI ${response.status}`), { reason });
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Buffer partial lines: an SSE event can be split across network chunks.
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                aiResponseText += data.content;
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: aiResponseText } : msg));
              }
            } catch (e) { /* parse error */ }
          }
        }
      }

      // Final update (the server already saved both turns)
      const finalTimestamp = new Date().toISOString();
      setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: aiResponseText || t('connectionError'), isStreaming: false, timestamp: finalTimestamp } : msg));

    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: error.reason || t('connectionError'), isStreaming: false } : msg));
    }

    setIsLoading(false);
  };

  const handleSuggestionSelect = (text) => sendMessage(text);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'var(--app-bg-gradient)', color: 'var(--app-text-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b" style={{ borderColor: 'var(--app-card-border)' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'var(--app-accent-gradient)' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{t('verseAI')}</h1>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{t('alwaysHere')}</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="rounded-xl"
              title="Clear chat"
              aria-label="Clear chat"
            >
              <Trash2 className="w-5 h-5" style={{ color: 'var(--app-text-muted)' }} />
            </Button>
          )}
        </motion.div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'var(--app-accent-light)' }}>
              <Sparkles className="w-10 h-10" style={{ color: 'var(--app-accent)' }} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>
              {t('hello')} {user?.name?.split(' ')[0] || ''}!
            </h2>
            <p className="max-w-sm mx-auto leading-relaxed mb-6" style={{ color: 'var(--app-text-secondary)' }}>
              {t('verseIntro')}
            </p>
            <SuggestionChips onSelect={handleSuggestionSelect} />
          </motion.div>
        ) : (
          <div className="space-y-2 pt-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatBubble key={index} message={message} isUser={message.role === 'user'} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--app-accent-gradient)' }}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3 border" style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--app-accent)', animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--app-accent-secondary)', animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--app-accent)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 pb-24 border-t" style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)' }}>
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isLoading && sendMessage(input)}
            placeholder={t('shareThoughts')}
            disabled={isLoading}
            className="flex-1 rounded-2xl py-6 px-5"
            style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)', boxShadow: 'var(--app-shadow)' }}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            aria-label="Send"
            className="w-14 h-14 rounded-2xl shadow-lg disabled:opacity-50 text-white"
            style={{ background: 'var(--app-accent-gradient)' }}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--app-text-muted)' }}>
          {t('aiDisclaimer')}
        </p>
      </div>

      <MobileNav currentPage="VerseAI" />
    </div>
  );
}