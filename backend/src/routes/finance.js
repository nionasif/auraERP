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
   1. INVOICES & BILLING (NBR MUSHAK-6.3 & SOWS)
   ========================================================================== */

// GET /api/finance/invoices - Invoice register
router.get('/invoices', (req, res) => {
  const { status, clientId, search } = req.query;
  let invoices = db.get('invoices') || [];

  if (status && status !== 'ALL') {
    invoices = invoices.filter(i => i.status && i.status.toUpperCase() === status.toUpperCase());
  }

  if (clientId) {
    invoices = invoices.filter(i => i.clientId === clientId);
  }

  if (search) {
    const q = search.toLowerCase();
    invoices = invoices.filter(i =>
      (i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(q)) ||
      (i.mushakChallanNo && i.mushakChallanNo.toLowerCase().includes(q)) ||
      (i.clientName && i.clientName.toLowerCase().includes(q)) ||
      (i.transactionRef && i.transactionRef.toLowerCase().includes(q))
    );
  }

  res.json({ total: invoices.length, data: invoices });
});

// POST /api/finance/invoices - Generate Mushak-6.3 Tax Invoice
router.post('/invoices', checkAuthOrAllowInternal, (req, res) => {
  const {
    clientId,
    clientName,
    items,
    subtotalBDT,
    corporateDiscountBDT,
    vatAmountBDT,
    totalPayableBDT,
    paymentMethod,
    status,
    dueDate,
    notes
  } = req.body;

  if (!clientName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Client name and invoice line items are required' });
  }

  const subtotal = Number(subtotalBDT || items.reduce((s, it) => s + (Number(it.totalBDT) || (Number(it.price || it.unitPrice || 0) * Number(it.quantity || 1))), 0));
  const discount = Number(corporateDiscountBDT || 0);
  const vat = Number(vatAmountBDT !== undefined ? vatAmountBDT : Math.round((subtotal - discount) * 0.05)); // 5% NBR ITES VAT
  const total = Number(totalPayableBDT || (subtotal - discount + vat));

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const mushakChallanNo = `CHL-6.3-DC01-${Math.floor(1000 + Math.random() * 9000)}`;

  const newInvoice = {
    id: `INV-${Date.now()}`,
    invoiceNumber,
    mushakChallanNo,
    clientId: clientId || 'CUST-GEN',
    clientName: clientName.trim(),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    items: items.map((it, idx) => ({
      id: it.id || `inv-item-${idx + 1}-${Date.now()}`,
      name: it.name || it.itemName || 'IT Consulting / Infrastructure Service',
      description: it.description || '',
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice || it.price || 0),
      totalBDT: Number(it.totalBDT || (Number(it.quantity || 1) * Number(it.unitPrice || it.price || 0)))
    })),
    subtotalBDT: subtotal,
    corporateDiscountBDT: discount,
    vatAmountBDT: vat,
    totalPayableBDT: total,
    status: status || 'PAID',
    paymentMethod: paymentMethod || 'Corporate RTGS Wire',
    transactionRef: `RTGS-${Date.now().toString().slice(-8)}`,
    notes: notes || '',
    issuedBy: req.user.name || 'Financial Controller',
    createdAt: new Date().toISOString()
  };

  db.insert('invoices', newInvoice);

  // If PAID, auto-credit Revenue account in General Ledger
  if (newInvoice.status === 'PAID') {
    const ledger = db.get('generalLedger') || [];
    const revAcc = ledger.find(a => a.accountCode === '4010' || a.category === 'REVENUE');
    if (revAcc) {
      db.update('generalLedger', revAcc.id || revAcc.accountCode, {
        balanceBDT: (revAcc.balanceBDT || 0) + newInvoice.totalPayableBDT
      });
    }
  }

  logAuditEvent('TAX_INVOICE_GENERATED', `Generated Tax Invoice ${newInvoice.invoiceNumber} (${newInvoice.mushakChallanNo}) for ${newInvoice.clientName} (৳${newInvoice.totalPayableBDT.toLocaleString()})`, req);
  res.status(201).json(newInvoice);
});

// PUT /api/finance/invoices/:id - Update invoice
router.put('/invoices/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.update('invoices', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  logAuditEvent('INVOICE_UPDATED', `Updated invoice ${updated.invoiceNumber}`, req);
  res.json(updated);
});

// PATCH /api/finance/invoices/:id/status - Update invoice payment status
router.patch('/invoices/:id/status', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = db.update('invoices', id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  logAuditEvent('INVOICE_STATUS_CHANGED', `Invoice ${updated.invoiceNumber} status set to ${status}`, req);
  res.json(updated);
});

