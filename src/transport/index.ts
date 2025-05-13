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
    const _TOOL_SCAN_TIMEOUT = parseInt(process.env.TOOL_SCAN_TIMEOUT || '60000', 10);
    
    // Enhanced scanning options for Smithery 2025 compatibility
    const _SCAN_RETRY_COUNT = parseInt(process.env.SCAN_RETRY_COUNT || '3', 10);
    const _SCAN_CONCURRENCY = parseInt(process.env.SCAN_CONCURRENCY || '10', 10);
    const _STATELESS_MODE = process.env.STATELESS_MODE === 'true';
    const _ASYNC_SCANNING = process.env.ASYNC_SCANNING !== 'false'; // Default to true
    
    // Log scanning configuration when in tool scan mode
    if (isToolScanMode) {
      console.error(`[INFO] [transport] Tool scan mode enabled with timeout: ${_TOOL_SCAN_TIMEOUT}ms`);
      console.error(`[INFO] [transport] Scan configuration: retries=${_SCAN_RETRY_COUNT}, concurrency=${_SCAN_CONCURRENCY}, async=${_ASYNC_SCANNING}, stateless=${_STATELESS_MODE}`);
      
      // Additional logging to help with Smithery diagnostics
      console.error(`[INFO] [transport] Smithery compatibility mode active`);
      console.error(`[INFO] [transport] Node version: ${process.version}`);
      console.error(`[INFO] [transport] Using simplified transport initialization for stability`);
    }

    // Determine transport type from environment variable, defaulting to streamable-http
    const transportType = process.env.MCP_TRANSPORT || "streamable-http";

    // Start the server with the appropriate transport
    if (transportType === "stdio") {
      setupStdioTransport(server);
    } else {
      // For Smithery compatibility, always use streamable-HTTP regardless of what was requested
      // This provides better reliability for tool scanning
      const effectiveTransport = isToolScanMode ? "streamable-http" : transportType;
      
      if (isToolScanMode && transportType !== "streamable-http") {
        console.error(`[INFO] [transport] Overriding transport to streamable-http for tool scanning reliability`);
      }
      
      // Pass enhanced scanning options
      setupHttpTransport(server, isToolScanMode, _TOOL_SCAN_TIMEOUT, {
        scanRetryCount: _SCAN_RETRY_COUNT,
        scanConcurrency: _SCAN_CONCURRENCY,
        asyncScanning: _ASYNC_SCANNING,
        statelessMode: _STATELESS_MODE
      });
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