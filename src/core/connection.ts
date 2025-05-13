import http from 'http';
import { ServerOptions } from 'http';
import { serverState, resetInactivityTimer, gracefulShutdown } from './index.js';

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
    
    // Set up event listener for when the connection closes
    socket.on('close', () => {
      serverState.connectionCount = Math.max(0, serverState.connectionCount - 1);
    });
  });
  
  // Track when a new request comes in
  httpServer.on('request', (req, res) => {
    // Determine if this is a tool list request (typical for Smithery scanning)
    const isToolListRequest = req.url?.includes('/rpc.listTools') || 
                             req.url?.includes('list_tools') ||
                             req.url?.includes('toolList');
    
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
export function getServerOptions(isToolScanMode: boolean, toolScanTimeout: number): ServerOptions {
  return isToolScanMode 
    ? { keepAliveTimeout: toolScanTimeout } 
    : { keepAliveTimeout: 3600000 }; // 1 hour for normal mode
} 