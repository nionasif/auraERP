import React, { useState } from 'react';
import { X, Truck, CheckCircle, PackageCheck, AlertCircle } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface GoodsReceiveModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const GoodsReceiveModal: React.FC<GoodsReceiveModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [selectedChallanId, setSelectedChallanId] = useState<string>(state.challans[0]?.id || '');
  const [verified, setVerified] = useState<boolean>(false);

  const activeChallan = state.challans.find(c => c.id === selectedChallanId) || state.challans[0];

  const handleVerifyChallan = () => {
    setVerified(true);
    setTimeout(() => {
      alert(`OEM Challan ${activeChallan.challanNo} successfully accepted! Hardware intake allocated to DC01 Inventory.`);
      closeModal();
    }, 800);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Hardware Receiving Note (GRN) & OEM Challan Intake
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto">
          {/* Challan Selector */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">
              Select Incoming OEM Delivery Challan:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {state.challans.map(ch => (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChallanId(ch.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition ${
                    selectedChallanId === ch.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-xs">{ch.challanNo}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-sans font-bold ${
                      ch.status === 'QUEUE' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {ch.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Source: {ch.source}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {ch.itemCount} Units • Value: ৳{ch.totalValue.toLocaleString()} • Date: {ch.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Challan Breakdown */}
          {activeChallan && (
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <span className="text-slate-400 text-[10px]">Challan Dispatch Manifest:</span>
                  <div className="text-sm font-bold text-slate-100">{activeChallan.challanNo}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px]">Destination Node:</span>
                  <div className="text-xs text-amber-300 font-semibold">{activeChallan.destination}</div>
                </div>
              </div>

              {/* Sample itemized contents */}
              <div className="space-y-1.5 text-[11px]">
                <div className="text-slate-400 font-sans font-semibold">Consignment Contents:</div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>• Dell PowerEdge R750 2U Servers (Dual Xeon, 128GB RAM)</span>
                  <span className="font-bold">4 units</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>• Cisco Catalyst 9300 48-Port PoE+ Managed Switches</span>
                  <span className="font-bold">8 units</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1 border-b border-slate-900">
                  <span>• Fortinet FortiGate 100F Security Firewalls</span>
                  <span className="font-bold">6 units</span>
                </div>
                <div className="flex justify-between text-slate-300 py-1">
                  <span>• PureStorage FlashBlade 52TB NVMe SAN Expansion Pods</span>
                  <span className="font-bold">2 units</span>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center space-x-2 text-xs font-sans text-emerald-400">
                <PackageCheck className="w-4 h-4 flex-shrink-0" />
                <span>Physical serial barcode verification matches OEM dispatch manifest.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={closeModal}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={handleVerifyChallan}
            disabled={verified}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Accept Challan & Receive Hardware (GRN)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
