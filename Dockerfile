FROM node:18-alpine

# Create non-root user for security
RUN addgroup --system --gid 10001 appgroup && \
    adduser --system --uid 10000 --gid 10001 appuser

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies more efficiently
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create data directory with proper permissions
RUN mkdir -p /tmp && \
    chmod -R 755 /tmp && \
    chown -R appuser:appgroup /app /tmp

# Make scripts executable
RUN chmod +x dist/src/server.js bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs

# Switch to non-root user
USER appuser

# Expose the port (for HTTP mode)
EXPOSE 8000

# Command will be provided by smithery.yaml
CMD ["node", "dist/src/server.js"]
