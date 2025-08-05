// MongoDB initialization script
db = db.getSiblingDB('smart_waste');

// Create collections
db.createCollection('users');
db.createCollection('requests');
db.createCollection('invoices');
db.createCollection('garbageCollectionEntries');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.requests.createIndex({ "userId": 1 });
db.requests.createIndex({ "status": 1 });
db.requests.createIndex({ "createdAt": 1 });
db.invoices.createIndex({ "userId": 1 });
db.invoices.createIndex({ "status": 1 });
db.garbageCollectionEntries.createIndex({ "collectorId": 1 });
db.garbageCollectionEntries.createIndex({ "category": 1 });
db.garbageCollectionEntries.createIndex({ "date": 1 });

print('Database initialization completed successfully!');
