'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Input, Tabs, Avatar } from '@/components/ui';
import { formatRelativeTime } from '@/lib/formatters';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  FileImage, 
  FileText, 
  Video,
  MoreVertical, 
  Eye, 
  ShieldCheck,
  Filter,
  Plus,
  X,
  Trash2
} from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ApprovalsDashboard() {
  const { t } = useLanguage();
  const { data: approvals, mutate, isLoading } = useSWR('/api/approvals', fetcher, { fallbackData: [] });
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'image',
    submitter: 'Wessam',
    client: ''
  });

  const safeApprovals = Array.isArray(approvals) ? approvals : [];

  const pendingCount = safeApprovals.filter(a => a.status === 'pending').length;
  const approvedCount = safeApprovals.filter(a => a.status === 'approved').length;
  const rejectedCount = safeApprovals.filter(a => a.status === 'rejected').length;

  const tabs = [
    { id: 'pending', label: 'Pending Review', badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Needs Revision', badge: rejectedCount > 0 ? rejectedCount : undefined },
  ];

  const filteredApprovals = safeApprovals.filter(a => 
    a.status === activeTab &&
    (a.title.toLowerCase().includes(search.toLowerCase()) || 
     a.submitter.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmitAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      mutate();
      setIsModalOpen(false);
      setFormData({ title: '', type: 'image', submitter: 'Wessam', client: '' });
    } catch (err) {
      console.error('Failed to submit asset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      // Optimistic update
      mutate(
        safeApprovals.map(a => a.id === id ? { ...a, status } : a),
        false
      );
      
      await fetch('/api/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      mutate();
    } catch (err) {
      console.error(`Failed to update status to ${status}:`, err);
      mutate();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await fetch(`/api/approvals?id=${id}`, { method: 'DELETE' });
        mutate();
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  return (
    <div className="space-y-8" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#664893]/10 border border-[#664893]/20 flex items-center justify-center text-[#8B5CF6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('approvals.title')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] max-w-xl text-sm leading-relaxed">
            {t('approvals.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            {t('common.save')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="flex items-center gap-4 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FBBF24]/5 rounded-full blur-2xl -mr-8 -mt-8 transition-all duration-500 group-hover:bg-[#FBBF24]/10"></div>
          <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24] relative z-10 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-white/50 font-medium">Pending Review</p>
            <h3 className="text-2xl font-black text-white">{pendingCount}</h3>
          </div>
        </Card>
        
        <Card padding="md" className="flex items-center gap-4 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B6FF2E]/5 rounded-full blur-2xl -mr-8 -mt-8 transition-all duration-500 group-hover:bg-[#B6FF2E]/10"></div>
          <div className="w-12 h-12 rounded-xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/20 flex items-center justify-center text-[#B6FF2E] relative z-10 shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-white/50 font-medium">Approved</p>
            <h3 className="text-2xl font-black text-white">{approvedCount}</h3>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F87171]/5 rounded-full blur-2xl -mr-8 -mt-8 transition-all duration-500 group-hover:bg-[#F87171]/10"></div>
          <div className="w-12 h-12 rounded-xl bg-[#F87171]/10 border border-[#F87171]/20 flex items-center justify-center text-[#F87171] relative z-10 shadow-inner">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-white/50 font-medium">Needs Revision</p>
            <h3 className="text-2xl font-black text-white">{rejectedCount}</h3>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card padding="lg" className="border-white/[0.05] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 relative z-10">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="w-full md:w-72">
            <Input 
              icon={<Search className="w-4 h-4" />}
              placeholder="Search approvals..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
        </div>

        {/* List of Approvals */}
        {isLoading ? (
          <div className="w-full h-48 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin"></div>
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
            <ShieldCheck className="w-10 h-10 text-white/20 mb-3" />
            <p className="text-white/40 text-sm font-medium">No {activeTab} approvals found.</p>
          </div>
        ) : (
          <div className="space-y-3 relative z-10">
            {filteredApprovals.map((item: any) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/[0.04] hover:border-white/15 transition-all duration-200 gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 border border-white/10 shadow-inner">
                    {item.type === 'image' ? <FileImage className="w-5 h-5" /> : item.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {item.title}
                      {item.client && <span className="ml-2 text-[10px] uppercase tracking-wider text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{item.client}</span>}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1.5 font-medium text-white/60">
                        <Avatar name={item.submitter} size="xs" />
                        {item.submitter}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" icon={<XCircle className="w-4 h-4" />} onClick={() => handleUpdateStatus(item.id, 'rejected')} title="Reject" />
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={<CheckCircle className="w-4 h-4" />} 
                        className="bg-transparent border border-[#B6FF2E]/30 text-[#B6FF2E] hover:bg-[#B6FF2E]/10 shadow-none"
                        onClick={() => handleUpdateStatus(item.id, 'approved')}
                        title="Approve"
                      />
                    </div>
                  )}
                  {item.status !== 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(item.id, 'pending')}>
                      Reopen
                    </Button>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-[#ef4444] hover:bg-white/10 transition-colors ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Submit Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Submit Asset for Approval</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Asset Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Q3 Ad Creative V2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Asset Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="image">Image / Graphic</option>
                    <option value="document">Document / PDF</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.client}
                    onChange={e => setFormData({...formData, client: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
