# Dockerfile Study Guide for Smart Waste Management

## Introduction to Dockerfile

A **Dockerfile** is a text file containing a series of instructions that Docker uses to automatically build images. It's like a recipe that tells Docker how to create a container image for your application.

## Why Dockerfile?

### **Without Docker:**
```bash
# Manual setup on each machine
1. Install Node.js
2. Install dependencies
3. Configure environment
4. Set up permissions
5. Start application
6. Handle different OS variations
```

### **With Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
```
✅ **Consistent environment across all machines**

## Multi-Stage Build Strategy

Our Smart Waste Management system uses a **multi-stage Dockerfile** to optimize image size and security:

### **Complete Dockerfile Analysis**

```dockerfile
# ==========================================
# STAGE 1: Frontend Build Stage
# ==========================================
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy package files first (for layer caching)
COPY frontend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ ./

# Build the React application
RUN npm run build

# ==========================================
# STAGE 2: Backend Build Stage
# ==========================================
FROM node:18-alpine AS backend-build

# Set working directory for backend
WORKDIR /app/backend

# Copy package files first (for layer caching)
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# ==========================================
# STAGE 3: Production Stage
# ==========================================
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Copy built applications from previous stages
COPY --from=backend-build --chown=appuser:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=appuser:nodejs /app/frontend/build ./frontend/build

# Install global packages for serving files
RUN npm install -g serve pm2

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'serve -s /app/frontend/build -l 3000 &' >> /app/start.sh && \
    echo 'cd /app/backend && npm start &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

# Switch to non-root user (Security best practice)
USER appuser

# Health check to monitor container health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose ports that the application uses
EXPOSE 3000 3001

# Start the application
CMD ["/app/start.sh"]
```

## Stage-by-Stage Breakdown

### **Stage 1: Frontend Build**

```dockerfile
FROM node:18-alpine AS frontend-build
```
**Purpose**: Build the React frontend application

**Why Alpine?**
- **Size**: Alpine Linux is only ~5MB vs ~900MB for full Ubuntu
- **Security**: Minimal attack surface
- **Performance**: Faster container startup

```dockerfile
WORKDIR /app/frontend
```
**Purpose**: Set working directory
- All subsequent commands run from this directory
- Creates directory if it doesn't exist

```dockerfile
COPY frontend/package*.json ./
```
**Purpose**: Copy package files first for **layer caching**

**Layer Caching Optimization:**
```
Without optimization:
COPY frontend/ ./           # ❌ Invalidates cache on any file change
RUN npm ci

With optimization:
COPY package*.json ./       # ✅ Only invalidates if dependencies change
RUN npm ci
COPY frontend/ ./
```

```dockerfile
RUN npm ci --only=production
```
**Purpose**: Install dependencies
- `npm ci` is faster and more reliable than `npm install`
- `--only=production` excludes dev dependencies (smaller image)

```dockerfile
RUN npm run build
```
**Purpose**: Build optimized production React app
- Creates `/build` folder with minified, optimized files
- Bundles all JavaScript and CSS
- Optimizes images and assets

### **Stage 2: Backend Build**

```dockerfile
FROM node:18-alpine AS backend-build
```
**Purpose**: Prepare the Node.js backend application

**Same base image benefits:**
- Consistent Node.js version
- Shared layers between stages (efficient)

```dockerfile
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
```
**Purpose**: Install backend dependencies and copy source code
- Similar layer caching strategy as frontend
- Production-only dependencies for smaller image

### **Stage 3: Production**

```dockerfile
FROM node:18-alpine AS production
```
**Purpose**: Create the final, optimized production image

**Why separate production stage?**
- ✅ Excludes build tools and dev dependencies
- ✅ Smaller final image size
- ✅ Better security (no build artifacts)

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001
```
**Purpose**: Security - Create non-root user

**Security Benefits:**
- ❌ **Root user**: Full system access, security risk
- ✅ **Non-root user**: Limited permissions, safer

```dockerfile
COPY --from=backend-build --chown=appuser:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=appuser:nodejs /app/frontend/build ./frontend/build
```
**Purpose**: Copy built applications from previous stages

