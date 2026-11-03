import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// GET /api/invoices - list all enterprise invoices & SOW billings
router.get('/', (req, res) => {
  const { status, customerName, search } = req.query;
  let invoices = db.get('invoices') || [];

  if (status && status !== 'ALL') {
    invoices = invoices.filter(inv => (inv.status || '').toUpperCase() === status.toUpperCase());
  }

  if (customerName) {
    invoices = invoices.filter(inv => {
      const name = inv.customerName || (inv.customer && inv.customer.name) || '';
      return name.toLowerCase().includes(customerName.toLowerCase());
    });
  }

  if (search) {
    const q = search.toLowerCase();
    invoices = invoices.filter(inv => {
      const cName = inv.customerName || (inv.customer && inv.customer.name) || '';
      const invNo = inv.invoiceNo || '';
      return cName.toLowerCase().includes(q) || invNo.toLowerCase().includes(q);
    });
  }

  // Sort descending by date/id
  invoices.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());

  res.json({
    total: invoices.length,
    data: invoices
  });
});

// GET /api/invoices/:id - get single invoice details
router.get('/:id', (req, res) => {
  const invoices = db.get('invoices') || [];
  const invoice = invoices.find(inv => inv.id === req.params.id || inv.invoiceNo === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json(invoice);
});

// POST /api/invoices - create and persist real-time invoice / SOW
router.post('/', (req, res) => {
  const body = req.body;
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ error: 'Invoice items are required' });
  }

  const invoiceNo = body.invoiceNo || `INV-2026-${Date.now().toString().slice(-4)}`;
  const now = new Date();
  
  const customerName = body.customerName || (body.customer && body.customer.name) || 'Corporate Enterprise Client';
  const subtotal = Number(body.subtotal) || 0;
  const discountTotal = Number(body.discountTotal || body.discount || 0);
  const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : 0.05;
  const vatAmount = Number(body.vatAmount || Math.round((subtotal - discountTotal) * vatRate));
  const grandTotal = Number(body.grandTotal || body.total || (subtotal - discountTotal + vatAmount));

  const newInvoice = {
    id: body.id || `INV-${Date.now()}`,
    invoiceNo,
    date: body.date || now.toISOString().slice(0, 10),
    time: body.time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    outletId: body.outletId || 'DC01',
    outletName: body.outletName || 'Silicon Tower Tech Hub & Cloud Data Center',
    registerNo: body.registerNo || 901,
    cashierId: body.cashierId || 'USR-001',
    cashierName: body.cashierName || 'System Administrator',
    customerName,
    customer: body.customer || {
      name: customerName,
      tier: 'Platinum Enterprise',
      pointsEarned: Math.floor(grandTotal * 0.02),
      pointsUsed: 0
    },
    items: body.items,
    subtotal,
    discountTotal,
    vatRate,
    vatAmount,
    bagCharge: Number(body.bagCharge || 0),
    grandTotal,
    paymentMethod: body.paymentMethod || 'Corporate RTGS Wire',
    paymentStatus: body.paymentStatus || 'PAID',
    status: body.status || 'PAID',
    cashTendered: body.cashTendered,
    changeDue: body.changeDue,
    cardRef: body.cardRef,
    mfsRef: body.mfsRef,
    createdAt: now.toISOString()
  };

  db.insert('invoices', newInvoice);

  // Decrement product stock in database
  const products = db.get('products') || [];
  body.items.forEach(it => {
    const prod = products.find(p => p.barcode === it.barcode || p.name === it.name || p.id === it.productId);
    if (prod) {
      const newStock = Math.max(0, (prod.stock || 0) - (Number(it.qty) || 1));
      db.update('products', prod.id, { stock: newStock });
    }
  });

  res.status(201).json(newInvoice);
});

// PUT /api/invoices/:id - update invoice status or details
router.put('/:id', (req, res) => {
  const existing = db.findById('invoices', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  const updates = { ...req.body };
  delete updates.id;
  delete updates.invoiceNo; // Preserve invoice number

  const updated = db.update('invoices', req.params.id, updates);
  res.json(updated);
});

// DELETE /api/invoices/:id - void or delete invoice
router.delete('/:id', (req, res) => {
  const existing = db.findById('invoices', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  db.delete('invoices', req.params.id);
  res.json({ success: true, message: 'Invoice removed successfully', id: req.params.id });
});

export default router;
