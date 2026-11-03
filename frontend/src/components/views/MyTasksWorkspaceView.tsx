import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Building2,
  X
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { ProjectTask, ProjectTaskStatus, ProjectTaskPriority, ProjectEngagement } from '../../types/erp';
import { api } from '../../services/api';

interface MyTasksWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

interface EnrichedTask extends ProjectTask {
  projectId: string;
  projectName: string;
  projectCode: string;
}

export const MyTasksWorkspaceView: React.FC<MyTasksWorkspaceViewProps> = ({ store }) => {
  const { state, updateTaskStatus, updateProjectTask, addTaskToProject, fetchProjects } = store;
  const currentUser = state.currentUser;

  // View state
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>(currentUser?.name || '');
  const [viewScope, setViewScope] = useState<'MY_TASKS' | 'TEAM_TASKS'>('MY_TASKS');

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [loggingHoursTask, setLoggingHoursTask] = useState<EnrichedTask | null>(null);
  const [hoursToAdd, setHoursToAdd] = useState<number>(2);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New task form
  const [allEmployees, setAllEmployees] = useState<{ id: string; name: string; department: string }[]>([]);
  const [newTaskForm, setNewTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    assignee: currentUser?.name || 'Asif Hossain Khan',
    priority: 'HIGH' as ProjectTaskPriority,
    status: 'TODO' as ProjectTaskStatus,
    estimatedHours: 16,
    sprint: 'Sprint 1',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync projects and employees on mount
  useEffect(() => {
    fetchProjects();
    // Fetch employees for assignment dropdown
    api.getEmployeesFastAPI().then((res) => {
      if (res.data && Array.isArray(res.data)) {
        setAllEmployees(
          res.data.map((e: any) => ({
            id: e.employee_id,
            name: e.full_name,
            department: e.department,
          }))
        );
      }
    }).catch(() => {
      // Fallback
    });
  }, [fetchProjects]);

  const isManagerOrAdmin =
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Project Manager' ||
    currentUser?.role === 'HR Manager';

  // Aggregate all tasks across projects
  const allEnrichedTasks: EnrichedTask[] = useMemo(() => {
    const list: EnrichedTask[] = [];
    (state.projects || []).forEach((p: ProjectEngagement) => {
      (p.tasks || []).forEach((t: ProjectTask) => {
        list.push({
          ...t,
          projectId: p.id,
          projectName: p.name,
          projectCode: p.code,
        });
      });
    });
    return list;
  }, [state.projects]);

  // Set default project in modal if available
  useEffect(() => {
    if (state.projects && state.projects.length > 0 && !newTaskForm.projectId) {
      setNewTaskForm((prev) => ({ ...prev, projectId: state.projects[0].id }));
    }
  }, [state.projects, newTaskForm.projectId]);

  // Filter tasks for current user or team
  const displayedTasks = useMemo(() => {
    let tasks = allEnrichedTasks;

    if (viewScope === 'MY_TASKS') {
      const myName = (currentUser?.name || '').toLowerCase();
      const myUsername = (currentUser?.username || '').toLowerCase();
      tasks = tasks.filter((t) => {
        const assignee = (t.assignee || '').toLowerCase();
        return (
          assignee.includes(myName) ||
          myName.includes(assignee) ||
          assignee.includes(myUsername)
        );
      });
    } else if (selectedAssignee && selectedAssignee !== 'ALL') {
      const filterName = selectedAssignee.toLowerCase();
      tasks = tasks.filter((t) => (t.assignee || '').toLowerCase().includes(filterName));
    }

    if (filterPriority !== 'ALL') {
      tasks = tasks.filter((t) => t.priority === filterPriority);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q)
      );
    }

    return tasks;
  }, [allEnrichedTasks, viewScope, selectedAssignee, filterPriority, searchQuery, currentUser]);

  // Kanban lanes
  const todoTasks = useMemo(() => displayedTasks.filter((t) => t.status === 'TODO'), [displayedTasks]);
  const inProgressTasks = useMemo(() => displayedTasks.filter((t) => t.status === 'IN_PROGRESS'), [displayedTasks]);
  const reviewTasks = useMemo(() => displayedTasks.filter((t) => t.status === 'REVIEW'), [displayedTasks]);
  const doneTasks = useMemo(() => displayedTasks.filter((t) => t.status === 'DONE'), [displayedTasks]);

  // Handlers
  const handleMoveStatus = async (task: EnrichedTask, nextStatus: ProjectTaskStatus) => {
    await updateTaskStatus(task.projectId, task.id, nextStatus);
    showToast(`Task "${task.title.slice(0, 24)}..." moved to ${nextStatus.replace('_', ' ')}`, 'success');
  };

  const handleLogHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingHoursTask) return;
    const currentLogged = Number(loggingHoursTask.loggedHours) || 0;
    const newLogged = currentLogged + Number(hoursToAdd);
    await updateProjectTask(loggingHoursTask.projectId, loggingHoursTask.id, {
      loggedHours: newLogged,
    });
    showToast(`Logged ${hoursToAdd} hrs for task "${loggingHoursTask.title.slice(0, 20)}..." (Total: ${newLogged} hrs)`, 'success');
    setLoggingHoursTask(null);
    setHoursToAdd(2);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim() || !newTaskForm.projectId) {
      showToast('Please provide a task title and select a project', 'error');
      return;
    }

    try {
      await addTaskToProject(newTaskForm.projectId, {
        title: newTaskForm.title.trim(),
        description: newTaskForm.description.trim() || 'Assigned deliverable in enterprise sprint.',
        assignee: newTaskForm.assignee.trim(),
        priority: newTaskForm.priority,
        status: newTaskForm.status,
        estimatedHours: Number(newTaskForm.estimatedHours) || 16,
        loggedHours: 0,
        sprint: newTaskForm.sprint || 'Sprint 1',
        dueDate: newTaskForm.dueDate,
      });

      showToast(`Task assigned successfully to ${newTaskForm.assignee}!`, 'success');
      setShowAssignModal(false);
      setNewTaskForm((prev) => ({
        ...prev,
        title: '',
        description: '',
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to assign task', 'error');
    }
  };

  const getPriorityBadge = (priority: ProjectTaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">LOW</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 ${
            toastMsg.type === 'error'
              ? 'bg-rose-950 border-rose-600 text-rose-200'
              : 'bg-slate-900 border-amber-500 text-amber-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Banner / Workspace Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-md">
              <CheckSquare className="w-5 h-5 font-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Employee Tasks & Deliverables Workspace</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  Sprint Execution
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-slate-200 font-semibold">{currentUser?.name}</span> ({currentUser?.role}) • Real-time Task Status & Time Logging
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Scope Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Manager / Admin Scope Toggle */}
          {isManagerOrAdmin && (
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setViewScope('MY_TASKS')}
                className={`px-3 py-1.5 rounded-md transition ${
                  viewScope === 'MY_TASKS' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Tasks
              </button>
              <button
                onClick={() => setViewScope('TEAM_TASKS')}
                className={`px-3 py-1.5 rounded-md transition ${
                  viewScope === 'TEAM_TASKS' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Team Tasks (All Staff)
              </button>
            </div>
          )}

          {/* Employee Filter Dropdown (When viewing team tasks) */}
          {isManagerOrAdmin && viewScope === 'TEAM_TASKS' && (
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-slate-900 border border-slate-750 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium outline-none focus:border-amber-400"
            >
              <option value="ALL">All Team Members</option>
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          )}

          {/* Assign Task Button */}
          {isManagerOrAdmin && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4 font-extrabold" />
              <span>+ Assign Task to Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs flex-shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <ListTodo className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Total Active Tasks:</span>
            <span className="font-mono font-bold text-slate-200">{displayedTasks.length}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-400">To-Do:</span>
            <span className="font-mono font-bold text-slate-200">{todoTasks.length}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400">In Progress:</span>
            <span className="font-mono font-bold text-amber-300">{inProgressTasks.length}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-400">In Review:</span>
            <span className="font-mono font-bold text-cyan-300">{reviewTasks.length}</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Completed:</span>
            <span className="font-mono font-bold text-emerald-300">{doneTasks.length}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-750 text-slate-200 text-xs pl-8 pr-3 py-1 rounded-lg outline-none w-44 focus:border-amber-400"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-900 border border-slate-750 text-slate-300 text-xs px-2.5 py-1 rounded-lg outline-none font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Kanban Columns Body */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full min-w-[1000px]">
          {/* 1. TO-DO COLUMN */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h4 className="font-bold text-xs text-slate-200">To-Do (Assigned)</h4>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                {todoTasks.length}
              </span>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {todoTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 mb-1 opacity-40 text-emerald-400" />
                  <span>No tasks pending to do</span>
                </div>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getPriorityBadge={getPriorityBadge}
                    onMoveStatus={handleMoveStatus}
                    onOpenLogHours={(t) => setLoggingHoursTask(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* 2. IN PROGRESS COLUMN */}
          <div className="bg-slate-950/80 rounded-2xl border border-amber-500/30 flex flex-col overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h4 className="font-bold text-xs text-amber-200">In Progress (Active)</h4>
              </div>
              <span className="text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {inProgressTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <span>No tasks currently active</span>
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getPriorityBadge={getPriorityBadge}
                    onMoveStatus={handleMoveStatus}
                    onOpenLogHours={(t) => setLoggingHoursTask(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* 3. IN REVIEW COLUMN */}
          <div className="bg-slate-950/80 rounded-2xl border border-cyan-500/30 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h4 className="font-bold text-xs text-cyan-200">In Review (QA / Approval)</h4>
              </div>
              <span className="text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                {reviewTasks.length}
              </span>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {reviewTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <span>No tasks in review</span>
                </div>
              ) : (
                reviewTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getPriorityBadge={getPriorityBadge}
                    onMoveStatus={handleMoveStatus}
                    onOpenLogHours={(t) => setLoggingHoursTask(t)}
                  />
                ))
              )}
            </div>
          </div>

          {/* 4. COMPLETED COLUMN */}
          <div className="bg-slate-950/80 rounded-2xl border border-emerald-500/30 flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h4 className="font-bold text-xs text-emerald-200">Completed (Done)</h4>
              </div>
              <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {doneTasks.length}
              </span>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {doneTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <span>No completed tasks yet</span>
                </div>
              ) : (
                doneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getPriorityBadge={getPriorityBadge}
                    onMoveStatus={handleMoveStatus}
                    onOpenLogHours={(t) => setLoggingHoursTask(t)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Assign New Task to Employee */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Assign New Task to Employee</h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Project *</label>
                <select
                  required
                  value={newTaskForm.projectId}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, projectId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-400"
                >
                  <option value="" disabled>Choose target project</option>
                  {(state.projects || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assign to Employee *</label>
                <select
                  required
                  value={newTaskForm.assignee}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-400 font-semibold"
                >
                  {allEmployees.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} • {e.department} ({e.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Authentication & RBAC Router"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Task Scope & Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide technical specifications, milestone targets, and delivery instructions..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as ProjectTaskPriority })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Estimated Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={newTaskForm.estimatedHours}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Work Hours */}
      {loggingHoursTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs text-slate-100">Log Daily Work Hours</h4>
              </div>
              <button onClick={() => setLoggingHoursTask(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs">
              <span className="text-slate-400 block">Task:</span>
              <span className="font-bold text-slate-200">{loggingHoursTask.title}</span>
              <div className="text-[11px] text-slate-500 mt-1">
                Currently logged: {loggingHoursTask.loggedHours || 0} hrs / Estimated: {loggingHoursTask.estimatedHours || 0} hrs
              </div>
            </div>

            <form onSubmit={handleLogHoursSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-semibold">Hours Worked Today:</label>
                <div className="flex items-center space-x-2">
                  {[2, 4, 6, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHoursToAdd(h)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                        hoursToAdd === h
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      +{h}h
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hoursToAdd}
                  onChange={(e) => setHoursToAdd(Number(e.target.value))}
                  className="w-full mt-2 bg-slate-950 border border-slate-750 rounded-lg p-2 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLoggingHoursTask(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow cursor-pointer"
                >
                  Save Logged Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: EnrichedTask;
  getPriorityBadge: (p: ProjectTaskPriority) => React.ReactNode;
  onMoveStatus: (task: EnrichedTask, nextStatus: ProjectTaskStatus) => void;
  onOpenLogHours: (task: EnrichedTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  getPriorityBadge,
  onMoveStatus,
  onOpenLogHours,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl shadow-md space-y-2.5 transition group">
      {/* Top badges */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-mono text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {task.projectCode}
        </span>
        {getPriorityBadge(task.priority)}
      </div>

      {/* Title & Description */}
      <div>
        <h5 className="font-bold text-slate-200 text-xs leading-snug group-hover:text-amber-300 transition">
          {task.title}
        </h5>
        {task.description && (
          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Assignee & Due Date Meta */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-850">
        <div className="flex items-center space-x-1.5 truncate">
          <User className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="truncate text-slate-300 font-medium">{task.assignee}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center space-x-1 font-mono text-slate-400 flex-shrink-0">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>

      {/* Hours Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Hours Logged:</span>
          <span className="text-amber-300 font-bold">
            {task.loggedHours || 0} / {task.estimatedHours || 0} hrs
          </span>
        </div>
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
          <div
            style={{
              width: `${Math.min(100, (((task.loggedHours || 0) / (task.estimatedHours || 1)) * 100))}%`,
            }}
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
          />
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-800/80">
        <button
          onClick={() => onOpenLogHours(task)}
          className="text-[10px] font-semibold text-slate-400 hover:text-amber-300 flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 transition"
        >
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Log Hours</span>
        </button>

        <div className="flex items-center space-x-1">
          {task.status === 'TODO' && (
            <button
              onClick={() => onMoveStatus(task, 'IN_PROGRESS')}
              className="text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded shadow transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <>
              <button
                onClick={() => onMoveStatus(task, 'REVIEW')}
                className="text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-2 py-1 rounded shadow transition"
              >
                Review
              </button>
              <button
                onClick={() => onMoveStatus(task, 'DONE')}
                className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-2 py-1 rounded shadow transition flex items-center space-x-0.5 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </button>
            </>
          )}

          {task.status === 'REVIEW' && (
            <>
              <button
                onClick={() => onMoveStatus(task, 'IN_PROGRESS')}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-200 px-1.5 py-0.5"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                onClick={() => onMoveStatus(task, 'DONE')}
                className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-2.5 py-1 rounded shadow transition flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>Approve</span>
              </button>
            </>
          )}

          {task.status === 'DONE' && (
            <button
              onClick={() => onMoveStatus(task, 'IN_PROGRESS')}
              className="text-[10px] font-semibold text-slate-400 hover:text-amber-300 flex items-center space-x-1 px-1.5 py-0.5"
              title="Reopen Task"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