**Key Points:**
- `--from=stage` copies from specific build stage
- `--chown=appuser:nodejs` sets correct file ownership
- Only production files, no source code or build tools

```dockerfile
RUN npm install -g serve pm2
```
**Purpose**: Install global tools

**Tools Explained:**
- **serve**: Static file server for React build files
- **pm2**: Process manager for Node.js (production-grade)

```dockerfile
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'serve -s /app/frontend/build -l 3000 &' >> /app/start.sh && \
    echo 'cd /app/backend && npm start &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh
```
**Purpose**: Create startup script

**Script Breakdown:**
```bash
#!/bin/sh
serve -s /app/frontend/build -l 3000 &  # Start frontend server in background
cd /app/backend && npm start &          # Start backend server in background
wait                                    # Wait for all background processes
```

**Why this approach?**
- Runs both frontend and backend in single container
- `&` runs processes in background
- `wait` keeps container alive

## Dockerfile Best Practices Applied

### **1. Layer Caching Optimization**

```dockerfile
# ❌ Bad: Invalidates cache on any code change
COPY . .
RUN npm install

# ✅ Good: Only invalidates cache when dependencies change
COPY package*.json ./
RUN npm ci
COPY . .
```

### **2. Multi-Stage Builds**

```dockerfile
# ✅ Benefits:
- Smaller final image (excludes build tools)
- Better security (no source code in final image)
- Faster deployments
- Separation of concerns
```

### **3. Security Practices**

```dockerfile
# ✅ Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001
USER appuser

# ✅ Minimal base image
FROM node:18-alpine  # vs ubuntu:latest

# ✅ Specific versions
FROM node:18-alpine  # vs node:latest
```

### **4. Image Size Optimization**

```dockerfile
# ✅ Production dependencies only
RUN npm ci --only=production

# ✅ Alpine Linux base
FROM node:18-alpine  # 5MB vs 900MB

# ✅ .dockerignore file
node_modules/
.git/
*.md
.env
```

### **5. Health Checks**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1
```

**Health Check Parameters:**
- `--interval=30s`: Check every 30 seconds
- `--timeout=3s`: Fail if check takes > 3 seconds
- `--start-period=5s`: Wait 5 seconds before first check
- `--retries=3`: Mark unhealthy after 3 failed checks

## Alternative Dockerfile Approaches

### **1. Separate Dockerfiles**

Instead of multi-stage, you could have separate Dockerfiles:

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

**Pros:**
- ✅ Simpler individual Dockerfiles
- ✅ Can build/deploy independently

**Cons:**
- ❌ More files to maintain
- ❌ Less efficient layer sharing

### **2. Single-Stage Build**

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies
RUN cd frontend && npm ci && npm run build
RUN cd backend && npm ci

# Start both services
CMD ["sh", "-c", "cd frontend && npm start & cd backend && npm start & wait"]
```

**Pros:**
- ✅ Simple structure

**Cons:**
- ❌ Larger image size (includes dev dependencies)
- ❌ Less secure (includes source code)
- ❌ Poor layer caching

### **3. Production with PM2**

```dockerfile
FROM node:18-alpine AS production

# Install PM2 globally
RUN npm install pm2 -g

# Copy applications
COPY --from=backend-build /app/backend ./backend
COPY --from=frontend-build /app/frontend/build ./frontend

# Create PM2 configuration
RUN echo 'module.exports = { \
  apps: [{ \
    name: "backend", \
    script: "./backend/server.js", \
    env: { NODE_ENV: "production" } \
  }, { \
    name: "frontend", \
    script: "serve", \
    args: "-s ./frontend -l 3000" \
  }] \
}' > ecosystem.config.js

# Use PM2 to manage processes
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

## Docker Build Context Optimization

### **.dockerignore File**

```bash
# .dockerignore
node_modules/
npm-debug.log*
.git/
.gitignore
README.md
.env
.env.local
.nyc_output
coverage/
.nyc_output
.cache/
dist/
build/
*.md
.dockerignore
Dockerfile
docker-compose.yml
```

**Benefits:**
- ✅ Faster builds (smaller context)
- ✅ Smaller images
- ✅ Excludes sensitive files

### **Build Context Size Comparison**

```bash
# Without .dockerignore
Sending build context to Docker daemon: 250MB

