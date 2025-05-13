import { FastMCP } from 'fastmcp';
import { resetInactivityTimer } from '../core/index.js';
import { startConnectionCheck } from '../core/connection.js';
import { setupStdioTransport, setupHttpTransport } from './handlers.js';

/**
 * Start the server with the appropriate transport
 * 
 * @param server FastMCP server instance
 * @param isToolScanMode Whether the server is in tool scan mode
 */
export async function startServer(server: FastMCP, isToolScanMode: boolean): Promise<void> {
  try {
    // Get configuration from environment
    const _REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '300', 10);
    const _TOOL_SCAN_TIMEOUT = parseInt(process.env.TOOL_SCAN_TIMEOUT || '30000', 10);

    // Determine transport type from environment variable, defaulting to streamable-http
    const transportType = process.env.MCP_TRANSPORT || "streamable-http";

    // Start the server with the appropriate transport
    if (transportType === "stdio") {
      setupStdioTransport(server);
    } else {
      // Default to HTTP/streamable-HTTP transport for any other transport type
      if (transportType !== "streamable-http" && transportType !== "http") {
        console.error(`[WARN] [transport] Unsupported transport type: ${transportType}. Defaulting to streamable-HTTP transport.`);
      }
      
      setupHttpTransport(server, isToolScanMode, _TOOL_SCAN_TIMEOUT);
    }
    
    // Start connection monitoring
    startConnectionCheck(isToolScanMode);
    
    // Reset inactivity timer
    resetInactivityTimer();
    
    console.error(`[INFO] [transport] Server successfully started with ${transportType} transport`);
    
  } catch (error) {
    console.error(`[ERROR] [transport] Error starting server: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 