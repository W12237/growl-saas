'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Badge } from '@/components/ui';
import { 
  BarChart, 
  Sparkles, 
  Plus, 
  FileText, 
  MoreVertical,
  X,
  Trash2,
  Calendar,
  Activity,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ReportsPage() {
  const { data: reports, mutate, isLoading } = useSWR('/api/reports', fetcher, { fallbackData: [] });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client: '',
    type: 'performance',
    dateRange: 'Last 30 Days',
    prompt: ''
  });

  const activeReport = Array.isArray(reports) ? reports.find(r => r.id === activeReportId) : null;

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newReport = await res.json();
      mutate();
      setIsModalOpen(false);
      setFormData({ client: '', type: 'performance', dateRange: 'Last 30 Days', prompt: '' });
      if (newReport && newReport.id) {
        setActiveReportId(newReport.id);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await fetch(`/api/reports?id=${id}`, {
        method: 'DELETE',
      });
      mutate();
      setOpenMenuId(null);
      if (activeReportId === id) setActiveReportId(null);
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const parseMetrics = (metricsString: string | null) => {
    if (!metricsString) return {};
    try {
      return JSON.parse(metricsString);
    } catch {
      return {};
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)] text-[#8B5CF6]">
              <BarChart className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Reports</h1>
          </div>
          <p className="text-white/40 text-sm">Generate AI-powered analytics and performance reports for your clients.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeReportId && (
            <Button variant="outline" icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => setActiveReportId(null)}>
              View All
            </Button>
          )}
          <Button variant="primary" icon={<Sparkles className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Generate AI Report
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeReportId && activeReport ? (
          /* Active Report View */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card padding="lg" className="bg-gradient-to-br from-[#111] to-[#1a1a1a] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div>
                  <Badge variant="info" size="sm" className="bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20 mb-3">
                    {activeReport.type.toUpperCase()} REPORT
                  </Badge>
                  <h2 className="text-2xl font-bold text-white mb-2">{activeReport.title}</h2>
                  <div className="flex items-center gap-4 text-sm font-semibold text-white/40">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {activeReport.dateRange}</span>
                    <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Generated {new Date(activeReport.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                {Object.entries(parseMetrics(activeReport.metrics)).map(([key, value]: [string, any], index) => (
                  <div key={index} className="bg-black/30 border border-white/5 rounded-2xl p-4">
                    <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-xl font-black text-white">{value}</h3>
                      <TrendingUp className="w-4 h-4 text-[#B6FF2E] mb-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insights Section */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-[#B6FF2E]/10 flex items-center justify-center text-[#B6FF2E]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">AI Executive Summary</h3>
                </div>
                <div className="prose prose-invert max-w-none">
                  {activeReport.aiInsights ? (
                    activeReport.aiInsights.split('\n\n').map((paragraph: string, i: number) => (
                      <p key={i} className="text-white/70 leading-relaxed mb-4 text-sm">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-white/40 italic">No insights generated.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Report List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin"></div>
              </div>
            ) : (!Array.isArray(reports) || reports.length === 0) ? (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-white/30 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-semibold text-white/50 text-sm">No reports generated yet.</p>
                <p className="text-xs mt-1">Click "Generate AI Report" to create your first one.</p>
              </div>
            ) : (
              reports.map((report: any) => (
                <Card 
                  key={report.id} 
                  padding="lg" 
                  className="bg-black/20 border-white/5 hover:border-white/20 transition-all cursor-pointer group flex flex-col relative"
                  onClick={(e) => {
                    // Prevent viewing if clicking the menu
                    if ((e.target as HTMLElement).closest('.menu-button')) return;
                    setActiveReportId(report.id);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-[#8B5CF6] group-hover:bg-[#8B5CF6]/10 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    
                    <div className="relative menu-button">
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === report.id ? null : report.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openMenuId === report.id && (
                        <div className="absolute right-0 top-10 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-[#F87171] hover:bg-white/5 flex items-center gap-2 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReport(report.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{report.title}</h3>
                  <p className="text-xs font-semibold text-white/40 mb-6">{report.client}</p>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-0.5">Date Range</span>
                      <span className="text-xs font-semibold text-white/70">{report.dateRange}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* AI Generate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B6FF2E]/10 flex items-center justify-center text-[#B6FF2E]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-white">Generate AI Report</h2>
              </div>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerateReport} className="space-y-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client Name</label>
                <input 
                  type="text" 
                  required
                  disabled={isSubmitting}
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors disabled:opacity-50"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Report Type</label>
                  <select 
                    value={formData.type}
                    disabled={isSubmitting}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none disabled:opacity-50"
                  >
                    <option value="performance">Performance</option>
                    <option value="seo">SEO</option>
                    <option value="social">Social Media</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Date Range</label>
                  <select 
                    value={formData.dateRange}
                    disabled={isSubmitting}
                    onChange={e => setFormData({...formData, dateRange: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none disabled:opacity-50"
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="Year to Date">Year to Date</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Additional Instructions (Optional)</label>
                <textarea 
                  rows={3}
                  disabled={isSubmitting}
                  value={formData.prompt}
                  onChange={e => setFormData({...formData, prompt: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors custom-scrollbar resize-none disabled:opacity-50"
                  placeholder="e.g. Focus specifically on the ROI of the new Facebook Ad campaign..."
                />
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#B6FF2E] text-black font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Generating AI Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
