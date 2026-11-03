import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { Invoice } from '../../types/erp';

interface ReceiptModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const invoice: Invoice = state.modalPayload || state.recentInvoice;

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 flex flex-col my-auto">
        {/* Modal Top Actions */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Transaction Completed Successfully</span>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80mm Printable Receipt Body */}
        <div className="p-4 bg-slate-950 flex justify-center overflow-y-auto max-h-[75vh]">
          <div
            id="thermal-receipt"
            className="w-full max-w-[340px] bg-white text-black p-4 font-mono text-xs shadow-md border border-slate-300 rounded"
          >
            {/* Store Header */}
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <h2 className="text-base font-extrabold tracking-widest uppercase">AURA TECH</h2>
              <div className="text-[10px] font-sans text-gray-700 font-semibold">Enterprise IT Solutions & Cloud Systems</div>
              <div className="text-[10px] font-semibold mt-1">{invoice.outletName}</div>
              <div className="text-[9px] text-gray-600">Levels 14-16, Silicon Tower, Tech Zone, Dhaka</div>
              <div className="text-[9px] text-gray-600 mt-0.5">BIN: 004891234-0101</div>
              <div className="text-[8px] uppercase tracking-wider text-gray-500 mt-0.5">
                Mushak - 6.3 (IT Services Tax Invoice)
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Invoice: <strong>{invoice.invoiceNo}</strong></span>
                <span>Desk: #{invoice.registerNo}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Date: {invoice.date}</span>
                <span>Time: {invoice.time}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Lead: {invoice.cashierName}</span>
                <span>ID: {invoice.cashierId}</span>
              </div>
              {invoice.customer && (
                <div className="pt-1 text-gray-800 border-t border-dotted border-gray-300">
                  <div>Client: <strong>{invoice.customer.name}</strong></div>
                  <div>Phone: {invoice.customer.phone} ({invoice.customer.tier})</div>
                  <div>SLA Credits Earned: +{invoice.customer.pointsEarned} pts</div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-gray-400">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-gray-300 text-left font-bold">
                    <th className="pb-1">Deliverable / Asset</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Rate</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-gray-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-[8px] text-gray-500">{item.barcode} {item.size && `• Spec: ${item.size}`}</div>
                      </td>
                      <td className="py-1 text-center font-bold">{item.qty}</td>
                      <td className="py-1 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="py-1 text-right font-bold">{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="py-2 text-[10px] space-y-1 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>SOW Discount:</span>
                  <span>-৳{invoice.discountTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>VAT (5% Mushak 6.3 IT Services):</span>
                <span>৳{invoice.vatAmount.toLocaleString()}</span>
              </div>
              {invoice.bagCharge > 0 && (
                <div className="flex justify-between">
                  <span>Provisioning & Patch Kit:</span>
                  <span>৳{invoice.bagCharge}</span>
                </div>
              )}
              <div className="pt-1 border-t border-gray-400 flex justify-between font-extrabold text-xs">
                <span>GRAND TOTAL:</span>
                <span>৳{invoice.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Tender */}
            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold">{invoice.paymentMethod}</span>
              </div>
              {invoice.cashTendered !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>৳{invoice.cashTendered.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change Returned:</span>
                    <span>৳{(invoice.changeDue || 0).toLocaleString()}</span>
                  </div>
                </>
              )}
              {invoice.cardRef && (
                <div className="flex justify-between">
                  <span>Card Auth Ref:</span>
                  <span>{invoice.cardRef}</span>
                </div>
              )}
              {invoice.mfsRef && (
                <div className="flex justify-between">
                  <span>MFS Ref / TrxID:</span>
                  <span>{invoice.mfsRef}</span>
                </div>
              )}
            </div>

            {/* Simulated Barcode */}
            <div className="py-2.5 text-center flex flex-col items-center justify-center">
              <div className="tracking-widest font-mono text-sm font-bold text-gray-800">
                |||| | |||||| || | |||| ||| |||||||
              </div>
              <div className="text-[8px] text-gray-500 mt-0.5">{invoice.invoiceNo}</div>
            </div>

            {/* Footer Policy */}
            <div className="text-[8px] text-center text-gray-500 space-y-0.5 pt-1">
              <div>Thank you for partnering with AuraTech IT Solutions Ltd.!</div>
              <div>SLA terms & 24/7 technical support backed by Master Service Agreement (MSA).</div>
              <div>Software licenses & cloud provisioning are governed by enterprise warranty.</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={closeModal}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
