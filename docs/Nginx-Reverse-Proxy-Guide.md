# Nginx Reverse Proxy Study Guide for Smart Waste Management

## Introduction to Nginx

Nginx (pronounced "engine-x") is a high-performance web server, reverse proxy, and load balancer. In our Smart Waste Management system, Nginx acts as a **reverse proxy** that sits between clients and our backend services.

## What is a Reverse Proxy?

### **Forward Proxy vs Reverse Proxy**

```
Forward Proxy (Client-side):
Client → Proxy → Internet → Server

Reverse Proxy (Server-side):
Client → Internet → Proxy → Backend Server(s)
```

### **Reverse Proxy in Our System**

```
User Browser → Nginx (Port 80/443) → {
    /api/*     → Backend API (Port 3001)
    /*         → Frontend React App (Port 3000)
    /static/*  → Static Files (Cached)
}
```

## Why Use Nginx as Reverse Proxy?

### **1. Single Entry Point**
Instead of users accessing multiple ports:
- ❌ `http://localhost:3000` (Frontend)
- ❌ `http://localhost:3001` (Backend API)

Users access everything through one URL:
- ✅ `http://localhost` (Everything)

### **2. CORS Problem Solution**
Without Nginx, frontend and backend on different ports cause CORS issues:

```javascript
// Frontend on port 3000 trying to call backend on port 3001
fetch('http://localhost:3001/api/users') // ❌ CORS Error!
```

With Nginx reverse proxy:
```javascript
// Frontend calls backend through same domain
fetch('/api/users') // ✅ No CORS issues!
```

### **3. Production Readiness**
- SSL/TLS termination for HTTPS
- Load balancing across multiple backend instances
- Static file serving with caching
- Compression (gzip)
- Security headers
- Rate limiting
- DDoS protection

### **4. Performance Benefits**
- Nginx handles static files efficiently
- Connection pooling to backend
- Caching of responses
- Compression reduces bandwidth

## Nginx Configuration for Smart Waste Management

