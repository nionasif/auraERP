import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  Send,
  Server,
  Sparkles
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface RequisitionModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const RequisitionModal: React.FC<RequisitionModalProps> = ({ store }) => {
  const { state, closeModal, createRequisition, applyMLSmartRequisitions } = store;
  const [department, setDepartment] = useState<string>("Cloud & DevOps");
  const [itemCount, setItemCount] = useState<number>(10);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('URGENT');
  const [notes, setNotes] = useState<string>('Upcoming enterprise client cluster expansion hardware buffer.');
  const [submittedAlert, setSubmittedAlert] = useState<boolean>(false);
  const [mlSuccessAlert, setMlSuccessAlert] = useState<boolean>(false);

  const handleApplyML = () => {
    applyMLSmartRequisitions();
    setMlSuccessAlert(true);
    setTimeout(() => setMlSuccessAlert(false), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequisition({
      department,
      itemCount,
      priority,
      notes,
      estimatedValue: itemCount * 85000,
    });
    setSubmittedAlert(true);
    setTimeout(() => setSubmittedAlert(false), 2500);
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
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Infrastructure Hardware & License Requisition (DC01 to Central Procurement)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {submittedAlert && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Hardware / License Requisition transmitted to Central Procurement & OEM Supply!</span>
            </div>
          )}

          {/* New Requisition Form */}
          <form onSubmit={handleSubmit} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-3">
            <div className="text-slate-200 font-bold text-xs flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Submit New Tech Node Hardware Indent / Replenishment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Practice Area *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-amber-400 text-xs"
                >
                  {state.departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Units / Seats Required *</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Requisition Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-amber-400 text-xs"
                >
                  <option value="NORMAL">Normal (48h Lead Time)</option>
                  <option value="URGENT">Urgent (24h Lead Time)</option>
                  <option value="CRITICAL">Critical (Immediate SOW Dispatch)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Requisition Justification / Client SOW Reference:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cisco switches and SFP transceivers required for Apex TeleHealth hybrid cloud rollout..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Requisition to Central Procurement</span>
              </button>
            </div>
          </form>

          {/* Active Requisitions Table */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="text-slate-300 font-bold text-xs flex items-center space-x-2">
                <span>Active Datacenter Requisitions ({state.requisitions.length} Indents)</span>
                {mlSuccessAlert && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1 animate-pulse">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Python ML EOQ Indents Generated!</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleApplyML}
                className="px-3 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-[11px] font-semibold flex items-center space-x-1.5 transition shadow"
                title="Automatically calculate Economic Order Quantity & Safety Stock recommendations from Python ML Core"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI/ML Smart Reorder (Wilson EOQ)</span>
              </button>
            </div>
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="p-2">Req No.</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Practice Area</th>
                  <th className="p-2 text-center">Units</th>
                  <th className="p-2 text-right">Est. Value</th>
                  <th className="p-2 text-center">Priority</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {state.requisitions.map(r => (
                  <tr key={r.id} className="hover:bg-slate-850/50">
                    <td className="p-2 font-bold text-amber-300">
                      <div className="flex items-center space-x-1">
                        <span>{r.reqNo}</span>
                        {r.notes?.includes('[AuraTech ML EOQ]') && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700 text-[9px] font-bold">
                            ML EOQ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-slate-400">{r.date}</td>
                    <td className="p-2 font-sans text-slate-200">{r.department}</td>
                    <td className="p-2 text-center font-bold text-slate-100">{r.itemCount}</td>
                    <td className="p-2 text-right text-emerald-400">৳{(r.estimatedValue || 0).toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : r.priority === 'URGENT' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className="bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded text-[10px]">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
