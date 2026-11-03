import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wifi,
  Briefcase,
  Loader2,
  Zap,
  LogIn,
  Check,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Headphones,
  Sun,
  Moon
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { UserRole, UserAccount } from '../../types/erp';
import { api } from '../../services/api';
import { getDefaultPermissionsForRole } from '../../data/mockUsers';

interface LoginPageProps {
  store: ReturnType<typeof useERPStore>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ store }) => {
  const { state, login, loginAsRole, setAuthenticatedUser } = store;
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(state.authError || null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'CONNECTING' | 'ONLINE' | 'OFFLINE'>('CONNECTING');
  const [bgTheme, setBgTheme] = useState<'dark' | 'white'>('white');

  // Check FastAPI backend connectivity on mount
  React.useEffect(() => {
    let active = true;
    api.checkHealthFastAPI()
      .then(res => {
        if (!active) return;
        if (res.data?.status === 'ok') {
          setBackendStatus('ONLINE');
        } else {
          setBackendStatus('OFFLINE');
        }
      })
      .catch(() => {
        if (active) setBackendStatus('OFFLINE');
      });
    return () => {
      active = false;
    };
  }, []);

  const doLogin = async (userToAuth: string, passToAuth: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // 1. Authenticate with Python FastAPI backend
      const res = await api.loginFastAPI(userToAuth.trim(), passToAuth);
      if (res.data && res.data.user) {
        const fastApiUser = res.data.user;
        const mappedRole: UserRole = (fastApiUser.role as UserRole) || 'Employee';
        if (mappedRole === 'Procurement Manager' || mappedRole === 'Support Staff') {
          setError(`Access Denied: Login access for ${mappedRole} has been revoked.`);
          return;
        }
        const userAccount: UserAccount = {
          id: `USR-${fastApiUser.id}`,
          username: fastApiUser.username,
          name: fastApiUser.employee_name || fastApiUser.employee?.full_name || fastApiUser.username,
          email: fastApiUser.email,
          phone: fastApiUser.employee?.phone || '+880 1700-000000',
          role: mappedRole,
          department: fastApiUser.department || fastApiUser.employee?.department || 'Operations',
          status: fastApiUser.is_active ? 'ACTIVE' : 'INACTIVE',
          avatar: (fastApiUser.employee_name || fastApiUser.username)
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          createdAt: fastApiUser.created_at || new Date().toISOString().split('T')[0],
          lastLogin: 'Just now (FastAPI JWT)',
          permissions: getDefaultPermissionsForRole(mappedRole),
          employee_id: fastApiUser.employee_id || fastApiUser.employee?.employee_id,
          employee_name: fastApiUser.employee_name || fastApiUser.employee?.full_name,
          employee_status: fastApiUser.employee_status || fastApiUser.employee?.employment_status || 'Active',
        };
        setAuthenticatedUser(userAccount);
        return;
      }

      // If backend responded with an error (e.g. 403 Forbidden for inactive employee, 401 Unauthorized)
      if (res.error && res.status !== 0) {
        setError(res.error);
        return;
      }

      // Fallback if backend is unreachable
      const success = login(userToAuth, passToAuth);
      if (!success) {
        setError(store.state.authError || 'Invalid username or password.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username or email address.');
      return;
    }
    await doLogin(username, password);
  };

  const handleQuickFillRole = (item: { username: string; role: UserRole }) => {
    setUsername(item.username);
    setPassword('password123');
    setError(null);
  };

  const handleQuickLoginRole = async (item: { username: string; role: UserRole }) => {
    setUsername(item.username);
    setPassword('password123');
    await doLogin(item.username, 'password123');
  };

  const handleQuickFillAdmin = () => {
    setUsername('admin');
    setPassword('password123');
    setError(null);
  };

  const systemRoles = [
    { role: 'Super Admin' as UserRole, username: 'admin', employeeName: 'System Administrator', dept: 'Executive', tag: 'Full Control', icon: ShieldCheck },
    { role: 'HR Manager' as UserRole, username: 'hr', employeeName: 'Fatima Rahman', dept: 'HR & Talent', tag: 'Staff & Roster', icon: Users },
    { role: 'Sales Manager' as UserRole, username: 'sales', employeeName: 'Tanvir Ahmed', dept: 'Accounts', tag: 'CRM & Invoicing', icon: TrendingUp },
    { role: 'Project Manager' as UserRole, username: 'pm', employeeName: 'Nusrat Jahan', dept: 'Engineering', tag: 'Projects & Tasks', icon: Briefcase },
    { role: 'Finance Manager' as UserRole, username: 'finance', employeeName: 'Rafiqul Islam', dept: 'Finance', tag: 'General Ledger', icon: DollarSign },
    { role: 'Employee' as UserRole, username: 'employee', employeeName: 'Mahmud Hasan', dept: 'Operations', tag: 'Self-Service', icon: User },
  ];

  return (
    <div className="min-h-screen w-screen bg-[#FFFFFF] text-[#001E46] flex flex-col justify-between font-sans selection:bg-[#F26522] selection:text-white overflow-y-auto">
      {/* Top Corporate Status Header - Workday Azure Theme */}
      <header className="border-b border-[#209BEF] bg-[#30AFFF] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F26522] to-orange-500 flex items-center justify-center shadow-lg shadow-[#F26522]/20">
            <Server className="w-4 h-4 text-white font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider text-white">
                AURA<span className="text-[#F26522]">TECH</span>
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-[#30AFFF] font-bold shadow-sm border border-slate-200">
                ENTERPRISE ERP
              </span>
            </div>
            <p className="text-[11px] text-white/90">Datacenter Cloud Solutions & IT Infrastructure System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/20 bg-[#249CEE] text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cluster Node: DC01 Silicon Tower</span>
            <span className="text-white/40">|</span>
            <span className="text-white/95">TLS 1.3 Encrypted</span>
          </div>
          <div className="flex items-center space-x-1.5 text-white font-semibold">
            <Wifi className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px]">System Online</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto bg-[#FFFFFF]">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Login Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F26522]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center space-x-1.5 bg-[#F26522]/10 text-[#F26522] border border-[#F26522]/30 px-2.5 py-1 rounded-full text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Identity & Access Governance</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#001E46]">
                Sign in to your Workspace
              </h2>
              <p className="text-xs mt-1 text-[#4A5568]">
                Enter your credentials or choose a pre-configured enterprise role to test dynamic role-based access.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-300 text-rose-700 p-3 rounded-lg flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#001E46]">
                  Username or Corporate Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or employee@auratech.io"
                    className="w-full bg-slate-50 border border-slate-300 text-[#001E46] focus:bg-white rounded-lg pl-9 pr-3 py-2 placeholder-slate-400 text-xs focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] font-mono transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#001E46]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border border-slate-300 text-[#001E46] focus:bg-white rounded-lg pl-9 pr-10 py-2 placeholder-slate-400 text-xs focus:outline-none focus:border-[#F26522] focus:ring-1 focus:ring-[#F26522] font-mono transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] mt-1 font-mono text-[#4A5568]">
                  Default demo password: <code className="text-[#F26522] font-bold">password123</code>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-[#F26522] focus:ring-[#F26522] w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-[#4A5568]">Remember session on this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('For this frontend deployment, you can use any of the 8 1-click role logins on the right, or enter username: admin / password: password123')}
                  className="text-[#F26522] hover:underline text-[11px] font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#30AFFF] hover:bg-[#209BEF] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#30AFFF]/25 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Open ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-200 text-[#4A5568] text-[11px] flex items-center justify-between font-mono">
              <span className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'ONLINE' ? 'bg-emerald-500' : backendStatus === 'CONNECTING' ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>FastAPI Core: {backendStatus === 'ONLINE' ? 'Connected (:8001)' : backendStatus === 'CONNECTING' ? 'Connecting...' : 'Offline (Local Demo)'}</span>
              </span>
              <span>Session: JWT / 24h</span>
            </div>
          </div>

          {/* Right Column: Simplified 8-Role Mark Panel (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-2xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-sm space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F26522]/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F26522]/10 border border-[#F26522]/30 flex items-center justify-center text-[#F26522] shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center space-x-2 text-[#001E46]">
                    <span>Role Mark Panel</span>
                    <span className="text-[10px] bg-[#E9ECF0] text-[#001E46] border border-slate-300 font-bold px-2.5 py-0.5 rounded-full">
                      {systemRoles.length} Categories
                    </span>
                  </h3>
                  <p className="text-[11px] mt-0.5 text-[#4A5568]">
                    Click to mark and auto-fill role credentials instantly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="px-3 py-1 rounded-full bg-[#E9ECF0] hover:bg-slate-200 text-[#001E46] border border-slate-300 font-bold border text-[11px] font-mono transition cursor-pointer shadow-sm"
                title="Reset to Root Super Admin"
              >
                Reset to Admin
              </button>
            </div>

            {/* Compact Category Mark Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {systemRoles.map((item) => {
                const isSelected = username.toLowerCase() === item.username.toLowerCase();
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickFillRole(item)}
                    onDoubleClick={() => handleQuickLoginRole(item)}
                    title={`Click to mark ${item.role} or double-click to log in directly`}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group ${
                      isSelected
                        ? 'bg-orange-50/70 border-2 border-[#F26522] ring-1 ring-[#F26522]/40 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#F26522] text-white font-bold shadow'
                            : 'bg-[#E9ECF0] border border-slate-200 text-[#001E46] group-hover:text-[#F26522]'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs font-bold truncate ${
                            isSelected
                              ? 'text-[#F26522]'
                              : 'text-[#001E46]'
                          }`}>
                            {item.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] mt-0.5 text-[#4A5568]">
                          <span className="font-mono text-[#F26522] font-semibold">@{item.username}</span>
                          <span>•</span>
                          <span className="truncate">{item.tag}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mark Indicator */}
                    <div className="flex-shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#F26522] text-white flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 group-hover:border-slate-400 transition" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clean Status & Fast-Login Footer */}
            <div className="pt-2.5 border-t border-slate-200 text-[#4A5568] flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center space-x-1.5">
                <span>Default Password:</span>
                <span className="px-2 py-0.5 rounded border bg-slate-100 text-[#001E46] border-slate-300 font-bold">password123</span>
              </div>
              <div className="text-emerald-600 flex items-center space-x-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero-Trust RBAC Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-[#4A5568] px-6 py-2.5 text-center text-xs flex items-center justify-between font-sans">
        <span>© 2026 AuraTech Solutions Ltd. All rights reserved.</span>
        <span>Version 2.4.0 (Enterprise Suite)</span>
      </footer>
    </div>
  );
};
