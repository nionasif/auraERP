import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Layers,
  ChevronRight,
  Server,
  X,
  Calendar,
  User,
  Tag,
  DollarSign,
  TrendingUp,
  Cpu,
  RefreshCw,
  Trash2,
  Edit3,
  ExternalLink,
  Kanban,
  ListTodo,
  Milestone,
  Check,
  ArrowRight,
  Zap,
  Building2,
  ShieldCheck,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import {
  ProjectEngagement,
  ProjectTask,
  ProjectTaskStatus,
  ProjectTaskPriority,
  ProjectHealthStatus,
  ProjectEngagementStatus
} from '../../types/erp';

interface EcommerceWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const EcommerceWorkspaceView: React.FC<EcommerceWorkspaceViewProps> = ({ store }) => {
  const {
    state,
    setView,
    fetchProjects,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    updateTaskStatus,
    updateProjectTask,
    deleteTaskFromProject
  } = store;

  // View Controls
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE' | 'MILESTONES'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Active Edit States
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectEngagement | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // In-App Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // New Project Form State
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    clientName: '',
    clientId: 'CUST-1001',
    leadArchitect: 'Nusrat Jahan',
    budgetBDT: '5000000',
    allocatedHours: '450',
    currentSprint: 'Sprint 1 - Inception & Architecture',
    status: 'IN_PROGRESS' as ProjectEngagementStatus,
    healthStatus: 'HEALTHY_GREEN' as ProjectHealthStatus,
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '2026-12-31',
    techStack: 'FastAPI, PostgreSQL, Docker, Kafka',
    description: ''
  });

  // Edit Project Form State
  const [editProjectForm, setEditProjectForm] = useState({
    name: '',
    clientName: '',
    clientId: 'CUST-1001',
    leadArchitect: '',
    budgetBDT: '',
    billedBDT: '',
    allocatedHours: '',
    burnedHours: '',
    currentSprint: '',
    status: 'IN_PROGRESS' as ProjectEngagementStatus,
    healthStatus: 'HEALTHY_GREEN' as ProjectHealthStatus,
    startDate: '',
    targetCompletionDate: '',
    techStack: '',
    description: ''
  });

  // New Task Form State
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO' as ProjectTaskStatus,
    priority: 'MEDIUM' as ProjectTaskPriority,
    assignee: 'Nusrat Jahan',
    estimatedHours: '16',
    sprint: 'Sprint 1',
    dueDate: '2026-11-30'
  });

  // Edit Task Form State
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO' as ProjectTaskStatus,
    priority: 'MEDIUM' as ProjectTaskPriority,
    assignee: '',
    estimatedHours: '',
    loggedHours: '',
    sprint: '',
    dueDate: ''
  });

  // Initial Sync
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProjects();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Projects and sprint tasks synchronized', 'info');
    }, 400);
  };

  // Selected Project (defaults to first project if none selected)
  const currentProject = useMemo(() => {
    if (!state.projects || state.projects.length === 0) return null;
    return state.projects.find(p => p.id === state.selectedProjectId) || state.projects[0];
  }, [state.projects, state.selectedProjectId]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const list = state.projects || [];
    const totalBudget = list.reduce((sum, p) => sum + (Number(p.budgetBDT) || 0), 0);
    const totalBilled = list.reduce((sum, p) => sum + (Number(p.billedBDT) || 0), 0);
    const totalHours = list.reduce((sum, p) => sum + (Number(p.burnedHours) || 0), 0);
    const totalAllocated = list.reduce((sum, p) => sum + (Number(p.allocatedHours) || 0), 0);

    const allTasks = list.flatMap(p => p.tasks || []);
    const completedTasks = allTasks.filter(t => t.status === 'DONE').length;

    return {
      totalEngagements: list.length,
      activeCount: list.filter(p => p.status === 'IN_PROGRESS').length,
      totalBudget,
      totalBilled,
      totalHours,
      totalAllocated,
      allTasksCount: allTasks.length,
      completedTasks,
      burnRatePct: totalAllocated > 0 ? Math.round((totalHours / totalAllocated) * 100) : 0
    };
  }, [state.projects]);

  // Filtered Tasks for Kanban View
  const currentTasks = useMemo(() => {
    if (!currentProject) return [];
    let list = Array.isArray(currentProject.tasks) ? currentProject.tasks : [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.assignee.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }

    if (priorityFilter !== 'ALL') {
      list = list.filter(t => t.priority === priorityFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(t => t.status === statusFilter);
    }

    return list;
  }, [currentProject, searchQuery, priorityFilter, statusFilter]);

  // --- Handlers: Project CRUD ---

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.name.trim()) {
      showToast('Please provide a Project Engagement Name.', 'error');
      return;
    }

    const finalClientName = newProjectForm.clientName.trim() || (state.customers.length > 0 ? state.customers[0].name : 'Enterprise Client');

    const techArray = newProjectForm.techStack
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setIsCreatingProject(true);
    try {
      const created = await createProject({
        name: newProjectForm.name.trim(),
        clientName: finalClientName,
        clientId: newProjectForm.clientId || 'CUST-1001',
        leadArchitect: newProjectForm.leadArchitect.trim() || 'Nusrat Jahan',
        budgetBDT: Number(newProjectForm.budgetBDT) || 0,
        allocatedHours: Number(newProjectForm.allocatedHours) || 0,
        currentSprint: newProjectForm.currentSprint.trim() || 'Sprint 1',
        status: newProjectForm.status,
        healthStatus: newProjectForm.healthStatus,
        startDate: newProjectForm.startDate,
        targetCompletionDate: newProjectForm.targetCompletionDate,
        techStack: techArray,
        description: newProjectForm.description.trim()
      });

      setShowNewProjectModal(false);
      showToast(`Project engagement "${created?.name || newProjectForm.name}" created successfully`);
      setNewProjectForm({
        name: '',
        clientName: '',
        clientId: 'CUST-1001',
        leadArchitect: 'Nusrat Jahan',
        budgetBDT: '5000000',
        allocatedHours: '450',
        currentSprint: 'Sprint 1 - Inception & Architecture',
        status: 'IN_PROGRESS',
        healthStatus: 'HEALTHY_GREEN',
        startDate: new Date().toISOString().split('T')[0],
        targetCompletionDate: '2026-12-31',
        techStack: 'FastAPI, PostgreSQL, Docker, Kafka',
        description: ''
      });
    } catch (err) {
      console.error('Failed to create project:', err);
      showToast('Failed to create project engagement.', 'error');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const openEditProject = (proj: ProjectEngagement) => {
    setEditingProject(proj);
    setEditProjectForm({
      name: proj.name,
      clientName: proj.clientName,
      clientId: proj.clientId || 'CUST-1001',
      leadArchitect: proj.leadArchitect,
      budgetBDT: String(proj.budgetBDT || 0),
      billedBDT: String(proj.billedBDT || 0),
      allocatedHours: String(proj.allocatedHours || 0),
      burnedHours: String(proj.burnedHours || 0),
      currentSprint: proj.currentSprint || 'Sprint 1',
      status: proj.status || 'IN_PROGRESS',
      healthStatus: proj.healthStatus || 'HEALTHY_GREEN',
      startDate: proj.startDate || new Date().toISOString().split('T')[0],
      targetCompletionDate: proj.targetCompletionDate || '2026-12-31',
      techStack: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || ''),
      description: proj.description || ''
    });
  };

  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const techArray = editProjectForm.techStack
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await updateProject(editingProject.id, {
      name: editProjectForm.name.trim(),
      clientName: editProjectForm.clientName.trim(),
      clientId: editProjectForm.clientId,
      leadArchitect: editProjectForm.leadArchitect.trim(),
      budgetBDT: Number(editProjectForm.budgetBDT) || 0,
      billedBDT: Number(editProjectForm.billedBDT) || 0,
      allocatedHours: Number(editProjectForm.allocatedHours) || 0,
      burnedHours: Number(editProjectForm.burnedHours) || 0,
      currentSprint: editProjectForm.currentSprint.trim(),
      status: editProjectForm.status,
      healthStatus: editProjectForm.healthStatus,
      startDate: editProjectForm.startDate,
      targetCompletionDate: editProjectForm.targetCompletionDate,
      techStack: techArray,
      description: editProjectForm.description.trim()
    });

    setEditingProject(null);
    showToast(`Project ${editingProject.code} updated successfully`);
  };

  const handleConfirmDeleteProject = async (id: string) => {
    const proj = state.projects.find(p => p.id === id);
    await deleteProject(id);
    setDeletingProjectId(null);
    showToast(`Project ${proj?.code || id} deleted successfully`, 'info');
  };

  // --- Handlers: Task CRUD ---

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) {
      showToast('Please select or create an engagement first.', 'error');
      return;
    }
    if (!newTaskForm.title.trim()) {
      showToast('Please provide a Task Title.', 'error');
      return;
    }

    await addTaskToProject(currentProject.id, {
      title: newTaskForm.title.trim(),
      description: newTaskForm.description.trim(),
      status: newTaskForm.status,
      priority: newTaskForm.priority,
      assignee: newTaskForm.assignee.trim() || currentProject.leadArchitect || 'Nusrat Jahan',
      estimatedHours: Number(newTaskForm.estimatedHours) || 8,
      sprint: newTaskForm.sprint.trim() || currentProject.currentSprint,
      dueDate: newTaskForm.dueDate
    });

    setShowNewTaskModal(false);
    showToast(`Task added to ${currentProject.code} sprint board`);
    setNewTaskForm({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      assignee: currentProject.leadArchitect || 'Nusrat Jahan',
      estimatedHours: '16',
      sprint: currentProject.currentSprint || 'Sprint 1',
      dueDate: '2026-11-30'
    });
  };

  const openEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      estimatedHours: String(task.estimatedHours || 8),
      loggedHours: String(task.loggedHours || 0),
      sprint: task.sprint || currentProject?.currentSprint || 'Sprint 1',
      dueDate: task.dueDate || ''
    });
  };

  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !editingTask) return;

    await updateProjectTask(currentProject.id, editingTask.id, {
      title: editTaskForm.title.trim(),
      description: editTaskForm.description.trim(),
      status: editTaskForm.status,
      priority: editTaskForm.priority,
      assignee: editTaskForm.assignee.trim(),
      estimatedHours: Number(editTaskForm.estimatedHours) || 0,
      loggedHours: Number(editTaskForm.loggedHours) || 0,
      sprint: editTaskForm.sprint.trim(),
      dueDate: editTaskForm.dueDate
    });

    setEditingTask(null);
    showToast(`Task ${editingTask.id} updated`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentProject) return;
    await deleteTaskFromProject(currentProject.id, taskId);
    showToast(`Task ${taskId} removed`, 'info');
  };

  const handleMoveTaskStatus = async (taskId: string, newStatus: ProjectTaskStatus, statusLabel: string) => {
    if (!currentProject) return;
    await updateTaskStatus(currentProject.id, taskId, newStatus);
    showToast(`Task ${taskId} moved to "${statusLabel}"`, 'success');
  };

  // --- UI Helpers ---

  const priorityBadge = (priority: ProjectTaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-bold">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold">LOW</span>;
    }
  };

  const healthBadge = (health: ProjectHealthStatus) => {
    switch (health) {
      case 'HEALTHY_GREEN':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Optimal (Green)</span>
          </span>
        );
      case 'AT_RISK_YELLOW':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>At Risk (Yellow)</span>
          </span>
        );
      case 'CRITICAL_RED':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>Critical Block (Red)</span>
          </span>
        );
    }
  };

  const kanbanColumns: Array<{ id: ProjectTaskStatus; label: string; headerColor: string; bg: string }> = [
    { id: 'TODO', label: 'To Do (Backlog)', headerColor: 'text-slate-300 border-slate-700', bg: 'bg-slate-900/50' },
    { id: 'IN_PROGRESS', label: 'In Progress (Active Sprint)', headerColor: 'text-sky-400 border-sky-500/40', bg: 'bg-sky-950/20' },
    { id: 'REVIEW', label: 'Review & QA Verification', headerColor: 'text-amber-400 border-amber-500/40', bg: 'bg-amber-950/20' },
    { id: 'DONE', label: 'Completed & Deployed', headerColor: 'text-emerald-400 border-emerald-500/40', bg: 'bg-emerald-950/20' }
  ];

  // Safeguard Tech Stack
  const currentTechStack = useMemo(() => {
    if (!currentProject?.techStack) return [];
    if (Array.isArray(currentProject.techStack)) return currentProject.techStack;
    if (typeof currentProject.techStack === 'string') {
      return (currentProject.techStack as string).split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [currentProject]);

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans select-none relative">
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border transition-all duration-300 animate-fade-in ${
          toastMsg.type === 'success' ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50 shadow-emerald-950/50' :
          toastMsg.type === 'error' ? 'bg-rose-950 text-rose-200 border-rose-500/50 shadow-rose-950/50' :
          'bg-sky-950 text-sky-200 border-sky-500/50 shadow-sky-950/50'
        }`}>
          {toastMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMsg.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
          {toastMsg.type === 'info' && <AlertCircle className="w-4 h-4 text-sky-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* 1. Top Navigation & Action Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-sm text-slate-100 tracking-wide">
                Enterprise Project Management
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono">
                Real-Time CRUD
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Corporate Client Delivery, Agile Microservices & Live Sprint Kanban
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Refresh Real-Time Projects Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowNewTaskModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs transition flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Add Task</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewProjectModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>New Engagement</span>
          </button>
        </div>
      </div>

      {/* 2. Corporate KPI Metric Cards */}
      <div className="bg-slate-950 px-5 py-3 border-b border-slate-850 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Active Projects</div>
            <div className="text-lg font-bold text-slate-100 mt-0.5">{metrics.activeCount} <span className="text-xs text-slate-500 font-normal">/ {metrics.totalEngagements} Total</span></div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Contract Value</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">৳{metrics.totalBudget.toLocaleString()}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Engineering Hours</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{metrics.totalHours}h <span className="text-xs text-slate-500 font-normal">/ {metrics.totalAllocated}h</span></div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Sprint Velocity</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">{metrics.completedTasks} <span className="text-xs text-slate-500 font-normal">of {metrics.allTasksCount} Tasks Done</span></div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Project Selector, Search, Filter & View Toggles */}
      <div className="bg-slate-900/60 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Project Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium text-[11px]">Selected Engagement:</span>
          <select
            value={currentProject?.id || ''}
            onChange={(e) => selectProject(e.target.value)}
            className="bg-slate-950 border border-slate-750 text-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name} ({p.clientName})
              </option>
            ))}
          </select>

          {currentProject && healthBadge(currentProject.healthStatus)}
        </div>

        {/* Right: View Switcher & Filters */}
        <div className="flex items-center space-x-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter tasks / code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-44"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 space-x-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({currentProject ? (currentProject.tasks || []).length : 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('TODO')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'TODO' ? 'bg-slate-700 text-slate-100 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              To Do ({(currentProject?.tasks || []).filter(t => t.status === 'TODO').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'IN_PROGRESS' ? 'bg-sky-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress ({(currentProject?.tasks || []).filter(t => t.status === 'IN_PROGRESS').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('REVIEW')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'REVIEW' ? 'bg-amber-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Review ({(currentProject?.tasks || []).filter(t => t.status === 'REVIEW').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DONE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'DONE' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({(currentProject?.tasks || []).filter(t => t.status === 'DONE').length})
            </button>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* View Mode Buttons */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center space-x-0.5">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'KANBAN' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('MILESTONES')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'MILESTONES' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Milestone className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </button>

            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
                viewMode === 'TABLE' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Active Project Context Ribbon with Edit and Delete options */}
      {currentProject && (
        <div className="bg-slate-900/40 px-5 py-2 border-b border-slate-850 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-4 flex-wrap gap-y-1">
            <span className="flex items-center space-x-1 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Client: <strong className="text-slate-200">{currentProject.clientName}</strong></span>
            </span>

            <span className="flex items-center space-x-1 text-slate-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Lead Architect: <strong className="text-slate-200">{currentProject.leadArchitect}</strong></span>
            </span>

            <span className="flex items-center space-x-1 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target: <strong className="text-slate-200">{currentProject.targetCompletionDate}</strong></span>
            </span>

            <span className="flex items-center space-x-1 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Sprint: <strong className="text-amber-300 font-mono">{currentProject.currentSprint}</strong></span>
            </span>
          </div>

          {/* Tech Stack Pills & Project Action Buttons */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 overflow-x-auto max-w-xs">
              {currentTechStack.map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono whitespace-nowrap">
                  {tech}
                </span>
              ))}
            </div>

            {/* Edit Project Button */}
            <button
              type="button"
              onClick={() => openEditProject(currentProject)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30 hover:border-amber-500 font-semibold text-xs transition flex items-center space-x-1"
              title="Edit Project Engagement"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Engagement</span>
            </button>

            {/* Delete Project Button */}
            <button
              type="button"
              onClick={() => setDeletingProjectId(currentProject.id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
              title="Delete Project Engagement"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* VIEW A: KANBAN BOARD */}
        {viewMode === 'KANBAN' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full min-h-[500px]">
            {kanbanColumns.map((col) => {
              const colTasks = currentTasks.filter(t => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className={`flex flex-col rounded-xl border border-slate-800 p-3.5 ${col.bg} transition shadow-lg`}
                >
                  {/* Column Header */}
                  <div className={`flex items-center justify-between pb-2 mb-3 border-b ${col.headerColor}`}>
                    <span className="font-bold text-xs tracking-wide">
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 text-[10px] font-mono font-bold border border-slate-800">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards List */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {colTasks.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs italic">
                        No tasks in this lane
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left space-y-2 transition shadow group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">
                              {task.id}
                            </span>
                            {priorityBadge(task.priority)}
                          </div>

                          <h4 className="text-xs font-bold text-slate-100 leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-medium text-slate-300 flex items-center space-x-1">
                              <span>👤</span>
                              <span className="truncate max-w-[90px]">{task.assignee}</span>
                            </span>

                            <span className="font-mono text-amber-300 font-bold">
                              {task.loggedHours}h / {task.estimatedHours}h
                            </span>
                          </div>

                          {/* Quick Workflow Actions & Edit/Delete */}
                          <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-800/80">
                            <div className="flex items-center space-x-1 text-[10px] flex-wrap gap-y-1">
                              {col.id !== 'TODO' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTaskStatus(task.id, 'TODO', 'To Do');
                                  }}
                                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-bold"
                                  title="Move to To Do (Backlog)"
                                >
                                  To Do
                                </button>
                              )}
                              {col.id !== 'IN_PROGRESS' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTaskStatus(task.id, 'IN_PROGRESS', 'In Progress');
                                  }}
                                  className="px-2 py-0.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-400 border border-sky-800/60 transition font-bold"
                                  title="Move to In Progress"
                                >
                                  In Progress
                                </button>
                              )}
                              {col.id !== 'REVIEW' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTaskStatus(task.id, 'REVIEW', 'Review');
                                  }}
                                  className="px-2 py-0.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-800/60 transition font-bold"
                                  title="Move to Review & QA"
                                >
                                  Review
                                </button>
                              )}
                              {col.id !== 'DONE' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTaskStatus(task.id, 'DONE', 'Done');
                                  }}
                                  className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 transition font-bold"
                                  title="Mark as Done"
                                >
                                  Done
                                </button>
                              )}
                            </div>

                            <div className="flex items-center space-x-1">
                              {/* Edit Task Button */}
                              <button
                                type="button"
                                onClick={() => openEditTask(task)}
                                className="p-1 text-slate-500 hover:text-amber-400 transition"
                                title="Edit Task Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Task Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW B: MILESTONES & DELIVERABLES */}
        {viewMode === 'MILESTONES' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <Milestone className="w-5 h-5 text-amber-400" />
                    <span>Project Milestones & Critical Path Deliverables</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Formal architecture reviews, regulatory compliance checkpoints, and release targets for {currentProject?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(!currentProject?.milestones || currentProject.milestones.length === 0) ? (
                  <div className="text-center py-10 text-slate-500 text-xs italic">
                    No milestones defined for this project engagement.
                  </div>
                ) : (
                  currentProject.milestones.map((m, idx) => (
                    <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-750 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-200">{m.name}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400 font-mono">Due: {m.dueDate}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            m.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Milestone Completion</span>
                          <span className="text-amber-300 font-bold">{m.completionPct}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${m.completionPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: ENGAGEMENTS DIRECTORY (TABLE) */}
        {viewMode === 'TABLE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">All Enterprise Technology Engagements</h3>
                <p className="text-xs text-slate-400">Complete enterprise project register and operational status</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Code & Engagement</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Lead Architect</th>
                    <th className="px-4 py-3">Contract Value</th>
                    <th className="px-4 py-3">Burned Hours</th>
                    <th className="px-4 py-3">Health</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-sans">
                  {state.projects.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => selectProject(p.id)}
                      className={`hover:bg-slate-800/40 transition cursor-pointer ${
                        p.id === currentProject?.id ? 'bg-slate-800/60 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-100">{p.name}</div>
                        <div className="font-mono text-[10px] text-amber-400">{p.code}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-medium">
                        {p.clientName}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {p.leadArchitect}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        ৳{Number(p.budgetBDT || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {p.burnedHours}h / {p.allocatedHours}h
                      </td>
                      <td className="px-4 py-3">
                        {healthBadge(p.healthStatus)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              selectProject(p.id);
                              setViewMode('KANBAN');
                            }}
                            className="px-2 py-1 rounded bg-sky-600/80 hover:bg-sky-500 text-white font-bold text-[10px] transition"
                          >
                            Open Board
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditProject(p)}
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] transition flex items-center space-x-1"
                            title="Edit Project Details"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProjectId(p.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE NEW PROJECT */}
      {showNewProjectModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowNewProjectModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-slate-100 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Initialize Technology Engagement</h3>
                  <p className="text-[11px] text-slate-400">Add new client project to AuraTech delivery registry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Project Engagement Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh Bank RTGS Core Node Modernization"
                    value={newProjectForm.name}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Client / Corporate Account *</label>
                  {state.customers.length > 0 && (
                    <select
                      value={newProjectForm.clientId}
                      onChange={(e) => {
                        const selectedCust = state.customers.find(c => c.id === e.target.value);
                        setNewProjectForm({
                          ...newProjectForm,
                          clientId: e.target.value,
                          clientName: selectedCust ? selectedCust.name : newProjectForm.clientName
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 mb-1.5"
                    >
                      <option value="">-- Choose Existing Client --</option>
                      {state.customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh Bank / Apex Corp"
                    value={newProjectForm.clientName}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Lead Architect / Manager *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nusrat Jahan"
                    value={newProjectForm.leadArchitect}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, leadArchitect: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Budget (BDT) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="5000000"
                    value={newProjectForm.budgetBDT}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, budgetBDT: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Allocated Hours *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    placeholder="450"
                    value={newProjectForm.allocatedHours}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, allocatedHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Current Sprint</label>
                  <input
                    type="text"
                    placeholder="Sprint 1 - Inception"
                    value={newProjectForm.currentSprint}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, currentSprint: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Delivery Date</label>
                  <input
                    type="date"
                    value={newProjectForm.targetCompletionDate}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, targetCompletionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Initial Status</label>
                  <select
                    value={newProjectForm.status}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value as ProjectEngagementStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Health Status</label>
                  <select
                    value={newProjectForm.healthStatus}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, healthStatus: e.target.value as ProjectHealthStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="HEALTHY_GREEN">Optimal (Green)</option>
                    <option value="AT_RISK_YELLOW">At Risk (Yellow)</option>
                    <option value="CRITICAL_RED">Critical Block (Red)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="FastAPI, Kafka, Kubernetes, PostgreSQL"
                    value={newProjectForm.techStack}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, techStack: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Scope & Technical Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Summarize high-level deliverables, SLA requirements, and deployment targets..."
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
                >
                  {isCreatingProject ? 'Creating...' : 'Create Engagement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EXISTING PROJECT */}
      {editingProject && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingProject(null)}
        >
          <div
            className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-slate-100 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Edit Engagement: <span className="text-amber-400 font-mono">{editingProject.code}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Update project parameters, budget, sprint velocity and status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProjectSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Project Engagement Name *</label>
                  <input
                    type="text"
                    required
                    value={editProjectForm.name}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editProjectForm.clientName}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Lead Architect *</label>
                  <input
                    type="text"
                    required
                    value={editProjectForm.leadArchitect}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, leadArchitect: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contract Budget (BDT) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProjectForm.budgetBDT}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, budgetBDT: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Billed Amount (BDT)</label>
                  <input
                    type="number"
                    min={0}
                    value={editProjectForm.billedBDT}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, billedBDT: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Allocated Hours *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editProjectForm.allocatedHours}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, allocatedHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Burned Hours (Actual)</label>
                  <input
                    type="number"
                    min={0}
                    value={editProjectForm.burnedHours}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, burnedHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Current Sprint</label>
                  <input
                    type="text"
                    value={editProjectForm.currentSprint}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, currentSprint: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Delivery Date</label>
                  <input
                    type="date"
                    value={editProjectForm.targetCompletionDate}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, targetCompletionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Engagement Status</label>
                  <select
                    value={editProjectForm.status}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, status: e.target.value as ProjectEngagementStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Health Status</label>
                  <select
                    value={editProjectForm.healthStatus}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, healthStatus: e.target.value as ProjectHealthStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="HEALTHY_GREEN">Optimal (Green)</option>
                    <option value="AT_RISK_YELLOW">At Risk (Yellow)</option>
                    <option value="CRITICAL_RED">Critical Block (Red)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    value={editProjectForm.techStack}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, techStack: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Scope & Objectives</label>
                  <textarea
                    rows={2}
                    value={editProjectForm.description}
                    onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition shadow-lg shadow-sky-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE PROJECT CONFIRMATION */}
      {deletingProjectId && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeletingProjectId(null)}
        >
          <div
            className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Delete Project Engagement?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Are you sure you want to permanently delete this engagement and all of its associated milestones, sprint tasks, and logs from AuraTech database?
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProjectId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteProject(deletingProjectId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30"
              >
                Yes, Delete Engagement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD TASK TO PROJECT */}
      {showNewTaskModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowNewTaskModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Add Sprint Task</h3>
                  <p className="text-[11px] text-slate-400">
                    Project: <strong className="text-amber-300">{currentProject?.code} - {currentProject?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Kafka Consumer Schema Registry"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Initial Status</label>
                  <select
                    value={newTaskForm.status}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, status: e.target.value as ProjectTaskStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="TODO">To Do (Backlog)</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review & QA</option>
                    <option value="DONE">Done / Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority Level</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as ProjectTaskPriority })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Engineer</label>
                  <input
                    type="text"
                    placeholder="e.g. Mahmud Hasan"
                    value={newTaskForm.assignee}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Estimated Hours</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="16"
                    value={newTaskForm.estimatedHours}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, estimatedHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Sprint Lane</label>
                  <input
                    type="text"
                    placeholder="Sprint 1"
                    value={newTaskForm.sprint}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, sprint: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Task Description & Deliverables</label>
                <textarea
                  rows={2}
                  placeholder="Detail acceptance criteria, cluster endpoints, and test requirements..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition shadow-lg shadow-sky-600/20"
                >
                  Add to Sprint Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT SPRINT TASK */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingTask(null)}
        >
          <div
            className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Edit Task: <span className="text-sky-400 font-mono">{editingTask.id}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Update task status, logged hours, and priority</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTaskSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Task Title *</label>
                <input
                  type="text"
                  required
                  value={editTaskForm.title}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Lane Status</label>
                  <select
                    value={editTaskForm.status}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value as ProjectTaskStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="TODO">To Do (Backlog)</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review & QA</option>
                    <option value="DONE">Done / Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Priority Level</label>
                  <select
                    value={editTaskForm.priority}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value as ProjectTaskPriority })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Engineer</label>
                  <input
                    type="text"
                    value={editTaskForm.assignee}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Sprint</label>
                  <input
                    type="text"
                    value={editTaskForm.sprint}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, sprint: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Estimated Hours</label>
                  <input
                    type="number"
                    min={0}
                    value={editTaskForm.estimatedHours}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, estimatedHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Logged Hours (Burned)</label>
                  <input
                    type="number"
                    min={0}
                    value={editTaskForm.loggedHours}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, loggedHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={editTaskForm.dueDate}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Task Description & Deliverables</label>
                <textarea
                  rows={2}
                  value={editTaskForm.description}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
                >
                  Save Task Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
