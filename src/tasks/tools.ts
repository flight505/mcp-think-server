import { FastMCP } from "fastmcp";
import { taskStorage } from "./storage.js";
import { Task } from "./model.js";

/**
 * Register task management tools with the MCP server
 * 
 * @param server FastMCP server instance
 */
export function registerTaskTools(server: FastMCP): void {
  // Tool to plan tasks
  server.addTool({
    name: "plan_tasks",
    description: "Create multiple tasks from a plan. Generates IDs and syncs with knowledge graph.",
    execute: async (params: any) => {
      const { tasks } = params;
      const createdTasks = [];
      
      for (const task of tasks) {
        const newTask = taskStorage.add(task);
        createdTasks.push(newTask);
      }
      
      return JSON.stringify({ 
        tasks: createdTasks,
        message: `Created ${createdTasks.length} tasks`
      });
    }
  });
  
  // Tool to list tasks
  server.addTool({
    name: "list_tasks",
    description: "List tasks with optional filtering by status and priority.",
    execute: async (params: any) => {
      const { status, priority } = params;
      const allTasks = taskStorage.getAll();
      
      const filter: Partial<Task> = {};
      if (status) filter.status = status as any;
      if (priority) filter.priority = priority as any;
      
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
    }
  });
  
  // Tool to get next task
  server.addTool({
    name: "next_task",
    description: "Get the next highest priority todo task and mark it as in-progress.",
    execute: async () => {
      const nextTask = taskStorage.getHighestPriority("todo");
      
      if (!nextTask) {
        return JSON.stringify({
          message: "No todo tasks found",
          task: null
        });
      }
      
      // Update task status to in-progress
      const updatedTask = taskStorage.update(nextTask.id, {
        status: "in-progress",
        updated: new Date().toISOString()
      });
      
      return JSON.stringify({
        task: updatedTask,
        message: "Task marked as in-progress"
      });
    }
  });
  
  // Tool to complete task
  server.addTool({
    name: "complete_task",
    description: "Mark a task as completed.",
    execute: async (params: any) => {
      const { id } = params;
      const task = taskStorage.get(id);
      
      if (!task) {
        return JSON.stringify({
          error: `Task with ID ${id} not found`
        });
      }
      
      // Update task status to done
      const updatedTask = taskStorage.update(id, { 
        status: "done",
        updated: new Date().toISOString()
      });
      
      return JSON.stringify({
        task: updatedTask,
        message: "Task marked as completed"
      });
    }
  });
  
  // Tool to update tasks
  server.addTool({
    name: "update_tasks",
    description: "Update multiple tasks with new values.",
    execute: async (params: any) => {
      const { updates } = params;
      const results = [];
      
      for (const { id, ...changes } of updates) {
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
          
          // Add updated timestamp
          const updatedTask = taskStorage.update(id, {
            ...changes,
            updated: new Date().toISOString()
          });
          
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
    }
  });
}