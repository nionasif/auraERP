import React, { useState } from 'react';
import { X, ArrowRightLeft, Send, Check } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface StockTransferModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [destOutlet, setDestOutlet] = useState<string>('DC02 - Agrabad Tech Park (Chattogram)');
  const [selectedProductId, setSelectedProductId] = useState<string>(state.products[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(2);
  const [remarks, setRemarks] = useState<string>('Inter-datacenter node equipment load balancing');
  const [isSent, setIsSent] = useState<boolean>(false);

  const selectedProduct = state.products.find(p => p.id === selectedProductId) || state.products[0];

  const handleDispatch = () => {
    if (!selectedProduct) return;
    setIsSent(true);
    setTimeout(() => {
      alert(`Transfer note generated! ${transferQty} units of ${selectedProduct.name} dispatched to ${destOutlet}.`);
      closeModal();
    }, 800);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Inter-Node Hardware Transfer Note (STN)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-3.5 text-xs font-sans">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Dispatching Source Node:</label>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-200 font-semibold">
                DC01 - Silicon Tower Tech Hub
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Destination Datacenter Node:</label>
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
                    {p.sku} - {p.name} (Stock: {p.stock} units, ৳{p.price.toLocaleString()})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Quantity to Transfer:</label>
              <input
                type="number"
                min="1"
                max={selectedProduct?.stock || 1}
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                disabled={!selectedProduct}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-400 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Transfer Challan Value:</label>
              <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-emerald-400 font-bold">
                ৳{(transferQty * (selectedProduct?.price || 0)).toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Dispatch Reason / Gate Pass Remarks:</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
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
            onClick={handleDispatch}
            disabled={isSent || !selectedProduct}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition"
          >
            <Send className="w-4 h-4" />
            <span>Generate STN & Dispatch Hardware</span>
          </button>
        </div>
      </div>
    </div>
  );
};
