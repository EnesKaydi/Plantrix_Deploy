import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskTreeNode } from '@/types/task';
import { DragEndEvent } from '@dnd-kit/core';
import axios from 'axios';

// The buildTaskTree utility function remains the same.
// ... (buildTaskTree fonksiyonunu buraya olduğu gibi kopyalayacağız)
const buildTaskTree = (tasks: Task[], searchTerm: string = ''): TaskTreeNode[] => {
  const taskMap = new Map<string, TaskTreeNode>();
  const rootTasks: TaskTreeNode[] = [];
  const lowercasedSearchTerm = searchTerm.toLowerCase();
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
  const tasksToProcess = searchTerm ? tasks.filter(t => visibleTaskIds.has(t.id)) : tasks;
  tasksToProcess.forEach(task => {
    taskMap.set(task.id, { ...task, children: [], isExpanded: searchTerm ? true : undefined });
  });
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


interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  searchTerm: string;
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
  moveTask: (event: DragEndEvent) => Promise<void>;
  
  // Getters
  getTaskTree: () => TaskTreeNode[];
  getSelectedTask: () => Task | null;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  searchTerm: '',
  isLoading: true, // Start with loading true until first fetch is done
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<Task[]>('/api/tasks');
      set({ tasks: response.data, isLoading: false, selectedTaskId: response.data[0]?.id || null });
    } catch (error: any) {
      console.error('Failed to fetch tasks. Full error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      set({ error: 'Görevler yüklenemedi. Konsolu kontrol edin.', isLoading: false });
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
    } catch (error) {
      console.error('Failed to add task', error);
      // Here you could show an error to the user
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
    } catch (error) {
      console.error('Failed to update task', error);
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
        set({ selectedTaskId: null }); // Or select parent/sibling
    }

    try {
        // We might need a specific backend endpoint to handle cascading deletes
        // For now, we assume the frontend logic is sufficient and just delete the main task.
      await axios.delete(`/api/tasks/${id}`);
       // If the backend doesn't handle cascades, we might need to send all IDs to delete.
    } catch (error) {
      console.error('Failed to delete task', error);
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

    // --- Start optimistic update logic ---
    const oldParentId = draggedTask.parentId;
    
    // Logic to determine new parent, level, and order
    // This is a simplified version. A real implementation might need more checks.
    const newParentId = dropTargetTask.parentId;
    const newLevel = dropTargetTask.level;

    // Remove task from its old position
    const tasksInOldParent = tasks.filter(t => t.parentId === oldParentId);
    tasksInOldParent.splice(draggedTask.orderIndex, 1);
    tasksInOldParent.forEach((t, i) => t.orderIndex = i);

    // Add task to its new position
    const tasksInNewParent = tasks.filter(t => t.parentId === newParentId);
    let newOrderIndex = tasksInNewParent.findIndex(t => t.id === dropTargetTask.id);
    
    // For simplicity, let's place it after the drop target
    if (newOrderIndex < 0) newOrderIndex = 0;
    else newOrderIndex += 1;
    
    draggedTask.parentId = newParentId;
    draggedTask.level = newLevel;
    draggedTask.orderIndex = newOrderIndex;
    
    tasksInNewParent.splice(newOrderIndex, 0, draggedTask);
    tasksInNewParent.forEach((t, i) => t.orderIndex = i);

    // Create a new tasks array with updated values
    const updatedTasks = tasks.map(t => {
      const updatedInOld = tasksInOldParent.find(uto => uto.id === t.id);
      if(updatedInOld) return updatedInOld;
      
      const updatedInNew = tasksInNewParent.find(utn => utn.id === t.id);
      if(updatedInNew) return updatedInNew;
      
      return t;
    });

    set({ tasks: updatedTasks });
    // --- End optimistic update ---

    try {
      await axios.post('/api/tasks/move', {
        taskId: active.id,
        newParentId,
        newOrderIndex,
        newLevel,
      });
      // On success, we can re-fetch or trust the optimistic update.
      // For now, we trust. A re-fetch would be safer.
      // get().fetchTasks(); 
    } catch (error) {
      console.error('Failed to move task', error);
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