'use client';

import { useEffect, useRef } from 'react';

export default function SecurityManager() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (typeof window !== 'undefined' && window.performance) {
      const navEntries = window.performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const navEntry = navEntries[0] as PerformanceNavigationTiming;
        if (navEntry.type === 'reload') {
          // It's a refresh! Log them out immediately by wiping the cookie
          fetch('/api/auth/logout', { method: 'POST' }).then(() => {
            window.location.href = '/login';
          });
        }
      }
    }
  }, []);

  return null;
}
