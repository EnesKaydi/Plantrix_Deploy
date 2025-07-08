export interface Task {
  id: string;
  title: string;
  content?: string;
  parentId?: string | null;
  level: number;
  orderIndex: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: Task[];
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
  content?: string;
  parentId?: string | null;
  level: number;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  content?: string;
  parentId?: string | null;
  level?: number;
  orderIndex?: number;
  isCompleted?: boolean;
}

export interface TaskTreeNode extends Task {
  children: TaskTreeNode[];
}

export type DragEndEvent = {
  active: { id: string };
  over: { id: string } | null;
} 