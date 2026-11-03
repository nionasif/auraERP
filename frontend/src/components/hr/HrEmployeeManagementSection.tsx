import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Key,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Building,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Plus,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { EmployeeRecord, UserRole } from '../../types/erp';
import { api } from '../../services/api';
import { EmployeePerformanceModal } from './EmployeePerformanceModal';

interface HrEmployeeManagementSectionProps {
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

const DEPARTMENTS = [
  'Executive & IT Operations',
  'Human Resources & Talent',
  'Enterprise Sales & SOW',
  'Cloud & Project Delivery',
  'Finance & Corporate Audit',
  'Supply Chain & Hardware Requisitions',
  'Datacenter RMA & Tier 2 Help Desk',
  'Software Engineering',
  'Cloud Solutions',
  'Quality Assurance',
];

export const HrEmployeeManagementSection: React.FC<HrEmployeeManagementSectionProps> = ({ store }) => {
  const { state } = store;
  const currentUser = state.currentUser;

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const isHrManager = currentUser?.role === 'HR Manager';
  const canManageEmployees = isSuperAdmin || isHrManager || currentUser?.permissions?.canManageUsers;

  // Local state
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeRecord | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);
  const [createAccountEmp, setCreateAccountEmp] = useState<EmployeeRecord | null>(null);
  const [resetPasswordEmp, setResetPasswordEmp] = useState<EmployeeRecord | null>(null);
  const [changeRoleEmp, setChangeRoleEmp] = useState<EmployeeRecord | null>(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState<EmployeeRecord | null>(null);
  const [perfEmployee, setPerfEmployee] = useState<EmployeeRecord | null>(null);

  // Forms
  const [newEmpForm, setNewEmpForm] = useState({
    employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    full_name: '',
    email: '',
    phone: '',
    department: 'Software Engineering',
    designation: 'Software Engineer',
    joining_date: new Date().toISOString().split('T')[0],
    employment_status: 'Active',
    salary: 80000,
    address: 'Dhaka, Bangladesh',
    create_login_account: true,
    login_username: '',
    login_password: 'password123',
    login_role: 'Employee' as UserRole,
  });

  const [createAccountForm, setCreateAccountForm] = useState({
    username: '',
    password: 'password123',
    role: 'Employee' as UserRole,
  });

  const [newPasswordValue, setNewPasswordValue] = useState('password123');
  const [newRoleValue, setNewRoleValue] = useState<UserRole>('Employee');

  // Load employees from FastAPI backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployeesFastAPI();
      if (res.data && Array.isArray(res.data)) {
        setEmployees(res.data);
        setBackendConnected(true);
      } else {
        setBackendConnected(false);
      }
    } catch {
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Create Employee (with optional login account creation)
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...newEmpForm,
        employee_id: newEmpForm.employee_id.trim().toUpperCase(),
        full_name: newEmpForm.full_name.trim(),
        email: newEmpForm.email.trim().toLowerCase(),
        phone: newEmpForm.phone.trim(),
        department: newEmpForm.department.trim(),
        designation: newEmpForm.designation.trim(),
        joining_date: newEmpForm.joining_date || new Date().toISOString().split('T')[0],
        employment_status: newEmpForm.employment_status,
        salary: Number(newEmpForm.salary) || 0,
        address: newEmpForm.address.trim(),
        create_login_account: newEmpForm.create_login_account,
        login_username: newEmpForm.create_login_account
          ? (newEmpForm.login_username.trim() || newEmpForm.email.split('@')[0].toLowerCase())
          : undefined,
        login_password: newEmpForm.create_login_account ? (newEmpForm.login_password || 'password123') : undefined,
        login_role: newEmpForm.create_login_account ? newEmpForm.login_role : undefined,
      };

      const res = await api.createEmployeeFastAPI(payload);

      if (res.error) {
        setModalError(res.error);
        showNotification(res.error, 'error');
        return;
      }

      showNotification(`Employee ${newEmpForm.full_name} (${newEmpForm.employee_id}) created successfully!`, 'success');
      setShowAddModal(false);
      setModalError(null);
      await fetchEmployees();

