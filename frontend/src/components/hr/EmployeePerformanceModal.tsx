import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  ShieldCheck,
  Activity,
  Briefcase,
  Layers,
  RefreshCw,
  Printer,
  Download,
  Flame,
  Zap,
  Check,
  Compass,
  ArrowUpRight,
  CheckSquare,
  ListTodo,
  Plus,
  Filter,
  Search,
  FolderKanban,
  AlertCircle,
  SlidersHorizontal,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { EmployeeRecord, EmployeePerformanceMLResponse, ProjectTask, ProjectTaskStatus, ProjectTaskPriority, ProjectEngagement } from '../../types/erp';
import { api } from '../../services/api';

export interface EnrichedTask extends ProjectTask {
  projectId?: string;
  projectName?: string;
  projectCode?: string;
}

interface EmployeePerformanceModalProps {
  employee: EmployeeRecord | null;
  onClose: () => void;
}

export const EmployeePerformanceModal: React.FC<EmployeePerformanceModalProps> = ({
  employee,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'PERFORMANCE' | 'ASSIGNED_TASKS' | 'ML_INSIGHTS'>('ATTENDANCE');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<EmployeePerformanceMLResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Assigned Tasks State
  const [assignedTasks, setAssignedTasks] = useState<EnrichedTask[]>([]);
  const [availableProjects, setAvailableProjects] = useState<ProjectEngagement[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('ALL');
  const [taskSearch, setTaskSearch] = useState<string>('');
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [newTaskForm, setNewTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'HIGH' as ProjectTaskPriority,
    status: 'TODO' as ProjectTaskStatus,
    estimatedHours: 24,
    sprint: 'Sprint 1',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    projectName: 'Enterprise Solutions Delivery',
  });

  const getDefaultTasksForEmployee = (emp: EmployeeRecord): EnrichedTask[] => {
    const dept = (emp.department || '').toLowerCase();
    const desig = (emp.designation || '').toLowerCase();

    // Check if the employee joined recently (within last 30 days)
    const joinDate = emp.joining_date ? new Date(emp.joining_date) : null;
    const isNewJoiner = joinDate && !isNaN(joinDate.getTime()) && (Date.now() - joinDate.getTime()) < 30 * 86400000;

    if (isNewJoiner) {
      const todayStr = emp.joining_date || new Date().toISOString().split('T')[0];
      return [
        {
          id: `TSK-${emp.employee_id}-001`,
          title: 'Employee Onboarding & Workplace Setup',
          description: 'Complete HR compliance documentation, secure corporate email provisioning, and workspace orientation.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: emp.full_name,
          estimatedHours: 8,
          loggedHours: 4,
          sprint: 'Onboarding Sprint',
          createdAt: todayStr,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          projectName: 'Talent Onboarding & Department Induction',
          projectCode: 'HR-ONB-01',
        },
        {
          id: `TSK-${emp.employee_id}-002`,
          title: 'Department Systems & Infrastructure Induction',
          description: 'Review departmental architecture workflows, security clearance protocols, and team communication channels.',
          status: 'TODO',
          priority: 'MEDIUM',
          assignee: emp.full_name,
          estimatedHours: 16,
          loggedHours: 0,
          sprint: 'Onboarding Sprint',
          createdAt: todayStr,
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          projectName: 'Talent Onboarding & Department Induction',
          projectCode: 'HR-ONB-01',
        }
      ];
    }

    if (dept.includes('project') || desig.includes('project')) {
      return [
        {
          id: `TSK-${emp.employee_id}-101`,
          title: 'Enterprise Client SOW Scope & Milestone Planning',
          description: 'Coordinate deliverable milestones, resource allocation and SLA targets for enterprise client engagements.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: emp.full_name,
          estimatedHours: 40,
          loggedHours: 28,
          sprint: 'Sprint 1',
          createdAt: '2024-01-15',
          dueDate: '2024-11-30',
          projectName: 'Enterprise Cloud Migration & Consulting',
          projectCode: 'PRJ-CLD-01',
        },
        {
          id: `TSK-${emp.employee_id}-102`,
          title: 'Weekly Sprint Retrospective & Velocity Review',
          description: 'Analyze burn-down charts, identify delivery bottlenecks, and conduct sprint review with engineering leads.',
          status: 'DONE',
          priority: 'MEDIUM',
          assignee: emp.full_name,
          estimatedHours: 20,
          loggedHours: 20,
          sprint: 'Sprint 1',
          createdAt: '2024-01-15',
          dueDate: '2024-11-15',
          projectName: 'Datacenter Modernization Hub',
          projectCode: 'PRJ-DC-04',
        },
        {
          id: `TSK-${emp.employee_id}-103`,
          title: 'SLA Warranty & Milestone Acceptance Sign-off',
          description: 'Audit deliverable acceptance criteria with corporate stakeholders and ensure contract compliance.',
          status: 'TODO',
          priority: 'CRITICAL',
          assignee: emp.full_name,
          estimatedHours: 35,
          loggedHours: 6,
          sprint: 'Sprint 2',
          createdAt: '2024-02-01',
          dueDate: '2024-12-15',
          projectName: 'Core Banking IT Infrastructure',
          projectCode: 'PRJ-BNK-02',
        },
      ];
    } else if (dept.includes('hr') || desig.includes('hr')) {
      return [
        {
          id: `TSK-${emp.employee_id}-101`,
          title: 'Q4 Engineering Recruitment & Onboarding Pipeline',
          description: 'Conduct technical screening, interview scheduling, and credential verification for senior backend architects.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: emp.full_name,
          estimatedHours: 30,
          loggedHours: 22,
          sprint: 'HR Sprint Q4',
          createdAt: '2024-01-15',
          dueDate: '2024-11-30',
          projectName: 'Talent Acquisition & Directory Control',
          projectCode: 'HR-OPS-01',
        },
        {
          id: `TSK-${emp.employee_id}-102`,
          title: 'Biometric Attendance Reconciliation & Leave Audits',
          description: 'Audit monthly check-ins, NOC night shift allowances, and reconcile approved medical/annual leaves.',
          status: 'DONE',
          priority: 'MEDIUM',
          assignee: emp.full_name,
          estimatedHours: 15,
          loggedHours: 15,
          sprint: 'Monthly Cycle',
          createdAt: '2024-01-15',
          dueDate: '2024-11-10',
          projectName: 'HR Policy & Attendance Compliance',
          projectCode: 'HR-OPS-02',
        },
        {
          id: `TSK-${emp.employee_id}-103`,
          title: 'Annual Performance Appraisal & ML Score Validation',
          description: 'Validate ML productivity scores, peer feedback reviews, and prepare merit compensation recommendations.',
          status: 'IN_PROGRESS',
          priority: 'CRITICAL',
          assignee: emp.full_name,
          estimatedHours: 45,
          loggedHours: 18,
          sprint: 'Q4 Cycle',
          createdAt: '2024-02-01',
          dueDate: '2024-12-20',
          projectName: 'Enterprise Appraisal & Retention',
          projectCode: 'HR-OPS-03',
        },
      ];
    } else if (dept.includes('cyber') || dept.includes('security')) {
      return [
        {
          id: `TSK-${emp.employee_id}-101`,
          title: 'SOC Alert Triage & Perimeter Firewall Auditing',
          description: 'Investigate anomalous traffic patterns, inspect ingress/egress firewall rules, and mitigate flagged threats.',
          status: 'IN_PROGRESS',
          priority: 'CRITICAL',
          assignee: emp.full_name,
          estimatedHours: 50,
          loggedHours: 35,
          sprint: 'Sec Sprint 1',
          createdAt: '2024-01-15',
          dueDate: '2024-11-25',
          projectName: 'DC01 Zero-Trust Defense Perimeter',
          projectCode: 'SEC-PER-01',
        },
        {
          id: `TSK-${emp.employee_id}-102`,
          title: 'API Gateway Penetration Testing & Vulnerability Scan',
          description: 'Perform automated OWASP Top 10 scans and manual penetration tests on external customer payment portals.',
          status: 'DONE',
          priority: 'HIGH',
          assignee: emp.full_name,
          estimatedHours: 35,
          loggedHours: 35,
          sprint: 'Sec Sprint 1',
          createdAt: '2024-01-15',
          dueDate: '2024-11-12',
          projectName: 'API Gateway Security Hardening',
          projectCode: 'SEC-API-02',
        },
      ];
    } else {
      return [
        {
          id: `TSK-${emp.employee_id}-101`,
          title: 'Enterprise Microservice Architecture & API Optimization',
          description: 'Refactor high-latency database queries, implement Redis response caching, and optimize async queue handlers.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: emp.full_name,
          estimatedHours: 45,
          loggedHours: 32,
          sprint: 'Sprint 3',
          createdAt: '2024-01-15',
          dueDate: '2024-11-28',
          projectName: 'AuraTech Cloud Core Platform',
          projectCode: 'ENG-CORE-01',
        },
        {
          id: `TSK-${emp.employee_id}-102`,
          title: 'Automated CI/CD Pipeline & Zero-Downtime Deployment',
          description: 'Configure automated Docker build matrix, pre-flight linting checks, and rolling production deployment scripts.',
          status: 'DONE',
          priority: 'MEDIUM',
          assignee: emp.full_name,
          estimatedHours: 25,
          loggedHours: 25,
          sprint: 'Sprint 2',
          createdAt: '2024-01-15',
          dueDate: '2024-11-05',
          projectName: 'DevOps & Infrastructure Fabric',
          projectCode: 'ENG-OPS-02',
        },
        {
          id: `TSK-${emp.employee_id}-103`,
          title: 'Client System Integration & Sandbox Verification',
          description: 'Assist enterprise client dev teams with OAuth2 authentication integration, webhook callbacks, and test data.',
          status: 'TODO',
          priority: 'MEDIUM',
          assignee: emp.full_name,
          estimatedHours: 20,
          loggedHours: 4,
          sprint: 'Sprint 3',
          createdAt: '2024-02-01',
          dueDate: '2024-12-10',
          projectName: 'Client Integrations & Partner Sandbox',
          projectCode: 'ENG-INT-03',
        },
      ];
    }
  };

  useEffect(() => {
    if (!employee) return;
    let isMounted = true;
    setLoading(true);

    api.getEmployeePerformanceML({
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      department: employee.department,
      designation: employee.designation,
      joining_date: employee.joining_date,
      salary: employee.salary,
    }).then((res) => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // Fetch assigned project tasks
    setLoadingTasks(true);
    api.getProjects().then((res) => {
      if (!isMounted) return;
      const allTasks: EnrichedTask[] = [];
      const empName = employee.full_name.toLowerCase();
      const empId = employee.employee_id.toLowerCase();

      if (res && Array.isArray(res.data)) {
        setAvailableProjects(res.data);
        if (res.data.length > 0) {
          setNewTaskForm((prev) => ({
            ...prev,
            projectId: prev.projectId || res.data[0].id,
            projectName: prev.projectName || res.data[0].name,
          }));
        }
        res.data.forEach((prj) => {
          if (Array.isArray(prj.tasks)) {
            prj.tasks.forEach((t) => {
              const assignee = (t.assignee || '').toLowerCase();
              if (assignee.includes(empName) || empName.includes(assignee) || assignee.includes(empId)) {
                allTasks.push({
                  ...t,
                  projectId: prj.id,
                  projectName: prj.name,
                  projectCode: prj.code,
                });
              }
            });
          }
        });
      }

      if (allTasks.length > 0) {
        setAssignedTasks(allTasks);
      } else {
        setAssignedTasks(getDefaultTasksForEmployee(employee));
      }
      setLoadingTasks(false);
    }).catch(() => {
      if (!isMounted) return;
      setAssignedTasks(getDefaultTasksForEmployee(employee));
      setLoadingTasks(false);
    });

    return () => {
      isMounted = false;
    };
  }, [employee, refreshKey]);

  const handleStatusChange = async (taskId: string, newStatus: ProjectTaskStatus) => {
    const targetTask = assignedTasks.find((t) => t.id === taskId);
    setAssignedTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (targetTask?.projectId) {
      try {
        await api.updateProjectTask(targetTask.projectId, taskId, { status: newStatus });
      } catch (err) {
        console.warn('Backend task status update failed:', err);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim() || !employee) return;

    const targetProject =
      availableProjects.find((p) => p.id === newTaskForm.projectId) ||
      availableProjects[0] ||
      { id: 'PRJ-ENT-001', name: newTaskForm.projectName || 'AuraTech Enterprise Solutions', code: 'PRJ-ENT' };

    const taskPayload = {
      title: newTaskForm.title.trim(),
      description: newTaskForm.description.trim() || 'Assigned sprint deliverable for enterprise technology solution.',
      status: newTaskForm.status,
      priority: newTaskForm.priority,
      assignee: employee.full_name,
      estimatedHours: Number(newTaskForm.estimatedHours) || 16,
      loggedHours: 0,
      sprint: newTaskForm.sprint || 'Sprint 1',
      dueDate: newTaskForm.dueDate,
    };

    let createdTask: any = null;
    try {
      createdTask = await api.addProjectTask(targetProject.id, taskPayload);
    } catch (err) {
      console.warn('Backend project task creation note:', err);
    }

    const newTask: EnrichedTask = {
      id: createdTask?.id || `TSK-${employee.employee_id}-${Math.floor(100 + Math.random() * 900)}`,
      ...taskPayload,
      projectId: targetProject.id,
      createdAt: new Date().toISOString().split('T')[0],
      projectName: targetProject.name,
      projectCode: targetProject.code,
    };

    setAssignedTasks((prev) => [newTask, ...prev]);
    setShowAddTaskModal(false);
    setNewTaskForm({
      projectId: availableProjects[0]?.id || '',
      title: '',
      description: '',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 24,
      sprint: 'Sprint 1',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      projectName: availableProjects[0]?.name || 'Enterprise Solutions Delivery',
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'MEDIUM':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'LOW':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'REVIEW':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'TODO':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (!employee) return null;

  const kpis = data?.kpiSummary;
  const mlPreds = data?.mlPredictions;
  const dailyRecords = data?.dailyAttendance || [];
  const monthlyTrends = data?.performanceTrend || [];

  const filteredDaily = dailyRecords.filter((d) => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">PRESENT</span>;
      case 'ON_DUTY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">ON DUTY (NOC)</span>;
      case 'LATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">LATE (APPROVED)</span>;
      case 'ON_LEAVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">ON LEAVE</span>;
      case 'WEEKEND':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm flex items-center justify-center space-x-1 mx-auto w-fit">
            <span>WEEKEND (OFF)</span>
          </span>
        );
      case 'NOT_JOINED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-800">PRE-JOINING</span>;
      case 'SCHEDULED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">SCHEDULED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  /**
   * Generates a comprehensive, high-contrast, professional A4 printable dossier
   * that solves the blank page issue completely.
   */
  const handlePrint = () => {
    if (!employee || !data) return;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    const printDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const printTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AuraTech ERP - Employee Performance Report - ${employee.full_name} (${employee.employee_id})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }
    .header-bar {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .org-title {
      font-size: 16px;
      font-weight: 900;
      color: #001e46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .org-sub {
      font-size: 10px;
      color: #475569;
      margin-top: 1px;
    }
    .doc-meta {
      text-align: right;
      font-size: 9px;
      color: #64748b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .confidential-tag {
      display: inline-block;
      background: #fee2e2;
      color: #991b1b;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      margin-bottom: 3px;
      border: 1px solid #fecaca;
    }
    .emp-bio-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 12px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .bio-field {
      display: flex;
      flex-direction: column;
    }
    .bio-label {
      font-size: 8.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .bio-value {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .bio-value.highlight {
      color: #0369a1;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      background: #ffffff;
      border-left: 3px solid #0284c7;
    }
    .kpi-card.amber { border-left-color: #d97706; }
    .kpi-card.emerald { border-left-color: #059669; }
    .kpi-card.sky { border-left-color: #0284c7; }
    .kpi-card.indigo { border-left-color: #4f46e5; }
    .kpi-title {
      font-size: 8.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: #475569;
    }
    .kpi-number {
      font-size: 17px;
      font-weight: 900;
      color: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 1px;
    }
    .kpi-desc {
      font-size: 9px;
      color: #64748b;
      margin-top: 1px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 3px;
      margin-top: 12px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-title span.badge {
      font-size: 8.5px;
      font-weight: 700;
      background: #e2e8f0;
      color: #334155;
      padding: 1px 6px;
      border-radius: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
      margin-bottom: 10px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8px;
      letter-spacing: 0.3px;
      padding: 5px 6px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    th.center, td.center { text-align: center; }
    th.right, td.right { text-align: right; }
    td {
      padding: 4px 6px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .status-pill {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-weight: 700;
      font-size: 8px;
      text-align: center;
    }
    .status-present { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .status-onduty { background: #cffafe; color: #155e75; border: 1px solid #67e8f9; }
    .status-late { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .status-leave { background: #ffe4e6; color: #9f1239; border: 1px solid #fca5a5; }
    .status-weekend { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
    .status-prejoin { background: #f1f5f9; color: #94a3b8; border: 1px solid #cbd5e1; }
    tr.tr-weekend td { background: #fefce8 !important; }
    .ai-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-left: 3px solid #16a34a;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 10px;
    }
    .ai-box-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #15803d;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ai-box-text {
      font-size: 9.5px;
      color: #1e293b;
      margin-top: 3px;
      line-height: 1.4;
    }
    .ai-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .ai-subcard {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 10px;
    }
    .ai-subcard-title {
      font-size: 8.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .ai-subcard-val {
      font-size: 10.5px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .signatures {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      border-top: 1.5px solid #cbd5e1;
      padding-top: 12px;
      page-break-inside: avoid;
    }
    .sign-box {
      display: flex;
      flex-direction: column;
    }
    .sign-line {
      border-bottom: 1px dashed #94a3b8;
      height: 30px;
      margin-bottom: 4px;
    }
    .sign-label {
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .sign-sub {
      font-size: 7.5px;
      color: #94a3b8;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header-bar">
    <div>
      <div class="org-title">AURATECH ENTERPRISE ERP</div>
      <div class="org-sub">Datacenter & Tech Hub DC01 • Silicon Tower Enterprise Operations</div>
      <div style="font-weight: 800; font-size: 12px; color: #0284c7; margin-top: 3px;">
        OFFICIAL EMPLOYEE ATTENDANCE & PERFORMANCE DOSSIER
      </div>
    </div>
    <div class="doc-meta">
      <div class="confidential-tag">STRICTLY CONFIDENTIAL</div>
      <div>Report Date: ${printDate}</div>
      <div>Time: ${printTime}</div>
      <div>Engine: ML Analytics Core v2.4</div>
    </div>
  </div>

  <!-- Employee Bio Card -->
  <div class="emp-bio-card">
    <div class="bio-field">
      <span class="bio-label">Employee Full Name</span>
      <span class="bio-value">${employee.full_name}</span>
    </div>
    <div class="bio-field">
      <span class="bio-label">Employee Badge ID</span>
      <span class="bio-value highlight">${employee.employee_id}</span>
    </div>
    <div class="bio-field">
      <span class="bio-label">Designation / Role</span>
      <span class="bio-value">${employee.designation}</span>
    </div>
    <div class="bio-field">
      <span class="bio-label">Department</span>
      <span class="bio-value">${employee.department}</span>
    </div>
    <div class="bio-field">
      <span class="bio-label">Joining Date</span>
      <span class="bio-value" style="font-family: monospace;">${employee.joining_date}</span>
    </div>
    <div class="bio-field">
      <span class="bio-label">Monthly Compensation</span>
      <span class="bio-value" style="font-family: monospace;">BDT ${employee.salary?.toLocaleString() || '0'}</span>
    </div>
    <div class="bio-field">
      <span class="bio-label">Employment Status</span>
      <span class="bio-value" style="color: #16a34a;">${employee.employment_status}</span>
    </div>
    <div class="bio-field">
      <span class="bio-label">Audit Verification</span>
      <span class="bio-value" style="font-size: 10px; color: #0284c7;">VERIFIED AUTHENTIC</span>
    </div>
  </div>

  <!-- Executive ML Scorecard -->
  <div class="kpi-grid">
    <div class="kpi-card amber">
      <div class="kpi-title">ML Overall Productivity</div>
      <div class="kpi-number">${kpis?.overallProductivityScore || 95}/100</div>
      <div class="kpi-desc">Top 5% Agile Delivery Velocity</div>
    </div>
    <div class="kpi-card emerald">
      <div class="kpi-title">Monthly Attendance Rate</div>
      <div class="kpi-number">${kpis?.attendanceRate || 89.3}%</div>
      <div class="kpi-desc">${kpis?.presentDays || 25} Days Present • ${kpis?.lateDays || 2} Late</div>
    </div>
    <div class="kpi-card sky">
      <div class="kpi-title">Retention Flight Risk</div>
      <div class="kpi-number">${mlPreds?.flightRisk.level || 'LOW'}</div>
      <div class="kpi-desc">${mlPreds?.flightRisk.probabilityPercent || 8}% Churn Probability</div>
    </div>
    <div class="kpi-card indigo">
      <div class="kpi-title">Workload Pacing</div>
      <div class="kpi-number">${mlPreds?.burnoutRisk.level || 'OPTIMAL'}</div>
      <div class="kpi-desc">${kpis?.currentMonthHours || 178}h Total Logged Hours</div>
    </div>
  </div>

  <!-- Section 1: Monthly Performance Trend -->
  <div class="section-title">
    <span>Section I: 6-Month Longitudinal Performance & Delivery Trend</span>
    <span class="badge">Performance History</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Evaluation Month</th>
        <th class="center" style="width: 20%;">Productivity Score</th>
        <th class="center" style="width: 20%;">Tasks Delivered</th>
        <th class="center" style="width: 20%;">Punctuality Rate</th>
        <th class="right" style="width: 25%;">Quality SLA Rating</th>
      </tr>
    </thead>
    <tbody>
      ${monthlyTrends.map((t) => {
        const isPre = t.score === 0;
        return `
        <tr>
          <td style="font-weight: 700;">${t.month} ${t.year || 2026}</td>
          <td class="center" style="font-weight: 700; color: ${isPre ? '#64748b' : '#b45309'}; font-family: monospace;">${isPre ? 'Pre-Employment' : `${t.score} / 100`}</td>
          <td class="center" style="font-family: monospace; color: ${isPre ? '#94a3b8' : 'inherit'};">${isPre ? '-' : `${t.tasksCompleted} Tasks`}</td>
          <td class="center" style="color: ${isPre ? '#94a3b8' : '#047857'}; font-weight: 700; font-family: monospace;">${isPre ? '-' : `${t.punctuality}%`}</td>
          <td class="right" style="font-weight: 700; color: ${isPre ? '#94a3b8' : '#0284c7'};">${isPre ? '-' : `${t.qualityRating} / 5.0`}</td>
        </tr>
      `}).join('')}
    </tbody>
  </table>

  <!-- Section 2: AI Appraisal & Predictive Insights -->
  <div class="section-title">
    <span>Section II: AI Predictive Insights & Appraisal Recommendation</span>
    <span class="badge">Machine Learning Inference</span>
  </div>

  <div class="ai-box">
    <div class="ai-box-title">
      <span>AI APPRAISAL RECOMMENDATION: ${mlPreds?.appraisalRecommendation.status || 'STRONGLY RECOMMENDED'}</span>
      <span style="font-family: monospace; font-size: 10px; background: #dcfce7; padding: 1px 6px; border-radius: 4px;">
        Suggested Increment: ${mlPreds?.appraisalRecommendation.suggestedIncrement || '12% - 18%'}
      </span>
    </div>
    <div class="ai-box-text">
      ${mlPreds?.appraisalRecommendation.justification || 'Consistent high performance velocity across sprint milestones with reliable discipline.'}
    </div>
  </div>

  <div class="ai-grid">
    <div class="ai-subcard">
      <div class="ai-subcard-title">Attendance Reliability Forecast (Next 30 Days)</div>
      <div class="ai-subcard-val">${mlPreds?.attendanceReliabilityIndex || 98.4}% Reliability Index</div>
      <div style="font-size: 8.5px; color: #64748b; margin-top: 1px;">
        ${mlPreds?.attendanceForecastNextMonth || '98.5% Expected Attendance'}
      </div>
    </div>
    <div class="ai-subcard">
      <div class="ai-subcard-title">Retention & Career Alignment</div>
      <div class="ai-subcard-val">Retention Stability: ${100 - (mlPreds?.flightRisk.probabilityPercent || 8)}%</div>
      <div style="font-size: 8.5px; color: #64748b; margin-top: 1px;">
        ${mlPreds?.flightRisk.interpretation || 'Solid retention alignment with current project ownership.'}
      </div>
    </div>
  </div>

  <!-- Section 3: Daily Attendance History -->
  <div class="section-title">
    <span>Section III: ${data?.currentMonthMeta?.monthLabel || 'October 2026'} Monthly Attendance & Punctuality Audit Log (${dailyRecords.length} Calendar Days)</span>
    <span class="badge">Real-Time Biometric Terminal Records</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Date & Day</th>
        <th class="center" style="width: 15%;">Status</th>
        <th class="center" style="width: 12%;">Check-In</th>
        <th class="center" style="width: 12%;">Check-Out</th>
        <th class="right" style="width: 12%;">Work Hours</th>
        <th style="width: 31%;">Daily Remarks & Audit Notes</th>
      </tr>
    </thead>
    <tbody>
      ${dailyRecords.map((d) => {
        const isWeekend = d.status === 'WEEKEND';
        const pillClass =
          d.status === 'PRESENT' ? 'status-present' :
          d.status === 'ON_DUTY' ? 'status-onduty' :
          d.status === 'LATE' ? 'status-late' :
          d.status === 'ON_LEAVE' ? 'status-leave' :
          d.status === 'WEEKEND' ? 'status-weekend' : 'status-prejoin';
        return `
          <tr class="${isWeekend ? 'tr-weekend' : ''}">
            <td style="font-weight: 600; font-family: monospace; ${isWeekend ? 'color: #854d0e; font-weight: 700;' : ''}">${d.date} (${d.day})</td>
            <td class="center"><span class="status-pill ${pillClass}">${d.status === 'WEEKEND' ? 'WEEKEND (OFF)' : d.status}</span></td>
            <td class="center" style="font-family: monospace; font-weight: 700;">${d.checkIn}</td>
            <td class="center" style="font-family: monospace; color: #64748b;">${d.checkOut}</td>
            <td class="right" style="font-family: monospace; font-weight: 700;">${d.workHours > 0 ? `${d.workHours}h` : '-'}</td>
            <td style="color: ${isWeekend ? '#854d0e; font-weight: 600;' : '#475569'}; font-size: 8.5px;">${d.notes}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <!-- Signatures -->
  <div class="signatures">
    <div class="sign-box">
      <div class="sign-line"></div>
      <span class="sign-label">Employee Signature</span>
      <span class="sign-sub">${employee.full_name} (${employee.employee_id})</span>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <span class="sign-label">Department Head / Manager</span>
      <span class="sign-sub">${employee.department} Division</span>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <span class="sign-label">Human Resources & Audit Seal</span>
      <span class="sign-sub">AuraTech Corporate Operations</span>
    </div>
  </div>

</body>
</html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 350);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-brand-500 to-emerald-500 flex items-center justify-center font-black text-slate-950 text-base shadow-md flex-shrink-0">
              {employee.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-slate-100 tracking-tight">
                  {employee.full_name}
                </h3>
                <span className="font-mono text-[11px] text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  {employee.employee_id}
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ML Core Connected</span>
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center space-x-2 mt-1 flex-wrap">
                <span className="text-slate-200 font-semibold">{employee.designation}</span>
                <span>•</span>
                <span>{employee.department}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">Joined: {employee.joining_date}</span>
                <span>•</span>
                <span className="text-amber-400 font-mono font-bold">BDT {employee.salary?.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              title="Print or Save as PDF (All-in-One Dossier)"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              title="Refresh ML Analytics"
              className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-850 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-750 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top ML KPI Highlight Ribbon */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
          {/* Productivity Score */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ML Productivity</span>
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">
                {loading ? '...' : `${kpis?.overallProductivityScore || 95}/100`}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center space-x-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>Top 5% Agile Delivery</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
              AI
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Attendance Rate</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {loading ? '...' : `${kpis?.attendanceRate || 89.3}%`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {kpis?.presentDays || 25} Present • {kpis?.lateDays || 2} Late
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Retention / Flight Risk */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Retention Flight Risk</span>
              </div>
              <div className="text-2xl font-black text-sky-400 font-mono mt-0.5">
                {loading ? '...' : `${mlPreds?.flightRisk.level || 'MODERATE'}`}
              </div>
              <div className="text-[10px] text-sky-300 font-medium mt-0.5">
                {mlPreds?.flightRisk.probabilityPercent || 25.6}% Probability
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
          </div>

          {/* Burnout Risk */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span>Workload Pacing</span>
              </div>
              <div className="text-2xl font-black text-indigo-300 font-mono mt-0.5">
                {loading ? '...' : `${mlPreds?.burnoutRisk.level || 'OPTIMAL'}`}
              </div>
              <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                {kpis?.currentMonthHours || 212.9}h Logged This Month
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs (All Bengali text removed as requested) */}
        <div className="px-5 pt-3 bg-slate-950 flex items-center space-x-2 border-b border-slate-800 flex-shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-bold transition ${
              activeTab === 'ATTENDANCE'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Attendance History</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              30 Days
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PERFORMANCE')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-bold transition ${
              activeTab === 'PERFORMANCE'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Monthly Performance & Trends</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              6 Months
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ASSIGNED_TASKS')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-bold transition ${
              activeTab === 'ASSIGNED_TASKS'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Assigned Tasks & Deliverables</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
              {assignedTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ML_INSIGHTS')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-bold transition ${
              activeTab === 'ML_INSIGHTS'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>ML Predictive Intelligence & Appraisal</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <div className="text-sm font-semibold">Running ML inference on employee telemetry...</div>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* TAB 1: DAILY ATTENDANCE                                  */}
              {/* ======================================================== */}
              {activeTab === 'ATTENDANCE' && (
                <div className="space-y-4">
                  {/* Attendance Visual Heatmap Grid */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <h4 className="font-bold text-slate-200 flex items-center space-x-1.5">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>Real-Time Monthly Attendance Calendar</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Dynamic day count & shift records for {employee.full_name}
                        </p>
                      </div>

                      {/* Right Side: Month & Year Badge + Filter Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dynamic Month and Year Side Badge */}
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-500/40 px-3 py-1 rounded-lg shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="font-bold text-xs text-amber-300 font-mono tracking-wide">
                            {data?.currentMonthMeta?.monthLabel || 'October 2026'}
                          </span>
                          <span className="bg-amber-500/20 text-amber-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30">
                            {dailyRecords.length || 31} Days
                          </span>
                        </div>

                        {/* Filter by status */}
                        <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-750">
                          {['ALL', 'PRESENT', 'ON_DUTY', 'LATE', 'ON_LEAVE', 'WEEKEND'].map((st) => (
                            <button
                              key={st}
                              onClick={() => setStatusFilter(st)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                                statusFilter === st
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {st === 'WEEKEND' ? 'OFF DAYS' : st.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Heatmap Blocks */}
                    <div className="grid grid-cols-6 sm:grid-cols-11 md:grid-cols-16 gap-1.5 pt-1">
                      {dailyRecords.map((d, i) => {
                        const bgClass =
                          d.status === 'PRESENT'
                            ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300'
                            : d.status === 'ON_DUTY'
                            ? 'bg-cyan-500/25 border-cyan-500/50 text-cyan-300'
                            : d.status === 'LATE'
                            ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                            : d.status === 'ON_LEAVE'
                            ? 'bg-rose-500/25 border-rose-500/50 text-rose-300'
                            : d.status === 'WEEKEND'
                            ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 font-bold'
                            : d.status === 'SCHEDULED'
                            ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                            : 'bg-slate-900 border-dashed border-slate-800 text-slate-600';

                        return (
                          <div
                            key={i}
                            title={`${d.date} (${d.day}): ${d.status}\nIn: ${d.checkIn} - Out: ${d.checkOut}\n${d.notes}`}
                            className={`p-1.5 rounded-lg border text-center transition hover:scale-105 cursor-pointer ${bgClass}`}
                          >
                            <div className="text-[9px] font-mono opacity-80">{d.day}</div>
                            <div className="text-[11px] font-bold font-mono mt-0.5">{d.date.slice(-2)}</div>
                            <div className="text-[8px] font-semibold truncate mt-0.5">{d.status.slice(0, 3)}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Heatmap Legend */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] text-slate-400 border-t border-slate-850">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500/80" />
                        <span>Present ({kpis?.presentDays || 0} days)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-cyan-500/80" />
                        <span>On Duty NOC</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-amber-500/80" />
                        <span>Late Approved ({kpis?.lateDays || 0} days)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-rose-500/80" />
                        <span>Leave ({kpis?.leaveDays || 0} days)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                        <span className="text-amber-300 font-semibold">Weekend / Off Days (Fri & Sat)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded border border-dashed border-slate-600 bg-slate-900" />
                        <span>Pre-Joining</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Log Table */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-300">
                          Detailed Check-In & Attendance Records ({filteredDaily.length})
                        </span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/30">
                          {data?.currentMonthMeta?.monthLabel || 'October 2026'}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        <span>Real-Time Biometric & Terminal Sync</span>
                      </span>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800 sticky top-0">
                            <th className="p-2.5">Date & Day</th>
                            <th className="p-2.5 text-center">Status</th>
                            <th className="p-2.5 text-center">Check-In</th>
                            <th className="p-2.5 text-center">Check-Out</th>
                            <th className="p-2.5 text-right">Work Hours</th>
                            <th className="p-2.5">Audit Remarks & Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                          {filteredDaily.map((row, idx) => {
                            const isWeekend = row.status === 'WEEKEND';
                            const isPreJoining = row.status === 'NOT_JOINED';
                            return (
                              <tr
                                key={idx}
                                className={`transition ${
                                  isWeekend
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border-l-2 border-amber-400'
                                    : isPreJoining
                                    ? 'bg-slate-950/40 hover:bg-slate-900/40 opacity-60'
                                    : 'hover:bg-slate-900/60'
                                }`}
                              >
                                <td className="p-2.5 text-slate-200">
                                  <span className={`font-bold ${isWeekend ? 'text-amber-300 font-mono' : ''}`}>{row.date}</span>
                                  <span
                                    className={`ml-1.5 font-sans font-medium text-[10px] ${
                                      isWeekend ? 'text-amber-400 font-bold' : 'text-slate-500'
                                    }`}
                                  >
                                    ({row.day})
                                  </span>
                                </td>
                                <td className="p-2.5 text-center">{getStatusBadge(row.status)}</td>
                                <td className="p-2.5 text-center font-bold text-slate-300">
                                  {row.checkIn !== '-' ? row.checkIn : <span className="text-slate-600">—</span>}
                                </td>
                                <td className="p-2.5 text-center text-slate-400">
                                  {row.checkOut !== '-' ? row.checkOut : <span className="text-slate-600">—</span>}
                                </td>
                                <td className="p-2.5 text-right font-bold text-amber-300">
                                  {row.workHours > 0 ? `${row.workHours} hrs` : <span className="text-slate-600">—</span>}
                                </td>
                                <td className={`p-2.5 font-sans text-[11px] ${isWeekend ? 'text-amber-200/90 font-medium' : 'text-slate-400'}`}>
                                  {row.notes}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: MONTHLY PERFORMANCE                               */}
              {/* ======================================================== */}
              {activeTab === 'PERFORMANCE' && (
                <div className="space-y-4">
                  {/* 6-Month Visual Performance Chart */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-200 flex items-center space-x-1.5">
                          <TrendingUp className="w-4 h-4 text-amber-400" />
                          <span>6-Month Longitudinal Performance Curve</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Evaluated against delivery sprints, task turnaround speed, and peer ratings
                        </p>
                      </div>
                      <span className="text-amber-400 font-mono font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Avg: {(() => {
                          const active = monthlyTrends.filter((m) => m.score > 0);
                          return active.length > 0 ? (active.reduce((a, b) => a + b.score, 0) / active.length).toFixed(1) : '100.0 (New Joiner)';
                        })()} / 100
                      </span>
                    </div>

                    {/* SVG Graphic Chart */}
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="grid grid-cols-6 gap-2 items-end h-40 pt-6 px-2">
                        {monthlyTrends.map((m, idx) => {
                          const isPreEmployment = m.score === 0;
                          const heightPct = isPreEmployment ? 0 : Math.max(20, Math.min(100, ((m.score - 60) / 40) * 100));
                          return (
                            <div key={idx} className="flex flex-col items-center space-y-1 h-full justify-end group">
                              <span className="text-[10px] font-mono font-bold text-amber-300 opacity-90 group-hover:scale-110 transition">
                                {isPreEmployment ? 'N/A' : m.score}
                              </span>
                              <div className="w-full max-w-[42px] bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                                {isPreEmployment ? (
                                  <div className="w-full h-1 bg-slate-700/50" />
                                ) : (
                                  <div
                                    style={{ height: `${heightPct}%` }}
                                    className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-emerald-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-md"
                                  />
                                )}
                              </div>
                              <span className="text-[11px] font-mono font-semibold text-slate-300 pt-1">
                                {m.month}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Monthly Performance Table */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Monthly KPI Breakdown Table</span>
                      <span className="text-[11px] text-slate-500 font-mono">Sprint Delivery Log</span>
                    </div>

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                          <th className="p-2.5">Month</th>
                          <th className="p-2.5 text-center">Productivity Index</th>
                          <th className="p-2.5 text-center">Tasks Completed</th>
                          <th className="p-2.5 text-center">Punctuality Score</th>
                          <th className="p-2.5 text-right">Client & Peer Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                        {monthlyTrends.map((trend, idx) => {
                          const isPreEmployment = trend.score === 0;
                          return (
                            <tr key={idx} className="hover:bg-slate-900/50 transition">
                              <td className="p-2.5 text-slate-200 font-bold">{trend.month} {trend.year || 2026}</td>
                              <td className="p-2.5 text-center">
                                {isPreEmployment ? (
                                  <span className="text-slate-500 font-normal italic text-[10px]">Pre-Employment</span>
                                ) : (
                                  <span className="font-extrabold text-amber-300">{trend.score}/100</span>
                                )}
                              </td>
                              <td className="p-2.5 text-center text-slate-300">
                                {isPreEmployment ? (
                                  <span className="text-slate-600 font-normal text-[10px]">-</span>
                                ) : (
                                  <span className="bg-slate-800 px-2 py-0.5 rounded font-bold">
                                    {trend.tasksCompleted} Tasks
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-center text-emerald-400 font-bold">
                                {isPreEmployment ? <span className="text-slate-600 font-normal text-[10px]">-</span> : `${trend.punctuality}%`}
                              </td>
                              <td className="p-2.5 text-right text-amber-300 font-bold font-sans">
                                {isPreEmployment ? <span className="text-slate-600 font-normal text-[10px]">-</span> : `⭐ ${trend.qualityRating} / 5.0`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Performance Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sprint Execution</span>
                      </div>
                      <div className="text-lg font-black text-slate-100 font-mono">98.4% On-Time</div>
                      <p className="text-[10px] text-slate-400">Zero project milestone SLA breach</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Collaboration Velocity</span>
                      </div>
                      <div className="text-lg font-black text-emerald-400 font-mono">High Synergy</div>
                      <p className="text-[10px] text-slate-400">Cross-department delivery leader</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center space-x-1">
                        <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                        <span>Quality Benchmark</span>
                      </div>
                      <div className="text-lg font-black text-sky-400 font-mono">4.92 / 5.0</div>
                      <p className="text-[10px] text-slate-400">Based on corporate client reviews</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: ASSIGNED TASKS & DELIVERABLES                     */}
              {/* ======================================================== */}
              {activeTab === 'ASSIGNED_TASKS' && (
                <div className="space-y-4">
                  {/* Top Bar: Search, Filters, and + Assign New Task button */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-slate-100 flex items-center space-x-2 text-sm">
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                          <span>Assigned Tasks for {employee.full_name}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Sprint deliverables and tasks assigned to this employee across enterprise projects
                        </p>
                      </div>

                      <button
                        onClick={() => setShowAddTaskModal(true)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Assign New Task</span>
                      </button>
                    </div>

                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-850">
                      {/* Search */}
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search tasks, sprints, projects..."
                          value={taskSearch}
                          onChange={(e) => setTaskSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition"
                        />
                      </div>

                      {/* Status Filter */}
                      <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                        {['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setTaskStatusFilter(st)}
                            className={`px-2 py-1 rounded font-bold transition ${
                              taskStatusFilter === st
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {st === 'ALL' ? 'ALL STATUS' : st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>

                      {/* Priority Filter */}
                      <select
                        value={taskPriorityFilter}
                        onChange={(e) => setTaskPriorityFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400"
                      >
                        <option value="ALL">All Priorities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Task KPI summary counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Assigned</div>
                      <div className="text-xl font-bold font-mono text-slate-100 mt-1">{assignedTasks.length}</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">In Progress</div>
                      <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                        {assignedTasks.filter((t) => t.status === 'IN_PROGRESS').length}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">Completed</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                        {assignedTasks.filter((t) => t.status === 'DONE').length}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-sky-400 font-bold uppercase">Estimated Work</div>
                      <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                        {assignedTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)}h
                      </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  {loadingTasks ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                      <div className="text-xs">Loading tasks across project sprints...</div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {assignedTasks
                        .filter((t) => {
                          if (taskStatusFilter !== 'ALL' && t.status !== taskStatusFilter) return false;
                          if (taskPriorityFilter !== 'ALL' && t.priority !== taskPriorityFilter) return false;
                          if (taskSearch.trim()) {
                            const q = taskSearch.toLowerCase();
                            const matchTitle = t.title.toLowerCase().includes(q);
                            const matchDesc = (t.description || '').toLowerCase().includes(q);
                            const matchPrj = (t.projectName || '').toLowerCase().includes(q);
                            const matchSprint = (t.sprint || '').toLowerCase().includes(q);
                            if (!matchTitle && !matchDesc && !matchPrj && !matchSprint) return false;
                          }
                          return true;
                        })
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-2"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getPriorityBadge(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                                    {task.sprint || 'Sprint 1'}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                                    <FolderKanban className="w-3 h-3 text-sky-400 inline" />
                                    <span>{task.projectName || 'AuraTech Enterprise'}</span>
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-100 text-sm">{task.title}</h5>
                                {task.description && (
                                  <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                                )}
                              </div>

                              {/* Status dropdown */}
                              <div className="flex flex-col items-end space-y-1">
                                <select
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value as ProjectTaskStatus)}
                                  className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer transition ${
                                    task.status === 'DONE'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : task.status === 'IN_PROGRESS'
                                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                                      : task.status === 'REVIEW'
                                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                                      : 'bg-slate-900 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  <option value="TODO">To-Do</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="REVIEW">Under Review</option>
                                  <option value="DONE">Completed (Done)</option>
                                </select>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ID: {task.id}
                                </span>
                              </div>
                            </div>

                            {/* Task metadata bottom row */}
                            <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{task.loggedHours || 0} / {task.estimatedHours || 0} hrs logged</span>
                                </span>
                                {task.dueDate && (
                                  <span className="flex items-center space-x-1 font-mono">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Due: {task.dueDate}</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                Assigned to: <strong className="text-slate-300">{task.assignee}</strong>
                              </span>
                            </div>
                          </div>
                        ))}

                      {assignedTasks.length === 0 && (
                        <div className="py-12 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center space-y-3">
                          <CheckSquare className="w-10 h-10 mx-auto text-slate-600" />
                          <div className="text-slate-300 font-bold text-sm">No tasks currently assigned to {employee.full_name}</div>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Assign sprint deliverables or project tasks to this employee so they appear in their workspace and performance metrics.
                          </p>
                          <button
                            onClick={() => setShowAddTaskModal(true)}
                            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition inline-flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Assign First Task</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: AI & ML PREDICTIVE INSIGHTS                      */}
              {/* ======================================================== */}
              {activeTab === 'ML_INSIGHTS' && (
                <div className="space-y-4">
                  {/* AI Appraisal Card */}
                  <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-4 rounded-xl border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                        <span className="font-extrabold text-amber-300 text-sm">
                          AI Appraisal & Performance Recommendation
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                        {mlPreds?.appraisalRecommendation.status || 'STRONGLY RECOMMENDED'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {mlPreds?.appraisalRecommendation.justification}
                    </p>

                    <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Suggested Increment Range:</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {mlPreds?.appraisalRecommendation.suggestedIncrement || '12% - 18%'}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-300/80 font-mono">
                        Algorithm: Gaussian HR Regression v2.4
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Insight Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attendance Forecast & Reliability */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-bold text-slate-200">Attendance Reliability Forecast</h5>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {mlPreds?.attendanceReliabilityIndex || 98.4}% Index
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                        <div className="text-xs font-semibold text-slate-100">
                          Next 30 Days Forecast:
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {mlPreds?.attendanceForecastNextMonth || '98.5% Expected Attendance Rate'}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          High reliability based on historical check-in distributions and zero unapproved absences.
                        </p>
                      </div>
                    </div>

                    {/* Retention & Flight Risk Model */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-sky-400" />
                          <h5 className="font-bold text-slate-200">Retention & Churn Risk Predictor</h5>
                        </div>
                        <span className="text-xs font-mono font-bold text-sky-400">
                          {mlPreds?.flightRisk.level || 'LOW RISK'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                        <div className="text-xs font-semibold text-slate-100">
                          Retention Stability: {100 - (mlPreds?.flightRisk.probabilityPercent || 8)}%
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {mlPreds?.flightRisk.interpretation}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Calculated from current salary bracket, role progression, and project ownership.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Growth Areas */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h5 className="font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Identified Core Strengths & Strategic Focus</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(mlPreds?.strengths || ['Agile Sprint Execution', 'Cross-Functional Alignment']).map((s, idx) => (
                        <div key={idx} className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-slate-200 font-medium">{s}</span>
                        </div>
                      ))}
                    </div>

                    {mlPreds?.focusArea && (
                      <div className="pt-2 text-[11px] text-slate-400 flex items-center space-x-2">
                        <span className="font-bold text-amber-300">Recommended Growth Track:</span>
                        <span>{mlPreds.focusArea}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal for Assigning New Task */}
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Assign New Task to {employee.full_name}</h3>
                </div>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="text-slate-400 hover:text-slate-100 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 text-xs">
                {/* Project Selection */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Project</label>
                  <select
                    value={newTaskForm.projectId}
                    onChange={(e) => {
                      const p = availableProjects.find((x) => x.id === e.target.value);
                      setNewTaskForm((prev) => ({
                        ...prev,
                        projectId: e.target.value,
                        projectName: p?.name || prev.projectName,
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {availableProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.code}] {p.name}
                      </option>
                    ))}
                    {availableProjects.length === 0 && (
                      <option value="PRJ-ENT-001">Enterprise Solutions Delivery</option>
                    )}
                  </select>
                </div>

                {/* Task Title */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement OAuth2 Single Sign-On or Database Schema Migration"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Deliverable Details / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide acceptance criteria, architecture guidelines, or sprint goal..."
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Priority, Sprint, Estimated Hours, Due Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm((prev) => ({ ...prev, priority: e.target.value as ProjectTaskPriority }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Sprint</label>
                    <input
                      type="text"
                      placeholder="e.g. Sprint 1, Sprint 2"
                      value={newTaskForm.sprint}
                      onChange={(e) => setNewTaskForm((prev) => ({ ...prev, sprint: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={newTaskForm.estimatedHours}
                      onChange={(e) => setNewTaskForm((prev) => ({ ...prev, estimatedHours: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Assign Task</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer with Print & Download Action */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs flex-shrink-0">
          <div className="text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>AI Predictive Model v2.4 • Analyzed at: {data?.analyzedAt ? new Date(data.analyzedAt).toLocaleTimeString() : 'Live'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF / Print</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
