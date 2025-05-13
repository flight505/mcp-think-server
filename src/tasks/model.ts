import { randomUUID } from 'crypto';
import { z } from 'zod';

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

/**
 * Task schema definition
 */
export const taskSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  due: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  dependsOn: z.array(z.string().uuid()).default([])
});

/**
 * New task schema (subset of fields required for creation)
 */
export const newTaskSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  dependsOn: z.array(z.string().uuid()).optional()
});

/**
 * Task update schema (all fields optional)
 */
export const taskUpdateSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(3, "Description must be at least 3 characters").optional(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  dependsOn: z.array(z.string().uuid()).optional()
});

// Task interface already defined above

/**
 * New task interface matching schema
 */
export type NewTask = z.infer<typeof newTaskSchema>;

/**
 * Task update interface matching schema
 */
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;

/**
 * Create a new task from partial input
 * 
 * @param taskInput Partial task data
 * @returns Valid, complete task
 */
export function createTask(taskInput: NewTask): Task {
  const now = new Date().toISOString();
  
  // Parse and validate the input
  const validatedInput = newTaskSchema.parse(taskInput);
  
  // Create fully-formed task with defaults
  const task: Task = {
    id: randomUUID(),
    description: validatedInput.description,
    status: validatedInput.status || 'todo',
    priority: validatedInput.priority || 'medium',
    created: now,
    updated: now,
    due: validatedInput.due,
    tags: validatedInput.tags || [],
    dependsOn: validatedInput.dependsOn || []
  };
  
  return task;
}

/**
 * Update an existing task with partial data
 * 
 * @param existingTask Current task data
 * @param taskUpdate Partial updates to apply
 * @returns Updated task
 */
export function updateTask(existingTask: Task, taskUpdate: Omit<TaskUpdate, 'id'>): Task {
  // Parse and validate the update
  const validatedUpdate = taskUpdateSchema.omit({ id: true }).parse(taskUpdate);
  
  // Create updated task
  const updatedTask: Task = {
    ...existingTask,
    ...validatedUpdate,
    updated: new Date().toISOString()
  };
  
  return updatedTask;
} 