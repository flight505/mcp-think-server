FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all application code
COPY . .

# Build the package
RUN npm run build

# Verify critical files exist
RUN test -f dist/src/server.js || (echo "Missing dist/src/server.js" && exit 1)

# Prune development dependencies
RUN npm prune --production

# Set permissions
RUN chmod +x dist/src/server.js bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs

# Create data directory for memory storage
RUN mkdir -p /data && \
    chown -R node:node /data

# Set environment variables
ENV NODE_ENV=production \
    MCP_TRANSPORT=streamable-http \
    MCP_HOST=0.0.0.0 \
    MCP_PORT=8000 \
    MCP_PATH=/mcp \
    MEMORY_PATH=/data/memory.jsonl

# Expose HTTP port
EXPOSE 8000

# Use non-root user
USER node

# Start the server
CMD ["node", "dist/src/server.js"]

# Image metadata
LABEL org.opencontainers.image.source="https://github.com/flight505/mcp-think-tank"
LABEL org.opencontainers.image.description="An MCP server that provides reasoning and knowledge graph capabilities for AI assistants"
LABEL org.opencontainers.image.licenses="MIT" 