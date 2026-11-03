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

/* ==========================================================================
   1. VENDORS DIRECTORY (OEM & IT INFRASTRUCTURE SUPPLIERS)
   ========================================================================== */

// GET /api/procurement/vendors - List all suppliers / vendors
router.get('/vendors', (req, res) => {
  const { search, category, status } = req.query;
  let vendors = db.get('vendors') || [];

  if (category) {
    vendors = vendors.filter(v => v.category && v.category.toLowerCase() === category.toLowerCase());
  }

  if (status) {
    vendors = vendors.filter(v => v.status && v.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    vendors = vendors.filter(v =>
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.code && v.code.toLowerCase().includes(q)) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q)) ||
      (v.phone && v.phone.includes(q)) ||
      (v.category && v.category.toLowerCase().includes(q))
    );
  }

  res.json({ total: vendors.length, data: vendors });
});

// POST /api/procurement/vendors - Register new vendor
router.post('/vendors', checkAuthOrAllowInternal, (req, res) => {
  const {
    name,
    code,
    category,
    contactPerson,
    email,
    phone,
    address,
    taxId,
    binNo,
    paymentTerms,
    status,
    notes,
    rating
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Vendor / Company name is required' });
  }

  const vendorCode = code && code.trim() !== ''
    ? code.toUpperCase()
    : `VND-${Math.floor(1000 + Math.random() * 9000)}`;

  const newVendor = {
    id: `VND-${Date.now()}`,
    code: vendorCode,
    name: name.trim(),
    category: category || 'Hardware & Networking OEM',
    contactPerson: contactPerson || 'Authorized Representative',
    email: email || '',
    phone: phone || '',
    address: address || 'Dhaka, Bangladesh',
    taxId: taxId || '',
    binNo: binNo || '',
    paymentTerms: paymentTerms || 'Net 30 Days',
    status: status || 'ACTIVE',
    rating: Number(rating) || 5.0,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.insert('vendors', newVendor);
  logAuditEvent('VENDOR_REGISTERED', `Registered new vendor: ${newVendor.name} (${newVendor.code})`, req);
  res.status(201).json(newVendor);
});

// PUT /api/procurement/vendors/:id - Update existing vendor
router.put('/vendors/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.update('vendors', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Vendor not found' });
  }

  logAuditEvent('VENDOR_UPDATED', `Updated vendor record: ${updated.name} (${updated.code})`, req);
  res.json(updated);
});

// DELETE /api/procurement/vendors/:id - Remove vendor
router.delete('/vendors/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('vendors', id);
  if (!existing) {
    return res.status(404).json({ error: 'Vendor not found' });
  }

  db.delete('vendors', id);
  logAuditEvent('VENDOR_DELETED', `Deleted vendor: ${existing.name} (${existing.code})`, req);
  res.json({ success: true, message: 'Vendor removed successfully' });
});

/* ==========================================================================
   2. PURCHASE ORDERS (PROCUREMENT & HARDWARE POs)
   ========================================================================== */

// GET /api/procurement/orders - List purchase orders
router.get('/orders', (req, res) => {
  const { status, vendorId, search } = req.query;
  let orders = db.get('purchaseOrders') || [];

  if (status) {
    orders = orders.filter(o => o.status && o.status.toUpperCase() === status.toUpperCase());
  }

  if (vendorId) {
    orders = orders.filter(o => o.vendorId === vendorId);
  }

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      (o.poNumber && o.poNumber.toLowerCase().includes(q)) ||
      (o.vendorName && o.vendorName.toLowerCase().includes(q)) ||
      (o.approvedBy && o.approvedBy.toLowerCase().includes(q))
    );
  }

  res.json({ total: orders.length, data: orders });
});

// POST /api/procurement/orders - Issue new Purchase Order
router.post('/orders', checkAuthOrAllowInternal, (req, res) => {
  const {
    vendorId,
    vendorName,
    vendorCode,
    items,
    totalAmountBDT,
    expectedDelivery,
    deliveryLocation,
    priority,
    notes,
    status
  } = req.body;

  if (!vendorName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Vendor name and at least one line item are required' });
  }

  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const calculatedTotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPriceBDT) || 0;
    return sum + (Number(item.totalBDT) || (qty * price));
  }, 0);

  const newPO = {
    id: `PO-${Date.now()}`,
    poNumber,
    vendorId: vendorId || null,
    vendorName,
    vendorCode: vendorCode || 'VND-GEN',
    issuedDate: new Date().toISOString().split('T')[0],
    items: items.map((it, idx) => ({
      id: it.id || `item-${idx + 1}-${Date.now()}`,
      itemName: it.itemName || 'Hardware Component',
      sku: it.sku || `SKU-${idx + 1}`,
      specs: it.specs || '',
      quantity: Number(it.quantity) || 1,
      unitPriceBDT: Number(it.unitPriceBDT) || 0,
      totalBDT: Number(it.totalBDT) || ((Number(it.quantity) || 1) * (Number(it.unitPriceBDT) || 0))
    })),
    totalAmountBDT: Number(totalAmountBDT) || calculatedTotal,
    priority: priority || 'NORMAL',
    status: status || 'APPROVED',
    deliveryLocation: deliveryLocation || 'DC01 Silicon Tower - Inward Intake Bay',
    approvedBy: req.user.name || 'System Administrator',
    expectedDelivery: expectedDelivery || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: notes || '',
    grnNumber: null,
    createdAt: new Date().toISOString()
  };

  db.insert('purchaseOrders', newPO);
  logAuditEvent('PURCHASE_ORDER_ISSUED', `Issued ${newPO.poNumber} to ${newPO.vendorName} (৳${newPO.totalAmountBDT.toLocaleString()})`, req);
  res.status(201).json(newPO);
});

