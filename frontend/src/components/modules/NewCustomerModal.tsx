import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface NewCustomerModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ store }) => {
  const { closeModal, selectCustomer } = store;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newCustomer = {
      id: `CORP-${Date.now().toString().slice(-4)}`,
      name,
      phone,
      email: email || `${phone}@client.auratech.com`,
      tier: 'SILVER' as const,
      points: 500, // 500 SLA Welcome Points
      totalSpent: 0,
      lastVisit: 'Just now',
    };

    selectCustomer(newCustomer);
    alert(`Corporate client ${name} registered successfully with 500 Welcome SLA credits!`);
    closeModal();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">Enroll Corporate Client Account</h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs font-sans">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Company / Enterprise Client Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex TeleHealth Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Corporate Contact Phone (11 digits) *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 01711223344"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Billing / Procurement Email (Optional)</label>
            <input
              type="email"
              placeholder="e.g. billing@apextelehealth.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-emerald-950/40 p-2.5 rounded border border-emerald-800 text-[11px] text-emerald-300">
            Corporate onboarding grants <strong>500 SLA Welcome Retainer Credits</strong> and automated digital Mushak-6.3 tax invoice transmission.
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Enroll & Attach to SOW</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
