FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Verify server script exists
RUN test -f dist/src/server.js || (echo "Error: dist/src/server.js not found" && exit 1)

# Make sure the server is executable
RUN chmod +x dist/src/server.js bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs

# Create data directory for memory storage
RUN mkdir -p /data && \
    chown -R node:node /data

# Use non-root user
USER node

# Command will be provided by smithery.yaml
CMD ["node", "dist/src/server.js"]

# Image metadata
LABEL org.opencontainers.image.source="https://github.com/flight505/mcp-think-tank"
LABEL org.opencontainers.image.description="An MCP server that provides reasoning and knowledge graph capabilities for AI assistants"
LABEL org.opencontainers.image.licenses="MIT" 