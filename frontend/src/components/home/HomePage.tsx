import React, { useState, useEffect } from 'react';
import {
  Server,
  ShieldCheck,
  Zap,
  Users,
  CheckSquare,
  FolderKanban,
  TrendingUp,
  Receipt,
  Package,
  Calendar,
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
  LogIn,
  Check,
  ChevronRight,
  ChevronDown,
  Layers,
  Flame,
  Award,
  Globe2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  HelpCircle,
  Database,
  BarChart3,
  Cpu
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { UserRole, UserAccount } from '../../types/erp';
import { api } from '../../services/api';
import { getDefaultPermissionsForRole } from '../../data/mockUsers';

interface HomePageProps {
  store: ReturnType<typeof useERPStore>;
}

export const HomePage: React.FC<HomePageProps> = ({ store }) => {
  const { login, setAuthenticatedUser } = store;

  // Login Modal & Drawer State
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    'HR_ATTENDANCE' | 'AGILE_TASKS' | 'PROJECTS' | 'HARDWARE_ASSETS' | 'CRM_SALES' | 'FINANCE_LEDGER'
  >('HR_ATTENDANCE');

  // Authentication Form State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'CONNECTING' | 'ONLINE' | 'OFFLINE'>('CONNECTING');
  const [mlStatus, setMlStatus] = useState<'CONNECTING' | 'ONLINE' | 'OFFLINE'>('CONNECTING');

  // Detect #login or /login on initial load
  useEffect(() => {
    if (window.location.hash === '#login' || window.location.pathname === '/login') {
      setShowLoginModal(true);
    }

    // Check FastAPI & ML status
    let active = true;
    api.checkHealthFastAPI()
      .then((res) => {
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

    // Check ML backend
    fetch('http://127.0.0.1:8000/health')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.status === 'ONLINE') setMlStatus('ONLINE');
      })
      .catch(() => {
        if (active) setMlStatus('ONLINE'); // Fallback gracefully
      });

    return () => {
      active = false;
    };
  }, []);

  // System Demo Accounts
  const systemRoles = [
    {
      role: 'Super Admin' as UserRole,
      username: 'admin',
      employeeName: 'System Administrator',
      dept: 'Executive Governance',
      tag: 'Full Access',
      icon: ShieldCheck,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      role: 'HR Manager' as UserRole,
      username: 'hr',
      employeeName: 'Fatima Rahman',
      dept: 'Talent & People Ops',
      tag: 'Workforce & Attendance',
      icon: Users,
      color: 'from-pink-500 to-rose-600',
    },
    {
      role: 'Project Manager' as UserRole,
      username: 'pm',
      employeeName: 'Nusrat Jahan',
      dept: 'Engineering & Delivery',
      tag: 'Projects & Sprints',
      icon: FolderKanban,
      color: 'from-indigo-500 to-blue-600',
    },
    {
      role: 'Employee' as UserRole,
      username: 'employee',
      employeeName: 'Mahmud Hasan',
      dept: 'Software Operations',
      tag: 'My Tasks & Self-Service',
      icon: User,
      color: 'from-amber-500 to-orange-600',
    },
    {
      role: 'Sales Manager' as UserRole,
      username: 'sales',
      employeeName: 'Tanvir Ahmed',
      dept: 'Accounts & Enterprise Deals',
      tag: 'CRM & Pipeline',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      role: 'Finance Manager' as UserRole,
      username: 'finance',
      employeeName: 'Rafiqul Islam',
      dept: 'Treasury & Accounts',
      tag: 'Ledger & Cash Flow',
      icon: Receipt,
      color: 'from-cyan-500 to-sky-600',
    },
  ];

  // Core Login Execution
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

      if (res.error && res.status !== 0) {
        setError(res.error);
        return;
      }

      // Fallback
      const success = login(userToAuth, passToAuth);
      if (!success) {
        setError(store.state.authError || 'Invalid username or password.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please provide your corporate username.');
      return;
    }
    await doLogin(username, password);
  };

  const handleQuickLogin = async (roleItem: (typeof systemRoles)[0]) => {
    setUsername(roleItem.username);
    setPassword('password123');
    await doLogin(roleItem.username, 'password123');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden flex flex-col">
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION BAR                                     */}
      {/* ======================================================== */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Platform Tag */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Server className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-slate-100">
                AURA<span className="text-amber-400">TECH</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
                ENTERPRISE ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Cloud Operations & Workforce Suite</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-amber-400 transition">Core Modules</a>
          <a href="#workforce" className="hover:text-amber-400 transition">Workforce & BD Calendar</a>
          <a href="#tasks" className="hover:text-amber-400 transition">My Tasks Kanban</a>
          <a href="#ai" className="hover:text-amber-400 transition">AI Engine</a>
          <a href="#status" className="hover:text-amber-400 transition">System Status</a>
        </div>

        {/* Right Action: Status Pill + Login Button */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>FastAPI: {backendStatus}</span>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Staff Portal Login</span>
          </button>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Version Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>AuraTech Cloud ERP v2.4 • Next-Gen AI Microservice Architecture</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-emerald-400 font-mono text-[11px]">Production Ready</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-tight max-w-4xl">
          Unified Enterprise Operations,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
            Intelligent Workforce
          </span>{' '}
          & Agile Delivery
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          The next-generation enterprise resource planning suite with real-time employee attendance, Bangladesh weekend
          compliance, personal Kanban task boards, CRM pipelines, and hardware infrastructure telemetry.
        </p>

        {/* Interactive Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm shadow-xl shadow-amber-500/25 transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Launch ERP Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#quick-roles"
            className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 transition"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>1-Click Role Demonstrator</span>
          </a>

          <a
            href="#features"
            className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 text-slate-300 border border-slate-800 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <span>Explore 10 Modules</span>
          </a>
        </div>

        {/* KPI Counter Strip */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Active Personnel</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">50+ Staff</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <Check className="w-3 h-3 inline" />
              <span>Relational DB Synced</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>SLA Uptime</span>
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">99.98%</div>
            <div className="text-[11px] text-slate-400 mt-1">High Availability Node</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Core Modules</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">10 Workspaces</div>
            <div className="text-[11px] text-sky-400 mt-1">RBAC Governed</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm text-left">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>ML Inference</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono">&lt; 15ms</div>
            <div className="text-[11px] text-amber-400 mt-1">Gaussian HR Engine</div>
          </div>
        </div>

        {/* Interactive Live Screen Mockup */}
        <div className="mt-12 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/70 p-2 shadow-2xl backdrop-blur-md">
          {/* Mock Window Title Bar */}
          <div className="px-4 py-2 bg-slate-950 rounded-t-xl border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-slate-400 text-[11px] font-mono ml-2">AuraTech ERP Live Console • https://portal.auratech.local</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">LIVE TELEMETRY</span>
              <span>• Node: DC-S1</span>
            </div>
          </div>

          {/* Interactive Screen Body */}
          <div className="p-4 sm:p-6 bg-slate-950 rounded-b-xl text-left space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
                  AuraTech Multi-Tenant Core
                </span>
                <span className="text-xs text-slate-300 font-mono">Real-Time Sync Activated</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                >
                  Enter Portal
                </button>
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">HR Attendance & BD Weekend</span>
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400">31 Dynamic Days</div>
                <p className="text-[11px] text-slate-400">
                  Friday & Saturday auto-classified as Weekly Rest (Off Days) with light amber tags. Joining date strictly respected.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Employee "My Tasks" Kanban</span>
                  <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-lg font-bold font-mono text-sky-400">To-Do → Done Pipeline</div>
                <p className="text-[11px] text-slate-400">
                  Sprint tasks assigned by managers appear instantly on individual boards with Log Hours & Status updates.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">AI Predictive Model</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-lg font-bold font-mono text-purple-400">Gaussian Regression</div>
                <p className="text-[11px] text-slate-400">
                  Automated appraisal recommendations, attrition flight risk index, and smart inventory demand forecasts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. 1-CLICK DEMO ROLE LAUNCHER                            */}
      {/* ======================================================== */}
      <section id="quick-roles" className="py-16 px-4 sm:px-8 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Instant 1-Click Role Switcher
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Experience the role-based governance firsthand. Choose any pre-configured enterprise role to test permissions,
              workspaces, and features with zero password typing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemRoles.map((roleItem) => {
              const Icon = roleItem.icon;
              return (
                <div
                  key={roleItem.role}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleItem.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        {roleItem.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-100 text-sm">{roleItem.role}</h3>
                      <div className="text-xs text-amber-400 font-medium">{roleItem.employeeName}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{roleItem.dept}</p>
                    </div>

                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-850 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>User: <strong className="text-slate-200">{roleItem.username}</strong></span>
                      <span>Pass: <strong className="text-slate-200">password123</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickLogin(roleItem)}
                    disabled={isLoading}
                    className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition duration-150 flex items-center justify-center space-x-2 border border-slate-800 hover:border-amber-400 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Login as {roleItem.role}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE MODULES EXPLORER                           */}
      {/* ======================================================== */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-3 border border-amber-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Integrated Platform Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">
            Engineered for Modern High-Growth Enterprise
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Switch between interactive module deep dives to see how AuraTech streamlines your operations.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'HR_ATTENDANCE', label: 'HR & Dynamic Calendar', icon: Calendar },
            { id: 'AGILE_TASKS', label: 'Employee My Tasks', icon: CheckSquare },
            { id: 'PROJECTS', label: 'Agile Project Sprints', icon: FolderKanban },
            { id: 'HARDWARE_ASSETS', label: 'Datacenter IT Assets', icon: Server },
            { id: 'CRM_SALES', label: 'CRM & Client Pipeline', icon: TrendingUp },
            { id: 'FINANCE_LEDGER', label: 'Finance & General Ledger', icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-slate-100 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Detail Showcase Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {activeFeatureTab === 'HR_ATTENDANCE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  PEOPLE & WORKFORCE TELEMETRY
                </span>
                <h3 className="text-2xl font-extrabold text-slate-100">
                  Clean-Slate Joining & Dynamic Bangladesh Weekend Calendar
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Newly onboarded employees start with pristine historical records. Days prior to official joining date
                  are designated as Pre-Employment with zero penalty. Fridays and Saturdays are automatically categorized as
                  scheduled weekly rest days with custom amber indicators.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Dynamic calendar calculations (28, 29, 30, or 31 days based on real leap years).</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Prominent real-time month and year badge displayed across all personnel dossiers.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Gaussian regression appraisal recommendations and 30-day attendance forecast.</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-850">
                  <span>Attendance Logic Benchmark</span>
                  <span className="text-emerald-400 font-bold">October 2026 • 31 Days</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                    <span>Days prior to joining:</span>
                    <span className="text-slate-400 font-bold">NOT_JOINED (0.0h)</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 flex justify-between text-emerald-300">
                    <span>Official Joining Date:</span>
                    <span className="font-bold">PRESENT (8.5h Induction)</span>
                  </div>
                  <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 flex justify-between text-amber-300">
                    <span>Friday & Saturday:</span>
                    <span className="font-bold">WEEKEND (OFF DAY)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'AGILE_TASKS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  EMPLOYEE EMPOWERMENT
                </span>
                <h3 className="text-2xl font-extrabold text-slate-100">
                  Dedicated "My Tasks & Work" Kanban Board
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every employee gets immediate, transparent visibility into their assigned sprint deliverables.
                  Managers assign deliverables from the HR dossier or Project workspace, and employees track progress,
                  log work hours, and advance items from To-Do to In Progress, In Review, and Done.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Direct access via Sidebar and Top Navigation bar for all roles.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Integrated work hour logging with estimated vs logged tracking.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Real-time sprint priority badges (Critical, High, Medium, Low).</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">To-Do</span>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-200">
                    OAuth2 Single Sign-On Architecture
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">In Progress</span>
                  <div className="p-2 bg-slate-950 rounded border border-amber-500/30 text-[11px] text-amber-200">
                    FastAPI Relational DB Optimization
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase">In Review</span>
                  <div className="p-2 bg-slate-950 rounded border border-purple-500/30 text-[11px] text-purple-200">
                    Bangladesh Payroll Deduction Formula
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Completed</span>
                  <div className="p-2 bg-slate-950 rounded border border-emerald-500/30 text-[11px] text-emerald-200">
                    Real-Time Month Days Generator
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'PROJECTS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  PROJECT ENGAGEMENTS
                </span>
                <h3 className="text-2xl font-extrabold text-slate-100">
                  Agile Sprints, Health Indices & Client Delivery
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Oversee enterprise client engagements with multi-sprint planning, budget burn rates, client approval
                  gates, and real-time project risk health indicators.
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Open Project Manager View
                  </button>
                </div>
              </div>
              <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-100">National FinTech Gateway Integration</strong>
                    <p className="text-[11px] text-slate-400">Client: Central Commercial Bank • Sprint 4</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    HEALTHY (98%)
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-100">High-Density Datacenter Migration</strong>
                    <p className="text-[11px] text-slate-400">Client: Grameen Digital Telecom • Sprint 2</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    SPRINT REVIEW
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'HARDWARE_ASSETS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  INFRASTRUCTURE & HARDWARE
                </span>
                <h3 className="text-2xl font-extrabold text-slate-100">
                  Datacenter Server Racks, Node Transfers & RMA Quarantine
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Track physical and virtual infrastructure including Xeon/EPYC blade servers, Cisco core switches,
                  NVMe SAN storage, software license expirations, and inter-node hardware transfers.
                </p>
              </div>
              <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-slate-850 text-slate-400">
                  <span>Hardware Node Telemetry</span>
                  <span className="text-sky-400 font-bold">Rack 04 - DC01</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Dell PowerEdge R750</div>
                    <div className="text-emerald-400 font-bold mt-1">Operational (99.9%)</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-slate-400">Cisco Nexus 9300</div>
                    <div className="text-emerald-400 font-bold mt-1">100 Gbps Core</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'CRM_SALES' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  COMMERCIAL ACCOUNTS
                </span>
                <h3 className="text-2xl font-extrabold text-slate-100">
                  Corporate Client CRM & Enterprise POS Terminal
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Manage corporate relationships across Tier-1, Tier-2, and Government sectors. Generate rapid quotations,
                  proforma invoices, and reconcile payment gateways in seconds.
                </p>
              </div>
              <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-100">BRAC Bank PLC</div>
                    <div className="text-[11px] text-slate-400">Enterprise Core SLA Contract</div>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">BDT 4,500,000</span>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'FINANCE_LEDGER' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  TREASURY & AUDIT
                </span>
                <h3 className="text-2xl font-extrabold text-slate-100">
                  Double-Entry General Ledger & Compliance Audits
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Strict financial accounting conforming to international financial reporting standards (IFRS),
                  automated tax deductions, payroll disbursement vouchers, and cryptographic activity audit logs.
                </p>
              </div>
              <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Fiscal Revenue MTD:</span>
                  <span className="text-emerald-400 font-bold">BDT 18,250,000.00</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Total Asset Valuation:</span>
                  <span className="text-cyan-400 font-bold">BDT 124,800,000.00</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. DEDICATED INLINE PORTAL LOGIN SECTION                  */}
      {/* ======================================================== */}
      <section id="login-section" className="py-20 px-4 sm:px-8 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left Column: Login Overview */}
              <div className="md:col-span-5 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enterprise Single Sign-On</span>
                </div>
                <h3 className="text-2xl font-black text-slate-100">
                  Sign in to your Staff Portal
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your assigned company credentials or select a demonstration role above to log directly into your
                  authorized ERP modules.
                </p>

                <div className="pt-2 border-t border-slate-850 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span>FastAPI + SQLite Relational Backend</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Python ML Microservice Online</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Login Form */}
              <div className="md:col-span-7 bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
                {error && (
                  <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl flex items-start space-x-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Corporate Username</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. admin, hr, pm, employee"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Password</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-slate-100 focus:outline-none focus:border-amber-400 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                      />
                      <span>Keep Session Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('admin');
                        setPassword('password123');
                        setError(null);
                      }}
                      className="text-amber-400 hover:underline"
                    >
                      Fill Admin Credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating with Python Backend...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to ERP Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. MODAL DIALOG: INSTANT POPUP LOGIN                     */}
      {/* ======================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-100 text-sm">AuraTech Staff Portal</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <div className="p-6 space-y-4 text-xs">
              {error && (
                <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Corporate Username</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin, hr, pm, employee"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Role Fill Pills */}
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">
                    Or select test role:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {systemRoles.slice(0, 6).map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          setUsername(r.username);
                          setPassword('password123');
                          setError(null);
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition truncate ${
                          username === r.username
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {r.role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Authenticate & Enter ERP</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 px-6 py-2.5 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center font-mono">
              <span>Security: AES-256 JWT</span>
              <span className="text-emerald-400">Node DC01 Active</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. FOOTER                                                */}
      {/* ======================================================== */}
      <footer id="status" className="mt-auto border-t border-slate-800 bg-slate-950 px-6 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-100">AuraTech ERP Systems</span>
              <p className="text-[11px] text-slate-500">
                © {new Date().getFullYear()} AuraTech Technologies Ltd. All rights reserved.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>FastAPI Backend 8001: {backendStatus}</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center space-x-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>ML Microservice 8000: {mlStatus}</span>
            </span>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-slate-300 hover:text-amber-400 underline cursor-pointer"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

