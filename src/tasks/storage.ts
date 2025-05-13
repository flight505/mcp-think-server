import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { homedir } from 'os';
import { Task, TaskStatus } from './model.js';

/**
 * Storage for tasks
 */
export class TaskStorage extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private filePath: string;
  private isLoaded: boolean = false;
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  
  /**
   * Create a new TaskStorage instance
   * @param filePath Path to the storage file (optional, defaults to ~/.mcp-think-tank/tasks.jsonl)
   */
  constructor(filePath?: string) {
    super();
    this.filePath = filePath || path.join(homedir(), '.mcp-think-tank', 'tasks.jsonl');
    this.load();
  }
  
  /**
   * Add a new task
   * @param task Task to add
   * @returns Added task
   */
  add(task: Omit<Task, 'id' | 'created'>): Task {
    if (!this.isLoaded) {
      throw new Error('Task storage not yet loaded');
    }
    
    // Generate UUID
    const id = crypto.randomUUID();
    
    // Create task object
    const newTask: Task = {
      id,
      created: new Date().toISOString(),
      ...task,
      status: task.status || 'todo',
      priority: task.priority || 'medium'
    };
    
    // Add to map
    this.tasks.set(id, newTask);
    
         // Save to storage
     this.save();
     
     console.error(`[DEBUG] [taskStorage] Task ${id} added`);
     
     // Emit event
     this.emit('task-added', newTask);
    
    return newTask;
  }
  
  /**
   * Get a task by ID
   * @param id Task ID
   * @returns Task or undefined if not found
   */
  get(id: string): Task | undefined {
    return this.tasks.get(id);
  }
  
  /**
   * Get all tasks
   * @returns Array of tasks
   */
  getAll(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Update a task
   * @param id Task ID
   * @param update Task update
   * @returns Updated task or undefined if not found
   */
  update(id: string, update: Partial<Omit<Task, 'id' | 'created'>>): Task | undefined {
    const task = this.tasks.get(id);
    
    if (!task) {
      return undefined;
    }
    
    const updatedTask = {
      ...task,
      ...update,
      id
    };
    
    this.tasks.set(id, updatedTask);
    this.save();
    
    console.error(`[DEBUG] [taskStorage] Task ${id} updated`);
    
    // Emit event
    this.emit('task-updated', updatedTask);
    
    return updatedTask;
  }
  
  /**
   * Delete a task
   * @param id Task ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): boolean {
    const deleted = this.tasks.delete(id);
    
    if (deleted) {
      this.save();
      console.error(`[DEBUG] [taskStorage] Task ${id} deleted`);
      
      // Emit event
      this.emit('task-deleted', id);
    }
    
    return deleted;
  }
  
  /**
   * Get tasks by status
   * @param status Task status
   * @returns Array of tasks with the given status
   */
  getByStatus(status: TaskStatus): Task[] {
    return this.getAll().filter(task => task.status === status);
  }
  
  /**
   * Get highest priority task with the given status
   * @param status Task status
   * @returns Highest priority task or undefined if none
   */
  getHighestPriority(status: TaskStatus): Task | undefined {
    const tasks = this.getByStatus(status);
    
    // Define priority order
    const priorityOrder = {
      high: 3,
      medium: 2,
      low: 1
    };
    
    // Sort by priority (high to low) and creation date (oldest first)
    return tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
      if (priorityDiff !== 0) return priorityDiff;
      
      // If priority is the same, sort by creation date (oldest first)
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    })[0];
  }
  
  /**
   * Get related tasks
   * @param taskId Task ID
   * @returns Array of tasks that depend on or are depended on by the given task
   */
  getRelatedTasks(taskId: string): Task[] {
    const task = this.get(taskId);
    if (!task) return [];
    
    // Get tasks that this task depends on
    const dependencies = task.dependsOn || [];
    const dependencyTasks = dependencies
      .map(id => this.get(id))
      .filter(Boolean) as Task[];
    
    // Get tasks that depend on this task
    const dependents = this.getAll().filter(t => 
      t.dependsOn && t.dependsOn.includes(taskId)
    );
    
    // Combine and remove duplicates
    const relatedTasks = [...dependencyTasks, ...dependents];
    const uniqueIds = new Set(relatedTasks.map(t => t.id));
    
    return Array.from(uniqueIds).map(id => this.get(id) as Task);
  }
  
  /**
   * Set a task to automatically transition to the next status after a delay
   * @param taskId Task ID
   * @param delay Delay in milliseconds
   * @param targetStatus Target status
   */
  setAutoTransition(taskId: string, delay: number, targetStatus: TaskStatus): void {
    // Clear existing timeout
    this.clearTimeout(taskId);
    
    // Set new timeout
    const timeout = setTimeout(() => {
      this.update(taskId, { status: targetStatus });
      this.timeouts.delete(taskId);
    }, delay);
    
    this.timeouts.set(taskId, timeout);
  }
  
  /**
   * Clear a task auto-transition timeout
   * @param taskId Task ID
   */
  clearTimeout(taskId: string): void {
    const timeout = this.timeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(taskId);
    }
  }
  
  /**
   * Clear all task auto-transition timeouts
   */
  clearAllTimeouts(): void {
    for (const [taskId, timeout] of this.timeouts.entries()) {
      clearTimeout(timeout);
      this.timeouts.delete(taskId);
    }
  }
  
  /**
   * Save tasks to storage
   */
  save(): void {
    // Throttle saving to prevent excessive disk I/O
    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
    }
    
    this._saveTimeout = setTimeout(() => {
      this.saveImmediately();
    }, 1000);
  }
  
  /**
   * Save tasks immediately without throttling
   */
  saveImmediately(): void {
    try {
      // Ensure directory exists
      const directory = path.dirname(this.filePath);
      this.createDirectory(directory);
      
      // Write tasks to file
      const lines = Array.from(this.tasks.values()).map(task => JSON.stringify(task));
      fs.writeFileSync(this.filePath, lines.join('\n'), 'utf8');
      
      console.error(`[DEBUG] [taskStorage] Saved ${this.tasks.size} tasks to ${this.filePath}`);
    } catch (error) {
      console.error(`[ERROR] [taskStorage] Failed to save tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Create directory if it doesn't exist
   * @param directory Directory path
   */
  private createDirectory(directory: string): void {
    try {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.error(`[INFO] [taskStorage] Created directory ${directory}`);
      }
    } catch (error) {
      console.error(`[ERROR] [taskStorage] Failed to create directory ${directory}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Load tasks from storage
   */
  private load(): void {
    try {
      // Check if file exists
      if (!fs.existsSync(this.filePath)) {
        console.error(`[INFO] [taskStorage] Task file ${this.filePath} doesn't exist yet, creating empty storage`);
        this.createDirectory(path.dirname(this.filePath));
        fs.writeFileSync(this.filePath, '', 'utf8');
        this.isLoaded = true;
        return;
      }
      
      // Read and parse tasks
      const content = fs.readFileSync(this.filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const task = JSON.parse(line) as Task;
          this.tasks.set(task.id, task);
        } catch (err) {
          console.error(`[WARN] [taskStorage] Failed to parse task: ${line}, error: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
      
      console.error(`[INFO] [taskStorage] Loaded ${this.tasks.size} tasks from ${this.filePath}`);
      this.isLoaded = true;
    } catch (error) {
      console.error(`[ERROR] [taskStorage] Failed to load tasks: ${error instanceof Error ? error.message : String(error)}`);
      this.isLoaded = true; // Set to true to allow adding new tasks
    }
  }
  
  /**
   * Save timeout
   */
  private _saveTimeout: NodeJS.Timeout | null = null;
}

// Export a singleton instance
export const taskStorage = new TaskStorage();