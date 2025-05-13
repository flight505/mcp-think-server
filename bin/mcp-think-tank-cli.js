#!/usr/bin/env node

/**
 * This is the executable entry point for the mcp-think-tank 
 * when installed globally via npm
 */

// Redirect logs
console.log = (...args) => console.error(...args);

// Use dynamic import which works in both ESM and CommonJS
import('../dist/src/server.js').catch(e => {
  console.error(`Failed to start MCP Think Tank server:`, e);
  process.exit(1);
}); 