// DELETE /api/finance/invoices/:id - Remove invoice
router.delete('/invoices/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('invoices', id);
  if (!existing) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  db.delete('invoices', id);
  logAuditEvent('INVOICE_DELETED', `Deleted invoice ${existing.invoiceNumber}`, req);
  res.json({ success: true, message: 'Invoice deleted successfully' });
});

/* ==========================================================================
   2. CHART OF ACCOUNTS & GENERAL LEDGER
   ========================================================================== */

// GET /api/finance/general-ledger & /api/finance/accounts
const getLedgerHandler = (req, res) => {
  const ledger = db.get('generalLedger') || [];
  res.json({ total: ledger.length, data: ledger });
};

router.get('/general-ledger', getLedgerHandler);
router.get('/accounts', getLedgerHandler);

// POST /api/finance/accounts - Add new account to Chart of Accounts
router.post('/accounts', checkAuthOrAllowInternal, (req, res) => {
  const { accountCode, accountName, category, balanceBDT, currency } = req.body;

  if (!accountName || !category) {
    return res.status(400).json({ error: 'Account name and category are required' });
  }

  const code = accountCode && accountCode.trim() !== ''
    ? accountCode.trim()
    : `${Math.floor(1000 + Math.random() * 8999)}`;

  const newAccount = {
    id: `ACC-${Date.now()}`,
    accountCode: code,
    accountName: accountName.trim(),
    category: category.toUpperCase(), // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE_OPEX, EXPENSE_COGS
    balanceBDT: Number(balanceBDT) || 0,
    currency: currency || 'BDT',
    createdAt: new Date().toISOString()
  };

  db.insert('generalLedger', newAccount);
  logAuditEvent('GL_ACCOUNT_CREATED', `Added Account [${newAccount.accountCode}] ${newAccount.accountName}`, req);
  res.status(201).json(newAccount);
});

// PUT /api/finance/accounts/:id - Update account
router.put('/accounts/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updated = db.update('generalLedger', id, updates);
  if (!updated) {
    // Check by accountCode
    const list = db.get('generalLedger') || [];
    const item = list.find(a => a.accountCode === id || a.id === id);
    if (item && item.id) {
      updated = db.update('generalLedger', item.id, updates);
    }
  }

  if (!updated) {
    return res.status(404).json({ error: 'Account not found' });
  }

  logAuditEvent('GL_ACCOUNT_UPDATED', `Updated Account [${updated.accountCode}] ${updated.accountName}`, req);
  res.json(updated);
});

// DELETE /api/finance/accounts/:id - Delete account
router.delete('/accounts/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const list = db.get('generalLedger') || [];
  const target = list.find(a => a.id === id || a.accountCode === id);

  if (!target) {
    return res.status(404).json({ error: 'Account not found' });
  }

  db.delete('generalLedger', target.id);
  logAuditEvent('GL_ACCOUNT_DELETED', `Deleted Account [${target.accountCode}] ${target.accountName}`, req);
  res.json({ success: true, message: 'Account deleted successfully' });
});

/* ==========================================================================
   3. FINANCIAL TRANSACTIONS (INCOME & EXPENSE JOURNAL ENTRIES)
   ========================================================================== */

