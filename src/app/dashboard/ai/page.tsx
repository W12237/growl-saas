'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Badge, Tabs } from '@/components/ui';
import { Bot, Sparkles, FileText, ImageIcon, TrendingUp, Send, Edit3, BarChart2 } from 'lucide-react';

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState('generator');

  const tabs = [
    { id: 'generator', label: 'Content Generator', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'images', label: 'Image Creator', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'analytics', label: 'Insights', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/20 flex items-center justify-center shadow-[0_0_15px_rgba(182,255,46,0.15)] text-[#B6FF2E]">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">AI Suite</h1>
          </div>
          <p className="text-white/40 max-w-xl text-sm leading-relaxed">
            Leverage advanced AI models to generate high-performing content, analyze campaign data, and accelerate your creative workflow.
          </p>
        </div>
        <Button variant="primary" icon={<Sparkles className="w-4 h-4" />} className="shrink-0">
          New Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover glow="lime" className="flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B6FF2E]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-[#B6FF2E]/10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner text-[#B6FF2E]">
              <FileText className="w-6 h-6" />
            </div>
            <Badge variant="lime" dot>Ready</Badge>
          </div>
          <div className="relative z-10 mt-2">
            <h3 className="font-bold text-white mb-1.5 text-lg">Smart Copywriter</h3>
            <p className="text-sm text-white/50 leading-relaxed">Generate engaging copy for ads, social media, and emails in seconds using trained agency models.</p>
          </div>
        </Card>
        
        <Card hover glow="purple" className="flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-[#8B5CF6]/10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner text-[#8B5CF6]">
              <ImageIcon className="w-6 h-6" />
            </div>
            <Badge variant="purple" dot>Beta</Badge>
          </div>
          <div className="relative z-10 mt-2">
            <h3 className="font-bold text-white mb-1.5 text-lg">Asset Generator</h3>
            <p className="text-sm text-white/50 leading-relaxed">Create custom on-brand images and graphics using text prompts powered by advanced diffusion models.</p>
          </div>
        </Card>

        <Card hover className="flex flex-col gap-4 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-50 shadow-inner text-white/50">
              <TrendingUp className="w-6 h-6" />
            </div>
            <Badge variant="default">Coming Soon</Badge>
          </div>
          <div className="relative z-10 mt-2 opacity-60">
            <h3 className="font-bold text-white mb-1.5 text-lg">Predictive Analytics</h3>
            <p className="text-sm text-white/50 leading-relaxed">Forecast campaign performance and get actionable optimization tips based on historical data.</p>
          </div>
        </Card>
      </div>

      <Card padding="lg" className="border-white/[0.05] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#B6FF2E]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-[#B6FF2E]">AI</span> Assistant
              </h2>
              <p className="text-sm text-white/40 mt-1">What would you like to create today?</p>
            </div>
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          <div className="space-y-5 bg-black/20 p-6 rounded-2xl border border-white/5 shadow-inner">
            <Input 
              placeholder="E.g., Write a 5-day email sequence for a new SaaS product launch targeting marketing managers..." 
              className="text-base py-4 bg-white/5 border-white/10 focus:bg-white/10"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="cursor-pointer hover:bg-white/10 transition-colors border-white/10 bg-black/40">
                  <span className="opacity-50 mr-1">Tone:</span> Professional
                </Badge>
                <Badge variant="default" className="cursor-pointer hover:bg-white/10 transition-colors border-white/10 bg-black/40">
                  <span className="opacity-50 mr-1">Length:</span> Medium
                </Badge>
                <Badge variant="default" className="cursor-pointer hover:bg-white/10 transition-colors border-white/10 bg-black/40">
                  <span className="opacity-50 mr-1">Format:</span> Email
                </Badge>
              </div>
              <Button variant="primary" icon={<Send className="w-4 h-4" />} iconPosition="right" className="w-full sm:w-auto shadow-[0_0_20px_rgba(182,255,46,0.2)]">
                Generate Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
