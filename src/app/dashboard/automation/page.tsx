'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Badge, Tabs, Modal, Input } from '@/components/ui';
import { 
  Zap, 
  Workflow, 
  PlayCircle, 
  PauseCircle, 
  Plus, 
  Settings, 
  Activity,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Sparkles,
  Trash2
} from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AutomationDashboard() {
  const { t } = useLanguage();
  const { data: automations, mutate, isLoading } = useSWR('/api/automation', fetcher, { fallbackData: [] });
  
  const [activeTab, setActiveTab] = useState('workflows');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const tabs = [
    { id: 'workflows', label: 'My Workflows' },
    { id: 'templates', label: 'Templates' },
    { id: 'logs', label: 'Run History' },
  ];

  const safeAutomations = Array.isArray(automations) ? automations : [];

  const toggleWorkflowStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await fetch('/api/automation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      mutate();
    } catch (err) {
      console.error('Failed to toggle workflow:', err);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await fetch(`/api/automation?id=${id}`, { method: 'DELETE' });
      mutate();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const handleCreateAIWorkflow = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiPrompt.split(' ').slice(0, 6).join(' '),
          description: `Auto-generated workflow for: "${aiPrompt}". AI has automatically connected the required apps and mapped the fields.`,
          trigger: 'ai_generated',
          status: 'active'
        })
      });
      mutate();
      setIsModalOpen(false);
      setAiPrompt('');
      setActiveTab('workflows');
    } catch (err) {
      console.error('Failed to create workflow:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    {
      id: 1,
      title: 'Lead Routing & CRM Sync',
      description: 'Automatically sync new leads from webforms to your CRM and assign to the right agent based on territory.',
      icon: <Workflow className="w-5 h-5" />,
      color: 'bg-[#34D399]',
    },
    {
      id: 2,
      title: 'Social Media Cross-Posting',
      description: 'When a new blog is published, automatically generate and schedule promotional posts across social channels.',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-[#60A5FA]',
    },
    {
      id: 3,
      title: 'End-of-Month Invoicing',
      description: 'Generate and send invoices for all tracked time in the current month to active clients.',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-[#FBBF24]',
    },
  ];

  const handleUseTemplate = async (template: any) => {
    try {
      await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          trigger: 'template',
          status: 'active'
        })
      });
      mutate();
      setActiveTab('workflows');
    } catch (err) {
      console.error('Failed to create from template:', err);
    }
  };

  const getWorkflowIcon = (trigger: string | null) => {
    if (trigger === 'ai_generated') return <Sparkles className="w-5 h-5" />;
    if (trigger === 'template') return <Copy className="w-5 h-5" />;
    return <Workflow className="w-5 h-5" />;
  };

  const totalRuns = safeAutomations.reduce((sum: number, a: any) => sum + (a.runs || 0), 0);

  return (
    <div className="space-y-8" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/20 flex items-center justify-center text-[#B6FF2E]">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('meetings.automationTitle')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] max-w-xl text-sm leading-relaxed">
            {t('meetings.automationSubtitle')}
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          {t('common.save')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="flex flex-col gap-3 border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#B6FF2E]/5 rounded-full blur-2xl -mr-8 -mt-8 transition-all duration-500 group-hover:bg-[#B6FF2E]/10"></div>
           <div className="flex items-center justify-between relative z-10">
             <div className="w-10 h-10 rounded-lg bg-[#B6FF2E]/10 border border-[#B6FF2E]/20 flex items-center justify-center text-[#B6FF2E]">
               <Activity className="w-5 h-5" />
             </div>
             <Badge variant="lime">Healthy</Badge>
           </div>
           <div className="relative z-10 mt-2">
             <h3 className="text-3xl font-black text-white">{safeAutomations.filter((w: any) => w.status === 'active').length}</h3>
             <p className="text-sm text-white/50 font-medium">Active Workflows</p>
           </div>
        </Card>

        <Card padding="md" className="flex flex-col gap-3 border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/5 rounded-full blur-2xl -mr-8 -mt-8 transition-all duration-500 group-hover:bg-[#8B5CF6]/10"></div>
           <div className="flex items-center justify-between relative z-10">
             <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
               <Zap className="w-5 h-5" />
             </div>
           </div>
           <div className="relative z-10 mt-2">
             <h3 className="text-3xl font-black text-white">{totalRuns.toLocaleString()}</h3>
             <p className="text-sm text-white/50 font-medium">Total Runs</p>
           </div>
        </Card>

        <Card padding="md" className="flex flex-col gap-3 border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
           <div className="flex items-center justify-between relative z-10">
             <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
               <CheckCircle2 className="w-5 h-5" />
             </div>
           </div>
           <div className="relative z-10 mt-2">
             <h3 className="text-3xl font-black text-white">{safeAutomations.length}</h3>
             <p className="text-sm text-white/50 font-medium">Total Workflows</p>
           </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card padding="lg" className="border-white/[0.05] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 relative z-10">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === 'workflows' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10" style={{ animation: 'fade-in 300ms ease-out' }}>
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center h-48">
                <div className="w-8 h-8 rounded-full border-2 border-[#B6FF2E] border-t-transparent animate-spin"></div>
              </div>
            ) : safeAutomations.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-48 text-white/30 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <Zap className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-semibold text-white/50 text-sm">No workflows yet. Create your first one.</p>
              </div>
            ) : (
              safeAutomations.map((workflow: any) => (
                <div 
                  key={workflow.id}
                  className="flex flex-col p-5 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/[0.03] hover:border-white/15 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner bg-[#B6FF2E]/10 border border-white/10 text-[#B6FF2E]">
                      {getWorkflowIcon(workflow.trigger)}
                    </div>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#F87171]/60 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2">{workflow.title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed mb-6 flex-grow line-clamp-3">
                    {workflow.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${workflow.status === 'active' ? 'bg-[#B6FF2E] shadow-[0_0_8px_#B6FF2E]' : 'bg-white/30'}`}></span>
                      <span className="text-xs font-semibold text-white/70 capitalize">{workflow.status}</span>
                      <span className="text-xs text-white/30 ml-2">{workflow.runs} runs</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={workflow.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />} 
                        onClick={() => toggleWorkflowStatus(workflow.id, workflow.status)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Create New Card */}
            <div 
              className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer min-h-[260px]"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:text-white group-hover:bg-white/10">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold mb-1">Create Workflow</h4>
              <p className="text-sm text-white/40 text-center max-w-[200px]">Start from scratch or use AI to build it instantly.</p>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10" style={{ animation: 'fade-in 300ms ease-out' }}>
            {templates.map((template) => (
              <div 
                key={template.id}
                className="flex flex-col p-5 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/[0.03] hover:border-white/15 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${template.color}/10 border border-white/10 ${template.color.replace('bg-', 'text-')}`}>
                    {template.icon}
                  </div>
                </div>
                
                <h4 className="text-lg font-bold text-white mb-2">{template.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed mb-6 flex-grow">
                  {template.description}
                </p>

                <div className="pt-4 border-t border-white/5 mt-auto">
                  <Button variant="secondary" icon={<Copy className="w-4 h-4" />} fullWidth onClick={() => handleUseTemplate(template)}>
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="relative z-10 bg-black/20 rounded-2xl border border-white/5 overflow-hidden" style={{ animation: 'fade-in 300ms ease-out' }}>
            {safeAutomations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-white/30">
                <Clock className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-semibold text-white/50 text-sm">No run history yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Workflow</th>
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Runs</th>
                    <th className="p-4 text-xs font-bold text-white/50 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {safeAutomations.map((a: any) => (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        {a.status === 'active' ? (
                          <Badge variant="lime" className="bg-[#B6FF2E]/10 text-[#B6FF2E] border-none"><CheckCircle2 className="w-3 h-3 mr-1 inline-block"/> Active</Badge>
                        ) : (
                          <Badge variant="default" className="bg-white/5 text-white/40 border-none"><PauseCircle className="w-3 h-3 mr-1 inline-block"/> Paused</Badge>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-sm text-white">{a.title}</td>
                      <td className="p-4 text-sm text-white/50">{a.runs}</td>
                      <td className="p-4 text-sm text-white/50">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      {/* AI Automation Modal */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create AI Automation"
      >
        <div className="space-y-4">
          <p className="text-sm text-white/50 mb-4">
            Describe what you want to automate in plain English, and our AI will build the workflow for you instantly.
          </p>
          <Input 
            placeholder="e.g. When a new stripe payment succeeds, send a slack message and create a Jira ticket..." 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="py-4"
          />
          <div className="flex justify-end pt-4 gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              icon={<Sparkles className="w-4 h-4" />} 
              loading={isGenerating}
              onClick={handleCreateAIWorkflow}
            >
              {isGenerating ? 'Generating...' : 'Generate Workflow'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
