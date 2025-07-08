'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { TaskTreeView } from './TaskTreeView';
import { TaskEditor } from './TaskEditor';
import { useTaskStore } from '@/store/taskStore';

export function TaskLayout() {
  const { moveTask } = useTaskStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId !== overId) {
      // Implement drag and drop logic here
      // For now, we'll just update the parent relationship
      moveTask(activeId, overId === 'root' ? null : overId, 0);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          To-Do Web App 1.0
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Hiyerarşik görev yönetimi uygulaması
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext onDragEnd={handleDragEnd}>
          {/* Sol Panel - Task Tree (30%) */}
          <div className="w-[30%] bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Görev Listesi
              </h2>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <TaskTreeView />
            </div>
          </div>

          {/* Sağ Panel - Task Editor (70%) */}
          <div className="flex-1 bg-gray-50">
            <TaskEditor />
          </div>
        </DndContext>
      </div>
    </div>
  );
} 