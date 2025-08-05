const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);

const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/request');
const adminRoutes = require('./routes/admin');
const collectorRoutes = require('./routes/collector');
const userRoutes = require('./routes/user');
const stripeRoutes = require('./routes/stripe');
const createHealthCheckEndpoint = require('./middleware/healthcheck');

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Update to your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collector', collectorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stripe', stripeRoutes);

// Add health check endpoints
createHealthCheckEndpoint(app);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 60000, // 60 seconds
  socketTimeoutMS: 60000, // 60 seconds
  connectTimeoutMS: 60000, // 60 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
  heartbeatFrequencyMS: 10000, // 10 seconds
  family: 4 // Use IPv4, skip trying IPv6
})
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
