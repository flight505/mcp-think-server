import { FastMCP, Tool } from 'fastmcp';
import { toolManager, ToolLimitError, ToolNotPermittedError } from './ToolManager.js';
import { graph, memoryStore } from '../memory/store/index.js';
import axios from 'axios';

// Tools that work with file operations (to intercept for caching)
const FILE_TOOLS = ['read_file', 'list_dir', 'file_search'];

// Tools that work with URL operations (to intercept for caching)
const URL_TOOLS = ['web_search', 'exa_search', 'exa_answer', 'mcp_think-tool_exa_search', 'mcp_think-tool_exa_answer'];

/**
 * Creates a wrapped tool that uses the ToolManager for tracking and limits
 * @param tool The FastMCP tool to wrap
 * @param agentId The ID of the agent calling the tool
 * @returns A wrapped tool with the same interface
 */
export function createManagedTool(tool: Tool<any, any>, agentId: string = 'default'): Tool<any, any> {
  // Create a wrapper for the execute function
  const originalExecute = tool.execute;
  
  // Create the wrapped execute function that uses ToolManager
  const wrappedExecute = async (...args: any[]) => {
    try {
      return await toolManager.callTool(agentId, tool.name, args[0]);
    } catch (error) {
      if (error instanceof ToolLimitError) {
        // Log to memory with tags for limit_reached
        try {
          await memoryStore.add('ToolCallLimits', `Tool call limit reached by agent ${agentId}. Tool: ${tool.name}`, {
            tags: ['limit_reached'],
            agent: agentId
          });
          await memoryStore.save();
        } catch (memoryError) {
          console.error('Failed to log to memory:', memoryError);
        }
      }
      throw error;
    }
  };
  
  // Clone the tool and replace the execute function
  return {
    ...tool,
    execute: wrappedExecute
  };
}

/**
 * Wrap FastMCP's addTool method to use the ToolManager
 * @param server The FastMCP server instance
 * @param defaultAgentId The default agent ID to use if not provided
 */
export function wrapFastMCP(server: FastMCP, defaultAgentId: string = 'default'): void {
  // Store the original addTool method
  const originalAddTool = server.addTool.bind(server);
  
  // Set up the executeToolCall method on toolManager to call the real tools
  // @ts-expect-error - we're accessing a private method
  toolManager.executeToolCall = async (toolName: string, params: any) => {
    // Find the tool in FastMCP by name
    // Since server.getTool is not accessible, we use a workaround
    // We maintain a local cache of tools as they're added
    if (!wrapFastMCP.toolCache.has(toolName)) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    // Get the original tool from our cache
    const originalTool = wrapFastMCP.toolCache.get(toolName);
    
    // Call the original execute method directly
    return await originalTool!.execute(params, { log: console, direct: true } as any);
  };
  
  // Initialize tool cache
  if (!wrapFastMCP.toolCache) {
    wrapFastMCP.toolCache = new Map<string, Tool<any, any>>();
  }
  
  // Replace with our wrapped version
  server.addTool = (tool: Tool<any, any>) => {
    // Store the original execute method
    const originalExecute = tool.execute;
    
    // Store the original tool in our cache
    wrapFastMCP.toolCache.set(tool.name, { ...tool, execute: originalExecute });
    
    // Create a wrapped tool that uses our monitoring
    const wrappedTool = {
      ...tool,
      execute: async (params: any, context: any) => {
        try {
          // If direct execution, bypass ToolManager to avoid double counting
          if (context?.direct === true) {
            return await originalExecute(params, context);
          }
          
          // Get the agent ID from context or use default
          const agentId = context?.agentId || defaultAgentId;
          
          // Reset tool manager counter at the start of a new user interaction
          // This ensures the tool call limit only applies to consecutive tool calls within a single interaction
          if (context?.isNewTurn === true || context?.conversation?.isNewMessage === true || context?.isFirstToolInRequest === true) {
            console.error('[INFO] [tools] Resetting tool call limit counter for new user interaction');
            toolManager.reset();
          }
          
          // Check if this is an Exa search tool that needs special handling
          if (URL_TOOLS.includes(tool.name)) {
            return await handleUrlTool(tool.name, params, agentId, originalExecute, context);
          }
          
          // Check if this is a file tool that needs special handling
          if (FILE_TOOLS.includes(tool.name)) {
            return await handleFileTool(tool.name, params, agentId, originalExecute, context);
          }
          
          // Use ToolManager to call the tool
          return await toolManager.callTool(agentId, tool.name, params);
        } catch (error) {
          if (error instanceof ToolLimitError) {
            // Store that limits were reached in memory
            try {
              await memoryStore.add('ToolCallLimits', `Tool call limit reached. Tool: ${tool.name}`, {
                tags: ['limit_reached'],
                version: '1.0'
              });
              await memoryStore.save();
            } catch (memoryError) {
              console.error('Failed to log to memory:', memoryError);
            }
            
            // Return a partial result with status
            return JSON.stringify({
              status: 'HALTED_LIMIT',
              message: `${error.message}. Tool execution halted.`,
              partial: true
            });
          }
          
          if (error instanceof ToolNotPermittedError) {
            return JSON.stringify({
              status: 'HALTED_NOT_PERMITTED',
              message: error.message,
              partial: true
            });
          }
          
          // Re-throw other errors
          throw error;
        }
      }
    };
    
    // Add the wrapped tool to FastMCP
    return originalAddTool(wrappedTool);
  };
  
  // Hook into the request handler to reset tool counter for each new request
  // @ts-ignore - handleRequest might not be in the type definitions but exists at runtime
  const originalHandleRequest = server.handleRequest?.bind(server);
  if (originalHandleRequest) {
    // @ts-ignore - we're extending the server with our own functionality
    server.handleRequest = async (...args: unknown[]) => {
      // Reset tool counter at the start of each new request
      toolManager.reset();
      console.error('[INFO] [tools] Tool call limit counter reset for new request');
      
      // Call original handler
      return await originalHandleRequest(...args);
    };
  }
}

