'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs } from '@/components/ui';
import { Bot, Sparkles, FileText, ImageIcon, TrendingUp, Send, Edit3, BarChart2, Check, Copy } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function AIDashboard() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('generator');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [tone, setTone] = useState('Professional');
  const [format, setFormat] = useState('Email');

  const tabs = [
    { id: 'generator', label: t('ai.copywriter'), icon: <Edit3 className="w-4 h-4" /> },
    { id: 'images', label: t('ai.assetGen'), icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'analytics', label: t('ai.analytics'), icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResultText('');
    setStatusMsg('');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tone,
          format,
          language,
          type: activeTab,
        }),
      });

      const data = await res.json();
      if (res.ok && data.generatedText) {
        setResultText(data.generatedText);
        setStatusMsg(t('ai.savedSuccess'));
      } else {
        setResultText(data.error || 'Generation failed');
      }
    } catch (err) {
      setResultText('Error communicating with AI engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/20 flex items-center justify-center shadow-[0_0_15px_rgba(182,255,46,0.15)] text-[#B6FF2E]">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('ai.title')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] max-w-xl text-sm leading-relaxed">
            {t('ai.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={<Sparkles className="w-4 h-4" />} className="shrink-0">
          {t('ai.ready')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover glow="lime" className="flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner text-[#B6FF2E]">
              <FileText className="w-6 h-6" />
            </div>
            <Badge variant="lime" dot>{t('ai.ready')}</Badge>
          </div>
          <div className="relative z-10 mt-2">
            <h3 className="font-bold text-[var(--color-text-primary)] mb-1.5 text-lg">{t('ai.copywriter')}</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{t('ai.copywriterDesc')}</p>
          </div>
        </Card>
        
        <Card hover glow="purple" className="flex flex-col gap-4 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner text-[#8B5CF6]">
              <ImageIcon className="w-6 h-6" />
            </div>
            <Badge variant="purple" dot>AI 2.0</Badge>
          </div>
          <div className="relative z-10 mt-2">
            <h3 className="font-bold text-[var(--color-text-primary)] mb-1.5 text-lg">{t('ai.assetGen')}</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{t('ai.assetGenDesc')}</p>
          </div>
        </Card>

        <Card hover className="flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-text-muted)]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <Badge variant="default">Pro</Badge>
          </div>
          <div className="relative z-10 mt-2">
            <h3 className="font-bold text-[var(--color-text-primary)] mb-1.5 text-lg">{t('ai.analytics')}</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{t('ai.analyticsDesc')}</p>
          </div>
        </Card>
      </div>

      <Card padding="lg" className="border-[var(--color-border-primary)] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <span className="text-[var(--color-growl-lime)]">AI</span> {t('ai.assistant')}
              </h2>
            </div>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="space-y-5 bg-[var(--color-bg-secondary)] p-6 rounded-2xl border border-[var(--color-border-primary)] shadow-inner">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('ai.promptPlaceholder')}
              className="text-base py-4 bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)]"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge 
                  onClick={() => setTone(tone === 'Professional' ? 'Casual & Energetic' : 'Professional')}
                  variant="default" 
                  className="cursor-pointer border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]"
                >
                  <span className="opacity-50 mr-1">Tone:</span> {tone}
                </Badge>
                <Badge 
                  onClick={() => setFormat(format === 'Email' ? 'Social Post' : 'Email')}
                  variant="default" 
                  className="cursor-pointer border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]"
                >
                  <span className="opacity-50 mr-1">Format:</span> {format}
                </Badge>
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                variant="primary" 
                icon={<Send className="w-4 h-4" />} 
                iconPosition="right" 
                className="w-full sm:w-auto"
              >
                {isGenerating ? t('ai.generating') : t('ai.generateBtn')}
              </Button>
            </div>
          </div>

          {resultText && (
            <div className="mt-6 p-6 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-growl-lime)] uppercase tracking-wider">
                  {statusMsg || 'Generated Result'}
                </span>
                <Button size="sm" variant="ghost" onClick={handleCopy} icon={copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="text-sm leading-relaxed text-[var(--color-text-primary)] whitespace-pre-wrap font-sans">
                {resultText}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
