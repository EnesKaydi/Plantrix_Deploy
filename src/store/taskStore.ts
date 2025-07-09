import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskTreeNode } from '@/types/task';
import { DragEndEvent } from '@dnd-kit/core';

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  searchTerm: string; // Add search term
  isLoading: boolean;
  error: string | null;
  taskToDeleteId: string | null;
  isConfirmDialogOpen: boolean;
  deleteConfirmationEnabled: boolean;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (input: CreateTaskInput) => void;
  updateTask: (input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  requestDelete: (id: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  toggleTaskCompletion: (id: string) => void;
  toggleTaskImportant: (id: string) => void; // Add toggle important
  setSelectedTask: (id: string | null) => void;
  setSearchTerm: (term: string) => void; // Add set search term
  moveTask: (event: DragEndEvent) => void;
  getTaskTree: () => TaskTreeNode[];
  getSelectedTask: () => Task | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDeleteConfirmation: (enabled: boolean) => void;
}

// Utility function to build tree structure
const buildTaskTree = (tasks: Task[], searchTerm: string = ''): TaskTreeNode[] => {
  const taskMap = new Map<string, TaskTreeNode>();
  const rootTasks: TaskTreeNode[] = [];

  const lowercasedSearchTerm = searchTerm.toLowerCase();

  // Filter tasks if search term is provided
  const filteredTasks = searchTerm
    ? tasks.filter(task => task.title.toLowerCase().includes(lowercasedSearchTerm))
    : tasks;

  const visibleTaskIds = new Set<string>();
  if (searchTerm) {
    const taskAndParents = new Set<string>();
    filteredTasks.forEach(task => {
      taskAndParents.add(task.id);
      let parentId = task.parentId;
      while(parentId) {
        const parent = tasks.find(t => t.id === parentId);
        if (parent) {
          taskAndParents.add(parent.id);
          parentId = parent.parentId;
        } else {
          parentId = null;
        }
      }
    });
    tasks.forEach(task => {
        if(taskAndParents.has(task.id)) {
            visibleTaskIds.add(task.id);
        }
    });
  }


  // Create a map of all tasks (or visible tasks if searching)
  const tasksToProcess = searchTerm ? tasks.filter(t => visibleTaskIds.has(t.id)) : tasks;
  
  tasksToProcess.forEach(task => {
    taskMap.set(task.id, { ...task, children: [], isExpanded: searchTerm ? true : undefined });
  });

  // Build the tree structure
  tasksToProcess.forEach(task => {
    const taskNode = taskMap.get(task.id)!;
    
    if (!task.parentId || !taskMap.has(task.parentId)) {
      rootTasks.push(taskNode);
    } else {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.children.push(taskNode);
      }
    }
  });

  // Sort tasks by order index
  const sortByOrderIndex = (nodes: TaskTreeNode[]) => {
    nodes.sort((a, b) => a.orderIndex - b.orderIndex);
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortByOrderIndex(node.children);
      }
    });
  };

  sortByOrderIndex(rootTasks);
  return rootTasks;
};

