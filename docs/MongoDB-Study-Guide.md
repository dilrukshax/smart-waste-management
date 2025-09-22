# MongoDB Study Guide for Smart Waste Management

## Introduction to MongoDB

MongoDB is a **document-oriented NoSQL database** that stores data in flexible, JSON-like documents called BSON (Binary JSON). Unlike traditional relational databases with tables and rows, MongoDB uses collections and documents.

## Why MongoDB for Waste Management Systems?

### **1. Flexible Schema Design**

Traditional SQL databases require fixed schemas, but waste management data is diverse:

```javascript
// User waste request - varies by waste type
{
  "_id": ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
  "userId": "user123",
  "wasteType": "electronic",
  "items": [
    {
      "type": "laptop",
      "brand": "Dell",
      "model": "Inspiron 15",
      "condition": "broken",
      "estimatedValue": 0
    },
    {
      "type": "mobile_phone",
      "brand": "Samsung",
      "model": "Galaxy S20",
      "condition": "working",
      "estimatedValue": 150
    }
  ],
  "location": {
    "type": "Point",
    "coordinates": [79.8612, 6.9271], // [longitude, latitude]
    "address": "123 Main Street, Colombo 03"
  },
  "requestDate": ISODate("2025-08-16T10:30:00Z"),
  "status": "pending",
  "specialRequirements": [
    "data_destruction_certificate",
    "component_recycling"
  ]
}

// Organic waste request - different structure
{
  "_id": ObjectId("64f1a2b3c4d5e6f7g8h9i0j2"),
  "userId": "user456",
  "wasteType": "organic",
  "estimatedWeight": 25.5,
  "location": {
    "type": "Point",
    "coordinates": [79.8500, 6.9200],
    "address": "456 Garden Road, Colombo 05"
  },
  "compostingPreference": true,
  "pickupTimePreference": "morning",
  "gardenWasteDetails": {
    "treeTrimmings": true,
    "lawnClippings": false,
    "kitchenScraps": true
  }
}
```

### **2. Geospatial Capabilities**

MongoDB has built-in support for geospatial queries, perfect for location-based waste collection:

```javascript
// Find all waste requests within 5km radius of a collector
db.waste_requests.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [79.8612, 6.9271] // Collector's current location
      },
      $maxDistance: 5000 // 5 kilometers in meters
    }
  },
  status: "pending"
});

// Find optimal collection route using geospatial aggregation
db.waste_requests.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [79.8612, 6.9271] },
      distanceField: "distance",
      maxDistance: 10000,
      spherical: true
    }
  },
  {
    $match: { status: "pending" }
  },
  {
    $sort: { distance: 1, priority: -1 }
  }
]);
```

### **3. Rich Document Structure**

Store complex nested data without expensive JOINs:

```javascript
// Complete user profile with embedded data
{
  "_id": ObjectId("64f1a2b3c4d5e6f7g8h9i0j3"),
  "email": "john.doe@email.com",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+94771234567",
    "preferences": {
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      },
      "pickupTimes": ["morning", "afternoon"],
      "wasteTypes": ["organic", "recyclable"]
    }
  },
  "address": {
    "street": "123 Main Street",
    "city": "Colombo",
    "district": "Colombo",
    "postalCode": "00300",
    "coordinates": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    }
  },
  "subscriptions": [
    {
      "type": "weekly_organic",
      "startDate": ISODate("2025-01-01T00:00:00Z"),
      "nextPickup": ISODate("2025-08-20T08:00:00Z"),
      "isActive": true
    }
  ],
  "wasteHistory": [
    {
      "requestId": ObjectId("64f1a2b3c4d5e6f7g8h9i0j1"),
      "date": ISODate("2025-08-10T10:00:00Z"),
      "type": "organic",
      "weight": 15.5,
      "cost": 250
    }
  ],
  "createdAt": ISODate("2025-01-01T00:00:00Z"),
  "updatedAt": ISODate("2025-08-16T10:30:00Z")
}
```

## MongoDB Database Structure

### **Collections in Smart Waste Management**

```javascript
// Database: smart_waste
├── users                 // User accounts and profiles
├── waste_requests        // Waste collection requests
├── collectors           // Garbage collector profiles
├── collection_routes    // Optimized collection routes
├── invoices            // Billing and payment records
├── waste_categories    // Types of waste and pricing
├── notifications       // System notifications
├── feedback           // User feedback and ratings
└── analytics_data     // System analytics and reports
```

### **Document Examples by Collection**

#### **Users Collection**
```javascript
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "password": "$2a$10$hashedPassword...",
  "role": "customer", // customer, collector, admin
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+94771234567",
    "avatar": "https://example.com/avatar.jpg"
  },
  "address": {
    "street": "123 Main Street",
    "city": "Colombo",
    "coordinates": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    }
  },
  "isVerified": true,
  "createdAt": ISODate("2025-01-01T00:00:00Z")
}
```

