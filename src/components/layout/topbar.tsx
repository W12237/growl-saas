'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Avatar, Button } from '@/components/ui';

import { 
  Search, 
  Bell, 
  Command, 
  ChevronDown,
  User,
  Key,
  LogOut,
  X,
  Settings,
  CreditCard,
  Zap,
  Globe,
  Users,
  Sun,
  Moon
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TopbarProps {
  onCommandPalette?: () => void;
}

import { useLanguage } from '@/lib/i18n';

export function Topbar({ onCommandPalette }: TopbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleToggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
  };
  const { data: auth, mutate } = useSWR('/api/auth/me', fetcher, { fallbackData: null });
  const { data: team } = useSWR('/api/team', fetcher, { fallbackData: [] });
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: notificationsData, mutate: mutateNotifications } = useSWR('/api/notifications', fetcher, { fallbackData: [] });
  const safeNotifications = Array.isArray(notificationsData) ? notificationsData : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      mutateNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const handleNotificationClick = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      mutateNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };
  
  const currentUser = auth?.user || { name: 'Loading...', email: '' };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Failed to sign out', err);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      window.location.reload();
    } catch (err) {
      console.error('Failed to switch user', err);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (!res.ok) throw new Error('Failed to rename');
      mutate();
      setIsRenameModalOpen(false);
      setNewName('');
    } catch (err) {
      setError('Failed to update name');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (!res.ok) throw new Error('Failed to update password');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isLightMode, setIsLightMode] = React.useState(false);

  React.useEffect(() => {
    const updateThemeState = () => {
      setIsLightMode(document.documentElement.classList.contains('light-theme'));
    };
    updateThemeState();
    window.addEventListener('theme-changed', updateThemeState);
    return () => window.removeEventListener('theme-changed', updateThemeState);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = isLightMode ? 'dark' : 'light';
    localStorage.setItem('agency_theme', nextTheme);
    window.dispatchEvent(new Event('theme-changed'));
  };

  const safeTeam = Array.isArray(team) ? team : [];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[var(--color-bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--color-border-primary)] transition-colors duration-200">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left: Search */}
          <button
            onClick={onCommandPalette}
            className="flex items-center gap-3 h-9 px-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all duration-200 max-w-md w-full lg:w-80"
          >
            <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-sm flex-1 text-start">{t('searchPlaceholder')}</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] text-[10px] font-mono text-[var(--color-text-muted)]">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Language Switcher */}
            <button
              onClick={handleToggleLanguage}
              title="Switch Language / تغيير اللغة"
              className="h-9 px-3 flex items-center gap-1.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-xs font-bold text-[var(--color-text-primary)] hover:border-[var(--color-growl-lime)] transition-all duration-200"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--color-growl-lime)]" />
              <span>{t('switchLang')}</span>
            </button>

            {/* Quick C-Panel Theme Switcher */}
            <button
              onClick={handleToggleTheme}
              title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-growl-lime)] transition-all duration-200"
            >
              {isLightMode ? <Moon className="w-4 h-4 text-[#8B5CF6]" /> : <Sun className="w-4 h-4 text-[#B6FF2E]" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-200"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-[var(--color-growl-lime)] text-[var(--color-bg-primary)] text-[9px] font-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-[#161616] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden" style={{ animation: 'scale-in 150ms ease-out' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <button onClick={handleMarkAllRead} className="text-xs text-[#B6FF2E] font-semibold hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {safeNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-white/40 text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      safeNotifications.map((notif: any) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.id)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                        >
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          notif.type === 'success' ? 'bg-[#34D399]' :
                          notif.type === 'warning' ? 'bg-[#FBBF24]' :
                          notif.type === 'error' ? 'bg-[#F87171]' :
                          'bg-[#60A5FA]'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                          <p className="text-[11px] text-white/40 truncate">{notif.message}</p>
                        </div>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF2E] mt-1.5 flex-shrink-0" />}
                      </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-white/[0.06]">
                    <button className="w-full text-center text-xs font-semibold text-white/40 hover:text-white/60 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowUserSwitch(false); }}
                className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-xl hover:bg-white/[0.06] transition-all duration-200"
              >
                <Avatar name={currentUser.name} size="sm" status="online" />
                <span className="hidden md:block text-xs font-semibold text-white/70 max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 top-12 w-64 bg-[#111111]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden" style={{ animation: 'scale-in 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  
                  {/* Header / Current User Info */}
                  <div className="px-5 py-4 border-b border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar name={currentUser.name} size="md" />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[2.5px] border-[#111111] bg-[#34D399]"></div>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-white/40 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    {auth?.user?.role && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-bold uppercase tracking-wider border border-[#8B5CF6]/20">
                          {auth.user.role}
                        </span>
                        <span className="text-[10px] text-[#34D399] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
                          Online
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Core Actions */}
                  <div className="p-2 space-y-0.5">
                    <button 
                      onClick={() => { setIsRenameModalOpen(true); setShowProfile(false); setNewName(currentUser.name); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" /> 
                        Rename Profile
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => { setIsPasswordModalOpen(true); setShowProfile(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" /> 
                        Change Password
                      </div>
                    </button>
                    
                    <button 
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Settings className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" /> 
                        Preferences
                      </div>
                    </button>
                  </div>

                  {/* Workspace / Admin Actions */}
                  <div className="p-2 border-t border-white/[0.06] space-y-0.5">
                    <button 
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all group flex items-center gap-2.5"
                    >
                      <Globe className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" /> 
                      Workspace Settings
                    </button>
                    <button 
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.06] transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" /> 
                        Billing & Plans
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B6FF2E]/10 text-[#B6FF2E]">PRO</span>
                    </button>
                  </div>

                  {/* Logout / Switch User */}
                  <div className="p-2 border-t border-white/[0.06] bg-black/20">
                    <button 
                      onClick={() => setShowUserSwitch(!showUserSwitch)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/[0.06] transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-white/40" /> Switch User
                      </div>
                      <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showUserSwitch ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showUserSwitch && (
                      <div className="mt-1 pl-2 pr-1 py-1 space-y-1 max-h-32 overflow-y-auto custom-scrollbar bg-black/40 rounded-xl border border-white/5">
                        {safeTeam.length === 0 && (
                          <div className="text-center py-2 text-[10px] text-white/40">Loading users...</div>
                        )}
                        {safeTeam.map(member => (
                          <button
                            key={member.id}
                            onClick={() => handleSwitchUser(member.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                              member.id === currentUser.id 
                                ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' 
                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                            }`}
                          >
                            <Avatar name={member.name} size="xs" />
                            <div className="truncate min-w-0 flex-1">
                              {member.name}
                            </div>
                            {member.id === currentUser.id && (
                              <span className="text-[9px] px-1 bg-[#8B5CF6]/20 rounded">Current</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <button 
                      onClick={handleSignOut}
                      className="w-full mt-1 text-left px-3 py-2 rounded-xl text-xs font-bold text-[#F87171]/80 hover:text-[#F87171] hover:bg-[#F87171]/10 transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </div>
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-[#F87171]/10 text-[9px] font-mono text-[#F87171]/60">⇧Q</kbd>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Rename Profile</h2>
              <button onClick={() => setIsRenameModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRename} className="space-y-4">
              {error && <div className="text-[#F87171] text-xs font-semibold">{error}</div>}
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="e.g. Sarah Connor"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsRenameModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting || !newName || newName === currentUser.name}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              {error && <div className="text-[#F87171] text-xs font-semibold bg-[#F87171]/10 p-2 rounded">{error}</div>}
              
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" type="button" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting || !newPassword || !confirmPassword}>
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
