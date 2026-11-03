import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import db from '../services/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username or email and password are required' });
  }

  const user = db.find('users', u => u.username === username || u.email === username)[0];
  if (!user) {
    return res.status(401).json({ error: 'Invalid corporate credentials' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    logAuditEvent('USER_LOGIN_FAILED', `User ${username}`, req, 'FAILED');
    return res.status(401).json({ error: 'Invalid corporate credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );

  db.update('users', user.id, { lastLogin: new Date().toISOString() });
  logAuditEvent('USER_LOGIN_SUCCESS', `User ${user.email}`, req, 'SUCCESS');

  res.json({
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      department: user.department,
      title: user.title,
      mfaEnabled: user.mfaEnabled
    },
    facility: db.get('facility')
  });
});

// GET /api/auth/me - current user profile & permissions
router.get('/me', requireAuth, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({
    user: safeUser,
    facility: db.get('facility')
  });
});

// GET /api/auth/users - list corporate users (Admin / CTO only)
router.get('/users', requireAuth, requireRole('CTO', 'SUPER_ADMIN', 'HR_MANAGER'), (req, res) => {
  const users = db.get('users').map(({ passwordHash, ...u }) => u);
  res.json({ total: users.length, data: users });
});

// POST /api/auth/users - invite / register new engineer or officer
router.post('/users', requireAuth, requireRole('CTO', 'SUPER_ADMIN', 'HR_MANAGER'), (req, res) => {
  const { name, email, username, role, department, title, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'name, email, and role are required' });
  }

  const existing = db.find('users', u => u.email === email || u.username === username)[0];
  if (existing) {
    return res.status(409).json({ error: 'User with this email or username already exists' });
  }

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name,
    email,
    username: username || email.split('@')[0],
    role,
    department: department || 'Engineering',
    title: title || role,
    passwordHash: bcrypt.hashSync(password || 'AuraTech@2026!', 10),
    isActive: true,
    mfaEnabled: false,
    createdAt: new Date().toISOString()
  };

  db.insert('users', newUser);
  logAuditEvent('USER_ACCOUNT_CREATED', `Created user ${newUser.email} as ${newUser.role}`, req);

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

export default router;
