'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CommandPalette } from '@/components/layout/command-palette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-200">
      <Sidebar />
      <div className="dashboard-content-wrapper lg:pl-[260px] rtl:lg:pl-0 rtl:lg:pr-[260px] ltr:lg:pl-[260px] ltr:lg:pr-0 transition-all duration-300">
        <Topbar onCommandPalette={() => setCommandPaletteOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}
