# Docker Commands & Operations Guide

## Essential Docker Commands Reference

This guide provides comprehensive Docker commands for managing your Smart Waste Management application.

## Container Management

### **Basic Container Operations**

```bash
# List running containers
docker ps

# List all containers (running and stopped)
docker ps -a

# Start containers
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start with build
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ Data loss!)
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Stop specific service
docker-compose stop frontend
```

### **Container Logs**

```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend

# View last 50 lines
docker-compose logs --tail=50 backend

# View logs with timestamps
docker-compose logs -t backend

# View logs from specific time
docker-compose logs --since="2025-08-16T10:00:00" backend
```

### **Container Inspection**

```bash
# Get detailed container information
docker inspect smart-waste-backend

# Check container resource usage
docker stats

# Check specific container stats
docker stats smart-waste-backend

# Execute commands inside container
docker exec -it smart-waste-backend sh
docker exec -it smart-waste-mongodb mongosh

# Copy files from/to container
docker cp ./file.txt smart-waste-backend:/app/
docker cp smart-waste-backend:/app/logs ./logs
```

## Image Management

### **Image Operations**

```bash
# List all images
docker images

# Remove specific image
docker rmi smart-waste-management-backend

# Remove all unused images
docker image prune

# Remove all images (⚠️ Careful!)
docker rmi $(docker images -q)

# Build image manually
docker build -t my-smart-waste .

# Build with specific target
docker build --target production -t my-smart-waste .

# Check image layers
docker history smart-waste-management-backend

# Save image to file
docker save smart-waste-management-backend > backup.tar

# Load image from file
docker load < backup.tar
```

### **Image Analysis**

```bash
# Check image size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image smart-waste-management-backend

# Analyze image layers
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive smart-waste-management-backend
```

## Development Workflows

### **Development Mode**

```bash
# Start with live reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Rebuild and start
docker-compose up --build --force-recreate

# Start only database services
docker-compose up mongodb redis

# Scale services
docker-compose up --scale backend=3
```

### **Production Mode**

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Update and restart services
docker-compose pull
docker-compose up -d --remove-orphans

# Health check all services
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Database Operations

### **MongoDB Management**

```bash
# Connect to MongoDB
docker exec -it smart-waste-mongodb mongosh

# MongoDB inside container
mongosh "mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin"

# Backup database
docker exec smart-waste-mongodb mongodump \
  --uri="mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin" \
  --out=/backup

# Restore database
docker exec smart-waste-mongodb mongorestore \
  --uri="mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin" \
  /backup/smart_waste

# Copy backup to host
docker cp smart-waste-mongodb:/backup ./mongodb-backup
```

### **Redis Management**

```bash
# Connect to Redis
docker exec -it smart-waste-redis redis-cli

# Redis commands inside container
redis-cli -h redis -p 6379

# Monitor Redis operations
docker exec -it smart-waste-redis redis-cli MONITOR

# Get Redis info
docker exec smart-waste-redis redis-cli INFO

# Backup Redis data
docker exec smart-waste-redis redis-cli BGSAVE
```

## Network Management

### **Network Operations**

```bash
# List Docker networks
docker network ls

# Inspect network
docker network inspect smart-waste-management_smart-waste-network

# Connect container to network
docker network connect smart-waste-network container-name

# Disconnect container from network
docker network disconnect smart-waste-network container-name

# Test network connectivity
docker exec smart-waste-backend ping smart-waste-mongodb
docker exec smart-waste-frontend curl http://smart-waste-backend:3001/health
```

## Volume Management

### **Volume Operations**

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect smart-waste-management_mongodb_data

# Backup volume
docker run --rm -v smart-waste-management_mongodb_data:/data \
  -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v smart-waste-management_mongodb_data:/data \
  -v $(pwd):/backup alpine tar xzf /backup/mongodb-backup.tar.gz -C /data

# Remove unused volumes
docker volume prune

# Remove specific volume (⚠️ Data loss!)
docker volume rm smart-waste-management_mongodb_data
```

## Monitoring & Debugging

### **Health Monitoring**

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Get health check details
docker inspect --format='{{.State.Health}}' smart-waste-backend

# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Check system events
docker events --since="1h"

# System-wide information
docker system df
docker system info
```

### **Debugging Techniques**

```bash
# Debug container startup issues
docker logs smart-waste-backend

# Debug with shell access
docker exec -it smart-waste-backend sh

# Debug networking
docker exec smart-waste-backend netstat -tuln
docker exec smart-waste-backend nslookup smart-waste-mongodb

# Debug file permissions
docker exec smart-waste-backend ls -la /app
docker exec smart-waste-backend whoami

# Debug environment variables
docker exec smart-waste-backend env
```

## Cleanup Operations

### **System Cleanup**

```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Complete system cleanup
docker system prune -a

# Remove everything including volumes (⚠️ Nuclear option!)
docker system prune -a --volumes
```

### **Specific Cleanup**

```bash
# Remove project containers and networks
docker-compose down --remove-orphans

# Remove project images
docker-compose down --rmi all

# Remove project volumes
docker-compose down -v

# Force remove stuck containers
docker rm -f $(docker ps -aq)

# Remove all project-related resources
docker-compose down -v --remove-orphans --rmi all
```

## Backup & Restore Procedures

### **Complete System Backup**

