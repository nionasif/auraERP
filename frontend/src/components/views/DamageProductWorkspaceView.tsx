import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle,
  Truck,
  Wrench,
  Trash2,
  ChevronRight,
  Server,
  Tag,
  X
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface DamageProductWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const DamageProductWorkspaceView: React.FC<DamageProductWorkspaceViewProps> = ({ store }) => {
  const { state, setView, createDamageTicket } = store;

  const [selectedProductId, setSelectedProductId] = useState<string>(state.products[0]?.id || '');
  const [defectType, setDefectType] = useState<any>('HARDWARE_FAULT');
  const [actionTaken, setActionTaken] = useState<any>('IN_HOUSE_REPAIR');
  const [damageQty, setDamageQty] = useState<number>(1);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const selectedProduct = state.products.find(p => p.id === selectedProductId) || state.products[0];

  const handleCreateDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    createDamageTicket({
      productName: selectedProduct.name,
      barcode: selectedProduct.barcode,
      sku: selectedProduct.sku,
      reportedBy: `${state.storeInfo.currentUser.name} (Lead)`,
      defectType,
      quantity: damageQty,
      unitPrice: selectedProduct.price,
      actionTaken,
      status: actionTaken === 'IN_HOUSE_REPAIR' ? 'SENT_TO_LAB' : 'DISPATCHED_RTV',
    });
    setSuccessTicket(`DMG-${state.storeInfo.outletCode}-20260924-${(state.damageTickets.length + 5).toString().padStart(3, '0')}`);
    setTimeout(() => setSuccessTicket(null), 3500);
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
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Hardware RMA, Defective Assets & Vendor Claims Workspace</span>
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
        {/* Form to Log Damage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-rose-400" />
                <span>Log Hardware Defect & Quarantine Asset</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quarantine defective datacenter assets and route to In-House Lab Repair or OEM Vendor RMA.
              </p>
            </div>

            {successTicket && (
              <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg flex items-center space-x-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>RMA Ticket <strong>{successTicket}</strong> logged! Asset quarantined from active inventory.</span>
              </div>
            )}

            <form onSubmit={handleCreateDamage} className="space-y-3 text-xs font-sans">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Select Defective Hardware / Asset *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={state.products.length === 0}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-400 disabled:opacity-50"
                >
                  {state.products.length === 0 ? (
                    <option value="">No products available in catalog</option>
                  ) : (
                    state.products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name} (Stock: {p.stock} units, ৳{p.price})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Defect Classification *</label>
                  <select
                    value={defectType}
                    onChange={(e) => setDefectType(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-rose-400"
                  >
                    <option value="HARDWARE_FAULT">Hardware / Board Level Fault</option>
                    <option value="MEMORY_CORRUPTION">RAM / ECC Memory Channel Corruption</option>
                    <option value="PORT_FAILURE">Port / Transceiver Interface Burn</option>
                    <option value="CIRCUIT_DAMAGE">Power Supply Unit (PSU) Short Circuit</option>
                    <option value="FIRMWARE_CORRUPTION">Firmware / BIOS Flash Corruption</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Quarantine Action *</label>
                  <select
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-rose-400"
                  >
                    <option value="IN_HOUSE_REPAIR">Send to In-House Hardware Diagnostics Lab</option>
                    <option value="RETURN_TO_VENDOR">Return to OEM Vendor (RMA Warranty Claim)</option>
                    <option value="SCRAP_WRITE_OFF">Decommission & Write-Off Asset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Quantity Affected:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={damageQty}
                  onChange={(e) => setDamageQty(Number(e.target.value))}
                  className="w-24 p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedProduct}
                  className="w-full py-2.5 rounded bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed font-bold text-white transition flex items-center justify-center space-x-1.5 shadow"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{selectedProduct ? 'Log RMA & Quarantine Asset' : 'No Asset Selected'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Active Quarantine Tickets */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold text-sm text-slate-100 mb-2 flex items-center justify-between">
                <span>Active Quarantine & RMA Tickets ({state.damageTickets.length})</span>
                <span className="text-[10px] text-slate-400 font-mono">Real-time Tracker</span>
              </h3>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {state.damageTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-300">{ticket.ticketNo}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-sans font-bold ${
                        ticket.status === 'SENT_TO_LAB' || ticket.status === 'SENT_TO_TAILOR'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : ticket.status === 'DISPATCHED_RTV'
                          ? 'bg-sky-950 text-sky-400 border border-sky-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {ticket.status === 'SENT_TO_TAILOR' ? 'SENT_TO_LAB' : ticket.status}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-200 font-sans text-xs">
                      {ticket.productName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                      <span>Defect: <strong className="text-slate-200">{ticket.defectType.replace(/_/g, ' ')}</strong></span>
                      <span>Qty: <strong>{ticket.quantity}</strong> (৳{(ticket.quantity * ticket.unitPrice).toLocaleString()})</span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-sans flex items-center justify-between">
                      <span>Reported by: {ticket.reportedBy}</span>
                      <span>Action: {ticket.actionTaken.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
