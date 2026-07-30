'use client';

import { useEffect } from 'react';

export function GlobalEffects() {
  useEffect(() => {
    const stop = (e: WheelEvent) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLInputElement && t.type === 'number') {
        t.blur();
      }
    };
    document.addEventListener('wheel', stop, { passive: true });
    return () => document.removeEventListener('wheel', stop);
  }, []);
  return null;
}
