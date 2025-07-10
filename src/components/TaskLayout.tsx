'use client';

import { useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TaskTreeView } from './TaskTreeView';
import { TaskEditor } from './TaskEditor';
import { useTaskStore } from '@/store/taskStore';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { SearchBar } from './SearchBar';
import { RainEffect } from './RainEffect';
import { ThemeSwitcher } from './ThemeSwitcher';
import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function TaskLayout() {
  const { fetchTasks, moveTask, isLoading } = useTaskStore();
  const { data: session } = useSession();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 8 pixels before activating a drag.
      // This allows for click events to be processed without triggering a drag.
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    moveTask(event);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="p-5 border-b bg-card text-card-foreground relative overflow-hidden">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-4xl font-bold plantrix-title w-fit">PLANTRİX</h1>
            <p className="text-sm text-muted-foreground mt-1">hiç sıradan değil</p>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.name && <span className="text-sm welcome-text-animated">Hoş geldin, {session.user.name}!</span>}
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <RainEffect />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="w-1/3 border-r overflow-y-auto p-6 bg-card flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-card-foreground">Görev Listesi</h2>
            </div>
            <div className="mb-2">
              <SearchBar />
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <TaskTreeView />}
            </div>
          </div>
          <div className="flex-1 bg-background">
            <TaskEditor />
          </div>
        </DndContext>
        <ConfirmDeleteDialog />
      </div>
    </div>
  );
} 