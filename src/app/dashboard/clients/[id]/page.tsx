'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Card, Badge, Avatar, Tabs, Button } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/formatters';
import { 
  ArrowLeft, 
  Settings, 
  MoreVertical, 
  Mail, 
  Phone, 
  Globe, 
  Tag, 
  Clock, 
  Activity, 
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const { data: client, isLoading } = useSWR(`/api/clients/${params.id}`, fetcher);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-10 h-10 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!client || client.error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <h2 className="text-xl font-bold text-white mb-2">Client not found</h2>
        <Button variant="outline" onClick={() => router.push('/dashboard/clients')}>Back to Clients</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header / Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/dashboard/clients')}
          className="flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Settings className="w-4 h-4" />}>Manage</Button>
          <Button variant="primary">New Project</Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card padding="lg" className="border-white/5 bg-black/40 relative overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#B6FF2E]/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex gap-6 items-start">
            <Avatar name={client.name} size="xl" className="border-4 border-black shadow-xl" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white">{client.name}</h1>
                <Badge {...statusConfig[client.status]} size="sm" dot>{statusConfig[client.status]?.label}</Badge>
                <Badge {...healthConfig[client.health]} size="sm">{healthConfig[client.health]?.label}</Badge>
              </div>
              <p className="text-white/50 mb-4">{client.industry || 'No industry specified'}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {client.email || 'N/A'}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {client.phone || 'N/A'}</div>
                <div className="flex items-center gap-2"><Tag className="w-4 h-4" /> Customer since {new Date(client.createdAt).getFullYear()}</div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto md:ml-auto grid grid-cols-2 sm:flex sm:flex-row gap-4 shrink-0">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 min-w-[120px]">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Monthly</p>
              <p className="text-xl font-black text-white">{formatCurrency(client.monthlyRetainer)}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 min-w-[120px]">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">LTV</p>
              <p className="text-xl font-black text-[#B6FF2E]">{formatCurrency(client.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs 
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'projects', label: `Projects (${client.projects?.length || 0})` },
          { id: 'invoices', label: `Invoices (${client.invoices?.length || 0})` },
          { id: 'meetings', label: `Meetings (${client.meetings?.length || 0})` },
        ]} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* Tab Content */}
      <div className="mt-6" style={{ animation: 'fade-in 300ms ease-out' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Projects */}
              <Card padding="md" className="border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Active Projects</h3>
                  <button onClick={() => setActiveTab('projects')} className="text-xs text-[#8B5CF6] hover:underline font-semibold">View all</button>
                </div>
                <div className="space-y-3">
                  {client.projects?.filter((p: any) => p.status === 'active' || p.status === 'planning').length === 0 ? (
                    <div className="text-sm text-white/40 py-4 text-center">No active projects found.</div>
                  ) : (
                    client.projects?.filter((p: any) => p.status === 'active' || p.status === 'planning').map((project: any) => (
                      <div key={project.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">{project.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-bold text-white mb-1">{project.progress}%</p>
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#34D399] rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                          </div>
                          <Badge variant="lime" size="sm">{project.status}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
              
              {/* Recent Invoices */}
              <Card padding="md" className="border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent Invoices</h3>
                  <button onClick={() => setActiveTab('invoices')} className="text-xs text-[#8B5CF6] hover:underline font-semibold">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-white/40">
                        <th className="pb-3 pr-4">Invoice</th>
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4">Amount</th>
                        <th className="pb-3 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {client.invoices?.slice(0, 3).map((invoice: any) => (
                        <tr key={invoice.id} className="text-sm">
                          <td className="py-3 pr-4 font-semibold text-white">{invoice.invoiceId}</td>
                          <td className="py-3 px-4 text-white/50">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-bold text-white">{formatCurrency(invoice.amount)}</td>
                          <td className="py-3 pl-4 text-right">
                            <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'error'} size="sm">
                              {invoice.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {client.invoices?.length === 0 && (
                        <tr><td colSpan={4} className="py-6 text-center text-sm text-white/40">No invoices found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Financial Summary */}
              <Card padding="md" className="border-white/5 bg-black/20">
                <h3 className="text-sm font-bold text-white mb-4">Financials</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Outstanding</span>
                      <span className="font-bold text-[#FBBF24]">{formatCurrency(client.outstandingRevenue)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">Total Paid</span>
                      <span className="font-bold text-[#34D399]">{formatCurrency(client.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Upcoming Meetings */}
              <Card padding="md" className="border-white/5 bg-black/20">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#8B5CF6]" /> Meetings
                </h3>
                <div className="space-y-4">
                  {client.meetings?.slice(0, 3).map((meeting: any) => (
                    <div key={meeting.id} className="relative pl-4 border-l-2 border-[#8B5CF6]/30">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#8B5CF6]"></div>
                      <p className="text-sm font-bold text-white mb-0.5">{meeting.title}</p>
                      <p className="text-xs text-white/40 mb-1">{meeting.time || new Date(meeting.createdAt).toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" size="sm" className="bg-white/5">{meeting.platform}</Badge>
                      </div>
                    </div>
                  ))}
                  {client.meetings?.length === 0 && (
                    <div className="text-sm text-white/40 py-2">No upcoming meetings.</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <Card padding="md" className="border-white/5 bg-black/20">
            <h3 className="text-lg font-bold text-white mb-4">All Projects</h3>
            {client.projects?.length === 0 ? (
              <p className="text-white/40">No projects found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {client.projects?.map((project: any) => (
                  <div key={project.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h4 className="font-bold text-white mb-2">{project.name}</h4>
                    <Badge variant="lime" size="sm" className="mb-4">{project.status}</Badge>
                    <p className="text-xs text-white/40 mb-2">Progress: {project.progress}%</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#34D399] rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <Card padding="md" className="border-white/5 bg-black/20">
            <h3 className="text-lg font-bold text-white mb-4">All Invoices</h3>
            {client.invoices?.length === 0 ? (
              <p className="text-white/40">No invoices found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {client.invoices?.map((invoice: any) => (
                  <div key={invoice.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">{invoice.invoiceId}</h4>
                      <p className="text-xs text-white/40">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white mb-1">{formatCurrency(invoice.amount)}</p>
                      <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'error'} size="sm">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* MEETINGS TAB */}
        {activeTab === 'meetings' && (
          <Card padding="md" className="border-white/5 bg-black/20">
            <h3 className="text-lg font-bold text-white mb-4">All Meetings</h3>
            {client.meetings?.length === 0 ? (
              <p className="text-white/40">No meetings found.</p>
            ) : (
              <div className="space-y-4">
                {client.meetings?.map((meeting: any) => (
                  <div key={meeting.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">{meeting.title}</h4>
                      <p className="text-xs text-white/40">{meeting.time || new Date(meeting.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge variant="default">{meeting.platform}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

      </div>
    </div>
  );
}
