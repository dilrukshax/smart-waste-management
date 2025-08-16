# Redis Cache Study Guide for Smart Waste Management

## Introduction to Redis

Redis (Remote Dictionary Server) is an **in-memory data structure store** that can be used as a database, cache, and message broker. It supports various data structures like strings, hashes, lists, sets, sorted sets, and more.

## Why Redis in Waste Management Systems?

### **1. High Performance Requirements**

Waste management systems need real-time data for:
- Collector location tracking
- Route optimization
- Live status updates
- Real-time notifications

**Traditional Database vs Redis Response Times:**
```
MongoDB Query:     ~10-50ms
Redis Cache:       ~0.1-1ms  (50x faster!)
```

### **2. Temporary Data Storage**

Many operations in waste management involve temporary data:
- User session tokens
- OTP codes for verification
- Real-time GPS coordinates
- Temporary route calculations
- Rate limiting counters

### **3. Caching Frequently Accessed Data**

```javascript
// Instead of querying MongoDB every time:
const user = await User.findById(userId); // 20ms

// Cache the result in Redis:
await redis.setex(`user:${userId}`, 3600, JSON.stringify(user)); // 1ms next time
```

## Redis Data Structures and Use Cases

### **1. Strings - Simple Key-Value Storage**

```javascript
// Store user session
await redis.set('session:abc123def456', 'user:789', 'EX', 3600); // Expires in 1 hour

// Store OTP codes
await redis.setex('otp:+94771234567', 300, '123456'); // 5 minutes expiry

// Cache API responses
await redis.setex('api:weather:colombo', 1800, JSON.stringify(weatherData)); // 30 minutes

// Store temporary tokens
await redis.set('reset_token:user123', 'temp_token_xyz', 'EX', 900); // 15 minutes
```

**Application Examples:**
```javascript
// backend/services/authService.js
class AuthService {
  async createSession(userId) {
    const sessionId = generateUniqueId();
    const sessionData = {
      userId,
      createdAt: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    };
    
    // Store session for 24 hours
    await redis.setex(
      `session:${sessionId}`, 
      86400, 
      JSON.stringify(sessionData)
    );
    
    return sessionId;
  }

  async validateSession(sessionId) {
    const sessionData = await redis.get(`session:${sessionId}`);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async destroySession(sessionId) {
    await redis.del(`session:${sessionId}`);
  }
}
```

### **2. Hashes - Object Storage**

```javascript
// Store user profile data
await redis.hset('user:123', {
  'firstName': 'John',
  'lastName': 'Doe',
  'email': 'john@example.com',
  'lastLogin': new Date().toISOString()
});

// Store collector real-time data
await redis.hset('collector:456', {
  'latitude': '6.9271',
  'longitude': '79.8612',
  'status': 'collecting',
  'currentLoad': '75',
  'lastUpdate': Date.now()
});

// Get specific fields
const collectorLocation = await redis.hmget('collector:456', 'latitude', 'longitude');
```

**Collector Tracking System:**
```javascript
// backend/services/collectorTrackingService.js
class CollectorTrackingService {
  async updateCollectorLocation(collectorId, latitude, longitude) {
    const timestamp = Date.now();
    
    await redis.hset(`collector:${collectorId}:location`, {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      timestamp: timestamp.toString(),
      status: 'active'
    });
    
    // Set expiry for inactive collectors
    await redis.expire(`collector:${collectorId}:location`, 3600);
    
    // Also add to recent locations list
    await redis.lpush(
      `collector:${collectorId}:path`, 
      JSON.stringify({ latitude, longitude, timestamp })
    );
    
    // Keep only last 100 locations
    await redis.ltrim(`collector:${collectorId}:path`, 0, 99);
  }

  async getCollectorLocation(collectorId) {
    const location = await redis.hgetall(`collector:${collectorId}:location`);
    return location.latitude ? {
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
      timestamp: parseInt(location.timestamp),
      status: location.status
    } : null;
  }

  async getAllActiveCollectors() {
    const collectorIds = await redis.keys('collector:*:location');
    const locations = [];
    
    for (const key of collectorIds) {
      const collectorId = key.split(':')[1];
      const location = await this.getCollectorLocation(collectorId);
      if (location) {
        locations.push({ collectorId, ...location });
      }
    }
    
    return locations;
  }
}
```

### **3. Lists - Ordered Data Storage**

```javascript
// Queue system for waste collection requests
await redis.lpush('requests:pending', JSON.stringify({
  requestId: 'req123',
  priority: 'high',
  wasteType: 'hazardous',
  location: { lat: 6.9271, lon: 79.8612 }
}));

// Process requests FIFO
const nextRequest = await redis.rpop('requests:pending');

// Recent notifications for user
await redis.lpush('notifications:user123', JSON.stringify({
  type: 'collection_completed',
  message: 'Your waste has been collected',
  timestamp: new Date().toISOString()
}));
```

