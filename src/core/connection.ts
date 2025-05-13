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
 * Declare custom global properties for TypeScript
 */
declare global {
  var resetInactivityTimer: () => void;
}

/**
 * Start monitoring connections to detect inactivity
 * 
 * @param isToolScanMode Whether the server is running in tool scan mode
 * @param autoShutdownMs Timeout in milliseconds before automatic shutdown due to inactivity (default: 120000)
 */
export function startConnectionCheck(isToolScanMode: boolean, autoShutdownMs: number = 120000): void {
  // In tool scan mode, we disable connection checking to prevent timeouts during Smithery scanning
  if (isToolScanMode) {
    console.error('[INFO] [connection] Connection checking disabled during tool scanning');
    return;
  }
  
  // Check if auto shutdown is explicitly disabled
  if (autoShutdownMs <= 0) {
    console.error('[INFO] [connection] Auto-shutdown disabled by configuration');
    return;
  }
  
  // Set up inactivity timer based on Smithery requirements (default 2 minutes)
  console.error(`[INFO] [connection] Setting up inactivity timer: ${autoShutdownMs}ms`);
  
  // Initial timer setup
  let inactivityTimer = setTimeout(() => {
    console.error(`[INFO] [connection] No activity detected for ${autoShutdownMs}ms, shutting down...`);
    gracefulShutdown();
  }, autoShutdownMs);
  
  // Override resetInactivityTimer to use our timeout
  const originalResetTimer = resetInactivityTimer;
  global.resetInactivityTimer = () => {
    // Clear existing timer
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Create new timer
    inactivityTimer = setTimeout(() => {
      console.error(`[INFO] [connection] No activity detected for ${autoShutdownMs}ms, shutting down...`);
      gracefulShutdown();
    }, autoShutdownMs);
    
    // Call original if it exists
    if (originalResetTimer && typeof originalResetTimer === 'function') {
      originalResetTimer();
    }
  };
}

/**
 * Setup connection tracking for HTTP server
 * 
 * @param httpServer HTTP server instance
 * @returns Modified HTTP server with connection tracking
 */
export function setupConnectionTracking(httpServer: http.Server): http.Server {
  console.error('[INFO] [connection] Setting up HTTP connection tracking');
  
  // Track connections
  let connections = new Set<any>();
  
  // Add connection
  httpServer.on('connection', (socket) => {
    connections.add(socket);
    
    // Remove connection when closed
    socket.on('close', () => {
      connections.delete(socket);
    });
    
    // Reset inactivity timer on new connection
    resetInactivityTimer();
  });
  
  // Handle requests with CORS headers for Smithery compatibility
  httpServer.on('request', (req, res) => {
    // Add CORS headers for better Smithery compatibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
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
 * Get enhanced server options for HTTP transport
 * 
 * @param isToolScanMode Whether the server is running in tool scan mode
 * @param toolScanTimeout Timeout for tool scanning in milliseconds
 * @returns Server options object
 */
export function getServerOptions(isToolScanMode: boolean, toolScanTimeout: number): EnhancedServerOptions {
  // Basic options
  const options: EnhancedServerOptions = isToolScanMode 
    ? {
        // During tool scanning, use extended timeouts
        timeout: toolScanTimeout,
        headersTimeout: toolScanTimeout,
        keepAliveTimeout: toolScanTimeout / 2,
        toolScanTimeout,
      }
    : {
        // For normal operation, use reasonable defaults
        timeout: 120000,
        headersTimeout: 120000,
        keepAliveTimeout: 60000,
      };
  
  return options;
} 