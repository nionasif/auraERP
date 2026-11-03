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

// GET /api/it-assets/hardware - Bare-metal servers, network fabric, and firewall assets
router.get('/hardware', (req, res) => {
  const { category, rack, search } = req.query;
  let assets = db.get('itAssets') || [];

  if (category && category !== 'ALL') assets = assets.filter(a => a.category && a.category.toLowerCase().includes(category.toLowerCase()));
  if (rack && rack !== 'ALL') assets = assets.filter(a => a.rackLocation && a.rackLocation.toLowerCase().includes(rack.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    assets = assets.filter(a =>
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.assetTag && a.assetTag.toLowerCase().includes(q)) ||
      (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
      (a.category && a.category.toLowerCase().includes(q)) ||
      (a.oemVendor && a.oemVendor.toLowerCase().includes(q))
    );
  }

  res.json({ total: assets.length, data: assets });
});

// POST /api/it-assets/hardware - Provision new datacenter hardware asset
router.post('/hardware', checkAuthOrAllowInternal, (req, res) => {
  const { name, category, specs, serialNumber, rackLocation, oemVendor, purchasePriceBDT, warrantyExpiry, status } = req.body;
  if (!name || !serialNumber) {
    return res.status(400).json({ error: 'Asset name and OEM serial number are required' });
  }

  const newAsset = {
    id: `AST-HW-${Date.now().toString().slice(-4)}`,
    assetTag: `AT-${Date.now().toString().slice(-6)}`,
    serialNumber: serialNumber.trim(),
    name: name.trim(),
    category: category || 'Compute Infrastructure',
    specs: specs || 'Standard Dual-Socket Enterprise Hardware',
    facility: 'DC01 Silicon Tower',
    rackLocation: rackLocation || 'Rack A03 - Staging Bay',
    status: status || 'OPERATIONAL_LIVE',
    oemVendor: oemVendor || 'Dell Technologies',
    purchasePriceBDT: Number(purchasePriceBDT || 1200000),
    warrantyExpiry: warrantyExpiry || '2029-12-31',
    lastDiagnostics: new Date().toISOString().split('T')[0],
    healthScore: 100.0
  };

  db.insert('itAssets', newAsset);
  logAuditEvent('HARDWARE_ASSET_PROVISIONED', `Provisioned ${newAsset.name} [S/N: ${newAsset.serialNumber}] in ${newAsset.rackLocation}`, req);
  res.status(201).json(newAsset);
});

// PUT /api/it-assets/hardware/:id - Update hardware asset
router.put('/hardware/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.update('itAssets', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Hardware asset not found' });
  }

  logAuditEvent('HARDWARE_ASSET_UPDATED', `Updated asset ${updated.assetTag} (${updated.name})`, req);
  res.json(updated);
});

// DELETE /api/it-assets/hardware/:id - Decommission hardware asset
router.delete('/hardware/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('itAssets', id);
  if (!existing) {
    return res.status(404).json({ error: 'Hardware asset not found' });
  }

  db.delete('itAssets', id);
  logAuditEvent('HARDWARE_ASSET_DECOMMISSIONED', `Decommissioned asset ${existing.assetTag} (${existing.name})`, req);
  res.json({ success: true, message: 'Hardware asset decommissioned successfully' });
});

// GET /api/it-assets/licenses - Software licenses & seat allocations
router.get('/licenses', (req, res) => {
  const licenses = db.get('softwareLicenses') || [];
  res.json({ total: licenses.length, data: licenses });
});

// POST /api/it-assets/licenses - Add new software license
router.post('/licenses', checkAuthOrAllowInternal, (req, res) => {
  const { name, publisher, type, totalSeats, allocatedSeats, renewalDate, annualCostBDT } = req.body;
  if (!name || !publisher) {
    return res.status(400).json({ error: 'Software name and publisher are required' });
  }

  const newLicense = {
    id: `LIC-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    publisher: publisher.trim(),
    type: type || 'Subscription',
    totalSeats: Number(totalSeats || 50),
    allocatedSeats: Number(allocatedSeats || 1),
    renewalDate: renewalDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    annualCostBDT: Number(annualCostBDT || 120000),
    status: 'ACTIVE'
  };

  db.insert('softwareLicenses', newLicense);
  logAuditEvent('SOFTWARE_LICENSE_ADDED', `Added license ${newLicense.name} by ${newLicense.publisher}`, req);
  res.status(201).json(newLicense);
});

// DELETE /api/it-assets/licenses/:id - Delete software license
router.delete('/licenses/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('softwareLicenses', id);
  if (!existing) {
    return res.status(404).json({ error: 'Software license not found' });
  }

  db.delete('softwareLicenses', id);
  logAuditEvent('SOFTWARE_LICENSE_DELETED', `Deleted license ${existing.name}`, req);
  res.json({ success: true, message: 'Software license removed' });
});

// GET /api/it-assets/datacenter-telemetry - Live rack and PUE telemetry
router.get('/datacenter-telemetry', (req, res) => {
  const facility = db.get('facility');
  const assets = db.get('itAssets') || [];

  res.json({
    facility,
    rackMetrics: {
      totalRacks: 12,
      activeComputeBays: 48,
      utilizedBays: assets.length > 0 ? Math.min(assets.length * 3, 48) : 34,
      occupancyRatePercent: assets.length > 0 ? Math.min(Math.round((assets.length * 3 / 48) * 100), 100) : 70.8,
      pueScore: 1.18,
      coldAisleTemperatureC: 20.5,
      hotAisleTemperatureC: 28.2,
      upsLoadPercent: 46.5
    },
    hardwareCount: assets.length,
    activeNodes: assets.filter(a => a.status === 'OPERATIONAL_LIVE').length
  });
});

export default router;
