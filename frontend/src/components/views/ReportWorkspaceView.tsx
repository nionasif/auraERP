import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  DollarSign,
  Receipt,
  Server,
  X,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Building,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Printer,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Landmark,
  ShieldCheck,
  Calendar,
  Layers,
  PieChart
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { GLAccount, FinancialTransaction, Invoice } from '../../types/erp';

interface ReportWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

type FinanceTab = 'OVERVIEW' | 'TRANSACTIONS' | 'ACCOUNTS' | 'INVOICES';

export const ReportWorkspaceView: React.FC<ReportWorkspaceViewProps> = ({ store }) => {
  const {
    state,
    setView,
    fetchFinanceData,
    addGLAccount,
    updateGLAccount,
    deleteGLAccount,
    addFinancialTransaction,
    deleteFinancialTransaction,
    addFinanceInvoice,
    updateFinanceInvoiceStatus,
    deleteFinanceInvoice
  } = store;

  const [activeTab, setActiveTab] = useState<FinanceTab>('OVERVIEW');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Search & Filters
  const [txnSearch, setTxnSearch] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const [accountSearch, setAccountSearch] = useState('');
  const [accountCategoryFilter, setAccountCategoryFilter] = useState('ALL');

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('ALL');

  // Modals
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GLAccount | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'TXN' | 'ACC' | 'INV'; id: string; name: string } | null>(null);

  // Initial load
  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFinanceData();
    setIsRefreshing(false);
    showToast('Financial ledger & invoices synchronized from backend', 'info');
  };

  // -------------------------------------------------------------
  // Form State: Financial Transaction (Voucher)
  // -------------------------------------------------------------
  const [txnType, setTxnType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [txnCategory, setTxnCategory] = useState('Cloud Infrastructure & Compute');
  const [txnDescription, setTxnDescription] = useState('');
  const [txnAmount, setTxnAmount] = useState<number | ''>('');
  const [txnPaymentMethod, setTxnPaymentMethod] = useState('Corporate RTGS Wire');
  const [txnAccountCode, setTxnAccountCode] = useState('1010');
  const [txnRefNo, setTxnRefNo] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [txnNotes, setTxnNotes] = useState('');

  const openAddTransaction = (type: 'INCOME' | 'EXPENSE' = 'EXPENSE') => {
    setTxnType(type);
    setTxnCategory(type === 'INCOME' ? 'Enterprise Client Retainer' : 'Cloud Infrastructure & Compute');
    setTxnDescription('');
    setTxnAmount('');
    setTxnPaymentMethod('Corporate RTGS Wire');
    setTxnAccountCode(type === 'INCOME' ? '1010' : '6010');
    setTxnRefNo(`REF-${Math.floor(10000 + Math.random() * 90000)}`);
    setTxnDate(new Date().toISOString().split('T')[0]);
    setTxnNotes('');
    setShowTxnModal(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(txnAmount);
    if (!txnDescription.trim() || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid description and positive amount', 'warning');
      return;
    }

    const payload: Partial<FinancialTransaction> = {
      type: txnType,
      category: txnCategory,
      description: txnDescription.trim(),
      amountBDT: amount,
      paymentMethod: txnPaymentMethod,
      accountCode: txnAccountCode,
      referenceNo: txnRefNo.trim(),
      date: txnDate,
      notes: txnNotes.trim(),
    };

    await addFinancialTransaction(payload);
    showToast(`Recorded ${txnType} voucher of ৳${amount.toLocaleString()} successfully!`, 'success');
    setShowTxnModal(false);
  };

  // -------------------------------------------------------------
  // Form State: GL Account
  // -------------------------------------------------------------
  const [accCode, setAccCode] = useState('');
  const [accName, setAccName] = useState('');
  const [accCategory, setAccCategory] = useState<'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE_OPEX' | 'EXPENSE_COGS'>('EXPENSE_OPEX');
  const [accBalance, setAccBalance] = useState<number | ''>(0);

  const openAddAccount = () => {
    setEditingAccount(null);
    setAccCode(`${Math.floor(1000 + Math.random() * 8999)}`);
    setAccName('');
    setAccCategory('EXPENSE_OPEX');
    setAccBalance(0);
    setShowAccountModal(true);
  };

  const openEditAccount = (acc: GLAccount) => {
    setEditingAccount(acc);
    setAccCode(acc.accountCode);
    setAccName(acc.accountName);
    setAccCategory(acc.category as any);
    setAccBalance(acc.balanceBDT);
    setShowAccountModal(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) {
      showToast('Account name is required', 'warning');
      return;
    }

    const payload: Partial<GLAccount> = {
      accountCode: accCode.trim() || `${Math.floor(1000 + Math.random() * 8999)}`,
      accountName: accName.trim(),
      category: accCategory,
      balanceBDT: Number(accBalance) || 0,
      currency: 'BDT'
    };

    if (editingAccount) {
      await updateGLAccount(editingAccount.id || editingAccount.accountCode, payload);
      showToast(`Account '${payload.accountName}' updated!`, 'success');
    } else {
      await addGLAccount(payload);
      showToast(`New Chart of Accounts record created!`, 'success');
    }
    setShowAccountModal(false);
  };

  // -------------------------------------------------------------
  // Form State: New Tax Invoice (Mushak-6.3)
  // -------------------------------------------------------------
  const [invClientName, setInvClientName] = useState('');
  const [invPaymentMethod, setInvPaymentMethod] = useState('Corporate RTGS Wire');
  const [invDueDate, setInvDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [invStatus, setInvStatus] = useState<'PAID' | 'PENDING' | 'OVERDUE'>('PAID');
  const [invItems, setInvItems] = useState<Array<{ name: string; quantity: number; unitPrice: number }>>([
    { name: 'Enterprise Cloud Architecture & DevOps Support (Monthly)', quantity: 1, unitPrice: 350000 }
  ]);
  const [invDiscount, setInvDiscount] = useState<number>(0);

  const openAddInvoice = () => {
    setInvClientName(state.customers[0]?.name || '');
    setInvPaymentMethod('Corporate RTGS Wire');
    setInvDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setInvStatus('PAID');
    setInvDiscount(0);
    setInvItems([{ name: 'Enterprise Cloud Architecture & DevOps Support (Monthly)', quantity: 1, unitPrice: 350000 }]);
    setShowInvoiceModal(true);
  };

  const handleAddInvItem = () => {
    setInvItems(prev => [...prev, { name: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveInvItem = (index: number) => {
    if (invItems.length <= 1) return;
    setInvItems(prev => prev.filter((_, i) => i !== index));
  };

  const invSubtotalBDT = useMemo(() => {
    return invItems.reduce((acc, it) => acc + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0);
  }, [invItems]);

  const invVATAmountBDT = useMemo(() => {
    return Math.round((invSubtotalBDT - invDiscount) * 0.05); // 5% NBR ITES VAT
  }, [invSubtotalBDT, invDiscount]);

  const invGrandTotalBDT = useMemo(() => {
    return Math.max(0, invSubtotalBDT - invDiscount + invVATAmountBDT);
  }, [invSubtotalBDT, invDiscount, invVATAmountBDT]);

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientName.trim()) {
      showToast('Client / Company name is required', 'warning');
      return;
    }

    const validItems = invItems.filter(it => it.name.trim() !== '');
    if (validItems.length === 0) {
      showToast('Please enter at least one service item', 'warning');
      return;
    }

    const payload = {
      clientName: invClientName.trim(),
      items: validItems.map((it, idx) => ({
        id: `item-${idx + 1}`,
        name: it.name.trim(),
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        totalBDT: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
      })),
      subtotalBDT: invSubtotalBDT,
      corporateDiscountBDT: invDiscount,
      vatAmountBDT: invVATAmountBDT,
      totalPayableBDT: invGrandTotalBDT,
      paymentMethod: invPaymentMethod,
      status: invStatus,
      dueDate: invDueDate,
    };

    await addFinanceInvoice(payload);
    showToast(`Official Tax Invoice generated successfully!`, 'success');
    setShowInvoiceModal(false);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'TXN') {
      await deleteFinancialTransaction(deleteTarget.id);
      showToast(`Transaction voucher deleted`, 'info');
    } else if (deleteTarget.type === 'ACC') {
      await deleteGLAccount(deleteTarget.id);
      showToast(`Account record removed from Chart of Accounts`, 'info');
    } else if (deleteTarget.type === 'INV') {
      await deleteFinanceInvoice(deleteTarget.id);
      showToast(`Invoice removed`, 'info');
    }
    setDeleteTarget(null);
  };

  // -------------------------------------------------------------
  // Filtered Data
  // -------------------------------------------------------------
  const filteredTransactions = useMemo(() => {
    return (state.financialTransactions || []).filter(t => {
      const matchType = txnTypeFilter === 'ALL' || t.type === txnTypeFilter;
      const q = txnSearch.toLowerCase();
      const matchSearch =
        !q ||
        (t.voucherNo && t.voucherNo.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.referenceNo && t.referenceNo.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [state.financialTransactions, txnTypeFilter, txnSearch]);

  const filteredAccounts = useMemo(() => {
    return (state.generalLedger || []).filter(a => {
      const matchCategory = accountCategoryFilter === 'ALL' || a.category === accountCategoryFilter;
      const q = accountSearch.toLowerCase();
      const matchSearch =
        !q ||
        (a.accountCode && a.accountCode.toLowerCase().includes(q)) ||
        (a.accountName && a.accountName.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [state.generalLedger, accountCategoryFilter, accountSearch]);

  const filteredInvoices = useMemo(() => {
    return (state.invoices || []).filter(inv => {
      const status = (inv.status || inv.paymentStatus || 'PAID').toUpperCase();
      const matchStatus = invoiceStatusFilter === 'ALL' || status === invoiceStatusFilter;
      const q = invoiceSearch.toLowerCase();
      const client = (inv.clientName || inv.customer?.name || '').toLowerCase();
      const num = (inv.invoiceNumber || inv.invoiceNo || '').toLowerCase();
      const matchSearch = !q || client.includes(q) || num.includes(q);
      return matchStatus && matchSearch;
    });
  }, [state.invoices, invoiceStatusFilter, invoiceSearch]);

  // Dynamic Real-time Calculations (Purely from Real Database Data)
  const billedRevenue = (state.invoices || []).reduce((acc, inv) => {
    return acc + (Number(inv.totalPayableBDT || inv.grandTotal || 0));
  }, 0);

  const directIncome = (state.financialTransactions || [])
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + (Number(t.amountBDT) || 0), 0);

  const totalCalculatedRevenue = billedRevenue + directIncome;

  const totalCalculatedExpenses = (state.financialTransactions || [])
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + (Number(t.amountBDT) || 0), 0);

  const netOperatingIncome = totalCalculatedRevenue - totalCalculatedExpenses;

  const liquidCashBank = (state.generalLedger || [])
    .filter(a => a.accountCode && a.accountCode.startsWith('10'))
    .reduce((acc, a) => acc + (Number(a.balanceBDT) || 0), 0);

  const totalVATCollected = (state.invoices || []).reduce((acc, inv) => {
    return acc + (Number(inv.vatAmountBDT || inv.vatAmount || 0));
  }, 0);

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* Top Workspace Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('DASHBOARD')}
            className="text-slate-400 hover:text-white flex items-center space-x-1 transition"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-bold text-amber-300 flex items-center space-x-1.5">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Finance, General Ledger & Tax Accounting Workspace</span>
          </span>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold ml-2">
            NBR MUSHAK-6.3 COMPLIANT
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-[11px]"
            title="Reload real ledger from backend"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setView('DASHBOARD')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition text-[11px] font-semibold"
            title="Close workspace (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
            : toastMessage.type === 'warning'
            ? 'bg-amber-950/90 text-amber-300 border-amber-800'
            : 'bg-cyan-950/90 text-cyan-300 border-cyan-800'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Executive KPI Summary Bar (Purely real computed values) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-900/60 border-b border-slate-800">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Revenue</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">৳{totalCalculatedRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Invoices & Direct Income</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Expenses</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">৳{totalCalculatedExpenses.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Operating & Compute OPEX</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Operating Profit</div>
            <div className={`text-xl font-bold font-mono mt-0.5 ${netOperatingIncome >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              ৳{netOperatingIncome.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Operating Margin Result</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cash & Bank Balances</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">৳{liquidCashBank.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">SCB & Operating Accounts</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">5% VAT Mushak-6.3</div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">৳{totalVATCollected.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">NBR Tax Withheld</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Navigation & Action Controls */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'OVERVIEW'
                ? 'bg-amber-600 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>P&L & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Income & Expense Vouchers ({state.financialTransactions?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ACCOUNTS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'ACCOUNTS'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Chart of Accounts ({state.generalLedger?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'INVOICES'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Tax Invoices & Mushak-6.3 ({state.invoices?.length || 0})</span>
          </button>
        </div>

        <div>
          {activeTab === 'OVERVIEW' && (
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Financial Statement</span>
            </button>
          )}

          {activeTab === 'TRANSACTIONS' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAddTransaction('INCOME')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Record Income</span>
              </button>
              <button
                onClick={() => openAddTransaction('EXPENSE')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Record Expense</span>
              </button>
            </div>
          )}

          {activeTab === 'ACCOUNTS' && (
            <button
              onClick={openAddAccount}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add GL Account</span>
            </button>
          )}

          {activeTab === 'INVOICES' && (
            <button
              onClick={openAddInvoice}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Mushak-6.3 Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE FINANCIAL OVERVIEW & P&L */}
        {/* ========================================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Income vs Expense Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                    <PieChart className="w-4 h-4 text-amber-400" />
                    <span>Statement of Profit & Loss (FY 2026-2027)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Real Enterprise Ledger</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300 font-sans">Billed Client Revenue (Invoices):</span>
                    <span className="text-emerald-400 font-bold">৳{billedRevenue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300 font-sans">Direct Operational Income (Vouchers):</span>
                    <span className="text-emerald-400 font-bold">৳{directIncome.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center bg-emerald-950/40 p-2.5 rounded border border-emerald-800/60">
                    <span className="text-emerald-300 font-sans font-bold">Gross Operating Revenue:</span>
                    <span className="text-emerald-400 font-bold text-sm">৳{totalCalculatedRevenue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-300 font-sans">Operating Expenses (OPEX):</span>
                    <span className="text-rose-400 font-bold">৳{totalCalculatedExpenses.toLocaleString()}</span>
                  </div>

                  <div className={`flex justify-between items-center p-3 rounded border font-bold text-sm ${
                    netOperatingIncome >= 0
                      ? 'bg-cyan-950/50 border-cyan-800 text-cyan-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-300'
                  }`}>
                    <span className="font-sans">Net Operating Margin (EBITDA):</span>
                    <span>৳{netOperatingIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Tax Compliance & Liquidity */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Tax Withholding & Bank Accounts Liquidity</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold">NBR Verified</span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">National Board of Revenue (NBR) Standard:</span>
                      <span className="text-slate-200">Mushak-6.3 (5% ITES VAT)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Total VAT Amount Assessed:</span>
                      <span className="text-purple-400 font-bold">৳{totalVATCollected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Tax Challan Status:</span>
                      <span className="text-emerald-400 font-bold">Tax Compliant / Certified</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-300 font-sans uppercase">Active Corporate Bank Balances</div>
                    {state.generalLedger?.filter(a => a.category === 'ASSET' && a.accountCode.startsWith('10')).map(acc => (
                      <div key={acc.id} className="flex justify-between text-slate-300">
                        <span className="font-sans">[{acc.accountCode}] {acc.accountName}:</span>
                        <span className="font-bold text-amber-400">৳{(acc.balanceBDT || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Vouchers List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-slate-200">Recent Financial Vouchers (Real Entries)</span>
                <button
                  onClick={() => setActiveTab('TRANSACTIONS')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  View All ({state.financialTransactions?.length || 0}) →
                </button>
              </div>

              {state.financialTransactions?.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No vouchers recorded yet. Click '+ Record Income' or '+ Record Expense' to enter real data.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 font-sans text-xs">
                  {state.financialTransactions?.slice(0, 5).map(txn => (
                    <div key={txn.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          txn.type === 'INCOME'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {txn.type}
                        </span>
                        <div>
                          <div className="font-bold text-slate-200">{txn.description}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{txn.voucherNo} • {txn.category}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold ${txn.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {txn.type === 'INCOME' ? '+' : '-'}৳{(txn.amountBDT || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{txn.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INCOME & EXPENSE TRANSACTIONS */}
        {/* ========================================================================= */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search voucher, description, ref..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={txnTypeFilter}
                  onChange={(e) => setTxnTypeFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Voucher Types</option>
                  <option value="INCOME">Income Vouchers Only</option>
                  <option value="EXPENSE">Expense Vouchers Only</option>
                </select>
              </div>
            </div>

            {/* Transactions Table or Empty State */}
            {filteredTransactions.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-3">
                <Wallet className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">No Vouchers Recorded Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your corporate accounts ledger is clean. Record real income (client payments) or expenses (servers, bandwidth, rent).
                </p>
                <div className="flex justify-center space-x-2 pt-2">
                  <button
                    onClick={() => openAddTransaction('INCOME')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Real Income</span>
                  </button>
                  <button
                    onClick={() => openAddTransaction('EXPENSE')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Real Expense</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Voucher No</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4 text-right">Amount (BDT)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{txn.voucherNo}</td>
                        <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">{txn.date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            txn.type === 'INCOME'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                            {txn.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-medium">{txn.description}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{txn.paymentMethod}</td>
                        <td className={`py-3 px-4 font-mono font-bold text-right ${
                          txn.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {txn.type === 'INCOME' ? '+' : '-'}৳{(txn.amountBDT || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setDeleteTarget({ type: 'TXN', id: txn.id, name: txn.voucherNo })}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CHART OF ACCOUNTS (COA) */}
        {/* ========================================================================= */}
        {activeTab === 'ACCOUNTS' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search accounts by name or code..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={accountCategoryFilter}
                  onChange={(e) => setAccountCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Account Classes</option>
                  <option value="ASSET">Assets (1000s)</option>
                  <option value="LIABILITY">Liabilities (2000s)</option>
                  <option value="EQUITY">Equity (3000s)</option>
                  <option value="REVENUE">Revenue (4000s)</option>
                  <option value="EXPENSE_COGS">Direct COGS (5000s)</option>
                  <option value="EXPENSE_OPEX">Operating Expenses (6000s)</option>
                </select>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Account Code</th>
                    <th className="py-3 px-4">Account Title / Description</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-right">Current Ledger Balance (BDT)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.id || acc.accountCode} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{acc.accountCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{acc.accountName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          acc.category === 'ASSET'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : acc.category === 'REVENUE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : acc.category.startsWith('EXPENSE')
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {acc.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-100">
                        ৳{(acc.balanceBDT || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditAccount(acc)}
                            className="p-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
                            title="Edit Account"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'ACC', id: acc.id || acc.accountCode, name: acc.accountName })}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INVOICES & MUSHAK-6.3 BILLING */}
        {/* ========================================================================= */}
        {activeTab === 'INVOICES' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search invoices by client or number..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="PAID">Paid Invoices</option>
                  <option value="PENDING">Pending Payment</option>
                  <option value="OVERDUE">Overdue Invoices</option>
                  <option value="VOID">Voided</option>
                </select>
              </div>
            </div>

            {/* Invoices Table or Empty State */}
            {filteredInvoices.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-3">
                <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">No Invoices Issued Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Issue your first tax invoice to enterprise clients with automatic NBR Mushak-6.3 calculation.
                </p>
                <button
                  onClick={openAddInvoice}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue First Tax Invoice</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Mushak-6.3 Challan</th>
                      <th className="py-3 px-4">Client / Corporate Account</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4 font-mono text-right">Total Payable (BDT)</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredInvoices.map((inv) => {
                      const invNumber = inv.invoiceNumber || inv.invoiceNo;
                      const client = inv.clientName || inv.customer?.name || 'Client';
                      const total = Number(inv.totalPayableBDT || inv.grandTotal || 0);
                      const status = (inv.status || inv.paymentStatus || 'PAID').toUpperCase();

                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-purple-400">{invNumber}</td>
                          <td className="py-3 px-4 font-mono text-amber-300 text-[11px]">
                            {inv.mushakChallanNo || 'CHL-6.3-DC01-AUTO'}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-200">{client}</td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{inv.issueDate || inv.date}</td>
                          <td className="py-3 px-4 font-mono font-bold text-right text-emerald-400">
                            ৳{total.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={status}
                              onChange={(e) => updateFinanceInvoiceStatus(inv.id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-purple-500"
                            >
                              <option value="PAID">PAID</option>
                              <option value="PENDING">PENDING</option>
                              <option value="OVERDUE">OVERDUE</option>
                              <option value="VOID">VOID</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setSelectedInvoiceForView(inv)}
                                className="p-1 rounded bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition"
                                title="View Mushak-6.3 Tax Invoice"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'INV', id: inv.id, name: invNumber })}
                                className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD INCOME / EXPENSE VOUCHER */}
      {/* ========================================================================= */}
      {showTxnModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className={`w-5 h-5 ${txnType === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`} />
                <h3 className="font-bold text-sm text-slate-100">
                  Record {txnType === 'INCOME' ? 'Income / Receipt Voucher' : 'Expense / Payment Voucher'}
                </h3>
              </div>
              <button onClick={() => setShowTxnModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Voucher Type *</label>
                  <select
                    value={txnType}
                    onChange={(e) => setTxnType(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-bold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="EXPENSE">Expense (Debit Expense / Credit Cash)</option>
                    <option value="INCOME">Income (Debit Cash / Credit Revenue)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Accounting Category *</label>
                  <input
                    type="text"
                    required
                    value={txnCategory}
                    onChange={(e) => setTxnCategory(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Description / Particulars *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS & Equinix Datacenter Direct Link Lease (October)"
                  value={txnDescription}
                  onChange={(e) => setTxnDescription(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 180000"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={txnPaymentMethod}
                    onChange={(e) => setTxnPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Corporate RTGS Wire">Corporate RTGS Wire</option>
                    <option value="Standard Chartered EFT">Standard Chartered EFT</option>
                    <option value="BEFTN Electronic Transfer">BEFTN Electronic Transfer</option>
                    <option value="Cheque Payment">Cheque Payment</option>
                    <option value="Petty Cash">Petty Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Posting GL Account</label>
                  <select
                    value={txnAccountCode}
                    onChange={(e) => setTxnAccountCode(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                  >
                    {state.generalLedger?.map(a => (
                      <option key={a.id || a.accountCode} value={a.accountCode}>
                        [{a.accountCode}] {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Reference / Cheque No</label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-908123"
                  value={txnRefNo}
                  onChange={(e) => setTxnRefNo(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Additional audit trail remarks..."
                  value={txnNotes}
                  onChange={(e) => setTxnNotes(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded font-bold text-xs shadow-lg transition ${
                    txnType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT GL ACCOUNT */}
      {/* ========================================================================= */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-cyan-400" />
                <span>{editingAccount ? 'Edit Ledger Account' : 'New Chart of Accounts Record'}</span>
              </h3>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Account Code *</label>
                <input
                  type="text"
                  required
                  value={accCode}
                  onChange={(e) => setAccCode(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Account Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Chartered Operating Escrow"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Accounting Classification *</label>
                <select
                  value={accCategory}
                  onChange={(e) => setAccCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ASSET">ASSET (Cash, Bank, Hardware Infrastructure)</option>
                  <option value="LIABILITY">LIABILITY (Vendor Payables, Accrued)</option>
                  <option value="EQUITY">EQUITY (Shareholder Capital, Retained)</option>
                  <option value="REVENUE">REVENUE (Software Services, Retainers)</option>
                  <option value="EXPENSE_COGS">EXPENSE_COGS (Direct Hosting & OEM Cost)</option>
                  <option value="EXPENSE_OPEX">EXPENSE_OPEX (Salaries, Office, Maintenance)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Initial / Current Balance (BDT)</label>
                <input
                  type="number"
                  value={accBalance}
                  onChange={(e) => setAccBalance(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs shadow-lg transition"
                >
                  {editingAccount ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: GENERATE TAX INVOICE (MUSHAK-6.3) */}
      {/* ========================================================================= */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Issue Official NBR Mushak-6.3 Tax Invoice
                </h3>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Corporate Client / Buyer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BRAC Bank PLC - IT Division"
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-semibold focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Payment Method *</label>
                  <select
                    value={invPaymentMethod}
                    onChange={(e) => setInvPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-purple-400"
                  >
                    <option value="Corporate RTGS Wire">Corporate RTGS Wire</option>
                    <option value="BEFTN Direct Credit">BEFTN Direct Credit</option>
                    <option value="Accounts Payee Cheque">Accounts Payee Cheque</option>
                    <option value="SCB Corporate Gateway">SCB Corporate Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Dynamic Service Items */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Invoice Line Items (ITES Consulting & Services)</span>
                  <button
                    type="button"
                    onClick={handleAddInvItem}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-[11px] font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {invItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-950 p-2 rounded border border-slate-800 items-center">
                      <div className="col-span-7">
                        <input
                          type="text"
                          required
                          placeholder="Service Description"
                          value={item.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInvItems(prev => prev.map((it, i) => i === idx ? { ...it, name: val } : it));
                          }}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setInvItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                          }}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs font-mono text-center focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="Unit BDT"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setInvItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPrice: val } : it));
                          }}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs font-mono text-right focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveInvItem(idx)}
                          disabled={invItems.length <= 1}
                          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>৳{invSubtotalBDT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Corporate Discount (BDT):</span>
                    <input
                      type="number"
                      min="0"
                      value={invDiscount}
                      onChange={(e) => setInvDiscount(Number(e.target.value))}
                      className="w-28 p-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-200"
                    />
                  </div>
                  <div className="flex justify-between text-purple-400">
                    <span>NBR ITES VAT (5%):</span>
                    <span>+৳{invVATAmountBDT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-slate-800">
                    <span>Total Payable BDT:</span>
                    <span>৳{invGrandTotalBDT.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs shadow-lg transition"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VIEW / PRINT MUSHAK-6.3 OFFICIAL TAX INVOICE */}
      {/* ========================================================================= */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-purple-400 font-mono">
                Official NBR Mushak-6.3: {selectedInvoiceForView.invoiceNumber || selectedInvoiceForView.invoiceNo}
              </span>
              <button onClick={() => setSelectedInvoiceForView(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 font-sans text-xs bg-slate-950">
              <div className="text-center pb-3 border-b border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px] font-mono uppercase">Government of the People's Republic of Bangladesh • National Board of Revenue</div>
                <div className="text-base font-bold text-slate-100 font-mono">TAX INVOICE / কর চালানপত্র [মূসক-৬.৩]</div>
                <div className="text-[11px] text-amber-300 font-mono">
                  [See Clauses (c) & (f) of Sub-rule (1) of Rule 40]
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-900 p-3 rounded border border-slate-800">
                <div>
                  <div className="text-slate-400 font-bold mb-1">REGISTERED SUPPLIER</div>
                  <div className="font-bold text-slate-100">AURATECH IT & CLOUD DATA CENTER</div>
                  <div className="text-slate-300">Silicon Tower, Level 14-16, Plot 8/A, Gulshan-2, Dhaka-1212</div>
                  <div className="text-slate-400 font-mono text-[11px]">BIN: 002341982-0101</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">BUYER / CLIENT</div>
                  <div className="font-bold text-slate-100">
                    {selectedInvoiceForView.clientName || selectedInvoiceForView.customer?.name}
                  </div>
                  <div>Invoice Ref: <span className="font-mono text-purple-300">{selectedInvoiceForView.invoiceNumber || selectedInvoiceForView.invoiceNo}</span></div>
                  <div>Challan No: <span className="font-mono text-amber-300 font-bold">{selectedInvoiceForView.mushakChallanNo || 'CHL-6.3-DC01-0812'}</span></div>
                  <div>Date of Issue: <span className="font-mono text-slate-200">{selectedInvoiceForView.issueDate || selectedInvoiceForView.date}</span></div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Description of Goods / ITES Services</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Value (BDT)</th>
                    <th className="p-2 text-right">VAT Rate</th>
                    <th className="p-2 text-right">VAT Amount (BDT)</th>
                    <th className="p-2 text-right">Total Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {selectedInvoiceForView.items?.map((it: any, i) => {
                    const price = Number(it.unitPrice || it.price || 0);
                    const qty = Number(it.quantity || it.qty || 1);
                    const val = Number(it.totalBDT || (price * qty));
                    const vat = Math.round(val * 0.05);

                    return (
                      <tr key={i}>
                        <td className="p-2 font-sans font-medium text-slate-200">{it.name || it.itemName}</td>
                        <td className="p-2 text-center">{qty}</td>
                        <td className="p-2 text-right">৳{val.toLocaleString()}</td>
                        <td className="p-2 text-right text-purple-300">5%</td>
                        <td className="p-2 text-right text-purple-400">৳{vat.toLocaleString()}</td>
                        <td className="p-2 text-right text-emerald-400 font-bold">৳{(val + vat).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 border-t border-slate-800 font-mono font-bold text-sm">
                    <td colSpan={5} className="p-2 text-right text-slate-300 font-sans">Total Payable with NBR VAT:</td>
                    <td className="p-2 text-right text-emerald-400">
                      ৳{Number(selectedInvoiceForView.totalPayableBDT || selectedInvoiceForView.grandTotal || 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <div>
                  Payment Status: <span className="font-bold text-emerald-400 font-mono">PAID / VERIFIED</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Mushak-6.3</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">Confirm Deletion</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete record <span className="text-rose-400 font-bold font-mono">"{deleteTarget.name}"</span>?
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold shadow"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
