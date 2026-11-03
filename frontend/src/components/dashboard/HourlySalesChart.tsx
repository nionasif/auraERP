import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BarChart3, Maximize2 } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { HourlySalesData } from '../../types/erp';

interface HourlySalesChartProps {
  store: ReturnType<typeof useERPStore>;
  hourlySales?: HourlySalesData[];
}

export const HourlySalesChart: React.FC<HourlySalesChartProps> = ({ store, hourlySales }) => {
  const { state, openModal } = store;
  const activeHourlySales = hourlySales && hourlySales.length > 0 ? hourlySales : state.hourlySales;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded shadow-sm overflow-hidden flex flex-col h-full">
      {/* Title Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
          <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
          <span>Hourly Billing Trajectory</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 font-mono">10:00 AM - 10:00 PM</span>
          <button
            onClick={() => openModal('OTHER_LINK_DETAIL', { title: 'Hourly Billing Detailed Curve & Transaction Volume', type: 'HOURLY' })}
            className="text-slate-400 hover:text-white"
            title="Expand Chart"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 p-2 min-h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeHourlySales} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="hour"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-750 p-2 rounded shadow-lg text-xs font-mono">
                      <div className="text-amber-400 font-bold">{data.hour}</div>
                      <div className="text-slate-200 mt-1">
                        Billing: <span className="font-bold text-emerald-400">৳{data.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {data.invoices} invoices | {data.items} units delivered
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
