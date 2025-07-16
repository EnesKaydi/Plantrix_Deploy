'use client';

import { useState, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { ChevronRight, ChevronDown, CheckSquare, Trash2, Star, Plus, FilePlus } from 'lucide-react'; // Import Star
import { TaskTreeNode } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { cn, getLevelIndentation, getLevelPrefix } from '@/lib/utils';

interface TaskNodeProps {
  task: TaskTreeNode;
  matchedIds: Set<string>; // Receive the full set of matched IDs
}

export function TaskNode({ task, matchedIds }: TaskNodeProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { 
    selectedTaskId, 
    setSelectedTask, 
    toggleTaskCompletion,
    deleteTask,
    addTask,
    tasks,
    // New state and actions for expansion
    expandedIds,
    toggleExpansion,
  } = useTaskStore();
  
  // The node is expanded if its ID is in the central set.
  // For search results, we still rely on task.isExpanded to force expansion.
  const isExpanded = task.isExpanded || expandedIds.has(task.id);

  const isSelected = selectedTaskId === task.id;
  const hasChildren = task.children && task.children.length > 0;
  const isMatched = matchedIds.has(task.id);

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

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card from being selected when toggling
    toggleExpansion(task.id);
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
              'task-node p-2 mb-1 border rounded-md transition-all duration-200 select-none cursor-pointer', // Reduced padding and margin
              'hover:shadow-md hover:border-primary/50',
              // Prioritize selection and completion styles first
              isSelected && 'bg-primary/10 shadow-lg',
              task.isCompleted && 'task-completed',
              task.isImportant && !task.isCompleted && 'task-important',
              // Apply border color based on state, with `isMatched` having the highest priority
              isMatched ? 'border-red-500 border-2' : (isSelected ? 'border-primary' : 'border-border'),
              !task.isCompleted && !isSelected && !task.isImportant && 'bg-card',
              isDragging && 'dragging opacity-50 scale-95'
            )}
            onClick={handleTaskClick}
            {...dndAttributes}
            {...listeners}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl w-7 text-center">{task.emoji || '📄'}</span>
              {hasChildren && (
                <button
                  onClick={handleToggleExpand}
                  className="p-0.5 rounded hover:bg-gray-200 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center">
                  <span className="font-mono text-xs text-muted-foreground mr-2">{getLevelPrefix(task.level)}</span>
                  <span className={cn(
                    'font-normal text-sm truncate', // Reduced font size
                    task.isCompleted ? 'text-inherit' : 'text-card-foreground'
                  )}>
                    {task.title}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 italic">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ContextMenu.Trigger>

        {isMounted && (
          <ContextMenu.Portal>
            <ContextMenu.Content className="w-56 bg-card border rounded-md shadow-lg p-1">
              <ContextMenu.Item
                className="context-menu-item"
                onSelect={() => toggleTaskCompletion(task.id)}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>{task.isCompleted ? 'Yapılmadı Olarak İşaretle' : 'Tamamlandı Olarak İşaretle'}</span>
              </ContextMenu.Item>
              <ContextMenu.Item
                  className="context-menu-item destructive"
                  onSelect={() => {
                    if (window.confirm(`"${task.title}" görevini ve tüm alt görevlerini silmek istediğinizden emin misiniz?`)) {
                      deleteTask(task.id);
                    }
                  }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </ContextMenu.Item>
              <ContextMenu.Separator className="h-px bg-border my-1" />
              <ContextMenu.Item
                  className="context-menu-item"
                  onSelect={() => {
                    const newOrderIndex = task.children.length;
                    addTask({ title: 'Yeni Alt Görev', parentId: task.id, level: task.level + 1, orderIndex: newOrderIndex });
                  }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Yeni alt sayfa ekle
              </ContextMenu.Item>
              <ContextMenu.Item
                  className="context-menu-item"
                  onSelect={() => {
                    const rootTasks = tasks.filter(t => !t.parentId);
                    const newOrderIndex = rootTasks.length;
                    addTask({ title: 'Yeni Görev', level: 1, orderIndex: newOrderIndex });
                  }}
              >
                <FilePlus className="mr-2 h-4 w-4" />
                Sayfa ekle
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        )}
      </ContextMenu.Root>

      {/* Child Tasks */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {task.children.map((child) => (
            <TaskNode key={child.id} task={child} matchedIds={matchedIds} />
          ))}
        </div>
      )}
    </div>
  );
} 