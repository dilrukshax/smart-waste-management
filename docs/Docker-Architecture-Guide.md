# Smart Waste Management - Docker Architecture Study Guide

## Table of Contents
1. [Overview](#overview)
2. [Docker Architecture](#docker-architecture)
3. [Database Layer - MongoDB](#database-layer---mongodb)
4. [Caching Layer - Redis](#caching-layer---redis)
5. [Reverse Proxy - Nginx](#reverse-proxy---nginx)
6. [Application Services](#application-services)
7. [Docker Compose Explanation](#docker-compose-explanation)
8. [Dockerfile Analysis](#dockerfile-analysis)
9. [Network Architecture](#network-architecture)
10. [Environment Variables](#environment-variables)
11. [Volume Management](#volume-management)
12. [Commands & Operations](#commands--operations)

---

## Overview

This Smart Waste Management system is built using a **microservices architecture** deployed with Docker containers. The system consists of multiple services that work together to provide a complete waste management solution.

### **System Components:**
- **Frontend**: React.js application (Port 3000)
- **Backend**: Node.js/Express API (Port 3001)
- **Database**: MongoDB (Port 27017)
- **Cache**: Redis (Port 6379)
- **Reverse Proxy**: Nginx (Port 80/443)

---

## Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host Machine                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Nginx     │  │  Frontend   │  │   Backend   │         │
│  │   :80/443   │  │    :3000    │  │    :3001    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │               │               │                   │
│         └───────────────┼───────────────┘                   │
│                         │                                   │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │   MongoDB   │  │    Redis    │                           │
│  │   :27017    │  │    :6379    │                           │
│  └─────────────┘  └─────────────┘                           │
│                                                             │
│        All connected via 'smart-waste-network'             │
└─────────────────────────────────────────────────────────────┘
```

### **Why Use Docker?**

1. **Consistency**: Same environment across development, testing, and production
2. **Isolation**: Each service runs in its own container
3. **Scalability**: Easy to scale individual services
4. **Portability**: Runs on any machine with Docker
5. **Development Speed**: Quick setup and teardown

---

## Database Layer - MongoDB

### **What is MongoDB?**
MongoDB is a **NoSQL document database** that stores data in flexible, JSON-like documents instead of traditional table rows.

### **Why MongoDB for Waste Management?**

```javascript
// Example document structure
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "userId": "user123",
  "wasteType": "organic",
  "location": {
    "latitude": 6.9271,
    "longitude": 79.8612,
    "address": "Colombo, Sri Lanka"
  },
  "requestDate": "2025-08-16T10:30:00Z",
  "status": "pending",
  "estimatedWeight": 15.5,
  "specialInstructions": "Large garden waste"
}
```

### **Advantages:**
- **Flexible Schema**: Can easily add new fields without migrations
- **Geospatial Queries**: Perfect for location-based waste collection
- **JSON-like Structure**: Natural fit for JavaScript applications
- **Horizontal Scaling**: Can distribute data across multiple servers

### **Docker Configuration:**
```yaml
mongodb:
  image: mongo:6.0
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: password123
    MONGO_INITDB_DATABASE: smart_waste
  ports:
    - "27017:27017"
  volumes:
    - mongodb_data:/data/db  # Persistent data storage
    - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
```

### **Connection String:**
```
mongodb://admin:password123@mongodb:27017/smart_waste?authSource=admin
```

---

## Caching Layer - Redis

### **What is Redis?**
Redis is an **in-memory data structure store** used as a database, cache, and message broker.

### **Why Redis in Waste Management?**

1. **Session Management**: Store user login sessions
2. **Caching**: Store frequently accessed data
3. **Real-time Data**: Cache collector locations, route optimization
4. **Rate Limiting**: Prevent API abuse
5. **Temporary Data**: Store OTP codes, temporary tokens

### **Use Cases in Our System:**

```javascript
// Example Redis usage
// 1. Cache user profile
redis.setex('user:123:profile', 3600, JSON.stringify(userProfile));

// 2. Store session
redis.setex('session:abc123', 7200, userId);

// 3. Cache collection routes
redis.setex('routes:collector:456', 1800, JSON.stringify(optimizedRoute));

// 4. Rate limiting
redis.incr('api:requests:user:123:minute');
redis.expire('api:requests:user:123:minute', 60);
```

### **Docker Configuration:**
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data  # Persistent storage
```

### **Benefits:**
- **Speed**: Sub-millisecond response times
- **Scalability**: Handles thousands of operations per second
- **Data Types**: Supports strings, hashes, lists, sets, sorted sets
- **Persistence**: Can save data to disk

---

## Reverse Proxy - Nginx

### **What is a Reverse Proxy?**
A reverse proxy sits between clients and backend services, forwarding client requests to appropriate backend servers.

### **Nginx Architecture:**

```
Internet → Nginx (Port 80/443) → {
    /api/* → Backend (Port 3001)
    /*     → Frontend (Port 3000)
}
```

### **Why Use Nginx?**

1. **Load Balancing**: Distribute requests across multiple backend instances
2. **SSL Termination**: Handle HTTPS encryption/decryption
3. **Static File Serving**: Serve images, CSS, JS files efficiently
4. **Compression**: Gzip compression to reduce bandwidth
5. **Security**: Rate limiting, IP filtering, DDoS protection
6. **Caching**: Cache static content for faster delivery

### **Configuration Example:**
```nginx
upstream backend {
    server smart-waste-backend:3001;
}

upstream frontend {
    server smart-waste-frontend:3000;
}

server {
    listen 80;
    server_name localhost;

    # API routes go to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Everything else goes to frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Benefits in Our System:**
- **Single Entry Point**: One URL for entire application
- **Development Simplification**: No CORS issues between frontend/backend
- **Production Ready**: Easy to add SSL, caching, security headers
- **Scalability**: Can easily add more backend instances

---

## Application Services

### **Frontend Service (React.js)**

**Purpose**: User interface for waste management operations

**Key Features:**
- User Dashboard
- Waste Request Forms
- Admin Management
- Real-time Updates
- Responsive Design

**Docker Configuration:**
```yaml
frontend:
  build:
    context: .
    target: frontend-build
  ports:
    - "3000:3000"
  environment:
    REACT_APP_API_URL: http://localhost:3001
    REACT_APP_STRIPE_PUBLISHABLE_KEY: your-stripe-publishable-key
```

### **Backend Service (Node.js/Express)**

**Purpose**: API server handling business logic and data operations

**Key Features:**
- RESTful API endpoints
- Authentication & Authorization
- Database operations
- Payment processing (Stripe)
- File uploads
- Email notifications

**Docker Configuration:**
```yaml
backend:
  build:
    context: .
    target: backend-build
  ports:
    - "3001:3001"
  environment:
    NODE_ENV: development
    MONGODB_URI: mongodb://admin:password123@mongodb:27017/smart_waste
    REDIS_URL: redis://redis:6379
    JWT_SECRET: your-jwt-secret-key
```

---

## Docker Compose Explanation

### **What is Docker Compose?**
Docker Compose is a tool for defining and running multi-container Docker applications using a YAML file.

### **Key Concepts:**

#### **Services**
Each service represents a container:
```yaml
services:
  frontend:    # Service name
    image: node:18-alpine
    ports:
      - "3000:3000"
```

#### **Networks**
Connect containers so they can communicate:
```yaml
networks:
  smart-waste-network:
    driver: bridge
```

#### **Volumes**
Persist data between container restarts:
```yaml
volumes:
  mongodb_data:  # Named volume for MongoDB
  redis_data:    # Named volume for Redis
```

#### **Dependencies**
Ensure services start in correct order:
```yaml
backend:
  depends_on:
    - mongodb
    - redis
```

#### **Environment Variables**
Configure container behavior:
```yaml
environment:
  NODE_ENV: development
  PORT: 3001
  MONGODB_URI: mongodb://admin:password123@mongodb:27017/smart_waste
```

---

## Dockerfile Analysis

### **Multi-Stage Build Strategy**

Our Dockerfile uses a **multi-stage build** to optimize image size and security:

```dockerfile
# Stage 1: Frontend Build
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend Build  
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Copy built applications
COPY --from=backend-build --chown=appuser:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=appuser:nodejs /app/frontend/build ./frontend/build

# Install serve for static files
RUN npm install -g serve pm2

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'serve -s /app/frontend/build -l 3000 &' >> /app/start.sh && \
    echo 'cd /app/backend && npm start &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

# Switch to non-root user (Security)
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose ports
EXPOSE 3000 3001

# Start application
CMD ["/app/start.sh"]
```

### **Why Multi-Stage Build?**

1. **Smaller Images**: Only production files in final image
2. **Security**: Remove build tools and dev dependencies
3. **Efficiency**: Separate build and runtime environments
4. **Caching**: Better layer caching for faster builds

### **Key Dockerfile Features:**

- **Alpine Linux**: Lightweight base image (~5MB vs ~900MB)
- **Non-root User**: Security best practice
- **Health Checks**: Monitor container health
- **Layer Optimization**: Minimize image layers
- **Copy Ownership**: Set correct file permissions

---

## Network Architecture

### **Docker Bridge Network**

All services communicate through a custom bridge network:

```yaml
networks:
  smart-waste-network:
    driver: bridge
```

### **Service Discovery**

Containers can reach each other using service names:
- `mongodb:27017` (not `localhost:27017`)
- `redis:6379` (not `localhost:6379`)
- `smart-waste-backend:3001`

### **Port Mapping**

```
Host Machine    →    Container
localhost:3000  →    frontend:3000
localhost:3001  →    backend:3001
localhost:27017 →    mongodb:27017
localhost:6379  →    redis:6379
localhost:80    →    nginx:80
```

### **Internal Communication**

```
Frontend → Backend: HTTP requests to backend:3001
Backend → MongoDB: MongoDB connection to mongodb:27017
Backend → Redis: Redis connection to redis:6379
Nginx → Frontend: Proxy to frontend:3000
Nginx → Backend: Proxy to backend:3001
```

---

## Environment Variables

### **Backend Environment Variables**

```bash
# Application Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/smart_waste?authSource=admin

# Cache Configuration
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-jwt-secret-key

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### **Frontend Environment Variables**

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Payment Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### **MongoDB Environment Variables**

```bash
# Database Initialization
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=smart_waste
```

---

## Volume Management

### **Why Use Volumes?**

Containers are **ephemeral** - when they stop, all data is lost. Volumes provide **persistent storage**.

### **Volume Types:**

#### **Named Volumes**
```yaml
volumes:
  mongodb_data:  # Managed by Docker
  redis_data:    # Stored in Docker's volume directory
```

#### **Bind Mounts**
```yaml
volumes:
  - ./backend:/app/backend              # Development: Live code reload
  - /app/backend/node_modules           # Anonymous volume: Protect node_modules
  - ./nginx.conf:/etc/nginx/nginx.conf:ro  # Read-only configuration
```

### **Volume Benefits:**

1. **Data Persistence**: Survive container restarts
2. **Performance**: Better than bind mounts on Windows/Mac
3. **Backup/Restore**: Easy data management
4. **Sharing**: Multiple containers can share volumes

---

## Commands & Operations

### **Development Commands**

```bash
# Start all services
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Build and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ Data loss)
docker-compose down -v
```

### **Monitoring Commands**

```bash
# Check running containers
docker ps

# View logs
docker logs smart-waste-backend
docker logs smart-waste-frontend
docker logs smart-waste-mongodb

# Follow logs in real-time
docker logs -f smart-waste-backend

# Execute commands in container
docker exec -it smart-waste-backend sh
docker exec -it smart-waste-mongodb mongosh
```

### **Debugging Commands**

```bash
# Check container resource usage
docker stats

# Inspect container configuration
docker inspect smart-waste-backend

# Check network configuration
docker network ls
docker network inspect smart-waste-management_smart-waste-network

# Check volumes
docker volume ls
docker volume inspect smart-waste-management_mongodb_data
```

### **Production Commands**

```bash
# Pull latest images
docker-compose pull

# Restart specific service
docker-compose restart backend

# Scale services (if configured)
docker-compose up --scale backend=3

# View container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## Study Questions & Exercises

### **Beginner Level**

1. What happens if you remove the `depends_on` configuration?
2. Why do we use port mapping (3000:3000)?
3. What's the difference between `docker-compose up` and `docker-compose up -d`?

### **Intermediate Level**

1. How would you add a new microservice (e.g., notification service)?
2. Explain the difference between named volumes and bind mounts
3. How does service discovery work in Docker networks?

### **Advanced Level**

1. How would you implement horizontal scaling for the backend?
2. Design a CI/CD pipeline for this Docker setup
3. How would you secure this setup for production?

### **Practical Exercises**

1. **Add Environment File**: Create `.env` file for environment variables
2. **Health Checks**: Add custom health check endpoints
3. **Logging**: Configure centralized logging with ELK stack
4. **Monitoring**: Add Prometheus and Grafana for monitoring
5. **Security**: Implement Docker secrets for sensitive data

---

## Best Practices Applied

### **Security**
- ✅ Non-root user in containers
- ✅ Read-only volumes where appropriate
- ✅ Environment variables for secrets
- ✅ Network isolation
- ✅ Health checks

### **Performance**
- ✅ Multi-stage builds
- ✅ Alpine Linux images
- ✅ Layer caching optimization
- ✅ Volume mounts for development
- ✅ Resource constraints (can be added)

### **Maintainability**
- ✅ Clear service naming
- ✅ Consistent port mapping
- ✅ Environment-specific configuration
- ✅ Documentation
- ✅ Logging strategy

---

## Conclusion

This Docker setup provides a **production-ready, scalable, and maintainable** architecture for the Smart Waste Management system. Each component serves a specific purpose:

- **MongoDB**: Flexible data storage for complex waste management data
- **Redis**: High-performance caching and session management
- **Nginx**: Production-ready reverse proxy and load balancer
- **Docker Compose**: Orchestrates all services seamlessly

The architecture follows **microservices principles**, making it easy to:
- Scale individual components
- Deploy independently
- Maintain and update
- Debug and monitor

This foundation can be extended with additional services like notification systems, analytics engines, or machine learning components as the application grows.
