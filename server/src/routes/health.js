import express from 'express';
import { query, isUsingPgLite } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const dbStart = Date.now();
    const dbResult = await query('SELECT 1 as is_alive, NOW() as server_time');
    const dbLatencyMs = Date.now() - dbStart;

    res.status(200).json({
      success: true,
      service: 'CollabCampus API',
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        type: isUsingPgLite() ? 'embedded-pglite' : 'standard-postgresql',
        latencyMs: dbLatencyMs,
        serverTime: dbResult.rows[0]?.current_time,
      },
      uptime: process.uptime(),
      version: '1.0.0',
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      service: 'CollabCampus API',
      status: 'degraded',
      error: err.message,
      database: {
        connected: false,
      },
    });
  }
});

export default router;
