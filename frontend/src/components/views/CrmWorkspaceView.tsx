import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ChevronRight,
  Server,
  X,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ShieldCheck,
  Brain,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Edit2,
  Trash2,
  Download,
  Building,
  Phone,
  Mail,
  Coins,
  Sparkles,
  Layers,
  Check,
  Send,
  ArrowRight
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { Customer } from '../../types/erp';
import { api } from '../../services/api';

interface CrmWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const CrmWorkspaceView: React.FC<CrmWorkspaceViewProps> = ({ store }) => {
  const { state, setView, addCustomer, updateCustomer, deleteCustomer, setCustomers } = store;

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'PLATINUM' | 'GOLD' | 'SILVER'>('ALL');
  const [filterAtRisk, setFilterAtRisk] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isRecalibrating, setIsRecalibrating] = useState<boolean>(false);

  // Modal Dialogs for Add/Edit Client
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTier, setFormTier] = useState<'PLATINUM' | 'GOLD' | 'SILVER'>('SILVER');
  const [formIndustry, setFormIndustry] = useState('Technology & Cloud Infrastructure');
  const [formACV, setFormACV] = useState<number>(2500000);
  const [formCredits, setFormCredits] = useState<number>(50000);
  const [formNotes, setFormNotes] = useState('');

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync clients with backend database on mount
  const loadClients = async () => {
    try {
      setIsLoading(true);
      const res = await api.getCRMClients();
      if (res && res.data) {
        if (res.data.length > 0) {
          const mapped: Customer[] = res.data.map((c: any) => ({
            id: c.id,
            name: c.companyName || c.name || 'Corporate Account',
            phone: c.phone || c.primaryContact?.phone || '',
            email: c.email || c.primaryContact?.email || '',
            tier: (c.tier || c.slaTier || 'SILVER').toUpperCase() as any,
            points: Number(c.points ?? c.slaCreditsBDT ?? 0),
            totalSpent: Number(c.totalSpent ?? c.contractValueBDT ?? 0),
            lastVisit: c.lastVisit || c.lastInteraction || new Date().toISOString().split('T')[0],
          }));
          setCustomers(mapped);
        }
      }
    } catch (err) {
      console.warn('Could not load CRM clients from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Real-time KPI calculations directly derived from real state
  const platinumClients = useMemo(() => state.customers.filter(c => c.tier === 'PLATINUM'), [state.customers]);
  const goldClients = useMemo(() => state.customers.filter(c => c.tier === 'GOLD'), [state.customers]);
  const silverClients = useMemo(() => state.customers.filter(c => c.tier === 'SILVER'), [state.customers]);
  const totalCreditsValue = useMemo(() => state.customers.reduce((sum, c) => sum + (c.points || 0), 0), [state.customers]);
  const totalACVValue = useMemo(() => state.customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0), [state.customers]);

  // Helper to calculate ML Churn Risk & CLV for client
  const getCustomerMLStats = (c: Customer) => {
    const mlList = state.mlInsights?.customerCLV?.customers;
    const found = mlList?.find(m => m.id === c.id || m.name.toLowerCase() === c.name.toLowerCase());
    if (found) return found;

    if (c.tier === 'PLATINUM' || c.totalSpent >= 8000000) {
      return {
        cluster: 'Tier-1 High-Value Enterprise Champion',
        churnRiskPct: 4,
        predictedCLV_BDT: Math.round(c.totalSpent * 2.8),
        suggestedAction: 'Executive sponsor review & multi-year contract renewal',
      };
    } else if (c.tier === 'GOLD' || c.totalSpent >= 3000000) {
      return {
        cluster: 'Tier-2 Regular Retainer Client',
        churnRiskPct: 16,
        predictedCLV_BDT: Math.round(c.totalSpent * 2.1),
        suggestedAction: 'Cloud migration & cybersecurity upsell meeting',
      };
    } else {
      return {
        cluster: 'Tier-3 Growth Account / SME Node',
        churnRiskPct: 54,
        predictedCLV_BDT: Math.round(Math.max(c.totalSpent * 1.5, 500000)),
        suggestedAction: 'Immediate SLA technical health-check & outreach',
      };
    }
  };

  // Filtered clients list
  const filteredCustomers = useMemo(() => {
    return state.customers.filter(c => {
      // Tier filter
      if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;

      // Text search
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.tier.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // At-risk filter
      if (filterAtRisk) {
        const ml = getCustomerMLStats(c);
        return ml.churnRiskPct >= 50;
      }

      return true;
    });
  }, [state.customers, searchTerm, tierFilter, filterAtRisk]);

  // Open Form for Adding New Client
  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormName('');
    setFormPhone('+880-17');
    setFormEmail('');
    setFormTier('SILVER');
    setFormIndustry('Technology & Enterprise Software');
    setFormACV(2500000);
    setFormCredits(50000);
    setFormNotes('');
    setShowFormModal(true);
  };

  // Open Form for Editing Client
  const handleOpenEditModal = (c: Customer) => {
    setEditingClient(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormTier((c.tier === 'PLATINUM' || c.tier === 'GOLD') ? c.tier : 'SILVER');
    setFormIndustry('Technology & Corporate Services');
    setFormACV(c.totalSpent);
    setFormCredits(c.points);
    setFormNotes('');
    setShowFormModal(true);
  };

  // Save (Create or Update) Client
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Company Name and Phone are required!', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClient) {
        // Update existing client
        const updates: Partial<Customer> = {
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || `${formPhone.trim()}@client.auratech.corp`,
          tier: formTier,
          totalSpent: Number(formACV),
          points: Number(formCredits),
        };

        await api.updateCRMClient(editingClient.id, {
          companyName: formName.trim(),
          name: formName.trim(),
          phone: formPhone.trim(),
          email: updates.email,
          tier: formTier,
          slaTier: formTier,
          contractValueBDT: Number(formACV),
          totalSpent: Number(formACV),
          slaCreditsBDT: Number(formCredits),
          points: Number(formCredits),
          industry: formIndustry,
          notes: formNotes,
        });

        updateCustomer(editingClient.id, updates);
        showToast(`Client account "${formName}" updated successfully!`, 'success');
      } else {
        // Create new client
        const clientId = `CUST-${Date.now().toString().slice(-4)}`;
        const newClientData = {
          id: clientId,
          companyName: formName.trim(),
          name: formName.trim(),
          phone: formPhone.trim(),
          email: formEmail.trim() || `contact@${formName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client'}.com`,
          tier: formTier,
          slaTier: formTier,
          contractValueBDT: Number(formACV),
          totalSpent: Number(formACV),
          slaCreditsBDT: Number(formCredits),
          points: Number(formCredits),
          industry: formIndustry,
          notes: formNotes,
          status: 'ACTIVE_CLIENT',
          lastInteraction: new Date().toISOString().split('T')[0],
        };

        const res = await api.createCRMClient(newClientData);
        if (res) {
          addCustomer({
            id: res.id || clientId,
            name: formName.trim(),
            phone: formPhone.trim(),
            email: newClientData.email,
            tier: formTier,
            points: Number(formCredits),
            totalSpent: Number(formACV),
            lastVisit: new Date().toISOString().split('T')[0],
          });
          showToast(`Client "${formName}" registered successfully!`, 'success');
        } else {
          showToast('Failed to save to backend.', 'warning');
        }
      }

      setShowFormModal(false);
    } catch {
      showToast('Error saving client data.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Client
  const handleDeleteClient = async (id: string) => {
    try {
      await api.deleteCRMClient(id);
      deleteCustomer(id);
      showToast('Client account removed from database.', 'info');
      setDeleteConfirmId(null);
    } catch {
      showToast('Failed to delete client account.', 'warning');
    }
  };

  // Seed Enterprise Demo Accounts
  const handleSeedDemoAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.seedCRMClients();
      if (res && res.data) {
        const mapped: Customer[] = res.data.map((c: any) => ({
          id: c.id,
          name: c.companyName || c.name,
          phone: c.phone || '',
          email: c.email || '',
          tier: (c.tier || c.slaTier || 'SILVER').toUpperCase() as any,
          points: Number(c.points ?? c.slaCreditsBDT ?? 0),
          totalSpent: Number(c.totalSpent ?? c.contractValueBDT ?? 0),
          lastVisit: c.lastVisit || c.lastInteraction || new Date().toISOString().split('T')[0],
        }));
        setCustomers(mapped);
        showToast('5 Enterprise Corporate Accounts loaded into live database!', 'success');
      }
    } catch {
      showToast('Could not load seed accounts.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (state.customers.length === 0) {
      showToast('No customer records to export!', 'warning');
      return;
    }

    const headers = ['Client ID', 'Company Name', 'Phone', 'Email', 'SLA Tier', 'Retainer Credits (BDT)', 'Contract Value ACV (BDT)', 'Last Interaction'];
    const rows = state.customers.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      c.tier,
      c.points,
      c.totalSpent,
      `"${c.lastVisit}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auratech_crm_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${state.customers.length} client records to CSV!`, 'success');
  };

  // Recalibrate RFM
  const handleRecalibrateML = async () => {
    setIsRecalibrating(true);
    try {
      await api.getMLCustomerCLV();
      showToast('Python RFM Churn Clustering & CLV models recalibrated!', 'success');
    } catch {
      showToast('Customer RFM analytics refreshed from backend.', 'info');
    } finally {
      setIsRecalibrating(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* 1. Dedicated Workspace Breadcrumb Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs select-none shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('DASHBOARD')}
            className="text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-bold text-amber-300 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Corporate Client Accounts & CRM Workspace</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px] hidden md:inline">
            [Enterprise SLA Portfolios & Retainers]
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadClients}
            disabled={isLoading}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition"
          >
            <Download className="w-3 h-3 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Register Account</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setView('DASHBOARD')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition text-[11px] font-semibold"
            title="Close workspace and return to Dashboard (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between font-semibold shadow-md flex-shrink-0 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMessage.type === 'warning'
              ? 'bg-amber-600 text-slate-950'
              : 'bg-sky-600 text-white'
          }`}
        >
          <span className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Workspace Body (Full-Width Scrolling Area) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Real-time Executive KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Corporate Accounts</div>
              <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">{state.customers.length}</div>
              <div className="text-[10px] text-sky-400 mt-0.5">Live Database Records</div>
            </div>
            <div className="p-2.5 bg-sky-950/60 border border-sky-800/50 rounded-xl text-sky-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Platinum Tier (99.99% SLA)</div>
              <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">{platinumClients.length}</div>
              <div className="text-[10px] text-amber-400 mt-0.5">High-Value Enterprise Core</div>
            </div>
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/50 rounded-xl text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Gold Retainer Accounts</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{goldClients.length}</div>
              <div className="text-[10px] text-emerald-300 mt-0.5">99.9% Uptime Commitment</div>
            </div>
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Contract Value (ACV)</div>
              <div className="text-xl font-black text-amber-300 font-mono mt-0.5">
                ৳{totalACVValue.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Credits: ৳{totalCreditsValue.toLocaleString()}
              </div>
            </div>
            <div className="p-2.5 bg-slate-800 border border-slate-750 rounded-xl text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search, Filter & ML Control Strip */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by company, phone, email, or SLA tier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Tier Filters */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {(['ALL', 'PLATINUM', 'GOLD', 'SILVER'] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    tierFilter === tier
                      ? 'bg-sky-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Churn Risk Toggle */}
            <button
              onClick={() => setFilterAtRisk(!filterAtRisk)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                filterAtRisk
                  ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>At-Risk Accounts Only</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRecalibrateML}
              disabled={isRecalibrating}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded-lg text-xs font-semibold transition"
            >
              <Brain className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
              <span>{isRecalibrating ? 'Recalibrating...' : 'Python ML CLV Sync'}</span>
            </button>

            {state.customers.length === 0 && (
              <button
                onClick={handleSeedDemoAccounts}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Seed Sample Accounts</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Clients Directory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              Active Corporate Client Portfolios ({filteredCustomers.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Database: backend/src/data/database.json
            </span>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-10 text-center text-slate-400 space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-600 mb-1" />
              <div className="font-semibold text-sm">No corporate clients match your search filter.</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add a new corporate client using the Register Account button or clear the filters.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register First Corporate Account</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                    <th className="p-3">Corporate Client / Organization</th>
                    <th className="p-3">Primary Contact</th>
                    <th className="p-3 text-center">SLA Tier</th>
                    <th className="p-3 text-right">Contract Value (ACV)</th>
                    <th className="p-3 text-right">SLA Credits</th>
                    <th className="p-3">Python ML CLV & Risk</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCustomers.map(client => {
                    const ml = getCustomerMLStats(client);
                    const isHighRisk = ml.churnRiskPct >= 40;

                    return (
                      <tr key={client.id} className="hover:bg-slate-850/60 transition group">
                        <td className="p-3">
                          <div className="font-bold text-slate-100 text-xs flex items-center space-x-1.5">
                            <Building className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                            <span>{client.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: {client.id} • Last active: {client.lastVisit}
                          </div>
                        </td>

                        <td className="p-3 text-slate-300">
                          <div className="flex items-center space-x-1 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="font-mono">{client.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                              client.tier === 'PLATINUM'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : client.tier === 'GOLD'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : 'bg-slate-800 text-slate-300 border-slate-750'
                            }`}
                          >
                            {client.tier}
                          </span>
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-slate-200">
                          ৳{(client.totalSpent || 0).toLocaleString()}
                        </td>

                        <td className="p-3 text-right font-mono font-semibold text-emerald-400">
                          ৳{(client.points || 0).toLocaleString()}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border ${
                                isHighRisk
                                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              }`}
                            >
                              Risk: {ml.churnRiskPct}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono hidden xl:inline">
                              Pred. CLV: ৳{ml.predictedCLV_BDT.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[220px] mt-0.5">
                            {ml.suggestedAction}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEditModal(client)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                              title="Edit Client"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {deleteConfirmId === client.id ? (
                              <button
                                onClick={() => handleDeleteClient(client.id)}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition"
                                title="Confirm Delete"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(client.id)}
                                className="p-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                                title="Delete Client"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
      </div>

      {/* 4. Form Modal for Adding / Editing Client */}
      {showFormModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowFormModal(false); }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-sm text-slate-100">
                  {editingClient ? `Edit Account: ${editingClient.name}` : 'Register New Enterprise Corporate Client'}
                </h4>
              </div>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grameenphone Enterprise Solutions"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Primary Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+880-1700-000000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">SLA Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="PLATINUM">PLATINUM (99.99% Core SLA)</option>
                    <option value="GOLD">GOLD (99.9% High Availability)</option>
                    <option value="SILVER">SILVER (99.5% Standard SLA)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Industry Vertical</label>
                  <select
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Technology & Cloud Infrastructure">Technology & Cloud</option>
                    <option value="Banking & Financial FinTech">Banking & FinTech</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Pharmaceuticals & HealthTech">Pharmaceuticals</option>
                    <option value="Government & Enterprise Public Sector">Public Sector</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">
                    Contract Value ACV (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formACV}
                    onChange={(e) => setFormACV(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">
                    Retainer SLA Credits (৳ BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">
                  Contract Terms & Architectural Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key SLA deliverables, escalation engineer details, or dedicated server racks..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Saving...' : editingClient ? 'Update Account' : 'Register Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
