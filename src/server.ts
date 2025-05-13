// src/server.ts
// Import console redirections first to ensure all logging is properly handled
import './utils/console.js';

import { initializeServer, resetInactivityTimer } from './core/index.js';
import { startServer } from './transport/index.js';
import { createCleanupScript } from './utils/process.js';

// Detect if tool scanning is in progress
const isToolScanMode = process.env.SMITHERY_TOOL_SCAN === 'true' || 
                        process.argv.includes('--tool-scan') ||
                        process.argv.includes('--scan-tools');

// Main server startup function
async function main() {
  try {
    console.error('[INFO] [server] Starting MCP Think Tank server...');
    
    // Initialize server
    const server = await initializeServer();
    
    // Start the server with the appropriate transport
    await startServer(server, isToolScanMode);
    
    // Reset inactivity timer
    resetInactivityTimer();
    
    // Create cleanup script
    createCleanupScript();
    
  } catch (error) {
    console.error(`[ERROR] [server] Server startup failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(`[ERROR] [server] Uncaught error in main: ${error instanceof Error ? error.message : String(error)}`);
});

// Start the server
main().catch((error) => {
  console.error(`[ERROR] [server] Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});