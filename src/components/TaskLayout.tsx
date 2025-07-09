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
    <div className="h-screen flex flex-col">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold">To-Do Web App 1.0</h1>
        <p className="text-sm text-gray-500">Hiyerarşik görev yönetimi uygulaması</p>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4 bg-white">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Görev Listesi</h2>
            <TaskTreeView />
          </div>
          <div className="flex-1 bg-gray-50">
            <TaskEditor />
          </div>
        </DndContext>
        <ConfirmDeleteDialog />
      </div>
    </div>
  );
} 