'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  Calendar as CalendarIcon, 
  MessageCircle, 
  Briefcase, 
  FileText, 
  Clock, 
  MoreVertical,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ContentPost {
  id: string;
  platform: string;
  content: string;
  status: string;
  scheduledDate?: string;
}

interface ContentListProps {
  posts: ContentPost[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onNewPost: () => void;
}

export function ContentList({ posts, isLoading, onDelete, onNewPost }: ContentListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <MessageCircle className="w-3 h-3 text-[#1DA1F2]" />;
      case 'linkedin': return <Briefcase className="w-3 h-3 text-[#0A66C2]" />;
      default: return <FileText className="w-3 h-3 text-white/50" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20';
      case 'published': return 'bg-white/5 text-white/50 border border-white/10';
      default: return 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20';
    }
  };

  // --- Calendar Logic ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i); // Adjust for Monday start, etc. Let's stick to Sunday start (firstDay directly)
  const actualPadding = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPostsForDay = (day: number) => {
    if (!Array.isArray(posts)) return [];
    return posts.filter(post => {
      if (!post.scheduledDate) return false;
      const postDate = new Date(post.scheduledDate);
      return postDate.getDate() === day && postDate.getMonth() === month && postDate.getFullYear() === year;
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card padding="lg" className="hidden lg:flex flex-1 flex-col border-white/5 bg-black/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 relative z-10 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-[#8B5CF6]" />
            Content Calendar
          </h1>
          <p className="text-sm text-white/40 mt-1">Review, approve, and manage your scheduled posts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-1">
            {['list', 'grid', 'calendar'].map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${viewMode === mode ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={onNewPost}>New Post</Button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10 min-h-0`}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#8B5CF6] animate-spin"></div>
          </div>
        ) : viewMode === 'calendar' ? (
          // CALENDAR VIEW
          <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white">{monthNames[month]} {year}</h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] bg-white/5 gap-[1px]">
              {weekDays.map(day => (
                <div key={day} className="bg-black/60 p-3 text-center text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {day}
                </div>
              ))}
              
              {/* Padding days */}
              {actualPadding.map((_, i) => (
                <div key={`pad-${i}`} className="bg-black/40 min-h-[100px]" />
              ))}
              
              {/* Actual days */}
              {days.map(day => {
                const dayPosts = getPostsForDay(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                
                return (
                  <div key={day} className="bg-black/60 p-2 min-h-[120px] transition-colors hover:bg-white/[0.02] group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                        isToday ? 'bg-[#8B5CF6] text-white' : 'text-white/50 group-hover:text-white'
                      }`}>
                        {day}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      {dayPosts.map(post => (
                        <div key={post.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-md p-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors" title={post.content}>
                          {getPlatformIcon(post.platform)}
                          <span className="text-white/80 font-medium truncate flex-1">{post.platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Fill remaining cells to complete the grid visually */}
              {Array.from({ length: (7 - ((actualPadding.length + days.length) % 7)) % 7 }).map((_, i) => (
                <div key={`pad-end-${i}`} className="bg-black/40 min-h-[100px]" />
              ))}
            </div>
          </div>
        ) : (!Array.isArray(posts) || posts.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-semibold text-white/50">No content scheduled yet.</p>
            <p className="text-xs mt-1">Use the AI Assistant to generate and save your first post.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4 auto-rows-max' : 'space-y-4'}>
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] rounded-2xl p-5 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                      {getPlatformIcon(post.platform)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#B6FF2E] transition-colors">{post.platform} Post</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-white/30" /> 
                        <span className="text-[10px] font-medium text-white/40">
                          {post.scheduledDate ? new Date(post.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Unscheduled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(post.status)}`}>
                      {post.status}
                    </div>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === post.id && (
                      <div className="absolute right-0 top-full mt-2 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#F87171] hover:bg-white/5 flex items-center gap-2 transition-colors"
                          onClick={() => {
                            onDelete(post.id);
                            setOpenMenuId(null);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`text-sm text-white/70 bg-black/40 p-4 rounded-xl border border-white/5 leading-relaxed relative z-10 ${viewMode === 'grid' ? 'line-clamp-4' : ''}`}>
                  {post.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
