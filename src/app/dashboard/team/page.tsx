'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Button, Avatar, Badge, Modal } from '@/components/ui';
import { 
  Users, 
  Plus, 
  MoreVertical,
  Mail,
  Activity,
  Trash2,
  X,
  UserCheck,
  Star,
  Shield
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function TeamPage() {
  const { data: auth } = useSWR('/api/auth/me', fetcher, { fallbackData: null });
  const { data: team, mutate, isLoading } = useSWR('/api/team', fetcher, { fallbackData: [] });
  const { data: policies } = useSWR(auth?.user?.role === 'Admin' ? '/api/policies' : null, fetcher, { fallbackData: [] });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    department: 'Creative',
    status: 'offline',
    performance: '100',
    policyIds: [] as string[]
  });

  const [formError, setFormError] = useState('');

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add team member');
      }

      mutate();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Member', department: 'Creative', status: 'offline', performance: '100', policyIds: [] });
    } catch (err: any) {
      console.error('Failed to add team member:', err);
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await fetch(`/api/team?id=${id}`, {
        method: 'DELETE',
      });
      mutate();
      setOpenMenuId(null);
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
  };

  const handlePolicyAction = async (userId: string, policyId: string, action: 'assign' | 'remove') => {
    try {
      await fetch('/api/policies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, policyId, action })
      });
      mutate();
    } catch (err) {
      console.error('Failed to manage policy:', err);
    }
  };

  const safeTeam = Array.isArray(team) ? team : [];
  const safePolicies = Array.isArray(policies) ? policies : [];
  const isAdmin = auth?.user?.role === 'Admin';
  
  const activeCount = safeTeam.filter(m => m.status === 'online').length;
  const avgPerformance = safeTeam.length > 0 
    ? Math.round(safeTeam.reduce((acc, m) => acc + (m.performance || 0), 0) / safeTeam.length)
    : 0;

  const selectedUser = safeTeam.find(u => u.id === selectedUserId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)] text-[#8B5CF6]">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Team Directory</h1>
          </div>
          <p className="text-white/40 text-sm">Manage your agency members, roles, and track performance.</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
              Add Member
            </Button>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <Card padding="md" className="bg-black/20 border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1">Total Members</p>
            <h3 className="text-2xl font-black text-white">{safeTeam.length}</h3>
          </div>
        </Card>
        
        <Card padding="md" className="bg-black/20 border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-[#34D399]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1">Active Now</p>
            <h3 className="text-2xl font-black text-white">{activeCount}</h3>
          </div>
        </Card>

        <Card padding="md" className="bg-black/20 border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-1">Avg Performance</p>
            <h3 className="text-2xl font-black text-white">{avgPerformance}%</h3>
          </div>
        </Card>
      </div>

      {/* Team Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center h-48">
              <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin"></div>
            </div>
          ) : safeTeam.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-48 text-white/30 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <Users className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-semibold text-white/50 text-sm">No team members found.</p>
            </div>
          ) : (
            safeTeam.map((member: any) => (
              <Card 
                key={member.id} 
                padding="lg" 
                className="bg-black/30 border-white/5 hover:border-white/10 transition-all group flex flex-col relative"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === member.id ? null : member.id);
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {openMenuId === member.id && (
                      <div className="absolute right-0 top-10 w-40 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                        <button 
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 flex items-center gap-2 transition-colors"
                          onClick={() => {
                            setSelectedUserId(member.id);
                            setIsPolicyModalOpen(true);
                            setOpenMenuId(null);
                          }}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Manage Policies
                        </button>
                        <button 
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#F87171] hover:bg-white/5 flex items-center gap-2 transition-colors"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove User
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-4 mb-5">
                  <div className="relative">
                    <Avatar name={member.name} size="lg" className="shadow-lg" />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                      member.status === 'online' ? 'bg-[#34D399]' : 
                      member.status === 'busy' ? 'bg-[#F87171]' : 'bg-[#6B7280]'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1 pr-8">{member.name}</h3>
                    <p className="text-xs font-semibold text-[#8B5CF6] mb-1">{member.role}</p>
                    <Badge variant="default" size="sm" className="bg-white/5 text-white/40 border-white/10 text-[10px]">
                      {member.department || 'General'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{member.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {member.userPolicies?.length > 0 
                        ? member.userPolicies.map((up: any) => up.policy.name).join(', ')
                        : 'No policies assigned'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Performance
                    </span>
                    <span className="text-xs font-bold text-white">{member.performance}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full ${member.performance >= 90 ? 'bg-[#34D399]' : member.performance >= 70 ? 'bg-[#F59E0B]' : 'bg-[#F87171]'}`} 
                      style={{ width: `${member.performance}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Policy Management Modal */}
      <Modal open={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} title="Manage User Policies">
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm text-white/50 mb-4">
              Assign or remove access policies for <strong>{selectedUser.name}</strong>.
            </p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {safePolicies.map((policy: any) => {
                const isAssigned = selectedUser.userPolicies?.some((up: any) => up.policy.id === policy.id);
                
                return (
                  <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{policy.name}</h4>
                        {policy.isSystem && <Badge variant="default" className="text-[9px] py-0">System</Badge>}
                      </div>
                      <p className="text-xs text-white/40 mt-1">{policy.description}</p>
                    </div>
                    <Button 
                      variant={isAssigned ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handlePolicyAction(selectedUser.id, policy.id, isAssigned ? 'remove' : 'assign')}
                    >
                      {isAssigned ? 'Remove' : 'Assign'}
                    </Button>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-white/10 mt-4">
              <Button variant="ghost" onClick={() => setIsPolicyModalOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Team Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMember} className="space-y-4">
              {formError && (
                <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-xs font-semibold text-[#F87171]">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Sarah Connor"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="sarah@agency.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="Leave blank if not granting login access"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Department</label>
                  <select 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none"
                  >
                    <option value="Creative">Creative</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Management">Management</option>
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
                    <option value="online">Online</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Initial Performance</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.performance}
                    onChange={e => setFormData({...formData, performance: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Access Policies</label>
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                  {safePolicies.map((policy: any) => (
                    <label key={policy.id} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-white/[0.02] transition-colors">
                      <input 
                        type="checkbox"
                        checked={formData.policyIds.includes(policy.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, policyIds: [...formData.policyIds, policy.id] });
                          } else {
                            setFormData({ ...formData, policyIds: formData.policyIds.filter(id => id !== policy.id) });
                          }
                        }}
                        className="mt-0.5 rounded bg-black/40 border-white/20 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{policy.name}</div>
                        <div className="text-[10px] text-white/40">{policy.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
