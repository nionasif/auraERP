import React from 'react';
import { Layers, ExternalLink } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { DepartmentMetric } from '../../types/erp';

interface DepartmentSalesTableProps {
  store: ReturnType<typeof useERPStore>;
  departments?: DepartmentMetric[];
  title?: string;
  divisionLabel?: string;
}

export const DepartmentSalesTable: React.FC<DepartmentSalesTableProps> = ({
  store,
  departments,
  title = 'Practice Area Wise Revenue',
  divisionLabel = 'Practice Division'
}) => {
  const { state, openModal } = store;
  const activeDepartments = departments && departments.length > 0 ? departments : state.departments;

  const totalQty = activeDepartments.reduce((acc, d) => acc + d.qtySold, 0);
  const totalAmount = activeDepartments.reduce((acc, d) => acc + d.currSales, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded shadow-sm overflow-hidden flex flex-col h-full">
      {/* Title Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{title}</span>
        </div>
        <button
          onClick={() => openModal('OTHER_LINK_DETAIL', { title: `${title} Deep Dive`, type: 'DEPARTMENTS' })}
          className="text-slate-400 hover:text-white p-0.5 rounded transition"
          title="Open Full Practice Analysis"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-850 text-slate-400 text-[11px] border-b border-slate-800 select-none">
              <th className="py-1.5 px-2.5 font-semibold">{divisionLabel}</th>
              <th className="py-1.5 px-2 font-semibold text-center">Units</th>
              <th className="py-1.5 px-2.5 font-semibold text-right">Amount (৳)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {activeDepartments.map((dept) => (
              <tr
                key={dept.id}
                onClick={() => openModal('OTHER_LINK_DETAIL', { title: `${dept.name} Revenue Breakdown`, type: 'DEPARTMENTS' })}
                className="hover:bg-slate-800/60 transition cursor-pointer group"
              >
                <td className="py-1.5 px-2.5 text-slate-200 font-sans font-medium truncate max-w-[150px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span className="truncate">{dept.name}</span>
                  </div>
                </td>
                <td className="py-1.5 px-2 text-center text-slate-300 font-medium">
                  {dept.qtySold}
                </td>
                <td className="py-1.5 px-2.5 text-right font-bold text-emerald-400">
                  {dept.currSales.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-950 font-bold font-mono text-[11px] border-t border-slate-700 text-slate-100">
              <td className="py-2 px-2.5 font-sans">Total:</td>
              <td className="py-2 px-2 text-center text-amber-300">{totalQty} units</td>
              <td className="py-2 px-2.5 text-right text-emerald-300">৳ {totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
