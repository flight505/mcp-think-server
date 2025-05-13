import { FastMCP } from "fastmcp";
import { setupConnectionTracking, getServerOptions } from "../core/connection.js";
import http from "http";
import { ServerOptions } from "http";
import { config } from "../config.js";

/**
 * Creates HTTP/SSE server configuration for FastMCP
 * 
 * @param port Server port
 * @param host Host to bind to
 * @param endpointPath API endpoint path
 * @param serverOptions HTTP server options
 * @returns FastMCP server configuration object
 */
export function createHttpServerConfig(
  port: number,
  host: string,
  endpointPath: string,
  serverOptions: ServerOptions
): any {
  return {
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
 * @param options Configuration options
 */
export function setupHttpTransport(
  server: FastMCP,
  isToolScanMode: boolean,
  toolScanTimeout: number,
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
  const serverConfig = createHttpServerConfig(port, host, endpointPath, serverOptions);
  server.start(serverConfig);
  
  console.error(`[INFO] [transportHandlers] MCP Think Tank server v${config.version} started successfully with streamable-HTTP transport at ${host}:${port}${endpointPath}`);
}