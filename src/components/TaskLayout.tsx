'use client';

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

export function TaskLayout() {
  const { moveTask } = useTaskStore();

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
      <header className="p-4 border-b bg-card text-card-foreground">
        <h1 className="text-2xl font-bold">To-Do Web App 1.0</h1>
        <p className="text-sm text-muted-foreground">Hiyerarşik görev yönetimi uygulaması</p>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="w-1/3 border-r overflow-y-auto p-4 bg-card">
            <h2 className="text-lg font-semibold mb-4 text-card-foreground">Görev Listesi</h2>
            <TaskTreeView />
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