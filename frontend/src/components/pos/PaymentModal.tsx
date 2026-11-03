import React, { useState } from 'react';
import { X, Banknote, CreditCard, Smartphone, Check, ArrowRight } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface PaymentModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ store }) => {
  const { state, closeModal, completeCheckout } = store;
  const payload = state.modalPayload || {};
  const grandTotal = payload.grandTotal || 0;
  const bagCharge = payload.bagCharge || 0;

  const [method, setMethod] = useState<'CASH' | 'CARD' | 'MFS'>('CARD');
  const [tenderedAmount, setTenderedAmount] = useState<number>(grandTotal);
  const [cardType, setCardType] = useState<string>('VISA Commercial');
  const [cardRef, setCardRef] = useState<string>('AUTH-789042');
  const [mfsProvider, setMfsProvider] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [mfsTrxId, setMfsTrxId] = useState<string>('RTGS-SCB-98421');

  const changeDue = Math.max(0, (tenderedAmount || 0) - grandTotal);

  const handleDenominationClick = (val: number) => {
    setTenderedAmount(val);
  };

  const handleFinish = () => {
    completeCheckout({
      method,
      tendered: method === 'CASH' ? tenderedAmount : grandTotal,
      change: method === 'CASH' ? changeDue : 0,
      cardRef: method === 'CARD' ? `${cardType}-${cardRef}` : undefined,
      mfsRef: method === 'MFS' ? `${mfsProvider}-${mfsTrxId}` : undefined,
      bagCharge,
    });
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">Select Settlement & Billing Tender</h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Display */}
        <div className="bg-emerald-950/40 p-4 border-b border-emerald-900/60 flex items-center justify-between">
          <span className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Total Payable SOW / Invoice:</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">
            ৳{grandTotal.toLocaleString()}
          </span>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950 text-xs font-semibold">
          <button
            onClick={() => setMethod('CARD')}
            className={`py-2.5 flex items-center justify-center space-x-1.5 transition ${
              method === 'CARD' ? 'bg-slate-850 text-sky-300 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Corporate Card</span>
          </button>

          <button
            onClick={() => setMethod('MFS')}
            className={`py-2.5 flex items-center justify-center space-x-1.5 transition ${
              method === 'MFS' ? 'bg-slate-850 text-pink-400 border-b-2 border-pink-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Wire / RTGS / MFS</span>
          </button>

          <button
            onClick={() => setMethod('CASH')}
            className={`py-2.5 flex items-center justify-center space-x-1.5 transition ${
              method === 'CASH' ? 'bg-slate-850 text-amber-300 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Treasury Escrow</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 space-y-4 text-xs font-sans">
          {method === 'CARD' && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                {['VISA Commercial', 'Mastercard Corp', 'AMEX B2B', 'NexusPay'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCardType(type)}
                    className={`flex-1 py-2 rounded text-xs font-bold border transition ${
                      cardType === type
                        ? 'bg-sky-950 border-sky-400 text-sky-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  POS EDC Machine Approval / Gateway Auth Code:
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Corporate credit card authorization confirmed via merchant terminal. Real-time VAT sync and charge record generated.
              </div>
            </div>
          )}

          {method === 'MFS' && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                {(['bKash', 'Nagad', 'Rocket'] as const).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setMfsProvider(prov)}
                    className={`flex-1 py-2 rounded text-xs font-bold border transition ${
                      mfsProvider === prov
                        ? 'bg-pink-950 border-pink-400 text-pink-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {prov === 'bKash' ? 'bKash / RTGS' : `${prov} Merchant`}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Bank Wire / BEFTN / TrxID Reference:
                </label>
                <input
                  type="text"
                  value={mfsTrxId}
                  onChange={(e) => setMfsTrxId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Client wire transfer verified or digital merchant invoice QR scanned.</span>
              </div>
            </div>
          )}

          {method === 'CASH' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Cash Tendered to Treasury Escrow (৳):
                </label>
                <input
                  type="number"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-lg font-bold font-mono text-emerald-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick Note Buttons */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Quick Denominations:</span>
                <div className="grid grid-cols-5 gap-1.5 font-mono">
                  {[grandTotal, 50000, 100000, 200000, 500000].map((val, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDenominationClick(val)}
                      className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                    >
                      {idx === 0 ? 'Exact' : `৳${val >= 1000 ? `${val / 1000}k` : val}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Calculation */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-xs">Escrow Change / Credit Due:</span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  ৳{changeDue.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={closeModal}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleFinish}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>Authorize SOW & Print Enterprise Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