**Notification System:**
```javascript
// backend/services/notificationService.js
class NotificationService {
  async addNotification(userId, notification) {
    const notificationData = {
      id: generateUniqueId(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Add to user's notification list
    await redis.lpush(
      `notifications:${userId}`, 
      JSON.stringify(notificationData)
    );
    
    // Keep only last 50 notifications
    await redis.ltrim(`notifications:${userId}`, 0, 49);
    
    // Increment unread counter
    await redis.incr(`notifications:${userId}:unread`);
    
    return notificationData;
  }

  async getNotifications(userId, limit = 20) {
    const notifications = await redis.lrange(`notifications:${userId}`, 0, limit - 1);
    return notifications.map(n => JSON.parse(n));
  }

  async markAsRead(userId, notificationId) {
    const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
    const updatedNotifications = notifications.map(n => {
      const notification = JSON.parse(n);
      if (notification.id === notificationId) {
        notification.read = true;
      }
      return JSON.stringify(notification);
    });
    
    // Replace the entire list
    await redis.del(`notifications:${userId}`);
    if (updatedNotifications.length > 0) {
      await redis.lpush(`notifications:${userId}`, ...updatedNotifications);
    }
    
    // Decrement unread counter
    await redis.decr(`notifications:${userId}:unread`);
  }
}
```

### **4. Sets - Unique Collections**

```javascript
// Active collectors in a region
await redis.sadd('collectors:active:colombo', 'collector123', 'collector456');

// Users subscribed to notifications
await redis.sadd('subscribers:email', 'user123', 'user456', 'user789');

// Available waste types
await redis.sadd('waste_types', 'organic', 'recyclable', 'electronic', 'hazardous');

// Check membership
const isActive = await redis.sismember('collectors:active:colombo', 'collector123');

// Get all members
const activeCollectors = await redis.smembers('collectors:active:colombo');
```

**Online Users Tracking:**
```javascript
// backend/services/onlineUsersService.js
class OnlineUsersService {
  async userOnline(userId) {
    // Add user to online set
    await redis.sadd('users:online', userId);
    
    // Set user's last seen timestamp
    await redis.hset('users:last_seen', userId, Date.now());
    
    // Set expiry for automatic cleanup
    await redis.expire(`users:online:${userId}`, 300); // 5 minutes
  }

  async userOffline(userId) {
    await redis.srem('users:online', userId);
    await redis.hset('users:last_seen', userId, Date.now());
  }

  async getOnlineUsers() {
    return await redis.smembers('users:online');
  }

  async getOnlineCount() {
    return await redis.scard('users:online');
  }

  async isUserOnline(userId) {
    return await redis.sismember('users:online', userId);
  }
}
```

### **5. Sorted Sets - Ranked Data**

```javascript
// Leaderboard for eco-friendly users (by points)
await redis.zadd('leaderboard:eco_points', 150, 'user123');
await redis.zadd('leaderboard:eco_points', 200, 'user456');
await redis.zadd('leaderboard:eco_points', 175, 'user789');

// Get top 10 users
const topUsers = await redis.zrevrange('leaderboard:eco_points', 0, 9, 'WITHSCORES');

// Priority queue for waste collection requests
await redis.zadd('requests:priority', 
  Date.now() + (priority * 1000), // Score based on time + priority
  JSON.stringify(requestData)
);

// Get highest priority request
const nextRequest = await redis.zrevrange('requests:priority', 0, 0);
```

**Request Priority System:**
```javascript
// backend/services/requestPriorityService.js
class RequestPriorityService {
  async addRequest(requestData) {
    const { requestId, priority, wasteType, scheduledTime } = requestData;
    
    // Calculate priority score
    let score = new Date(scheduledTime).getTime();
    
    // Adjust score based on waste type priority
    const typeMultipliers = {
      'hazardous': 1000000,
      'electronic': 100000,
      'organic': 10000,
      'recyclable': 1000
    };
    
    score += typeMultipliers[wasteType] || 0;
    score += priority * 100000;
    
    await redis.zadd('requests:priority_queue', score, JSON.stringify(requestData));
  }

  async getNextRequest() {
    const requests = await redis.zrevrange('requests:priority_queue', 0, 0);
    if (requests.length > 0) {
      await redis.zrem('requests:priority_queue', requests[0]);
      return JSON.parse(requests[0]);
    }
    return null;
  }

  async getRequestsByPriority(limit = 10) {
    const requests = await redis.zrevrange('requests:priority_queue', 0, limit - 1);
    return requests.map(r => JSON.parse(r));
  }
}
```

### **6. Pub/Sub - Real-time Communication**

