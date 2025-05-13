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
    
    // Extract HTTP specific configuration if needed
    const host = process.env.MCP_HOST || "0.0.0.0"; // Default to all interfaces
    const port = parseInt(process.env.MCP_PORT || "8000", 10);
    const path = process.env.MCP_PATH || "/mcp";
    
    // For Smithery compatibility, always use streamable-HTTP during tool scanning
    const effectiveTransport = isToolScanMode ? "streamable-http" : transportType;
    
    if (isToolScanMode && transportType !== "streamable-http") {
      console.error(`[INFO] [transport] Overriding transport to streamable-http for tool scanning reliability`);
    }
    
    // Setup the appropriate transport
    if (effectiveTransport === "stdio") {
      setupStdioTransport(server);
    } else {
      // For all HTTP-based transports, use setupHttpTransport with the appropriate options
      setupHttpTransport(server, isToolScanMode, _TOOL_SCAN_TIMEOUT, {
        scanRetryCount: _SCAN_RETRY_COUNT,
        scanConcurrency: _SCAN_CONCURRENCY,
        asyncScanning: _ASYNC_SCANNING,
        statelessMode: _STATELESS_MODE
      }, {
        host,
        port,
        endpointPath: path
      });
    }
    
    // Start connection monitoring with timeout specified by Smithery (2 minutes)
    const smitheryTimeout = process.env.AUTO_SHUTDOWN_MS ? 
      parseInt(process.env.AUTO_SHUTDOWN_MS, 10) : 
      120000; // Default to 2 minutes as per Smithery docs
    
    startConnectionCheck(isToolScanMode, smitheryTimeout);
    
    // Reset inactivity timer
    resetInactivityTimer();
    
    console.error(`[INFO] [transport] Server successfully started with ${effectiveTransport} transport`);
    
  } catch (error) {
    console.error(`[ERROR] [transport] Failed to start server transport: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 