#### **Waste Requests Collection**
```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "collectorId": ObjectId("..."), // Assigned collector
  "wasteType": "recyclable",
  "category": "plastic",
  "estimatedWeight": 10.5,
  "actualWeight": 12.0, // Filled after collection
  "location": {
    "type": "Point",
    "coordinates": [79.8612, 6.9271],
    "address": "123 Main Street, Colombo"
  },
  "scheduledDate": ISODate("2025-08-20T08:00:00Z"),
  "completedDate": ISODate("2025-08-20T08:30:00Z"),
  "status": "completed", // pending, assigned, in_progress, completed, cancelled
  "priority": 3, // 1-5 scale
  "pricing": {
    "baseRate": 100,
    "weightRate": 20,
    "totalCost": 340
  },
  "images": [
    "https://storage.com/waste-image-1.jpg",
    "https://storage.com/waste-image-2.jpg"
  ],
  "specialInstructions": "Heavy items, need 2 people",
  "feedback": {
    "rating": 5,
    "comment": "Excellent service, on time!",
    "submittedAt": ISODate("2025-08-20T09:00:00Z")
  }
}
```

#### **Collectors Collection**
```javascript
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."), // Reference to users collection
  "employeeId": "COL001",
  "vehicle": {
    "type": "truck",
    "plateNumber": "CAB-1234",
    "capacity": 1000, // kg
    "fuelType": "diesel"
  },
  "currentLocation": {
    "type": "Point",
    "coordinates": [79.8500, 6.9200],
    "lastUpdated": ISODate("2025-08-16T10:30:00Z")
  },
  "workingHours": {
    "start": "08:00",
    "end": "17:00"
  },
  "specializations": ["electronic", "hazardous"],
  "currentRoute": ObjectId("..."), // Reference to collection_routes
  "stats": {
    "totalCollections": 245,
    "totalWeight": 12500.5,
    "averageRating": 4.7,
    "completionRate": 98.5
  },
  "isActive": true
}
```

## MongoDB Operations in the Application

### **Connection Setup**

```javascript
// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### **Mongoose Models**

```javascript
// backend/models/WasteRequest.js
const mongoose = require('mongoose');

const wasteRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['organic', 'recyclable', 'electronic', 'hazardous'],
    required: true
  },
  estimatedWeight: {
    type: Number,
    min: 0,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
wasteRequestSchema.index({ location: '2dsphere' });

// Index for efficient status queries
wasteRequestSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.model('WasteRequest', wasteRequestSchema);
```

### **Common Query Patterns**

#### **1. Find Nearby Waste Requests**
```javascript
// Find waste requests within 5km of collector's location
const nearbyRequests = await WasteRequest.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [collectorLon, collectorLat]
      },
      $maxDistance: 5000 // 5km in meters
    }
  },
  status: 'pending'
}).populate('userId', 'profile.firstName profile.lastName profile.phone');
```

#### **2. Aggregate Collection Statistics**
```javascript
// Get collection statistics by waste type
const stats = await WasteRequest.aggregate([
  {
    $match: {
      status: 'completed',
      completedDate: {
        $gte: new Date('2025-08-01'),
        $lt: new Date('2025-09-01')
      }
    }
  },
  {
    $group: {
      _id: '$wasteType',
      totalCollections: { $sum: 1 },
      totalWeight: { $sum: '$actualWeight' },
      averageWeight: { $avg: '$actualWeight' },
      totalRevenue: { $sum: '$pricing.totalCost' }
    }
  },
  {
    $sort: { totalWeight: -1 }
  }
]);
```

#### **3. Route Optimization Query**
```javascript
// Find optimal route for collector
const optimizedRoute = await WasteRequest.aggregate([
  {
    $geoNear: {
      near: { 
        type: 'Point', 
        coordinates: [startLon, startLat] 
      },
      distanceField: 'distanceFromStart',
      maxDistance: 10000,
      spherical: true,
      query: { 
        status: 'assigned',
        collectorId: new ObjectId(collectorId),
        scheduledDate: {
          $gte: new Date(today),
          $lt: new Date(tomorrow)
        }
      }
    }
  },
  {
    $addFields: {
      priorityScore: {
        $add: [
          { $multiply: ['$priority', 1000] },
          { $subtract: [10000, '$distanceFromStart'] }
        ]
      }
    }
  },
  {
    $sort: { priorityScore: -1 }
  }
]);
```

## MongoDB Indexing Strategy

### **Essential Indexes**

```javascript
// 1. Geospatial index for location queries
db.waste_requests.createIndex({ "location": "2dsphere" });

