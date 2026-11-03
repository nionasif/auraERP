import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Calendar,
  DollarSign,
  Receipt,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface ReportModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const ReportModal: React.FC<ReportModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [reportType, setReportType] = useState<'DAILY_SALES' | 'INVOICES' | 'MUSHAK_VAT' | 'MARGINS' | 'STOCK_VALUATION'>('DAILY_SALES');

  const totalSales = state.registers.reduce((acc, r) => acc + r.totalSales, 0);
  const totalVAT = Math.round(totalSales * 0.05);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    alert('Exporting Report as CSV (Comma Separated Values) format...');
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Enterprise Executive Financial & Operational Reports (AuraTech IT)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Selector Tabs */}
        <div className="grid grid-cols-5 bg-slate-950 border-b border-slate-800 text-xs font-semibold select-none overflow-x-auto">
          <button
            onClick={() => setReportType('DAILY_SALES')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              reportType === 'DAILY_SALES' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Billing Desks & SOWs</span>
          </button>

          <button
            onClick={() => setReportType('INVOICES')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              reportType === 'INVOICES' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Invoices & Billing</span>
            <span className="ml-1 bg-slate-800 px-1.5 py-0.2 rounded text-[10px] font-mono">
              {state.invoices.length}
            </span>
          </button>

          <button
            onClick={() => setReportType('MUSHAK_VAT')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              reportType === 'MUSHAK_VAT' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Mushak-6.3 IT VAT</span>
          </button>

          <button
            onClick={() => setReportType('MARGINS')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              reportType === 'MARGINS' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Practice Area Margins</span>
          </button>

          <button
            onClick={() => setReportType('STOCK_VALUATION')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              reportType === 'STOCK_VALUATION' ? 'bg-slate-850 text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>IT Asset Valuation</span>
          </button>
        </div>

        {/* Report Canvas */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {reportType === 'DAILY_SALES' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center font-sans">
                <div>
                  <h4 className="font-bold text-slate-100 text-xs">Daily Tech Node Billing Audit Summary</h4>
                  <div className="text-[11px] text-slate-400">Date: 24/09/2026 • Facility: DC01 Silicon Tower Tech Hub</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-emerald-400 font-bold text-sm">৳{totalSales.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500">Gross Billed SOWs</span>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <th className="p-2">Terminal Desk</th>
                    <th className="p-2">Lead Architect / Controller</th>
                    <th className="p-2 text-right">Escrow Cash (৳)</th>
                    <th className="p-2 text-right">Corporate Card (৳)</th>
                    <th className="p-2 text-right">Wire / RTGS (৳)</th>
                    <th className="p-2 text-right">Total Shift Billed (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {state.registers.map(r => (
                    <tr key={r.registerNo} className="hover:bg-slate-850/50">
                      <td className="p-2 font-bold text-amber-300">Desk #{r.registerNo}</td>
                      <td className="p-2 font-sans text-slate-200">{r.cashierName}</td>
                      <td className="p-2 text-right text-slate-300">{r.cashBalance.toLocaleString()}</td>
                      <td className="p-2 text-right text-slate-300">{r.cardSales.toLocaleString()}</td>
                      <td className="p-2 text-right text-slate-300">{r.mfsSales.toLocaleString()}</td>
                      <td className="p-2 text-right font-bold text-emerald-400">৳{r.totalSales.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'INVOICES' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center font-sans">
                <div>
                  <h4 className="font-bold text-slate-100 text-xs">Corporate Invoice Register & Fiscal Ledger</h4>
                  <div className="text-[11px] text-slate-400">Total Invoices: {state.invoices.length} • Mushak-6.3 IT Services Compliant</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => store.openModal('INVOICE_MANAGEMENT')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow flex items-center space-x-1"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Open Invoice Generator & Print Studio</span>
                  </button>
                </div>
              </div>

              {/* Invoices table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <th className="p-2">Invoice #</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Client / Corporate Account</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2 text-right">VAT (5%)</th>
                    <th className="p-2 text-right">Grand Total (৳)</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {state.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-850/50">
                      <td className="p-2 font-bold text-amber-300">{inv.invoiceNo}</td>
                      <td className="p-2 text-slate-300">{inv.date}</td>
                      <td className="p-2 font-sans text-slate-200">
                        {inv.customer?.name || 'Walk-in Enterprise Client'}
                      </td>
                      <td className="p-2 text-right text-slate-300">৳{inv.subtotal.toLocaleString()}</td>
                      <td className="p-2 text-right text-slate-400">৳{inv.vatAmount.toLocaleString()}</td>
                      <td className="p-2 text-right font-bold text-emerald-400">৳{inv.grandTotal.toLocaleString()}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            inv.paymentStatus === 'PAID' || inv.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {inv.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => store.openModal('INVOICE_MANAGEMENT')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[10px] font-sans"
                        >
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'MUSHAK_VAT' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded font-sans text-xs">
                <h4 className="font-bold text-slate-100">National Board of Revenue - Mushak-6.3 IT Services Fiscal Ledger</h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tax Period: September 2026 • Company BIN: 002341982-0101 (Software & IT Services)
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-slate-400 font-sans text-[10px]">Net Billed (Excl. VAT):</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">৳{(totalSales - totalVAT).toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-slate-400 font-sans text-[10px]">VAT Collected @ 5%:</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">৳{totalVAT.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
                  <div className="text-slate-400 font-sans text-[10px]">NBR Digital API Sync:</div>
                  <div className="text-xs font-bold text-cyan-400 mt-1">TRANSMITTED OK (VERIFIED)</div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'MARGINS' && (
            <div className="space-y-3 font-mono">
              <div className="text-[11px] text-slate-400 font-sans mb-1">
                Practice area wise gross profit contribution and margins:
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <th className="p-2">Practice Area</th>
                    <th className="p-2 text-right">Revenue (৳)</th>
                    <th className="p-2 text-right">COGS / Delivery (৳)</th>
                    <th className="p-2 text-right">Gross Profit (৳)</th>
                    <th className="p-2 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {state.departments.map(d => {
                    const cogs = Math.round(d.currSales * 0.48);
                    const gross = d.currSales - cogs;
                    const margin = ((gross / (d.currSales || 1)) * 100).toFixed(1);
                    return (
                      <tr key={d.id} className="hover:bg-slate-850/50">
                        <td className="p-2 font-sans font-medium text-slate-200">{d.name}</td>
                        <td className="p-2 text-right">৳{d.currSales.toLocaleString()}</td>
                        <td className="p-2 text-right text-slate-400">৳{cogs.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold text-emerald-400">৳{gross.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold text-amber-300">{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'STOCK_VALUATION' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded font-sans text-xs">
                <h4 className="font-bold text-slate-100">Datacenter DC01 Hardware & License Asset Valuation</h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Total Active Solution SKUs: {state.products.length} • Total Physical Units & Licenses: {state.products.reduce((s, p) => s + p.stock, 0)} Units
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center text-xs">
                <span className="font-sans text-slate-300">Total Enterprise Asset Valuation:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  ৳{state.products.reduce((s, p) => s + (p.stock * p.price), 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center space-x-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center space-x-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
