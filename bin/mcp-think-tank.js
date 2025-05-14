#!/usr/bin/env node

/**
 * This is the executable entry point for the mcp-think-tank 
 * when installed globally via npm
 */

// Import the console utility immediately to redirect logs
// Note: We can't import from utils/console since the path resolution is different for bin scripts
// So we'll still need this minimal redirect here for the bin script
console.log = (...args) => console.error(...args);

// Handle --version flag directly in the bin script for faster response
if (process.argv.includes('--version')) {
  console.error('mcp-think-tank v2.0.7');
  process.exit(0);
}

// Import the server module with error handling
import('../dist/server.js').catch(e => { 
  console.error(`Failed to start MCP Think Tank server:`, e); 
  process.exit(1); 
}); 