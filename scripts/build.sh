#!/bin/bash

# Exit on any error
set -e

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "Building MCP Think Tank v${VERSION}..."

# Ensure core directories exist
mkdir -p dist/src/core
mkdir -p dist/src/transport

# Run TypeScript compiler
echo "Running TypeScript compiler..."
npx tsc

# Check if core modules were compiled
if [ ! -f "dist/src/core/index.js" ]; then
    echo "Error: Core modules not compiled correctly!"
    exit 1
fi

if [ ! -f "dist/src/transport/index.js" ]; then
    echo "Error: Transport module not compiled correctly!"
    exit 1
fi

# Verify the server can start
echo "Verifying server can start..."
node dist/src/server.js --version

echo "Build completed successfully!" 