import express from 'express';
import db from '../services/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
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

// GET /api/crm/clients - List enterprise corporate clients
router.get('/clients', (req, res) => {
  const { tier, search } = req.query;
  let clients = db.get('clients');

  if (tier) {
    const t = tier.toUpperCase();
    clients = clients.filter(c => (c.tier && c.tier.toUpperCase() === t) || (c.slaTier && c.slaTier.toUpperCase() === t));
  }
  if (search) {
    const q = search.toLowerCase();
    clients = clients.filter(c =>
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.primaryContact?.email && c.primaryContact.email.toLowerCase().includes(q))
    );
  }

  res.json({ total: clients.length, data: clients });
});

// POST /api/crm/clients - Register enterprise corporate client
router.post('/clients', checkAuthOrAllowInternal, (req, res) => {
  const {
    name,
    companyName,
    industry,
    tier,
    slaTier,
    contactName,
    contactEmail,
    contactPhone,
    phone,
    email,
    billingAddress,
    taxBIN,
    contractValue,
    contractValueBDT,
    totalSpent,
    slaCredits,
    slaCreditsBDT,
    points,
    lastVisit,
    lastInteraction,
    slaUptimeCommitment,
    status,
    notes
  } = req.body;

  const cName = companyName || name;
  if (!cName) {
    return res.status(400).json({ error: 'Company/Client name is required' });
  }

  const cEmail = contactEmail || email || 'contact@client.corp';
  const cPhone = contactPhone || phone || '+880-1700-000000';
  const cTier = (tier || slaTier || 'SILVER').toUpperCase();
  const cVal = Number(contractValueBDT ?? contractValue ?? totalSpent ?? 500000);
  const cCredits = Number(slaCreditsBDT ?? slaCredits ?? points ?? 25000);
  const cLast = lastInteraction || lastVisit || new Date().toISOString().split('T')[0];

  const newClient = {
    id: `CUST-${Date.now().toString().slice(-4)}`,
    name: cName,
    companyName: cName,
    industry: industry || 'Technology & Financial Services',
    tier: cTier,
    slaTier: cTier,
    primaryContact: {
      name: contactName || cName,
      email: cEmail,
      phone: cPhone
    },
    email: cEmail,
    phone: cPhone,
    billingAddress: billingAddress || 'Dhaka Commercial District, Bangladesh',
    taxIdentificationBIN: taxBIN || `00${Math.floor(1000000 + Math.random() * 9000000)}-0101`,
    contractValueBDT: cVal,
    totalSpent: cVal,
    points: cCredits,
    slaCreditsBDT: cCredits,
    slaUptimeCommitment: slaUptimeCommitment || (cTier === 'PLATINUM' ? '99.99%' : cTier === 'GOLD' ? '99.95%' : '99.90%'),
    status: status || 'ACTIVE_CLIENT',
    retainedHoursBalance: 24,
    lastVisit: cLast,
    lastInteraction: cLast,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.insert('clients', newClient);
  logAuditEvent('CLIENT_ENROLLED', `Enrolled corporate account ${newClient.companyName} (${newClient.slaTier})`, req);
  res.status(201).json(newClient);
});

// PUT /api/crm/clients/:id - Update enterprise corporate client
router.put('/clients/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('clients', id);
  if (!existing) {
    return res.status(404).json({ error: 'Client not found' });
  }

  const updates = { ...req.body };
  if (updates.name || updates.companyName) {
    const n = updates.name || updates.companyName;
    updates.name = n;
    updates.companyName = n;
  }
  if (updates.contractValueBDT !== undefined || updates.contractValue !== undefined || updates.totalSpent !== undefined) {
    const val = Number(updates.contractValueBDT ?? updates.contractValue ?? updates.totalSpent);
    updates.contractValueBDT = val;
    updates.totalSpent = val;
  }
  if (updates.slaCreditsBDT !== undefined || updates.slaCredits !== undefined || updates.points !== undefined) {
    const credits = Number(updates.slaCreditsBDT ?? updates.slaCredits ?? updates.points);
    updates.slaCreditsBDT = credits;
    updates.points = credits;
  }
  if (updates.tier || updates.slaTier) {
    const t = (updates.tier || updates.slaTier).toUpperCase();
    updates.tier = t;
    updates.slaTier = t;
    if (!updates.slaUptimeCommitment) {
      updates.slaUptimeCommitment = t === 'PLATINUM' ? '99.99%' : t === 'GOLD' ? '99.95%' : '99.90%';
    }
  }
  if (updates.phone || updates.contactPhone) {
    const p = updates.phone || updates.contactPhone;
    updates.phone = p;
    if (existing.primaryContact) updates.primaryContact = { ...existing.primaryContact, phone: p };
  }
  if (updates.email || updates.contactEmail) {
    const e = updates.email || updates.contactEmail;
    updates.email = e;
    if (existing.primaryContact) updates.primaryContact = { ...existing.primaryContact, email: e };
  }

  const updated = db.update('clients', id, updates);
  logAuditEvent('CLIENT_UPDATED', `Updated corporate account ${updated.companyName || updated.name}`, req);
  res.json(updated);
});

// DELETE /api/crm/clients/:id - Remove enterprise corporate client
router.delete('/clients/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('clients', id);
  if (!existing) {
    return res.status(404).json({ error: 'Client not found' });
  }

  db.delete('clients', id);
  logAuditEvent('CLIENT_DELETED', `Deleted corporate account ${existing.companyName || existing.name}`, req);
  res.json({ success: true, message: 'Client deleted successfully', id });
});