// Generate unique ID (in real app, this would be handled by the database)
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [
    {
      id: '1',
      title: 'Başlık 1',
      description: 'Bu bir ana görevdir.',
      content: 'Başlık 1 için detaylı içerik...',
      imageUrls: [],
      emoji: '🏠',
      level: 1,
      orderIndex: 0,
      isCompleted: false,
      isImportant: false,
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
    {
      id: '2',
      title: 'Alt Başlık 1',
      description: 'Bu alt başlığın içeriği...',
      content: 'Alt Başlık 1 için daha da detaylı içerik...',
      imageUrls: [],
      emoji: '📄',
      level: 2,
      orderIndex: 0,
      isCompleted: false,
      isImportant: false,
      parentId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
    {
      id: '3',
      title: 'İkinci Derece Alt Başlık 1',
      description: 'Derinlere iniyoruz.',
      content: 'En alt seviye görevin içeriği.',
      imageUrls: [],
      emoji: '✍️',
      level: 3,
      orderIndex: 0,
      isCompleted: false,
      isImportant: true,
      parentId: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
    {
      id: '4',
      title: 'Alt Başlık 2',
      description: 'Tamamlanmış bir görev.',
      content: '',
      imageUrls: [],
      emoji: '✅',
      level: 2,
      orderIndex: 1,
      isCompleted: true,
      isImportant: false,
      parentId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    },
  ],
  selectedTaskId: '1', // Select the first task by default
  searchTerm: '',
  isLoading: false,
  error: null,
  taskToDeleteId: null,
  isConfirmDialogOpen: false,
  deleteConfirmationEnabled: true,

  setTasks: (tasks) => set({ tasks }),

  addTask: (input: CreateTaskInput) => {
    const newTask: Task = {
      ...input,
      id: new Date().toISOString(),
      content: '',
      description: '',
      isCompleted: false,
      isImportant: false,
      imageUrls: [],
      emoji: '📄',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
    };
    set(state => ({ 
      tasks: [...state.tasks, newTask],
      selectedTaskId: newTask.id, // Automatically select the new task
    }));
  },

  updateTask: (input: UpdateTaskInput) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === input.id
          ? { ...task, ...input, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  },

  deleteTask: (id: string) => {
    set(state => {
      const tasksToDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        const tasksCount = tasksToDelete.size;
        state.tasks.forEach(t => {
          if (t.parentId && tasksToDelete.has(t.parentId)) {
            tasksToDelete.add(t.id);
          }
        });
        if (tasksToDelete.size > tasksCount) {
          changed = true;
        }
      }

      const remainingTasks = state.tasks.filter(t => !tasksToDelete.has(t.id));

      let nextSelectedId: string | null = null;
      if (state.selectedTaskId === id || tasksToDelete.has(state.selectedTaskId!)) {
        const originalTask = state.tasks.find(t => t.id === id);
        if (originalTask?.parentId) {
          const siblings = state.tasks.filter(t => t.parentId === originalTask.parentId && t.id !== id);
          if (siblings.length > 0) {
            nextSelectedId = siblings[0].id;
          } else {
            nextSelectedId = originalTask.parentId;
          }
        } else {
          const topLevelTasks = remainingTasks.filter(t => !t.parentId);
          if (topLevelTasks.length > 0) {
            nextSelectedId = topLevelTasks[0].id;
          }
        }
      } else {
        nextSelectedId = state.selectedTaskId;
      }

      return {
        tasks: remainingTasks,
        selectedTaskId: nextSelectedId,
      };
    });
  },

  requestDelete: (id: string) => {
    if (get().deleteConfirmationEnabled) {
      set({ isConfirmDialogOpen: true, taskToDeleteId: id });
    } else {
      get().deleteTask(id);
    }
  },

  confirmDelete: () => {
    const { taskToDeleteId } = get();
    if (taskToDeleteId) {
      get().deleteTask(taskToDeleteId);
    }
    set({ isConfirmDialogOpen: false, taskToDeleteId: null });
  },

  cancelDelete: () => {
    set({ isConfirmDialogOpen: false, taskToDeleteId: null });
  },

  toggleTaskCompletion: (id) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id
          ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  },

  toggleTaskImportant: (id) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id
          ? { ...task, isImportant: !task.isImportant, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
  },

  setSelectedTask: (id) => {
    if (get().tasks.find(t => t.id === id)) {
      set({ selectedTaskId: id });
    }
  },

  setSearchTerm: (term: string) => set({ searchTerm: term }),

  moveTask: (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    set(state => {
      const tasks = state.tasks;
      const draggedTask = tasks.find(t => t.id === active.id);
      const dropTargetTask = tasks.find(t => t.id === over.id);

      if (!draggedTask || !dropTargetTask) {
        return {};
      }

      // Prevent dropping a task on its own descendant
      let currentParentId = dropTargetTask.parentId;
      while (currentParentId) {
        if (currentParentId === draggedTask.id) {
          console.warn("Cannot drop a task into one of its own children.");
          return {}; // Invalid move
        }
        const parentTask = tasks.find(t => t.id === currentParentId);
        currentParentId = parentTask ? parentTask.parentId : null;
      }
      
      const oldParentId = draggedTask.parentId;

      // Create a mutable copy of tasks
      let newTasks = tasks.map(t => ({ ...t }));

      // 1. Update the dragged task's properties
      const taskToUpdate = newTasks.find(t => t.id === active.id)!;
      taskToUpdate.parentId = dropTargetTask.id;
      taskToUpdate.level = dropTargetTask.level + 1;
      taskToUpdate.updatedAt = new Date().toISOString();

      // 2. Recursively update levels for all children of the dragged task
      const updateChildrenLevels = (parentId: string, newLevel: number) => {
        const children = newTasks.filter(t => t.parentId === parentId);
        children.forEach(child => {
          const childToUpdate = newTasks.find(t => t.id === child.id)!;
          childToUpdate.level = newLevel;
          updateChildrenLevels(child.id, newLevel + 1);
        });
      };
      updateChildrenLevels(taskToUpdate.id, taskToUpdate.level + 1);
      
      // 3. Re-calculate orderIndex for old and new siblings
      const reorderSiblings = (parentId: string | null) => {
        newTasks
          .filter(t => t.parentId === parentId)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .forEach((task, index) => {
            const taskInNewArray = newTasks.find(t => t.id === task.id)!;
            taskInNewArray.orderIndex = index;
          });
      };

      // Reorder old siblings (if the parent has changed)
      if(oldParentId !== taskToUpdate.parentId) {
        // @ts-ignore
        reorderSiblings(oldParentId);
      }
      
      // Set the order for the moved task and reorder new siblings
      const newSiblings = newTasks.filter(t => t.parentId === taskToUpdate.parentId);
      taskToUpdate.orderIndex = newSiblings.length - 1;
      reorderSiblings(dropTargetTask.id);

      return { tasks: newTasks };
    });
  },

  getTaskTree: () => buildTaskTree(get().tasks, get().searchTerm),

  getSelectedTask: () => {
    const state = get();
    return state.tasks.find(task => task.id === state.selectedTaskId) || null;
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setDeleteConfirmation: (enabled: boolean) => {
    set({ deleteConfirmationEnabled: enabled });
    if (typeof window !== 'undefined') {
      localStorage.setItem('deleteConfirmationEnabled', JSON.stringify(enabled));
    }
  },
}));

if (typeof window !== 'undefined') {
  const enabled = localStorage.getItem('deleteConfirmationEnabled');
  useTaskStore.setState({ 
    deleteConfirmationEnabled: enabled ? JSON.parse(enabled) : true 
  });
} 