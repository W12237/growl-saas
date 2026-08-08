'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Badge, Avatar, Modal, Input } from '@/components/ui';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  PlayCircle, 
  FolderKanban, 
  User, 
  Calendar, 
  Trash2, 
  X,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const COLUMNS = [
  { id: 'todo', labelKey: 'tasks.status.todo', icon: Clock, color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10' },
  { id: 'in_progress', labelKey: 'tasks.status.in_progress', icon: PlayCircle, color: 'text-[#B6FF2E]', bg: 'bg-[#B6FF2E]/10' },
  { id: 'review', labelKey: 'tasks.status.review', icon: AlertCircle, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  { id: 'completed', labelKey: 'tasks.status.completed', icon: CheckCircle2, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10' },
];

export default function TasksPage() {
  const { t } = useLanguage();

  const { data: auth } = useSWR('/api/auth/me', fetcher);
  const { data: tasks, mutate: mutateTasks, isLoading: tasksLoading } = useSWR('/api/tasks', fetcher, { fallbackData: [] });
  const { data: projects } = useSWR('/api/projects', fetcher, { fallbackData: [] });
  const { data: team } = useSWR('/api/team', fetcher, { fallbackData: [] });

  const isAdmin = auth?.user?.role === 'Admin';
  const currentUser = auth?.user;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  });

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTeam = Array.isArray(team) ? team : [];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      mutateTasks();
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        projectId: safeProjects[0]?.id || '',
        assigneeId: currentUser?.id || '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      mutateTasks(
        safeTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t),
        false
      );

      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      mutateTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      mutateTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
      mutateTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant="error">{t('tasks.priority.urgent')}</Badge>;
      case 'high': return <Badge variant="warning">{t('tasks.priority.high')}</Badge>;
      case 'low': return <Badge variant="info">{t('tasks.priority.low')}</Badge>;
      default: return <Badge variant="lime">{t('tasks.priority.medium')}</Badge>;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/20 flex items-center justify-center text-[#B6FF2E]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{t('tasks.title')}</h1>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm">{t('tasks.subtitle')}</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          {t('tasks.addTask')}
        </Button>
      </div>

      {/* Kanban Task Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
        <div className="flex gap-4 h-full min-w-max pb-2">
          {COLUMNS.map((col) => {
            const ColumnIcon = col.icon;
            const columnTasks = safeTasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className="w-80 flex flex-col rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] p-4 h-full"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border-primary)] shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${col.bg} ${col.color}`}>
                      <ColumnIcon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{t(col.labelKey)}</h3>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] flex items-center justify-center text-xs font-bold text-[var(--color-text-muted)]">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-[var(--color-border-primary)] rounded-xl flex items-center justify-center text-xs text-[var(--color-text-muted)] text-center p-4">
                      {t('tasks.noTasks')}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <Card key={task.id} hover className="p-4 flex flex-col gap-3 relative group border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)]">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-[var(--color-text-primary)] text-sm leading-snug">{task.title}</h4>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteTask(task.id)} 
                              className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-400 transition-opacity p-1"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Project Badge & Priority */}
                        <div className="flex flex-wrap items-center gap-2">
                          {task.project && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-growl-lime)]/10 text-[var(--color-growl-lime)] border border-[var(--color-growl-lime)]/20">
                              <FolderKanban className="w-3 h-3" />
                              {task.project.name}
                            </span>
                          )}
                          {getPriorityBadge(task.priority)}
                        </div>

                        {/* Footer: Assignee & Move Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-primary)] mt-1">
                          <div className="flex items-center gap-2">
                            <Avatar name={task.assignee?.name || 'Unassigned'} src={task.assignee?.avatar} size="xs" />
                            <span className="text-xs font-medium text-[var(--color-text-muted)] truncate max-w-[100px]">
                              {task.assignee?.name || 'Unassigned'}
                            </span>
                          </div>

                          <select 
                            value={task.status} 
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                            className="text-[10px] bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg px-2 py-1 text-[var(--color-text-primary)] cursor-pointer focus:outline-none"
                          >
                            <option value="todo">{t('tasks.status.todo')}</option>
                            <option value="in_progress">{t('tasks.status.in_progress')}</option>
                            <option value="review">{t('tasks.status.review')}</option>
                            <option value="completed">{t('tasks.status.completed')}</option>
                          </select>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Task Assignment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('tasks.addTask')}>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              {t('tasks.taskTitle')} *
            </label>
            <Input 
              required
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              placeholder="E.g., Implement Stripe Invoice webhook API..." 
              className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                {t('tasks.selectProject')}
              </label>
              <select 
                value={formData.projectId} 
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full h-10 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="">-- No Project --</option>
                {safeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                {t('tasks.selectAssignee')}
              </label>
              <select 
                value={formData.assigneeId} 
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full h-10 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="">-- Unassigned --</option>
                {safeTeam.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                {t('tasks.priority')}
              </label>
              <select 
                value={formData.priority} 
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-10 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="low">{t('tasks.priority.low')}</option>
                <option value="medium">{t('tasks.priority.medium')}</option>
                <option value="high">{t('tasks.priority.high')}</option>
                <option value="urgent">{t('tasks.priority.urgent')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                {t('tasks.dueDate')}
              </label>
              <Input 
                type="date"
                value={formData.dueDate} 
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
                className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              {t('tasks.description')}
            </label>
            <textarea 
              rows={3}
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Provide technical requirements, links, or expectations..." 
              className="w-full rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-primary)]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t('settings.saving') : t('tasks.addTask')}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
