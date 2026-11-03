import React from 'react';
import { Building, ChevronRight, Server, X } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { SetupModal } from '../modules/SetupModal';

interface SetupWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const SetupWorkspaceView: React.FC<SetupWorkspaceViewProps> = ({ store }) => {
  const { setView } = store;

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('DASHBOARD')}
            className="text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-bold text-amber-300 flex items-center space-x-1.5">
            <Building className="w-4 h-4 text-amber-400" />
            <span>Enterprise Cloud & Tech Hub Setup Workspace</span>
          </span>
        </div>

        <button
          onClick={() => setView('DASHBOARD')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition text-[11px] font-semibold"
          title="Close workspace and return to Dashboard (Esc)"
        >
          <X className="w-3.5 h-3.5" />
          <span>Close (Esc)</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <SetupModal store={store} />
      </div>
    </div>
  );
};
