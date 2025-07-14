'use client';

import { useRef, useEffect } from 'react';
import { TaskEditor } from './TaskEditor';
import { TaskTreeView } from './TaskTreeView';
import { SearchBar } from './SearchBar';
import { ConfirmDeleteDialog, ConfirmDeleteDialogRef } from './ConfirmDeleteDialog';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { 
  DndContext, 
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTaskStore } from '@/store/taskStore';
import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeSwitcher } from './ThemeSwitcher';
import { RainEffect } from './RainEffect';
import { LoadingSpinner } from './ui/LoadingSpinner';


export function TaskLayout() {
  const deleteDialogRef = useRef<ConfirmDeleteDialogRef>(null);
  const { fetchTasks, moveTask, isLoading } = useTaskStore();
  const { data: session } = useSession();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
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
      <PanelGroup
        direction="horizontal"
        className="flex-1 w-full"
      >
        <Panel defaultSize={30} minSize={20}>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <SearchBar />
              </div>
              <div className="flex-1 overflow-y-auto">
                 {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : <TaskTreeView />}
              </div>
            </div>
          </DndContext>
        </Panel>
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
        <Panel defaultSize={70}>
          <TaskEditor deleteDialogRef={deleteDialogRef} />
        </Panel>
      </PanelGroup>
      
      <ConfirmDeleteDialog ref={deleteDialogRef} />
    </div>
  );
} 