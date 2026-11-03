import crypto from 'node:crypto';
import db from '../services/db.js';

export function logAuditEvent(action, resource, req, status = 'SUCCESS', metadata = {}) {
  const timestamp = new Date().toISOString();
  const actor = req?.user ? `${req.user.name} (${req.user.role})` : 'Anonymous / System Client';
  const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

  // Compute tamper-evident SHA-256 hash
  const rawString = `${timestamp}|${actor}|${action}|${resource}|${status}|${JSON.stringify(metadata)}`;
  const hash = crypto.createHash('sha256').update(rawString).digest('hex');

  const logEntry = {
    id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp,
    actor,
    ipAddress,
    action,
    resource,
    status,
    hash,
    metadata
  };

  db.insert('auditTrail', logEntry);
  return logEntry;
}

export function auditMiddleware(action, resourceExtractor) {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      const resource = typeof resourceExtractor === 'function' ? resourceExtractor(req) : resourceExtractor || req.originalUrl;
      const status = res.statusCode < 400 ? 'SUCCESS' : 'FAILED';
      logAuditEvent(action, resource, req, status, { statusCode: res.statusCode });
      return res.send(body);
    };
    next();
  };
}