// 2. Compound index for status and date queries
db.waste_requests.createIndex({ 
  "status": 1, 
  "scheduledDate": 1 
});

// 3. User-specific requests
db.waste_requests.createIndex({ "userId": 1, "createdAt": -1 });

// 4. Collector assignments
db.waste_requests.createIndex({ 
  "collectorId": 1, 
  "status": 1, 
  "scheduledDate": 1 
});

// 5. Text search for addresses
db.waste_requests.createIndex({ 
  "location.address": "text",
  "specialInstructions": "text"
});

// 6. Email uniqueness
db.users.createIndex({ "email": 1 }, { unique: true });
```

### **Performance Optimization**

```javascript
// Use projection to limit returned fields
const requests = await WasteRequest.find(
  { status: 'pending' },
  'wasteType estimatedWeight location.address scheduledDate'
);

// Use lean() for read-only operations (faster)
const stats = await WasteRequest.find({ status: 'completed' }).lean();

// Batch operations for better performance
const bulkOps = requests.map(request => ({
  updateOne: {
    filter: { _id: request._id },
    update: { status: 'assigned', collectorId: collectorId }
  }
}));

await WasteRequest.bulkWrite(bulkOps);
```

## Docker MongoDB Configuration

### **Docker Compose Configuration**

```yaml
mongodb:
  image: mongo:6.0
  container_name: smart-waste-mongodb
  restart: unless-stopped
  environment:
    # Root user for database administration
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: password123
    
    # Default database to create
    MONGO_INITDB_DATABASE: smart_waste
  ports:
    - "27017:27017"
  volumes:
    # Persistent data storage
    - mongodb_data:/data/db
    
    # Database initialization script
    - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
  networks:
    - smart-waste-network
```

### **Database Initialization Script**

```javascript
// init-mongo.js - Runs when container starts for the first time
db.createUser({
  user: "smart_waste_user",
  pwd: "smart_waste_password",
  roles: [
    {
      role: "readWrite",
      db: "smart_waste"
    }
  ]
});

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        role: {
          enum: ["customer", "collector", "admin"]
        }
      }
    }
  }
});

// Insert sample data
db.waste_categories.insertMany([
  {
    name: "Organic",
    description: "Biodegradable waste like food scraps, garden waste",
    baseRate: 100,
    weightRate: 15,
    color: "#4CAF50"
  },
  {
    name: "Recyclable",
    description: "Paper, plastic, glass, metal that can be recycled",
    baseRate: 80,
    weightRate: 12,
    color: "#2196F3"
  },
  {
    name: "Electronic",
    description: "Electronic devices and components",
    baseRate: 200,
    weightRate: 25,
    color: "#FF9800"
  },
  {
    name: "Hazardous",
    description: "Toxic or dangerous materials requiring special handling",
    baseRate: 500,
    weightRate: 50,
    color: "#F44336"
  }
]);

print("Database initialized successfully!");
```

## MongoDB Monitoring and Maintenance

### **Health Checks**

```javascript
// backend/middleware/healthcheck.js
const mongoose = require('mongoose');

const healthCheck = async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Check database operations
    const testQuery = await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      status: 'healthy',
      database: {
        status: dbStates[dbStatus],
        ping: testQuery.ok === 1 ? 'success' : 'failed'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = healthCheck;
```

### **Backup Strategy**

```bash
# Create database backup
docker exec smart-waste-mongodb mongodump \
  --uri="mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin" \
  --out=/backup

# Restore database backup
docker exec smart-waste-mongodb mongorestore \
  --uri="mongodb://admin:password123@localhost:27017/smart_waste?authSource=admin" \
  /backup/smart_waste
```

### **Performance Monitoring**

```javascript
// Monitor slow queries
db.setProfilingLevel(2, { slowms: 100 });

// View slow operations
db.system.profile.find().limit(5).sort({ time: -1 }).pretty();

// Check index usage
db.waste_requests.getIndexes();
db.waste_requests.stats();
```

## Best Practices for MongoDB in Production

### **Security**
- ✅ Use authentication (username/password)
- ✅ Enable authorization with specific roles
- ✅ Use TLS/SSL for encrypted connections
- ✅ Limit network access with IP whitelisting
- ✅ Regular security updates

### **Performance**
- ✅ Create appropriate indexes
- ✅ Use projection to limit returned fields
- ✅ Implement connection pooling
- ✅ Monitor query performance
- ✅ Use aggregation pipelines efficiently

### **Reliability**
- ✅ Regular backups
- ✅ Replica sets for high availability
- ✅ Health monitoring
- ✅ Proper error handling
- ✅ Connection retry logic

This MongoDB setup provides a robust foundation for the Smart Waste Management system, handling complex geospatial data, flexible document structures, and efficient querying for location-based services.
