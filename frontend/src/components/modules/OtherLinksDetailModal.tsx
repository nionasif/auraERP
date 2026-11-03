import React, { useMemo, useState } from 'react';
import {
  X,
  TrendingUp,
  Receipt,
  Clock,
  ArrowRightLeft,
  Trash2,
  Bell,
  CheckSquare,
  Gift,
  DollarSign,
  Settings,
  Shield,
  Layers,
  Server,
  Users,
  Wrench,
  AlertTriangle,
  LineChart,
  CheckCircle2,
  Database,
  Network,
  Cpu,
  ExternalLink,
  Lock,
  Radio
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface OtherLinksDetailModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const OtherLinksDetailModal: React.FC<OtherLinksDetailModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const payload = state.modalPayload || {};
  const title = payload.title || 'Enterprise Management Deep Dive';
  const type = payload.type || 'DEFAULT';

  // State for interactive checklists
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-1': true,
    'task-2': true,
  });

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Group invoices by date for SALES_GROWTH
  const dateGroups = useMemo(() => {
    const groups: Record<string, { count: number; total: number }> = {};
    state.invoices.forEach((inv) => {
      const d = (inv.date || inv.issueDate || inv.createdAt || '').slice(0, 10) || '2023-08-14';
      if (!groups[d]) groups[d] = { count: 0, total: 0 };
      groups[d].count += 1;
      groups[d].total += Number(inv.grandTotal || 0);
    });
    const sortedDates = Object.keys(groups).sort().reverse();
    return sortedDates.map((date, idx) => {
      const cur = groups[date];
      const nextDate = sortedDates[idx + 1];
      const prevTotal = nextDate ? groups[nextDate].total : cur.total * 0.88;
      const growthPct = prevTotal > 0 ? Number((((cur.total - prevTotal) / prevTotal) * 100).toFixed(1)) : 12.5;
      return {
        date,
        count: cur.count,
        total: cur.total,
        target: Math.round(cur.total * 1.15),
        growthPct,
      };
    });
  }, [state.invoices]);

  // Overall invoice calculations
  const totalRevenue = useMemo(() => {
    return state.invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  }, [state.invoices]);

  const topInvoices = useMemo(() => {
    return [...state.invoices]
      .sort((a, b) => (Number(b.grandTotal) || 0) - (Number(a.grandTotal) || 0))
      .slice(0, 10);
  }, [state.invoices]);

  const topTenTotal = useMemo(() => {
    return topInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  }, [topInvoices]);

  const averageACV = state.invoices.length > 0 ? Math.round(totalRevenue / state.invoices.length) : 0;
  const maxInvoice = state.invoices.length > 0 ? Math.max(...state.invoices.map((i) => Number(i.grandTotal) || 0)) : 0;
  const minInvoice = state.invoices.length > 0 ? Math.min(...state.invoices.map((i) => Number(i.grandTotal) || 0)) : 0;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">{title}</h3>
              <p className="text-[10px] text-slate-400 font-mono">DC01 Silicon Tower Tech Hub • Realtime Analytics Ledger</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Modal Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs font-sans">
          {/* 1. Day Wise Contract Revenue Growth */}
          {type === 'SALES_GROWTH' && (
            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Analyzed Ledger Total</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">৳{totalRevenue.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">{state.invoices.length} Enterprise Invoices</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Average Daily Velocity</div>
                  <div className="text-base font-bold text-amber-400 mt-1">
                    ৳{dateGroups.length > 0 ? Math.round(totalRevenue / dateGroups.length).toLocaleString() : '0'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Across {dateGroups.length} Active Billing Days</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Net Trajectory Trend</div>
                  <div className="text-base font-bold text-sky-400 mt-1">+18.4% YoY</div>
                  <div className="text-[10px] text-emerald-400 font-sans mt-0.5">Exceeding Annualized Targets</div>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Billing Date</th>
                      <th className="p-2.5 text-center">Invoices / SOWs</th>
                      <th className="p-2.5 text-right">Billed Revenue</th>
                      <th className="p-2.5 text-right">Target Benchmark</th>
                      <th className="p-2.5 text-center">Day Growth</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    {dateGroups.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-2.5 text-amber-300 font-bold">{row.date}</td>
                        <td className="p-2.5 text-center text-slate-200">{row.count} SOWs</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">৳{row.total.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-slate-400">৳{row.target.toLocaleString()}</td>
                        <td className="p-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.growthPct >= 0
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          }`}>
                            {row.growthPct >= 0 ? `+${row.growthPct}%` : `${row.growthPct}%`}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-sans">
                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Top 10 High-Value Invoices */}
          {type === 'TOP_INVOICES' && (
            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Top 10 Value Aggregate</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">৳{topTenTotal.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                    {totalRevenue > 0 ? ((topTenTotal / totalRevenue) * 100).toFixed(1) : 0}% of Total Ledger
                  </div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Largest Single Contract</div>
                  <div className="text-base font-bold text-amber-400 mt-1">৳{maxInvoice.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Enterprise Cloud Migration SOW</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase font-sans">Average Top-10 Deal Size</div>
                  <div className="text-base font-bold text-sky-400 mt-1">
                    ৳{topInvoices.length > 0 ? Math.round(topTenTotal / topInvoices.length).toLocaleString() : '0'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Tier 1 Key Corporate Accounts</div>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Rank</th>
                      <th className="p-2.5">Invoice #</th>
                      <th className="p-2.5">Corporate Client</th>
                      <th className="p-2.5 text-center">Deliverables</th>
                      <th className="p-2.5">Settlement Mode</th>
                      <th className="p-2.5 text-right">Contract Value</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    {topInvoices.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-2.5 font-bold text-amber-400">#{idx + 1}</td>
                        <td className="p-2.5 text-slate-200 font-bold">{item.invoiceNo}</td>
                        <td className="p-2.5 text-slate-300 font-sans font-medium">{item.customer?.name || 'Enterprise Client Corp'}</td>
                        <td className="p-2.5 text-center text-slate-400">{item.items?.length || 1} units</td>
                        <td className="p-2.5 text-slate-300 font-sans">
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                            {item.paymentMethod || 'Corporate Wire'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-emerald-400">
                          ৳{(Number(item.grandTotal) || 0).toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center font-sans">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                            Cleared
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Wire & Escrow Transfer Log */}
          {type === 'CASH_TRANSFER' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center space-x-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                  <span>Corporate Treasury Settlement & Escrow Vault Clearance</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Real-time synchronization log of Desk #901 shift receipts, automated bank BEFTN/RTGS wires, and treasury vault allocations.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Batch Ref</th>
                      <th className="p-2.5">Channel / Gateway</th>
                      <th className="p-2.5">Destination Account</th>
                      <th className="p-2.5 text-right">Cleared Amount</th>
                      <th className="p-2.5 text-center">Auth Lead</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-300 font-bold">SETTL-901-01</td>
                      <td className="p-2.5 text-slate-200 font-sans">Desk #901 Terminal Vault Drop</td>
                      <td className="p-2.5 text-slate-400">Vault-DC01-Safe-A</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳{Math.round(totalRevenue * 0.45).toLocaleString()}</td>
                      <td className="p-2.5 text-center text-slate-300 font-sans">USR-001</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Settled
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-300 font-bold">WIRE-BEFTN-402</td>
                      <td className="p-2.5 text-slate-200 font-sans">Standard Chartered Corporate Wire</td>
                      <td className="p-2.5 text-slate-400">SCB-Main-Ledger-884</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳{Math.round(totalRevenue * 0.30).toLocaleString()}</td>
                      <td className="p-2.5 text-center text-slate-300 font-sans">Finance Mgr</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Settled
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-300 font-bold">ESC-RTGS-819</td>
                      <td className="p-2.5 text-slate-200 font-sans">City Bank Escrow Retainer Wire</td>
                      <td className="p-2.5 text-slate-400">CBL-Escrow-Trust-01</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳{Math.round(totalRevenue * 0.15).toLocaleString()}</td>
                      <td className="p-2.5 text-center text-slate-300 font-sans">Super Admin</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Settled
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-300 font-bold">MFS-CORP-552</td>
                      <td className="p-2.5 text-slate-200 font-sans">bKash/Nagad Enterprise Merchant</td>
                      <td className="p-2.5 text-slate-400">MFS-Commercial-Node</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳{Math.round(totalRevenue * 0.10).toLocaleString()}</td>
                      <td className="p-2.5 text-center text-slate-300 font-sans">System Auto</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Settled
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. AuraTech Developer Portal & System Status */}
          {type === 'PORTAL' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center space-x-1.5">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>AuraTech Architecture Blueprints & Microservices Health</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Real-time operational status of backend services, PyTorch predictive engines, and datacenter synchronization fabrics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-sans font-bold text-slate-200">
                    <span className="flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span>Python ML Analytics Core</span>
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                      Operational
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>• Port: <strong>8000</strong> (FastAPI / Uvicorn)</div>
                    <div>• Predictive Model: <strong>v2.4 (PyTorch / Scikit-learn)</strong></div>
                    <div>• Latency: <strong>8.4ms</strong> • Status: <strong>Warm Cache</strong></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-sans font-bold text-slate-200">
                    <span className="flex items-center space-x-1.5">
                      <Database className="w-4 h-4 text-sky-400" />
                      <span>FastAPI Relational Backend</span>
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                      Operational
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>• Port: <strong>8001</strong> (FastAPI Core Server)</div>
                    <div>• Master DB: <strong>SQLite Enterprise / JSON Node</strong></div>
                    <div>• Latency: <strong>5.2ms</strong> • Connection Pool: <strong>Optimal</strong></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-sans font-bold text-slate-200">
                    <span className="flex items-center space-x-1.5">
                      <Network className="w-4 h-4 text-amber-400" />
                      <span>Express POS Sync Node</span>
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                      Operational
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>• Port: <strong>5000</strong> (Node.js Express / WS)</div>
                    <div>• Realtime Sync: <strong>Desk #901 Streaming Active</strong></div>
                    <div>• Active Sockets: <strong>1 Connection</strong></div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-sans font-bold text-slate-200">
                    <span className="flex items-center space-x-1.5">
                      <Lock className="w-4 h-4 text-purple-400" />
                      <span>Zero-Trust Security & RBAC</span>
                    </span>
                    <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[10px]">
                      Enforced
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>• Encryption: <strong>TLS 1.3 Enterprise AES-256</strong></div>
                    <div>• Role Guard: <strong>Deactivated Revoked Roles</strong></div>
                    <div>• Audit Trail: <strong>SHA-256 Signed Entries</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Engineering Sprints & SOPs */}
          {type === 'TASKS' && (
            <div className="space-y-3 font-sans">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center space-x-1.5">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Engineering Sprints, Datacenter Incidents & Daily SOPs</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Daily checklists for Lead Solutions Architects, Desk Controllers, and Systems Engineering Teams at DC01.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'task-1', title: 'Verify automated daily database snapshot and replication to secondary hot-node', priority: 'CRITICAL', owner: 'USR-001 (Super Admin)' },
                  { id: 'task-2', title: 'Reconcile Desk #901 POS cash drawer and corporate wire batches against vault', priority: 'HIGH', owner: 'Lead Terminal Specialist' },
                  { id: 'task-3', title: 'Review outstanding SOW deliverables and customer SLA credit redemptions', priority: 'HIGH', owner: 'Finance Lead' },
                  { id: 'task-4', title: 'Execute PyTorch ML performance appraisal retraining on active employee logs', priority: 'MEDIUM', owner: 'AI Engineering Team' },
                  { id: 'task-5', title: 'Inspect DC01 Zone A compute cluster thermal compliance and cold-aisle HVAC', priority: 'MEDIUM', owner: 'NOC Controller' },
                  { id: 'task-6', title: 'Renew SSL/TLS intermediate certificates for regional datacenter uplink', priority: 'NORMAL', owner: 'Infrastructure Lead' },
                ].map((task) => {
                  const isDone = !!completedTasks[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        isDone
                          ? 'bg-slate-950/40 border-slate-850 text-slate-400'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                          isDone ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-900'
                        }`}>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className={`text-xs font-medium ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Assigned to: {task.owner}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                        task.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. SLA Credits Redemption */}
          {type === 'REDEMPTION' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center space-x-1.5">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Enterprise SLA Warranty & Retainer Credits Audit</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Summary of client SLA tier guarantee credits and milestone vouchers redeemed against billable invoices today.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 font-sans text-[10px] uppercase">SLA Retainer Credits Available</div>
                  <div className="text-amber-400 font-bold text-base mt-1">42,500 pts</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Across 12 Partner Accounts</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 font-sans text-[10px] uppercase">Rebate Value Redeemed</div>
                  <div className="text-emerald-400 font-bold text-base mt-1">৳425,000</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Authorized Against Billed Invoices</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 font-sans text-[10px] uppercase">Compliance Guarantee Status</div>
                  <div className="text-sky-400 font-bold text-base mt-1">100% Satisfied</div>
                  <div className="text-[10px] text-emerald-400 font-sans mt-0.5">0 Unresolved SLA Penalties</div>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Corporate Client</th>
                      <th className="p-2.5">SLA Tier</th>
                      <th className="p-2.5 text-center">Credits Redeemed</th>
                      <th className="p-2.5 text-right">BDT Credit Value</th>
                      <th className="p-2.5 text-center">Linked SOW</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-200 font-bold font-sans">Unity Telecom Corp</td>
                      <td className="p-2.5 text-amber-300 font-sans">Platinum Tier</td>
                      <td className="p-2.5 text-center text-slate-300">15,000 pts</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳150,000</td>
                      <td className="p-2.5 text-center text-sky-400">INV-2023-0109</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Authorized
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-200 font-bold font-sans">Apex Cloud Holdings</td>
                      <td className="p-2.5 text-amber-300 font-sans">Gold Tier</td>
                      <td className="p-2.5 text-center text-slate-300">12,000 pts</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳120,000</td>
                      <td className="p-2.5 text-center text-sky-400">INV-2023-0425</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Authorized
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-200 font-bold font-sans">BanglaNet Backbone</td>
                      <td className="p-2.5 text-amber-300 font-sans">Gold Tier</td>
                      <td className="p-2.5 text-center text-slate-300">8,500 pts</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳85,000</td>
                      <td className="p-2.5 text-center text-sky-400">INV-2023-0717</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Authorized
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-200 font-bold font-sans">Silicon Tech Partners</td>
                      <td className="p-2.5 text-amber-300 font-sans">Silver Tier</td>
                      <td className="p-2.5 text-center text-slate-300">7,000 pts</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳70,000</td>
                      <td className="p-2.5 text-center text-sky-400">INV-2023-0814</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          Authorized
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. Average Contract Value (ACV) */}
          {type === 'AVG_INVOICE' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Annual Contract Value (ACV) & Retainer Deal Velocity</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Enterprise revenue distribution metrics and billable deliverable averages across all active client contracts.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-sans text-[10px] uppercase">Average SOW ACV</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">৳{averageACV.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Per Contract Delivery</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-sans text-[10px] uppercase">Highest Contract Value</div>
                  <div className="text-base font-bold text-amber-400 mt-1">৳{maxInvoice.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Cloud Migration SOW</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-sans text-[10px] uppercase">Smallest Retainer SOW</div>
                  <div className="text-base font-bold text-slate-300 mt-1">৳{minInvoice.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Standard Maintenance</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="text-slate-400 font-sans text-[10px] uppercase">Deliverables / Deal</div>
                  <div className="text-base font-bold text-sky-400 mt-1">
                    {state.invoices.length > 0
                      ? (state.invoices.reduce((s, i) => s + (i.items?.length || 1), 0) / state.invoices.length).toFixed(1)
                      : '0'} Units
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans mt-0.5">Average Scope Units</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-200 font-bold font-sans text-xs">Contract Value Tier Distribution</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-amber-400 font-bold">Tier 1: Enterprise (&gt;৳10,000,000)</div>
                    <div className="text-slate-300 mt-1">
                      {state.invoices.filter((i) => Number(i.grandTotal || 0) >= 10000000).length} Contracts Booked
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-sky-400 font-bold">Tier 2: Mid-Market (৳3M - ৳10M)</div>
                    <div className="text-slate-300 mt-1">
                      {state.invoices.filter((i) => Number(i.grandTotal || 0) >= 3000000 && Number(i.grandTotal || 0) < 10000000).length} Contracts Booked
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <div className="text-emerald-400 font-bold">Tier 3: Standard (&lt;৳3,000,000)</div>
                    <div className="text-slate-300 mt-1">
                      {state.invoices.filter((i) => Number(i.grandTotal || 0) < 3000000).length} Contracts Booked
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. Last Day Node Comparison */}
          {type === 'LAST_DAY' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1">
                  Last Day Tech Node & Regional Hub Revenue Comparison
                </div>
                <p className="text-slate-400 text-[11px]">
                  Cross-hub benchmarking across active AuraTech datacenter nodes, edge points-of-presence, and secondary engineering sites.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Datacenter / Node Name</th>
                      <th className="p-2.5">Facility Location</th>
                      <th className="p-2.5 text-right">Current Revenue</th>
                      <th className="p-2.5 text-right">Previous Day</th>
                      <th className="p-2.5 text-center">Variance</th>
                      <th className="p-2.5 text-center">Network Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-amber-300 font-sans">DC01 Silicon Tower (Primary Hub)</td>
                      <td className="p-2.5 text-slate-400 font-sans">Gulshan-2, Dhaka</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳{totalRevenue.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-slate-300">৳{Math.round(totalRevenue * 0.91).toLocaleString()}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-400">+9.9%</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          100% Online
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-200 font-sans">DC02 Agrabad Port Node</td>
                      <td className="p-2.5 text-slate-400 font-sans">Agrabad C/A, Chittagong</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳142,500,000</td>
                      <td className="p-2.5 text-right text-slate-300">৳131,200,000</td>
                      <td className="p-2.5 text-center font-bold text-emerald-400">+8.6%</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          99.98% Online
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-200 font-sans">DC03 Sylhet Silicon IT Park</td>
                      <td className="p-2.5 text-slate-400 font-sans">Companyganj, Sylhet</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳86,400,000</td>
                      <td className="p-2.5 text-right text-slate-300">৳82,000,000</td>
                      <td className="p-2.5 text-center font-bold text-emerald-400">+5.4%</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                          99.99% Online
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-200 font-sans">DC04 Uttara Disaster Recovery</td>
                      <td className="p-2.5 text-slate-400 font-sans">Sector 4, Uttara, Dhaka</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">৳52,242,600</td>
                      <td className="p-2.5 text-right text-slate-300">৳50,000,000</td>
                      <td className="p-2.5 text-center font-bold text-emerald-400">+4.5%</td>
                      <td className="p-2.5 text-center font-sans">
                        <span className="bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded text-[10px]">
                          Hot Standby
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. Hourly Billing Trajectory Detail */}
          {type === 'HOURLY' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Hourly Billing Trajectory & Ticket Velocity</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Granular hourly breakdown of invoiced revenue and customer transaction completions during the operational shift.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Time Interval</th>
                      <th className="p-2.5 text-right">Invoiced Revenue</th>
                      <th className="p-2.5 text-center">Transactions</th>
                      <th className="p-2.5 text-center">Deliverables</th>
                      <th className="p-2.5 text-center">Shift Share</th>
                      <th className="p-2.5 text-center">Traffic Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    {[
                      { hour: '10:00 AM', amt: Math.round(totalRevenue * 0.04), txns: 2, items: 3, share: '4%' },
                      { hour: '11:00 AM', amt: Math.round(totalRevenue * 0.08), txns: 4, items: 5, share: '8%' },
                      { hour: '12:00 PM', amt: Math.round(totalRevenue * 0.12), txns: 6, items: 7, share: '12%' },
                      { hour: '01:00 PM', amt: Math.round(totalRevenue * 0.16), txns: 8, items: 9, share: '16%' },
                      { hour: '02:00 PM', amt: Math.round(totalRevenue * 0.14), txns: 7, items: 8, share: '14%' },
                      { hour: '03:00 PM', amt: Math.round(totalRevenue * 0.11), txns: 5, items: 6, share: '11%' },
                      { hour: '04:00 PM', amt: Math.round(totalRevenue * 0.13), txns: 6, items: 7, share: '13%' },
                      { hour: '05:00 PM', amt: Math.round(totalRevenue * 0.09), txns: 4, items: 5, share: '9%' },
                      { hour: '06:00 PM', amt: Math.round(totalRevenue * 0.06), txns: 3, items: 4, share: '6%' },
                      { hour: '07:00 PM', amt: Math.round(totalRevenue * 0.04), txns: 2, items: 3, share: '4%' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-amber-300 font-bold">{row.hour}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">৳{row.amt.toLocaleString()}</td>
                        <td className="p-2.5 text-center text-slate-200">{row.txns} SOWs</td>
                        <td className="p-2.5 text-center text-slate-300">{row.items} units</td>
                        <td className="p-2.5 text-center text-sky-400 font-bold">{row.share}</td>
                        <td className="p-2.5 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            row.txns >= 7
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {row.txns >= 7 ? 'Peak Volume' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. Void & Reversal Audit Trail */}
          {type === 'DELETED' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-rose-400 font-bold text-sm mb-1 flex items-center space-x-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Void Invoices & Billing Reversal Audit Trail</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Zero-trust cryptographic audit trail for supervisor-authorized bill reversals, invoice corrections, and credit memo issues.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Audit Event ID</th>
                      <th className="p-2.5">Original Invoice</th>
                      <th className="p-2.5">Correction Reason</th>
                      <th className="p-2.5 text-right">Adjusted Amount</th>
                      <th className="p-2.5 text-center">Authorized By</th>
                      <th className="p-2.5">Crypto Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-rose-400 font-bold">VOID-2023-042</td>
                      <td className="p-2.5 text-slate-200">INV-2023-0089</td>
                      <td className="p-2.5 text-slate-300 font-sans">Duplicate SLA retainer bill correction</td>
                      <td className="p-2.5 text-right font-bold text-rose-400">-৳125,000</td>
                      <td className="p-2.5 text-center text-slate-300 font-sans">USR-001 (Super Admin)</td>
                      <td className="p-2.5 text-slate-500 text-[10px] truncate max-w-[90px]">sha256:7f8e12a...</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-rose-400 font-bold">VOID-2023-039</td>
                      <td className="p-2.5 text-slate-200">SOW-2023-0041</td>
                      <td className="p-2.5 text-slate-300 font-sans">Deliverable scope revision by Unity Telecom</td>
                      <td className="p-2.5 text-right font-bold text-rose-400">-৳450,000</td>
                      <td className="p-2.5 text-center text-slate-300 font-sans">USR-001 (Super Admin)</td>
                      <td className="p-2.5 text-slate-500 text-[10px] truncate max-w-[90px]">sha256:3a1bc89...</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-rose-400 font-bold">VOID-2023-035</td>
                      <td className="p-2.5 text-slate-200">POS-2023-0012</td>
                      <td className="p-2.5 text-slate-300 font-sans">Defective hardware transceiver returned to vault</td>
                      <td className="p-2.5 text-right font-bold text-rose-400">-৳82,000</td>
                      <td className="p-2.5 text-center text-slate-300 font-sans">USR-001 (Super Admin)</td>
                      <td className="p-2.5 text-slate-500 text-[10px] truncate max-w-[90px]">sha256:9c4df01...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. Registers Audit View */}
          {type === 'REGISTERS' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1">
                  Terminal Cash Register Status & Drawer Audit
                </div>
                <p className="text-slate-400 text-[11px]">
                  Physical drawer balances, network IP addresses, and shift assignments across all 5 datacenter terminals.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Terminal Desk</th>
                      <th className="p-2.5">Assigned Specialist</th>
                      <th className="p-2.5 text-right">Total Revenue</th>
                      <th className="p-2.5 text-right">Cash Balance</th>
                      <th className="p-2.5 text-right">Card Clearance</th>
                      <th className="p-2.5 text-right">MFS Digital</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    {[
                      { desk: 'Desk-901', lead: 'System Administrator (USR-001)', rev: totalRevenue, cash: Math.round(totalRevenue * 0.45), card: Math.round(totalRevenue * 0.35), mfs: Math.round(totalRevenue * 0.20), status: 'OPEN' },
                      { desk: 'Desk-902', lead: 'Lead Terminal Specialist', rev: 0, cash: 0, card: 0, mfs: 0, status: 'CLOSED' },
                      { desk: 'Desk-903', lead: 'NOC Controller', rev: 0, cash: 0, card: 0, mfs: 0, status: 'CLOSED' },
                      { desk: 'Desk-904', lead: 'Enterprise Billing Rep', rev: 0, cash: 0, card: 0, mfs: 0, status: 'CLOSED' },
                      { desk: 'Desk-905', lead: 'Unassigned Reserve Terminal', rev: 0, cash: 0, card: 0, mfs: 0, status: 'CLOSED' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-amber-300 font-bold">{row.desk}</td>
                        <td className="p-2.5 text-slate-300 font-sans">{row.lead}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">৳{row.rev.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-slate-200">৳{row.cash.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-slate-400">৳{row.card.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-slate-400">৳{row.mfs.toLocaleString()}</td>
                        <td className="p-2.5 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'OPEN'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 12. Departments / Practice Line Deep Dive */}
          {(type === 'DEPARTMENTS' || type === 'CONTRIBUTION') && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans">
                <div className="text-amber-400 font-bold text-sm mb-1">
                  Practice Line Revenue & Delivery Performance Deep Dive
                </div>
                <p className="text-slate-400 text-[11px]">
                  Breakdown of billable deliverables, realized contract revenue, and target benchmark attainment across practice divisions.
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Practice Division</th>
                      <th className="p-2.5 text-center">Deliverables</th>
                      <th className="p-2.5 text-right">Realized Revenue</th>
                      <th className="p-2.5 text-right">Target Benchmark</th>
                      <th className="p-2.5 text-center">Growth Trajectory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono text-[11px]">
                    {[
                      { code: 'CLD-IN', name: 'Cloud Infrastructure & DevOps', qty: 13, sales: Math.round(totalRevenue * 0.26), target: Math.round(totalRevenue * 0.26 * 1.2), growth: '+14.2%' },
                      { code: 'DEV-CS', name: 'Custom Software & Web Engineering', qty: 11, sales: Math.round(totalRevenue * 0.22), target: Math.round(totalRevenue * 0.22 * 1.2), growth: '+11.8%' },
                      { code: 'CYB-SC', name: 'Cybersecurity & Compliance Auditing', qty: 8, sales: Math.round(totalRevenue * 0.16), target: Math.round(totalRevenue * 0.16 * 1.2), growth: '+15.4%' },
                      { code: 'AI-DAT', name: 'AI, Machine Learning & Big Data', qty: 7, sales: Math.round(totalRevenue * 0.14), target: Math.round(totalRevenue * 0.14 * 1.2), growth: '+18.9%' },
                      { code: 'ENT-SA', name: 'Enterprise SaaS & ERP Solutions', qty: 4, sales: Math.round(totalRevenue * 0.09), target: Math.round(totalRevenue * 0.09 * 1.2), growth: '+8.5%' },
                      { code: 'MGD-IT', name: '24/7 Managed IT Support & NOC', qty: 3, sales: Math.round(totalRevenue * 0.06), target: Math.round(totalRevenue * 0.06 * 1.2), growth: '+6.2%' },
                      { code: 'APP-MO', name: 'Mobile App Engineering (iOS & Android)', qty: 2, sales: Math.round(totalRevenue * 0.04), target: Math.round(totalRevenue * 0.04 * 1.2), growth: '+5.0%' },
                      { code: 'IT-CON', name: 'Digital Transformation & IT Consulting', qty: 1, sales: Math.round(totalRevenue * 0.03), target: Math.round(totalRevenue * 0.03 * 1.2), growth: '+4.1%' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-amber-400 font-bold">{row.code}</td>
                        <td className="p-2.5 text-slate-200 font-sans font-medium">{row.name}</td>
                        <td className="p-2.5 text-center text-slate-300">{row.qty} units</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">৳{row.sales.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-slate-400">৳{row.target.toLocaleString()}</td>
                        <td className="p-2.5 text-center text-emerald-400 font-bold">{row.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Catch-all for default subsystem links */}
          {['DEFAULT', 'SETUP', 'STORING', 'REQUISITION', 'ECOMMERCE', 'CRM', 'REPORT', 'BAG', 'ADMIN', 'DAMAGE', 'REPAIR', 'STAFF', 'AUDIT', 'BI', 'LOGOUT'].includes(type) && (
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 font-sans">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                <Settings className="w-4 h-4" />
                <span>Enterprise Subsystem: {title}</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                This operational subsystem is fully linked to the <strong>DC01 AuraTech Central Enterprise Engine</strong>. All SLA agreements, asset inventories, diagnostic logs, and billing ledgers are synchronized across datacenter nodes in real time.
              </p>
              <div className="p-3 bg-slate-900 rounded border border-slate-750 font-mono text-[11px] text-slate-300 space-y-1">
                <div>• Connected Node: DC01-Silicon-Tower-Tech-Hub</div>
                <div>• Central Server: cdc.auratech.internal:8443</div>
                <div>• Master Ledger: Active & Verified (SHA-256)</div>
                <div>• Encryption: TLS 1.3 Enterprise AES-256</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Fabric Synchronized with DC01 Central DB</span>
          </div>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};