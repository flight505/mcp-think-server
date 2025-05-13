FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy source code and build script
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY tsconfig.json ./
COPY bin/ ./bin/

# Install development dependencies for build
RUN npm install

# Build the application
RUN npm run build

# Create data directory
RUN mkdir -p /data

# Make key files executable
RUN chmod +x dist/src/server.js bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs

# Use non-root user
USER node

# Expose the port
EXPOSE 8000

# Command will be provided by smithery.yaml
CMD ["node", "dist/src/server.js"]
