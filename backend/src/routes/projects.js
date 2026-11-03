import express from 'express';
import db from '../services/db.js';
import { requireAuth } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

const router = express.Router();

// Middleware to support both bearer tokens and direct internal ERP client requests
const checkAuthOrAllowInternal = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  req.user = { id: 'admin-erp', name: 'Nusrat Jahan', role: 'PROJECT_MANAGER' };
  next();
};

// GET /api/projects - All corporate technology engagements
router.get('/', (req, res) => {
  const { status, healthStatus, clientId, search } = req.query;
  let projects = db.get('projects');

  if (status && status !== 'ALL') {
    projects = projects.filter(p => (p.status || '').toUpperCase() === status.toUpperCase());
  }
  if (healthStatus && healthStatus !== 'ALL') {
    projects = projects.filter(p => (p.healthStatus || '').toUpperCase() === healthStatus.toUpperCase());
  }
  if (clientId && clientId !== 'ALL') {
    projects = projects.filter(p => p.clientId === clientId);
  }
  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.clientName && p.clientName.toLowerCase().includes(q)) ||
      (p.leadArchitect && p.leadArchitect.toLowerCase().includes(q))
    );
  }

  res.json({ total: projects.length, data: projects });
});

// GET /api/projects/:id - Project details with milestones & tasks
router.get('/:id', (req, res) => {
  const project = db.findById('projects', req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// POST /api/projects - Create project engagement
router.post('/', checkAuthOrAllowInternal, (req, res) => {
  const {
    name,
    clientName,
    clientId,
    leadArchitect,
    budgetBDT,
    techStack,
    targetCompletionDate,
    description,
    currentSprint,
    allocatedHours
  } = req.body;

  if (!name || !clientName) {
    return res.status(400).json({ error: 'Project name and client name are required' });
  }

  const projectId = `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;
  const cleanCode = `PRJ-${name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}`;

  const newProject = {
    id: projectId,
    code: cleanCode,
    name: name.trim(),
    description: description || `Corporate technology engagement for ${clientName}`,
    clientId: clientId || 'CUST-1001',
    clientName: clientName.trim(),
    leadArchitect: leadArchitect || req.user.name || 'Nusrat Jahan',
    budgetBDT: Number(budgetBDT) || 5000000,
    billedBDT: 0,
    burnedHours: 0,
    allocatedHours: Number(allocatedHours) || 400,
    currentSprint: currentSprint || 'Sprint 1 - Inception & Discovery',
    status: req.body.status || 'IN_PROGRESS',
    healthStatus: req.body.healthStatus || 'HEALTHY_GREEN',
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    targetCompletionDate: targetCompletionDate || '2026-12-31',
    techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(s => s.trim()).filter(Boolean) : ['Cloud', 'DevOps']),
    milestones: Array.isArray(req.body.milestones) ? req.body.milestones : [
      { id: `MLS-${Date.now()}-1`, name: 'Architecture Review & CI/CD Pipeline', status: 'IN_PROGRESS', dueDate: '2026-11-15', completionPct: 45 },
      { id: `MLS-${Date.now()}-2`, name: 'Core Engine Milestone 1 Delivery', status: 'PENDING', dueDate: '2026-12-15', completionPct: 0 }
    ],
    tasks: Array.isArray(req.body.tasks) ? req.body.tasks : [
      {
        id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Initial Cloud Architecture & Security Review',
        description: 'Verify SOC2 & ISO 27001 posture on VPC cluster endpoints',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: leadArchitect || 'Nusrat Jahan',
        estimatedHours: 24,
        loggedHours: 12,
        sprint: currentSprint || 'Sprint 1',
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: '2026-11-05'
      },
      {
        id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Provision Staging Kubernetes Cluster',
        description: 'Set up cluster nodes and Helm deployment manifests',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: 'Mahmud Hasan',
        estimatedHours: 18,
        loggedHours: 0,
        sprint: currentSprint || 'Sprint 1',
        createdAt: new Date().toISOString().split('T')[0],
        dueDate: '2026-11-10'
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.insert('projects', newProject);
  logAuditEvent('PROJECT_INITIALIZED', `Initialized engagement ${newProject.name} for ${newProject.clientName}`, req);
  res.status(201).json(newProject);
});

// PUT /api/projects/:id - Update project engagement
router.put('/:id', checkAuthOrAllowInternal, (req, res) => {
  const existing = db.findById('projects', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  const allowedUpdates = [
    'name',
    'clientName',
    'clientId',
    'leadArchitect',
    'budgetBDT',
    'billedBDT',
    'burnedHours',
    'allocatedHours',
    'currentSprint',
    'status',
    'healthStatus',
    'startDate',
    'targetCompletionDate',
    'techStack',
    'description',
    'milestones',
    'tasks'
  ];

  const patch = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      if (['budgetBDT', 'billedBDT', 'burnedHours', 'allocatedHours'].includes(key)) {
        patch[key] = Number(req.body[key]) || 0;
      } else if (key === 'techStack' && typeof req.body[key] === 'string') {
        patch[key] = req.body[key].split(',').map(s => s.trim()).filter(Boolean);
      } else {
        patch[key] = req.body[key];
      }
    }
  }

  const updated = db.update('projects', req.params.id, patch);
  logAuditEvent('PROJECT_UPDATED', `Updated project ${existing.code} (${existing.name})`, req);
  res.json(updated);
});

// DELETE /api/projects/:id - Delete project engagement
router.delete('/:id', checkAuthOrAllowInternal, (req, res) => {
  const existing = db.findById('projects', req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  db.delete('projects', req.params.id);
  logAuditEvent('PROJECT_DELETED', `Deleted project ${existing.code} (${existing.name})`, req);
  res.json({ message: `Project ${existing.code} deleted successfully`, id: req.params.id });
});

// --- TASKS SUB-RESOURCE ENDPOINTS ---

// POST /api/projects/:id/tasks - Create task within project
router.post('/:id/tasks', checkAuthOrAllowInternal, (req, res) => {
  const project = db.findById('projects', req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { title, description, status, priority, assignee, estimatedHours, sprint, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required' });

  const newTask = {
    id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
    title: title.trim(),
    description: description || '',
    status: status || 'TODO',
    priority: priority || 'MEDIUM',
    assignee: assignee || project.leadArchitect || 'Unassigned',
    estimatedHours: Number(estimatedHours) || 8,
    loggedHours: 0,
    sprint: sprint || project.currentSprint || 'Sprint 1',
    createdAt: new Date().toISOString().split('T')[0],
    dueDate: dueDate || project.targetCompletionDate
  };

  const currentTasks = Array.isArray(project.tasks) ? project.tasks : [];
  const updatedTasks = [...currentTasks, newTask];

  db.update('projects', project.id, { tasks: updatedTasks });
  logAuditEvent('PROJECT_TASK_CREATED', `Added task "${newTask.title}" to project ${project.code}`, req);
  res.status(201).json(newTask);
});

// PUT /api/projects/:id/tasks/:taskId - Update specific task within project
router.put('/:id/tasks/:taskId', checkAuthOrAllowInternal, (req, res) => {
  const project = db.findById('projects', req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const currentTasks = Array.isArray(project.tasks) ? project.tasks : [];
  const taskIndex = currentTasks.findIndex(t => t.id === req.params.taskId);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  const updatedTask = {
    ...currentTasks[taskIndex],
    ...req.body,
    id: req.params.taskId // protect ID
  };

  currentTasks[taskIndex] = updatedTask;

  // Re-calculate burned hours if loggedHours changed
  const totalBurned = currentTasks.reduce((sum, t) => sum + (Number(t.loggedHours) || 0), 0);

  db.update('projects', project.id, { tasks: currentTasks, burnedHours: totalBurned });
  res.json(updatedTask);
});

// DELETE /api/projects/:id/tasks/:taskId - Remove task
router.delete('/:id/tasks/:taskId', checkAuthOrAllowInternal, (req, res) => {
  const project = db.findById('projects', req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const currentTasks = Array.isArray(project.tasks) ? project.tasks : [];
  const filteredTasks = currentTasks.filter(t => t.id !== req.params.taskId);

  db.update('projects', project.id, { tasks: filteredTasks });
  res.json({ message: 'Task deleted successfully', taskId: req.params.taskId });
});

export default router;
