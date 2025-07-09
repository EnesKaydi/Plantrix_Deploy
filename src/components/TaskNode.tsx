'use client';

import { useState, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { ChevronRight, ChevronDown, CheckSquare, Trash2 } from 'lucide-react';
import { TaskTreeNode } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { cn, getLevelIndentation, getLevelPrefix } from '@/lib/utils';

interface TaskNodeProps {
  task: TaskTreeNode;
}

export function TaskNode({ task }: TaskNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { selectedTaskId, setSelectedTask, toggleTaskCompletion, requestDelete } = useTaskStore();
  
  const isSelected = selectedTaskId === task.id;
  const hasChildren = task.children && task.children.length > 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // This prevents the hydration error by ensuring dnd-kit attributes are only applied on the client
  const dndAttributes = isMounted ? attributes : {};

  const handleTaskClick = () => {
    setSelectedTask(task.id);
  };

  const handleToggleCompletion = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleTaskCompletion(task.id);
  };

  const handleDeleteTask = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (confirm(`"${task.title}" görevini ve tüm alt görevlerini silmek istediğinizden emin misiniz?`)) {
      requestDelete(task.id);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from being selected when toggling
    setIsExpanded(!isExpanded);
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
              'task-node p-3 mb-2 border rounded-lg transition-all duration-200 select-none',
              task.isCompleted && 'completed bg-success-50 border-success-300 text-success-700',
              isSelected && 'selected bg-primary-100 border-primary-400 shadow-md',
              !task.isCompleted && !isSelected && 'bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm',
              isDragging && 'dragging opacity-50 scale-95'
            )}
            onClick={handleTaskClick}
            {...dndAttributes}
            {...listeners}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={handleToggleExpand}
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
                
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 italic">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ContextMenu.Trigger>

        {isMounted && (
          <ContextMenu.Portal>
            <ContextMenu.Content className="w-48 bg-white shadow-lg rounded-md p-1 border border-gray-200">
              <ContextMenu.Item 
                className="context-menu-item"
                onSelect={() => toggleTaskCompletion(task.id)}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                {task.isCompleted ? 'Yapılmadı Olarak İşaretle' : 'Tamamlandı Olarak İşaretle'}
              </ContextMenu.Item>
              <ContextMenu.Separator className="h-px bg-gray-200 my-1" />
              <ContextMenu.Item 
                className="context-menu-item text-red-600"
                onSelect={() => requestDelete(task.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        )}
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