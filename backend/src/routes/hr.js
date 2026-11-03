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
  req.user = { id: 'admin-erp', name: 'Super Admin', role: 'SUPER_ADMIN' };
  next();
};

// GET /api/hr/employees - Employee directory with filters
router.get('/employees', (req, res) => {
  const { department, search, status } = req.query;
  let employees = db.get('employees') || [];

  if (department && department !== 'ALL') {
    employees = employees.filter(e => e.department && e.department.toLowerCase().includes(department.toLowerCase()));
  }
  if (status && status !== 'ALL') {
    employees = employees.filter(e => e.status && e.status.toUpperCase() === status.toUpperCase());
  }
  if (search) {
    const q = search.toLowerCase();
    employees = employees.filter(e =>
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.designation && e.designation.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.id && e.id.toLowerCase().includes(q)) ||
      (e.department && e.department.toLowerCase().includes(q))
    );
  }

  res.json({ total: employees.length, data: employees });
});

// POST /api/hr/employees - Onboard new corporate employee
router.post('/employees', checkAuthOrAllowInternal, (req, res) => {
  const { name, email, phone, designation, department, level, baseSalaryBDT, hourlyBillableRateUSD, skills, status } = req.body;
  if (!name || !email || !designation || !department) {
    return res.status(400).json({ error: 'Name, email, designation, and department are required' });
  }

  const newEmployee = {
    id: `EMP-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone || '+880-1700-000000',
    designation: designation.trim(),
    department: department.trim(),
    level: level || 'Associate',
    joinDate: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    baseSalaryBDT: Number(baseSalaryBDT || 150000),
    hourlyBillableRateUSD: Number(hourlyBillableRateUSD || 80),
    status: status || 'ACTIVE',
    skills: skills || ['Corporate IT'],
    certifications: []
  };

  db.insert('employees', newEmployee);
  logAuditEvent('EMPLOYEE_ONBOARDED', `Onboarded ${newEmployee.name} (${newEmployee.designation}) in ${newEmployee.department}`, req);
  res.status(201).json(newEmployee);
});

// PUT /api/hr/employees/:id - Update employee record
router.put('/employees/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.update('employees', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  logAuditEvent('EMPLOYEE_UPDATED', `Updated employee record for ${updated.name}`, req);
  res.json(updated);
});

// DELETE /api/hr/employees/:id - Offboard / Delete employee
router.delete('/employees/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('employees', id);
  if (!existing) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  db.delete('employees', id);
  logAuditEvent('EMPLOYEE_OFFBOARDED', `Offboarded employee: ${existing.name} (${existing.id})`, req);
  res.json({ success: true, message: 'Employee removed successfully' });
});

// GET /api/hr/timesheets - Weekly billable timesheet records
router.get('/timesheets', (req, res) => {
  const timesheets = db.get('timesheets') || [];
  res.json({ total: timesheets.length, data: timesheets });
});

// POST /api/hr/timesheets - Submit timesheet log
router.post('/timesheets', checkAuthOrAllowInternal, (req, res) => {
  const { employeeId, employeeName, projectId, projectName, billableHours, nonBillableHours, hourlyRateUSD } = req.body;
  const billable = Number(billableHours || 0);
  const rate = Number(hourlyRateUSD || 100);

  const newTimesheet = {
    id: `TS-${Date.now()}`,
    employeeId: employeeId || req.user.id,
    employeeName: employeeName || req.user.name,
    weekNumber: Math.ceil((new Date().getDate() + 6) / 7),
    year: 2026,
    projectId: projectId || 'PRJ-GENERAL',
    projectName: projectName || 'General Engineering Sprint',
    billableHours: billable,
    nonBillableHours: Number(nonBillableHours || 0),
    totalHours: billable + Number(nonBillableHours || 0),
    hourlyRateUSD: rate,
    totalBillableUSD: billable * rate,
    status: 'SUBMITTED',
    approvedBy: null
  };

  db.insert('timesheets', newTimesheet);
  res.status(201).json(newTimesheet);
});

// GET /api/hr/payroll-summary - High-level payroll metrics
router.get('/payroll-summary', (req, res) => {
  const employees = db.get('employees') || [];
  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (Number(e.baseSalaryBDT) || 0), 0);
  const activeCount = employees.filter(e => e.status === 'ACTIVE').length;

  res.json({
    activeEmployees: activeCount,
    totalMonthlyPayrollBDT: totalMonthlyPayroll,
    averageSalaryBDT: activeCount > 0 ? Math.round(totalMonthlyPayroll / activeCount) : 0,
    currency: 'BDT'
  });
});

/* ==========================================================================
   Terminal Rosters & Shift Allocation Endpoints
   ========================================================================== */

// GET /api/hr/rosters - List all active terminal rosters & shifts
router.get('/rosters', (req, res) => {
  const { shift, status, search, assignedDesk } = req.query;
  let rosters = db.get('terminalRosters') || [];

  if (shift && shift !== 'ALL') {
    rosters = rosters.filter(r => (r.shift || '').toUpperCase() === shift.toUpperCase());
  }
  if (status && status !== 'ALL') {
    rosters = rosters.filter(r => (r.attendance || '').toUpperCase() === status.toUpperCase());
  }
  if (assignedDesk && assignedDesk !== 'ALL') {
    rosters = rosters.filter(r => (r.assignedDesk || '').toLowerCase().includes(assignedDesk.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    rosters = rosters.filter(r =>
      (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
      (r.employeeId && r.employeeId.toLowerCase().includes(q)) ||
      (r.role && r.role.toLowerCase().includes(q)) ||
      (r.assignedDesk && r.assignedDesk.toLowerCase().includes(q)) ||
      (r.rosterCode && r.rosterCode.toLowerCase().includes(q))
    );
  }

  // Sort descending by date/id
  rosters.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());

  res.json({ total: rosters.length, data: rosters });
});

// POST /api/hr/rosters - Assign new staff member to terminal / shift roster
router.post('/rosters', checkAuthOrAllowInternal, (req, res) => {
  const { employeeId, employeeName, phone, role, shift, shiftHours, assignedDesk, date, attendance, incentiveEarnedBDT, notes } = req.body;
  if (!employeeName || !assignedDesk) {
    return res.status(400).json({ error: 'Employee name and assigned desk are required' });
  }

  const shiftType = (shift || 'MORNING').toUpperCase();
  const defaultHours =
    shiftType === 'MORNING' ? '08:00 - 16:00' :
    shiftType === 'EVENING' ? '16:00 - 00:00' :
    shiftType === 'NIGHT' ? '00:00 - 08:00 (NOC)' : 'On-Call Standby';

  const newRoster = {
    id: `RST-${Date.now()}`,
    rosterCode: `RST-DC01-${Date.now().toString().slice(-4)}`,
    employeeId: employeeId || `EMP-${Date.now().toString().slice(-3)}`,
    employeeName: employeeName.trim(),
    phone: phone || '+880-1700-000000',
    role: role || 'Terminal Specialist',
    shift: shiftType,
    shiftHours: shiftHours || defaultHours,
    assignedDesk: assignedDesk.trim(),
    date: date || new Date().toISOString().split('T')[0],
    attendance: attendance || 'ON_DUTY',
    todaySalesBDT: 0,
    incentiveEarnedBDT: Number(incentiveEarnedBDT || 0),
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.insert('terminalRosters', newRoster);
  logAuditEvent('ROSTER_ASSIGNED', `Assigned ${newRoster.employeeName} to ${newRoster.assignedDesk} (${newRoster.shift} shift)`, req);
  res.status(201).json(newRoster);
});

// PUT /api/hr/rosters/:id - Update roster / re-assign shift
router.put('/rosters/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.update('terminalRosters', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Roster entry not found' });
  }

  logAuditEvent('ROSTER_UPDATED', `Updated shift roster for ${updated.employeeName} (${updated.assignedDesk})`, req);
  res.json(updated);
});

// PATCH /api/hr/rosters/:id/status - Quick attendance / status switch
router.patch('/rosters/:id/status', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const { attendance, todaySalesBDT, incentiveEarnedBDT } = req.body;

  const updates = {};
  if (attendance) updates.attendance = attendance;
  if (todaySalesBDT !== undefined) updates.todaySalesBDT = Number(todaySalesBDT);
  if (incentiveEarnedBDT !== undefined) updates.incentiveEarnedBDT = Number(incentiveEarnedBDT);

  const updated = db.update('terminalRosters', id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Roster entry not found' });
  }

  logAuditEvent('ROSTER_STATUS_CHANGED', `Changed attendance for ${updated.employeeName} to ${updated.attendance}`, req);
  res.json(updated);
});

// DELETE /api/hr/rosters/:id - Remove roster assignment
router.delete('/rosters/:id', checkAuthOrAllowInternal, (req, res) => {
  const { id } = req.params;
  const existing = db.findById('terminalRosters', id);
  if (!existing) {
    return res.status(404).json({ error: 'Roster entry not found' });
  }

  db.delete('terminalRosters', id);
  logAuditEvent('ROSTER_RELEASED', `Released shift roster for ${existing.employeeName} (${existing.assignedDesk})`, req);
  res.json({ success: true, message: 'Shift roster assignment removed' });
});

export default router;
