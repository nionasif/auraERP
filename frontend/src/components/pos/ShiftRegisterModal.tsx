import React, { useState } from 'react';
import { X, Lock, CheckCircle, Calculator, Printer, Clock } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface ShiftRegisterModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const ShiftRegisterModal: React.FC<ShiftRegisterModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const currentReg = state.registers.find(r => r.registerNo === state.storeInfo.activeRegisterNo) || state.registers[0];

  const [actualCashCount, setActualCashCount] = useState<number>(currentReg.cashBalance);
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [isClosed, setIsClosed] = useState<boolean>(false);

  const variance = actualCashCount - currentReg.cashBalance;

  const handleCloseShift = () => {
    setIsClosed(true);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Billing Shift Closing & Z-Report (Desk #{currentReg.registerNo})
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isClosed ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">Billing Desk Successfully Reconciled</h4>
              <p className="text-xs text-slate-400 mt-1">
                Z-Report #ZR-20260924-{currentReg.registerNo} generated and transmitted to Corporate Treasury.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Revenue Reconciled:</span>
                <span className="text-emerald-400 font-bold">৳{currentReg.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actual Funds Deposited:</span>
                <span className="text-amber-300 font-bold">৳{actualCashCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Treasury Variance:</span>
                <span className={`font-bold ${variance === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ৳{variance.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>Print Z-Report Slip</span>
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4 text-xs font-sans">
            {/* Shift Financial Overview */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Billing Lead In-Charge:</span>
                <span className="text-slate-200 font-semibold">{currentReg.cashierName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shift Opened At:</span>
                <span className="text-slate-200">{currentReg.openedAt}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-850 pt-1.5">
                <span>Total Shift Revenue:</span>
                <span className="text-emerald-400 font-bold">৳{currentReg.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Corporate Card / POS:</span>
                <span className="text-sky-300">৳{currentReg.cardSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>MFS & Escrow Settlement:</span>
                <span className="text-pink-300">৳{currentReg.mfsSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>System Cash Expected:</span>
                <span className="text-amber-300 font-bold">৳{currentReg.cashBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Reconciliation Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Actual Physical Cash Counted in Drawer (৳) *
                </label>
                <input
                  type="number"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-base font-bold font-mono text-emerald-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Variance Indicator */}
              <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-mono ${
                variance === 0
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-800 text-rose-300'
              }`}>
                <span>Cash Reconciliation Variance:</span>
                <span className="font-extrabold text-sm">
                  {variance === 0 ? '৳0 (Balanced Perfectly)' : `৳${variance.toLocaleString()}`}
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Closing Remarks & Audit Notes</label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Notes regarding corporate checks, shift handover, or drawer balancing..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseShift}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Register & Print Z-Report</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
