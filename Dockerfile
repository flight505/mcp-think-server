FROM node:18-alpine AS builder
WORKDIR /app

# Install bash for build scripts
RUN apk add --no-cache bash

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.npm npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:18-alpine AS release
WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/smithery.yaml ./

# Set production environment and improve tool scanning
ENV NODE_ENV=production
ENV TOOL_SCAN_TIMEOUT=30000
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV MCP_HOST="0.0.0.0"
ENV MCP_PORT=8000
ENV MCP_TRANSPORT="streamable-http"

# Install only production dependencies
RUN npm ci --ignore-scripts --omit=dev

# Set executable permissions
RUN chmod +x dist/server.js

# Set the user to non-root
USER node

# Expose the port used by the server
EXPOSE 8000

# Use ENTRYPOINT instead of CMD for better compatibility
ENTRYPOINT ["node", "dist/server.js"]