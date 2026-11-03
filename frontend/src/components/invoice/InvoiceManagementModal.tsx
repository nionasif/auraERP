import React, { useState } from 'react';
import {
  X,
  Receipt,
  Search,
  Plus,
  Printer,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  User,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  CreditCard,
  Check,
  FileDown
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { Invoice, InvoiceItem } from '../../types/erp';

interface InvoiceManagementModalProps {
  store: ReturnType<typeof useERPStore>;
  initialTab?: 'HISTORY' | 'GENERATE';
  onClose?: () => void;
}

export const InvoiceManagementModal: React.FC<InvoiceManagementModalProps> = ({
  store,
  initialTab = 'HISTORY',
  onClose,
}) => {
  const { state, closeModal, createCustomInvoice, updateInvoiceStatus, deleteInvoice, openModal } = store;

  const [activeTab, setActiveTab] = useState<'HISTORY' | 'GENERATE'>(initialTab);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Preview & Print Invoice state
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // New Invoice Generator Form State
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-2026-IT-${(state.invoices.length + 906).toString().padStart(4, '0')}`
  );
  const [invoiceDate, setInvoiceDate] = useState('24/09/2026');
  const [dueDate, setDueDate] = useState('24/10/2026');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('NEW');
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Dhaka, Bangladesh');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE'>('PAID');
  const [paymentMethod, setPaymentMethod] = useState<'WIRE_TRANSFER' | 'CARD' | 'MFS' | 'CASH' | 'NET_30'>('WIRE_TRANSFER');
  const [taxRate, setTaxRate] = useState<number>(0.05); // 5% Mushak
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [notes, setNotes] = useState(
    'Payment covered under Master Service Agreement (MSA). 24/7 SLA technical support active.'
  );

  // Line items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      name: 'Enterprise Multi-Cloud AWS Architecture & Terraform Setup',
      size: 'Multi-VPC Production Tier',
      qty: 1,
      unitPrice: 48500,
      discount: 0,
      total: 48500,
    },
    {
      name: '24/7 Enterprise Managed IT Support & NOC Retainer (1 Month)',
      size: 'Tier-3 Dedicated',
      qty: 1,
      unitPrice: 24000,
      discount: 0,
      total: 24000,
    },
  ]);

  // Handle Customer Selection
  const handleCustomerSelectChange = (val: string) => {
    setSelectedCustomerId(val);
    if (val === 'NEW') {
      setCustomerName('');
      setCustomerCompany('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerAddress('');
    } else {
      const found = state.customers.find((c) => c.id === val);
      if (found) {
        setCustomerName(found.name);
        setCustomerCompany(found.name.split('(')[1]?.replace(')', '') || 'Enterprise Client');
        setCustomerPhone(found.phone);
        setCustomerEmail(found.email);
        setCustomerAddress('Level 8, Motijheel C/A, Dhaka');
      }
    }
  };

  // Add Item to Generator
  const handleAddLineItem = () => {
    setItems([
      ...items,
      {
        name: 'Custom IT Cloud Consulting / Hardware Asset',
        size: 'Standard Spec',
        qty: 1,
        unitPrice: 15000,
        discount: 0,
        total: 15000,
      },
    ]);
  };

  // Update Item in Generator
  const handleUpdateItem = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index] };
    if (field === 'qty') {
      const q = Math.max(1, Number(val) || 1);
      item.qty = q;
      item.total = q * item.unitPrice - (item.discount || 0);
    } else if (field === 'unitPrice') {
      const p = Math.max(0, Number(val) || 0);
      item.unitPrice = p;
      item.total = item.qty * p - (item.discount || 0);
    } else if (field === 'discount') {
      const d = Math.max(0, Number(val) || 0);
      item.discount = d;
      item.total = item.qty * item.unitPrice - d;
    } else {
      (item as any)[field] = val;
    }
    updated[index] = item;
    setItems(updated);
  };

  // Remove Item
  const handleRemoveLineItem = (index: number) => {
    if (items.length <= 1) {
      alert('Invoice must contain at least one line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const itemsDiscountSum = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const totalDiscount = itemsDiscountSum + (discountTotal || 0);
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const vatAmount = Math.round(discountedSubtotal * taxRate);
  const grandTotal = discountedSubtotal + vatAmount;

  // Filtered Invoices History
  const filteredInvoices = state.invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.customer?.phone && inv.customer.phone.includes(search)) ||
      (inv.customer?.company && inv.customer.company.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      inv.paymentStatus === statusFilter ||
      (statusFilter === 'PAID' && inv.status === 'COMPLETED');

    return matchesSearch && matchesStatus;
  });

  // Submit and Generate Invoice
  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please specify Customer or Client Name.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    const created = createCustomInvoice({
      invoiceNo: invoiceNumber,
      date: invoiceDate,
      dueDate,
      customer: {
        name: customerName,
        company: customerCompany || undefined,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        tier: 'ENTERPRISE',
      },
      items,
      subtotal,
      discountTotal: totalDiscount,
      vatRate: taxRate,
      vatAmount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      notes,
    });

    // Auto open created invoice preview
    setViewingInvoice(created);
    setActiveTab('HISTORY');
    // Generate next invoice number
    setInvoiceNumber(`INV-2026-IT-${(state.invoices.length + 907).toString().padStart(4, '0')}`);
  };

  // Print Invoice
  const handlePrint = () => {
    window.print();
  };

  // Download Invoice as standalone HTML
  const handleDownloadInvoiceHTML = (inv: Invoice) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${inv.invoiceNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #0f172a; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .paid { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .pending { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    table { width: 100%; border-collapse: collapse; margin-top: 25px; }
    th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .total-box { margin-left: auto; width: 280px; margin-top: 20px; font-size: 12px; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand { font-size: 16px; font-weight: bold; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 4px; color: #047857; }
    .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">AURATECH IT ENTERPRISE SOLUTIONS</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Levels 14-16, Silicon Tower, Tech Zone, Dhaka-1205</div>
      <div style="font-size: 11px; color: #64748b;">BIN: 004891234-0101 • Mushak-6.3 IT Services Fiscal Invoice</div>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; font-size: 20px; color: #0f172a;">TAX INVOICE</h2>
      <div style="font-weight: bold; font-family: monospace; font-size: 14px; margin-top: 4px;">${inv.invoiceNo}</div>
      <div style="font-size: 12px; margin-top: 4px;">Date: ${inv.date}</div>
      <div style="margin-top: 6px;">
        <span class="badge ${inv.paymentStatus === 'PAID' || inv.status === 'COMPLETED' ? 'paid' : 'pending'}">
          ${inv.paymentStatus || 'PAID'}
        </span>
      </div>
    </div>
  </div>

  <div style="margin-top: 25px; display: flex; justify-content: space-between; font-size: 12px;">
    <div>
      <strong style="color: #64748b; text-transform: uppercase; font-size: 10px;">Billed To Client:</strong>
      <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">${inv.customer?.name || 'Walk-in Enterprise Client'}</div>
      ${inv.customer?.company ? `<div>${inv.customer.company}</div>` : ''}
      ${inv.customer?.phone ? `<div>Phone: ${inv.customer.phone}</div>` : ''}
      ${inv.customer?.email ? `<div>Email: ${inv.customer.email}</div>` : ''}
    </div>
    <div style="text-align: right;">
      <strong style="color: #64748b; text-transform: uppercase; font-size: 10px;">Payment Terms:</strong>
      <div style="margin-top: 4px;">Mode: <strong>${inv.paymentMethod}</strong></div>
      ${inv.dueDate ? `<div>Due Date: ${inv.dueDate}</div>` : ''}
      <div>Issuer Node: DC01 Silicon Tower</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description / IT Service</th>
        <th>Spec / Model</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Discount</th>
        <th style="text-align: right;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${inv.items
        .map(
          (item) => `<tr>
          <td><strong>${item.name}</strong></td>
          <td>${item.size || 'Enterprise Spec'}</td>
          <td style="text-align: center;">${item.qty}</td>
          <td style="text-align: right;">৳${item.unitPrice.toLocaleString()}</td>
          <td style="text-align: right;">৳${(item.discount || 0).toLocaleString()}</td>
          <td style="text-align: right; font-weight: bold;">৳${item.total.toLocaleString()}</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="total-box">
    <div class="total-row"><span>Subtotal:</span><span>৳${inv.subtotal.toLocaleString()}</span></div>
    ${inv.discountTotal > 0 ? `<div class="total-row" style="color: #dc2626;"><span>Discount:</span><span>-৳${inv.discountTotal.toLocaleString()}</span></div>` : ''}
    <div class="total-row"><span>VAT (5% Mushak 6.3):</span><span>৳${inv.vatAmount.toLocaleString()}</span></div>
    <div class="total-row grand"><span>GRAND TOTAL:</span><span>৳${inv.grandTotal.toLocaleString()}</span></div>
  </div>

  <div class="footer">
    Thank you for partnering with AuraTech IT Solutions Ltd.! • SLA & Service Agreement Terms Apply.
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.invoiceNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleModalClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 my-auto">
        {/* Top Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <span>Enterprise Invoicing & SOW Billing System</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700">
                  Mushak-6.3 Compliant
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Connected with Sales & Service and Finance & Accounting modules
              </p>
            </div>
          </div>

          <button onClick={handleModalClose} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Header */}
        <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between text-xs select-none">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
                activeTab === 'HISTORY'
                  ? 'border-amber-400 text-amber-300 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Invoice Register & History</span>
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {state.invoices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('GENERATE')}
              className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
                activeTab === 'GENERATE'
                  ? 'border-amber-400 text-amber-300 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Generate New IT Invoice</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Authorized: <strong>{state.currentUser.name}</strong> ({state.currentUser.role})
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: INVOICE REGISTER & HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Invoice #, client name, company, or phone..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[11px]">Payment Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
                    >
                      <option value="ALL" className="bg-slate-900">All Statuses</option>
                      <option value="PAID" className="bg-slate-900">Paid</option>
                      <option value="PENDING" className="bg-slate-900">Pending</option>
                      <option value="PARTIAL" className="bg-slate-900">Partial</option>
                      <option value="OVERDUE" className="bg-slate-900">Overdue</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setActiveTab('GENERATE')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate Invoice</span>
                  </button>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                        <th className="p-3">Invoice Number</th>
                        <th className="p-3">Invoice Date</th>
                        <th className="p-3">Client & Company</th>
                        <th className="p-3 text-center">Items</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-right">VAT (5%)</th>
                        <th className="p-3 text-right">Total Amount</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-500 font-sans">
                            No invoices found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-900/60 transition">
                            <td className="p-3 font-bold text-amber-300">{inv.invoiceNo}</td>
                            <td className="p-3 text-slate-300">
                              <div>{inv.date}</div>
                              <div className="text-[10px] text-slate-500">{inv.time}</div>
                            </td>
                            <td className="p-3 font-sans">
                              <div className="font-semibold text-slate-100">{inv.customer?.name || 'Walk-in Client'}</div>
                              {inv.customer?.company && (
                                <div className="text-[10px] text-slate-400">{inv.customer.company}</div>
                              )}
                              {inv.customer?.phone && (
                                <div className="text-[10px] text-slate-500 font-mono">{inv.customer.phone}</div>
                              )}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-200">
                              {inv.items.reduce((s, i) => s + i.qty, 0)} units
                            </td>
                            <td className="p-3 text-right text-slate-300">৳{inv.subtotal.toLocaleString()}</td>
                            <td className="p-3 text-right text-slate-400">৳{inv.vatAmount.toLocaleString()}</td>
                            <td className="p-3 text-right font-extrabold text-emerald-400">
                              ৳{inv.grandTotal.toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  inv.paymentStatus === 'PAID' || inv.status === 'COMPLETED'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : inv.paymentStatus === 'PENDING'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {inv.paymentStatus || (inv.status === 'COMPLETED' ? 'PAID' : 'PENDING')}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => setViewingInvoice(inv)}
                                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-white transition"
                                  title="View Full Invoice"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setViewingInvoice(inv);
                                    setTimeout(() => window.print(), 200);
                                  }}
                                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-white transition"
                                  title="Print Invoice"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDownloadInvoiceHTML(inv)}
                                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-white transition"
                                  title="Download / Save Invoice as HTML file"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                {state.currentUser.role === 'Super Admin' && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete invoice ${inv.invoiceNo}?`)) {
                                        deleteInvoice(inv.id);
                                      }
                                    }}
                                    className="p-1 rounded bg-slate-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition"
                                    title="Delete Invoice"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GENERATE NEW INVOICE */}
          {activeTab === 'GENERATE' && (
            <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs font-sans">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>Invoice Details & Client Information</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Invoice Form: Standard Mushak-6.3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Invoice Number *</label>
                    <input
                      type="text"
                      required
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Invoice Date *</label>
                    <input
                      type="text"
                      required
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Customer selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Select Existing Client</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerSelectChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="NEW">+ Custom / New Client</option>
                      {state.customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Client / Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Apex TeleHealth Ltd."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={customerCompany}
                      onChange={(e) => setCustomerCompany(e.target.value)}
                      placeholder="e.g. Apex Health Systems"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 01711223344"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="billing@apextelehealth.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Billing Address</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Dhaka, Bangladesh"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Itemized Line Items */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Product & IT Service Deliverables</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-sky-400 hover:text-white border border-slate-700 text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Deliverable Line</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Product / Service</label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(idx, 'qty', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono text-center focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Unit Price (৳)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono text-right focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-2 text-right">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Line Total</label>
                        <div className="text-emerald-400 font-bold font-mono py-1">
                          ৳{item.total.toLocaleString()}
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-600/30 transition"
                          title="Remove Line Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Payment Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Payment Configuration */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-xs text-slate-200">Payment & Settlement Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Payment Status</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                      >
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="OVERDUE">OVERDUE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="WIRE_TRANSFER">Wire / Bank Transfer</option>
                        <option value="CARD">Corporate Card</option>
                        <option value="MFS">MFS / bKash</option>
                        <option value="CASH">Escrow Cash</option>
                        <option value="NET_30">Net 30 Credit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Terms / Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
                  <h4 className="font-bold text-xs text-slate-200 font-sans">Financial Calculation Summary</h4>
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">Subtotal (Deliverables):</span>
                    <span className="text-slate-200">৳{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">SOW Special Rebate / Discount:</span>
                    <div className="flex items-center space-x-1">
                      <span>-৳</span>
                      <input
                        type="number"
                        min="0"
                        value={discountTotal}
                        onChange={(e) => setDiscountTotal(Number(e.target.value) || 0)}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-rose-400 text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400 font-sans">Tax / VAT (5% Mushak-6.3 IT Services):</span>
                    <span className="text-slate-300">৳{vatAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-2 border-t border-slate-700 text-sm font-extrabold text-emerald-400">
                    <span className="font-sans">TOTAL INVOICE AMOUNT:</span>
                    <span>৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('HISTORY')}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Save Invoice</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* --- HIGH-FIDELITY INVOICE PREVIEW & PRINT MODAL --- */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100 max-h-[92vh]">
            {/* Top Toolbar */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-amber-300 font-mono text-sm">{viewingInvoice.invoiceNo}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    viewingInvoice.paymentStatus === 'PAID' || viewingInvoice.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {viewingInvoice.paymentStatus || 'PAID'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>

                <button
                  onClick={() => handleDownloadInvoiceHTML(viewingInvoice)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download HTML</span>
                </button>

                <button onClick={() => setViewingInvoice(null)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Paper Area */}
            <div className="p-4 sm:p-6 bg-slate-950 overflow-y-auto flex-1">
              <div
                id="printable-invoice"
                className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 max-w-2xl mx-auto font-sans"
              >
                {/* Letterhead Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                  <div>
                    <h1 className="text-xl font-extrabold tracking-wider text-slate-950 uppercase">
                      AURA<span className="text-amber-600">TECH</span>
                    </h1>
                    <div className="text-[11px] font-semibold text-slate-700">Enterprise IT Solutions & Cloud Systems Ltd.</div>
                    <div className="text-[10px] text-slate-600 mt-1">Levels 14-16, Silicon Tower, Tech Zone, Dhaka-1205</div>
                    <div className="text-[10px] text-slate-600">BIN: 004891234-0101 • Mushak-6.3 Fiscal IT Tax Invoice</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-extrabold uppercase text-slate-800">TAX INVOICE</div>
                    <div className="text-xs font-mono font-bold text-amber-700 mt-0.5">{viewingInvoice.invoiceNo}</div>
                    <div className="text-[11px] text-slate-600 mt-1">Date: {viewingInvoice.date}</div>
                    {viewingInvoice.dueDate && (
                      <div className="text-[10px] text-slate-500">Due: {viewingInvoice.dueDate}</div>
                    )}
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          viewingInvoice.paymentStatus === 'PAID' || viewingInvoice.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {viewingInvoice.paymentStatus || 'PAID'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billed To / Metadata */}
                <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BILLED TO:</span>
                    <div className="font-bold text-sm text-slate-900 mt-1">
                      {viewingInvoice.customer?.name || 'Walk-in Enterprise Client'}
                    </div>
                    {viewingInvoice.customer?.company && (
                      <div className="text-slate-700 font-medium">{viewingInvoice.customer.company}</div>
                    )}
                    {viewingInvoice.customer?.phone && (
                      <div className="text-slate-600 font-mono text-[11px]">Phone: {viewingInvoice.customer.phone}</div>
                    )}
                    {viewingInvoice.customer?.email && (
                      <div className="text-slate-600 text-[11px]">Email: {viewingInvoice.customer.email}</div>
                    )}
                    {viewingInvoice.customer?.address && (
                      <div className="text-slate-600 text-[11px]">{viewingInvoice.customer.address}</div>
                    )}
                  </div>

                  <div className="text-right space-y-1 text-slate-700">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">BILLING META:</span>
                    <div>Payment Method: <strong>{viewingInvoice.paymentMethod}</strong></div>
                    <div>Terminal / Desk: <strong>Desk #{viewingInvoice.registerNo || 901}</strong></div>
                    <div>Prepared by: <strong>{viewingInvoice.cashierName || state.currentUser.name}</strong></div>
                    <div>Facility: <strong>DC01 Silicon Tower</strong></div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="py-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-300 text-left text-slate-600 font-bold uppercase text-[10px]">
                        <th className="pb-1.5">Deliverable / IT Product</th>
                        <th className="pb-1.5">Spec / Edition</th>
                        <th className="pb-1.5 text-center">Qty</th>
                        <th className="pb-1.5 text-right">Unit Price</th>
                        <th className="pb-1.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {viewingInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 pr-2 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-2 text-slate-600 text-[11px]">{item.size || 'Standard Tier'}</td>
                          <td className="py-2 text-center font-bold text-slate-900 font-mono">{item.qty}</td>
                          <td className="py-2 text-right font-mono text-slate-700">৳{item.unitPrice.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono font-bold text-slate-950">৳{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Box */}
                <div className="border-t border-slate-300 pt-3 flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal:</span>
                      <span>৳{viewingInvoice.subtotal.toLocaleString()}</span>
                    </div>

                    {viewingInvoice.discountTotal > 0 && (
                      <div className="flex justify-between text-rose-600 font-medium">
                        <span>Discount:</span>
                        <span>-৳{viewingInvoice.discountTotal.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-700">
                      <span>VAT (5% Mushak 6.3):</span>
                      <span>৳{viewingInvoice.vatAmount.toLocaleString()}</span>
                    </div>

                    {viewingInvoice.bagCharge !== undefined && viewingInvoice.bagCharge > 0 && (
                      <div className="flex justify-between text-slate-700">
                        <span>Provisioning Kit:</span>
                        <span>৳{viewingInvoice.bagCharge}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t-2 border-slate-900 pt-1.5 text-sm font-extrabold text-emerald-800">
                      <span>GRAND TOTAL:</span>
                      <span>৳{viewingInvoice.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures & Footer Policy */}
                <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                  <div>
                    <div className="h-8 border-b border-dashed border-slate-400 w-36 mx-auto mb-1"></div>
                    <div>Client Acceptance Signature</div>
                  </div>
                  <div>
                    <div className="h-8 border-b border-dashed border-slate-400 w-36 mx-auto mb-1 text-slate-700 font-bold font-mono">
                      {state.currentUser.name}
                    </div>
                    <div>Authorized AuraTech Representative</div>
                  </div>
                </div>

                <div className="text-[9px] text-center text-slate-500 mt-6 pt-3 border-t border-slate-200">
                  This is a computer-generated tax invoice issued by AuraTech IT Solutions Ltd. under National Board of Revenue Mushak 6.3.
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
