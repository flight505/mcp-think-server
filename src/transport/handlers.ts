import { FastMCP } from "fastmcp";
import { setupConnectionTracking, getServerOptions } from "../core/connection.js";
import http from "http";
import { ServerOptions } from "http";
import { config } from "../config.js";

/**
 * Enhanced scanning options for Smithery 2025 compatibility
 */
export interface ScanOptions {
  scanRetryCount?: number;
  scanConcurrency?: number;
  asyncScanning?: boolean;
  statelessMode?: boolean;
}

/**
 * Creates HTTP/SSE server configuration for FastMCP
 * 
 * @param port Server port
 * @param host Host to bind to
 * @param endpointPath API endpoint path
 * @param serverOptions HTTP server options
 * @param scanOptions Enhanced scan options
 * @returns FastMCP server configuration object
 */
export function createHttpServerConfig(
  port: number,
  host: string,
  endpointPath: string,
  serverOptions: ServerOptions,
  scanOptions?: ScanOptions
): any {
  // Basic configuration
  const config: any = {
    transportType: "sse", // FastMCP TypeScript type expects "sse" but we use it for streamable-http
    sse: {
      port,
      endpoint: endpointPath.startsWith("/") ? endpointPath as `/${string}` : `/${endpointPath}` as `/${string}`,
      host, // FastMCP 1.27.6 supports host in the configuration
      createServer: (requestListener: http.RequestListener) => {
        // Create HTTP server and capture reference for connection tracking
        const httpServer = http.createServer(serverOptions, requestListener);
        return setupConnectionTracking(httpServer);
      }
    }
  };

  // Add enhanced scan options if provided
  if (scanOptions) {
    config.scanOptions = {
      retryCount: scanOptions.scanRetryCount,
      concurrency: scanOptions.scanConcurrency,
      async: scanOptions.asyncScanning,
      stateless: scanOptions.statelessMode
    };
  }

  return config;
}

/**
 * Configure and start server with STDIO transport
 * 
 * @param server FastMCP server instance
 */
export function setupStdioTransport(server: FastMCP): void {
  console.error(`[WARN] [transportHandlers] STDIO transport is deprecated and will be removed in a future version. Please switch to streamable-http transport.`);
  server.start();
  console.error(`[INFO] [transportHandlers] MCP Think Tank server v${config.version} started successfully with STDIO transport`);
}

/**
 * Configure and start server with HTTP/streamable-HTTP transport
 * 
 * @param server FastMCP server instance
 * @param isToolScanMode Whether the server is running in tool scan mode
 * @param toolScanTimeout Timeout for tool scanning in milliseconds
 * @param scanOptions Enhanced scan options
 * @param options Configuration options
 */
export function setupHttpTransport(
  server: FastMCP,
  isToolScanMode: boolean,
  toolScanTimeout: number,
  scanOptions?: ScanOptions,
  options: {
    host?: string,
    port?: number,
    endpointPath?: string
  } = {}
): void {
  // Extract config with defaults
  const port = options.port || parseInt(process.env.MCP_PORT || "8000", 10);
  const host = options.host || process.env.MCP_HOST || "127.0.0.1";
  let endpointPath = options.endpointPath || process.env.MCP_PATH || "/mcp";
  
  // Ensure path starts with a slash
  if (!endpointPath.startsWith("/")) {
    endpointPath = `/${endpointPath}`;
  }
  
  // Get server options
  const serverOptions = getServerOptions(isToolScanMode, toolScanTimeout);
  
  // Create and use the server configuration
  const serverConfig = createHttpServerConfig(port, host, endpointPath, serverOptions, scanOptions);
  server.start(serverConfig);
  
  let transportType = "streamable-HTTP";
  if (scanOptions?.statelessMode) {
    transportType += " (stateless mode)";
  }
  
  console.error(`[INFO] [transportHandlers] MCP Think Tank server v${config.version} started successfully with ${transportType} transport at ${host}:${port}${endpointPath}`);
}