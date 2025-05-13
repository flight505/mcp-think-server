FROM node:18-alpine

# Create non-root user for security (fixed Alpine syntax)
RUN addgroup -S -g 10001 appgroup && \
    adduser -S -u 10000 -G appgroup appuser

# Install bash for build scripts
RUN apk add --no-cache bash

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy application code
COPY . .

# Build the application with explicit Smithery flag
RUN SMITHERY_DEPLOYMENT=true npm run build

# Create data directory with proper permissions
RUN mkdir -p /tmp && \
    chmod -R 755 /tmp && \
    chown -R appuser:appgroup /app /tmp

# Make scripts executable
RUN chmod +x dist/src/server.js bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs docker-entrypoint.sh

# Cleanup dev dependencies after build to reduce image size
RUN npm prune --production

# Switch to non-root user
USER appuser

# Expose the port (for HTTP mode)
EXPOSE 8000

# Environment variables for Smithery
ENV NODE_ENV=production \
    MCP_DEBUG=true \
    AUTO_LINK=true \
    SMITHERY_DEPLOYMENT=true \
    MCP_TRANSPORT=streamable-http \
    MCP_PORT=8000 \
    MCP_HOST=0.0.0.0 \
    MEMORY_PATH=/tmp/memory.jsonl

# Use our entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Default command (can be overridden)
CMD [""]