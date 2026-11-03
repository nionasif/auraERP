import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// GET /api/products - list all enterprise products/services with optional department/search filter
router.get('/', (req, res) => {
  const { department, search } = req.query;
  let results = db.get('products') || [];

  if (department && department !== 'ALL') {
    results = results.filter(p => p.department && p.department.toLowerCase().includes(department.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  res.json({
    total: results.length,
    data: results
  });
});

// GET /api/products/:id - get single product
router.get('/:id', (req, res) => {
  const products = db.get('products') || [];
  const product = products.find(p => p.id === req.params.id || p.barcode === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Enterprise Solution / Service item not found' });
  }
  res.json(product);
});

// POST /api/products - register new asset/solution (Admin / Sales Head)
router.post('/', (req, res) => {
  const {
    name,
    department,
    category,
    price,
    costPrice,
    stock,
    minStock,
    sku,
    barcode,
    uom,
    size,
    color
  } = req.body;

  if (!name || price === undefined || !department) {
    return res.status(400).json({ error: 'Name, price, and department are required' });
  }

  const newProduct = {
    id: `PRD-${Date.now()}`,
    sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
    barcode: barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    name: name.trim(),
    department: department.trim(),
    category: category || 'Enterprise Solution',
    price: Number(price) || 0,
    costPrice: Number(costPrice || Number(price) * 0.6),
    stock: Number(stock !== undefined ? stock : 10),
    minStock: Number(minStock !== undefined ? minStock : 2),
    uom: uom || 'UNIT',
    size: size || 'Enterprise Spec',
    color: color || 'Production',
    agingDays: 0,
    createdAt: new Date().toISOString()
  };

  db.insert('products', newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - update existing product/service item
router.put('/:id', (req, res) => {
  const existing = db.findById('products', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updates = { ...req.body };
  delete updates.id; // Preserve immutable ID
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.costPrice !== undefined) updates.costPrice = Number(updates.costPrice);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  if (updates.minStock !== undefined) updates.minStock = Number(updates.minStock);

  const updated = db.update('products', req.params.id, updates);
  res.json(updated);
});

// DELETE /api/products/:id - remove product
router.delete('/:id', (req, res) => {
  const existing = db.findById('products', req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.delete('products', req.params.id);
  res.json({ success: true, message: 'Product deleted successfully', id: req.params.id });
});

// POST /api/products/decrement-stock - batch update stock upon sale
router.post('/decrement-stock', (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items array is required' });
  }

  const products = db.get('products') || [];
  items.forEach(it => {
    const prod = products.find(p => p.id === it.productId || p.barcode === it.productId);
    if (prod) {
      const newStock = Math.max(0, (prod.stock || 0) - (it.quantity || 1));
      db.update('products', prod.id, { stock: newStock });
    }
  });

  res.json({ success: true, message: 'Stock updated successfully' });
});

export default router;