```javascript
// Publisher (when waste is collected)
await redis.publish('waste_collected', JSON.stringify({
  requestId: 'req123',
  userId: 'user456',
  collectorId: 'collector789',
  timestamp: new Date().toISOString()
}));

// Subscriber (notification service)
redis.subscribe('waste_collected');
redis.on('message', (channel, message) => {
  const data = JSON.parse(message);
  // Send push notification to user
  sendPushNotification(data.userId, 'Your waste has been collected!');
});
```

**Real-time Updates System:**
```javascript
// backend/services/realtimeService.js
class RealtimeService {
  constructor(io) {
    this.io = io; // Socket.io instance
    this.setupRedisSubscriptions();
  }

  setupRedisSubscriptions() {
    const subscriber = redis.duplicate();
    
    // Subscribe to various channels
    subscriber.subscribe('collector_location_update');
    subscriber.subscribe('request_status_change');
    subscriber.subscribe('new_notification');
    
    subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      
      switch (channel) {
        case 'collector_location_update':
          this.io.to(`region_${data.region}`).emit('collector_moved', data);
          break;
          
        case 'request_status_change':
          this.io.to(`user_${data.userId}`).emit('request_update', data);
          break;
          
        case 'new_notification':
          this.io.to(`user_${data.userId}`).emit('notification', data);
          break;
      }
    });
  }

  publishCollectorLocationUpdate(collectorId, location) {
    redis.publish('collector_location_update', JSON.stringify({
      collectorId,
      location,
      timestamp: new Date().toISOString()
    }));
  }

  publishRequestStatusChange(requestId, userId, status) {
    redis.publish('request_status_change', JSON.stringify({
      requestId,
      userId,
      status,
      timestamp: new Date().toISOString()
    }));
  }
}
```

## Caching Strategies

### **1. Cache-Aside Pattern**

```javascript
// backend/services/cacheService.js
class CacheService {
  async getUser(userId) {
    // Try cache first
    const cached = await redis.get(`user:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cache miss - fetch from database
    const user = await User.findById(userId);
    if (user) {
      // Store in cache for 1 hour
      await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
    }
    
    return user;
  }

  async updateUser(userId, updateData) {
    // Update database
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    // Update cache
    await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
    
    return user;
  }

  async invalidateUser(userId) {
    await redis.del(`user:${userId}`);
  }
}
```

### **2. Write-Through Pattern**

```javascript
class WasteCategoryService {
  async updateCategory(categoryId, data) {
    // Update both database and cache simultaneously
    const [category] = await Promise.all([
      WasteCategory.findByIdAndUpdate(categoryId, data, { new: true }),
      redis.setex(`category:${categoryId}`, 7200, JSON.stringify(data))
    ]);
    
    return category;
  }
}
```

### **3. Write-Behind Pattern**

```javascript
class AnalyticsService {
  async recordEvent(eventType, data) {
    // Store in Redis immediately
    await redis.lpush(`events:${eventType}`, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
    
    // Batch write to MongoDB every 10 seconds (handled by background job)
    this.scheduleBackgroundWrite();
  }

  async scheduleBackgroundWrite() {
    // Background job processes Redis lists and writes to MongoDB
    setInterval(async () => {
      const events = await redis.lrange('events:waste_collected', 0, 99);
      if (events.length > 0) {
        const eventData = events.map(e => JSON.parse(e));
        await AnalyticsEvent.insertMany(eventData);
        await redis.ltrim('events:waste_collected', 100, -1);
      }
    }, 10000);
  }
}
```

## Rate Limiting

```javascript
// backend/middleware/rateLimit.js
class RateLimitService {
  async checkRateLimit(userId, action, limit = 10, window = 60) {
    const key = `rate_limit:${action}:${userId}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      // First request in window - set expiry
      await redis.expire(key, window);
    }
    
    if (current > limit) {
      const ttl = await redis.ttl(key);
      throw new Error(`Rate limit exceeded. Try again in ${ttl} seconds.`);
    }
    
    return {
      allowed: true,
      remaining: limit - current,
      resetTime: Date.now() + (window * 1000)
    };
  }

  // Sliding window rate limiting
  async slidingWindowRateLimit(userId, action, limit = 10, window = 60) {
    const key = `sliding:${action}:${userId}`;
    const now = Date.now();
    const cutoff = now - (window * 1000);
    
    // Remove old entries
    await redis.zremrangebyscore(key, 0, cutoff);
    
    // Count current requests
    const current = await redis.zcard(key);
    
    if (current >= limit) {
      throw new Error('Rate limit exceeded');
    }
    
    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, window);
    
    return {
      allowed: true,
      remaining: limit - current - 1
    };
  }
}

// Usage in route
app.post('/api/waste-request', async (req, res) => {
  try {
    await rateLimitService.checkRateLimit(req.userId, 'create_request', 5, 3600);
    // Process request...
  } catch (error) {
    res.status(429).json({ error: error.message });
  }
});
```

## Session Management

```javascript
// backend/middleware/sessionManager.js
class SessionManager {
  async createSession(userId, deviceInfo) {
    const sessionId = generateUniqueId();
    const sessionData = {
      userId,
      deviceInfo,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    // Store session
    await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));
    
    // Add to user's active sessions
    await redis.sadd(`user_sessions:${userId}`, sessionId);
    
    return sessionId;
  }

  async validateSession(sessionId) {
    const sessionData = await redis.get(`session:${sessionId}`);
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData);
    
    // Update last activity
    session.lastActivity = Date.now();
    await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(session));
    
    return session;
  }

  async destroySession(sessionId) {
    const sessionData = await redis.get(`session:${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      await redis.srem(`user_sessions:${session.userId}`, sessionId);
    }
    
    await redis.del(`session:${sessionId}`);
  }