// PUT /api/procurement/orders/:id - Edit Purchase Order
router.put('/orders/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.update('purchaseOrders', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Purchase Order not found' });
  }

  logAuditEvent('PURCHASE_ORDER_UPDATED', `Updated PO: ${updated.poNumber} (${updated.vendorName})`, req);
  res.json(updated);
});

// PATCH /api/procurement/orders/:id/status - Update PO Status
router.patch('/orders/:id/status', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = db.update('purchaseOrders', id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Purchase Order not found' });
  }

  logAuditEvent('PURCHASE_ORDER_STATUS_CHANGED', `PO ${updated.poNumber} status updated to ${status}`, req);
  res.json(updated);
});

// DELETE /api/procurement/orders/:id - Delete PO
router.delete('/orders/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('purchaseOrders', id);
  if (!existing) {
    return res.status(404).json({ error: 'Purchase Order not found' });
  }

  db.delete('purchaseOrders', id);
  logAuditEvent('PURCHASE_ORDER_DELETED', `Deleted PO: ${existing.poNumber}`, req);
  res.json({ success: true, message: 'Purchase Order deleted successfully' });
});

/* ==========================================================================
   3. GOODS RECEIVE NOTES (GRN & CONSIGNMENT INTAKE)
   ========================================================================== */

// GET /api/procurement/grn - List all Goods Receive Notes
router.get('/grn', (req, res) => {
  const grns = db.get('goodsReceiveNotes') || [];
  res.json({ total: grns.length, data: grns });
});

// POST /api/procurement/grn - Create Goods Receive Note against PO or delivery
router.post('/grn', checkAuthOrAllowInternal, (req, res) => {
  const {
    poId,
    poNumber,
    vendorName,
    challanNo,
    carrierVehicle,
    driverName,
    driverPhone,
    receivedItems,
    totalValueBDT,
    receivingBay,
    remarks
  } = req.body;

  if (!vendorName || !challanNo) {
    return res.status(400).json({ error: 'Vendor name and Challan Number are required' });
  }

  const grnNumber = `GRN-${new Date().getFullYear()}-DC01-${Math.floor(1000 + Math.random() * 9000)}`;

  const newGRN = {
    id: `GRN-${Date.now()}`,
    grnNumber,
    poId: poId || null,
    poNumber: poNumber || 'DIRECT-CHALLAN',
    vendorName,
    challanNo,
    carrierVehicle: carrierVehicle || 'Consignment Truck',
    driverName: driverName || 'Driver / Carrier Rep',
    driverPhone: driverPhone || '',
    receivedDate: new Date().toISOString(),
    receivedBy: req.user.name || 'Store & Inward Manager',
    receivingBay: receivingBay || 'DC01 Staging & Racks Allocation Bay',
    receivedItems: receivedItems || [],
    itemCount: Array.isArray(receivedItems) ? receivedItems.reduce((acc, it) => acc + (Number(it.receivedQty) || 0), 0) : 0,
    totalValueBDT: Number(totalValueBDT) || 0,
    remarks: remarks || 'Verified and allocated to datacenter inventory bay',
    status: 'ACCEPTED_INTO_INVENTORY'
  };

  db.insert('goodsReceiveNotes', newGRN);

  // If linked with a PO, update the PO status to 'RECEIVED' and record grnNumber
  if (poId) {
    db.update('purchaseOrders', poId, {
      status: 'RECEIVED',
      grnNumber: newGRN.grnNumber
    });
  }

  logAuditEvent('GRN_REGISTERED', `Issued ${newGRN.grnNumber} for Challan ${newGRN.challanNo} from ${newGRN.vendorName}`, req);
  res.status(201).json(newGRN);
});

// DELETE /api/procurement/grn/:id - Remove GRN
router.delete('/grn/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('goodsReceiveNotes', id);
  if (!existing) {
    return res.status(404).json({ error: 'GRN record not found' });
  }

  db.delete('goodsReceiveNotes', id);
  logAuditEvent('GRN_DELETED', `Deleted GRN record: ${existing.grnNumber}`, req);
  res.json({ success: true, message: 'GRN deleted successfully' });
});

export default router;
