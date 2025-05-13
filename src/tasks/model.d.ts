/**
 * Task status
 */
export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

/**
 * Task priority
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Task object
 */
export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority; 
  created: string;
  updated?: string;
  tags?: string[];
  dependsOn?: string[];
  due?: string;
} 