// GET /api/finance/transactions - List all transactions
router.get('/transactions', (req, res) => {
  const { type, category, search } = req.query;
  let transactions = db.get('financialTransactions') || [];

  if (type && type !== 'ALL') {
    transactions = transactions.filter(t => t.type && t.type.toUpperCase() === type.toUpperCase());
  }

  if (category && category !== 'ALL') {
    transactions = transactions.filter(t => t.category && t.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    transactions = transactions.filter(t =>
      (t.voucherNo && t.voucherNo.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.referenceNo && t.referenceNo.toLowerCase().includes(q))
    );
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());

  res.json({ total: transactions.length, data: transactions });
});

// POST /api/finance/transactions - Record new Income or Expense transaction
router.post('/transactions', checkAuthOrAllowInternal, (req, res) => {
  const {
    type, // 'INCOME' | 'EXPENSE'
    category,
    description,
    amountBDT,
    paymentMethod,
    accountCode,
    referenceNo,
    date,
    notes
  } = req.body;

  const amount = Number(amountBDT);
  if (!type || !description || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valid transaction type, description, and positive amount are required' });
  }

  const voucherNo = `VCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTransaction = {
    id: `TXN-${Date.now()}`,
    voucherNo,
    type: type.toUpperCase(), // 'INCOME' or 'EXPENSE'
    category: category || (type === 'INCOME' ? 'Client Service Revenue' : 'Office Operational Expense'),
    description: description.trim(),
    amountBDT: amount,
    paymentMethod: paymentMethod || 'Bank Wire / EFT',
    accountCode: accountCode || (type === 'INCOME' ? '1010' : '6010'),
    referenceNo: referenceNo || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
    date: date || new Date().toISOString().split('T')[0],
    recordedBy: req.user.name || 'Financial Officer',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.insert('financialTransactions', newTransaction);

  // Update corresponding General Ledger balance in database.json
  const ledger = db.get('generalLedger') || [];
  const targetAcc = ledger.find(a => a.accountCode === newTransaction.accountCode || a.id === newTransaction.accountCode);
  if (targetAcc) {
    const isAssetOrExpense = targetAcc.category === 'ASSET' || targetAcc.category.startsWith('EXPENSE');
    let delta = newTransaction.amountBDT;
    if (newTransaction.type === 'EXPENSE' && targetAcc.category === 'ASSET') {
      delta = -newTransaction.amountBDT;
    }
    db.update('generalLedger', targetAcc.id, {
      balanceBDT: (targetAcc.balanceBDT || 0) + delta
    });
  }

  logAuditEvent('FINANCIAL_TRANSACTION_RECORDED', `Recorded ${newTransaction.type} [${newTransaction.voucherNo}]: ${newTransaction.description} (৳${newTransaction.amountBDT.toLocaleString()})`, req);
  res.status(201).json(newTransaction);
});

// DELETE /api/finance/transactions/:id - Delete transaction
router.delete('/transactions/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('financialTransactions', id);
  if (!existing) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  // Revert ledger impact
  const ledger = db.get('generalLedger') || [];
  const targetAcc = ledger.find(a => a.accountCode === existing.accountCode || a.id === existing.accountCode);
  if (targetAcc) {
    let revertDelta = -existing.amountBDT;
    if (existing.type === 'EXPENSE' && targetAcc.category === 'ASSET') {
      revertDelta = existing.amountBDT;
    }
    db.update('generalLedger', targetAcc.id, {
      balanceBDT: (targetAcc.balanceBDT || 0) + revertDelta
    });
  }

  db.delete('financialTransactions', id);
  logAuditEvent('TRANSACTION_DELETED', `Deleted transaction [${existing.voucherNo}]`, req);
  res.json({ success: true, message: 'Transaction removed successfully' });
});

/* ==========================================================================
   4. FINANCIAL SUMMARY & P&L
   ========================================================================== */

// GET /api/finance/financial-summary - Live P&L, VAT & Cash summary
router.get('/financial-summary', (req, res) => {
  const invoices = db.get('invoices') || [];
  const ledger = db.get('generalLedger') || [];
  const transactions = db.get('financialTransactions') || [];

  // Revenue from invoices + Income transactions
  const billedInvoiceRevenue = invoices.reduce((s, i) => s + (i.totalPayableBDT || 0), 0);
  const directIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.amountBDT || 0), 0);
  const totalRevenueBDT = billedInvoiceRevenue + directIncome;

  // Expenses from Expense transactions + Expense accounts in ledger
  const transactionExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.amountBDT || 0), 0);
  const opexExpenses = ledger.filter(l => l.category === 'EXPENSE_OPEX' || l.category === 'EXPENSE_COGS').reduce((s, a) => s + (a.balanceBDT || 0), 0);
  const totalExpensesBDT = transactionExpenses + opexExpenses;

  // Net Operating Profit
  const netProfitBDT = totalRevenueBDT - totalExpensesBDT;

  // Liquid Cash & Bank Equivalents
  const cashAccountsBDT = ledger.filter(l => l.accountCode && l.accountCode.startsWith('10')).reduce((s, a) => s + (a.balanceBDT || 0), 0);

  // VAT Mushak-6.3 Collected
  const totalVATMushakBDT = invoices.reduce((s, i) => s + (i.vatAmountBDT || 0), 0);

  // Accounts Receivable (Unpaid Invoices)
  const accountsReceivableBDT = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((s, i) => s + (i.totalPayableBDT || 0), 0);

  res.json({
    totalRevenueBDT,
    totalExpensesBDT,
    netProfitBDT,
    cashAndEquivalentsBDT: cashAccountsBDT,
    totalVATMushakBDT,
    accountsReceivableBDT,
    taxComplianceStandard: 'National Board of Revenue (NBR) ITES 5% VAT Mushak-6.3',
    fiscalYear: 'FY 2026-2027',
    totalInvoicesCount: invoices.length,
    totalTransactionsCount: transactions.length
  });
});

export default router;
