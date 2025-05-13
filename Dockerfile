FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies without cache for better Smithery compatibility
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:18-alpine AS release
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/bin /app/bin
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/smithery.yaml ./

# Set production environment and improve tool scanning
ENV NODE_ENV=production
ENV TOOL_SCAN_TIMEOUT=60000
ENV SCAN_RETRY_COUNT=3
ENV SCAN_CONCURRENCY=10
ENV ASYNC_SCANNING=true
ENV NODE_OPTIONS="--max-old-space-size=512"

# Install production dependencies
RUN npm ci --omit=dev || npm install --omit=dev

# Set executable permissions
RUN chmod +x dist/src/server.js bin/mcp-think-tank.js bin/mcp-think-tank-cjs.cjs

# Set the user to non-root
USER node

# Use ENTRYPOINT for better compatibility
ENTRYPOINT ["node", "dist/src/server.js"]