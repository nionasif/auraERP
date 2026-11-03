import React, { useState } from 'react';
import { Users, ChevronRight, Server, X, UserCheck, Calendar } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { TerminalRostersSection } from '../hr/TerminalRostersSection';
import { HrEmployeeManagementSection } from '../hr/HrEmployeeManagementSection';

interface StaffWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const StaffWorkspaceView: React.FC<StaffWorkspaceViewProps> = ({ store }) => {
  const { setView } = store;
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ROSTERS'>('EMPLOYEES');

  return (
    <div className="flex-1 min-h-0 bg-white flex flex-col overflow-hidden text-[#001E46]">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs select-none flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView('DASHBOARD')}
            className="text-slate-500 hover:text-[#001E46] flex items-center space-x-1 font-medium transition"
          >
            <Server className="w-3.5 h-3.5 text-[#001E46]" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-[#001E46] flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-[#F26522]" />
            <span>HR & Employee Management Workspace</span>
          </span>

          <div className="h-4 w-px bg-slate-300 mx-2" />

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('EMPLOYEES')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                activeTab === 'EMPLOYEES'
                  ? 'bg-[#30AFFF] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#30AFFF] hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>HR Employee Directory & Access Control</span>
            </button>
            <button
              onClick={() => setActiveTab('ROSTERS')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
                activeTab === 'ROSTERS'
                  ? 'bg-[#30AFFF] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#30AFFF] hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Terminal Rosters & Shifts (Live Desk Scheduling)</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setView('DASHBOARD')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 transition text-[11px] font-semibold"
          title="Close workspace and return to Dashboard (Esc)"
        >
          <X className="w-3.5 h-3.5" />
          <span>Close (Esc)</span>
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto relative">
        {activeTab === 'EMPLOYEES' ? (
          <HrEmployeeManagementSection store={store} />
        ) : (
          <TerminalRostersSection store={store} />
        )}
      </div>
    </div>
  );
};