/**
 * Handle URL-based tools with caching (especially Exa)
 * @param toolName The name of the tool
 * @param params Tool parameters
 * @param agentId Agent ID
 * @param originalExecute Original execute function
 * @param context Execution context
 * @returns Tool execution result
 */
async function handleUrlTool(
  toolName: string,
  params: any,
  agentId: string,
  originalExecute: (params: any, context: any) => Promise<any>,
  context: any
): Promise<any> {
  // Generate a cache key based on the tool name and params
  const cacheKey = `${toolName}:${JSON.stringify(params)}`;
  
  // Increment the tool call counter
  await toolManager.callTool(agentId, toolName, params);
  
  try {
    // Special handling for all Exa tools
    if (toolName.includes('exa_search') || toolName.includes('exa_answer')) {
      const result = await callExaSearch(originalExecute, params, context);
      
      // Store successful result in cache
      toolManager.setContentCacheItem(cacheKey, result);
      
      return result;
    }
    
    // Generic URL tool handling
    const result = await originalExecute(params, { ...context, direct: true });
    return result;
  } catch (error: any) {
    // Return a properly formatted error instead of throwing
    return JSON.stringify({
      status: 'ERROR',
      message: `Error executing URL tool ${toolName}: ${error.message}`,
      query: params
    });
  }
}

/**
 * Safely call Exa search with error handling for non-JSON responses
 * @param originalExecute Original execute function
 * @param params Search parameters
 * @param context Execution context
 * @returns Properly formatted search results
 */
async function callExaSearch(
  originalExecute: (params: any, context: any) => Promise<any>, 
  params: any, 
  context: any
): Promise<any> {
  // Store original console functions
  const originalLog = console.log;
  const originalError = console.error;
  
  try {
    // Temporarily disable console output to prevent it from mixing with JSON
    console.log = () => {};
    console.error = () => {};
    
    // Execute the tool with suppressed logging
    const result = await originalExecute(params, { ...context, direct: true });
    return result;
  } catch (error: any) {
    // Return properly formatted error JSON instead of throwing
    return JSON.stringify({
      status: 'ERROR',
      message: `Error executing Exa search: ${error.message}`,
      query: params.query
    });
  } finally {
    // Always restore original console functions
    console.log = originalLog;
    console.error = originalError;
  }
}

/**
 * Handle file-based tools with caching
 * @param toolName The name of the tool
 * @param params Tool parameters
 * @param agentId Agent ID
 * @param originalExecute Original execute function
 * @param context Execution context
 * @returns Tool execution result
 */
async function handleFileTool(
  toolName: string,
  params: any,
  agentId: string,
  originalExecute: (params: any, context: any) => Promise<any>,
  context: any
): Promise<any> {
  // File tools already have built-in caching at OS level
  // Just increment the tool call counter and execute
  await toolManager.callTool(agentId, toolName, params);
  
  try {
    const result = await originalExecute(params, { ...context, direct: true });
    return result;
  } catch (error: any) {
    // Return properly formatted error JSON instead of throwing
    return JSON.stringify({
      status: 'ERROR',
      message: `Error executing file tool ${toolName}: ${error.message}`,
      query: params
    });
  }
}

// Attach tool cache to wrapFastMCP function for tracking
wrapFastMCP.toolCache = new Map<string, Tool<any, any>>();

/**
 * Install the required dependencies if they're not already installed
 */
export async function ensureDependencies(): Promise<void> {
  const dependencies = [
    { name: 'lru-cache', description: 'LRU cache for tool call limiting' },
    { name: 'axios', description: 'HTTP client for improved URL fetching' }
  ];
  
  for (const dep of dependencies) {
    try {
      // Try to import the dependency to check if it's available
      await import(dep.name);
      console.log(`${dep.name} dependency is already installed`);
    } catch (error) {
      console.log(`Installing ${dep.name} dependency...`);
      
      try {
        // Use dynamic import for child_process
        const childProcess = await import('child_process');
        const { exec } = childProcess;
        
        // Run npm install
        await new Promise<void>((resolve, reject) => {
          exec(`npm install ${dep.name}`, (error: Error | null) => {
            if (error) {
              console.error(`Failed to install ${dep.name}:`, error);
              reject(error);
              return;
            }
            console.log(`${dep.name} installed successfully`);
            resolve();
          });
        });
      } catch (importError) {
        console.error('Failed to import child_process:', importError);
        console.error(`Please install ${dep.name} manually with: npm install ${dep.name}`);
      }
    }
  }
} 