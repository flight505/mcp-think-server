import { z } from "zod";
import { randomUUID } from 'crypto';

/**
 * Task status enum
 */
export const TaskStatusEnum = z.enum(["todo", "in-progress", "blocked", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

/**
 * Task priority enum
 */
export const TaskPriorityEnum = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

/**
 * Complete task schema with all fields
 */
export const TaskSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  status: TaskStatusEnum.default("todo"),
  priority: TaskPriorityEnum.default("medium"),
  created: z.string().datetime(),
  updated: z.string().datetime().optional(),
  due: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  dependsOn: z.array(z.string().uuid()).default([])
});

/**
 * Schema for creating a new task (subset of fields required for creation)
 */
export const NewTaskSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  due: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  dependsOn: z.array(z.string().uuid()).optional()
});

/**
 * Schema for updating an existing task (all fields optional except id)
 */
export const TaskUpdateSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(3, "Description must be at least 3 characters").optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  due: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  dependsOn: z.array(z.string().uuid()).optional()
});

/**
 * Inferred types from schemas
 */
export type Task = z.infer<typeof TaskSchema>;
export type NewTask = z.infer<typeof NewTaskSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;

/**
 * Create a new task from partial input
 * 
 * @param taskInput Partial task data
 * @returns Valid, complete task
 */
export function createTask(taskInput: NewTask): Task {
  const now = new Date().toISOString();
  
  // Parse and validate the input
  const validatedInput = NewTaskSchema.parse(taskInput);
  
  // Create fully-formed task with defaults
  const task: Task = {
    id: randomUUID(),
    description: validatedInput.description,
    status: validatedInput.status || "todo",
    priority: validatedInput.priority || "medium",
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
export function updateTask(existingTask: Task, taskUpdate: Omit<TaskUpdate, "id">): Task {
  // Parse and validate the update
  const validatedUpdate = TaskUpdateSchema.omit({ id: true }).parse(taskUpdate);
  
  // Create updated task
  const updatedTask: Task = {
    ...existingTask,
    ...validatedUpdate,
    updated: new Date().toISOString()
  };
  
  return updatedTask;
} 