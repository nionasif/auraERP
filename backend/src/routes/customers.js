import express from 'express';
import { CORPORATE_CLIENTS } from '../data/mockData.js';

const router = express.Router();
let clients = [...CORPORATE_CLIENTS];

// GET /api/customers - list corporate accounts
router.get('/', (req, res) => {
  const { search, tier } = req.query;
  let results = [...clients];

  if (tier) {
    results = results.filter(c => c.membershipTier.toUpperCase() === tier.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  res.json({
    total: results.length,
    data: results
  });
});

// POST /api/customers - enroll new enterprise partner
router.post('/', (req, res) => {
  const { name, phone, email, membershipTier } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Client company name and phone are required' });
  }

  const newClient = {
    id: `CUST-${Date.now().toString().slice(-4)}`,
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@enterprise.local`,
    membershipTier: membershipTier || 'SILVER',
    points: 100, // Welcome SLA credits
    totalSpent: 0,
    lastVisit: new Date().toISOString().split('T')[0],
    contractStatus: 'ACTIVE',
    slaGuaranteed: membershipTier === 'PLATINUM' ? '99.99%' : membershipTier === 'GOLD' ? '99.95%' : '99.9%'
  };

  clients.push(newClient);
  res.status(201).json(newClient);
});

export default router;
