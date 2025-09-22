# Multi-stage Dockerfile for Node.js/React application
# Build stage for React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

# Build stage for Node.js backend
FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Copy backend files
COPY --from=backend-build --chown=appuser:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=appuser:nodejs /app/frontend/build ./frontend/build

# Install serve to serve React build files
RUN npm install -g serve pm2

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'serve -s /app/frontend/build -l 3000 &' >> /app/start.sh && \
    echo 'cd /app/backend && npm start &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose ports
EXPOSE 3000 3001

# Start the application
CMD ["/app/start.sh"]
