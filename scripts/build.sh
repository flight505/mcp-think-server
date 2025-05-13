#!/bin/bash

# Exit on any error
set -e

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "Building MCP Think Tank v${VERSION}..."

# Check if we're building for Smithery deployment
IS_SMITHERY_BUILD=${SMITHERY_DEPLOYMENT:-false}
if [ "$IS_SMITHERY_BUILD" = "true" ]; then
  echo "Building for Smithery deployment..."
fi

# Ensure core directories exist
mkdir -p dist/src/core
mkdir -p dist/src/transport
mkdir -p dist/src/utils
mkdir -p dist/src/memory
mkdir -p dist/src/memory/store
mkdir -p bin
mkdir -p /tmp

# Run TypeScript compiler
echo "Running TypeScript compiler..."
npx tsc

# Make scripts executable
chmod +x bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs || true
chmod +x dist/src/server.js || true

echo "Build completed successfully!"
if [ "$IS_SMITHERY_BUILD" = "true" ]; then
  echo "Smithery-compatible build is ready to deploy!"
else
  echo "Run with SMITHERY_DEPLOYMENT=true for Smithery-specific optimizations."
fi
