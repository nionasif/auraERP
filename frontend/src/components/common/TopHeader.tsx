import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  TrendingUp,
  Server,
  Package,
  Receipt,
  LifeBuoy,
  BarChart3,
  Bell,
  User,
  Settings,
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldCheck,
  LogOut,
  ChevronDown,
  UserCheck,
  CheckSquare
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { ViewType, UserRole } from '../../types/erp';

interface TopHeaderProps {
  store: ReturnType<typeof useERPStore>;
}

const AVAILABLE_ROLES: UserRole[] = [
  'Super Admin',
  'HR Manager',
  'Sales Manager',
  'Project Manager',
  'Finance Manager',
  'Procurement Manager',
  'Support Staff',
  'Employee',
];

export const TopHeader: React.FC<TopHeaderProps> = ({ store }) => {
  const { state, setView, resetToDemo, closeModal, loginAsRole, logout, openModal } = store;

  const currentUser = state.currentUser;

  // Dropdown states for right-side items
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowUserProfile(false);
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isViewAllowed = (view: ViewType): boolean => {
    if (!currentUser?.permissions?.allowedViews) return true;
    return currentUser.permissions.allowedViews.includes(view);
  };

  // 10 IT Top Navigation Items filtered by user's assigned role
  const allNavItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    view: ViewType;
    isActive: boolean;
    onClick: () => void;
  }> = [
    {
      id: 'DASHBOARD',
      label: 'Dashboard',
      icon: LayoutDashboard,
      view: 'DASHBOARD',
      isActive: state.currentView === 'DASHBOARD',
      onClick: () => setView('DASHBOARD'),
    },
    {
      id: 'MY_TASKS',
      label: 'My Tasks',
      icon: CheckSquare,
      view: 'MY_TASKS',
      isActive: state.currentView === 'MY_TASKS',
      onClick: () => setView('MY_TASKS'),
    },
    {
      id: 'HR',
      label: 'HR & Employees',
      icon: Users,
      view: 'STAFF',
      isActive: state.currentView === 'STAFF',
      onClick: () => setView('STAFF'),
    },
    {
      id: 'CRM',
      label: 'CRM',
      icon: Briefcase,
      view: 'CRM',
      isActive: state.currentView === 'CRM',
      onClick: () => setView('CRM'),
    },
    {
      id: 'PROJECTS',
      label: 'Project Management',
      icon: FolderKanban,
      view: 'ECOMMERCE',
      isActive: state.currentView === 'ECOMMERCE',
      onClick: () => setView('ECOMMERCE'),
    },
    {
      id: 'SALES',
      label: 'Sales & Service',
      icon: TrendingUp,
      view: 'POS',
      isActive: state.currentView === 'POS',
      onClick: () => setView('POS'),
    },
    {
      id: 'ASSETS',
      label: 'IT Assets',
      icon: Server,
      view: 'STORING',
      isActive: ['STORING', 'DAMAGE', 'SHOPPING_BAG'].includes(state.currentView),
      onClick: () => setView('STORING'),
    },
    {
      id: 'PROCUREMENT',
      label: 'Procurement',
      icon: Package,
      view: 'RECEIVE',
      isActive: ['RECEIVE', 'REQUISITION', 'TRANSFER'].includes(state.currentView),
      onClick: () => setView('RECEIVE'),
    },
    {
      id: 'FINANCE',
      label: 'Finance',
      icon: Receipt,
      view: 'REPORT',
      isActive: state.currentView === 'REPORT',
      onClick: () => setView('REPORT'),
    },
    {
      id: 'HELPDESK',
      label: 'Help Desk',
      icon: LifeBuoy,
      view: 'REPAIR',
      isActive: state.currentView === 'REPAIR',
      onClick: () => setView('REPAIR'),
    },
    {
      id: 'REPORTS',
      label: 'Reports',
      icon: BarChart3,
      view: 'BI_TOOLS',
      isActive: state.currentView === 'BI_TOOLS',
      onClick: () => setView('BI_TOOLS'),
    },
  ];

  const topNavItems = allNavItems.filter(item => isViewAllowed(item.view));

  const getViewLabel = (view: ViewType): string => {
    switch (view) {
      case 'DASHBOARD': return 'Dashboard';
      case 'MY_TASKS': return 'My Tasks & Work';
      case 'STAFF': return 'HR & Employees';
      case 'CRM': return 'CRM';
      case 'ECOMMERCE': return 'Project Management';
      case 'POS': return 'Sales & Service';
      case 'STORING': return 'IT Assets & Resources';
      case 'RECEIVE': return 'Procurement & Vendors';
      case 'REPORT': return 'Finance & Accounting';
      case 'REPAIR': return 'Help Desk & Support';
      case 'BI_TOOLS': return 'Reports & Analytics';
      case 'ADMIN': return 'User Management';
      case 'AUDIT': return 'Activity Log';
      case 'SETUP': return 'Settings';
      case 'TRANSFER': return 'Inter-Node Hardware Transfer';
      case 'REQUISITION': return 'Procurement Requisition';
      case 'DAMAGE': return 'Hardware RMA Quarantine';
      case 'SHOPPING_BAG': return 'Hardware Consumables & Media';
      default: return 'Dashboard';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'HR Manager':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'Sales Manager':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Project Manager':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Finance Manager':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Procurement Manager':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Support Staff':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Employee':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="bg-[#30AFFF] text-white border-b border-[#209BEF] select-none shadow-md">
      {/* 1. OS-Style Window Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#249CEE] text-xs border-b border-[#209BEF]">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-[#F26522] flex items-center justify-center font-bold text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold tracking-wide text-white">
            AuraTech ERP - {state.currentView === 'DASHBOARD' ? 'Operations & Executive Dashboard' : `${getViewLabel(state.currentView)} Workspace`}
          </span>
          <span className="text-white/90 font-mono text-[11px] hidden sm:inline">
            [v4.8 Enterprise IT Edition | DC01 Silicon Tower Tech Hub]
          </span>
        </div>

        {/* Window Controls & Reset Demo */}
        <div className="flex items-center space-x-2">
          {currentUser && (
            <div className="hidden lg:flex items-center space-x-2 mr-2 pr-2 border-r border-[#209BEF]">
              <span className="text-[11px] text-white/90">Signed in as:</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRoleBadgeStyle(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
          )}

          <button
            onClick={() => resetToDemo()}
            title="Reset to fresh demo dataset"
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#1C88D4] hover:bg-[#1577BD] text-white text-[11px] border border-white/20 transition shadow-sm font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#F26522]" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* Windows / macOS-style minimize, maximize, close window controls */}
          <div className="flex items-center space-x-1.5 ml-2 pl-2 border-l border-[#209BEF]">
            <button
              onClick={() => setView('DASHBOARD')}
              className="w-3 h-3 rounded-full bg-amber-500/90 hover:bg-amber-400 cursor-pointer flex items-center justify-center text-[9px] text-slate-950 font-extrabold leading-none transition"
              title="Minimize / Return to Dashboard"
            >
              –
            </button>
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="w-3 h-3 rounded-full bg-emerald-500/90 hover:bg-emerald-400 cursor-pointer flex items-center justify-center text-[7px] text-slate-950 font-extrabold leading-none transition"
              title="Toggle Fullscreen"
            >
              □
            </button>
            <button
              onClick={() => closeModal()}
              className="w-3 h-3 rounded-full bg-rose-500/90 hover:bg-rose-400 cursor-pointer flex items-center justify-center text-[9px] text-white font-bold leading-none transition"
              title="Close Active Modal / Return to Dashboard (Esc)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Bar: Left = Filtered IT Items, Right = Notifications, User Profile, Settings */}
      <nav className="flex items-center justify-between px-3 py-1.5 bg-[#30AFFF] border-b border-[#209BEF] text-xs overflow-x-auto whitespace-nowrap">
        {/* Left Side: Filtered IT Navigation Items */}
        <div className="flex items-center space-x-1 text-white font-medium">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`px-3 py-1 rounded transition flex items-center space-x-1.5 text-[12px] cursor-pointer group ${
                  item.isActive
                    ? 'bg-[#F26522] text-white font-bold shadow-md ring-1 ring-[#F26522]/50'
                    : 'text-white hover:bg-white/10 hover:text-white font-medium'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                    item.isActive ? 'text-white' : 'text-white/80 group-hover:text-[#F26522]'
                  }`}
                />
                <span className="text-white font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Notifications, User Profile, Settings */}
        <div className="flex items-center space-x-1.5 pl-3 ml-2 border-l border-[#209BEF] text-white">
          {/* 1. Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserProfile(false);
              }}
              className={`relative p-1.5 rounded transition flex items-center justify-center cursor-pointer ${
                showNotifications
                  ? 'bg-white/20 text-white'
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              title="System Notifications & Alerts"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-bold text-[9px] px-1 rounded-full border border-slate-900 leading-none py-0.5">
                3
              </span>
            </button>

            {/* Notifications Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-750 rounded-lg shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between font-semibold">
                  <span className="text-slate-200">System Notifications</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                    3 unread
                  </span>
                </div>
                <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                  <div className="px-3 py-2.5 hover:bg-slate-850 cursor-pointer transition">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-200">Hardware Allocation Alert</p>
                        <p className="text-slate-400 text-[11px]">MacBook Pro M3 Max inventory low (2 units remaining).</p>
                        <span className="text-slate-500 text-[10px] font-mono">12m ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2.5 hover:bg-slate-850 cursor-pointer transition">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-200">Invoice Generated</p>
                        <p className="text-slate-400 text-[11px]">INV-2026-DC01-001 issued for Bangladesh Telecom.</p>
                        <span className="text-slate-500 text-[10px] font-mono">35m ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2.5 hover:bg-slate-850 cursor-pointer transition">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-200">Role & Security Policy</p>
                        <p className="text-slate-400 text-[11px]">8 RBAC security profiles loaded and verified.</p>
                        <span className="text-slate-500 text-[10px] font-mono">1h ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-3 pt-2 border-t border-slate-800 flex justify-between text-[11px]">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Mark all as read
                  </button>
                  {isViewAllowed('AUDIT') && (
                    <button
                      onClick={() => {
                        setView('AUDIT');
                        setShowNotifications(false);
                      }}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      View Activity Log →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. User Profile & Quick Switcher Popover */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowUserProfile(!showUserProfile);
                setShowNotifications(false);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition text-[12px] font-medium cursor-pointer ${
                showUserProfile
                  ? 'bg-white/20 text-white ring-1 ring-[#F26522]/50'
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              title="User Account, Role Switcher & Security"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#F26522] to-amber-500 flex items-center justify-center font-bold text-white text-[10px] shadow-sm">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AU'}
              </div>
              <span className="hidden md:inline font-semibold text-white">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
              </span>
              <span className={`hidden xl:inline text-[9px] px-1.5 py-0.2 rounded font-bold border ${currentUser ? getRoleBadgeStyle(currentUser.role) : ''}`}>
                {currentUser?.role}
              </span>
              <ChevronDown className="w-3 h-3 text-white" />
            </button>

            {/* User Profile Popover */}
            {showUserProfile && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-3.5 z-50 text-xs space-y-3">
                {/* User Info Header */}
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-brand-600 flex items-center justify-center font-bold text-slate-950 text-base shadow flex-shrink-0">
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AU'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-100 truncate text-sm">
                      {currentUser?.name || 'Administrator'}
                    </h4>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${currentUser ? getRoleBadgeStyle(currentUser.role) : ''}`}>
                        {currentUser?.role}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate mt-0.5 font-mono">
                      {currentUser?.email || 'admin@auratech.it'}
                    </p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-1.5 text-slate-300 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">User ID:</span>
                    <span className="text-slate-200">{currentUser?.id || 'USR-001'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-200">{currentUser?.department || 'IT Operations'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Accessible Modules:</span>
                    <span className="text-amber-400 font-bold">{currentUser?.permissions.allowedViews.length || 0} modules</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Admin Clearance:</span>
                    <span className={currentUser?.permissions.canManageUsers ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {currentUser?.permissions.canManageUsers ? 'Active (User Admin)' : 'Restricted (User)'}
                    </span>
                  </div>
                </div>

                {/* Instant Role Switcher (Demo Simulator) */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Switch Role (Instant Test)</span>
                    </span>
                    <button
                      onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      {showRoleSwitcher ? 'Collapse' : 'Expand 8 Roles'}
                    </button>
                  </div>

                  {showRoleSwitcher && (
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-950 rounded border border-slate-800 mb-2">
                      {AVAILABLE_ROLES.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            loginAsRole(r);
                            setShowUserProfile(false);
                            setShowRoleSwitcher(false);
                          }}
                          className={`px-2 py-1 rounded text-left text-[10px] font-semibold transition truncate border ${
                            currentUser?.role === r
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Shortcuts */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800">
                  {currentUser?.permissions.canManageUsers && (
                    <button
                      onClick={() => {
                        setView('ADMIN');
                        setShowUserProfile(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition flex items-center justify-between"
                    >
                      <span className="flex items-center space-x-2">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>Manage Users & Permissions</span>
                      </span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                        Admin
                      </span>
                    </button>
                  )}

                  {currentUser?.permissions.canGenerateInvoices && (
                    <button
                      onClick={() => {
                        openModal('INVOICE_MANAGEMENT');
                        setShowUserProfile(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition flex items-center space-x-2"
                    >
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Invoices & Billing Studio</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserProfile(false);
                      logout();
                    }}
                    className="w-full py-1.5 px-2.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold transition flex items-center justify-center space-x-1.5 border border-rose-500/30"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Settings */}
          {isViewAllowed('SETUP') && (
            <button
              onClick={() => setView('SETUP')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition text-[12px] font-medium cursor-pointer ${
                state.currentView === 'SETUP'
                  ? 'bg-[#F26522] text-white font-bold shadow-md'
                  : 'text-white hover:text-white hover:bg-white/10'
              }`}
              title="System & Infrastructure Settings"
            >
              <Settings className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline text-white">Settings</span>
            </button>
          )}
        </div>
      </nav>

      {/* 3. Sub-Header Workspace Indicator / Return to Dashboard */}
      {state.currentView !== 'DASHBOARD' && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#249CEE] border-b border-[#209BEF] text-xs select-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('DASHBOARD')}
              className="px-2.5 py-1 font-medium text-white hover:text-white hover:bg-white/15 rounded flex items-center space-x-1.5 transition cursor-pointer"
              title="Return to Main Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-medium">Dashboard</span>
            </button>

            <span className="text-white/60">/</span>

            {/* Active Workspace Tab with closing 'X' */}
            <div className="px-3 py-1 font-bold border border-white/30 text-white bg-[#30AFFF] rounded flex items-center space-x-2 shadow-sm">
              <span className="text-white">{getViewLabel(state.currentView)}</span>
              <button
                onClick={() => setView('DASHBOARD')}
                className="w-4 h-4 rounded hover:bg-rose-600 hover:text-white flex items-center justify-center text-white/80 transition cursor-pointer"
                title="Close tab (Return to Dashboard)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Prominent Header Close Button */}
          <button
            onClick={() => setView('DASHBOARD')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1C88D4] hover:bg-rose-600 text-white hover:text-white border border-white/20 hover:border-rose-500 transition text-[11px] font-semibold cursor-pointer"
            title="Close this module and return to Dashboard (Esc)"
          >
            <X className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Close to Dashboard (Esc)</span>
          </button>
        </div>
      )}
    </header>
  );
};