  async destroyAllUserSessions(userId) {
    const sessions = await redis.smembers(`user_sessions:${userId}`);
    if (sessions.length > 0) {
      const pipeline = redis.pipeline();
      sessions.forEach(sessionId => {
        pipeline.del(`session:${sessionId}`);
      });
      pipeline.del(`user_sessions:${userId}`);
      await pipeline.exec();
    }
  }
}
```

## Docker Redis Configuration

### **Docker Compose Setup**

```yaml
redis:
  image: redis:7-alpine
  container_name: smart-waste-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    # Persistent storage for Redis data
    - redis_data:/data
    
    # Custom Redis configuration
    - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
  networks:
    - smart-waste-network
  command: redis-server /usr/local/etc/redis/redis.conf
  
  # Resource limits
  deploy:
    resources:
      limits:
        memory: 512M
      reservations:
        memory: 256M
```

### **Redis Configuration File**

```bash
# redis.conf
# Basic Configuration
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300

# Memory Management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Enable AOF for durability
appendonly yes
appendfsync everysec

# Security
requirepass your_redis_password

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Performance
tcp-backlog 511
databases 16
```

### **Connection in Node.js**

```javascript
// backend/config/redis.js
const Redis = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

module.exports = redis;
```

## Performance Monitoring

### **Redis Metrics to Monitor**

```javascript
// backend/services/redisMonitoring.js
class RedisMonitoringService {
  async getRedisStats() {
    const info = await redis.info();
    const memory = await redis.info('memory');
    const stats = await redis.info('stats');
    
    return {
      connected_clients: this.parseInfo(info, 'connected_clients'),
      used_memory: this.parseInfo(memory, 'used_memory_human'),
      used_memory_peak: this.parseInfo(memory, 'used_memory_peak_human'),
      keyspace_hits: this.parseInfo(stats, 'keyspace_hits'),
      keyspace_misses: this.parseInfo(stats, 'keyspace_misses'),
      hit_rate: this.calculateHitRate(stats)
    };
  }

  parseInfo(info, key) {
    const line = info.split('\n').find(line => line.startsWith(key));
    return line ? line.split(':')[1].trim() : null;
  }

  calculateHitRate(stats) {
    const hits = parseInt(this.parseInfo(stats, 'keyspace_hits') || 0);
    const misses = parseInt(this.parseInfo(stats, 'keyspace_misses') || 0);
    const total = hits + misses;
    return total > 0 ? ((hits / total) * 100).toFixed(2) + '%' : '0%';
  }

  async getSlowLog() {
    return await redis.slowlog('get', 10);
  }
}
```

### **Health Check Endpoint**

```javascript
// backend/routes/health.js
app.get('/health/redis', async (req, res) => {
  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    
    const stats = await redisMonitoring.getRedisStats();
    
    res.json({
      status: 'healthy',
      latency: `${latency}ms`,
      stats
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Best Practices

### **1. Key Naming Convention**
```javascript
// Good key naming patterns
`user:${userId}:profile`
`session:${sessionId}`
`cache:api:${endpoint}:${params}`
`counter:${type}:${date}`
`lock:${resource}:${id}`
```

### **2. Memory Optimization**
```javascript
// Use appropriate data types
await redis.hset(`user:${userId}`, field, value); // Instead of JSON string

// Set expiration for temporary data
await redis.setex(key, 3600, value); // 1 hour expiry

// Use pipelining for multiple operations
const pipeline = redis.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
await pipeline.exec();
```

### **3. Error Handling**
```javascript
class RedisService {
  async safeGet(key) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null; // Graceful degradation
    }
  }

  async safeSet(key, value, ttl) {
    try {
      if (ttl) {
        return await redis.setex(key, ttl, value);
      }
      return await redis.set(key, value);
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }
}
```

This Redis implementation provides high-performance caching, session management, real-time features, and efficient data storage for the Smart Waste Management system.
