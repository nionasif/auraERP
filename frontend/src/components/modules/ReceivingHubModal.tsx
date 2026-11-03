import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle,
  PackageCheck,
  Printer,
  Barcode,
  Search,
  Check,
  AlertTriangle,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface ReceivingHubModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const ReceivingHubModal: React.FC<ReceivingHubModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [selectedChallanId, setSelectedChallanId] = useState<string>(state.challans[0]?.id || '');
  const [grnGenerated, setGrnGenerated] = useState<boolean>(false);
  const [grnNumber, setGrnNumber] = useState<string>('');
  const [verifiedQty, setVerifiedQty] = useState<{ [key: string]: number }>({
    'item-1': 4,
    'item-2': 8,
    'item-3': 6,
    'item-4': 2
  });

  const activeChallan = state.challans.find(c => c.id === selectedChallanId) || state.challans[0];

  const handleGenerateGRN = () => {
    const grnSeq = 'GRN-2026-DC01-0842';
    setGrnNumber(grnSeq);
    setGrnGenerated(true);
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
            <Truck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Hardware Intake, Server Consignment & OEM Receiving Hub (GRN)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {grnGenerated ? (
          /* GRN Certificate Preview */
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="text-center pb-3 border-b border-slate-800">
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                HARDWARE GRN REGISTERED & ALLOCATED TO DC01 RACKS
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-2 font-mono">{grnNumber}</h2>
              <div className="text-xs text-slate-400">
                Gate Entry Received at {state.storeInfo.outletName} • 24/Sep/2026 12:40 PM
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">OEM Delivery Challan Ref:</span>
                <span className="text-amber-300 font-bold">{activeChallan.challanNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OEM / Vendor Dispatch Source:</span>
                <span className="text-slate-200">{activeChallan.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carrier Vehicle & Driver:</span>
                <span className="text-slate-200">{activeChallan.carrierVehicle} ({activeChallan.driverName} - {activeChallan.driverPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Hardware Assets Accepted:</span>
                <span className="text-emerald-400 font-bold">{activeChallan.itemCount} Units (100% Serial Verified)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consignment Invoice Value:</span>
                <span className="text-slate-100 font-bold">৳{activeChallan.totalValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Hardware GRN Slip</span>
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold"
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          /* Challan Intake & Verification View */
          <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
            {/* Challans List */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Incoming OEM Hardware Delivery Challans (Select to Inspect):
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
                    <div className="text-[10px] text-slate-400 mt-1">From: {ch.source}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {ch.itemCount} Units • ৳{ch.totalValue.toLocaleString()} • Freight: {ch.carrierVehicle || 'Dhaka Metro-TA 11-4209'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Items Quantity Verification Table */}
            {activeChallan && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
                  <span>Hardware Manifest Line Item Inspection ({activeChallan.challanNo})</span>
                  <span className="text-[11px] text-slate-500 font-mono">Carrier: {activeChallan.carrierVehicle}</span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <th className="p-2">Hardware Asset Description</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-center">Challan Qty</th>
                      <th className="p-2 text-center">Received Qty</th>
                      <th className="p-2 text-center">Variance</th>
                      <th className="p-2 text-center">Serial / Barcode Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-2 font-sans font-medium text-slate-200">
                        Dell PowerEdge R750 2U Rackmount Server (Dual Xeon, 128GB RAM)
                      </td>
                      <td className="p-2 text-slate-400 font-sans">Datacenter Hardware</td>
                      <td className="p-2 text-center font-bold">4</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={verifiedQty['item-1']}
                          onChange={(e) => setVerifiedQty({ ...verifiedQty, 'item-1': Number(e.target.value) })}
                          className="w-14 bg-slate-950 border border-slate-700 rounded text-center text-emerald-400 font-bold p-1"
                        />
                      </td>
                      <td className="p-2 text-center text-emerald-400 font-bold">0 (Clean)</td>
                      <td className="p-2 text-center">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-sans">
                          Verified (4 SNs Scanned)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-2 font-sans font-medium text-slate-200">
                        Cisco Catalyst 9300 48-Port PoE+ Managed Network Switch
                      </td>
                      <td className="p-2 text-slate-400 font-sans">Edge Networking</td>
                      <td className="p-2 text-center font-bold">8</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={verifiedQty['item-2']}
                          onChange={(e) => setVerifiedQty({ ...verifiedQty, 'item-2': Number(e.target.value) })}
                          className="w-14 bg-slate-950 border border-slate-700 rounded text-center text-emerald-400 font-bold p-1"
                        />
                      </td>
                      <td className="p-2 text-center text-emerald-400 font-bold">0 (Clean)</td>
                      <td className="p-2 text-center">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-sans">
                          Verified (8 SNs Scanned)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-2 font-sans font-medium text-slate-200">
                        Fortinet FortiGate 100F Next-Gen Security Appliance
                      </td>
                      <td className="p-2 text-slate-400 font-sans">Cybersecurity</td>
                      <td className="p-2 text-center font-bold">6</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={verifiedQty['item-3']}
                          onChange={(e) => setVerifiedQty({ ...verifiedQty, 'item-3': Number(e.target.value) })}
                          className="w-14 bg-slate-950 border border-slate-700 rounded text-center text-emerald-400 font-bold p-1"
                        />
                      </td>
                      <td className="p-2 text-center text-emerald-400 font-bold">0 (Clean)</td>
                      <td className="p-2 text-center">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-sans">
                          Verified (6 SNs Scanned)
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-2 font-sans font-medium text-slate-200">
                        PureStorage FlashBlade 52TB NVMe Expansion Pod
                      </td>
                      <td className="p-2 text-slate-400 font-sans">Datacenter Storage</td>
                      <td className="p-2 text-center font-bold">2</td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={verifiedQty['item-4']}
                          onChange={(e) => setVerifiedQty({ ...verifiedQty, 'item-4': Number(e.target.value) })}
                          className="w-14 bg-slate-950 border border-slate-700 rounded text-center text-emerald-400 font-bold p-1"
                        />
                      </td>
                      <td className="p-2 text-center text-emerald-400 font-bold">0 (Clean)</td>
                      <td className="p-2 text-center">
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-sans">
                          Verified (2 SNs Scanned)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!grnGenerated && (
          <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Inspected by: {state.storeInfo.currentUser.name} (DC Gate & ESD Clearance OK)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateGRN}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center space-x-1.5 shadow"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Approve Hardware Intake & Generate GRN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
