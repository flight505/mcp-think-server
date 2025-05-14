#!/usr/bin/env node

/**
 * This is a CommonJS-compatible entry point for the mcp-think-tank
 * This script should work in all Node.js environments including older ones
 */

// Redirect console output
console.log = function() {
  return console.error.apply(console, arguments);
};

// Handle version flag directly in the bin script for faster response
if (process.argv.includes('--version')) {
  console.error('mcp-think-tank v2.0.7');
  process.exit(0);
}

// Get the path to the server module
const path = require('path');
const serverPath = path.join(__dirname, '../dist/server.js');

// Launch the server using the dynamic import() function wrapped in a Promise
(async function() {
  try {
    // Use import() which works in Node.js 12+, even in CommonJS environments
    const serverModule = await import(serverPath);
  } catch (e) {
    console.error(`Failed to start MCP Think Tank server:`, e);
    process.exit(1);
  }
})(); 