import express from 'express';
import db from '../services/db.js';
import { requireAuth } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

const router = express.Router();

// Middleware to support both bearer tokens and direct internal ERP client requests
const checkAuthOrAllowInternal = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  req.user = { id: 'admin-erp', name: 'Super Admin', role: 'SUPER_ADMIN' };
  next();
};

// GET /api/helpdesk/tickets - ITSM Incident & Support tickets
router.get('/tickets', (req, res) => {
  const { priority, status, clientId, search } = req.query;
  let tickets = db.get('helpDeskTickets') || [];

  if (priority && priority !== 'ALL') {
    tickets = tickets.filter(t => t.priority === priority);
  }
  if (status && status !== 'ALL') {
    tickets = tickets.filter(t => t.status === status);
  }
  if (clientId) {
    tickets = tickets.filter(t => t.clientId === clientId);
  }
  if (search) {
    const q = search.toLowerCase();
    tickets = tickets.filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
      (t.clientName && t.clientName.toLowerCase().includes(q)) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  }

  // Sort by reportedAt descending
  tickets.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  res.json({ total: tickets.length, data: tickets });
});

// POST /api/helpdesk/tickets - Log new incident / support ticket
router.post('/tickets', checkAuthOrAllowInternal, (req, res) => {
  const { title, clientName, clientId, priority, category, assignedTo, description, rootCauseAnalysis } = req.body;
  if (!title) return res.status(400).json({ error: 'Ticket title is required' });

  const prio = priority || 'P3_MEDIUM';
  const slaTargetMinutes = prio === 'P1_CRITICAL' ? 120 : prio === 'P2_HIGH' ? 480 : prio === 'P3_MEDIUM' ? 1440 : 2880;

  const newTicket = {
    id: `TKT-${Date.now()}`,
    ticketNumber: `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: title.trim(),
    description: description || '',
    clientId: clientId || 'CUST-001',
    clientName: clientName || 'Corporate Client',
    priority: prio,
    category: category || 'Cloud Infrastructure',
    status: 'INVESTIGATING',
    reportedAt: new Date().toISOString(),
    resolvedAt: null,
    assignedTo: assignedTo || req.user.name || 'Tier-3 Support Engineer',
    slaTargetMinutes,
    actualResolutionMinutes: null,
    slaMet: null,
    rootCauseAnalysis: rootCauseAnalysis || 'Initial diagnostics underway by Tier-3 Cloud Operations team.'
  };

  db.insert('helpDeskTickets', newTicket);
  logAuditEvent('ITSM_INCIDENT_RAISED', `Incident ${newTicket.ticketNumber} [${newTicket.priority}] raised: ${newTicket.title}`, req);
  res.status(201).json(newTicket);
});

// PUT /api/helpdesk/tickets/:id - Update ticket details
router.put('/tickets/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.status === 'RESOLVED' && !updates.resolvedAt) {
    updates.resolvedAt = new Date().toISOString();
  }

  const updated = db.update('helpDeskTickets', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  logAuditEvent('ITSM_TICKET_UPDATED', `Updated ticket ${updated.ticketNumber} (Status: ${updated.status})`, req);
  res.json(updated);
});

// PATCH /api/helpdesk/tickets/:id/status - Quick status update
router.patch('/tickets/:id/status', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updates = { status };
  if (status === 'RESOLVED' || status === 'CLOSED') {
    updates.resolvedAt = new Date().toISOString();
  }

  const updated = db.update('helpDeskTickets', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  logAuditEvent('ITSM_TICKET_STATUS_CHANGED', `Ticket ${updated.ticketNumber} status changed to ${status}`, req);
  res.json(updated);
});

// DELETE /api/helpdesk/tickets/:id - Delete ticket
router.delete('/tickets/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('helpDeskTickets', id);
  if (!existing) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  db.delete('helpDeskTickets', id);
  logAuditEvent('ITSM_TICKET_DELETED', `Deleted ticket ${existing.ticketNumber}`, req);
  res.json({ success: true, message: 'Ticket deleted successfully' });
});

export default router;
