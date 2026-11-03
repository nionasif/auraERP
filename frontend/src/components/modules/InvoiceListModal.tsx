import React, { useState } from 'react';
import { X, Receipt, Search, Printer, Eye } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { Invoice } from '../../types/erp';

interface InvoiceListModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const InvoiceListModal: React.FC<InvoiceListModalProps> = ({ store }) => {
  const { state, closeModal, openModal } = store;
  const [search, setSearch] = useState('');

  const filteredInvoices = state.invoices.filter(inv => {
    return (
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.customer?.phone && inv.customer.phone.includes(search))
    );
  });

  const handleViewReceipt = (invoice: Invoice) => {
    openModal('RECEIPT_PREVIEW', invoice);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Datacenter Invoice Register & SOW Billing Audit Log (DC01 Silicon Tower)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search by Invoice # (e.g. INV-2026-DC01...), Corporate Client, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Invoice Table */}
        <div className="flex-1 overflow-y-auto p-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800 sticky top-0">
                <th className="p-2">Invoice / SOW #</th>
                <th className="p-2">Date & Time</th>
                <th className="p-2">Desk #</th>
                <th className="p-2">Corporate Client</th>
                <th className="p-2 text-center">Deliverables</th>
                <th className="p-2 text-right">Subtotal</th>
                <th className="p-2 text-right">VAT (5%)</th>
                <th className="p-2 text-right">Grand Total</th>
                <th className="p-2 text-center">Tender</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-850/60 transition">
                  <td className="p-2 font-bold text-amber-300">{inv.invoiceNo}</td>
                  <td className="p-2 text-slate-300">
                    <div>{inv.date}</div>
                    <div className="text-[10px] text-slate-500">{inv.time}</div>
                  </td>
                  <td className="p-2 text-slate-300">Desk #{inv.registerNo}</td>
                  <td className="p-2 font-sans">
                    {inv.customer ? (
                      <div>
                        <div className="font-semibold text-slate-200">{inv.customer.name}</div>
                        <div className="text-[10px] text-slate-500">{inv.customer.phone}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">Corporate Walk-in Client</span>
                    )}
                  </td>
                  <td className="p-2 text-center font-bold text-slate-200">
                    {inv.items.reduce((s, i) => s + i.qty, 0)} units
                  </td>
                  <td className="p-2 text-right text-slate-300">৳{inv.subtotal.toLocaleString()}</td>
                  <td className="p-2 text-right text-slate-400">৳{inv.vatAmount.toLocaleString()}</td>
                  <td className="p-2 text-right font-extrabold text-emerald-400">
                    ৳{inv.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleViewReceipt(inv)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition inline-flex items-center space-x-1"
                      title="View & Reprint Tax Invoice"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans">Tax Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            {filteredInvoices.length} enterprise invoices registered today at DC01.
          </span>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
