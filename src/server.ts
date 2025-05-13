// src/server.ts
// Import console redirections first to ensure all logging is properly handled
import './utils/console.js';

import { initializeServer, resetInactivityTimer } from './core/index.js';
import { startServer } from './transport/index.js';
import { createCleanupScript } from './utils/process.js';
import { config } from './config.js';

// Enhanced detection of Smithery tool scanning mode
const isToolScanMode = 
  process.env.SMITHERY_TOOL_SCAN === 'true' || 
  process.env.MCP_TOOL_SCAN_MODE === 'true' ||
  process.env.SCAN_TOOLS === 'true' ||
  process.argv.includes('--tool-scan') ||
  process.argv.includes('--scan-tools');

// Extract Smithery MCP version for compatibility reporting
const smitheryVersion = process.env.SMITHERY_VERSION || '2025';

// Main server startup function
async function main() {
  try {
    console.error(`[INFO] [server] Starting MCP Think Tank server v${config.version}...`);
    
    // Log enhanced Smithery compatibility information
    if (isToolScanMode) {
      console.error(`[INFO] [server] Running in Smithery tool scan mode (compatibility: ${smitheryVersion})`);
      console.error('[INFO] [server] Enhanced tool scanning enabled with asynchronous support');
    }
    
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