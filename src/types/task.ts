export interface Task {
  id: string;
  title: string;
  description?: string; // Short description for the left panel
  content?: string; // Full content for the right panel editor
  imageUrls?: string[]; // Allow multiple images
  emoji?: string; // Unified field for task icon
  parentId?: string | null;
  level: number;
  orderIndex: number;
  isCompleted: boolean;
  isImportant: boolean; // Add isImportant
  createdAt: string; // Use ISO string for consistency
  updatedAt: string; // Use ISO string for consistency
  attachments: TaskAttachment[];
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  content?: string;
  parentId?: string | null;
  level: number;
  orderIndex: number;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  imageUrls?: string[]; // Allow multiple images
  emoji?: string;
  parentId?: string | null;
  level?: number;
  orderIndex?: number;
  isCompleted?: boolean;
}

export interface TaskTreeNode extends Task {
  children: TaskTreeNode[];
  isExpanded?: boolean; // For search result expansion
}

export type DragEndEvent = {
  active: { id: string };
  over: { id: string } | null;
} 