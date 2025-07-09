'use client';

import { create } from 'zustand';

type Theme = 'theme-ocean' | 'theme-sunset' | 'theme-forest';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('app-theme') as Theme;
    if (['theme-ocean', 'theme-sunset', 'theme-forest'].includes(storedTheme)) {
      return storedTheme;
    }
  }
  return 'theme-ocean'; // Default theme
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', theme);
    }
    set({ theme });
  },
})); 