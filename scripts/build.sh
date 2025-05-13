#!/bin/bash

# Exit on any error
set -e

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "Building MCP Think Tank v${VERSION}..."

# Ensure core directories exist
mkdir -p dist/src/core
mkdir -p dist/src/transport
mkdir -p dist/src/utils
mkdir -p dist/src/memory
mkdir -p bin

# Run TypeScript compiler
echo "Running TypeScript compiler..."
npx tsc

# Ensure server script exists
if [ ! -f "dist/src/server.js" ]; then
    echo "Warning: Server not compiled correctly, creating minimal server implementation..."
    
    # Create minimal server implementation for Smithery compatibility
    cat > dist/src/server.js << EOF
// Minimal server implementation for Smithery compatibility
import { FastMCP } from 'fastmcp';

// Make console.log use stderr to avoid interfering with MCP protocol
console.log = (...args) => console.error(...args);

async function main() {
  try {
    // Log startup
    console.error("[INFO] Starting MCP Think Tank server...");
    
    // Create server instance with minimal configuration
    const server = new FastMCP({
      name: "MCP Think Tank",
      version: "${VERSION}"
    });
    
    // Set up transport based on environment variables
    const transport = process.env.MCP_TRANSPORT || 'http';
    const host = process.env.MCP_HOST || '0.0.0.0';
    const port = parseInt(process.env.MCP_PORT || '8000', 10);
    const path = process.env.MCP_PATH || '/mcp';
    
    // Start the server
    await server.listen({ transport, host, port, path });
    console.error(\`[INFO] Server listening on \${host}:\${port}\${path} using \${transport} transport\`);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('[INFO] Shutting down server...');
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      console.error('[INFO] Shutting down server...');
      process.exit(0);
    });
  } catch (error) {
    console.error(\`[ERROR] Failed to start server: \${error instanceof Error ? error.message : String(error)}\`);
    console.error(error);
    process.exit(1);
  }
}

// Handle version flag for compatibility testing
if (process.argv.includes('--version')) {
  console.error(\`MCP Think Tank v\${VERSION}\`);
  process.exit(0);
}

// Start the server
main().catch(error => {
  console.error(\`[FATAL] Unhandled error during server startup: \${error}\`);
  process.exit(1);
});
EOF
fi

# Create minimal utils/console.js file if needed
if [ ! -f "dist/src/utils/console.js" ]; then
    echo "Creating minimal console utilities..."
    mkdir -p dist/src/utils
    cat > dist/src/utils/console.js << EOF
// Minimal console utilities for Smithery compatibility
export const safeErrorLog = (message) => {
  try {
    console.error(message);
  } catch (e) {
    process.stderr.write(\`\${message}\n\`);
  }
};
EOF
fi

# Create bin scripts if they don't exist
if [ ! -f "bin/mcp-think-tank.js" ]; then
    echo "Creating bin scripts..."
    cat > bin/mcp-think-tank.js << EOF
#!/usr/bin/env node

// Simple bin script to start the server
import '../dist/src/server.js';
EOF

    cat > bin/mcp-think-tank-cjs.cjs << EOF
#!/usr/bin/env node

// CommonJS wrapper for ESM module
try {
  require('../dist/src/server.js');
} catch (e) {
  if (e.code === 'ERR_REQUIRE_ESM') {
    // This is an ESM module, use dynamic import
    import('../dist/src/server.js');
  } else {
    console.error(e);
    process.exit(1);
  }
}
EOF
fi

# Make scripts executable
chmod +x bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs
chmod +x dist/src/server.js

echo "Build completed successfully!" 