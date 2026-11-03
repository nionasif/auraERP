import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, RefreshCw, Layers, Award, Sparkles, Boxes, ArrowRight } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { computeDynamicDashboard, getAvailableInvoiceDates } from '../../utils/dashboardAnalytics';
import { SalesOverviewKPI } from './SalesOverviewKPI';
import { RegisterSalesTable } from './RegisterSalesTable';
import { DepartmentSalesTable } from './DepartmentSalesTable';
import { TopIncDecTable } from './TopIncDecTable';
import { HourlySalesChart } from './HourlySalesChart';
import { TopContributionChart } from './TopContributionChart';
import { OtherLinksBox } from './OtherLinksBox';

interface ManagementDashboardProps {
  store: ReturnType<typeof useERPStore>;
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ store }) => {
  const { state, setView } = store;

  const availableDates = useMemo(() => getAvailableInvoiceDates(state.invoices), [state.invoices]);

  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [viewCriteria, setViewCriteria] = useState<'DEPARTMENT' | 'CATEGORY'>('DEPARTMENT');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [appliedFilters, setAppliedFilters] = useState<{ date: string; viewCriteria: 'DEPARTMENT' | 'CATEGORY' }>({
    date: 'ALL',
    viewCriteria: 'DEPARTMENT',
  });

  // Dynamic Dashboard metrics calculated reactively
  const dynamicData = useMemo(() => {
    return computeDynamicDashboard(state.invoices, appliedFilters, state.registers);
  }, [state.invoices, appliedFilters, state.registers]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${day}/${month}/${year} ${time}`;
  };

  const handleCriteriaChange = (newCriteria: 'DEPARTMENT' | 'CATEGORY') => {
    setViewCriteria(newCriteria);
    setAppliedFilters(prev => ({ ...prev, viewCriteria: newCriteria }));
  };

  const handleLoad = () => {
    setIsLoadingData(true);
    setTimeout(() => {
      setAppliedFilters({
        date: selectedDate,
        viewCriteria: viewCriteria,
      });
      setIsLoadingData(false);
    }, 300);
  };

  return (
    <div className="flex-1 bg-white flex flex-col overflow-y-auto p-2.5 space-y-2.5">
      {/* Top Banner & Control Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* Outlet Identity Banner */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded p-2.5 flex items-center space-x-3 shadow-sm">
          {/* Logo Badge */}
          <div className="w-16 h-16 rounded bg-gradient-to-br from-brand-600 to-brand-800 border border-brand-500/50 flex flex-col items-center justify-center text-white shadow-inner flex-shrink-0">
            <Sparkles className="w-6 h-6 text-amber-300 mb-0.5 animate-pulse" />
            <span className="font-extrabold text-[11px] tracking-widest uppercase">AURA</span>
            <span className="text-[8px] text-amber-200/80 -mt-0.5 font-bold uppercase tracking-wider">TECH</span>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-100 truncate">
              {state.storeInfo.outletCode} - {state.storeInfo.outletName}
            </h1>
            <div className="text-xs text-amber-400 font-semibold mt-0.5">IT Operations & Management Dashboard</div>
            <div className="text-[11px] text-slate-400 font-mono mt-1 space-y-0.5">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>{formatDateTime(currentDateTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Lead Architect : <strong className="text-slate-200">{state.storeInfo.currentUser.id}</strong></span>
                <span>•</span>
                <span>Billing Terminal : <strong className="text-emerald-400">Desk #{state.storeInfo.activeRegisterNo}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Criteria Box */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded p-2.5 flex flex-col justify-between shadow-sm">
          <div className="text-[11px] font-bold text-amber-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span>Selection Criteria</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                appliedFilters.date === 'ALL'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {appliedFilters.date === 'ALL' ? 'ALL RECORDS' : appliedFilters.date}
              </span>
            </div>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 font-medium text-[11px] w-9">Date:</span>
              <input
                type="date"
                value={selectedDate === 'ALL' ? (availableDates[0] || '2023-01-09') : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Selection Date"
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-amber-400 flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedDate('ALL');
                  setAppliedFilters(prev => ({ ...prev, date: 'ALL' }));
                }}
                title="View aggregate metrics across all recorded invoices"
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border transition cursor-pointer ${
                  selectedDate === 'ALL'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                All
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-[11px]">
                <label className="flex items-center space-x-1 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="criteria"
                    checked={viewCriteria === 'DEPARTMENT'}
                    onChange={() => handleCriteriaChange('DEPARTMENT')}
                    className="accent-amber-400 text-xs"
                  />
                  <span>Practice Area</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="criteria"
                    checked={viewCriteria === 'CATEGORY'}
                    onChange={() => handleCriteriaChange('CATEGORY')}
                    className="accent-amber-400 text-xs"
                  />
                  <span>Category Wise</span>
                </label>
              </div>

              <button
                onClick={handleLoad}
                disabled={isLoadingData}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1 transition shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>Load</span>
              </button>
            </div>
          </div>
        </div>

        {/* Other Links Box */}
        <div className="lg:col-span-5">
          <OtherLinksBox store={store} />
        </div>
      </div>

      {/* Quick Launch Strip: IT & Office Inventory */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center space-x-2">
              <span>IT & Office Inventory Management</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                {state.inventory?.length || 0} Assets Registered
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ({state.inventory?.reduce((s, i) => s + i.availableQuantity, 0) || 0} Available, {state.inventory?.reduce((s, i) => s + i.assignedQuantity, 0) || 0} Assigned)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Manage IT equipment (laptops, servers, switches) & office furniture with employee assignment tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('STORING')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center space-x-1.5 transition cursor-pointer"
          >
            <span>Open IT Inventory & Resources</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Dashboard Layout */}
      {state.activeTopTab === 'DASHBOARD_MANAGER' && (
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 transition-opacity duration-200 ${isLoadingData ? 'opacity-50' : 'opacity-100'}`}>
          {/* Left Column: Sales Overview KPI Matrix */}
          <div className="lg:col-span-3 min-h-[460px]">
            <SalesOverviewKPI store={store} dynamicData={dynamicData} />
          </div>

          {/* Center Column: Cash Register Sales + Hourly Graph */}
          <div className="lg:col-span-4 flex flex-col space-y-2.5 min-h-[460px]">
            <div className="flex-1 min-h-[220px]">
              <RegisterSalesTable store={store} registers={dynamicData.registers} />
            </div>
            <div className="h-[230px]">
              <HourlySalesChart store={store} hourlySales={dynamicData.hourlySales} />
            </div>
          </div>

          {/* Right Column: Department Sales + Top Inc/Dec + Top Contribution */}
          <div className="lg:col-span-5 flex flex-col space-y-2.5 min-h-[460px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1 min-h-[220px]">
              <DepartmentSalesTable
                store={store}
                departments={dynamicData.departments}
                title={appliedFilters.viewCriteria === 'CATEGORY' ? 'Category Wise Revenue' : 'Practice Area Wise Revenue'}
                divisionLabel={appliedFilters.viewCriteria === 'CATEGORY' ? 'Business Category' : 'Practice Division'}
              />
              <TopIncDecTable
                store={store}
                departments={dynamicData.departments}
                title={appliedFilters.viewCriteria === 'CATEGORY' ? 'Top Inc./Dec. (Categories)' : 'Top Inc./Dec. (Practice Lines)'}
                divisionLabel={appliedFilters.viewCriteria === 'CATEGORY' ? 'Business Category' : 'Practice Division'}
              />
            </div>
            <div className="h-[230px]">
              <TopContributionChart
                store={store}
                departments={dynamicData.departments}
                title={appliedFilters.viewCriteria === 'CATEGORY' ? 'Top Category Revenue Contribution' : 'Top Practice Revenue Contribution'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Unassigned Assets & License Analysis */}
      {state.activeTopTab === 'UNSOLD_ANALYSIS' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 flex-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Unassigned Assets & Slow-Moving License Allocations</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Hardware modules and reserved license allocations with 0 client assignments over the last 30/60/90 days recommended for inter-DC transfer or promotional discounts.
              </p>
            </div>
            <span className="bg-amber-950 text-amber-400 border border-amber-800 px-2.5 py-1 rounded text-xs font-mono font-bold">
              18 Idle Solution SKUs Identified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-850 text-slate-400 text-[11px] border-b border-slate-800">
                  <th className="p-2">Barcode / SKU</th>
                  <th className="p-2">Solution / Asset Description</th>
                  <th className="p-2">Practice Area</th>
                  <th className="p-2 text-right">Unit Rate</th>
                  <th className="p-2 text-center">Current Stock</th>
                  <th className="p-2 text-center">Days In Vault</th>
                  <th className="p-2 text-center">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {state.products.filter(p => p.agingDays > 30).map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/50">
                    <td className="p-2 text-amber-300 font-bold">{p.barcode}</td>
                    <td className="p-2 text-slate-200 font-sans">{p.name}</td>
                    <td className="p-2 text-slate-400 font-sans">{p.department}</td>
                    <td className="p-2 text-right text-emerald-400">৳{p.price.toLocaleString()}</td>
                    <td className="p-2 text-center text-slate-100 font-bold">{p.stock} units</td>
                    <td className="p-2 text-center text-rose-400 font-bold">{p.agingDays} days</td>
                    <td className="p-2 text-center">
                      <span className="bg-brand-950 text-brand-300 border border-brand-800 px-2 py-0.5 rounded text-[10px] font-sans">
                        Apply 15% SOW Promo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab: Datacenter Product Display and Store Analysis */}
      {state.activeTopTab === 'STORE_ANALYSIS' && (
        <div className="bg-slate-900 border border-slate-800 rounded p-4 flex-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Award className="w-5 h-5 text-sky-400" />
                <span>Datacenter Rack Health & Server Capacity Analysis</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Server rack bay capacity, power/cooling compliance score, and hardware maintenance status for DC01 Silicon Tower.
              </p>
            </div>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded text-xs font-mono font-bold">
              Facility Health Score: 98.4%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="bg-slate-850 p-3 rounded border border-slate-750">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Zone A: Compute Clusters (Dell PowerEdge)</div>
              <div className="text-lg font-bold text-slate-100 font-mono mt-1">100% Thermal & PUE Compliance</div>
              <div className="text-slate-400 mt-2 text-[11px]">All 4 compute clusters active with dual redundant UPS. Cold-aisle temperature optimal at 20.5°C.</div>
            </div>
            <div className="bg-slate-850 p-3 rounded border border-slate-750">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Zone B: Core Routing & Fortinet/Cisco Bays</div>
              <div className="text-lg font-bold text-amber-400 font-mono mt-1">92% Port Density Compliance</div>
              <div className="text-slate-400 mt-2 text-[11px]">SFP+ 10Gbps optical uplink module running near capacity on Bay 2. Buffer spares available in BR-03.</div>
            </div>
            <div className="bg-slate-850 p-3 rounded border border-slate-750">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Zone C: AI GPU & LLM Acceleration Nodes</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">98% Compute Workload Compliance</div>
              <div className="text-slate-400 mt-2 text-[11px]">High-performance PyTorch inference clusters operational with 99.99% uptime guarantee.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
