import express from 'express';
import db from '../services/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const auditLogs = db.get('auditTrail') || [];
  res.json({
    total: auditLogs.length,
    data: auditLogs
  });
});

export default router;
