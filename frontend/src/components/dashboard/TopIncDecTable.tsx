import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { DepartmentMetric } from '../../types/erp';

interface TopIncDecTableProps {
  store: ReturnType<typeof useERPStore>;
  departments?: DepartmentMetric[];
  title?: string;
  divisionLabel?: string;
}

export const TopIncDecTable: React.FC<TopIncDecTableProps> = ({
  store,
  departments,
  title = 'Top Inc./Dec. (Practice Lines)',
  divisionLabel = 'Practice Division'
}) => {
  const { state } = store;
  const activeDepartments = departments && departments.length > 0 ? departments : state.departments;

  const [period, setPeriod] = useState<'Last Day' | 'Last 7 Days' | 'Last Month'>('Last Day');
  const [trendType, setTrendType] = useState<'Inc' | 'Dec'>('Inc');
  const [topLimit, setTopLimit] = useState<number>(10);

  // Filter and sort departments
  const sortedDepartments = [...activeDepartments]
    .sort((a, b) => {
      if (trendType === 'Inc') {
        return b.percentageChange - a.percentageChange;
      } else {
        return a.percentageChange - b.percentageChange;
      }
    })
    .slice(0, topLimit);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded shadow-sm overflow-hidden flex flex-col h-full">
      {/* Title Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>{title}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-850 px-2 py-1.5 border-b border-slate-800 flex items-center space-x-2 text-[11px]">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          aria-label="Filter Period"
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-medium focus:outline-none focus:border-amber-400"
        >
          <option value="Last Day">Last Day</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last Month">Last Month</option>
        </select>

        <select
          value={trendType}
          onChange={(e) => setTrendType(e.target.value as any)}
          aria-label="Filter Trend Type"
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-medium focus:outline-none focus:border-amber-400"
        >
          <option value="Inc">Inc (Gainers)</option>
          <option value="Dec">Dec (Decliners)</option>
        </select>

        <select
          value={topLimit}
          onChange={(e) => setTopLimit(Number(e.target.value))}
          aria-label="Filter Top Limit"
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-medium focus:outline-none focus:border-amber-400"
        >
          <option value={5}>Top-5</option>
          <option value={10}>Top-10</option>
          <option value={20}>Top-20</option>
        </select>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-850/80 text-slate-400 text-[11px] border-b border-slate-800 select-none">
              <th className="py-1.5 px-2.5 font-semibold">{divisionLabel}</th>
              <th className="py-1.5 px-2 font-semibold text-right">Prev. Revenue</th>
              <th className="py-1.5 px-2 font-semibold text-right">Curr. Revenue</th>
              <th className="py-1.5 px-2.5 font-semibold text-right">Inc/Dec</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {sortedDepartments.map((dept) => {
              const isPositive = dept.percentageChange >= 0;
              return (
                <tr key={dept.id} className="hover:bg-slate-800/60 transition">
                  <td className="py-1.5 px-2.5 text-slate-200 font-sans font-medium truncate max-w-[130px]">
                    {dept.name}
                  </td>
                  <td className="py-1.5 px-2 text-right text-slate-400">
                    ৳{dept.prevSales.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-2 text-right font-medium text-slate-200">
                    ৳{dept.currSales.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-bold">
                    <span className={`inline-flex items-center space-x-0.5 px-1 py-0.5 rounded text-[10px] ${
                      isPositive
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                      <span>{isPositive ? `+${dept.percentageChange}%` : `${dept.percentageChange}%`}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
