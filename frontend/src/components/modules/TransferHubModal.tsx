import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  Truck,
  Send,
  Navigation,
  Printer,
  CheckCircle,
  Clock,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface TransferHubModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const TransferHubModal: React.FC<TransferHubModalProps> = ({ store }) => {
  const { state, closeModal, createTransfer } = store;
  const [activeTab, setActiveTab] = useState<'NEW_STN' | 'FLEET_TRACK' | 'INCOMING'>('NEW_STN');
  const [destOutlet, setDestOutlet] = useState<string>('DC02 - Agrabad Tech Park (Chattogram)');
  const [selectedProductId, setSelectedProductId] = useState<string>(state.products[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(1);
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [successSTN, setSuccessSTN] = useState<string | null>(null);

  const selectedProduct = state.products.find(p => p.id === selectedProductId) || state.products[0];

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const stnSeq = `STN-DC01-${Date.now().toString().slice(-6)}`;
    createTransfer({
      fromOutlet: 'DC01 - Silicon Tower Tech Hub',
      toOutlet: destOutlet,
      itemsSummary: `${selectedProduct.name} (${transferQty} units)`,
      totalUnits: transferQty,
      totalValue: transferQty * selectedProduct.price,
      vehicleNo: vehicleNo || 'Standard Secure Logistics',
      driverName: driverName || 'Logistics Officer',
      driverPhone: driverPhone || 'N/A',
      eta: 'In Transit',
    });
    setSuccessSTN(stnSeq);
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
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Inter-Node Hardware Transfer (STN) & Datacenter Logistics
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 bg-slate-950 border-b border-slate-800 text-xs font-semibold select-none">
          <button
            onClick={() => { setActiveTab('NEW_STN'); setSuccessSTN(null); }}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'NEW_STN' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Outgoing STN</span>
          </button>

          <button
            onClick={() => setActiveTab('FLEET_TRACK')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'FLEET_TRACK' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Secure Fleet Radar ({state.transfers.filter(t => t.status === 'IN_TRANSIT').length} In-Transit)</span>
          </button>

          <button
            onClick={() => setActiveTab('INCOMING')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'INCOMING' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Node Inbounds & History</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {activeTab === 'NEW_STN' && (
            successSTN ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100 font-mono">HARDWARE STN GATE PASS GENERATED</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Datacenter Transfer Note <strong>{successSTN}</strong> authorized for secure chain-of-custody dispatch.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-left text-xs space-y-1.5 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination Node:</span>
                    <span className="text-slate-200">{destOutlet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carrier Vehicle:</span>
                    <span className="text-amber-300 font-bold">{vehicleNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Escort:</span>
                    <span className="text-slate-200">{driverName} ({driverPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dispatched Quantity:</span>
                    <span className="text-emerald-400 font-bold">{transferQty} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Asset Value:</span>
                    <span className="text-slate-100 font-bold">৳{(transferQty * selectedProduct.price).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Dispatch Gate Pass</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('FLEET_TRACK'); setSuccessSTN(null); }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    Track in Fleet Radar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDispatch} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Dispatching Source Node:</label>
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 font-bold">
                      DC01 - Silicon Tower Tech Hub (Dhaka HQ)
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Destination Datacenter Node *</label>
                    <select
                      value={destOutlet}
                      onChange={(e) => setDestOutlet(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                    >
                      <option value="DC02 - Agrabad Tech Park (Chattogram)">DC02 - Agrabad Tech Park (Chattogram)</option>
                      <option value="DC03 - Sylhet Hi-Tech Park">DC03 - Sylhet Hi-Tech Park</option>
                      <option value="DC04 - Rajshahi Cloud Gateway">DC04 - Rajshahi Cloud Gateway</option>
                      <option value="DC05 - Uttara Engineering Lab">DC05 - Uttara Engineering Lab</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Select Hardware / Solution to Transfer:</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={state.products.length === 0}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  >
                    {state.products.length === 0 ? (
                      <option value="">No products available in catalog</option>
                    ) : (
                      state.products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Available: {p.stock} units, ৳{p.price.toLocaleString()})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Quantity to Transfer:</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct?.stock || 1}
                      value={transferQty}
                      onChange={(e) => setTransferQty(Number(e.target.value))}
                      disabled={!selectedProduct}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-emerald-300 font-mono font-bold disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Total Asset Value:</label>
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-emerald-400 font-bold">
                      ৳{(transferQty * (selectedProduct?.price || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-sans">Transport Vehicle Plate *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka Metro-TA 11-4209"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-sans">Escort / Courier Officer *</label>
                    <input
                      type="text"
                      placeholder="e.g. Abul Kashem"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-sans">Contact Phone *</label>
                    <input
                      type="text"
                      placeholder="e.g. 01712-000000"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-600 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedProduct}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold flex items-center space-x-1.5 shadow"
                  >
                    <Send className="w-4 h-4" />
                    <span>{selectedProduct ? 'Authorize STN & Issue Gate Pass' : 'No Hardware Selected'}</span>
                  </button>
                </div>
              </form>
            )
          )}

          {activeTab === 'FLEET_TRACK' && (
            <div className="space-y-3 font-mono">
              <div className="text-[11px] text-slate-400 font-sans mb-1">
                Real-time transit status of secure equipment couriers between DC01 Silicon Tower and regional tech nodes:
              </div>

              {state.transfers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-sans text-xs bg-slate-950 border border-slate-800 rounded-lg">
                  No active fleet transfers registered. Dispatched STNs will appear here in real-time.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {state.transfers.map(trf => (
                    <div key={trf.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-amber-300 text-xs">{trf.stnNo}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-sans font-bold ${
                            trf.status === 'IN_TRANSIT' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-400'
                          }`}>
                            {trf.status}
                          </span>
                          <span className="text-slate-400 text-[10px]">ETA: {trf.eta}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-sans mt-1">
                          {trf.fromOutlet} → <strong className="text-slate-100">{trf.toOutlet}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Items: {trf.itemsSummary} • Vehicle: {trf.vehicleNo} ({trf.driverName} - {trf.driverPhone})
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-emerald-400 font-bold text-xs">৳{trf.totalValue.toLocaleString()}</span>
                        <div className="text-[10px] text-slate-500">{trf.totalUnits} Units</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'INCOMING' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-sans text-xs">
                <span className="text-slate-300 font-semibold">Incoming Hardware Transfers to DC01 Silicon Tower Hub:</span>
                <p className="text-slate-400 text-[11px] mt-1">
                  Transfers initiated by regional nodes currently in transit or already received into DC01 server inventory.
                </p>
              </div>

              <div className="p-8 text-center text-slate-500 font-sans text-xs bg-slate-950 border border-slate-800 rounded-lg">
                No incoming hardware transfers pending. Incoming dispatch notes will appear here.
              </div>
            </div>
          )}
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
