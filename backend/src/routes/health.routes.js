/**
 * Enterprise Health, Liveness, and Readiness Probes
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');
const mlClient = require('../integrations/mlClient');

// Comprehensive Dependency Health Check
router.get('/health', async (req, res) => {
  const startTime = Date.now();
  const services = {
    mongodb: 'down',
    redis: 'down',
    mlService: 'down',
  };

  // 1. Check MongoDB
  if (mongoose.connection.readyState === 1) {
    services.mongodb = 'up';
  }

  // 2. Check Redis
  try {
    const redis = getRedisClient();
    const pingRes = await redis.ping();
    if (pingRes === 'PONG') {
      services.redis = 'up';
    }
  } catch {
    services.redis = 'down';
  }

  // 3. Check ML Service
  try {
    const mlHealth = await mlClient.checkHealth();
    if (mlHealth.status === 'healthy') {
      services.mlService = 'up';
    }
  } catch {
    services.mlService = 'down';
  }

  const isHealthy = services.mongodb === 'up' && services.redis === 'up';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    services,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  });
});

// Liveness Probe: Confirms the Node.js process is active and event loop is responsive
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness Probe: Confirms the service can accept incoming client traffic
router.get('/ready', (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    database: isReady ? 'connected' : 'disconnected',
  });
});

module.exports = router;
