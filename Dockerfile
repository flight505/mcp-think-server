FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the project
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Set executable permissions for scripts
RUN chmod +x dist/src/server.js bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs

# Create default memory directory
RUN mkdir -p /data && \
    chown -R node:node /data

# Set environment variables
ENV NODE_ENV=production \
    ASYNC_SCANNING=true \
    TOOL_SCAN_TIMEOUT=60000 \
    SCAN_RETRY_COUNT=3 \
    SCAN_CONCURRENCY=10 \
    MEMORY_PATH=/data/memory.jsonl \
    MCP_TRANSPORT=streamable-http \
    MCP_HOST=0.0.0.0 \
    MCP_PORT=8000 \
    MCP_PATH=/mcp \
    AUTO_SHUTDOWN_MS=120000

# Expose the port that the server will run on
EXPOSE 8000

# Run as non-root user
USER node

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/mcp || exit 1

# Start the server
CMD ["node", "dist/src/server.js"]

# Label the image
LABEL org.opencontainers.image.source="https://github.com/flight505/mcp-think-tank"
LABEL org.opencontainers.image.description="An MCP server that provides reasoning and knowledge graph capabilities for AI assistants"
LABEL org.opencontainers.image.licenses="MIT" 