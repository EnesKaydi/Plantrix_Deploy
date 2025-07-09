'use client';

import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

export function ThemeApplier({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
} 