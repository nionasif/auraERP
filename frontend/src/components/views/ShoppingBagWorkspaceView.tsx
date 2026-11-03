import React, { useState } from 'react';
import {
  Package,
  Plus,
  CheckCircle,
  Truck,
  ChevronRight,
  Store,
  DollarSign,
  X,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface ShoppingBagWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const ShoppingBagWorkspaceView: React.FC<ShoppingBagWorkspaceViewProps> = ({ store }) => {
  const { state, setView, receiveBags } = store;
  const [selectedBagId, setSelectedBagId] = useState<string>('BAG-01');
  const [addQty, setAddQty] = useState<number>(500);
  const [successAdd, setSuccessAdd] = useState<boolean>(false);

  const handleReceiveStock = (e: React.FormEvent) => {
    e.preventDefault();
    receiveBags(selectedBagId, addQty);
    setSuccessAdd(true);
    setTimeout(() => setSuccessAdd(false), 2500);
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Breadcrumb Header */}
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
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Hardware Consumables, Patch Kits & Provisioning Media</span>
          </span>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {state.bagInventory.map(bag => (
            <div key={bag.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="font-bold text-amber-300 text-xs">৳{bag.charge} / kit</span>
                <span className="text-[10px] text-slate-400 font-sans">{bag.size}</span>
              </div>
              <div className="font-semibold text-slate-100 text-xs font-sans line-clamp-1">{bag.name}</div>

              <div className="pt-1 border-t border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Datacenter Vault Buffer:</span>
                  <span className="text-slate-200 font-bold">{bag.warehouseStock.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Server Hall Racks:</span>
                  <span className="text-emerald-400 font-bold">{bag.floorStock} units</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Provisioned Today:</span>
                  <span className="text-amber-400 font-bold">{bag.todayDispensed} units</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Receive Consumables Delivery from Supplier */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5 max-w-xl">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Intake Hardware Consumables from OEM Supplier</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Receive shipments of fiber patch cords, drive trays, or cable kits into DC01 storage vault.
            </p>
          </div>

          {successAdd && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded flex items-center space-x-2 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Successfully added {addQty} units into vault inventory buffer!</span>
            </div>
          )}

          <form onSubmit={handleReceiveStock} className="space-y-3 text-xs font-sans">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Hardware Consumable Item *</label>
              <select
                value={selectedBagId}
                onChange={(e) => setSelectedBagId(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              >
                {state.bagInventory.map(bag => (
                  <option key={bag.id} value={bag.id}>
                    {bag.name} ({bag.size}) - Vault Stock: {bag.warehouseStock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Quantity Received from Supplier *</label>
              <input
                type="number"
                min="10"
                step="10"
                value={addQty}
                onChange={(e) => setAddQty(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Receive into Vault Buffer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
