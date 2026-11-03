import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Key,
  Shield,
  Lock,
  ChevronRight,
  Server,
  X,
  UserCheck,
  Building,
  Mail,
  Phone,
  Layers,
  Sparkles
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { UserAccount, UserRole, UserPermissions, ViewType } from '../../types/erp';
import { getDefaultPermissionsForRole, ALL_VIEWS } from '../../data/mockUsers';

interface UserManagementViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ store }) => {
  const {
    state,
    setView,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    updateUserPermissions,
  } = store;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<UserAccount | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserAccount | null>(null);

  // Form state for Create User
  const [newUserData, setNewUserData] = useState<Partial<UserAccount>>({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'Employee',
    department: 'Software Engineering',
    status: 'ACTIVE',
  });

  // Filtered Users
  const filteredUsers = state.users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = state.users.filter((u) => u.status === 'ACTIVE').length;
  const inactiveCount = state.users.filter((u) => u.status === 'INACTIVE').length;
  const adminCount = state.users.filter((u) => u.role === 'Super Admin').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.username) {
      alert('Please provide Name and Username.');
      return;
    }
    const role: UserRole = (newUserData.role as UserRole) || 'Employee';
    createUser({
      ...newUserData,
      role,
      permissions: getDefaultPermissionsForRole(role),
    });
    setShowCreateModal(false);
    setNewUserData({
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'Employee',
      department: 'Software Engineering',
      status: 'ACTIVE',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser);
    setEditingUser(null);
  };

  const handleRoleChangeInEdit = (role: UserRole) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      role,
      permissions: getDefaultPermissionsForRole(role),
    });
  };

  const handleTogglePermission = (field: keyof Omit<UserPermissions, 'allowedViews'>) => {
    if (!permissionsUser) return;
    const updated: UserPermissions = {
      ...permissionsUser.permissions,
      [field]: !permissionsUser.permissions[field],
    };
    setPermissionsUser({
      ...permissionsUser,
      permissions: updated,
    });
  };

  const handleToggleAllowedView = (view: ViewType) => {
    if (!permissionsUser) return;
    const currentViews = permissionsUser.permissions.allowedViews || [];
    const hasView = currentViews.includes(view);
    const updatedViews = hasView
      ? currentViews.filter((v) => v !== view)
      : [...currentViews, view];

    setPermissionsUser({
      ...permissionsUser,
      permissions: {
        ...permissionsUser.permissions,
        allowedViews: updatedViews,
      },
    });
  };

  const handleSavePermissions = () => {
    if (!permissionsUser) return;
    updateUserPermissions(permissionsUser.id, permissionsUser.permissions);
    setPermissionsUser(null);
  };

  const roleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'HR Manager':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Sales Manager':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Project Manager':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Finance Manager':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Procurement Manager':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Support Staff':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Employee':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

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

  const VIEW_LABELS: Record<ViewType, string> = {
    DASHBOARD: 'Dashboard',
    MY_TASKS: 'My Tasks & Work',
    STAFF: 'HR & Employees',
    CRM: 'CRM',
    ECOMMERCE: 'Project Management',
    POS: 'Sales & Service (POS)',
    STORING: 'IT Assets & Resources',
    RECEIVE: 'Procurement & Vendors',
    REPORT: 'Finance & Accounting',
    REPAIR: 'Help Desk & Support',
    BI_TOOLS: 'Reports & Analytics',
    ADMIN: 'User Management',
    AUDIT: 'Activity Log',
    SETUP: 'Settings',
    TRANSFER: 'IT Assets Transfer',
    REQUISITION: 'Procurement Requisition',
    DAMAGE: 'Hardware RMA',
    SHOPPING_BAG: 'IT Consumables',
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* Top Header / Breadcrumb */}
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
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enterprise User Management & Role-Based Access Control</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px] hidden lg:inline">
            [Authorized: {state.currentUser.name} - {state.currentUser.role}]
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('STAFF')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition border border-amber-500/40"
            title="Navigate to HR & Employee Management"
          >
            <Users className="w-4 h-4" />
            <span>HR & Employees Directory</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
          <button
            onClick={() => setView('DASHBOARD')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition text-[11px] font-semibold"
            title="Return to Dashboard (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Total Registered Users</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1.5 font-mono">
              {state.users.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Enterprise Directory Sync OK</div>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Active Accounts</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1.5 font-mono">
              {activeCount}
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-1 font-mono">Permitted login access</div>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Deactivated Users</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1.5 font-mono">
              {inactiveCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">Access currently revoked</div>
          </div>

          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">System Super Admins</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1.5 font-mono">
              {adminCount}
            </div>
            <div className="text-[10px] text-amber-500/80 mt-1 font-mono">Unrestricted root governance</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user by name, email, username or department..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-sans focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-[11px]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Roles</option>
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r} className="bg-slate-900">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Status</option>
                <option value="ACTIVE" className="bg-slate-900">Active Only</option>
                <option value="INACTIVE" className="bg-slate-900">Inactive Only</option>
              </select>
            </div>

            {(search || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800">
                  <th className="p-3">User & Contact</th>
                  <th className="p-3">Role & Access Tier</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Permissions & Views</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelf = user.id === state.currentUser.id;
                    return (
                      <tr key={user.id} className="hover:bg-slate-850/60 transition group">
                        {/* User & Contact */}
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold flex items-center justify-center text-xs shadow">
                              {user.avatar || user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                                <span>{user.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                                    Current User
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                @{user.username} • {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {user.phone}
                                </div>
                              )}
                              {user.employee_id && (
                                <div className="mt-1 flex items-center space-x-1.5">
                                  <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    user.employee_status === 'Active'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  }`}>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Employee: {user.employee_id} ({user.employee_status || 'Linked'})</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="p-3 text-slate-300 text-[11px]">
                          {user.department}
                        </td>

                        {/* Status Toggle */}
                        <td className="p-3">
                          <button
                            onClick={() => {
                              if (isSelf) {
                                alert('You cannot deactivate your currently active session user.');
                                return;
                              }
                              toggleUserStatus(user.id);
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition flex items-center space-x-1.5 ${
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-700'
                            }`}
                            title={isSelf ? 'Cannot deactivate self' : 'Click to toggle Active / Inactive'}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                            <span>{user.status}</span>
                          </button>
                        </td>

                        {/* Permissions & Views */}
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setPermissionsUser(user)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 text-[11px] flex items-center space-x-1 transition"
                            >
                              <Key className="w-3 h-3" />
                              <span>
                                {user.permissions.allowedViews?.length || 0} Modules Allowed
                              </span>
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 transition"
                              title="Edit User Details & Reassign Role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setPermissionsUser(user)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-sky-600/30 text-sky-400 hover:text-sky-300 transition"
                              title="Manage User Permissions & Feature Access"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => setDeleteConfirmUser(user)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Showing {filteredUsers.length} of {state.users.length} enterprise users</span>
            <span>Security Policy: Multi-Factor Ready / RBAC v2.4</span>
          </div>
        </div>
      </div>

      {/* --- CREATE USER MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Create New Enterprise User Account</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="e.g. Shakib Ahmed"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    placeholder="e.g. shakib.dev"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="shakib@auratech.io"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="+880 1711-223344"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role *</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r} value={r} className="bg-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserData.department}
                    onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    placeholder="e.g. Cloud Infrastructure"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  value={newUserData.password || 'password123'}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 font-mono">User can change password on first login</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  Role <strong>{newUserData.role}</strong> will automatically receive verified default module permissions.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold shadow"
                >
                  Save & Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Edit User Details: {editingUser.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => handleRoleChangeInEdit(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r} value={r} className="bg-slate-900">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Status</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={editingUser.status === 'ACTIVE'}
                      onChange={() => setEditingUser({ ...editingUser, status: 'ACTIVE' })}
                      className="text-emerald-500 focus:ring-emerald-400"
                    />
                    <span className="text-emerald-400 font-semibold text-xs">ACTIVE</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={editingUser.status === 'INACTIVE'}
                      onChange={() => setEditingUser({ ...editingUser, status: 'INACTIVE' })}
                      className="text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-rose-400 font-semibold text-xs">INACTIVE (Deactivated)</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MANAGE USER PERMISSIONS MODAL --- */}
      {permissionsUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Manage Permissions for {permissionsUser.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Role: <span className="text-amber-300 font-bold">{permissionsUser.role}</span> • ID: {permissionsUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPermissionsUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Administrative Function Privileges */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 flex items-center space-x-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Administrative & Functional Privileges</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {[
                    { key: 'canManageUsers', label: 'Create / Edit / Deactivate Users', desc: 'Full user administration rights' },
                    { key: 'canManageInventory', label: 'Add / Edit / Delete Inventory', desc: 'Direct inventory catalog maintenance' },
                    { key: 'canAssignInventory', label: 'Assign / Return Assets to Employees', desc: 'Issue equipment and log assignments' },
                    { key: 'canGenerateInvoices', label: 'Generate & Print Tax Invoices', desc: 'Create SOW billing & Mushak invoices' },
                    { key: 'canViewReports', label: 'View Financial & BI Analytics', desc: 'Access revenue metrics and margins' },
                    { key: 'canManageSettings', label: 'Configure System Settings', desc: 'Manage facility & terminal hardware' },
                  ].map((p) => {
                    const isChecked = Boolean(permissionsUser.permissions[p.key as keyof Omit<UserPermissions, 'allowedViews'>]);
                    return (
                      <label
                        key={p.key}
                        className="flex items-start space-x-2.5 p-2 rounded-lg hover:bg-slate-900 cursor-pointer transition select-none border border-slate-800/80"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(p.key as keyof Omit<UserPermissions, 'allowedViews'>)}
                          className="mt-0.5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                        />
                        <div>
                          <div className="font-semibold text-slate-200 text-xs">{p.label}</div>
                          <div className="text-[10px] text-slate-500">{p.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Module Visibility / Allowed Views Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-200 flex items-center space-x-1.5 text-xs">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span>Allowed Modules & Navigation Workspaces</span>
                  </h4>
                  <div className="space-x-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionsUser({
                          ...permissionsUser,
                          permissions: {
                            ...permissionsUser.permissions,
                            allowedViews: [...ALL_VIEWS],
                          },
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissionsUser({
                          ...permissionsUser,
                          permissions: {
                            ...permissionsUser.permissions,
                            allowedViews: ['DASHBOARD'],
                          },
                        });
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Dashboard Only
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {ALL_VIEWS.map((view) => {
                    const isAllowed = permissionsUser.permissions.allowedViews?.includes(view);
                    return (
                      <label
                        key={view}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition select-none border ${
                          isAllowed
                            ? 'bg-slate-900/90 border-amber-500/30 text-amber-300 font-semibold'
                            : 'border-slate-850 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => handleToggleAllowedView(view)}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                        />
                        <span className="text-xs truncate">{VIEW_LABELS[view] || view}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Users logging in under this profile will strictly only see the checked navigation links in the Sidebar and Top Navigation bar.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setPermissionsUser(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow"
              >
                Apply & Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Delete User Account?</h4>
                <p className="text-slate-400 text-[11px]">This action permanently removes the user login.</p>
              </div>
            </div>
            <p className="text-slate-300">
              Are you sure you want to delete <strong className="text-white">{deleteConfirmUser.name}</strong> (@{deleteConfirmUser.username})?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteUser(deleteConfirmUser.id);
                  setDeleteConfirmUser(null);
                }}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
