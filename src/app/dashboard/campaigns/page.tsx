'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Badge, Tabs, Button, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/formatters';
import { 
  Megaphone, 
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Filter,
  BarChart2,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  MoreVertical,
  MousePointerClick,
  DollarSign,
  X,
  Trash2,
  Activity
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const platformColors: Record<string, string> = {
  'LinkedIn': 'bg-[#0077B5]',
  'Meta Ads': 'bg-[#1877F2]',
  'Google Ads': 'bg-[#EA4335]',
  'Twitter': 'bg-[#1DA1F2]',
  'TikTok': 'bg-[#000000]',
};

export default function CampaignsPage() {
  const { data: campaigns, mutate, isLoading } = useSWR('/api/campaigns', fetcher, { fallbackData: [] });
  
  const [activeTab, setActiveTab] = useState('active');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    platform: 'LinkedIn',
    status: 'active',
    budget: '5000',
    spend: '0',
    conversions: '0',
    roi: '+0%'
  });

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'draft', label: 'Drafts' },
    { id: 'completed', label: 'Completed' },
  ];

  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];

  const filteredCampaigns = safeCampaigns.filter((c: any) => 
    c.status === activeTab &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || 
     c.platform.toLowerCase().includes(search.toLowerCase()) ||
     (c.client && c.client.toLowerCase().includes(search.toLowerCase())))
  );

  const totalSpend = safeCampaigns.reduce((sum: number, c: any) => sum + (c.spend || 0), 0);
  const totalConversions = safeCampaigns.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0);
  const activeCount = safeCampaigns.filter((c: any) => c.status === 'active').length;

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      mutate();
      setIsModalOpen(false);
      setFormData({ name: '', client: '', platform: 'LinkedIn', status: 'active', budget: '5000', spend: '0', conversions: '0', roi: '+0%' });
    } catch (err) {
      console.error('Failed to create campaign:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await fetch(`/api/campaigns?id=${id}`, { method: 'DELETE' });
        mutate();
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  return (
    <div className="space-y-8" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] text-[#F59E0B]">
              <Megaphone className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Campaigns</h1>
          </div>
          <p className="text-white/40 max-w-xl text-sm leading-relaxed">
            Track and manage your multi-channel marketing campaigns. 
            Currently running {activeCount} active campaigns across {new Set(safeCampaigns.map((c: any) => c.platform)).size} platforms.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          New Campaign
        </Button>
      </div>

      {/* Aggregate Metrics (Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#34D399]/10 text-[#34D399]">
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-white/50">Total Ad Spend</p>
          </div>
          <h3 className="text-2xl font-black text-white">{formatCurrency(totalSpend)}</h3>
          <p className="text-xs text-white/30 mt-1">Across all campaigns</p>
        </Card>

        <Card padding="md" className="border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]">
              <MousePointerClick className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-white/50">Total Conversions</p>
          </div>
          <h3 className="text-2xl font-black text-white">{totalConversions.toLocaleString()}</h3>
          <p className="text-xs text-white/30 mt-1">Leads & Sales</p>
        </Card>

        <Card padding="md" className="border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-white/50">Active Campaigns</p>
          </div>
          <h3 className="text-2xl font-black text-white">{activeCount}</h3>
          <p className="text-xs text-white/30 mt-1">Currently running</p>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <Card padding="md" className="border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-black/20">
        <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Tabs 
              tabs={tabs} 
              activeTab={activeTab} 
              onChange={setActiveTab} 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button variant="outline" className="hidden sm:flex">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
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
          <div className="w-8 h-8 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
          <Megaphone className="w-10 h-10 text-white/20 mb-3" />
          <p className="text-white/40 text-sm font-medium">No {activeTab} campaigns found.</p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign: any, index: number) => {
                const progress = Math.min(100, Math.round(((campaign.spend || 0) / (campaign.budget || 1)) * 100));
                
                return (
                  <Card 
                    key={campaign.id}
                    hover 
                    padding="md" 
                    className="flex flex-col group border-white/5 relative overflow-hidden bg-black/20 cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms`, animation: 'fade-in-up 400ms ease-out backwards' } as React.CSSProperties}
                  >
                    {/* Platform Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 opacity-20 group-hover:opacity-40" 
                         style={{ backgroundColor: platformColors[campaign.platform]?.replace('bg-[', '').replace(']', '') || '#ffffff' }}></div>
                    
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${platformColors[campaign.platform] || 'bg-white/20'}`}>
                            {campaign.platform}
                          </span>
                          {campaign.client && (
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{campaign.client}</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#B6FF2E] transition-colors line-clamp-1">{campaign.name}</h3>
                      </div>
                      <div className="flex items-center">
                        <button onClick={(e) => handleDelete(campaign.id, e)} className="text-white/20 hover:text-[#ef4444] transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 flex-grow">
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Spend / Budget</p>
                        </div>
                        <p className="text-sm font-black text-white">{formatCurrency(campaign.spend)}</p>
                        <p className="text-[10px] text-white/30">of {formatCurrency(campaign.budget)}</p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Conversions</p>
                          <TrendingUp className="w-3 h-3 text-[#34D399]" />
                        </div>
                        <p className="text-sm font-black text-white">{(campaign.conversions || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-[#34D399]">ROI: {campaign.roi || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-wider">
                        <span>Budget Pacing</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-[#ef4444]' : 'bg-[#B6FF2E]'}`} 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* List View */
            <Card padding="none" className="border-white/5 bg-black/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {['Campaign', 'Client', 'Platform', 'Spend / Budget', 'Conversions', 'ROI', ''].map((h, i) => (
                        <th key={i} className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-white/40">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredCampaigns.map((campaign: any) => {
                      const progress = Math.min(100, Math.round(((campaign.spend || 0) / (campaign.budget || 1)) * 100));
                      
                      return (
                        <tr key={campaign.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-white group-hover:text-[#B6FF2E] transition-colors">{campaign.name}</p>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-white/60">
                            {campaign.client || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm inline-block ${platformColors[campaign.platform] || 'bg-white/20'}`}>
                              {campaign.platform}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{formatCurrency(campaign.spend)}</span>
                                <span className="text-xs text-white/30">/ {formatCurrency(campaign.budget)}</span>
                              </div>
                              <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-[#ef4444]' : 'bg-[#B6FF2E]'}`} 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-white">{(campaign.conversions || 0).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-[#34D399]">{campaign.roi || '-'}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={(e) => handleDelete(campaign.id, e)} className="text-white/20 hover:text-[#ef4444] transition-colors p-2 rounded-lg hover:bg-white/5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Add Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Campaign Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                  placeholder="e.g. Summer Retargeting"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.client}
                    onChange={e => setFormData({...formData, client: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Platform</label>
                  <select 
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors appearance-none"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Twitter">Twitter</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Total Budget ($)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Current Spend ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.spend}
                    onChange={e => setFormData({...formData, spend: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Conversions</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.conversions}
                    onChange={e => setFormData({...formData, conversions: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Estimated ROI</label>
                  <input 
                    type="text" 
                    value={formData.roi}
                    onChange={e => setFormData({...formData, roi: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                    placeholder="e.g. +145%"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