```bash
#!/bin/bash
# backup.sh - Complete backup script

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "Creating backup in $BACKUP_DIR..."

# 1. Export docker-compose configuration
cp docker-compose.yml $BACKUP_DIR/

# 2. Backup MongoDB
docker exec smart-waste-mongodb mongodump \
  --uri="mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin" \
  --out=/tmp/mongodb_backup

docker cp smart-waste-mongodb:/tmp/mongodb_backup $BACKUP_DIR/mongodb

# 3. Backup Redis
docker exec smart-waste-redis redis-cli BGSAVE
sleep 5
docker cp smart-waste-redis:/data/dump.rdb $BACKUP_DIR/redis_dump.rdb

# 4. Backup application code
tar -czf $BACKUP_DIR/source_code.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  backend/ frontend/ docs/

# 5. Export images
docker save smart-waste-management-backend > $BACKUP_DIR/backend_image.tar
docker save smart-waste-management-frontend > $BACKUP_DIR/frontend_image.tar

echo "Backup completed: $BACKUP_DIR"
```

### **Restore Procedure**

```bash
#!/bin/bash
# restore.sh - Restore from backup

BACKUP_DIR=$1

if [ -z "$BACKUP_DIR" ]; then
  echo "Usage: $0 <backup_directory>"
  exit 1
fi

echo "Restoring from $BACKUP_DIR..."

# 1. Stop current services
docker-compose down -v

# 2. Load images
docker load < $BACKUP_DIR/backend_image.tar
docker load < $BACKUP_DIR/frontend_image.tar

# 3. Start services
docker-compose up -d mongodb redis

# Wait for services to be ready
sleep 30

# 4. Restore MongoDB
docker cp $BACKUP_DIR/mongodb smart-waste-mongodb:/tmp/
docker exec smart-waste-mongodb mongorestore \
  --uri="mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin" \
  /tmp/mongodb/smart_waste

# 5. Restore Redis
docker cp $BACKUP_DIR/redis_dump.rdb smart-waste-redis:/data/dump.rdb
docker restart smart-waste-redis

# 6. Start application services
docker-compose up -d

echo "Restore completed"
```

## Performance Optimization

### **Resource Limits**

```yaml
# docker-compose.yml - Add resource limits
version: '3.8'
services:
  backend:
    # ... other configuration
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### **Performance Monitoring**

```bash
# Monitor container performance
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Get detailed metrics
docker exec smart-waste-backend cat /proc/meminfo
docker exec smart-waste-backend cat /proc/cpuinfo
```

## Security Operations

### **Security Scanning**

```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image smart-waste-management-backend

# Check for best practice violations
docker run --rm -i hadolint/hadolint < Dockerfile

# Security benchmark
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --label docker_bench_security \
  docker/docker-bench-security
```

### **Access Control**

```bash
# Run container with limited capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE smart-waste-backend

# Use read-only root filesystem
docker run --read-only smart-waste-backend

# Limit resources
docker run --memory=512m --cpus=1.0 smart-waste-backend
```

## Automation Scripts

### **Development Automation**

```bash
#!/bin/bash
# dev.sh - Development helper script

case "$1" in
  start)
    echo "Starting development environment..."
    docker-compose up -d
    echo "Services started. Frontend: http://localhost:3000"
    ;;
  stop)
    echo "Stopping development environment..."
    docker-compose down
    ;;
  restart)
    echo "Restarting development environment..."
    docker-compose down
    docker-compose up -d
    ;;
  logs)
    docker-compose logs -f ${2:-}
    ;;
  shell)
    docker exec -it smart-waste-${2:-backend} sh
    ;;
  db)
    docker exec -it smart-waste-mongodb mongosh \
      "mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin"
    ;;
  redis)
    docker exec -it smart-waste-redis redis-cli
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs [service]|shell [service]|db|redis}"
    exit 1
    ;;
esac
```

### **Production Deployment**

```bash
#!/bin/bash
# deploy.sh - Production deployment script

set -e

# Configuration
IMAGE_TAG=${1:-latest}
BACKUP_ENABLED=${2:-true}

echo "Deploying Smart Waste Management (tag: $IMAGE_TAG)..."

# 1. Create backup if enabled
if [ "$BACKUP_ENABLED" = "true" ]; then
  echo "Creating backup..."
  ./backup.sh
fi

# 2. Pull latest images
docker-compose pull

# 3. Build if needed
docker-compose build

# 4. Stop old containers
docker-compose down

# 5. Start new containers
docker-compose up -d

# 6. Wait for services to be healthy
echo "Waiting for services to be healthy..."
for i in {1..30}; do
  if docker exec smart-waste-backend curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "Backend is healthy"
    break
  fi
  echo "Waiting for backend... ($i/30)"
  sleep 10
done

# 7. Run health checks
echo "Running health checks..."
docker exec smart-waste-backend curl -f http://localhost:3001/health
docker exec smart-waste-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null

echo "Deployment completed successfully!"
echo "Application available at: http://localhost"
```

## Troubleshooting Guide

### **Common Issues**

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :3000
netstat -tulpn | grep :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use different host port
```

#### **Out of Disk Space**
```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a
docker volume prune
```

#### **Container Won't Start**
```bash
# Check logs
docker logs smart-waste-backend

# Try interactive mode
docker run -it smart-waste-management-backend sh

# Check configuration
docker exec smart-waste-backend env
```

#### **Network Connectivity Issues**
```bash
# Test connectivity
docker exec smart-waste-backend ping smart-waste-mongodb
docker exec smart-waste-backend nslookup smart-waste-mongodb

# Check network configuration
docker network inspect smart-waste-management_smart-waste-network
```

This comprehensive command reference provides all the essential Docker operations needed to manage the Smart Waste Management system effectively in development and production environments.
