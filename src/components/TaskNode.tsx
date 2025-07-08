'use client';

import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TaskTreeNode } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { cn, getLevelIndentation, getLevelPrefix } from '@/lib/utils';

interface TaskNodeProps {
  task: TaskTreeNode;
}

export function TaskNode({ task }: TaskNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { selectedTaskId, setSelectedTask, toggleTaskCompletion } = useTaskStore();
  
  const isSelected = selectedTaskId === task.id;
  const hasChildren = task.children && task.children.length > 0;

  // Drag and Drop setup
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: task.id,
  });

  const handleTaskClick = () => {
    setSelectedTask(task.id);
  };

  const handleToggleCompletion = () => {
    toggleTaskCompletion(task.id);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div className="relative" style={{ marginLeft: getLevelIndentation(task.level) }}>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <div
            ref={(node) => {
              setDragRef(node);
              setDropRef(node);
            }}
            style={style}
            className={cn(
              'task-node p-3 mb-2 border rounded-lg transition-all duration-200',
              task.isCompleted && 'completed bg-success-50 border-success-300',
              isSelected && 'selected bg-primary-50 border-primary-400',
              !task.isCompleted && !isSelected && 'bg-white border-gray-300 hover:bg-gray-50',
              isDragging && 'dragging opacity-50'
            )}
            onClick={handleTaskClick}
            {...attributes}
            {...listeners}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {getLevelPrefix(task.level)}
                  </span>
                  <span className={cn(
                    'font-medium',
                    task.isCompleted && 'line-through text-success-600',
                    !task.isCompleted && 'text-gray-900'
                  )}>
                    {task.title}
                  </span>
                </div>
                
                {task.content && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {task.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Portal>
          <ContextMenu.Content className="context-menu">
            <ContextMenu.Item 
              className="context-menu-item"
              onClick={handleToggleCompletion}
            >
              {task.isCompleted ? '❌ Tamamlanmadı olarak işaretle' : '✅ Tamamlandı olarak işaretle'}
            </ContextMenu.Item>
            <ContextMenu.Separator className="context-menu-separator" />
            <ContextMenu.Item className="context-menu-item text-red-600">
              🗑️ Sil
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      {/* Child Tasks */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {task.children.map((child) => (
            <TaskNode key={child.id} task={child} />
          ))}
        </div>
      )}
    </div>
  );
} 