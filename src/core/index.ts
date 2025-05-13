import { FastMCP } from "fastmcp";
import { config } from "../config.js";
import { wrapFastMCP, ensureDependencies } from "../tools/FastMCPAdapter.js";
import { registerAllTools } from "./tools.js";
import { setupResources } from "./resources.js";
import { initializeProcess, cleanupProcess, ProcessInfo, createCleanupScript } from "../utils/process.js";
import { taskStorage } from "../tasks/storage.js";

// Server state globals
export const serverState = {
  connectionCount: 0,
  inactivityTimer: null as NodeJS.Timeout | null,
  connectionCheckTimer: null as NodeJS.Timeout | null,
  processInfo: null as ProcessInfo | null,
  httpServer: null as any,
};

/**
 * Initialize the server
 * @returns Initialized FastMCP server
 */
export async function initializeServer(): Promise<FastMCP> {
  // Initialize the process
  serverState.processInfo = await initializeProcess();
  
  // Make sure we have all necessary dependencies
  await ensureDependencies();
  
  // Create server instance
  const server = new FastMCP({
    name: "MCP Think Tank",
    version: config.version as `${number}.${number}.${number}`
  });
  
  // Wrap server with our adapters
  wrapFastMCP(server);

  // Set up event handlers
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
  
  // Handle parent process disconnection (if running as a child process)
  process.on("disconnect", () => {
    console.error("[WARN] [core] Parent process disconnected, shutting down...");
    gracefulShutdown();
  });
  
  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error(`[ERROR] [core] Uncaught exception: ${error.message}`);
    gracefulShutdown();
  });
  
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[ERROR] [core] Critical error detected, shutting down server...");
    
    // Try to extract error details
    let errorMessage = "Unknown reason";
    
    if (reason instanceof Error) {
      errorMessage = reason.message;
    } else if (reason) {
      errorMessage = String(reason);
    }
    
    console.error(`[ERROR] [core] Unhandled rejection: ${errorMessage}`);
    gracefulShutdown();
  });
  
  // Register resource templates
  await setupResources(server);
  
  // Register all tools
  await registerAllTools(server);
  
  // Set up auto-shutdown timer
  resetInactivityTimer();
  
  return server;
}

/**
 * Reset the inactivity timer
 */
export function resetInactivityTimer(): void {
  const { autoShutdownMs } = config;
  
  if (serverState.inactivityTimer) {
    clearTimeout(serverState.inactivityTimer);
  }
  
  if (autoShutdownMs > 0) {
    serverState.inactivityTimer = setTimeout(() => {
      console.error(`[INFO] [core] Server inactive for ${autoShutdownMs}ms, shutting down...`);
      gracefulShutdown();
    }, autoShutdownMs);
  }
}

/**
 * Graceful shutdown function
 */
export function gracefulShutdown() {
  console.error("[INFO] [core] Shutting down MCP Think Tank server...");
  
  // Clear any pending timeouts in task storage
  if (taskStorage && typeof taskStorage.clearAllTimeouts === "function") {
    taskStorage.clearAllTimeouts();
  }
  
  // Clear inactivity timer if exists
  if (serverState.inactivityTimer) {
    clearTimeout(serverState.inactivityTimer);
    serverState.inactivityTimer = null;
  }
  
  // Clear connection check timer if exists
  if (serverState.connectionCheckTimer) {
    clearInterval(serverState.connectionCheckTimer);
    serverState.connectionCheckTimer = null;
  }
  
  // Clean up process resources
  if (serverState.processInfo) {
    cleanupProcess(serverState.processInfo);
  }
  
  // Gracefully stop the server (if needed)
  try {
    // Save any pending tasks
    taskStorage.saveImmediately();
    
    console.error("[INFO] [core] Server shut down successfully");
    process.exit(0);
  } catch (error) {
    console.error(`[ERROR] [core] Error during shutdown: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Log a message
 * @param message Message to log
 */
export function log(message: string): void {
  console.error(message);
}

// For backward compatibility
export const safeErrorLog = (message: string) => {
  console.error(message);
};