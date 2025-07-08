import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskTreeNode } from '@/types/task';

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (input: CreateTaskInput) => void;
  updateTask: (input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  setSelectedTask: (id: string | null) => void;
  moveTask: (taskId: string, newParentId: string | null, newOrderIndex: number) => void;
  getTaskTree: () => TaskTreeNode[];
  getSelectedTask: () => Task | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Utility function to build tree structure
const buildTaskTree = (tasks: Task[]): TaskTreeNode[] => {
  const taskMap = new Map<string, TaskTreeNode>();
  const rootTasks: TaskTreeNode[] = [];

  // Create a map of all tasks
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Build the tree structure
  tasks.forEach(task => {
    const taskNode = taskMap.get(task.id)!;
    
    if (!task.parentId) {
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
    // Mock data for initial testing
    {
      id: '1',
      title: 'Başlık 1',
      content: '',
      parentId: null,
      level: 1,
      orderIndex: 0,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Alt Başlık 1',
      content: 'Bu alt başlığın içeriği...',
      parentId: '1',
      level: 2,
      orderIndex: 0,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Alt Başlık 2',
      content: '',
      parentId: '1',
      level: 2,
      orderIndex: 1,
      isCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      title: 'İkinci Derece Alt Başlık 1',
      content: '',
      parentId: '2',
      level: 3,
      orderIndex: 0,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  selectedTaskId: null,
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (input) => {
    const newTask: Task = {
      id: generateId(),
      title: input.title,
      content: input.content || '',
      parentId: input.parentId,
      level: input.level,
      orderIndex: get().tasks.filter(t => t.parentId === input.parentId).length,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set(state => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  updateTask: (input) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === input.id
          ? { ...task, ...input, updatedAt: new Date() }
          : task
      ),
    }));
  },

  deleteTask: (id) => {
    const getAllDescendants = (taskId: string, tasks: Task[]): string[] => {
      const children = tasks.filter(t => t.parentId === taskId);
      const descendants = children.map(c => c.id);
      
      children.forEach(child => {
        descendants.push(...getAllDescendants(child.id, tasks));
      });
      
      return descendants;
    };

    set(state => {
      const allIdsToDelete = [id, ...getAllDescendants(id, state.tasks)];
      return {
        tasks: state.tasks.filter(task => !allIdsToDelete.includes(task.id)),
        selectedTaskId: allIdsToDelete.includes(state.selectedTaskId || '') 
          ? null 
          : state.selectedTaskId,
      };
    });
  },

  toggleTaskCompletion: (id) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === id
          ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date() }
          : task
      ),
    }));
  },

  setSelectedTask: (id) => set({ selectedTaskId: id }),

  moveTask: (taskId, newParentId, newOrderIndex) => {
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              parentId: newParentId, 
              level: newParentId 
                ? (state.tasks.find(t => t.id === newParentId)?.level || 0) + 1 
                : 1,
              orderIndex: newOrderIndex,
              updatedAt: new Date() 
            }
          : task
      ),
    }));
  },

  getTaskTree: () => {
    return buildTaskTree(get().tasks);
  },

  getSelectedTask: () => {
    const state = get();
    return state.tasks.find(task => task.id === state.selectedTaskId) || null;
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
})); 