### **Basic Configuration Structure**

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    # Basic settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    
    # Compression
    gzip on;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;
    
    # Define upstream servers
    upstream backend {
        server smart-waste-backend:3001;
        # For load balancing, add more servers:
        # server smart-waste-backend-2:3001;
        # server smart-waste-backend-3:3001;
    }
    
    upstream frontend {
        server smart-waste-frontend:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        
        # API routes go to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # Static files with caching
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Everything else goes to frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### **Advanced Configuration with SSL**

```nginx
# Advanced nginx.conf with SSL and enhanced security
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Upstream servers with health checks
    upstream backend {
        server smart-waste-backend:3001 max_fails=3 fail_timeout=30s;
        # Load balancing methods:
        # least_conn;  # Least connections
        # ip_hash;     # Session persistence
    }
    
    upstream frontend {
        server smart-waste-frontend:3000 max_fails=3 fail_timeout=30s;
    }
    
    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name localhost smart-waste.local;
        return 301 https://$server_name$request_uri;
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name localhost smart-waste.local;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        
        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # API endpoints with rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            include proxy_headers.conf;
        }
        
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            include proxy_headers.conf;
            
            # CORS headers (if needed)
            add_header Access-Control-Allow-Origin $http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
            
            if ($request_method = 'OPTIONS') {
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Type 'text/plain; charset=utf-8';
                add_header Content-Length 0;
                return 204;
            }
        }
        
        # WebSocket support for real-time features
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Static files with aggressive caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            proxy_pass http://frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }
        
        # Frontend SPA routes
        location / {
            proxy_pass http://frontend;
            include proxy_headers.conf;
            
            # Handle SPA routing
            try_files $uri $uri/ @fallback;
        }
        
        location @fallback {
            proxy_pass http://frontend;
            include proxy_headers.conf;
        }
    }
}
```

### **Proxy Headers Configuration**

```nginx
# proxy_headers.conf (included file)
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;

# Timeouts
proxy_connect_timeout 30s;
proxy_send_timeout 30s;
proxy_read_timeout 30s;

# Buffering
proxy_buffering on;
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
```

## Load Balancing Strategies

### **1. Round Robin (Default)**
```nginx
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```
Requests distributed evenly: 1 → 2 → 3 → 1 → 2 → 3...

### **2. Least Connections**
```nginx
upstream backend {
    least_conn;
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```
Routes to server with fewest active connections.

### **3. IP Hash (Session Persistence)**
```nginx
upstream backend {
    ip_hash;
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```
Same client IP always goes to same server.

### **4. Weighted Load Balancing**
```nginx
upstream backend {
    server backend1:3001 weight=3;  # Gets 3x more requests
    server backend2:3001 weight=2;  # Gets 2x more requests
    server backend3:3001 weight=1;  # Gets 1x more requests
}
```

### **5. Health Checks**
```nginx
upstream backend {
    server backend1:3001 max_fails=3 fail_timeout=30s;
    server backend2:3001 max_fails=3 fail_timeout=30s;
    server backend3:3001 backup;  # Only used if others fail
}
```

## Caching Strategies

### **1. Static Asset Caching**
```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # Serve from nginx cache
    proxy_cache static_cache;
    proxy_cache_valid 200 1y;
    proxy_pass http://frontend;
}
```

### **2. API Response Caching**
```nginx
# Define cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

server {
    location /api/public/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        
        # Cache headers
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://backend;
    }
}
```

### **3. Conditional Caching**
```nginx
location /api/data/ {
    # Don't cache authenticated requests
    set $skip_cache 0;
    if ($http_authorization) {
        set $skip_cache 1;
    }
    
    proxy_cache_bypass $skip_cache;
    proxy_no_cache $skip_cache;
    
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_pass http://backend;
}
```

## Security Features

### **1. Rate Limiting**
```nginx
# Define rate limit zones
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

server {
    # Apply rate limits
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://backend;
    }
    
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://backend;
    }
    
    location / {
        limit_req zone=general burst=5 nodelay;
        proxy_pass http://frontend;
    }
}
```

### **2. IP Filtering**
```nginx
# Block specific IPs
location /admin/ {
    deny 192.168.1.100;
    deny 10.0.0.0/8;
    allow 192.168.1.0/24;
    allow 127.0.0.1;
    deny all;
    
    proxy_pass http://backend;
}
```

### **3. Request Size Limiting**
```nginx
server {
    # Limit request body size (for file uploads)
    client_max_body_size 10M;
    
    location /api/upload/ {
        client_max_body_size 50M;  # Higher limit for uploads
        proxy_pass http://backend;
    }
}
```

### **4. Security Headers**
```nginx
server {
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
    
    # Remove server version
    server_tokens off;
}
```

## Real-time Features Support

### **WebSocket Proxying**
```nginx
# Support for Socket.io real-time communications
location /socket.io/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Disable proxy buffering for real-time data
    proxy_buffering off;
    
    # Timeouts for long-lived connections
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
}
```

### **Server-Sent Events (SSE)**
```nginx
location /api/events/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # SSE specific settings
    proxy_set_header Cache-Control no-cache;
    proxy_buffering off;
    proxy_read_timeout 24h;
    proxy_send_timeout 24h;
    
    # CORS for SSE
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Cache-Control";
}
```

## Docker Integration

### **Docker Compose Configuration**
```yaml
nginx:
  image: nginx:alpine
  container_name: smart-waste-nginx
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    # Main configuration
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    
    # Additional configuration files
    - ./nginx/conf.d/:/etc/nginx/conf.d/:ro
    - ./nginx/proxy_headers.conf:/etc/nginx/proxy_headers.conf:ro
    
    # SSL certificates
    - ./nginx/ssl/:/etc/nginx/ssl/:ro
    
    # Static files
    - ./nginx/static/:/var/www/static/:ro
    
    # Logs
    - ./nginx/logs/:/var/log/nginx/
  depends_on:
    - frontend
    - backend
  networks:
    - smart-waste-network
  
  # Resource limits
  deploy:
    resources:
      limits:
        memory: 128M
      reservations:
        memory: 64M
```

### **Custom Nginx Image**
```dockerfile
# Dockerfile.nginx
FROM nginx:alpine

# Install additional modules if needed
RUN apk add --no-cache nginx-mod-http-geoip

# Copy configuration files
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/ /etc/nginx/conf.d/
COPY nginx/proxy_headers.conf /etc/nginx/proxy_headers.conf

# Copy SSL certificates
COPY nginx/ssl/ /etc/nginx/ssl/

# Create log directory
RUN mkdir -p /var/log/nginx

# Create user for nginx
RUN adduser -D -S nginx

# Set permissions
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

## Monitoring and Logging

### **Access Log Format**
```nginx
http {
    # Custom log format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
}
```

### **Health Check Endpoint**
```nginx
server {
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    location /nginx-status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

### **Metrics Collection**
```nginx
# Enable status module for monitoring
location /metrics {
    stub_status on;
    access_log off;
    
    # Allow only monitoring systems
    allow 172.0.0.0/8;  # Docker networks
    allow 127.0.0.1;
    deny all;
}
```

## Performance Optimization

### **1. Worker Processes**
```nginx
# Set worker processes based on CPU cores
worker_processes auto;

# Optimize worker connections
events {
    worker_connections 1024;
    use epoll;  # Linux
    multi_accept on;
}
```

### **2. File Handling**
```nginx
http {
    # Efficient file serving
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # File descriptor cache
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### **3. Compression**
```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

### **4. Keep-Alive Connections**
```nginx
http {
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # Upstream keep-alive
    upstream backend {
        server backend:3001;
        keepalive 32;
    }
    
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

## Troubleshooting

### **Common Issues and Solutions**

#### **1. 502 Bad Gateway**
```bash
# Check if backend services are running
docker ps

# Check Nginx error logs
docker logs smart-waste-nginx

# Test backend connectivity
docker exec smart-waste-nginx curl http://smart-waste-backend:3001/health
```

#### **2. Connection Refused**
```nginx
# Add resolver for dynamic upstream
resolver 127.0.0.11 valid=30s;  # Docker DNS

location /api/ {
    set $backend http://smart-waste-backend:3001;
    proxy_pass $backend;
}
```

#### **3. WebSocket Connection Issues**
```nginx
# Ensure proper WebSocket headers
location /socket.io/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
}

# Add connection upgrade map
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

### **Debugging Commands**
```bash
# Test configuration
docker exec smart-waste-nginx nginx -t

# Reload configuration
docker exec smart-waste-nginx nginx -s reload

# Check active connections
docker exec smart-waste-nginx curl http://localhost/nginx-status

# View real-time logs
docker logs -f smart-waste-nginx
```

## Best Practices

### **1. Configuration Management**
- ✅ Use separate config files for different environments
- ✅ Keep sensitive data in environment variables
- ✅ Version control configuration files
- ✅ Test configurations before deployment

### **2. Security**
- ✅ Always use HTTPS in production
- ✅ Implement rate limiting
- ✅ Add security headers
- ✅ Hide server version information
- ✅ Regularly update Nginx

### **3. Performance**
- ✅ Enable compression
- ✅ Use caching strategically
- ✅ Optimize worker processes
- ✅ Monitor performance metrics
- ✅ Use CDN for static assets

### **4. Monitoring**
- ✅ Set up proper logging
- ✅ Monitor error rates
- ✅ Track response times
- ✅ Set up health checks
- ✅ Alert on service failures

This Nginx configuration provides a robust, secure, and high-performance reverse proxy solution for the Smart Waste Management system, handling load balancing, caching, security, and real-time communications efficiently.