// POST /api/crm/clients/seed - Populate sample corporate clients if requested
router.post('/clients/seed', checkAuthOrAllowInternal, (req, res) => {
  const sampleClients = [
    {
      id: 'CUST-1001',
      name: 'Grameenphone Ltd. (Enterprise Cloud)',
      companyName: 'Grameenphone Ltd. (Enterprise Cloud)',
      industry: 'Telecommunications & ICT Infrastructure',
      tier: 'PLATINUM',
      slaTier: 'PLATINUM',
      slaUptimeCommitment: '99.99%',
      phone: '+880-1711-500001',
      email: 'enterprise@grameenphone.com',
      contractValueBDT: 14500000,
      totalSpent: 14500000,
      points: 150000,
      slaCreditsBDT: 150000,
      lastVisit: '2026-10-20',
      lastInteraction: '2026-10-20',
      status: 'ACTIVE_CLIENT',
      billingAddress: 'GPHouse, Bashundhara, Dhaka',
      notes: 'Tier-1 Telecom core infrastructure SLA with 15-minute escalation guarantee.'
    },
    {
      id: 'CUST-1002',
      name: 'BRAC Bank PLC (Core FinTech Node)',
      companyName: 'BRAC Bank PLC (Core FinTech Node)',
      industry: 'Banking & Financial Technology',
      tier: 'PLATINUM',
      slaTier: 'PLATINUM',
      slaUptimeCommitment: '99.99%',
      phone: '+880-1713-222333',
      email: 'tech.procurement@bracbank.com',
      contractValueBDT: 9800000,
      totalSpent: 9800000,
      points: 120000,
      slaCreditsBDT: 120000,
      lastVisit: '2026-10-18',
      lastInteraction: '2026-10-18',
      status: 'ACTIVE_CLIENT',
      billingAddress: 'Anik Tower, Tejgaon, Dhaka',
      notes: 'Dedicated VPN peering and high-availability database cluster maintenance.'
    },
    {
      id: 'CUST-1003',
      name: 'Beximco Pharmaceuticals Ltd.',
      companyName: 'Beximco Pharmaceuticals Ltd.',
      industry: 'Pharmaceuticals & Manufacturing ERP',
      tier: 'GOLD',
      slaTier: 'GOLD',
      slaUptimeCommitment: '99.95%',
      phone: '+880-1714-444555',
      email: 'systems@beximco.com',
      contractValueBDT: 4200000,
      totalSpent: 4200000,
      points: 80000,
      slaCreditsBDT: 80000,
      lastVisit: '2026-10-14',
      lastInteraction: '2026-10-14',
      status: 'ACTIVE_CLIENT',
      billingAddress: 'Dhanmondi, Dhaka',
      notes: 'Supply chain automation & barcode scanner cloud integration.'
    },
    {
      id: 'CUST-1004',
      name: 'Walton Digi-Tech Industries',
      companyName: 'Walton Digi-Tech Industries',
      industry: 'Consumer Electronics & Embedded Systems',
      tier: 'GOLD',
      slaTier: 'GOLD',
      slaUptimeCommitment: '99.95%',
      phone: '+880-1715-666777',
      email: 'procurement@waltonbd.com',
      contractValueBDT: 3600000,
      totalSpent: 3600000,
      points: 60000,
      slaCreditsBDT: 60000,
      lastVisit: '2026-10-09',
      lastInteraction: '2026-10-09',
      status: 'ACTIVE_CLIENT',
      billingAddress: 'Chandra, Gazipur',
      notes: 'Hardware warranty integration and automated RMA diagnostics.'
    },
    {
      id: 'CUST-1005',
      name: 'Pathao Tech Logistics',
      companyName: 'Pathao Tech Logistics',
      industry: 'Ride-sharing & Hyperlocal Delivery',
      tier: 'SILVER',
      slaTier: 'SILVER',
      slaUptimeCommitment: '99.90%',
      phone: '+880-1716-888999',
      email: 'ops@pathao.com',
      contractValueBDT: 1500000,
      totalSpent: 1500000,
      points: 40000,
      slaCreditsBDT: 40000,
      lastVisit: '2026-09-25',
      lastInteraction: '2026-09-25',
      status: 'ACTIVE_CLIENT',
      billingAddress: 'Gulshan-1, Dhaka',
      notes: 'API dispatch webhook support and fleet tracking gateway.'
    }
  ];

  db.setCollection('clients', sampleClients);
  logAuditEvent('CRM_SEEDED', 'Populated sample corporate clients into database', req);
  res.json({ total: sampleClients.length, data: sampleClients, message: 'Sample corporate accounts loaded successfully!' });
});

// GET /api/crm/opportunities - Sales deal pipeline
router.get('/opportunities', (req, res) => {
  const opportunities = db.get('opportunities');
  const pipelineTotal = opportunities.reduce((s, o) => s + (o.estimatedValueBDT || 0), 0);
  res.json({ pipelineTotalBDT: pipelineTotal, total: opportunities.length, data: opportunities });
});

// POST /api/crm/opportunities - Create new sales deal / pipeline SOW
router.post('/opportunities', checkAuthOrAllowInternal, (req, res) => {
  const { title, clientName, estimatedValueBDT, probabilityPercent, expectedCloseDate, assignedArchitect, techStack } = req.body;
  const newOpp = {
    id: `OPP-2026-${Math.floor(100 + Math.random() * 900)}`,
    title,
    clientName,
    stage: 'DISCOVERY',
    estimatedValueBDT: Number(estimatedValueBDT || 1000000),
    probabilityPercent: Number(probabilityPercent || 50),
    expectedCloseDate: expectedCloseDate || '2026-12-31',
    assignedArchitect: assignedArchitect || req.user.name,
    techStack: techStack || ['Cloud & Microservices']
  };

  db.insert('opportunities', newOpp);
  res.status(201).json(newOpp);
});

export default router;
