'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import { Avatar } from '@/components/ui';

import { useLanguage } from '@/lib/i18n';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// ── Icons (inline SVGs for zero-dependency) ──
const icons: Record<string, React.ReactNode> = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  crm: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clients: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  projects: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  campaigns: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  content: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  approvals: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  files: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  ai: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>,
  reports: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  finance: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  team: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  chat: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>,
  meetings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15.2 3.9 2.1 2.1L5.1 18.2 3 16.1z"/><path d="m17.6 3.6 2.8 2.8a2.4 2.4 0 0 1 0 3.4L17.6 3.6"/><path d="M2 22h20"/></svg>,
  automation: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  collapse: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>,
  expand: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>,
};

interface NavLink {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  section?: string;
  adminOnly?: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard', section: 'main' },
  { label: 'CRM', href: '/dashboard/crm', icon: 'crm', section: 'main' },
  { label: 'Clients', href: '/dashboard/clients', icon: 'clients', section: 'main' },
  { label: 'Projects', href: '/dashboard/projects', icon: 'projects', section: 'work' },
  { label: 'Campaigns', href: '/dashboard/campaigns', icon: 'campaigns', section: 'work' },
  { label: 'Content', href: '/dashboard/content', icon: 'content', section: 'work' },
  { label: 'Approvals', href: '/dashboard/approvals', icon: 'approvals', section: 'work' },
  { label: 'Files', href: '/dashboard/files', icon: 'files', section: 'work' },
  { label: 'AI Suite', href: '/dashboard/ai', icon: 'ai', section: 'intelligence' },
  { label: 'Reports', href: '/dashboard/reports', icon: 'reports', section: 'intelligence' },
  { label: 'Finance', href: '/dashboard/finance', icon: 'finance', section: 'operations' },
  { label: 'Team', href: '/dashboard/team', icon: 'team', section: 'operations', adminOnly: true },
  { label: 'Chat', href: '/dashboard/chat', icon: 'chat', section: 'operations' },
  { label: 'Meetings', href: '/dashboard/meetings', icon: 'meetings', section: 'operations' },
  { label: 'Automation', href: '/dashboard/automation', icon: 'automation', section: 'system', adminOnly: true },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings', section: 'system' },
];

const sections: Record<string, string> = {
  main: 'Overview',
  work: 'Workspace',
  intelligence: 'Intelligence',
  operations: 'Operations',
  system: 'System',
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const { data: auth } = useSWR('/api/auth/me', fetcher, { fallbackData: null });
  const { data: notificationsData } = useSWR('/api/notifications', fetcher, { fallbackData: [] });
  
  const currentUser = auth?.user || { name: 'Loading...', email: '', role: 'Member', avatar: null };
  const safeNotifications = Array.isArray(notificationsData) ? notificationsData : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const userRole = currentUser.role || 'Member';
  const isAdmin = userRole === 'Admin';

  const groupedLinks = Object.keys(sections).map(section => ({
    section,
    label: t('sec.' + section),
    links: navLinks
      .filter(l => l.section === section)
      .filter(l => !l.adminOnly || isAdmin)
      .map(l => {
        const translatedLabel = t('nav.' + l.icon);
        if (l.icon === 'dashboard' && unreadCount > 0) {
          return { ...l, label: translatedLabel, badge: unreadCount };
        }
        return { ...l, label: translatedLabel };
      }),
  })).filter(group => group.links.length > 0);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col fixed top-0 ltr:left-0 rtl:right-0 h-screen z-40
          bg-[var(--color-bg-secondary)] border-r rtl:border-r-0 rtl:border-l border-[var(--color-border-primary)]
          transition-all duration-300 ease-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-[var(--color-border-primary)] ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-growl-lime)] to-[var(--color-growl-purple-light)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--color-bg-primary)] font-black text-sm">G</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-black text-[var(--color-text-primary)] tracking-tight truncate">{t('appName')}</h1>
              <p className="text-[10px] text-[var(--color-text-muted)] font-medium truncate">{t('appSub')}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 px-3">
          {groupedLinks.map(({ section, label, links }) => (
            <div key={section} className="mb-4">
              {!collapsed && (
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] px-3 mb-2">{label}</p>
              )}
              {collapsed && section !== 'main' && (
                <div className="h-px bg-[var(--color-border-primary)] mx-2 mb-2" />
              )}
              <div className="space-y-0.5">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      group flex items-center gap-3 rounded-xl
                      transition-all duration-200
                      ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
                      ${isActive(link.href)
                        ? 'bg-[var(--color-growl-lime)]/15 text-[var(--color-growl-lime)] font-bold'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                      }
                    `}
                    title={collapsed ? link.label : undefined}
                  >
                    <span className={`flex-shrink-0 transition-colors ${isActive(link.href) ? 'text-[var(--color-growl-lime)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'}`}>
                      {icons[link.icon]}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="text-[13px] font-semibold truncate">{link.label}</span>
                        {link.badge && link.badge > 0 && (
                          <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-[var(--color-growl-lime)]/15 text-[var(--color-growl-lime)] text-[10px] font-bold px-1.5">
                            {link.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && link.badge && link.badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-growl-lime)]" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-3 py-2 border-t border-[var(--color-border-primary)]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              w-full flex items-center gap-3 rounded-xl px-3 py-2
              text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]
              transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {collapsed ? icons.expand : icons.collapse}
            {!collapsed && <span className="text-[13px] font-medium">Collapse</span>}
          </button>
        </div>

        {/* User Profile */}
        <div className={`px-3 py-3 border-t border-[var(--color-border-primary)] ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? '' : 'px-1'}`}>
            <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0 ml-3">
                <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{currentUser.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl border-t border-[var(--color-border-primary)] safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {navLinks.filter(l => ['dashboard', 'crm', 'clients', 'ai', 'settings'].includes(l.icon)).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl
                transition-colors duration-200
                ${isActive(link.href)
                  ? 'text-[var(--color-growl-lime)]'
                  : 'text-[var(--color-text-muted)] active:text-[var(--color-text-primary)]'
                }
              `}
            >
              <span className="relative">
                {icons[link.icon]}
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[var(--color-growl-lime)]" />
                )}
              </span>
              <span className="text-[10px] font-semibold">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
