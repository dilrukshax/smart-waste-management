// Health check endpoint for the backend
const express = require('express');
const mongoose = require('mongoose');

const createHealthCheckEndpoint = (app) => {
  app.get('/health', async (req, res) => {
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      checks: {}
    };

    try {
      // Check database connection
      if (mongoose.connection.readyState === 1) {
        healthCheck.checks.database = 'connected';
      } else {
        healthCheck.checks.database = 'disconnected';
        throw new Error('Database not connected');
      }

      // Check memory usage
      const memUsage = process.memoryUsage();
      healthCheck.checks.memory = {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`
      };

      // Check if critical environment variables are set
      const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        healthCheck.checks.environment = `Missing: ${missingVars.join(', ')}`;
        throw new Error('Missing required environment variables');
      } else {
        healthCheck.checks.environment = 'OK';
      }

      res.status(200).json(healthCheck);
    } catch (error) {
      healthCheck.message = error.message;
      res.status(503).json(healthCheck);
    }
  });

  // Readiness probe endpoint
  app.get('/ready', async (req, res) => {
    try {
      // Check if the application is ready to serve requests
      if (mongoose.connection.readyState === 1) {
        res.status(200).json({ status: 'ready' });
      } else {
        res.status(503).json({ status: 'not ready', reason: 'database not connected' });
      }
    } catch (error) {
      res.status(503).json({ status: 'not ready', reason: error.message });
    }
  });

  // Liveness probe endpoint
  app.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive', timestamp: Date.now() });
  });
};

module.exports = createHealthCheckEndpoint;
