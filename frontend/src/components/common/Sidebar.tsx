import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Briefcase,
  FolderKanban,
  TrendingUp,
  Server,
  Package,
  Receipt,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wifi
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface SidebarProps {
  store: ReturnType<typeof useERPStore>;
}

export const Sidebar: React.FC<SidebarProps> = ({ store }) => {
  const { state, setView } = store;
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // MAIN Navigation Items
  const mainNavItems = [
    {
      id: 'DASHBOARD',
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-white',
      isActive: state.currentView === 'DASHBOARD',
      onClick: () => setView('DASHBOARD'),
    },
    {
      id: 'MY_TASKS',
      label: 'My Tasks',
      icon: CheckSquare,
      iconColor: 'text-amber-400',
      isActive: state.currentView === 'MY_TASKS',
      onClick: () => setView('MY_TASKS'),
    },
    {
      id: 'HR',
      label: 'HR & Employees',
      icon: Users,
      iconColor: 'text-white',
      isActive: state.currentView === 'STAFF',
      onClick: () => setView('STAFF'),
    },
    {
      id: 'CRM',
      label: 'CRM',
      icon: Briefcase,
      iconColor: 'text-white',
      isActive: state.currentView === 'CRM',
      onClick: () => setView('CRM'),
    },
    {
      id: 'PROJECTS',
      label: 'Project Management',
      icon: FolderKanban,
      iconColor: 'text-white',
      isActive: state.currentView === 'ECOMMERCE',
      onClick: () => setView('ECOMMERCE'),
    },
    {
      id: 'SALES',
      label: 'Sales & Service',
      icon: TrendingUp,
      iconColor: 'text-white',
      isActive: state.currentView === 'POS',
      onClick: () => setView('POS'),
    },
    {
      id: 'IT_ASSETS',
      label: 'IT Assets & Resources',
      icon: Server,
      iconColor: 'text-white',
      isActive: ['STORING', 'DAMAGE', 'SHOPPING_BAG'].includes(state.currentView),
      onClick: () => setView('STORING'),
    },
    {
      id: 'PROCUREMENT',
      label: 'Procurement & Vendors',
      icon: Package,
      iconColor: 'text-white',
      isActive: ['RECEIVE', 'REQUISITION', 'TRANSFER'].includes(state.currentView),
      onClick: () => setView('RECEIVE'),
    },
    {
      id: 'FINANCE',
      label: 'Finance & Accounting',
      icon: Receipt,
      iconColor: 'text-white',
      isActive: state.currentView === 'REPORT',
      onClick: () => setView('REPORT'),
    },
    {
      id: 'HELPDESK',
      label: 'Help Desk & Support',
      icon: LifeBuoy,
      iconColor: 'text-white',
      isActive: state.currentView === 'REPAIR',
      onClick: () => setView('REPAIR'),
    },
    {
      id: 'REPORTS',
      label: 'Reports & Analytics',
      icon: BarChart3,
      iconColor: 'text-white',
      isActive: state.currentView === 'BI_TOOLS',
      onClick: () => setView('BI_TOOLS'),
    },
  ];

  // SYSTEM Navigation Items
  const systemNavItems = [
    {
      id: 'USER_MGMT',
      label: 'User Management',
      icon: ShieldCheck,
      iconColor: 'text-white',
      isActive: state.currentView === 'ADMIN',
      onClick: () => setView('ADMIN'),
    },
    {
      id: 'ACTIVITY_LOG',
      label: 'Activity Log',
      icon: Activity,
      iconColor: 'text-white',
      isActive: state.currentView === 'AUDIT',
      onClick: () => setView('AUDIT'),
    },
    {
      id: 'SETTINGS',
      label: 'Settings',
      icon: Settings,
      iconColor: 'text-white',
      isActive: state.currentView === 'SETUP',
      onClick: () => setView('SETUP'),
    },
    {
      id: 'LOGOUT',
      label: 'Logout',
      icon: LogOut,
      iconColor: 'text-white',
      isActive: false,
      onClick: () => setShowLogoutConfirm(true),
    },
  ];

  // RBAC Permission Check: Filter items based on currently logged in user's role and allowed views
  const isViewAllowed = (view: string): boolean => {
    if (state.currentUser?.role === 'Super Admin') return true;
    const allowed = state.currentUser?.permissions?.allowedViews;
    if (!allowed || allowed.length === 0) return true;
    return allowed.includes(view as any);
  };

  const filteredMainNavItems = mainNavItems.filter((item) => {
    switch (item.id) {
      case 'DASHBOARD':
        return isViewAllowed('DASHBOARD');
      case 'MY_TASKS':
        return isViewAllowed('MY_TASKS');
      case 'HR':
        return isViewAllowed('STAFF');
      case 'CRM':
        return isViewAllowed('CRM');
      case 'PROJECTS':
        return isViewAllowed('ECOMMERCE');
      case 'SALES':
        return isViewAllowed('POS');
      case 'IT_ASSETS':
        return isViewAllowed('STORING');
      case 'PROCUREMENT':
        return isViewAllowed('RECEIVE');
      case 'FINANCE':
        return isViewAllowed('REPORT');
      case 'HELPDESK':
        return isViewAllowed('REPAIR');
      case 'REPORTS':
        return isViewAllowed('BI_TOOLS');
      default:
        return true;
    }
  });

  const filteredSystemNavItems = systemNavItems.filter((item) => {
    switch (item.id) {
      case 'USER_MGMT':
        return (
          isViewAllowed('ADMIN') &&
          (state.currentUser?.role === 'Super Admin' || Boolean(state.currentUser?.permissions?.canManageUsers))
        );
      case 'ACTIVITY_LOG':
        return isViewAllowed('AUDIT');
      case 'SETTINGS':
        return (
          isViewAllowed('SETUP') &&
          (state.currentUser?.role === 'Super Admin' || Boolean(state.currentUser?.permissions?.canManageSettings))
        );
      case 'LOGOUT':
        return true;
      default:
        return true;
    }
  });

  return (
    <aside
      className={`bg-[#30AFFF] border-r border-[#209BEF] flex flex-col transition-all duration-200 select-none z-10 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Top Header of Sidebar */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#249CEE] text-white border-b border-[#209BEF] font-semibold text-xs tracking-wide">
        {!collapsed && (
          <div className="truncate flex items-center space-x-2 font-bold text-white">
            <Server className="w-4 h-4 text-white flex-shrink-0" />
            <span className="truncate text-white">IT Enterprise Portal</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer ${
            collapsed ? 'mx-auto' : 'ml-auto'
          }`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Navigation Sub-tree Items */}
      <div className="flex-1 py-2 px-1.5 space-y-1 overflow-y-auto text-xs">
        {/* SECTION: MAIN */}
        <div className="px-2 pt-1 pb-1">
          {!collapsed ? (
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">
              MAIN ({state.currentUser?.role || 'Guest'})
            </span>
          ) : (
            <div className="h-px bg-white/20 my-1 mx-1" />
          )}
        </div>

        {filteredMainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-1' : 'px-2.5'
              } py-2 rounded text-left transition font-medium cursor-pointer group ${
                item.isActive
                  ? 'bg-[#F26522] text-white font-bold shadow-md ring-1 ring-[#F26522]/50'
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              title={item.label}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 text-white ${
                  !collapsed ? 'mr-2.5' : ''
                }`}
              />
              {!collapsed && <span className="truncate text-white font-medium">{item.label}</span>}
            </button>
          );
        })}

        {/* SECTION: SYSTEM */}
        <div className="px-2 pt-3 pb-1 border-t border-[#209BEF] mt-2">
          {!collapsed ? (
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block">
              SYSTEM
            </span>
          ) : (
            <div className="h-px bg-white/20 my-1 mx-1" />
          )}
        </div>

        {filteredSystemNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-1' : 'px-2.5'
              } py-2 rounded text-left transition font-medium cursor-pointer group ${
                item.isActive
                  ? 'bg-[#F26522] text-white font-bold shadow-md ring-1 ring-[#F26522]/50'
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              title={item.label}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 text-white ${
                  !collapsed ? 'mr-2.5' : ''
                }`}
              />
              {!collapsed && <span className="truncate text-white font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom Node Status Footer */}
      <div className="bg-[#249CEE] border-t border-[#209BEF] px-3 py-2 text-[11px] select-none text-white">
        {!collapsed ? (
          <div className="flex items-center justify-between text-white font-mono">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <span className="truncate text-white">DC01 Silicon Tower</span>
            </div>
            <Wifi className="w-3 h-3 text-white flex-shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center" title="Cloud Node Online: DC01 Silicon Tower">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal - rendered in document.body to prevent stacking context & clipping issues */}
      {showLogoutConfirm && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-150"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">Sign Out of AuraTech ERP?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All unsaved terminal drafts and temporary filters will be preserved locally.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">• Active User:</span>
                <span className="text-amber-400 font-semibold">{state.currentUser?.name} ({state.currentUser?.role})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">• Node:</span>
                <span className="text-slate-200">DC01 Silicon Tower Tech Hub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">• Session Security:</span>
                <span className="text-emerald-400">TLS 1.3 / MFA Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  store.logout();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Sign Out</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};
