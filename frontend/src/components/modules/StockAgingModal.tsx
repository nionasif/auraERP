import React, { useState } from 'react';
import { X, Clock, AlertTriangle, ArrowRight, Tag, Server } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface StockAgingModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const StockAgingModal: React.FC<StockAgingModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [agingFilter, setAgingFilter] = useState<'ALL' | 'FRESH' | 'MEDIUM' | 'SLOW' | 'CRITICAL'>('ALL');

  const filtered = state.products.filter(p => {
    if (agingFilter === 'FRESH') return p.agingDays <= 30;
    if (agingFilter === 'MEDIUM') return p.agingDays > 30 && p.agingDays <= 60;
    if (agingFilter === 'SLOW') return p.agingDays > 60 && p.agingDays <= 90;
    if (agingFilter === 'CRITICAL') return p.agingDays > 90;
    return true;
  });

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Aging Wise IT Hardware & License Analysis (DC01 Hub)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aging Range Filter Cards */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <button
            onClick={() => setAgingFilter('FRESH')}
            className={`p-2 rounded border text-left transition ${
              agingFilter === 'FRESH'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase font-sans">0 - 30 Days (Active Rotation)</div>
            <div className="text-base font-bold text-emerald-400 mt-1">
              {state.products.filter(p => p.agingDays <= 30).length} SKUs
            </div>
          </button>

          <button
            onClick={() => setAgingFilter('MEDIUM')}
            className={`p-2 rounded border text-left transition ${
              agingFilter === 'MEDIUM'
                ? 'bg-sky-950 border-sky-500 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase font-sans">31 - 60 Days (Standard Reserve)</div>
            <div className="text-base font-bold text-sky-400 mt-1">
              {state.products.filter(p => p.agingDays > 30 && p.agingDays <= 60).length} SKUs
            </div>
          </button>

          <button
            onClick={() => setAgingFilter('SLOW')}
            className={`p-2 rounded border text-left transition ${
              agingFilter === 'SLOW'
                ? 'bg-amber-950 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase font-sans">61 - 90 Days (Pre-Renewal Buffer)</div>
            <div className="text-base font-bold text-amber-400 mt-1">
              {state.products.filter(p => p.agingDays > 60 && p.agingDays <= 90).length} SKUs
            </div>
          </button>

          <button
            onClick={() => setAgingFilter('CRITICAL')}
            className={`p-2 rounded border text-left transition ${
              agingFilter === 'CRITICAL'
                ? 'bg-rose-950 border-rose-500 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase font-sans">90+ Days (Bundle / Promo)</div>
            <div className="text-base font-bold text-rose-400 mt-1">
              {state.products.filter(p => p.agingDays > 90).length} SKUs
            </div>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800 sticky top-0">
                <th className="p-2">SKU & Barcode / SN</th>
                <th className="p-2">Solution / Hardware Description</th>
                <th className="p-2">Practice Area</th>
                <th className="p-2 text-right">Price (৳)</th>
                <th className="p-2 text-center">Available Units</th>
                <th className="p-2 text-center">Aging Days</th>
                <th className="p-2 text-center">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-850/60 transition">
                  <td className="p-2">
                    <div className="text-slate-200 font-bold">{p.sku}</div>
                    <div className="text-[10px] text-slate-500">{p.barcode}</div>
                  </td>
                  <td className="p-2 font-sans font-medium text-slate-200">
                    {p.name}
                  </td>
                  <td className="p-2 font-sans text-slate-400">{p.department}</td>
                  <td className="p-2 text-right text-emerald-400 font-bold">৳{p.price.toLocaleString()}</td>
                  <td className="p-2 text-center font-bold text-slate-200">{p.stock}</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      p.agingDays > 90
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : p.agingDays > 60
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {p.agingDays} days
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {p.agingDays > 90 ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 text-[10px] font-sans font-semibold">
                        <Tag className="w-3 h-3" />
                        <span>SOW Bundled Promo</span>
                      </span>
                    ) : p.agingDays > 60 ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 text-[10px] font-sans font-semibold">
                        <span>Transfer to DC02 Hub</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px] font-sans">Active Deployment</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => setAgingFilter('ALL')}
            className="text-amber-400 hover:underline"
          >
            Show All Solution Inventory
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
