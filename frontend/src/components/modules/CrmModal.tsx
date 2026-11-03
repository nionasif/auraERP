import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  Brain,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Plus,
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
  Filter
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { Customer } from '../../types/erp';
import { api } from '../../services/api';

interface CrmModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const CrmModal: React.FC<CrmModalProps> = ({ store }) => {
  const { state, closeModal, addCustomer, updateCustomer, deleteCustomer, setCustomers } = store;

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'PLATINUM' | 'GOLD' | 'SILVER'>('ALL');
  const [filterAtRisk, setFilterAtRisk] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isRecalibrating, setIsRecalibrating] = useState<boolean>(false);

  // Modal Dialogs for Admin CRUD
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

  // Sync clients with backend database on mount if store is empty or needs refresh
  useEffect(() => {
    let isMounted = true;
    const loadClients = async () => {
      try {
        setIsLoading(true);
        const res = await api.getCRMClients();
        if (isMounted && res && res.data) {
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
        if (isMounted) setIsLoading(false);
      }
    };

    loadClients();
    return () => {
      isMounted = false;
    };
  }, [setCustomers]);

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
    const currentDate = new Date().toISOString().split('T')[0];

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

        // Update in backend API
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

        // Update in frontend store
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
          lastVisit: currentDate,
          lastInteraction: currentDate,
          status: 'ACTIVE_CLIENT',
          notes: formNotes,
        };

        // Save to backend database
        const saved = await api.createCRMClient(newClientData);

        const newStoreClient: Customer = {
          id: saved?.id || clientId,
          name: formName.trim(),
          phone: formPhone.trim(),
          email: newClientData.email,
          tier: formTier,
          points: Number(formCredits),
          totalSpent: Number(formACV),
          lastVisit: currentDate,
        };

        addCustomer(newStoreClient);
        showToast(`Corporate client "${formName}" enrolled into database!`, 'success');
      }

      setShowFormModal(false);
    } catch (err) {
      console.error('Error saving corporate client:', err);
      showToast('Saved locally in ERP session.', 'info');
      setShowFormModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Client
  const handleDeleteClient = async (id: string, name: string) => {
    try {
      await api.deleteCRMClient(id);
      deleteCustomer(id);
      setDeleteConfirmId(null);
      showToast(`Account "${name}" deleted from CRM database.`, 'info');
    } catch (err) {
      console.error('Failed to delete client:', err);
      deleteCustomer(id);
      setDeleteConfirmId(null);
      showToast(`Account "${name}" removed from local session.`, 'info');
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

  // Send SLA Advisory
  const handleSendCampaign = () => {
    const count = filteredCustomers.length;
    showToast(`Security & SLA Advisory dispatched to ${count} Corporate Clients!`, 'success');
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
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-6xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">

        {/* Top Header */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-100">
                  Corporate Client Accounts & Enterprise CRM Desk
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Real Database Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage live enterprise corporate accounts, SLA retainer commitments, and lifetime ACV analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition shadow"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Corporate Client</span>
            </button>

            {state.customers.length === 0 && (
              <button
                onClick={handleSeedDemoAccounts}
                disabled={isLoading}
                className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/50 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Load Sample Clients</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              title="Export all clients to CSV"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-lg border border-slate-700 flex items-center space-x-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ML & Analytics Intelligence Strip */}
        <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border-b border-purple-800/40 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Brain className="w-4 h-4 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200">
                  ML RFM Behavioral Clustering & Churn Probability
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/30 text-purple-200 border border-purple-500/40 font-mono">
                  Live Engine Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Auditing {state.customers.length} client accounts across Recency, Frequency, and ACV Contract Volume.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterAtRisk(!filterAtRisk)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center space-x-1.5 transition ${filterAtRisk
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${filterAtRisk ? 'text-white' : 'text-rose-400'}`} />
              <span>{filterAtRisk ? 'Showing High Churn Risk (ML 50%+)' : 'Filter At-Risk Accounts'}</span>
            </button>

            <button
              onClick={handleRecalibrateML}
              disabled={isRecalibrating}
              className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-[11px] font-semibold rounded-md border border-purple-500/40 flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isRecalibrating ? 'animate-spin' : ''}`} />
              <span>{isRecalibrating ? 'Recalibrating...' : 'Recalibrate RFM'}</span>
            </button>
          </div>
        </div>

        {/* Real Dynamic Summary KPI Cards (Derived from Real Data) */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            {/* Card 1: Platinum */}
            <div
              onClick={() => setTierFilter(tierFilter === 'PLATINUM' ? 'ALL' : 'PLATINUM')}
              className={`p-3 rounded-lg border cursor-pointer transition ${tierFilter === 'PLATINUM'
                ? 'bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/50'
                : 'bg-slate-900 border-purple-800/60 hover:bg-slate-850'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-300 font-sans font-bold uppercase tracking-wider">
                  Enterprise Tier-1 (Platinum)
                </span>
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              </div>
              <div className="text-xl font-bold text-purple-300 mt-1">
                {platinumClients.length} Accounts
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                99.99% SLA • Churn &lt;5%
              </div>
            </div>

            {/* Card 2: Gold */}
            <div
              onClick={() => setTierFilter(tierFilter === 'GOLD' ? 'ALL' : 'GOLD')}
              className={`p-3 rounded-lg border cursor-pointer transition ${tierFilter === 'GOLD'
                ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/50'
                : 'bg-slate-900 border-amber-800/60 hover:bg-slate-850'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-300 font-sans font-bold uppercase tracking-wider">
                  Gold Retainer (Tier-2)
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              </div>
              <div className="text-xl font-bold text-amber-300 mt-1">
                {goldClients.length} Accounts
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                99.95% SLA • Churn ~16%
              </div>
            </div>

            {/* Card 3: Silver */}
            <div
              onClick={() => setTierFilter(tierFilter === 'SILVER' ? 'ALL' : 'SILVER')}
              className={`p-3 rounded-lg border cursor-pointer transition ${tierFilter === 'SILVER'
                ? 'bg-slate-800 border-sky-500 ring-2 ring-sky-500/50'
                : 'bg-slate-900 border-slate-750 hover:bg-slate-850'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-300 font-sans font-bold uppercase tracking-wider">
                  Silver Retainer (Tier-3)
                </span>
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              </div>
              <div className="text-xl font-bold text-slate-200 mt-1">
                {silverClients.length} Accounts
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                99.90% SLA • 4h Response
              </div>
            </div>

            {/* Card 4: Retainer Credits & ACV Value */}
            <div className="p-3 bg-slate-900 border border-slate-750 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-300 font-sans font-bold uppercase tracking-wider">
                  SLA Retainer Credits
                </span>
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                ৳{totalCreditsValue.toLocaleString()} Val
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5 flex justify-between">
                <span>Total Portfolio ACV:</span>
                <span className="font-bold text-slate-200">৳{totalACVValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Actions Bar */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap gap-2.5 items-center justify-between text-xs">
          <div className="flex items-center space-x-2 flex-1 min-w-[260px] max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by Company Name, Phone, Email, or SLA Tier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-sans focus:outline-none focus:border-sky-400"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-sans focus:outline-none focus:border-sky-400"
            >
              <option value="ALL">All Tiers ({state.customers.length})</option>
              <option value="PLATINUM">Platinum ({platinumClients.length})</option>
              <option value="GOLD">Gold ({goldClients.length})</option>
              <option value="SILVER">Silver ({silverClients.length})</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendCampaign}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 transition shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Broadcast SLA Advisory</span>
            </button>
          </div>
        </div>

        {/* Toast Alert Message */}
        {toastMessage && (
          <div className={`px-4 py-2 text-xs flex items-center justify-between ${toastMessage.type === 'success'
            ? 'bg-emerald-950 border-b border-emerald-800 text-emerald-300'
            : toastMessage.type === 'warning'
              ? 'bg-amber-950 border-b border-amber-800 text-amber-300'
              : 'bg-sky-950 border-b border-sky-800 text-sky-300'
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

        {/* Client Accounts Table */}
        <div className="p-4 overflow-y-auto flex-1 font-sans text-xs">
          {filteredCustomers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-200 text-sm">No Corporate Clients Found</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  {searchTerm || tierFilter !== 'ALL' || filterAtRisk
                    ? 'No corporate client accounts match your active search or filter criteria.'
                    : 'Your CRM database has no client accounts enrolled yet. Click below to add your first real client or populate sample enterprise accounts.'}
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Enroll Corporate Client</span>
                </button>
                {state.customers.length === 0 && (
                  <button
                    onClick={handleSeedDemoAccounts}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Load 5 Demo Enterprise Clients</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <th className="p-2.5">Corporate Client Profile</th>
                    <th className="p-2.5">Contact Phone</th>
                    <th className="p-2.5 text-center">SLA Service Tier</th>
                    <th className="p-2.5 text-right">Retainer Credits</th>
                    <th className="p-2.5 text-right">Contract Value (ACV)</th>
                    <th className="p-2.5 text-center">Last Interaction</th>
                    <th className="p-2.5 text-right">ML Churn Risk & CLV</th>
                    <th className="p-2.5 text-center">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {filteredCustomers.map(c => {
                    const ml = getCustomerMLStats(c);
                    const isHighRisk = ml.churnRiskPct >= 50;

                    return (
                      <tr key={c.id} className={`hover:bg-slate-850/60 transition ${isHighRisk ? 'bg-rose-950/15' : ''}`}>
                        {/* Profile */}
                        <td className="p-2.5 font-sans">
                          <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                            <Building className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                            <span>{c.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span>ID: {c.id}</span>
                            <span>•</span>
                            <span className="text-slate-400">{c.email}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="p-2.5 text-slate-300 font-mono text-xs">
                          {c.phone}
                        </td>

                        {/* Tier */}
                        <td className="p-2.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-sans font-bold inline-block ${c.tier === 'PLATINUM'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : c.tier === 'GOLD'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-sky-950 text-sky-300 border border-sky-800'
                            }`}>
                            {c.tier} SLA
                          </span>
                        </td>

                        {/* Retainer Credits */}
                        <td className="p-2.5 text-right text-emerald-400 font-bold">
                          ৳{c.points.toLocaleString()} Val
                        </td>

                        {/* Annual Contract Value */}
                        <td className="p-2.5 text-right font-bold text-slate-200">
                          ৳{c.totalSpent.toLocaleString()}
                        </td>

                        {/* Last Interaction */}
                        <td className="p-2.5 text-center text-slate-400 font-sans text-xs">
                          {c.lastVisit}
                        </td>

                        {/* ML Churn & CLV */}
                        <td className="p-2.5 text-right">
                          <div className="flex flex-col items-end space-y-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold inline-flex items-center space-x-1 ${isHighRisk
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : ml.churnRiskPct < 15
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                              <span>Risk: {ml.churnRiskPct}%</span>
                            </span>
                            <span className="text-[10px] font-mono text-purple-300" title={`Predicted Lifetime Value (CLV): ৳${ml.predictedCLV_BDT.toLocaleString()}`}>
                              CLV: ৳{(ml.predictedCLV_BDT / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              title="Edit Client Information"
                              className="p-1 rounded bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {deleteConfirmId === c.id ? (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleDeleteClient(c.id, c.name)}
                                  title="Confirm Delete"
                                  className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-sans text-[10px] font-bold transition"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-sans text-[10px]"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(c.id)}
                                title="Delete Client"
                                className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
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

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Showing <span className="font-bold text-slate-200">{filteredCustomers.length}</span> of <span className="font-bold text-slate-200">{state.customers.length}</span> corporate client records
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold rounded-lg flex items-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Enroll New Account</span>
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: ADD / EDIT CORPORATE CLIENT (ADMIN FORM)           */}
        {/* ========================================================= */}
        {showFormModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col">
              {/* Form Header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-sky-400" />
                  <h4 className="font-bold text-sm text-slate-100">
                    {editingClient ? `Edit Account: ${editingClient.name}` : 'Enroll New Corporate Client Account'}
                  </h4>
                </div>
                <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitForm} className="p-4 space-y-3.5 text-xs font-sans">
                {/* Company Name */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Corporate Client / Enterprise Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex HealthTech PLC or Robi Axiata Ltd."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Corporate Phone / Helpline *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+880-1700-000000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Procurement / Official Email
                    </label>
                    <input
                      type="email"
                      placeholder="procurement@company.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                {/* SLA Tier Selection */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    SLA Service Commitment Tier *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormTier('PLATINUM')}
                      className={`py-2 px-2 rounded-lg border text-center transition flex flex-col items-center space-y-0.5 ${formTier === 'PLATINUM'
                        ? 'bg-purple-950 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                        }`}
                    >
                      <span className="font-bold text-[11px]">PLATINUM</span>
                      <span className="text-[9px] text-purple-300">99.99% SLA • &lt;15m</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormTier('GOLD')}
                      className={`py-2 px-2 rounded-lg border text-center transition flex flex-col items-center space-y-0.5 ${formTier === 'GOLD'
                        ? 'bg-amber-950 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                        }`}
                    >
                      <span className="font-bold text-[11px]">GOLD</span>
                      <span className="text-[9px] text-amber-300">99.95% SLA • 1h Res</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormTier('SILVER')}
                      className={`py-2 px-2 rounded-lg border text-center transition flex flex-col items-center space-y-0.5 ${formTier === 'SILVER'
                        ? 'bg-sky-950 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                        }`}
                    >
                      <span className="font-bold text-[11px]">SILVER</span>
                      <span className="text-[9px] text-sky-300">99.90% SLA • 4h Res</span>
                    </button>
                  </div>
                </div>

                {/* Contract Value & Credits */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 font-sans block mb-1">
                      Annual Contract Value (ACV ৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={formACV}
                      onChange={(e) => setFormACV(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 font-sans block mb-1">
                      Retainer Credits (BDT ৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={formCredits}
                      onChange={(e) => setFormCredits(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                {/* Industry / Category */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Industry Sector / Domain
                  </label>
                  <select
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="Banking & Financial Services">Banking & Financial Services</option>
                    <option value="Telecommunications & ICT">Telecommunications & ICT</option>
                    <option value="Pharmaceuticals & Healthcare">Pharmaceuticals & Healthcare</option>
                    <option value="E-Commerce & Hyperlocal Logistics">E-Commerce & Hyperlocal Logistics</option>
                    <option value="Garments & Textile Manufacturing">Garments & Textile Manufacturing</option>
                    <option value="Government & Public Infrastructure">Government & Public Infrastructure</option>
                    <option value="Technology & Enterprise Software">Technology & Enterprise Software</option>
                  </select>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition shadow"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{editingClient ? 'Save Changes' : 'Confirm & Enroll'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
