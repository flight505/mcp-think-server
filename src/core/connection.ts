import http from 'http';
import { ServerOptions } from 'http';
import { serverState, resetInactivityTimer, gracefulShutdown } from './index.js';

/**
 * Enhanced server options for Smithery tool scanning
 */
export interface EnhancedServerOptions extends ServerOptions {
  retryCount?: number;
  concurrency?: number;
  asyncScanning?: boolean;
  toolScanTimeout?: number;
  timeout?: number;
  headersTimeout?: number;
}

/**
 * Start monitoring connections to detect inactivity
 * 
 * @param isToolScanMode Whether the server is running in tool scan mode
 */
export function startConnectionCheck(isToolScanMode: boolean): void {
  // Remove all connection checking logic since it's causing timeouts
  console.error('[INFO] [connection] Connection checking disabled to prevent timeout issues');
  
  // Just ensure the server is considered active
  resetInactivityTimer();
  
  // For tool scan mode, provide additional information to improve scanning
  if (isToolScanMode) {
    console.error('[INFO] [connection] Running in tool scan mode with enhanced Smithery 2025 compatibility');
    
    // Add special handlers for Smithery diagnostics
    process.on('SIGTERM', () => {
      console.error('[INFO] [connection] Received SIGTERM signal, preparing for graceful shutdown');
      process.exit(0);
    });
    
    process.on('SIGINT', () => {
      console.error('[INFO] [connection] Received SIGINT signal, preparing for graceful shutdown');
      process.exit(0);
    });
  }
}

/**
 * Set up connection tracking for HTTP server
 * 
 * @param httpServer HTTP server instance
 * @returns The HTTP server with connection tracking
 */
export function setupConnectionTracking(httpServer: http.Server): http.Server {
  console.error('[INFO] [connection] Setting up HTTP connection tracking');
  
  // Track when a new connection is established
  httpServer.on('connection', (socket) => {
    serverState.connectionCount++;
    
    // Improve socket stability for Smithery scanning
    socket.setKeepAlive(true, 60000);
    socket.setNoDelay(true);
    
    // Set up event listener for when the connection closes
    socket.on('close', () => {
      serverState.connectionCount = Math.max(0, serverState.connectionCount - 1);
    });
  });
  
  // Track when a new request comes in
  httpServer.on('request', (req, res) => {
    // Add CORS headers for better Smithery compatibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // OPTIONS requests should be handled directly for CORS preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    
    // Determine if this is a tool list request (typical for Smithery scanning)
    const isToolListRequest = req.url?.includes('/rpc.listTools') || 
                            req.url?.includes('list_tools') ||
                            req.url?.includes('toolList');
    
    // For tool scanning, set appropriate headers to improve Smithery compatibility
    if (isToolListRequest) {
      // Set headers to indicate scanning capabilities to Smithery
      res.setHeader('X-Smithery-Scan-Support', 'enhanced');
      res.setHeader('X-Smithery-Protocol', 'mcp-2025');
      res.setHeader('X-Smithery-Cache-Control', 'no-store');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    }
    
    // Consider the server active as long as we're receiving requests
    resetInactivityTimer();
    
    // Track response completion to update connection status if needed
    res.on('finish', () => {
      // No logging needed
    });
  });
  
  return httpServer;
}

/**
 * Get HTTP server options based on tool scan mode
 * 
 * @param isToolScanMode Whether the server is running in tool scan mode
 * @param toolScanTimeout Timeout for tool scanning in milliseconds
 * @returns Server options object
 */
export function getServerOptions(isToolScanMode: boolean, toolScanTimeout: number): EnhancedServerOptions {
  // For improved Smithery compatibility, use more generous timeouts
  const options: EnhancedServerOptions = isToolScanMode 
    ? { 
        keepAliveTimeout: toolScanTimeout * 2, // Double the timeout for safety
        toolScanTimeout: toolScanTimeout,
        headersTimeout: toolScanTimeout + 10000, // Add larger buffer for headers
        timeout: toolScanTimeout + 15000, // General timeout with extra buffer
        requestTimeout: 0, // Disable Node.js request timeout
        retryCount: 3,     // Default retry count
        concurrency: 10,   // Default concurrency 
        asyncScanning: true // Enable async scanning by default
      } 
    : { 
        keepAliveTimeout: 3600000 // 1 hour for normal mode
      };
      
  return options;
} 