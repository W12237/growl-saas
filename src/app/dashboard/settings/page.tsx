'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, Button, Badge, Avatar, Modal } from '@/components/ui';
import { 
  Settings as SettingsIcon,
  User,
  Users,
  Palette,
  Globe,
  Bell,
  CreditCard,
  Shield,
  Save,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  Activity,
  History,
  Edit3,
  Key,
  Trash2,
  Plus,
  X,
  ChevronDown,
  Lock
} from 'lucide-react';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { data: auth } = useSWR('/api/auth/me', fetcher);
  const isAdmin = auth?.user?.role === 'Admin';

  const SETTINGS_TABS = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'security', label: 'Security & Audit', icon: Shield },
    ...(isAdmin ? [{ id: 'users', label: 'Users & Roles', icon: Users }] : []),
  ];

  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaving, setIsSaving] = useState(false);
  
  // States to persist in local storage
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('purple');

  const { data: auditLogs, isLoading: isLoadingLogs } = useSWR(
    activeTab === 'security' && isAdmin ? '/api/audit' : null, 
    fetcher,
    { fallbackData: [] }
  );

  // Users & Roles data
  const { data: teamData, mutate: mutateTeam } = useSWR(
    activeTab === 'users' && isAdmin ? '/api/team' : null,
    fetcher,
    { fallbackData: [] }
  );
  const { data: policiesData, mutate: mutatePolicies } = useSWR(
    activeTab === 'users' && isAdmin ? '/api/policies' : null,
    fetcher,
    { fallbackData: [] }
  );

  const team = Array.isArray(teamData) ? teamData : [];
  const policies = Array.isArray(policiesData) ? policiesData : [];

  // User editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editPolicyIds, setEditPolicyIds] = useState<string[]>([]);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Policy creation state
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyDesc, setNewPolicyDesc] = useState('');
  const [newPolicyPerms, setNewPolicyPerms] = useState<string[]>([]);

  // Profile states
  const [profileName, setProfileName] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileUpdateMsg, setProfileUpdateMsg] = useState('');

  // Sync profile data when auth loads
  useEffect(() => {
    if (auth?.user) {
      setProfileName(auth.user.name || '');
      setProfileTitle(auth.user.title || '');
      setProfileAvatar(auth.user.avatar || '');
    }
  }, [auth]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileUpdateMsg('');
    try {
      const payload: any = { name: profileName, title: profileTitle, avatar: profileAvatar };
      if (profilePassword) payload.password = profilePassword;
      
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setProfileUpdateMsg('Profile updated successfully!');
      setProfilePassword(''); // clear password field
      // reload window to get new token data in useSWR
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setProfileUpdateMsg('Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/team?id=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      mutateTeam();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('agency_theme');
    const savedLanguage = localStorage.getItem('agency_language');
    const savedAccent = localStorage.getItem('agency_accent');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedAccent) setAccentColor(savedAccent);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('agency_theme', theme);
      localStorage.setItem('agency_language', language);
      localStorage.setItem('agency_accent', accentColor);
      setIsSaving(false);
      window.dispatchEvent(new Event('theme-changed'));
    }, 800);
  };

  // ── User Management Handlers ──
  const startEditUser = (user: any) => {
    setEditingUserId(user.id);
    setEditRole(user.role || 'Member');
    setEditPolicyIds(user.userPolicies?.map((up: any) => up.policy.id) || []);
    setUpdateMessage('');
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditRole('');
    setEditPolicyIds([]);
    setUpdateMessage('');
  };

  const saveUserChanges = async (userId: string) => {
    setIsUpdating(true);
    setUpdateMessage('');
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: editRole, policyIds: editPolicyIds }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUpdateMessage('User updated successfully');
      mutateTeam();
      setTimeout(() => {
        cancelEditUser();
      }, 1000);
    } catch {
      setUpdateMessage('Error updating user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !newPassword || newPassword.length < 6) {
      setUpdateMessage('Password must be at least 6 characters');
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetPasswordUserId, password: newPassword }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
      setUpdateMessage('Password reset successfully');
      setNewPassword('');
      setTimeout(() => {
        setResetPasswordUserId(null);
        setUpdateMessage('');
      }, 1500);
    } catch {
      setUpdateMessage('Error resetting password');
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePolicyId = (policyId: string) => {
    setEditPolicyIds(prev => 
      prev.includes(policyId) 
        ? prev.filter(id => id !== policyId) 
        : [...prev, policyId]
    );
  };

  const handleCreatePolicy = async () => {
    if (!newPolicyName.trim()) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPolicyName,
          description: newPolicyDesc,
          permissions: newPolicyPerms,
        }),
      });
      if (!res.ok) throw new Error('Failed to create policy');
      mutatePolicies();
      setNewPolicyName('');
      setNewPolicyDesc('');
      setNewPolicyPerms([]);
      setShowCreatePolicy(false);
    } catch {
      setUpdateMessage('Error creating policy');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      const res = await fetch(`/api/policies?id=${policyId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete policy');
        return;
      }
      mutatePolicies();
      mutateTeam();
    } catch {
      alert('Error deleting policy');
    }
  };

  // All available permissions for creating policies
  const AVAILABLE_PERMISSIONS = [
    { id: 'read:*', label: 'Read All' },
    { id: 'create:project', label: 'Create Projects' },
    { id: 'create:lead', label: 'Create Leads' },
    { id: 'create:campaign', label: 'Create Campaigns' },
    { id: 'create:approval', label: 'Create Approvals' },
    { id: 'create:content', label: 'Create Content' },
    { id: 'create:meeting', label: 'Create Meetings' },
    { id: 'create:report', label: 'Create Reports' },
    { id: 'create:automation', label: 'Create Automations' },
    { id: 'create:file', label: 'Upload Files' },
    { id: 'update:own', label: 'Edit Own Resources' },
    { id: 'update:*', label: 'Edit All Resources' },
    { id: 'delete:own', label: 'Delete Own Resources' },
    { id: 'delete:*', label: 'Delete All Resources' },
    { id: '*', label: 'Full Access (Wildcard)' },
  ];


  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" style={{ animation: 'fade-in-up 500ms ease-out' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.15)] text-[#8B5CF6]">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
          </div>
          <p className="text-white/40 text-sm">Manage your workspace preferences, appearance, and billing.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab !== 'users' && (
            <Button variant="primary" icon={isSaving ? undefined : <Save className="w-4 h-4" />} onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {SETTINGS_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold w-full text-left ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B5CF6]' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
          <Card padding="lg" className="border-white/5 bg-black/20 min-h-full">
            
            {/* ---------------- APPEARANCE TAB ---------------- */}
            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Appearance</h2>
                  <p className="text-sm text-white/40 mb-6">Customize how the dashboard looks on your device.</p>
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Theme Preference</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Dark Mode */}
                      <button 
                        onClick={() => {
                          setTheme('dark');
                          localStorage.setItem('agency_theme', 'dark');
                          window.dispatchEvent(new Event('theme-changed'));
                        }}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          theme === 'dark' ? 'border-[var(--color-growl-lime)] bg-[var(--color-growl-lime)]/10' : 'border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)]'
                        }`}
                      >
                        {theme === 'dark' && <div className="absolute top-3 right-3 text-[var(--color-growl-lime)]"><CheckCircle2 className="w-4 h-4" /></div>}
                        <div className="w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white">
                          <Moon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Dark Mode</span>
                      </button>

                      {/* Light Mode */}
                      <button 
                        onClick={() => {
                          setTheme('light');
                          localStorage.setItem('agency_theme', 'light');
                          window.dispatchEvent(new Event('theme-changed'));
                        }}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          theme === 'light' ? 'border-[var(--color-growl-lime)] bg-[var(--color-growl-lime)]/10' : 'border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)]'
                        }`}
                      >
                        {theme === 'light' && <div className="absolute top-3 right-3 text-[var(--color-growl-lime)]"><CheckCircle2 className="w-4 h-4" /></div>}
                        <div className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-black shadow-sm">
                          <Sun className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">Light Mode</span>
                      </button>

                      {/* System */}
                      <button 
                        onClick={() => {
                          setTheme('system');
                          localStorage.setItem('agency_theme', 'system');
                          window.dispatchEvent(new Event('theme-changed'));
                        }}
                        className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          theme === 'system' ? 'border-[var(--color-growl-lime)] bg-[var(--color-growl-lime)]/10' : 'border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)]'
                        }`}
                      >
                        {theme === 'system' && <div className="absolute top-3 right-3 text-[var(--color-growl-lime)]"><CheckCircle2 className="w-4 h-4" /></div>}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#111] to-white border border-white/20 flex items-center justify-center text-white mix-blend-difference">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-[var(--color-text-primary)]">System Default</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Accent Color</h3>
                    <div className="flex gap-4">
                      {[
                        { id: 'green', color: 'bg-[#B6FF2E]' },
                        { id: 'purple', color: 'bg-[#8B5CF6]' },
                        { id: 'blue', color: 'bg-[#3B82F6]' },
                        { id: 'rose', color: 'bg-[#F43F5E]' },
                        { id: 'gold', color: 'bg-[#F59E0B]' },
                        { id: 'teal', color: 'bg-[#14B8A6]' },
                      ].map(accent => (
                        <button
                          key={accent.id}
                          onClick={() => {
                            setAccentColor(accent.id);
                            document.documentElement.setAttribute('data-accent', accent.id);
                            localStorage.setItem('agency_accent', accent.id);
                            window.dispatchEvent(new Event('theme-changed'));
                          }}
                          className={`w-10 h-10 rounded-full transition-transform ${accent.color} ${
                            accentColor === accent.id ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-110' : 'hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- LANGUAGE TAB ---------------- */}
            {activeTab === 'language' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Language & Region</h2>
                  <p className="text-sm text-white/40 mb-6">Select your primary language and regional settings.</p>
                  
                  <div className="space-y-6 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">{t('settings.selectLang')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => {
                            setLanguage('en');
                            localStorage.setItem('agency_lang', 'en');
                          }}
                          className={`relative p-4 rounded-xl border transition-all flex items-center gap-4 text-left ${
                            language === 'en' ? 'border-[var(--color-growl-lime)] bg-[var(--color-growl-lime)]/10' : 'border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)]'
                          }`}
                        >
                          <div className="w-8 h-8 rounded bg-[var(--color-bg-tertiary)] flex items-center justify-center font-black text-[var(--color-text-primary)]">EN</div>
                          <div>
                            <div className="text-sm font-bold text-[var(--color-text-primary)]">English</div>
                            <div className="text-xs text-[var(--color-text-muted)]">United States</div>
                          </div>
                          {language === 'en' && <CheckCircle2 className="w-4 h-4 text-[var(--color-growl-lime)] absolute ltr:right-4 rtl:left-4" />}
                        </button>
                        
                        <button 
                          onClick={() => {
                            setLanguage('ar');
                            localStorage.setItem('agency_lang', 'ar');
                          }}
                          className={`relative p-4 rounded-xl border transition-all flex items-center gap-4 text-left ${
                            language === 'ar' ? 'border-[var(--color-growl-lime)] bg-[var(--color-growl-lime)]/10' : 'border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)]'
                          }`}
                        >
                          <div className="w-8 h-8 rounded bg-[var(--color-bg-tertiary)] flex items-center justify-center font-black text-[var(--color-text-primary)]">AR</div>
                          <div>
                            <div className="text-sm font-bold text-[var(--color-text-primary)]">العربية (Arabic)</div>
                            <div className="text-xs text-[var(--color-text-muted)]">RTL Layout</div>
                          </div>
                          {language === 'ar' && <CheckCircle2 className="w-4 h-4 text-[var(--color-growl-lime)] absolute ltr:right-4 rtl:left-4" />}
                        </button>
                      </div>
                      {language === 'ar' && (
                        <p className="mt-3 text-xs text-[#F59E0B] flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" /> Selecting Arabic enables Right-to-Left (RTL) layout across the dashboard.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Timezone</label>
                      <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none">
                        <option>(UTC+00:00) Greenwich Mean Time</option>
                        <option>(UTC+03:00) Riyadh, Saudi Arabia</option>
                        <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                        <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- GENERAL / MY PROFILE TAB ---------------- */}
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">My Profile</h2>
                  <p className="text-sm text-white/40 mb-6">Manage your personal identity, avatar, and password.</p>
                  
                  <div className="space-y-5 max-w-xl">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#B6FF2E] flex items-center justify-center text-3xl font-black text-black shadow-lg">
                        {profileAvatar || (profileName ? profileName.charAt(0).toUpperCase() : 'U')}
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Profile Icon (Emoji or URL)</label>
                        <input 
                          type="text" 
                          value={profileAvatar} 
                          onChange={(e) => setProfileAvatar(e.target.value)}
                          placeholder="e.g. 👨‍💻 or https://..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Job Title</label>
                      <input 
                        type="text" 
                        value={profileTitle} 
                        onChange={(e) => setProfileTitle(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Change Password</label>
                      <input 
                        type="password" 
                        placeholder="Leave blank to keep current password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors" 
                      />
                    </div>

                    {profileUpdateMsg && (
                      <div className={`p-3 rounded-lg text-sm ${profileUpdateMsg.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {profileUpdateMsg}
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <Button variant="primary" onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- BILLING TAB ---------------- */}
            {activeTab === 'billing' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Billing & Plans</h2>
                  <p className="text-sm text-white/40 mb-6">Manage your subscription and payment methods.</p>
                  
                  <div className="bg-gradient-to-r from-[#8B5CF6]/20 to-[#B6FF2E]/10 border border-[#8B5CF6]/30 rounded-2xl p-6 mb-6 max-w-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#B6FF2E]/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <Badge variant="info" className="bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30 mb-2">AGENCY PRO</Badge>
                        <h3 className="text-2xl font-bold text-white">$299<span className="text-sm text-white/50 font-normal">/month</span></h3>
                        <p className="text-sm text-white/70 mt-1">Next billing date: September 1, 2026</p>
                      </div>
                      <Button variant="primary">Manage Plan</Button>
                    </div>
                  </div>
                  
                  <div className="max-w-2xl">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-black text-[#1A1F36]">VISA</div>
                        <div>
                          <p className="text-sm font-bold text-white">Visa ending in 4242</p>
                          <p className="text-xs text-white/40">Expires 12/28</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Update</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ---------------- NOTIFICATIONS TAB ---------------- */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col items-center justify-center h-64 text-white/30 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <Bell className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-semibold text-white/50 text-sm">More settings coming soon.</p>
                <p className="text-xs mt-1">This section is part of Phase 3 development.</p>
              </div>
            )}

            {/* ---------------- SECURITY & AUDIT TAB ---------------- */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Security & Audit Logs</h2>
                  <p className="text-sm text-white/40 mb-6">Review system activity and security events (Admin only).</p>
                  
                  {!isAdmin ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white/30 border border-white/5 rounded-2xl bg-black/40">
                      <Shield className="w-10 h-10 mb-3 text-[#F87171] opacity-50" />
                      <p className="font-semibold text-white/50 text-sm">Access Denied</p>
                      <p className="text-xs mt-1">You need Administrator privileges to view audit logs.</p>
                    </div>
                  ) : (
                    <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                      {isLoadingLogs ? (
                        <div className="flex justify-center items-center h-48">
                          <div className="w-8 h-8 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin"></div>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                              <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Time</th>
                              <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">User</th>
                              <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Action</th>
                              <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Resource</th>
                              <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                              auditLogs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-4 text-xs text-white/50 whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </td>
                                  <td className="p-4 text-sm font-medium text-white">
                                    {log.user?.name || 'Unknown User'}
                                  </td>
                                  <td className="p-4">
                                    <Badge variant={
                                      log.action === 'create' ? 'lime' :
                                      log.action === 'delete' ? 'error' :
                                      log.action === 'login' ? 'info' : 'default'
                                    } size="sm" className="capitalize">
                                      {log.action}
                                    </Badge>
                                  </td>
                                  <td className="p-4 text-sm text-white/70">
                                    {log.resourceType} <span className="text-white/30 text-xs">({log.resourceId})</span>
                                  </td>
                                  <td className="p-4 text-xs text-white/40 font-mono truncate max-w-[200px]">
                                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-white/30">
                                  <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                  <p>No audit logs recorded yet.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════ USERS & ROLES TAB ════════════════ */}
            {activeTab === 'users' && isAdmin && (
              <div className="space-y-10 animate-in fade-in duration-300">
                
                {/* ── Section 1: User Management ── */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">User Management</h2>
                      <p className="text-sm text-white/40">Manage roles, policies, and credentials for all team members.</p>
                    </div>
                  </div>

                  {/* Password Reset Modal */}
                  {resetPasswordUserId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Key className="w-5 h-5 text-[#8B5CF6]" />
                            Reset Password
                          </h3>
                          <button onClick={() => { setResetPasswordUserId(null); setNewPassword(''); setUpdateMessage(''); }} className="text-white/40 hover:text-white">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-white/50 mb-4">
                          Resetting password for: <span className="text-white font-semibold">{team.find((u: any) => u.id === resetPasswordUserId)?.name}</span>
                        </p>
                        <input
                          type="text"
                          placeholder="Enter new password (min 6 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors mb-4"
                        />
                        {updateMessage && (
                          <p className={`text-xs mb-3 ${updateMessage.includes('Error') || updateMessage.includes('must') ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                            {updateMessage}
                          </p>
                        )}
                        <div className="flex gap-3">
                          <Button variant="ghost" size="sm" onClick={() => { setResetPasswordUserId(null); setNewPassword(''); setUpdateMessage(''); }}>Cancel</Button>
                          <Button variant="primary" size="sm" onClick={handleResetPassword} disabled={isUpdating}>
                            {isUpdating ? 'Resetting...' : 'Reset Password'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Table */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">User</th>
                          <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Email</th>
                          <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Role</th>
                          <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Policies</th>
                          <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                          <th className="p-4 text-[10px] font-bold text-white/40 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {team.filter((u: any) => !u.isAI).map((user: any) => {
                          const isEditing = editingUserId === user.id;
                          const isCurrentUser = auth?.user?.id === user.id;
                          return (
                            <tr key={user.id} className={`transition-colors ${isEditing ? 'bg-[#8B5CF6]/5' : 'hover:bg-white/[0.02]'}`}>
                              {/* User */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar name={user.name} size="sm" />
                                  <div>
                                    <p className="text-sm font-semibold text-white">{user.name}</p>
                                    <p className="text-xs text-white/40">{user.title || user.department || '-'}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="p-4 text-sm text-white/60">{user.email || '-'}</td>

                              {/* Role */}
                              <td className="p-4">
                                {isEditing ? (
                                  <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                    className="bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
                                  >
                                    <option value="Admin">Admin</option>
                                    <option value="Member">Member</option>
                                    <option value="Viewer">Viewer</option>
                                  </select>
                                ) : (
                                  <Badge 
                                    variant={user.role === 'Admin' ? 'lime' : user.role === 'Viewer' ? 'default' : 'info'} 
                                    size="sm"
                                  >
                                    {user.role || 'Member'}
                                  </Badge>
                                )}
                              </td>

                              {/* Policies */}
                              <td className="p-4">
                                {isEditing ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {policies.map((p: any) => {
                                      const isAssigned = editPolicyIds.includes(p.id);
                                      return (
                                        <button
                                          key={p.id}
                                          onClick={() => togglePolicyId(p.id)}
                                          className={`text-[10px] px-2 py-1 rounded-md border transition-all font-semibold ${
                                            isAssigned
                                              ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#8B5CF6]'
                                              : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70'
                                          }`}
                                        >
                                          {isAssigned ? '✓ ' : ''}{p.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {user.userPolicies?.length > 0 ? (
                                      user.userPolicies.map((up: any) => (
                                        <span key={up.policy.id} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                                          {up.policy.name}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-white/30">None</span>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Status */}
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-[#34D399]' : 'bg-white/20'}`} />
                                  <span className="text-xs text-white/50 capitalize">{user.status}</span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="p-4 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    {updateMessage && (
                                      <span className={`text-xs ${updateMessage.includes('Error') ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                                        {updateMessage}
                                      </span>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={cancelEditUser}>Cancel</Button>
                                    <Button variant="primary" size="sm" onClick={() => saveUserChanges(user.id)} disabled={isUpdating}>
                                      {isUpdating ? 'Saving...' : 'Save'}
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => startEditUser(user)}
                                      className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                                      title="Edit role & policies"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => { setResetPasswordUserId(user.id); setUpdateMessage(''); }}
                                      className="p-2 rounded-lg text-white/30 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                                      title="Reset password"
                                    >
                                      <Key className="w-4 h-4" />
                                    </button>
                                    {user.id !== auth?.user?.id && (
                                      <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="p-2 rounded-lg text-white/30 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                                        title="Delete user"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Separator ── */}
                <hr className="border-white/5" />

                {/* ── Section 2: Policy Management ── */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">Policy Management</h2>
                      <p className="text-sm text-white/40">Create and manage access policies with granular permissions.</p>
                    </div>
                    <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreatePolicy(true)}>
                      Create Policy
                    </Button>
                  </div>

                  {/* Create Policy Form */}
                  {showCreatePolicy && (
                    <div className="bg-black/60 border border-[#8B5CF6]/20 rounded-2xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white">New Policy</h3>
                        <button onClick={() => setShowCreatePolicy(false)} className="text-white/40 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Policy Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Content Manager"
                            value={newPolicyName}
                            onChange={(e) => setNewPolicyName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Description</label>
                          <input
                            type="text"
                            placeholder="Brief description of this policy..."
                            value={newPolicyDesc}
                            onChange={(e) => setNewPolicyDesc(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Permissions</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {AVAILABLE_PERMISSIONS.map(perm => {
                              const isSelected = newPolicyPerms.includes(perm.id);
                              return (
                                <button
                                  key={perm.id}
                                  onClick={() => setNewPolicyPerms(prev => isSelected ? prev.filter(p => p !== perm.id) : [...prev, perm.id])}
                                  className={`text-xs px-3 py-2 rounded-lg border transition-all font-medium text-left ${
                                    isSelected
                                      ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40 text-[#C4B5FD]'
                                      : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                                  }`}
                                >
                                  {isSelected ? '✓ ' : ''}{perm.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setShowCreatePolicy(false)}>Cancel</Button>
                          <Button variant="primary" size="sm" onClick={handleCreatePolicy} disabled={isUpdating || !newPolicyName.trim()}>
                            {isUpdating ? 'Creating...' : 'Create Policy'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Policy List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policies.map((policy: any) => {
                      let permissions: string[] = [];
                      try { permissions = JSON.parse(policy.permissions); } catch { /* ignore */ }
                      const assignedUsers = policy.userPolicies?.map((up: any) => up.user?.name).filter(Boolean) || [];

                      return (
                        <div key={policy.id} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#8B5CF6]" />
                              <h4 className="text-sm font-bold text-white">{policy.name}</h4>
                              {policy.isSystem && (
                                <span className="text-[9px] uppercase tracking-wider font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] px-1.5 py-0.5 rounded">System</span>
                              )}
                            </div>
                            {!policy.isSystem && (
                              <button
                                onClick={() => handleDeletePolicy(policy.id)}
                                className="p-1.5 rounded-lg text-white/20 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                                title="Delete policy"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {policy.description && (
                            <p className="text-xs text-white/40 mb-3">{policy.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {permissions.slice(0, 5).map((p: string) => (
                              <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/5 font-mono">
                                {p}
                              </span>
                            ))}
                            {permissions.length > 5 && (
                              <span className="text-[9px] text-white/30">+{permissions.length - 5} more</span>
                            )}
                          </div>
                          {assignedUsers.length > 0 && (
                            <div className="border-t border-white/5 pt-3">
                              <p className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">Assigned to</p>
                              <p className="text-xs text-white/60">{assignedUsers.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
}
