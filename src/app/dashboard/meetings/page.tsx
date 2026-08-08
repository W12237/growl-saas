'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Video, 
  Clock, 
  Users, 
  Plus, 
  Link as LinkIcon, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MonitorPlay,
  X,
  Trash2,
  CalendarDays
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MeetingsPage() {
  const { data: meetings, mutate, isLoading } = useSWR('/api/meetings', fetcher, { fallbackData: [] });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    time: '',
    platform: 'Zoom',
    link: '',
    attendees: ''
  });
  
  // Basic calendar logic for visual purposes
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      mutate();
      setIsScheduleModalOpen(false);
      setFormData({ title: '', client: '', time: '', platform: 'Zoom', link: '', attendees: '' });
    } catch (err) {
      console.error('Failed to schedule meeting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await fetch(`/api/meetings?id=${id}`, {
        method: 'DELETE',
      });
      mutate();
      setOpenMenuId(null);
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)] text-[#8B5CF6]">
              <Video className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Meetings</h1>
          </div>
          <p className="text-white/40 text-sm">Schedule client calls, manage links, and review AI meeting summaries.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<LinkIcon className="w-4 h-4" />} onClick={() => setIsConnectModalOpen(true)}>
            Connect Calendar
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsScheduleModalOpen(true)}>
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 flex-col lg:flex-row">
        
        {/* Left Side: Calendar & Mini Stats */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          <Card padding="md" className="border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">{monthNames[month]} {year}</h2>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {weekDays.map(day => (
                <div key={day} className="text-white/30 font-semibold py-1">{day}</div>
              ))}
              {padding.map((_, i) => (
                <div key={`pad-${i}`} className="py-1.5"></div>
              ))}
              {days.map(day => {
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                const hasMeeting = day === 10 || day === 15 || day === 22; // Mock meeting indicators
                
                return (
                  <div key={day} className="relative flex items-center justify-center py-1.5 cursor-pointer group">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium transition-all ${
                      isToday 
                        ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' 
                        : 'text-white/70 hover:bg-white/10 group-hover:text-white'
                    }`}>
                      {day}
                    </span>
                    {hasMeeting && !isToday && (
                      <div className="absolute bottom-1 w-1 h-1 bg-[#B6FF2E] rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card padding="md" className="border-white/5 bg-black/20 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B6FF2E]/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4 relative z-10">AI Insights</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#B6FF2E]/10 flex items-center justify-center text-[#B6FF2E] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Follow-up Reminder</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed">You have 3 action items pending from yesterday's sync with Stark Industries.</p>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#34D399]/10 flex items-center justify-center text-[#34D399] shrink-0">
                  <MonitorPlay className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Recording Ready</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed">The AI summary and transcript for Wayne Enterprises is now available.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Meeting List */}
        <Card padding="none" className="flex-1 flex flex-col border-white/5 bg-black/20 overflow-hidden relative">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>
          
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2 relative z-10">
            <button className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold">Upcoming</button>
            <button className="px-4 py-1.5 rounded-lg text-white/40 hover:text-white/60 text-xs font-semibold transition-colors">Past Meetings</button>
            <button className="px-4 py-1.5 rounded-lg text-white/40 hover:text-white/60 text-xs font-semibold transition-colors">Recordings</button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin"></div>
              </div>
            ) : (!Array.isArray(meetings) || meetings.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-40 text-white/30 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <CalendarDays className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-semibold text-white/50 text-sm">No meetings scheduled.</p>
                <p className="text-xs mt-1">Click "Schedule Meeting" to get started.</p>
              </div>
            ) : (
              meetings.map((meeting: any) => (
                <div 
                  key={meeting.id} 
                  className="bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] rounded-2xl p-5 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        variant={meeting.status === 'upcoming' ? 'info' : 'default'} 
                        size="sm" 
                        className={meeting.status === 'upcoming' ? 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/20' : 'bg-white/5 text-white/40 border-white/10'}
                      >
                        {meeting.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </Badge>
                      <span className="text-[11px] font-semibold text-white/30 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {meeting.time}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white group-hover:text-[#8B5CF6] transition-colors mb-1">
                      {meeting.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-white/30" />
                        {meeting.client}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-white/30" />
                        {meeting.platform}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Attendees Avatars */}
                    <div className="flex -space-x-2">
                      {meeting.attendees && meeting.attendees.split(',').map((att: string, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10" title={att.trim()}>
                          {att.trim().substring(0,2).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 relative">
                      {meeting.status === 'upcoming' ? (
                        <a href={meeting.link || '#'} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition-colors flex items-center gap-2">
                          <Video className="w-4 h-4" /> Join Call
                        </a>
                      ) : (
                        <div className="flex gap-2">
                          {meeting.hasAiSummary && (
                            <Button variant="outline" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />} className="text-[#B6FF2E] border-[#B6FF2E]/20 hover:bg-[#B6FF2E]/10">
                              Summary
                            </Button>
                          )}
                          {meeting.hasRecording && (
                            <Button variant="outline" size="sm" icon={<MonitorPlay className="w-3.5 h-3.5" />}>
                              Recording
                            </Button>
                          )}
                        </div>
                      )}
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors ml-1"
                        onClick={() => setOpenMenuId(openMenuId === meeting.id ? null : meeting.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openMenuId === meeting.id && (
                        <div className="absolute right-0 top-10 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-[#F87171] hover:bg-white/5 flex items-center gap-2 transition-colors"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Schedule Meeting</h2>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Meeting Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Q3 Strategy Review"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.client}
                    onChange={e => setFormData({...formData, client: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Platform</label>
                  <select 
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Teams">Microsoft Teams</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Time/Date</label>
                <input 
                  type="text" 
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Tomorrow, 2:00 PM - 3:00 PM"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Attendees (Comma Separated)</label>
                <input 
                  type="text" 
                  value={formData.attendees}
                  onChange={e => setFormData({...formData, attendees: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Sarah J, Mike R, Tom"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Meeting Link (Optional)</label>
                <input 
                  type="url" 
                  value={formData.link}
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Scheduling...' : 'Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Calendar Modal (Mock UI) */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mx-auto mb-4 text-[#8B5CF6]">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Calendar</h2>
            <p className="text-sm text-white/50 mb-6 px-4">
              Sync your Google Calendar or Outlook to automatically import your meetings and generate AI summaries.
            </p>
            
            <div className="space-y-3 mb-6">
              <button onClick={() => { setIsConnectModalOpen(false); alert("Calendar connected successfully!"); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Connect Google Calendar
              </button>
              <button onClick={() => { setIsConnectModalOpen(false); alert("Calendar connected successfully!"); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#00a4ef" d="M11.4 24l-11.4-1.6v-20.8l11.4-1.6v24z"/><path fill="#00a4ef" d="M12.6 0l11.4 1.6v20.8l-11.4 1.6v-24z"/></svg>
                Connect Microsoft Outlook
              </button>
            </div>
            
            <Button variant="ghost" className="w-full" onClick={() => setIsConnectModalOpen(false)}>Maybe Later</Button>
          </div>
        </div>
      )}

    </div>
  );
}
