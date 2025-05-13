import { FastMCP } from "fastmcp";
import { taskStorage } from "./storage.js";
import { Task, NewTaskSchema, TaskUpdateSchema, TaskSchema, TaskStatusEnum, TaskPriorityEnum } from "./schemas.js";
import { z } from "zod";

/**
 * Register task management tools with the MCP server
 * 
 * @param server FastMCP server instance
 */
export function registerTaskTools(server: FastMCP): void {
  // Schema for plan_tasks parameters
  const PlanTasksSchema = z.object({
    tasks: z.array(
      z.object({
        description: z.string().min(3, "Description must be at least 3 characters"),
        status: TaskStatusEnum.optional(),
        dependsOn: z.array(z.string().uuid()).optional(),
        due: z.string().datetime().optional(),
        priority: TaskPriorityEnum.optional(),
        tags: z.array(z.string()).optional()
      })
    )
  });

  // Schema for list_tasks parameters
  const ListTasksSchema = z.object({
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional()
  });

  // Schema for complete_task parameters
  const CompleteTaskSchema = z.object({
    id: z.string().uuid()
  });

  // Schema for update_tasks parameters
  const UpdateTasksSchema = z.object({
    updates: z.array(
      z.object({
        id: z.string().uuid(),
        description: z.string().min(3, "Description must be at least 3 characters").optional(),
        status: TaskStatusEnum.optional(),
        priority: TaskPriorityEnum.optional(),
        due: z.string().datetime().optional(),
        tags: z.array(z.string()).optional(),
        dependsOn: z.array(z.string().uuid()).optional()
      })
    )
  });

  // Tool to plan tasks
  server.addTool({
    name: "plan_tasks",
    description: "Create multiple tasks from a plan. Generates IDs and syncs with knowledge graph.",
    execute: async (params: any) => {
      try {
        // Validate input parameters
        const validatedParams = PlanTasksSchema.parse(params);
        const createdTasks = [];
        
        for (const task of validatedParams.tasks) {
          try {
            const newTask = taskStorage.add({
              description: task.description,
              status: task.status || "todo",
              priority: task.priority || "medium",
              due: task.due,
              tags: task.tags || [],
              dependsOn: task.dependsOn || []
            });
            createdTasks.push(newTask);
          } catch (error) {
            return JSON.stringify({ 
              error: `Failed to create task: ${error instanceof Error ? error.message : String(error)}`,
              task: task
            });
          }
        }
        
        return JSON.stringify({ 
          tasks: createdTasks,
          message: `Created ${createdTasks.length} tasks`
        });
      } catch (error) {
        return JSON.stringify({ 
          error: `Invalid task parameters: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });
  
  // Tool to list tasks
  server.addTool({
    name: "list_tasks",
    description: "List tasks with optional filtering by status and priority.",
    execute: async (params: any) => {
      try {
        // Validate input parameters
        const validatedParams = ListTasksSchema.parse(params);
        const allTasks = taskStorage.getAll();
        
        const filter: Partial<Task> = {};
        if (validatedParams.status) filter.status = validatedParams.status;
        if (validatedParams.priority) filter.priority = validatedParams.priority;
        
        // Apply filters if any
        const filteredTasks = Object.keys(filter).length > 0
          ? allTasks.filter(task => {
              return Object.entries(filter).every(([key, value]) => 
                task[key as keyof Task] === value
              );
            })
          : allTasks;
        
        return JSON.stringify({
          tasks: filteredTasks,
          count: filteredTasks.length,
          filters: Object.keys(filter).length > 0 ? filter : "none"
        });
      } catch (error) {
        return JSON.stringify({ 
          error: `Invalid list parameters: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });
  
  // Tool to get next task
  server.addTool({
    name: "next_task",
    description: "Get the next highest priority todo task and mark it as in-progress.",
    execute: async () => {
      try {
        const nextTask = taskStorage.getHighestPriority("todo");
        
        if (!nextTask) {
          return JSON.stringify({
            message: "No todo tasks found",
            task: null
          });
        }
        
        // Update task status to in-progress
        const updatedTask = taskStorage.update(nextTask.id, {
          status: "in-progress"
        });
        
        return JSON.stringify({
          task: updatedTask,
          message: "Task marked as in-progress"
        });
      } catch (error) {
        return JSON.stringify({ 
          error: `Failed to get next task: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });
  
  // Tool to complete task
  server.addTool({
    name: "complete_task",
    description: "Mark a task as completed.",
    execute: async (params: any) => {
      try {
        // Validate input parameters
        const validatedParams = CompleteTaskSchema.parse(params);
        const task = taskStorage.get(validatedParams.id);
        
        if (!task) {
          return JSON.stringify({
            error: `Task with ID ${validatedParams.id} not found`
          });
        }
        
        // Update task status to done
        const updatedTask = taskStorage.update(validatedParams.id, { 
          status: "done"
        });
        
        return JSON.stringify({
          task: updatedTask,
          message: "Task marked as completed"
        });
      } catch (error) {
        return JSON.stringify({ 
          error: `Invalid complete_task parameters: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });
  
  // Tool to update tasks
  server.addTool({
    name: "update_tasks",
    description: "Update multiple tasks with new values.",
    execute: async (params: any) => {
      try {
        // Validate input parameters
        const validatedParams = UpdateTasksSchema.parse(params);
        const results = [];
        
        for (const { id, ...changes } of validatedParams.updates) {
          try {
            // Verify task exists
            const task = taskStorage.get(id);
            
            if (!task) {
              results.push({
                id,
                success: false,
                error: `Task with ID ${id} not found`
              });
              continue;
            }
            
            // Validate dependencies if they exist
            if (changes.dependsOn) {
              const missingDependencies = changes.dependsOn.filter(depId => !taskStorage.get(depId));
              if (missingDependencies.length > 0) {
                results.push({
                  id,
                  success: false,
                  error: `Dependencies not found: ${missingDependencies.join(', ')}`
                });
                continue;
              }
            }
            
            // Update task
            const updatedTask = taskStorage.update(id, changes);
            
            results.push({
              id,
              success: true,
              task: updatedTask
            });
          } catch (error) {
            results.push({
              id,
              success: false,
              error: `Error updating task: ${error instanceof Error ? error.message : String(error)}`
            });
          }
        }
        
        return JSON.stringify({
          updates: results,
          success: results.filter((r: any) => r.success).length,
          failed: results.filter((r: any) => !r.success).length
        });
      } catch (error) {
        return JSON.stringify({ 
          error: `Invalid update_tasks parameters: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  });
}