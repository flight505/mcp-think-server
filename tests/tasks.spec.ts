import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Task } from '../src/tasks/schemas.js';
import { TaskStorage } from '../src/tasks/storage.js';
import { v4 as uuidv4 } from 'uuid';

// Fix the fs mock to match Node.js ESM module structure
vi.mock('fs', async () => {
  return {
    existsSync: vi.fn(() => false),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    appendFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    createWriteStream: vi.fn(() => ({
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn((event, callback) => callback())
    })),
    renameSync: vi.fn(),
    default: {
      existsSync: vi.fn(() => false),
      writeFileSync: vi.fn(),
      readFileSync: vi.fn(),
      appendFileSync: vi.fn(),
      mkdirSync: vi.fn(),
      createWriteStream: vi.fn(() => ({
        write: vi.fn(),
        end: vi.fn(),
        on: vi.fn((event, callback) => callback())
      })),
      renameSync: vi.fn()
    },
    promises: {
      readFile: vi.fn().mockResolvedValue(''),
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined)
    }
  };
});

vi.mock('../src/utils/fs.js', () => ({
  createDirectory: vi.fn()
}));

vi.mock('../src/utils/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  })
}));

vi.mock('fastmcp', () => ({
  FastMCP: class {
    addTool = vi.fn();
    callTool = vi.fn();
    start = vi.fn();
  }
}));

// Add a helper to clear all tasks for testing
declare module '../src/tasks/storage.js' {
  interface TaskStorage {
    clearAllTasks(): void;
  }
}

TaskStorage.prototype.clearAllTasks = function () {
  (this as unknown as { tasks: Map<string, Task> }).tasks.clear();
};

describe('Task Management', () => {
  let taskStorage: TaskStorage;
  
  beforeEach(() => {
    vi.resetAllMocks();
    // Create a new instance for each test
    taskStorage = new TaskStorage();
    // Use the public helper to clear tasks
    taskStorage.clearAllTasks();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  
  it('should create a new task', async () => {
    const task: Task = {
      id: uuidv4(),
      description: 'Test task',
      status: 'todo',
      priority: 'medium',
      created: new Date().toISOString()
    };
    
    const result = await taskStorage.addTask(task);
    expect(result).toEqual(task);
    const allTasks = await taskStorage.getAllTasks();
    expect(allTasks).toContain(task);
  });
  
  it('should update an existing task', async () => {
    const task: Task = {
      id: uuidv4(),
      description: 'Test task',
      status: 'todo',
      priority: 'medium',
      created: new Date().toISOString()
    };
    
    await taskStorage.addTask(task);
    
    const updatedTask = await taskStorage.updateTask(task.id, {
      description: 'Updated task',
      priority: 'high'
    });
    
    expect(updatedTask).toEqual({
      ...task,
      description: 'Updated task',
      priority: 'high'
    });
  });
  
  it('should return null when updating a non-existent task', async () => {
    try {
      await taskStorage.updateTask('non-existent-id', {
        description: 'This should fail'
      });
      // If we reach here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Expect the error to be thrown
      expect(error).toBeDefined();
      expect((error as Error).message).toContain('not found');
    }
  });
  
  it('should delete a task', async () => {
    const task: Task = {
      id: uuidv4(),
      description: 'Task to delete',
      status: 'todo',
      priority: 'low',
      created: new Date().toISOString()
    };
    
    await taskStorage.addTask(task);
    const deleteResult = await taskStorage.deleteTask(task.id);
    
    expect(deleteResult).toBe(true);
    const allTasks = await taskStorage.getAllTasks();
    expect(allTasks).not.toContain(task);
  });
  
  it('should filter tasks by status', async () => {
    const todoTask: Task = {
      id: uuidv4(),
      description: 'Todo task',
      status: 'todo',
      priority: 'medium',
      created: new Date().toISOString()
    };
    
    const doneTask: Task = {
      id: uuidv4(),
      description: 'Done task',
      status: 'done',
      priority: 'medium',
      created: new Date().toISOString()
    };
    
    await taskStorage.addTask(todoTask);
    await taskStorage.addTask(doneTask);
    
    const todoTasks = await taskStorage.getTasksBy({ status: 'todo' });
    expect(todoTasks).toHaveLength(1);
    expect(todoTasks[0]).toEqual(todoTask);
    
    const doneTasks = await taskStorage.getTasksBy({ status: 'done' });
    expect(doneTasks).toHaveLength(1);
    expect(doneTasks[0]).toEqual(doneTask);
  });
  
  it('should filter tasks by priority', async () => {
    const highTask: Task = {
      id: uuidv4(),
      description: 'High priority task',
      status: 'todo',
      priority: 'high',
      created: new Date().toISOString()
    };
    
    const lowTask: Task = {
      id: uuidv4(),
      description: 'Low priority task',
      status: 'todo',
      priority: 'low',
      created: new Date().toISOString()
    };
    
    await taskStorage.addTask(highTask);
    await taskStorage.addTask(lowTask);
    
    const highTasks = await taskStorage.getTasksBy({ priority: 'high' });
    expect(highTasks).toHaveLength(1);
    expect(highTasks[0]).toEqual(highTask);
  });
  
  it('should debounce save operations', async () => {
    vi.useFakeTimers();
    
    const task: Task = {
      id: uuidv4(),
      description: 'Test task',
      status: 'todo',
      priority: 'medium',
      created: new Date().toISOString()
    };
    
    await taskStorage.addTask(task);
    
    // Mock the saveImmediately method to verify it's called
    const saveImmediatelySpy = vi.spyOn(taskStorage, 'saveImmediately' as any);
    
    await taskStorage.save();
    
    // Fast-forward time
    vi.advanceTimersByTime(5000);
    
    // Verify save was called
    expect(saveImmediatelySpy).toHaveBeenCalled();
  });
}); 