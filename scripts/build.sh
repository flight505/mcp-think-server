#!/bin/bash

# Exit on any error
set -e

# Clean dist directory first to avoid leftover files
echo "Cleaning dist directory..."
rm -rf dist

# Create bin directory if it doesn't exist
mkdir -p bin

# Get version from package.json
VERSION=$(node -e "const fs = require('fs'); console.log(JSON.parse(fs.readFileSync('./package.json')).version);")
echo "Building MCP Think Tank v${VERSION}..."

# Run TypeScript compiler
echo "Running TypeScript compiler..."
npx tsc

# Make scripts executable
chmod +x bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs 2>/dev/null || true
chmod +x dist/server.js 2>/dev/null || true

# Verify build completed successfully
if [ ! -f "dist/server.js" ]; then
  echo "ERROR: dist/server.js not found after build!"
  exit 1
fi

echo "Build completed successfully!"