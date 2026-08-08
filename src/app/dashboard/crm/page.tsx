'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Badge, Avatar, Button, Modal, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function LeadCard({ lead, onDragStart, onDelete }: { lead: any, onDragStart: (e: React.DragEvent, leadId: string) => void, onDelete: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-3.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] hover:border-[var(--color-border-hover)] transition-all cursor-grab active:cursor-grabbing group hover:shadow-lg relative"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-bold text-white group-hover:text-[#B6FF2E] transition-colors truncate pr-2">{lead.company}</h4>
        <Badge variant={lead.probability >= 70 ? 'success' : lead.probability >= 40 ? 'warning' : 'default'} size="sm">
          {lead.probability}%
        </Badge>
      </div>
      <p className="text-xs text-white/40 mb-3 truncate">{lead.contactPerson}</p>
      
      {lead.email && <p className="text-[10px] text-white/30 mb-3 truncate">{lead.email}</p>}
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white/70">{formatCurrency(lead.value)}</span>
        <div className="flex items-center gap-2">
          {lead.assignedTo && <Avatar name={lead.assignedTo} size="xs" />}
        </div>
      </div>
      
      {isHovered && (
        <button 
          onClick={() => onDelete(lead.id)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-[#F87171] hover:bg-[#ef4444] text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          title="Delete Lead"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
    </div>
  );
}

export default function CRMPage() {
  const { t } = useLanguage();
  const { data: leads, isLoading, mutate } = useSWR('/api/crm', fetcher);
  const { data: team } = useSWR('/api/team', fetcher, { fallbackData: [] });

  const stages = [
    { id: 'lead', label: t('crm.stage.lead'), color: '#60A5FA' },
    { id: 'prospect', label: t('crm.stage.prospect'), color: '#8B5CF6' },
    { id: 'meeting', label: t('crm.stage.meeting'), color: '#FBBF24' },
    { id: 'proposal', label: t('crm.stage.proposal'), color: '#F59E0B' },
    { id: 'client', label: t('crm.stage.closed'), color: '#B6FF2E' },
  ];
  
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    company: '',
    contactPerson: '',
    email: '',
    value: '5000',
    probability: '20',
    assignedTo: 'Wessam'
  });

  const getLeadsByStage = (stageId: string) => {
    const safeLeads = Array.isArray(leads) ? leads : [];
    return safeLeads.filter((l: any) => l.stage === stageId);
  };


  const getStageValue = (stageId: string) => {
    return getLeadsByStage(stageId).reduce((sum: number, l: any) => sum + (l.value || 0), 0);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggedLead) {
      // Optimistic update
      const safeLeads = Array.isArray(leads) ? leads : [];
      const currentLead = safeLeads.find((l: any) => l.id === draggedLead);
      if (currentLead && currentLead.stage !== stageId) {
        mutate(
          safeLeads.map((l: any) => l.id === draggedLead ? { ...l, stage: stageId } : l),
          false
        );
        
        try {
          await fetch('/api/crm', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: draggedLead, stage: stageId })
          });
          
          mutate();
        } catch (err) {
          console.error('Failed to update lead:', err);
          mutate(); // revert
        }
      }
    }
    setDraggedLead(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/crm?id=${id}`, { method: 'DELETE' });
      mutate();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value) || 0,
          probability: parseInt(formData.probability) || 10,
        })
      });
      mutate();
      setIsModalOpen(false);
      setFormData({ company: '', contactPerson: '', email: '', value: '5000', probability: '20', assignedTo: 'Wessam' });
    } catch (err) {
      console.error('Failed to create lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeLeadsForTotal = Array.isArray(leads) ? leads : [];
  const totalValue = safeLeadsForTotal.reduce((sum: number, l: any) => sum + (l.value || 0), 0);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/10 border border-[#60A5FA]/20 flex items-center justify-center text-[#60A5FA]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('crm.title')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">{t('crm.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] hidden sm:block">
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-bold mr-2">Pipeline Value:</span>
            <span className="text-sm font-black text-[var(--color-growl-lime)]">{formatCurrency(totalValue)}</span>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>{t('crm.addLead')}</Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
        <div className="flex gap-4 h-full min-w-max pb-2">
          {isLoading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#B6FF2E] border-t-transparent animate-spin"></div>
            </div>
          ) : (
            stages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const stageValue = getStageValue(stage.id);
              const isDragOver = dragOverStage === stage.id;
              
              return (
                <div 
                  key={stage.id} 
                  className={`w-[280px] flex flex-col h-full rounded-2xl border transition-colors ${
                    isDragOver 
                      ? 'bg-white/[0.04] border-white/20' 
                      : 'bg-black/20 border-white/5'
                  }`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className="p-4 flex items-center justify-between shrink-0 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      <h3 className="text-sm font-bold text-white">{stage.label}</h3>
                      <Badge variant="default" size="sm" className="ml-1">{stageLeads.length}</Badge>
                    </div>
                    <span className="text-[10px] font-bold text-white/40">{formatCurrency(stageValue)}</span>
                  </div>

                  {/* Stage Leads */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {stageLeads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className={draggedLead === lead.id ? 'opacity-50' : ''}
                      >
                        <LeadCard 
                          lead={lead} 
                          onDragStart={handleDragStart} 
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-xs text-white/20 font-medium">
                        Drop leads here
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Lead</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B6FF2E] transition-colors"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Contact Person</label>
                  <input 
                    type="text" 
                    required
                    value={formData.contactPerson}
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B6FF2E] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B6FF2E] transition-colors"
                    placeholder="john@acme.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Deal Value ($)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B6FF2E] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Probability (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={e => setFormData({...formData, probability: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B6FF2E] transition-colors"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add Lead'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
