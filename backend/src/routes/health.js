import express from 'express';
import { FACILITY_INFO } from '../data/mockData.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    facility: FACILITY_INFO,
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    nodeVersion: process.version,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    cloudFabricSync: 'ACTIVE',
    securityContext: 'TLS 1.3 Enterprise AES-256'
  });
});

export default router;
