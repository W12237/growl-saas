'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Sparkles, Send, Plus } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  platform?: string;
}

interface ContentChatbotProps {
  onSaveContent: (content: string, platform: string | undefined) => void;
}

import { useLanguage } from '@/lib/i18n';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  platform?: string;
}

interface ContentChatbotProps {
  onSaveContent: (content: string, platform: string | undefined) => void;
}

export function ContentChatbot({ onSaveContent }: ContentChatbotProps) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: language === 'ar' ? "مرحباً! أنا مساعد المحتوى الذكي. ماذا تريد أن نكتب اليوم؟ يمكنك اختيار المنصة والموضوع." : "Hi! I'm your AI Content Assistant. What would you like to create today? You can specify the platform (Twitter, LinkedIn, Blog) and the topic." }
  ]);
  const [input, setInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Twitter');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, platform: selectedPlatform, language }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.content || data.error || 'Failed to generate content.',
        platform: selectedPlatform
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'An error occurred while connecting to the AI.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card padding="none" className="w-full lg:w-5/12 flex flex-col border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#B6FF2E]/5 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none"></div>
      
      {/* Chat Header */}
      <div className="p-5 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B6FF2E] to-[#34D399] flex items-center justify-center text-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">{t('nav.content')} {t('ai.assistant')}</h2>
              <p className="text-xs text-[#34D399] font-medium">Free AI Inference</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {['Twitter', 'LinkedIn', 'Blog', 'Email'].map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedPlatform === platform 
                  ? 'bg-white/10 text-white border border-white/10 shadow-sm' 
                  : 'text-white/30 hover:text-white/50 border border-transparent hover:bg-white/[0.04]'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 relative z-10 custom-scrollbar min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group`}>
            <div className="flex-shrink-0 mt-1">
              {msg.role === 'ai' ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B6FF2E] to-[#34D399] flex items-center justify-center text-black shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  You
                </div>
              )}
            </div>
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
              <div className={`
                px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user' 
                  ? 'bg-[#8B5CF6] text-white rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(139,92,246,0.2)]' 
                  : 'bg-white/[0.03] border border-white/10 text-white/90 rounded-2xl rounded-tl-sm shadow-sm'
                }
              `}>
                {msg.content}
              </div>
              {msg.role === 'ai' && i !== 0 && (
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onSaveContent(msg.content, msg.platform)}
                    icon={<Plus className="w-3 h-3" />}
                    className="bg-black/40 hover:bg-white/10 border-white/10 text-white/60 hover:text-white transition-all"
                  >
                    Save to Planner
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B6FF2E] to-[#34D399] flex items-center justify-center text-black shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white/[0.03] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/40 border-t border-white/5 relative z-10 backdrop-blur-xl">
        <div className="relative flex items-center bg-black/60 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/20 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all">
          <input 
            type="text" 
            placeholder={`Draft a ${selectedPlatform} post...`}
            className="flex-1 bg-transparent py-4 px-4 text-sm text-white focus:outline-none placeholder:text-white/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={isGenerating}
          />
          <div className="pr-2">
            <button 
              className={`p-2.5 rounded-lg transition-all ${
                input.trim() && !isGenerating
                  ? 'bg-[#B6FF2E] text-black shadow-[0_0_15px_rgba(182,255,46,0.3)] hover:scale-105' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
              onClick={handleGenerate}
              disabled={!input.trim() || isGenerating}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
