'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Card, Badge, Avatar, Button, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { 
  Users, 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon,
  Briefcase,
  TrendingUp,
  ArrowRight,
  MoreVertical,
  X
} from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const healthConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  excellent: { label: 'Excellent', variant: 'success' },
  good: { label: 'Good', variant: 'info' },
  at_risk: { label: 'At Risk', variant: 'warning' },
  critical: { label: 'Critical', variant: 'error' },
};

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'lime' | 'purple' | 'default' }> = {
  active: { label: 'Active', variant: 'success' },
  onboarding: { label: 'Onboarding', variant: 'info' },
  inactive: { label: 'Inactive', variant: 'default' },
  churned: { label: 'Churned', variant: 'error' },
};

export default function ClientsPage() {
  const { t } = useLanguage();
  const { data: clients, mutate, isLoading } = useSWR('/api/clients', fetcher, { fallbackData: [] });
  
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    contactPerson: '',
    email: '',
    phone: '',
    status: 'active',
    health: 'good',
    monthlyRetainer: '0'
  });

  const safeClients = Array.isArray(clients) ? clients : [];

  const filtered = safeClients.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.industry || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRetainer = safeClients.filter((c: any) => c.status === 'active').reduce((s: number, c: any) => s + (c.monthlyRetainer || 0), 0);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      mutate();
      setIsModalOpen(false);
      setFormData({ name: '', industry: '', contactPerson: '', email: '', phone: '', status: 'active', health: 'good', monthlyRetainer: '0' });
    } catch (err) {
      console.error('Failed to create client:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('clients.title')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] max-w-xl text-sm leading-relaxed">
            {t('clients.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          {t('clients.addClient')}
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <Card padding="md" className="border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-black/20">
        <div className="flex-1 max-w-sm w-full">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="bg-white/5 border-white/10"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            {['all', 'active', 'onboarding', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                  filterStatus === status 
                    ? 'bg-white/10 text-white shadow-sm' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#B6FF2E]/20 text-[#B6FF2E]' : 'text-white/30 hover:text-white/70'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#B6FF2E]/20 text-[#B6FF2E]' : 'text-white/30 hover:text-white/70'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
          <Users className="w-10 h-10 text-white/20 mb-3" />
          <p className="text-white/40 text-sm font-medium">No clients found.</p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filtered.map((client: any, index: number) => (
                <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                  <Card 
                    hover 
                    padding="md" 
                    className="h-full flex flex-col group border-white/5 relative overflow-hidden bg-black/20"
                    style={{ animationDelay: `${index * 50}ms`, animation: 'fade-in-up 400ms ease-out backwards' } as React.CSSProperties}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-[#8B5CF6]/10"></div>
                    
                    <div className="flex items-start justify-between mb-5 relative z-10">
                      <div className="flex items-center gap-4">
                        <Avatar name={client.name} size="md" />
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-[#B6FF2E] transition-colors">{client.name}</h3>
                          <p className="text-xs text-white/40 mt-0.5">{client.industry || 'No industry'}</p>
                        </div>
                      </div>
                      <button className="text-white/20 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-6 relative z-10">
                      {statusConfig[client.status] && (
                        <Badge {...statusConfig[client.status]} size="sm" dot className="uppercase tracking-wider text-[10px] bg-white/5">{statusConfig[client.status].label}</Badge>
                      )}
                      {healthConfig[client.health] && (
                        <Badge {...healthConfig[client.health]} size="sm" className="uppercase tracking-wider text-[10px] bg-white/5">{healthConfig[client.health].label}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 flex-grow">
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 group-hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1 text-white/30">
                          <TrendingUp className="w-3 h-3" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">Monthly</p>
                        </div>
                        <p className="text-sm font-black text-white">{formatCurrency(client.monthlyRetainer)}</p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 group-hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1 text-white/30">
                          <Briefcase className="w-3 h-3" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">Total Rev</p>
                        </div>
                        <p className="text-sm font-black text-white">{formatCurrency(client.totalRevenue || 0)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] relative z-10 mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50">
                          <span className="w-2 h-2 rounded-full bg-[#B6FF2E]/50"></span>
                          {client.projectCount || 0} <span className="font-normal opacity-50">Projects</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50">
                          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]/50"></span>
                          {client.activeCampaigns || 0} <span className="font-normal opacity-50">Active</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            /* List View */
            <Card padding="none" className="border-white/5 bg-black/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {['Client', 'Industry', 'Status', 'Health', 'Monthly', 'Total Revenue', 'Activity'].map(h => (
                        <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filtered.map((client: any) => (
                      <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-4">
                            <Avatar name={client.name} size="sm" />
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-[#B6FF2E] transition-colors">{client.name}</p>
                              <p className="text-xs text-white/40 mt-0.5">{client.contactPerson}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-white/60">{client.industry}</td>
                        <td className="px-6 py-4">
                          {statusConfig[client.status] && <Badge {...statusConfig[client.status]} size="sm" dot className="bg-white/5">{statusConfig[client.status].label}</Badge>}
                        </td>
                        <td className="px-6 py-4">
                          {healthConfig[client.health] && <Badge {...healthConfig[client.health]} size="sm" className="bg-white/5">{healthConfig[client.health].label}</Badge>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-white">{formatCurrency(client.monthlyRetainer)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-white/70">{formatCurrency(client.totalRevenue || 0)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-xs font-semibold text-white/50">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#B6FF2E]/50"></span> {client.projectCount || 0} P</span>
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/50"></span> {client.activeCampaigns || 0} C</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add New Client</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Industry</label>
                  <input 
                    type="text" 
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contactPerson}
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="inactive">Inactive</option>
                    <option value="churned">Churned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Health</label>
                  <select 
                    value={formData.health}
                    onChange={e => setFormData({...formData, health: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="at_risk">At Risk</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Monthly Retainer ($)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.monthlyRetainer}
                  onChange={e => setFormData({...formData, monthlyRetainer: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
