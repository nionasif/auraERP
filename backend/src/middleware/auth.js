import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import db from '../services/db.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      type: 'https://auratech.io/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or malformed Authorization bearer token'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = db.findById('users', decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        type: 'https://auratech.io/errors/account-inactive',
        title: 'Unauthorized',
        status: 401,
        detail: 'User account not found or suspended'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    };
    next();
  } catch (err) {
    return res.status(401).json({
      type: 'https://auratech.io/errors/invalid-token',
      title: 'Invalid Token',
      status: 401,
      detail: err.name === 'TokenExpiredError' ? 'JWT session has expired' : 'Invalid signature or token'
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 401, title: 'Unauthorized', detail: 'Authentication required' });
    }

    // CTO and SUPER_ADMIN have full access across all domains
    if (req.user.role === 'CTO' || req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        type: 'https://auratech.io/errors/forbidden',
        title: 'Access Forbidden',
        status: 403,
        detail: `Role '${req.user.role}' is not authorized to perform this operation. Required: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = db.findById('users', decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (_) {
    // Continue anonymously
  }
  next();
}
