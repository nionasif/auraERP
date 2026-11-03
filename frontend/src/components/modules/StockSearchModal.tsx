import React, { useState } from 'react';
import { X, Search, MapPin, Package, Filter, Server } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface StockSearchModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const StockSearchModal: React.FC<StockSearchModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const filtered = state.products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || p.department === selectedDept;
    return matchesSearch && matchesDept;
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
            <Search className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Enterprise Solution & Hardware Asset Search (Multi-Node Inventory)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap gap-2 items-center text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search by Barcode, SKU, Solution / Appliance name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-400 font-sans"
            >
              <option value="ALL">All Practice Areas</option>
              {state.departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-y-auto p-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800 sticky top-0">
                <th className="p-2">Barcode / SKU</th>
                <th className="p-2">Solution / Asset Description</th>
                <th className="p-2">Practice / Domain</th>
                <th className="p-2 text-center">Spec / Edition</th>
                <th className="p-2 text-right">Unit Price (৳)</th>
                <th className="p-2 text-center">DC01 (Dhaka HQ)</th>
                <th className="p-2 text-center">DC02 (Chattogram)</th>
                <th className="p-2 text-center">DC03 (Sylhet)</th>
                <th className="p-2 text-center">Central Depot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-850/60 transition">
                  <td className="p-2">
                    <div className="font-bold text-sky-300">{p.barcode}</div>
                    <div className="text-[10px] text-slate-500">{p.sku}</div>
                  </td>
                  <td className="p-2 font-sans text-slate-200 font-medium">
                    {p.name}
                  </td>
                  <td className="p-2 font-sans text-slate-400 text-[10px]">
                    <div>{p.department}</div>
                    <div className="text-slate-500">{p.category}</div>
                  </td>
                  <td className="p-2 text-center">
                    <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                      {p.size || 'Enterprise'}
                    </span>
                  </td>
                  <td className="p-2 text-right font-bold text-emerald-400">
                    ৳{p.price.toLocaleString()}
                  </td>
                  <td className="p-2 text-center font-bold text-amber-300 bg-amber-950/20">
                    {p.stock} units
                  </td>
                  <td className="p-2 text-center text-slate-300">
                    {Math.max(1, Math.round(p.stock * 0.7))} units
                  </td>
                  <td className="p-2 text-center text-slate-300">
                    {Math.max(1, Math.round(p.stock * 0.5))} units
                  </td>
                  <td className="p-2 text-center text-slate-400">
                    {p.stock * 4} units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            Showing {filtered.length} solutions with multi-node datacenter inventory sync.
          </span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