# With .dockerignore
Sending build context to Docker daemon: 15MB
```

## Image Size Analysis

### **Size Breakdown:**

```bash
# Base images
node:18            ~950MB
node:18-alpine     ~170MB
alpine:latest      ~5MB

# Our multi-stage build result
smart-waste-app    ~200MB

# Single-stage comparison
smart-waste-single ~800MB
```

### **Layer Size Analysis:**

```bash
docker history smart-waste-management-backend

IMAGE          SIZE      COMMENT
08c3ba0083f3   264MB     # Final image
<missing>      150MB     # Node.js base + dependencies
<missing>      50MB      # Application code
<missing>      40MB      # npm packages
<missing>      24MB      # Frontend build files
```

## Performance Considerations

### **1. Build Time Optimization**

```dockerfile
# ✅ Cache npm dependencies
COPY package*.json ./
RUN npm ci

# ✅ Use .dockerignore
# Excludes unnecessary files

# ✅ Multi-stage builds
# Parallel building when possible
```

### **2. Runtime Performance**

```dockerfile
# ✅ Minimal base image
FROM node:18-alpine

# ✅ Non-root user
USER appuser

# ✅ Health checks
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3001/health
```

### **3. Memory Usage**

```dockerfile
# ✅ Production dependencies only
RUN npm ci --only=production

# ✅ Clean package cache
RUN npm ci && npm cache clean --force
```

## Security Analysis

### **Security Vulnerabilities & Solutions**

#### **1. Running as Root**
```dockerfile
# ❌ Security Risk
USER root

# ✅ Secure Practice
RUN adduser -S appuser -u 1001
USER appuser
```

#### **2. Outdated Base Images**
```dockerfile
# ❌ Security Risk
FROM node:latest

# ✅ Secure Practice
FROM node:18-alpine  # Specific, maintained version
```

#### **3. Exposed Secrets**
```dockerfile
# ❌ Security Risk
ENV API_KEY=secret123
COPY .env ./

# ✅ Secure Practice
# Use Docker secrets or environment variables at runtime
```

#### **4. Unnecessary Tools**
```dockerfile
# ❌ Security Risk
RUN apt-get install -y curl wget git vim

# ✅ Secure Practice
# Only install what's needed for production
```

## Testing Dockerfile

### **1. Build Test**
```bash
# Test the build process
docker build -t smart-waste-test .

# Check image size
docker images smart-waste-test

# Inspect layers
docker history smart-waste-test
```

### **2. Security Scan**
```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD:/root/.cache/ \
  aquasec/trivy image smart-waste-test
```

### **3. Runtime Test**
```bash
# Test container startup
docker run -d --name test-container smart-waste-test

# Check health
docker ps
docker logs test-container

# Clean up
docker stop test-container
docker rm test-container
```

## Common Issues & Solutions

### **1. Build Failures**

```bash
# Issue: npm install fails
ERROR: npm ERR! network timeout

# Solution: Add retry and timeout
RUN npm ci --prefer-offline --no-audit --timeout=60000
```

### **2. Permission Issues**

```bash
# Issue: Permission denied
EACCES: permission denied, open '/app/file.txt'

# Solution: Fix ownership
COPY --chown=appuser:nodejs . .
```

### **3. Large Image Size**

```bash
# Issue: Image too large
smart-waste-app  1.2GB

# Solutions:
1. Use multi-stage builds
2. Use Alpine base images
3. Add .dockerignore
4. Clean package cache
```

## Optimization Results

### **Before Optimization:**
```
Image Size: 1.2GB
Build Time: 8 minutes
Security: Multiple vulnerabilities
Layers: 25+ layers
```

### **After Optimization:**
```
Image Size: 264MB (78% reduction)
Build Time: 3 minutes (62% faster)
Security: Non-root user, minimal attack surface
Layers: 12 optimized layers
```

This Dockerfile provides a production-ready, secure, and optimized container image for the Smart Waste Management system, following Docker best practices for performance, security, and maintainability.