      // Reset form
      setNewEmpForm({
        employee_id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        full_name: '',
        email: '',
        phone: '',
        department: 'Finance & Corporate Audit',
        designation: 'Finance Associate',
        joining_date: new Date().toISOString().split('T')[0],
        employment_status: 'Active',
        salary: 80000,
        address: 'Dhaka, Bangladesh',
        create_login_account: true,
        login_username: '',
        login_password: 'password123',
        login_role: 'Employee',
      });
    } catch (err: any) {
      setModalError(err.message || 'Failed to create employee');
      showNotification(err.message || 'Failed to create employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Update Employee (Handles Deactivation & Disabling Login Access)
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      const res = await api.updateEmployeeFastAPI(editingEmployee.employee_id, {
        full_name: editingEmployee.full_name,
        email: editingEmployee.email,
        phone: editingEmployee.phone,
        department: editingEmployee.department,
        designation: editingEmployee.designation,
        joining_date: editingEmployee.joining_date,
        employment_status: editingEmployee.employment_status,
        salary: editingEmployee.salary,
        address: editingEmployee.address,
      });

      if (res.error) {
        showNotification(res.error, 'error');
        return;
      }

      if (editingEmployee.employment_status !== 'Active') {
        showNotification(
          `Employee marked '${editingEmployee.employment_status}'. Linked login access was automatically revoked.`,
          'success'
        );
      } else {
        showNotification(`Employee ${editingEmployee.full_name} updated successfully!`, 'success');
      }

      setEditingEmployee(null);
      fetchEmployees();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update employee', 'error');
    }
  };

  // 3. Create Login Account for Existing Employee
  const handleCreateAccountForEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAccountEmp) return;

    try {
      const res = await api.createEmployeeAccountFastAPI(createAccountEmp.employee_id, {
        username: createAccountForm.username,
        password: createAccountForm.password,
        role: createAccountForm.role,
      });

      if (res.error) {
        showNotification(res.error, 'error');
        return;
      }

      showNotification(`Login account created for ${createAccountEmp.full_name} with role '${createAccountForm.role}'!`, 'success');
      setCreateAccountEmp(null);
      fetchEmployees();
    } catch (err: any) {
      showNotification(err.message || 'Failed to create login account', 'error');
    }
  };

  // 4. Toggle Employee Account Active / Deactive
  const handleToggleAccount = async (emp: EmployeeRecord) => {
    try {
      const res = await api.toggleEmployeeAccountStatusFastAPI(emp.employee_id);
      if (res.error) {
        showNotification(res.error, 'error');
        return;
      }

      const action = emp.account_active ? 'deactivated' : 'activated';
      showNotification(`Account for ${emp.full_name} has been ${action}!`, 'success');
      fetchEmployees();
    } catch (err: any) {
      showNotification(err.message || 'Failed to toggle account', 'error');
    }
  };

  // 5. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordEmp) return;

    try {
      const res = await api.resetEmployeePasswordFastAPI(resetPasswordEmp.employee_id, newPasswordValue);
      if (res.error) {
        showNotification(res.error, 'error');
        return;
      }

      showNotification(`Password for ${resetPasswordEmp.full_name} reset successfully!`, 'success');
      setResetPasswordEmp(null);
      setNewPasswordValue('password123');
    } catch (err: any) {
      showNotification(err.message || 'Failed to reset password', 'error');
    }
  };

  // 6. Change Role
  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeRoleEmp) return;

    try {
      const res = await api.changeEmployeeRoleFastAPI(changeRoleEmp.employee_id, newRoleValue);
      if (res.error) {
        showNotification(res.error, 'error');
        return;
      }

      showNotification(`Role for ${changeRoleEmp.full_name} updated to '${newRoleValue}'!`, 'success');
      setChangeRoleEmp(null);
      fetchEmployees();
    } catch (err: any) {
      showNotification(err.message || 'Failed to change role', 'error');
    }
  };

  // 7. Delete Employee
  const handleDeleteEmployee = async () => {
    if (!deleteConfirmEmp) return;

    try {
      const res = await api.deleteEmployeeFastAPI(deleteConfirmEmp.employee_id);
      if (res.error) {
        showNotification(res.error, 'error');
        return;
      }

      showNotification(`Employee ${deleteConfirmEmp.full_name} deleted.`, 'success');
      setDeleteConfirmEmp(null);
      fetchEmployees();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete employee', 'error');
    }
  };

  // Filtered employees (sorted newest first)
  const filteredEmployees = employees
    .filter((emp) => {
      const matchesSearch =
        emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase()) ||
        emp.phone.includes(search);

      const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.employment_status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    })
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

  // Metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employment_status.toLowerCase() === 'active').length;
  const inactiveEmployees = employees.filter((e) => e.employment_status.toLowerCase() !== 'active').length;
  const withLoginAccount = employees.filter((e) => e.has_login_account).length;

  const getRoleBadge = (role?: string) => {
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
      default:
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="w-full p-3.5 space-y-3.5 text-slate-100">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Users className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-100">
                HR & Employee Management — Central Authentication & Role Control
              </h2>
              {backendConnected === true ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>FastAPI + Relational DB Connected (:8001)</span>
                </span>
              ) : backendConnected === false ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  Standby / Synchronizing
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Manage engineering staff records, link central login accounts, assign roles, and enforce access revocation on employee departure.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchEmployees}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium transition cursor-pointer"
            title="Refresh from FastAPI Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {canManageEmployees && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Total Employees</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 mt-1 font-mono">
            {totalEmployees}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active directory records</div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Active Staff</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
            {activeEmployees}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Eligible for system login</div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Inactive / Resigned</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400 mt-1 font-mono">
            {inactiveEmployees}
          </div>
          <div className="text-[10px] text-rose-500/80 mt-0.5">Login strictly revoked</div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Connected Logins</span>
            <Key className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-extrabold text-sky-400 mt-1 font-mono">
            {withLoginAccount}
          </div>
          <div className="text-[10px] text-sky-500/80 mt-0.5">Active auth credentials</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 text-xs">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Employee ID (EMP-001...), Name, Email, or Designation..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="md:col-span-3 flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer truncate"
            >
              <option value="ALL" className="bg-slate-900">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="Active" className="bg-slate-900">Active</option>
              <option value="Inactive" className="bg-slate-900">Inactive (Resigned)</option>
              <option value="Terminated" className="bg-slate-900">Terminated</option>
            </select>
          </div>
        </div>

        {(deptFilter !== 'ALL' || statusFilter !== 'ALL' || search) && (
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-slate-400 text-[11px]">Active Filters:</span>
              {deptFilter !== 'ALL' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px]">
                  <span>Dept: {deptFilter}</span>
                  <button onClick={() => setDeptFilter('ALL')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  <span>Status: {statusFilter}</span>
                  <button onClick={() => setStatusFilter('ALL')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[11px]">
                  <span>Query: "{search}"</span>
                  <button onClick={() => setSearch('')} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setDeptFilter('ALL');
                setStatusFilter('ALL');
                setSearch('');
              }}
              className="text-amber-400 hover:text-amber-300 text-[11px] underline cursor-pointer"
            >
              Reset to All Departments
            </button>
          </div>
        )}
      </div>

      {/* Employee Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800 sticky top-0 z-10">
                <th className="p-3">Employee</th>
                <th className="p-3">Department & Designation</th>
                <th className="p-3">Contact & Address</th>
                <th className="p-3 text-center">Employment Status</th>
                <th className="p-3 text-center">Linked Login Account</th>
                <th className="p-3 text-right">Monthly Salary</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                    No employee records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isInactive = emp.employment_status.toLowerCase() !== 'active';
                  return (
                    <tr key={emp.employee_id} className="hover:bg-slate-850/60 transition group">
                      {/* Name & ID */}
                      <td className="p-3">
                        <div className="flex items-center space-x-2.5">
                          <div
                            onClick={() => setPerfEmployee(emp)}
                            title="Click to view ML Performance & Daily Attendance Analytics"
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-brand-600 flex items-center justify-center font-bold text-slate-950 text-xs shadow-sm flex-shrink-0 cursor-pointer hover:scale-105 transition"
                          >
                            {emp.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div
                              onClick={() => setPerfEmployee(emp)}
                              className="font-bold text-slate-100 hover:text-amber-300 transition cursor-pointer flex items-center space-x-1.5"
                              title="Click to view ML Performance & Daily Attendance Analytics"
                            >
                              <span>{emp.full_name}</span>
                              <Sparkles className="w-3 h-3 text-amber-400 opacity-80 group-hover:opacity-100" />
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                {emp.employee_id}
                              </span>
                              <button
                                onClick={() => setPerfEmployee(emp)}
                                className="text-[9px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30 transition cursor-pointer flex items-center space-x-0.5"
                                title="Open ML Performance & Attendance Modal"
                              >
                                <span>ML Perf</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Designation */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{emp.designation}</div>
                        <div className="text-[11px] text-slate-400">{emp.department}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Joined: {emp.joining_date}</div>
                      </td>

                      {/* Contact & Address */}
                      <td className="p-3 font-mono text-[11px]">
                        <div className="text-slate-300 flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{emp.email}</span>
                        </div>
                        <div className="text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{emp.phone}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[180px] font-sans mt-0.5">
                          {emp.address}
                        </div>
                      </td>

                      {/* Employment Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            emp.employment_status.toLowerCase() === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {emp.employment_status}
                        </span>
                      </td>

                      {/* Linked Login Account */}
                      <td className="p-3 text-center">
                        {emp.has_login_account ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getRoleBadge(
                                emp.account_role
                              )}`}
                            >
                              {emp.account_role}
                            </span>
                            <div className="text-[10px] font-mono">
                              {emp.account_active && !isInactive ? (
                                <span className="text-emerald-400 flex items-center justify-center space-x-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  <span>Active Account</span>
                                </span>
                              ) : (
                                <span className="text-rose-400 flex items-center justify-center space-x-1" title="Login blocked">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                  <span>{isInactive ? 'Access Revoked (Inactive)' : 'Deactivated'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">@{emp.account_username}</div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-500 text-[11px] block">No Login Account</span>
                            {canManageEmployees && !isInactive && (
                              <button
                                onClick={() => {
                                  setCreateAccountEmp(emp);
                                  setCreateAccountForm({
                                    username: emp.email.split('@')[0],
                                    password: 'password123',
                                    role: 'Employee',
                                  });
                                }}
                                className="mt-1 px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-[10px] font-semibold transition cursor-pointer"
                              >
                                + Create Account
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Monthly Salary */}
                      <td className="p-3 text-right font-mono font-bold text-slate-200">
                        ৳{emp.salary ? emp.salary.toLocaleString() : '0'}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setViewingEmployee(emp)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition cursor-pointer"
                            title="View Full Employee & Account Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setPerfEmployee(emp)}
                            className="p-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:text-white transition cursor-pointer"
                            title="View ML Performance & Daily Attendance Analytics"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {canManageEmployees && (
                            <>
                              {/* Edit details */}
                              <button
                                onClick={() => setEditingEmployee({ ...emp })}
                                className="p-1.5 rounded bg-slate-800 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 transition cursor-pointer"
                                title="Edit Employee Profile & Status"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* If has login account: toggle active/inactive */}
                              {emp.has_login_account && (
                                <button
                                  onClick={() => handleToggleAccount(emp)}
                                  disabled={isInactive}
                                  className={`p-1.5 rounded transition cursor-pointer ${
                                    emp.account_active && !isInactive
                                      ? 'bg-slate-800 hover:bg-rose-600/30 text-rose-400'
                                      : 'bg-slate-800 hover:bg-emerald-600/30 text-emerald-400'
                                  }`}
                                  title={
                                    isInactive
                                      ? 'Cannot activate account while employee status is Inactive'
                                      : emp.account_active
                                      ? 'Deactivate Login Account'
                                      : 'Activate Login Account'
                                  }
                                >
                                  {emp.account_active && !isInactive ? (
                                    <UserX className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {/* If has login account: change role */}
                              {emp.has_login_account && (
                                <button
                                  onClick={() => {
                                    setChangeRoleEmp(emp);
                                    setNewRoleValue((emp.account_role as UserRole) || 'Employee');
                                  }}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 transition cursor-pointer"
                                  title="Change System Role"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* If has login account: reset password */}
                              {emp.has_login_account && (
                                <button
                                  onClick={() => {
                                    setResetPasswordEmp(emp);
                                    setNewPasswordValue('password123');
                                  }}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-cyan-600/30 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                                  title="Reset Password"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => setDeleteConfirmEmp(emp)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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
          <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
          <span>Central Auth & RBAC Node: DC01 Silicon Tower</span>
        </div>
      </div>

      {/* ---------------- MODAL: ADD EMPLOYEE ---------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Add New Employee & Provision Access</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setModalError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              {modalError && (
                <div className="bg-rose-950/90 border border-rose-600 text-rose-200 p-3 rounded-xl flex items-start space-x-2.5 text-xs shadow-lg animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block text-rose-300">Save Error</span>
                    <span>{modalError}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.employee_id}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, employee_id: e.target.value.toUpperCase() })}
                    placeholder="e.g. EMP-101"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.full_name}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, full_name: e.target.value })}
                    placeholder="e.g. Rahim Ahmed"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmpForm.email}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                    placeholder="e.g. rahim@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.phone}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                    placeholder="e.g. +880 1818 000808"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <select
                    value={newEmpForm.department}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={newEmpForm.designation}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={newEmpForm.joining_date}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, joining_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Status *</label>
                  <select
                    value={newEmpForm.employment_status}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, employment_status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-semibold text-emerald-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Salary (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newEmpForm.salary}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Residential Address</label>
                <input
                  type="text"
                  value={newEmpForm.address}
                  onChange={(e) => setNewEmpForm({ ...newEmpForm, address: e.target.value })}
                  placeholder="e.g. Kazipara, Mirpur, Dhaka"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Requirement 2: Option "Create Login Account" */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-200 font-bold">
                    <input
                      type="checkbox"
                      checked={newEmpForm.create_login_account}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, create_login_account: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-amber-300">Create Login Account</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Connects credentials to this employee</span>
                </div>

                {newEmpForm.create_login_account && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-850">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Username</label>
                      <input
                        type="text"
                        value={newEmpForm.login_username}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, login_username: e.target.value })}
                        placeholder={newEmpForm.email ? newEmpForm.email.split('@')[0] : 'username'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Initial Password</label>
                      <input
                        type="text"
                        value={newEmpForm.login_password}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, login_password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Assigned Role *</label>
                      <select
                        value={newEmpForm.login_role}
                        onChange={(e) => setNewEmpForm({ ...newEmpForm, login_role: e.target.value as UserRole })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                      >
                        {AVAILABLE_ROLES.map((r) => (
                          <option key={r} value={r} disabled={r === 'Super Admin' && !isSuperAdmin}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow cursor-pointer flex items-center space-x-1.5 transition"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Employee...</span>
                    </>
                  ) : (
                    <span>Save Employee & Provision</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: EDIT EMPLOYEE & STATUS CONTROL ---------------- */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Edit Employee: {editingEmployee.full_name}</h3>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.full_name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, full_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={editingEmployee.department}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.designation}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Status Change - Requirement 6 rule */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-amber-300 font-bold">Employment Status</label>
                  <span className="text-[10px] text-slate-400">Controls login access</span>
                </div>
                <select
                  value={editingEmployee.employment_status}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, employment_status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="Active">Active (Permits System Access)</option>
                  <option value="Inactive">Inactive (Immediately Revokes Login)</option>
                  <option value="Terminated">Terminated (Permanently Blocks Login)</option>
                </select>
                {editingEmployee.employment_status !== 'Active' && (
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>Warning: Setting to '{editingEmployee.employment_status}' will immediately disable this employee's login access.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingEmployee.phone}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Salary (৳)</label>
                  <input
                    type="number"
                    value={editingEmployee.salary}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  value={editingEmployee.address}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE LOGIN ACCOUNT FOR EXISTING EMPLOYEE ---------------- */}
      {createAccountEmp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl p-4 text-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm text-slate-100">Create Login Credentials</h3>
              </div>
              <button onClick={() => setCreateAccountEmp(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provision system login credentials linked directly to <strong>{createAccountEmp.full_name}</strong> ({createAccountEmp.employee_id}).
            </p>

            <form onSubmit={handleCreateAccountForEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={createAccountForm.username}
                  onChange={(e) => setCreateAccountForm({ ...createAccountForm, username: e.target.value })}
                  placeholder="e.g. rahim.ahmed"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password *</label>
                <input
                  type="text"
                  required
                  value={createAccountForm.password}
                  onChange={(e) => setCreateAccountForm({ ...createAccountForm, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Role *</label>
                <select
                  value={createAccountForm.role}
                  onChange={(e) => setCreateAccountForm({ ...createAccountForm, role: e.target.value as UserRole })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r} disabled={r === 'Super Admin' && !isSuperAdmin}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateAccountEmp(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Create & Link Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: RESET PASSWORD ---------------- */}
      {resetPasswordEmp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-sm shadow-2xl p-4 text-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Reset Employee Password</h3>
              </div>
              <button onClick={() => setResetPasswordEmp(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Reset password for <strong>{resetPasswordEmp.full_name}</strong> (@{resetPasswordEmp.account_username}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordEmp(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CHANGE ROLE ---------------- */}
      {changeRoleEmp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-sm shadow-2xl p-4 text-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">Change Employee Role</h3>
              </div>
              <button onClick={() => setChangeRoleEmp(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Assign a new role to <strong>{changeRoleEmp.full_name}</strong>. This dictates their system permissions and visible modules.
            </p>

            <form onSubmit={handleChangeRole} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Role *</label>
                <select
                  value={newRoleValue}
                  onChange={(e) => setNewRoleValue(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r} disabled={r === 'Super Admin' && !isSuperAdmin}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setChangeRoleEmp(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Apply Role Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: VIEW EMPLOYEE DETAILS ---------------- */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl p-4 text-slate-100 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-brand-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow">
                  {viewingEmployee.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{viewingEmployee.full_name}</h3>
                  <span className="font-mono text-[10px] text-amber-300">{viewingEmployee.employee_id}</span>
                </div>
              </div>
              <button onClick={() => setViewingEmployee(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">Designation</span>
                  <span className="text-slate-200 font-bold">{viewingEmployee.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Department</span>
                  <span className="text-slate-200 font-bold">{viewingEmployee.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Employment Status</span>
                  <span
                    className={`font-bold ${
                      viewingEmployee.employment_status.toLowerCase() === 'active'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {viewingEmployee.employment_status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Monthly Salary</span>
                  <span className="text-emerald-400 font-bold">
                    ৳{viewingEmployee.salary ? viewingEmployee.salary.toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200">{viewingEmployee.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-slate-200">{viewingEmployee.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Joining Date:</span>
                  <span className="text-slate-200">{viewingEmployee.joining_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="text-slate-200">{viewingEmployee.address}</span>
                </div>
              </div>

              {/* Connected Login Info */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                  <span className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Connected Login Account</span>
                  </span>
                  {viewingEmployee.has_login_account ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(
                        viewingEmployee.account_role
                      )}`}
                    >
                      {viewingEmployee.account_role}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Unprovisioned</span>
                  )}
                </div>

                {viewingEmployee.has_login_account ? (
                  <div className="text-[11px] font-mono space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span className="text-white font-bold">@{viewingEmployee.account_username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Access:</span>
                      <span
                        className={
                          viewingEmployee.account_active && viewingEmployee.employment_status.toLowerCase() === 'active'
                            ? 'text-emerald-400 font-bold'
                            : 'text-rose-400 font-bold'
                        }
                      >
                        {viewingEmployee.account_active && viewingEmployee.employment_status.toLowerCase() === 'active'
                          ? 'ACTIVE (Permitted)'
                          : 'BLOCKED / INACTIVE'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    This employee does not currently have a system login credential. Use '+ Create Account' to provision access.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const target = viewingEmployee;
                  setViewingEmployee(null);
                  setPerfEmployee(target);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View ML Performance & Attendance</span>
              </button>

              <button
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: DELETE EMPLOYEE CONFIRMATION ---------------- */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-sm shadow-2xl p-4 text-slate-100 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-sm text-slate-100">Delete Employee?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <strong>{deleteConfirmEmp.full_name}</strong> ({deleteConfirmEmp.employee_id})?
                This will also terminate their linked login credentials.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmEmp(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: EMPLOYEE PERFORMANCE & ATTENDANCE ML ---------------- */}
      {perfEmployee && (
        <EmployeePerformanceModal
          employee={perfEmployee}
          onClose={() => setPerfEmployee(null)}
        />
      )}
    </div>
  );
};
