import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskTreeNode } from '@/types/task';
import { DragEndEvent } from '@dnd-kit/core';
import axios from 'axios';

interface BuildTreeResult {
  tree: TaskTreeNode[];
  matchedIds: Set<string>;
}

// The buildTaskTree utility function remains the same.
// ... (buildTaskTree fonksiyonunu buraya olduğu gibi kopyalayacağız)
const buildTaskTree = (tasks: Task[], searchTerm: string = ''): BuildTreeResult => {
  if (!searchTerm) {
    // If no search term, build the full tree without any matches.
    const taskMap = new Map<string, TaskTreeNode>();
    const rootTasks: TaskTreeNode[] = [];
    tasks.forEach(task => taskMap.set(task.id, { ...task, children: [] }));
    tasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      if (task.parentId && taskMap.has(task.parentId)) {
        taskMap.get(task.parentId)!.children.push(taskNode);
      } else {
        rootTasks.push(taskNode);
      }
    });
    // Sort logic here if needed
    return { tree: rootTasks, matchedIds: new Set() };
  }

  const allTasksMap = new Map<string, Task>();
  tasks.forEach(task => allTasksMap.set(task.id, task));

  const lowercasedSearchTerm = searchTerm.toLowerCase();
  const directlyMatchedIds = new Set<string>();
  
  tasks.forEach(task => {
    const isMatch = task.title.toLowerCase().includes(lowercasedSearchTerm) ||
                  (task.content && task.content.toLowerCase().includes(lowercasedSearchTerm));
    if (isMatch) {
      directlyMatchedIds.add(task.id);
    }
  });

  // Filter the matches: only highlight the lowest-level task in a hierarchy.
  const finalHighlightedIds = new Set(directlyMatchedIds);
  directlyMatchedIds.forEach(id => {
    const task = allTasksMap.get(id);
    if (!task) return;

    // Check if any child of this task is also a direct match.
    // This requires iterating through all tasks to find children.
    tasks.forEach(potentialChild => {
      if (potentialChild.parentId === id && directlyMatchedIds.has(potentialChild.id)) {
        // If a child is a match, remove the parent from the highlighted set.
        finalHighlightedIds.delete(id);
      }
    });
  });

  const visibleTaskIds = new Set<string>();
  directlyMatchedIds.forEach(id => {
    let currentId: string | null | undefined = id;
    while (currentId && allTasksMap.has(currentId)) {
      visibleTaskIds.add(currentId);
      currentId = allTasksMap.get(currentId)?.parentId;
    }
  });

  const tasksToProcess = tasks.filter(t => visibleTaskIds.has(t.id));
  const taskMap = new Map<string, TaskTreeNode>();
  const rootTasks: TaskTreeNode[] = [];

  tasksToProcess.forEach(task => {
    taskMap.set(task.id, { ...task, children: [], isExpanded: true });
  });

  tasksToProcess.forEach(task => {
    const taskNode = taskMap.get(task.id)!;
    if (task.parentId && taskMap.has(task.parentId)) {
      taskMap.get(task.parentId)!.children.push(taskNode);
    } else {
      rootTasks.push(taskNode);
    }
  });
  
  // Sort logic here
  const sortByOrderIndex = (nodes: TaskTreeNode[]) => {
    nodes.sort((a, b) => a.orderIndex - b.orderIndex);
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortByOrderIndex(node.children);
      }
    });
  };
  sortByOrderIndex(rootTasks);


  return { tree: rootTasks, matchedIds: finalHighlightedIds };
};


interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  searchTerm: string;
  expandedIds: Set<string>; // New state for managing expanded nodes
  isLoading: boolean;
  error: string | null;
  
  // New action to fetch tasks from the API
  fetchTasks: () => Promise<void>;
  
  // Actions that now interact with the API
  addTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>; // confirmDelete logic will be handled in the component
  toggleTaskCompletion: (id: string) => Promise<void>;
  
  // Local state actions
  setSelectedTask: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  toggleExpansion: (taskId: string) => void; // New action
  setAllExpansion: (expand: boolean) => void; // New action
  moveTask: (event: DragEndEvent) => Promise<void>;
  
  // Getters
  getTaskTree: () => BuildTreeResult;
  getSelectedTask: () => Task | null;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  searchTerm: '',
  expandedIds: new Set(), // Initialize with an empty set
  isLoading: true, // Start with loading true until first fetch is done
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<Task[]>('/api/tasks');
      set({ tasks: response.data, isLoading: false, selectedTaskId: response.data[0]?.id || null });
    } catch (error: unknown) {
      let errorMessage = 'Görevler yüklenemedi.';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      }
      
      set({ error: errorMessage, isLoading: false });
    }
  },

  addTask: async (input: CreateTaskInput) => {
    try {
      const response = await axios.post<Task>('/api/tasks', input);
      const newTask = response.data;
      set(state => ({
        tasks: [...state.tasks, newTask],
        selectedTaskId: newTask.id,
      }));
    } catch (error: unknown) {
      // Error handling - could be improved with toast notifications
      set(state => ({ ...state, error: 'Görev eklenemedi.' }));
    }
  },

  updateTask: async (input: UpdateTaskInput) => {
    const originalTasks = get().tasks;
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === input.id ? { ...task, ...input } : task
      ),
    }));
    try {
      await axios.patch(`/api/tasks/${input.id}`, input);
    } catch (error: unknown) {
      set({ tasks: originalTasks }); // Revert on error
    }
  },

  deleteTask: async (id: string) => {
    const originalTasks = get().tasks;
    const tasksToDelete = new Set<string>([id]);
    
    // Find all children recursively to delete them as well
    const findAllChildren = (parentId: string) => {
      originalTasks.forEach(t => {
        if (t.parentId === parentId) {
          tasksToDelete.add(t.id);
          findAllChildren(t.id);
        }
      });
    }
    findAllChildren(id);

    // Optimistic update
    const remainingTasks = originalTasks.filter(t => !tasksToDelete.has(t.id));
    set({ tasks: remainingTasks });
    
    // Handle selection change
    if (get().selectedTaskId && tasksToDelete.has(get().selectedTaskId!)) {
        set({ selectedTaskId: null });
    }

    try {
      await axios.delete(`/api/tasks/${id}`);
    } catch (error: unknown) {
      set({ tasks: originalTasks }); // Revert on error
    }
  },

  toggleTaskCompletion: async (id: string) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    await get().updateTask({ id, isCompleted: !task.isCompleted });
  },

  setSelectedTask: (id: string | null) => set({ selectedTaskId: id }),
  
  setSearchTerm: (term: string) => set({ searchTerm: term }),

  toggleExpansion: (taskId: string) => {
    set(state => {
      const newExpandedIds = new Set(state.expandedIds);
      if (newExpandedIds.has(taskId)) {
        newExpandedIds.delete(taskId);
      } else {
        newExpandedIds.add(taskId);
      }
      return { expandedIds: newExpandedIds };
    });
  },

  setAllExpansion: (expand: boolean) => {
    set(state => {
      if (expand) {
        // Expand all tasks that have children by finding all unique parentIds
        const allParentIds = new Set(state.tasks.map(t => t.parentId).filter((id): id is string => !!id));
        return { expandedIds: allParentIds };
      } else {
        // Collapse all
        return { expandedIds: new Set() };
      }
    });
  },

  moveTask: async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }
    
    const originalTasks = get().tasks;
    const tasks = [...originalTasks];

    const draggedTask = tasks.find(t => t.id === active.id);
    const dropTargetTask = tasks.find(t => t.id === over.id);

    if (!draggedTask || !dropTargetTask) {
      return;
    }

    // Optimistic update logic (existing logic remains the same)
    const oldParentId = draggedTask.parentId;
    const newParentId = dropTargetTask.parentId;
    const newLevel = dropTargetTask.level;

    // Remove task from its old position
    const tasksInOldParent = tasks.filter(t => t.parentId === oldParentId);
    tasksInOldParent.splice(draggedTask.orderIndex, 1);
    tasksInOldParent.forEach((t, i) => t.orderIndex = i);

    // Add task to its new position
    const tasksInNewParent = tasks.filter(t => t.parentId === newParentId);
    let newOrderIndex = tasksInNewParent.findIndex(t => t.id === dropTargetTask.id);
    
    if (newOrderIndex < 0) newOrderIndex = 0;
    else newOrderIndex += 1;
    
    draggedTask.parentId = newParentId;
    draggedTask.level = newLevel;
    draggedTask.orderIndex = newOrderIndex;
    
    tasksInNewParent.splice(newOrderIndex, 0, draggedTask);
    tasksInNewParent.forEach((t, i) => t.orderIndex = i);

    const updatedTasks = tasks.map(t => {
      const updatedInOld = tasksInOldParent.find(uto => uto.id === t.id);
      if(updatedInOld) return updatedInOld;
      
      const updatedInNew = tasksInNewParent.find(utn => utn.id === t.id);
      if(updatedInNew) return updatedInNew;
      
      return t;
    });

    set({ tasks: updatedTasks });

    try {
      await axios.post('/api/tasks/move', {
        taskId: active.id,
        newParentId,
        newOrderIndex,
        newLevel,
      });
    } catch (error: unknown) {
      set({ tasks: originalTasks }); // Revert on error
    }
  },

  getTaskTree: () => {
    return buildTaskTree(get().tasks, get().searchTerm);
  },

  getSelectedTask: () => {
    const { tasks, selectedTaskId } = get();
    return tasks.find(task => task.id === selectedTaskId) || null;
  },
})); 