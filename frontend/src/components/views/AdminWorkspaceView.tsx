import React from 'react';
import { useERPStore } from '../../store/erpStore';
import { UserManagementView } from '../users/UserManagementView';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const AdminWorkspaceView: React.FC<AdminWorkspaceViewProps> = ({ store }) => {
  const { state, setView } = store;

  // Verify Admin Permissions
  const canAccess =
    state.currentUser.role === 'Super Admin' ||
    state.currentUser.permissions?.canManageUsers ||
    state.currentUser.permissions?.allowedViews?.includes('ADMIN');

  if (!canAccess) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Access Restricted</h3>
            <p className="text-xs text-slate-400 mt-1">
              User Management is restricted to Super Admin or authorized leadership roles. Your current role is{' '}
              <strong className="text-amber-400">{state.currentUser.role}</strong>.
            </p>
          </div>
          <button
            onClick={() => setView('DASHBOARD')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return <UserManagementView store={store} />;
};

export default AdminWorkspaceView;
