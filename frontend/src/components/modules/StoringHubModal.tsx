import React, { useState } from 'react';
import {
  X,
  Layers,
  ArrowRight,
  Package,
  CheckCircle,
  MoveRight,
  RefreshCw,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface StoringHubModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const StoringHubModal: React.FC<StoringHubModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [selectedZone, setSelectedZone] = useState<'ALL' | 'SHOWROOM_FLOOR' | 'BACKROOM_STORAGE'>('ALL');
  const [selectedBin, setSelectedBin] = useState<string>(state.bins[0]?.id || '');
  const [movedAlert, setMovedAlert] = useState<boolean>(false);

  const filteredBins = state.bins.filter(b => {
    if (selectedZone === 'ALL') return true;
    return b.zone === selectedZone;
  });

  const activeBin = state.bins.find(b => b.id === selectedBin) || state.bins[0];

  const handleReplenish = () => {
    setMovedAlert(true);
    setTimeout(() => setMovedAlert(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Datacenter Server Racks, Planogram & Hardware Vault Matrix (DC01 Silicon Tower)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone Selector */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedZone('ALL')}
              className={`px-3 py-1 rounded font-medium transition ${
                selectedZone === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Zones ({state.bins.length} Locations)
            </button>
            <button
              onClick={() => setSelectedZone('SHOWROOM_FLOOR')}
              className={`px-3 py-1 rounded font-medium transition ${
                selectedZone === 'SHOWROOM_FLOOR' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Active Server Racks (DC-01 to DC-06)
            </button>
            <button
              onClick={() => setSelectedZone('BACKROOM_STORAGE')}
              className={`px-3 py-1 rounded font-medium transition ${
                selectedZone === 'BACKROOM_STORAGE' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Hardware Vaults & Staging (BR-01 to BR-04)
            </button>
          </div>

          <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
            Planogram Map: DC01-2026.09 (Tier-3 Datacenter Grid)
          </span>
        </div>

        {/* Body Grid */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {movedAlert && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Hardware allocation transferred: 2 server blades mounted from Staging Vault to Rack DC-01!</span>
            </div>
          )}

          {/* Racks Grid */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-2 font-medium">
              Rack Capacity & U-Space Location Map (Click any to inspect mounted assets):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {filteredBins.map(bin => {
                const percent = Math.round((bin.occupiedUnits / bin.capacityUnits) * 100);
                const isSelected = selectedBin === bin.id;
                return (
                  <div
                    key={bin.id}
                    onClick={() => setSelectedBin(bin.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-slate-100">{bin.code}</span>
                      <span className="text-[10px] text-slate-400">{percent}%</span>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{bin.department}</div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
                      <span>{bin.occupiedUnits} / {bin.capacityUnits} U / units</span>
                      <span className="capitalize text-slate-500">{bin.zone.split('_')[0].toLowerCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Bin Deep Dive */}
          {activeBin && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Active Rack / Bay Location:</span>
                  <div className="text-base font-bold text-amber-300">{activeBin.code} ({activeBin.department})</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Datacenter Zone:</span>
                  <div className="text-xs text-slate-200 font-sans font-semibold">
                    {activeBin.zone === 'SHOWROOM_FLOOR' ? 'Active Production Server Rack' : 'Hardware Staging & Spare Vault'}
                  </div>
                </div>
              </div>

              {/* Sample Products Stored inside */}
              <div className="text-xs font-sans">
                <span className="text-slate-400 text-[11px] block mb-1">Hardware Assets Currently Mounted in this Rack:</span>
                <div className="space-y-1.5">
                  {state.products.filter(p => p.department === activeBin.department).slice(0, 3).map(p => (
                    <div key={p.id} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-200">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Serial/Barcode: {p.barcode} • Spec: {p.size || 'Enterprise'}</div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-400 font-bold text-xs">{p.stock} units</span>
                        <div className="text-[10px] text-slate-500">৳{p.price.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-sans">
                  Mount spare hardware from staging vault to active server rack?
                </span>
                <button
                  onClick={handleReplenish}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 font-sans shadow"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                  <span>Mount 2 Server Blades to Rack</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Rack Planogram synced with Datacenter DCIM & RFID Asset Telemetry.
          </span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
