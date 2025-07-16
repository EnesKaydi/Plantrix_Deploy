'use client';

import { useThemeStore } from '@/store/themeStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const themes = [
  { name: 'theme-ocean', label: 'Okyanus', color: 'bg-blue-500' },
  { name: 'theme-sunset', label: 'Gün Batımı', color: 'bg-orange-500' },
  { name: 'theme-forest', label: 'Orman', color: 'bg-green-600' },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      {themes.map((t) => (
        <Button
          key={t.name}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(t.name)}
          className={cn(
            "flex items-center gap-2 transition-all",
            theme === t.name
              ? 'bg-background text-foreground shadow-sm border border-primary scale-105'
              : 'text-muted-foreground'
          )}
        >
          <span className={cn('w-3 h-3 rounded-full', t.color)}></span>
          <span>{t.label}</span>
        </Button>
      ))}
    </div>
  );
} 