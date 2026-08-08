'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import { 
  ClipboardList, 
  Plus, 
  MoreVertical,
  Calendar,
  Flag,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  PlayCircle
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const COLUMNS = [
  { id: 'planning', title: 'Planning', icon: Clock, color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10' },
  { id: 'active', title: 'Active', icon: PlayCircle, color: 'text-[#B6FF2E]', bg: 'bg-[#B6FF2E]/10' },
  { id: 'review', title: 'In Review', icon: Flag, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10' },
];

export default function ProjectsPage() {
  const { data: projects, mutate, isLoading } = useSWR('/api/projects', fetcher, { fallbackData: [] });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    status: 'planning',
    progress: '0',
    priority: 'medium',
    dueDate: '',
    team: ''
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      mutate();
      setIsModalOpen(false);
      setFormData({ name: '', client: '', status: 'planning', progress: '0', priority: 'medium', dueDate: '', team: '' });
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
      });
      mutate();
      setOpenMenuId(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const updateProjectStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      mutate();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-[#F87171]';
      case 'medium': return 'bg-[#F59E0B]';
      case 'low': return 'bg-[#60A5FA]';
      default: return 'bg-white/50';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)] text-[#8B5CF6]">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Projects</h1>
          </div>
          <p className="text-white/40 text-sm">Manage all your agency projects with this dynamic Kanban board.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            New Project
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {COLUMNS.map(column => {
            const columnProjects = Array.isArray(projects) ? projects.filter((p: any) => p.status === column.id) : [];
            const Icon = column.icon;
            
            return (
              <div key={column.id} className="w-80 flex flex-col h-full bg-black/20 border border-white/5 rounded-2xl overflow-hidden shrink-0">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${column.bg} ${column.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-white">{column.title}</h3>
                  </div>
                  <Badge variant="default" size="sm" className="bg-white/5 border-white/10 text-white/50">{columnProjects.length}</Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                  {isLoading ? (
                    <div className="animate-pulse h-32 bg-white/5 rounded-xl border border-white/5"></div>
                  ) : columnProjects.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-xs font-semibold text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                      Drop projects here
                    </div>
                  ) : (
                    columnProjects.map((project: any) => (
                      <div 
                        key={project.id} 
                        className="bg-[#1A1A1A] border border-white/10 hover:border-white/20 rounded-xl p-4 shadow-xl group transition-all"
                      >
                        <div className="flex items-start justify-between mb-2 relative">
                          <div className="flex gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${getPriorityColor(project.priority)}`} title={`${project.priority} priority`} />
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-[#8B5CF6] transition-colors line-clamp-1">{project.name}</h4>
                              <p className="text-[10px] font-semibold text-white/40">{project.client}</p>
                            </div>
                          </div>
                          
                          <button 
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors shrink-0"
                            onClick={() => setOpenMenuId(openMenuId === project.id ? null : project.id)}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                          
                          {openMenuId === project.id && (
                            <div className="absolute right-0 top-6 w-40 bg-[#222] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                              <div className="px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-wider bg-black/20">Move to...</div>
                              {COLUMNS.filter(c => c.id !== project.status).map(c => (
                                <button 
                                  key={c.id}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors"
                                  onClick={() => {
                                    updateProjectStatus(project.id, c.id);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  {c.title}
                                </button>
                              ))}
                              <div className="h-px bg-white/10 my-1"></div>
                              <button 
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#F87171] hover:bg-[#F87171]/10 flex items-center gap-2 transition-colors"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 mb-3">
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Progress</span>
                            <span className="text-[10px] font-bold text-white">{project.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#B6FF2E]" style={{ width: `${project.progress}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/40">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          
                          {/* Attendees Avatars */}
                          <div className="flex -space-x-1.5">
                            {project.team && project.team.split(',').map((member: string, i: number) => (
                              <div key={i} className="w-6 h-6 rounded-full border border-[#1A1A1A] bg-black/60 flex items-center justify-center text-[8px] font-bold text-white shadow-sm" title={member.trim()}>
                                {member.trim().substring(0,2).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Client</label>
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
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
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
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Initial Progress (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={e => setFormData({...formData, progress: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Team (Comma Separated)</label>
                <input 
                  type="text" 
                  value={formData.team}
                  onChange={e => setFormData({...formData, team: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Mike, Sarah, Elena"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
