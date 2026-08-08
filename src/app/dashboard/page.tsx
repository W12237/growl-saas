'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, Badge, Avatar, Skeleton } from '@/components/ui';
import { formatRelativeTime } from '@/lib/formatters';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// ── Animated Counter ──
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ── Sparkline Mini Chart ──
function Sparkline({ data, color = '#B6FF2E', width = 80, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <polygon
        fill={`url(#spark-${color.replace('#', '')})`}
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  );
}

// ── Activity Icon ──
function ActivityIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    project_added: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
    invoice_paid: 'bg-[#34D399]/15 text-[#34D399]',
    expense_logged: 'bg-[#F87171]/15 text-[#F87171]',
    default: 'bg-white/10 text-white/50',
  };

  const icons: Record<string, React.ReactNode> = {
    project_added: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    invoice_paid: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    expense_logged: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    default: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  };

  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[type] || colors.default}`}>
      {icons[type] || icons.default}
    </div>
  );
}

// ── Meeting Type Icon ──
function MeetingIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    google_meet: 'text-[#34D399]',
    zoom: 'text-[#60A5FA]',
    teams: 'text-[#8B5CF6]',
    in_person: 'text-[#FBBF24]',
  };
  return (
    <span className={`text-xs font-bold uppercase ${colors[type] || 'text-white/50'}`}>
      {type === 'google_meet' ? 'Meet' : type === 'zoom' ? 'Zoom' : type === 'teams' ? 'Teams' : type}
    </span>
  );
}

export default function DashboardPage() {
  const { data: m, isLoading: loading } = useSWR('/api/dashboard', fetcher);
  const { data: auth } = useSWR('/api/auth/me', fetcher);

  if (loading || !m) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <Card key={i}><Skeleton className="h-24" /></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2"><Skeleton className="h-64" /></Card>
          <Card><Skeleton className="h-64" /></Card>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: m.revenue?.current || 0, prefix: '$', change: m.revenue?.change || 0, changeType: m.revenue?.changeType || 'increase', sparkline: m.revenue?.sparkline || [], color: '#B6FF2E' },
    { label: 'Active Clients', value: m.activeClients?.current || 0, change: m.activeClients?.change || 0, changeType: m.activeClients?.changeType || 'increase', sparkline: m.activeClients?.sparkline || [], color: '#8B5CF6' },
    { label: 'Net Profit', value: m.profit?.current || 0, prefix: '$', change: m.profit?.change || 0, changeType: m.profit?.changeType || 'increase', sparkline: m.profit?.sparkline || [], color: '#34D399' },
    { label: 'Tasks Due', value: m.tasksDue?.current || 0, change: Math.abs(m.tasksDue?.change || 0), changeType: m.tasksDue?.changeType || 'decrease', sparkline: m.tasksDue?.sparkline || [], color: '#FBBF24' },
  ];

  const userName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'there';

  return (
    <div style={{ animation: 'fade-in-up 500ms ease-out' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userName}
        </h1>
        <p className="text-sm text-white/40 mt-1">Here&apos;s a live overview of your agency based on your latest data.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, index) => (
          <Card key={kpi.label} hover className="relative overflow-hidden" style={{ animationDelay: `${index * 100}ms`, animation: 'fade-in-up 500ms ease-out backwards' } as React.CSSProperties}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  <AnimatedNumber value={kpi.value} prefix={kpi.prefix || ''} />
                </p>
              </div>
              <Sparkline data={kpi.sparkline} color={kpi.color} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${kpi.changeType === 'increase' ? 'text-[#34D399]' : kpi.changeType === 'decrease' ? 'text-[#F87171]' : 'text-white/40'}`}>
                {kpi.changeType === 'increase' ? '↑' : kpi.changeType === 'decrease' ? '↓' : '→'} {kpi.change}%
              </span>
              <span className="text-[11px] text-white/25">vs last month</span>
            </div>
            {/* Subtle glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: kpi.color }} />
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Campaign Performance Chart */}
        <Card className="lg:col-span-2" style={{ animation: 'fade-in-up 500ms ease-out 400ms backwards' } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Performance</h3>
              <p className="text-xs text-white/30 mt-0.5">Live tracking</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#B6FF2E]" /> This Year</span>
              <span className="flex items-center gap-1.5 text-white/30"><span className="w-2 h-2 rounded-full bg-white/20" /> Last Year</span>
            </div>
          </div>
          <div className="h-48 flex items-end gap-3">
            {m.campaignPerformance?.map((d: any, i: number) => {
              const maxVal = Math.max(...m.campaignPerformance.map((data: any) => data.value));
              const heightPct = (d.value / maxVal) * 100 || 5; // fallback to 5 for visibility
              const prevPct = ((d.previousValue || 0) / maxVal) * 100 || 5;
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1" style={{ animationDelay: `${i * 80}ms`, animation: 'fade-in-up 400ms ease-out backwards' } as React.CSSProperties}>
                  <div className="w-full flex items-end gap-1 h-40">
                    <div className="flex-1 rounded-t-lg bg-white/[0.06] transition-all duration-500" style={{ height: `${prevPct}%` }} />
                    <div className="flex-1 rounded-t-lg bg-gradient-to-t from-[#B6FF2E]/60 to-[#B6FF2E] transition-all duration-500 relative group cursor-pointer hover:from-[#B6FF2E]/80 hover:to-[#B6FF2E]" style={{ height: `${heightPct}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#1E1E1E] border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${(d.value / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-white/25">{d.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI Insights */}
        <Card style={{ animation: 'fade-in-up 500ms ease-out 500ms backwards' } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#B6FF2E]/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B6FF2E" strokeWidth="2" strokeLinecap="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
              </div>
              <h3 className="text-sm font-bold text-white">AI Insights</h3>
            </div>
            <Badge variant="lime" size="sm">Live</Badge>
          </div>
          <div className="space-y-3">
            {m.aiInsights?.map((insight: any) => (
              <div
                key={insight.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    insight.type === 'warning' ? 'bg-[#FBBF24]' :
                    insight.type === 'opportunity' ? 'bg-[#34D399]' :
                    insight.type === 'trend' ? 'bg-[#60A5FA]' :
                    'bg-[#8B5CF6]'
                  }`} />
                  <h4 className="text-xs font-bold text-white">{insight.title}</h4>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{insight.description}</p>
                {insight.actionLabel && (
                  <button className="mt-2 text-[10px] font-bold text-[#B6FF2E] hover:underline">{insight.actionLabel} →</button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Recent Activity */}
        <Card className="lg:col-span-2" style={{ animation: 'fade-in-up 500ms ease-out 600ms backwards' } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Database Activity Log</h3>
            <button className="text-xs text-white/30 hover:text-white/50 font-medium transition-colors">Live Data</button>
          </div>
          <div className="space-y-1">
            {m.recentActivities?.length === 0 ? (
              <div className="text-center text-xs text-white/40 py-4">No recent database activity found. Add some projects or transactions!</div>
            ) : (
              m.recentActivities?.slice(0, 6).map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{activity.title}</p>
                    <p className="text-[11px] text-white/30 truncate">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Avatar name={activity.user.name} size="xs" />
                    <span className="text-[10px] text-white/20 whitespace-nowrap">{formatRelativeTime(activity.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Meetings */}
        <Card style={{ animation: 'fade-in-up 500ms ease-out 700ms backwards' } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Upcoming Meetings</h3>
            <Badge variant="default" size="sm">{m.upcomingMeetings?.length || 0}</Badge>
          </div>
          <div className="space-y-3">
            {m.upcomingMeetings?.length === 0 ? (
              <div className="text-center text-xs text-white/40 py-4">No meetings scheduled.</div>
            ) : (
              m.upcomingMeetings?.map((meeting: any) => (
                <div key={meeting.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-xs font-bold text-white">{meeting.title}</h4>
                    <MeetingIcon type={meeting.platform} />
                  </div>
                  {meeting.client && (
                    <p className="text-[11px] text-white/40 mb-2">{meeting.client}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/25">
                      {new Date(meeting.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex -space-x-1.5">
                      {meeting.attendees?.split(',').slice(0, 3).map((a: string, i: number) => (
                        <Avatar key={i} name={a.trim()} size="xs" />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team Productivity */}
        <Card style={{ animation: 'fade-in-up 500ms ease-out 800ms backwards' } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Team Performance</h3>
            <button className="text-xs text-white/30 hover:text-white/50 font-medium transition-colors">Live Data</button>
          </div>
          <div className="space-y-3">
            {m.teamProductivity?.length === 0 ? (
              <div className="text-center text-xs text-white/40 py-4">Add team members in the Team tab to track performance.</div>
            ) : (
              m.teamProductivity?.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white truncate">{member.name}</span>
                      <span className="text-[11px] font-bold text-white/50">{member.performance}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${member.performance}%`,
                          background: member.performance >= 90 ? '#B6FF2E' : member.performance >= 70 ? '#34D399' : '#F87171',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Approvals + Quick Stats */}
        <Card style={{ animation: 'fade-in-up 500ms ease-out 900ms backwards' } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Quick Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pending Invoices', value: m.pendingApprovals || 0, color: '#FBBF24', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg> },
              { label: 'Active Projects', value: m.activeProjectsCount || 0, color: '#8B5CF6', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
              { label: 'Total Clients', value: m.activeClients?.current || 0, color: '#B6FF2E', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 11 18-5v12L3 14v-3z"/></svg> },
              { label: 'Pipeline Value', value: m.pipelineValue, color: '#34D399', isString: true, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all cursor-pointer">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </div>
                <p className="text-xl font-black text-white">
                  {typeof stat.value === 'number' ? <AnimatedNumber value={stat.value} /> : stat.value}
                </p>
                <p className="text-[11px] text-white/30 mt-0.5 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
