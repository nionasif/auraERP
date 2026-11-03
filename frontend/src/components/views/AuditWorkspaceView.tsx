import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Barcode,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Calculator,
  Plus,
  Minus,
  Check,
  Store,
  ChevronRight,
  X,
  History,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface AuditWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const AuditWorkspaceView: React.FC<AuditWorkspaceViewProps> = ({ store }) => {
  const { state, setView, updateStocktakeCount, scanBarcodeStocktake, commitStockAdjustment } = store;

  const [activeTab, setActiveTab] = useState<'CYCLE_COUNT' | 'SHRINKAGE' | 'SAFE_AUDIT'>('CYCLE_COUNT');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'MATCHED' | 'DISCREPANCY'>('ALL');
  const [adjustmentItemId, setAdjustmentItemId] = useState<string | null>(null);
  const [adjustmentReason, setAdjustmentReason] = useState<any>('DATA_MISCOUNT');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe Audit State
  const [notes1000, setNotes1000] = useState(250);
  const [notes500, setNotes500] = useState(180);
  const [notes200, setNotes200] = useState(150);
  const [notes100, setNotes100] = useState(120);
  const [safeAuditSubmitted, setSafeAuditSubmitted] = useState(false);

  const physicalSafeTotal = (notes1000 * 1000) + (notes500 * 500) + (notes200 * 200) + (notes100 * 100);
  const currentRegister = state.registers.find(r => r.registerNo === state.storeInfo.activeRegisterNo) || state.registers[0];
  const safeVariance = physicalSafeTotal - currentRegister.cashBalance;

  // Barcode submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    scanBarcodeStocktake(barcodeInput.trim());
    setToastMessage(`Scanned hardware asset / SN: ${barcodeInput.trim()}`);
    setBarcodeInput('');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter items
  const filteredItems = state.stocktakeItems.filter(item => {
    const matchesDept = filterDept === 'ALL' || item.department === filterDept;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(barcodeInput.toLowerCase()) ||
      item.barcode.includes(barcodeInput) ||
      item.sku.toLowerCase().includes(barcodeInput.toLowerCase());
    return matchesDept && matchesStatus && (barcodeInput ? matchesSearch : true);
  });

  // KPI Calculations
  const totalAudited = state.stocktakeItems.length;
  const matchedCount = state.stocktakeItems.filter(i => i.status === 'MATCHED').length;
  const discrepancyCount = state.stocktakeItems.filter(i => i.status === 'DISCREPANCY').length;
  const totalVarianceLoss = state.stocktakeItems
    .filter(i => i.variance < 0)
    .reduce((sum, i) => sum + Math.abs(i.varianceValue), 0);

  const handleCommitAdjustment = (itemId: string) => {
    commitStockAdjustment(itemId, adjustmentReason);
    setAdjustmentItemId(null);
    setToastMessage('Hardware discrepancy committed and adjusted to enterprise asset ledger.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Top Breadcrumb & Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs select-none">
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
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>Datacenter Asset Audit, Physical Hardware Count & Discrepancy Reconciliation</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px] hidden md:inline">
            [DC01 Silicon Tower Server Racks & Hardware Vault Spot Audit]
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-[11px] text-slate-300 hidden sm:block">
            Internal Auditor: <strong className="text-cyan-300">Tareq Monowar, Lead Infrastructure Auditor (CISA / ISO 27001 LA)</strong>
          </div>
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

      {/* Sub-Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center space-x-1 text-xs select-none">
        <button
          onClick={() => setActiveTab('CYCLE_COUNT')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'CYCLE_COUNT'
              ? 'border-cyan-400 text-cyan-300 bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Barcode className="w-4 h-4 text-cyan-400" />
          <span>Datacenter Asset Audit & Barcode/SN Scan</span>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {discrepancyCount > 0 ? `${discrepancyCount} Alert` : 'Synced'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SHRINKAGE')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'SHRINKAGE'
              ? 'border-rose-400 text-rose-300 bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <span>Decommission & Asset Discrepancy Ledger</span>
          <span className="bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {state.shrinkageLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SAFE_AUDIT')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'SAFE_AUDIT'
              ? 'border-amber-400 text-amber-300 bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-400" />
          <span>Treasury Escrow & Retainer Spot-Audit</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {toastMessage && (
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded flex items-center space-x-2 text-xs font-mono animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TAB 1: CYCLE COUNT & STOCKTAKE */}
        {activeTab === 'CYCLE_COUNT' && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-sans">Audited Hardware & License SKUs</span>
                <div className="text-xl font-bold font-mono text-slate-100 mt-1">{totalAudited} SKUs</div>
                <div className="text-[10px] text-slate-500 mt-0.5">DC01 Server Racks & Cloud Vaults</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-sans">100% Verified Asset SKUs</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{matchedCount} SKUs</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Physical tally matches active ledger</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-sans">Discrepancy Hardware SKUs</span>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{discrepancyCount} SKUs</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Surplus or Shortage recorded</div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-sans">Net Hardware Discrepancy Value</span>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                  ৳{totalVarianceLoss.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Asset value of unverified items</div>
              </div>
            </div>

            {/* Fast Scanner Bar & Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-2.5 items-center justify-between">
              <form onSubmit={handleBarcodeSubmit} className="flex-1 min-w-[260px] relative">
                <Barcode className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Scan hardware SN/barcode to increment count (e.g. 8941001201) or search..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                />
              </form>

              <div className="flex items-center space-x-2 text-xs">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400 font-sans"
                >
                  <option value="ALL">All Practice Areas</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Custom Software">Custom Software</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="AI & Big Data">AI & Big Data</option>
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Managed IT 24/7">Managed IT 24/7</option>
                  <option value="Datacenter Hardware">Datacenter Hardware</option>
                  <option value="Edge Networking">Edge Networking</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400 font-sans"
                >
                  <option value="ALL">All Status</option>
                  <option value="DISCREPANCY">Discrepancy Only</option>
                  <option value="MATCHED">Matched Only</option>
                </select>
              </div>
            </div>

            {/* Cycle Count Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800 sticky top-0">
                    <th className="p-2.5">Barcode / SKU</th>
                    <th className="p-2.5">Asset Description / Solution</th>
                    <th className="p-2.5">DC Rack / Vault Location</th>
                    <th className="p-2.5 text-center">System Book Stock</th>
                    <th className="p-2.5 text-center">Physical Count</th>
                    <th className="p-2.5 text-center">Variance (Qty)</th>
                    <th className="p-2.5 text-right">Variance Value</th>
                    <th className="p-2.5 text-center">Audit Status</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px] font-mono">
                  {filteredItems.map(item => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-850/60 transition ${
                        item.status === 'DISCREPANCY' ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="p-2.5">
                        <div className="font-bold text-slate-200">{item.barcode}</div>
                        <div className="text-[10px] text-slate-500">{item.sku}</div>
                      </td>
                      <td className="p-2.5 font-sans font-medium text-slate-200">
                        {item.name}
                        <div className="text-[10px] text-slate-400">{item.department}</div>
                      </td>
                      <td className="p-2.5 text-cyan-300 font-semibold">{item.location}</td>
                      <td className="p-2.5 text-center font-bold text-slate-300">{item.bookStock} units</td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center space-x-1 bg-slate-950 border border-slate-700 rounded p-1">
                          <button
                            type="button"
                            onClick={() => updateStocktakeCount(item.id, item.physicalCount - 1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-slate-100">{item.physicalCount}</span>
                          <button
                            type="button"
                            onClick={() => updateStocktakeCount(item.id, item.physicalCount + 1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {item.variance === 0 ? (
                          <span className="text-emerald-400">0</span>
                        ) : item.variance > 0 ? (
                          <span className="text-sky-400">+{item.variance} (Surplus)</span>
                        ) : (
                          <span className="text-rose-400">{item.variance} (Shortage)</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        {item.varianceValue === 0 ? (
                          <span className="text-slate-500">৳0</span>
                        ) : item.varianceValue > 0 ? (
                          <span className="text-sky-400">+৳{item.varianceValue.toLocaleString()}</span>
                        ) : (
                          <span className="text-rose-400">-৳{Math.abs(item.varianceValue).toLocaleString()}</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                          item.status === 'MATCHED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-sans">
                        {item.status === 'DISCREPANCY' ? (
                          <button
                            onClick={() => setAdjustmentItemId(item.id)}
                            className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shadow"
                          >
                            Adjust Ledger
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SHRINKAGE & LOSS LEDGER */}
        {activeTab === 'SHRINKAGE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span>Official IT Asset Decommission & Discrepancy Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audit records of hardware component variances and decommission write-offs authorized by Infrastructure Directors and internal IT audit controllers.
                </p>
              </div>
              <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-1 rounded text-xs font-mono font-bold">
                Total Discrepancy Value: ৳{state.shrinkageLogs.reduce((s, l) => s + l.lossValue, 0).toLocaleString()}
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                  <th className="p-2.5">Audit Note #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Hardware / Asset Description</th>
                  <th className="p-2.5 text-center">Variance Qty</th>
                  <th className="p-2.5 text-right">Discrepancy Value</th>
                  <th className="p-2.5">Reason Code</th>
                  <th className="p-2.5">Authorized By</th>
                  <th className="p-2.5 text-center">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {state.shrinkageLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="p-2.5 text-cyan-300 font-bold">{log.auditNo}</td>
                    <td className="p-2.5 text-slate-400">{log.date}</td>
                    <td className="p-2.5 font-sans text-slate-200">
                      {log.productName}
                      <div className="text-[10px] text-slate-500 font-mono">{log.barcode}</div>
                    </td>
                    <td className="p-2.5 text-center font-bold text-rose-400">{log.varianceQty} units</td>
                    <td className="p-2.5 text-right font-bold text-amber-400">৳{log.lossValue.toLocaleString()}</td>
                    <td className="p-2.5 font-sans">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                        {log.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans text-slate-300">{log.approvedBy}</td>
                    <td className="p-2.5 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.actionTaken === 'ADJUSTED_LEDGER'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {log.actionTaken.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: CASH SAFE & DRAWER SPOT AUDIT */}
        {activeTab === 'SAFE_AUDIT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>Corporate Treasury Escrow Note Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Count physical currency and treasury bank notes held in corporate billing desk escrow #{currentRegister.registerNo}.
                </p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-amber-300 font-bold">৳1,000 Note ×</span>
                  <input
                    type="number"
                    value={notes1000}
                    onChange={(e) => setNotes1000(Number(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="w-28 text-right font-bold text-slate-200">
                    = ৳{(notes1000 * 1000).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-amber-300 font-bold">৳500 Note ×</span>
                  <input
                    type="number"
                    value={notes500}
                    onChange={(e) => setNotes500(Number(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="w-28 text-right font-bold text-slate-200">
                    = ৳{(notes500 * 500).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-amber-300 font-bold">৳200 Note ×</span>
                  <input
                    type="number"
                    value={notes200}
                    onChange={(e) => setNotes200(Number(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="w-28 text-right font-bold text-slate-200">
                    = ৳{(notes200 * 200).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-amber-300 font-bold">৳100 Note ×</span>
                  <input
                    type="number"
                    value={notes100}
                    onChange={(e) => setNotes100(Number(e.target.value) || 0)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="w-28 text-right font-bold text-slate-200">
                    = ৳{(notes100 * 100).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSafeAuditSubmitted(true);
                  setTimeout(() => setSafeAuditSubmitted(false), 3000);
                }}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Treasury Spot-Audit Slip</span>
              </button>
            </div>

            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Reconciliation Status (Billing Desk #{currentRegister.registerNo})</span>
                </h3>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Billing Terminal Ledger Balance:</span>
                    <span className="text-slate-100 font-bold">৳{currentRegister.cashBalance.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Physical Counted Treasury Escrow:</span>
                    <span className="text-emerald-400 font-bold">৳{physicalSafeTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Treasury Discrepancy / Variance:</span>
                    <span className={`font-bold ${safeVariance === 0 ? 'text-emerald-400' : safeVariance > 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                      {safeVariance === 0 ? '৳0 (Perfect Reconciliation)' : safeVariance > 0 ? `+৳${safeVariance.toLocaleString()} (Surplus)` : `-৳${Math.abs(safeVariance).toLocaleString()} (Shortage)`}
                    </span>
                  </div>
                </div>

                {safeAuditSubmitted && (
                  <div className="mt-4 p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-mono flex items-center space-x-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Treasury Spot-Audit verified and transmitted to Central Enterprise Accounts.</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                Audit Rule: Any treasury escrow variance exceeding ৳500 requires immediate joint sign-off by the Chief Financial Officer (CFO) and Lead Audit Controller.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discrepancy Adjustment Modal */}
      {adjustmentItemId && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setAdjustmentItemId(null); }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-md shadow-2xl p-4 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Authorize Hardware Discrepancy Adjustment</span>
              </h3>
              <button onClick={() => setAdjustmentItemId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 text-xs">
              Select reason code for writing off or updating the system asset registry for this hardware component or license:
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Reason Code:</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-amber-400 font-sans"
              >
                <option value="DATA_MISCOUNT">Previous Count / Inventory Data Entry Error</option>
                <option value="VENDOR_SHORTAGE">OEM Hardware Challan Shortage (Dell/Cisco)</option>
                <option value="EXPIRED_DAMAGE">Damaged in Datacenter Rack Deployment</option>
                <option value="THEFT_UNRECORDED">Unrecorded Component Extraction / Lab Testing</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAdjustmentItemId(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCommitAdjustment(adjustmentItemId)}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Confirm & Adjust Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
