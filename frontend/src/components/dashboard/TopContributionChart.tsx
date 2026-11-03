import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Maximize2 } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { DepartmentMetric } from '../../types/erp';

interface TopContributionChartProps {
  store: ReturnType<typeof useERPStore>;
  departments?: DepartmentMetric[];
  title?: string;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const TopContributionChart: React.FC<TopContributionChartProps> = ({
  store,
  departments,
  title = 'Top Practice Revenue Contribution'
}) => {
  const { state, openModal } = store;
  const activeDepartments = departments && departments.length > 0 ? departments : state.departments;

  const totalRevenue = activeDepartments.reduce((sum, d) => sum + d.currSales, 0);

  // Top 5 departments by sales
  const topDeptData = [...activeDepartments]
    .sort((a, b) => b.currSales - a.currSales)
    .slice(0, 5)
    .map((d, index) => ({
      name: d.name,
      value: d.currSales,
      percentage: totalRevenue > 0 ? ((d.currSales / totalRevenue) * 100).toFixed(1) : '0.0',
      color: COLORS[index % COLORS.length]
    }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded shadow-sm overflow-hidden flex flex-col h-full">
      {/* Title Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
          <PieIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{title}</span>
        </div>
        <button
          onClick={() => openModal('OTHER_LINK_DETAIL', { title: 'Practice Line & Solution Revenue Contribution', type: 'CONTRIBUTION' })}
          className="text-slate-400 hover:text-white"
          title="Expand View"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 p-2 flex items-center justify-between">
        {/* Donut Chart */}
        <div className="w-1/2 h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topDeptData}
                innerRadius={30}
                outerRadius={50}
                paddingAngle={3}
                dataKey="value"
              >
                {topDeptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-750 p-1.5 rounded shadow text-[10px] font-mono">
                        <div className="font-bold text-white">{data.name}</div>
                        <div className="text-emerald-400 font-bold">৳{data.value.toLocaleString()} ({data.percentage}%)</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Breakdown List */}
        <div className="w-1/2 space-y-1.5 pr-2">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top Practices (By Revenue)</div>
          {topDeptData.slice(0, 4).map((d) => (
            <div key={d.name} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 truncate max-w-[100px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-300 truncate text-[10px]">{d.name}</span>
              </div>
              <span className="font-mono text-slate-200 text-[10px] font-bold">{d.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
