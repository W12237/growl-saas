'use client';

import React, { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncTheme = () => {
      const savedTheme = localStorage.getItem('agency_theme') || 'dark';
      const savedLanguage = localStorage.getItem('agency_language');
      const savedAccent = localStorage.getItem('agency_accent');

      let isLight = savedTheme === 'light';
      if (savedTheme === 'system') {
        isLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isLight) {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
      }

      if (savedLanguage === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
      }
      
      if (savedAccent) {
        document.documentElement.setAttribute('data-accent', savedAccent);
      }
    };

    syncTheme();

    const handleBeforeUnload = () => {
      fetch('/api/auth/logout', { method: 'POST', keepalive: true });
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (localStorage.getItem('agency_theme') === 'system') {
        syncTheme();
      }
    };

    window.addEventListener('theme-changed', syncTheme);
    window.addEventListener('beforeunload', handleBeforeUnload);
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      window.removeEventListener('theme-changed', syncTheme);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-bg-primary"></div>;
  }

  return <>{children}</>;
}
