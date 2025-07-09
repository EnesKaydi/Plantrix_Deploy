'use client';

import { useTaskStore } from '@/store/taskStore';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import React from 'react';

export function SearchBar() {
  const { searchTerm, setSearchTerm } = useTaskStore();

  return (
    <div className="relative w-full">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Görevlerde ara..."
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        className="pl-8 w-full"
      />
    </div>
  );
} 