import React from 'react';
import { X, PlayCircle, Trash2, Clock, User } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface RecallCartsModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const RecallCartsModal: React.FC<RecallCartsModalProps> = ({ store }) => {
  const { state, closeModal, recallParkedCart } = store;

  const handleRecall = (id: string) => {
    recallParkedCart(id);
    closeModal();
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
            <PlayCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Recall Parked / Held Invoices & SOWs ({state.parkedCarts.length})
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {state.parkedCarts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No parked service bills or SOW drafts found.
            </div>
          ) : (
            state.parkedCarts.map(cart => {
              const total = cart.items.reduce((s, i) => s + i.lineTotal, 0);
              const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div
                  key={cart.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-amber-300 font-mono">{cart.id}</span>
                      <span className="flex items-center space-x-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{cart.time}</span>
                      </span>
                    </div>

                    <div className="text-slate-300 mt-1">
                      {itemCount} deliverables/units • <span className="font-bold text-emerald-400 font-mono">৳{total.toLocaleString()}</span>
                    </div>

                    {cart.customer && (
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{cart.customer.name} ({cart.customer.phone})</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRecall(cart.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow transition"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Resume SOW</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
