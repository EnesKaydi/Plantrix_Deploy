'use client';

import { useTaskStore } from '@/store/taskStore';
import { TaskNode } from './TaskNode';

export function TaskTreeView() {
  const { getTaskTree } = useTaskStore();
  const taskTree = getTaskTree();

  return (
    <div className="p-4">
      <div className="task-tree">
        {taskTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Henüz görev bulunmuyor</p>
            <p className="text-sm mt-1">Sağ panelden yeni görev ekleyebilirsiniz</p>
          </div>
        ) : (
          taskTree.map((task) => (
            <TaskNode key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
} 