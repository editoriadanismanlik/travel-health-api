import express from 'express';
import { WebSocketManager } from '../services/WebSocketManager';
import { WebSocketLoadBalancer } from '../services/WebSocketLoadBalancer';
import logger from '../utils/logger';

const router = express.Router();

// Get WebSocket statistics
router.get('/stats', async (req, res) => {
  try {
    const wsManager = WebSocketManager.getInstance();
    const loadBalancer = WebSocketLoadBalancer.getInstance();

    const managerStats = {
      activeConnections: wsManager.getConnectedClients(),
      messageQueueSize: 0, // Implement this in WebSocketManager
      uptime: process.uptime()
    };

    const loadBalancerStats = await loadBalancer.getStats();

    res.json({
      ...managerStats,
      ...loadBalancerStats,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Error fetching WebSocket stats:', error);
    res.status(500).json({ error: 'Failed to fetch WebSocket statistics' });
  }
});

// Get WebSocket events
router.get('/events', async (req, res) => {
  try {
    // Implement event retrieval from your logging system
    const events = await logger.query({
      from: new Date() - 24 * 60 * 60 * 1000, // Last 24 hours
      until: new Date(),
      limit: 100,
      order: 'desc',
      fields: ['timestamp', 'level', 'message']
    });

    res.json(events.map(event => ({
      timestamp: event.timestamp,
      type: event.level === 'error' ? 'error' : 
            event.message.includes('connect') ? 'connect' :
            event.message.includes('disconnect') ? 'disconnect' : 'info',
      details: event.message
    })));
  } catch (error) {
    logger.error('Error fetching WebSocket events:', error);
    res.status(500).json({ error: 'Failed to fetch WebSocket events' });
  }
});

// Get real-time metrics
router.get('/metrics', async (req, res) => {
  try {
    const wsManager = WebSocketManager.getInstance();
    const loadBalancer = WebSocketLoadBalancer.getInstance();

    const metrics = {
      currentConnections: wsManager.getConnectedClients(),
      loadBalancerStats: await loadBalancer.getStats(),
      systemLoad: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date()
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching WebSocket metrics:', error);
    res.status(500).json({ error: 'Failed to fetch WebSocket metrics' });
  }
});

export default router;
