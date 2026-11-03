import React, { useState } from 'react';
import {
  X,
  Building,
  CreditCard,
  Percent,
  Smartphone,
  Shield,
  Printer,
  Save,
  CheckCircle,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface SetupModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const SetupModal: React.FC<SetupModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [activeTab, setActiveTab] = useState<'OUTLET' | 'REGISTERS' | 'VAT' | 'PAYMENT' | 'SECURITY'>('OUTLET');
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  const handleSave = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Enterprise Cloud & Tech Hub Setup (DC01 Silicon Tower Configuration)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-5 bg-slate-950 border-b border-slate-800 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('OUTLET')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'OUTLET' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span className="truncate">Hub Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTERS')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'REGISTERS' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="truncate">Billing Desks</span>
          </button>

          <button
            onClick={() => setActiveTab('VAT')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'VAT' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span className="truncate">Mushak 6.3 & VAT</span>
          </button>

          <button
            onClick={() => setActiveTab('PAYMENT')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'PAYMENT' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">Gateways & Wire</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'SECURITY' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="truncate">RBAC & Security</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {savedAlert && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Configuration successfully saved and synced across Datacenter Fabric!</span>
            </div>
          )}

          {activeTab === 'OUTLET' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Facility / Node Code</label>
                  <input
                    type="text"
                    defaultValue={state.storeInfo.outletCode}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Facility Display Name</label>
                  <input
                    type="text"
                    defaultValue={state.storeInfo.outletName}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Physical Datacenter Address</label>
                <input
                  type="text"
                  defaultValue={state.storeInfo.address}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-sans">NBR Business Identification (BIN)</label>
                  <input
                    type="text"
                    defaultValue={state.storeInfo.vatRegNo}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-amber-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-sans">Trade License No.</label>
                  <input
                    type="text"
                    defaultValue="TRAD/DSCC/019284/2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-sans">Operating Schedule</label>
                  <input
                    type="text"
                    defaultValue="24/7/365 NOC & Infrastructure Operations"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-slate-200 font-semibold">Central CDC Synchronization:</div>
                <div>• Central Server: cdc.auratech.internal:8443 (Active • Latency: 4ms)</div>
                <div>• Fallback Offline Cache: Enabled (Encrypted Distributed SQLite Cluster)</div>
              </div>
            </div>
          )}

          {activeTab === 'REGISTERS' && (
            <div className="space-y-3 font-mono">
              <div className="text-[11px] font-sans text-slate-400 mb-2">
                Configure network IP, thermal invoice printers, and secure gateway connections for each engineering billing desk.
              </div>
              <div className="space-y-2">
                {state.registers.map(reg => (
                  <div key={reg.registerNo} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-amber-300">Desk #{reg.registerNo}</span>
                        <span className="text-slate-400 text-[11px] font-sans">({reg.cashierName})</span>
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 rounded text-[10px]">
                          ONLINE
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        IP: {reg.ipAddress || '10.240.10.' + (reg.registerNo % 100)} • Printer: {reg.printerType || 'HP Enterprise LaserJet / Network Spooler'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 font-sans">
                      <button
                        onClick={() => alert(`Test invoice spool sent to Desk #${reg.registerNo} (${reg.printerType})`)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-xs border border-slate-700 flex items-center space-x-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Test Print</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'VAT' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1">
                  National Board of Revenue (NBR) Mushak-6.3 IT Compliance
                </div>
                <p className="text-slate-400 text-[11px]">
                  All enterprise software, cloud subscriptions, and IT services are issued with digital fiscal memory tax invoices.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-slate-400 text-[11px] block mb-1">Standard IT Services & SaaS VAT:</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">5.0% (Inclusive/Exclusive)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Applied to software consulting, DevOps retainers & SaaS subscriptions.</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-slate-400 text-[11px] block mb-1">Datacenter Hardware Import Tax:</span>
                  <div className="text-lg font-bold text-amber-400 font-mono">5.0% + Advance Income Tax (AIT)</div>
                  <div className="text-[10px] text-slate-500 mt-1">Applied to server blades, switches, and optical transceiver hardware.</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded font-sans text-xs">
                <div className="font-semibold text-slate-200 mb-1">Digital Fiscal Invoice Sequence:</div>
                <div className="font-mono text-slate-400 text-[11px]">
                  Format: INV-[YEAR]-DC01-[DESK]-[SEQUENCE] • Next: INV-2026-DC01-0901-0906
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PAYMENT' && (
            <div className="space-y-3 font-sans">
              <div className="text-slate-400 text-[11px] mb-2">
                Merchant account credentials for Corporate RTGS, BEFTN Escrows, and Commercial Bank POS gateways.
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-sky-400 font-bold text-xs font-sans">Standard Chartered Corporate Wire</div>
                  <div className="text-slate-300 text-xs mt-1">A/C: 01-8849201-01 (BDT Escrow)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Routing: 215260124 • Active</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-purple-400 font-bold text-xs font-sans">City Bank Corporate RTGS</div>
                  <div className="text-slate-300 text-xs mt-1">A/C: 1102948192001 (City Gem B2B)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Routing: 225271891 • Active</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-emerald-400 font-bold text-xs font-sans">HSBC Treasury Escrow Vault</div>
                  <div className="text-slate-300 text-xs mt-1">TID: HSBC-CORP-44910281</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dual-currency USD/BDT escrow supported</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-pink-400 font-bold text-xs font-sans">bKash Corporate Merchant</div>
                  <div className="text-slate-300 text-xs mt-1">Merchant Shortcode: 01700-112233</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Instant settlement for developer portal invoices</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SECURITY' && (
            <div className="space-y-3 font-sans">
              <div className="text-slate-400 text-[11px] mb-2">
                Role-based privileges matrix (RBAC) for DC01 engineering team and terminal controllers.
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <th className="p-2">Role Name</th>
                    <th className="p-2 text-center">Service Billing</th>
                    <th className="p-2 text-center">SOW Discount Override</th>
                    <th className="p-2 text-center">Hardware Transfer</th>
                    <th className="p-2 text-center">Z-Report Close</th>
                    <th className="p-2 text-center">Audit Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  <tr><td className="p-2 font-bold text-slate-200">Infrastructure Director</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-emerald-400">YES</td></tr>
                  <tr><td className="p-2 font-bold text-slate-200">Lead Solutions Architect</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-rose-400">NO</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-emerald-400">YES</td></tr>
                  <tr><td className="p-2 font-bold text-slate-200">Billing Desk Engineer</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-rose-400">NO</td><td className="p-2 text-center text-rose-400">NO</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-rose-400">NO</td></tr>
                  <tr><td className="p-2 font-bold text-slate-200">DC Vault Custodian</td><td className="p-2 text-center text-rose-400">NO</td><td className="p-2 text-center text-rose-400">NO</td><td className="p-2 text-center text-emerald-400">YES</td><td className="p-2 text-center text-rose-400">NO</td><td className="p-2 text-center text-emerald-400">YES</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Master Node: DC01-Silicon-Tower • Version: AuraTech ERP v4.8 Enterprise IT Edition
          </span>
          <div className="flex space-x-2">
            <button
              onClick={closeModal}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center space-x-1 shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
