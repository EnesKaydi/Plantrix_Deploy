'use client';

import { useTaskStore } from '@/store/taskStore';
import { TaskNode } from './TaskNode';
import { Button } from '@/components/ui/button';
import { ChevronDownSquare, ChevronUpSquare } from 'lucide-react';

export function TaskTreeView() {
  // By selecting `searchTerm`, this component now re-renders when it changes.
  const { getTaskTree, searchTerm, setAllExpansion } = useTaskStore(); 
  const { tree: taskTree, matchedIds } = getTaskTree();

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={() => setAllExpansion(true)} variant="outline" size="sm">
          <ChevronDownSquare className="h-4 w-4 mr-2" />
          Tümünü Aç
        </Button>
        <Button onClick={() => setAllExpansion(false)} variant="outline" size="sm">
          <ChevronUpSquare className="h-4 w-4 mr-2" />
          Tümünü Kapa
        </Button>
      </div>
      <div className="task-tree">
        {taskTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Henüz görev bulunmuyor</p>
            <p className="text-sm mt-1">Sağ panelden yeni görev ekleyebilirsiniz</p>
          </div>
        ) : (
          taskTree.map((task) => (
            <TaskNode key={task.id} task={task} matchedIds={matchedIds} />
          ))
        )}
      </div>
    </div>
  );
} 