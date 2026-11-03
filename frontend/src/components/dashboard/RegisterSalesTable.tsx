import React from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

import { CashRegister } from '../../types/erp';

interface RegisterSalesTableProps {
  store: ReturnType<typeof useERPStore>;
  registers?: CashRegister[];
}

export const RegisterSalesTable: React.FC<RegisterSalesTableProps> = ({ store, registers }) => {
  const { state, openModal } = store;
  const activeRegisters = registers && registers.length > 0 ? registers : state.registers;

  const totalAmount = activeRegisters.reduce((acc, r) => acc + r.totalSales, 0);
  const totalBalance = activeRegisters.reduce((acc, r) => acc + r.cashBalance, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded shadow-sm overflow-hidden flex flex-col h-full">
      {/* Title Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
          <CreditCard className="w-3.5 h-3.5 text-amber-400" />
          <span>Billing Terminal Wise Revenue</span>
        </div>
        <button
          onClick={() => openModal('OTHER_LINK_DETAIL', { title: 'Terminal Cash Register Status & Drawer Audit', type: 'REGISTERS' })}
          className="text-slate-400 hover:text-white p-0.5 rounded transition"
          title="Open Full Register View"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-850 text-slate-400 text-[11px] border-b border-slate-800 select-none">
              <th className="py-1.5 px-2.5 font-semibold">Terminal Desk</th>
              <th className="py-1.5 px-2.5 font-semibold text-right">Revenue (৳)</th>
              <th className="py-1.5 px-2.5 font-semibold text-right">Balance (৳)</th>
              <th className="py-1.5 px-2.5 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {activeRegisters.map((reg) => (
              <tr
                key={reg.registerNo}
                onClick={() => openModal('OTHER_LINK_DETAIL', { title: `Desk #${reg.registerNo} Details (${reg.cashierName})`, type: 'REGISTERS' })}
                className="hover:bg-slate-800/60 transition cursor-pointer group"
              >
                <td className="py-2 px-2.5 text-slate-200 font-medium">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-amber-300">Desk-{reg.registerNo}</span>
                    <span className="text-[10px] text-slate-500 font-sans truncate max-w-[80px]">
                      {reg.cashierName.split(' ')[0]}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2.5 text-right font-bold text-emerald-400">
                  {reg.totalSales.toLocaleString()}
                </td>
                <td className="py-2 px-2.5 text-right text-slate-300">
                  {reg.cashBalance.toLocaleString()}
                </td>
                <td className="py-2 px-2.5 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
                    reg.status === 'OPEN'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {reg.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-950 font-bold font-mono text-[11px] border-t border-slate-700 text-slate-100">
              <td className="py-2 px-2.5 font-sans">Total:</td>
              <td className="py-2 px-2.5 text-right text-emerald-300">৳ {totalAmount.toLocaleString()}</td>
              <td className="py-2 px-2.5 text-right text-slate-200">৳ {totalBalance.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
