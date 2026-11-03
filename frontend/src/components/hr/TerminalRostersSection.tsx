import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Trash2,
  DollarSign,
  Sun,
  Moon,
  Sunset,
  Shield,
  Layers,
  Building,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { TerminalRoster } from '../../types/erp';

interface TerminalRostersSectionProps {
  store: ReturnType<typeof useERPStore>;
}

export const TerminalRostersSection: React.FC<TerminalRostersSectionProps> = ({ store }) => {
  const {
    state,
    fetchTerminalRosters,
    addTerminalRoster,
    updateTerminalRoster,
    updateTerminalRosterStatus,
    deleteTerminalRoster
  } = store;

  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING' | 'NIGHT' | 'STANDBY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_DUTY' | 'PRESENT' | 'ON_LEAVE' | 'COMPLETED'>('ALL');
  const [deskFilter, setDeskFilter] = useState<string>('ALL');

  // Modal Dialogs
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingRoster, setEditingRoster] = useState<TerminalRoster | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formEmployeeName, setFormEmployeeName] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formPhone, setFormPhone] = useState('+880-17');
  const [formRole, setFormRole] = useState('Terminal Billing Lead');
  const [formShift, setFormShift] = useState<'MORNING' | 'EVENING' | 'NIGHT' | 'STANDBY'>('MORNING');
  const [formDesk, setFormDesk] = useState('Desk #901');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAttendance, setFormAttendance] = useState<'ON_DUTY' | 'PRESENT' | 'ON_LEAVE' | 'OFF_DUTY' | 'COMPLETED'>('ON_DUTY');
  const [formIncentive, setFormIncentive] = useState<number>(1500);
  const [formNotes, setFormNotes] = useState('');

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Form for Adding New Shift
  const handleOpenAddModal = () => {
    setEditingRoster(null);
    setFormEmployeeName('');
    setFormEmployeeId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setFormPhone('+880-17');
    setFormRole('Terminal Billing Lead');
    setFormShift('MORNING');
    setFormDesk('Desk #901');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormAttendance('ON_DUTY');
    setFormIncentive(1500);
    setFormNotes('');
    setShowAssignModal(true);
  };

  // Open Form for Editing Shift
  const handleOpenEditModal = (roster: TerminalRoster) => {
    setEditingRoster(roster);
    setFormEmployeeName(roster.employeeName);
    setFormEmployeeId(roster.employeeId);
    setFormPhone(roster.phone);
    setFormRole(roster.role);
    setFormShift(roster.shift);
    setFormDesk(roster.assignedDesk);
    setFormDate(roster.date);
    setFormAttendance(roster.attendance);
    setFormIncentive(roster.incentiveEarnedBDT || 0);
    setFormNotes(roster.notes || '');
    setShowAssignModal(true);
  };

  // Save Shift Roster
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeName.trim() || !formDesk.trim()) {
      showToast('Employee Name and Assigned Desk are required!', 'warning');
      return;
    }

    setIsSubmitting(true);
    const shiftHours =
      formShift === 'MORNING' ? '08:00 - 16:00' :
      formShift === 'EVENING' ? '16:00 - 00:00' :
      formShift === 'NIGHT' ? '00:00 - 08:00 (NOC)' : 'On-Call 24/7';

    try {
      if (editingRoster) {
        const res = await updateTerminalRoster(editingRoster.id, {
          employeeName: formEmployeeName.trim(),
          employeeId: formEmployeeId.trim(),
          phone: formPhone.trim(),
          role: formRole.trim(),
          shift: formShift,
          shiftHours,
          assignedDesk: formDesk.trim(),
          date: formDate,
          attendance: formAttendance,
          incentiveEarnedBDT: Number(formIncentive),
          notes: formNotes.trim(),
        });
        if (res) {
          showToast(`Shift roster for "${formEmployeeName}" updated successfully!`, 'success');
        }
      } else {
        const res = await addTerminalRoster({
          employeeName: formEmployeeName.trim(),
          employeeId: formEmployeeId.trim() || `EMP-${Date.now().toString().slice(-3)}`,
          phone: formPhone.trim(),
          role: formRole.trim(),
          shift: formShift,
          shiftHours,
          assignedDesk: formDesk.trim(),
          date: formDate,
          attendance: formAttendance,
          todaySalesBDT: 0,
          incentiveEarnedBDT: Number(formIncentive),
          notes: formNotes.trim(),
        });
        if (res) {
          showToast(`Shift assigned to "${formEmployeeName}" at ${formDesk}!`, 'success');
        }
      }
      setShowAssignModal(false);
    } catch {
      showToast('Failed to save shift roster.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered rosters list
  const filteredRosters = state.terminalRosters.filter(r => {
    if (shiftFilter !== 'ALL' && r.shift !== shiftFilter) return false;
    if (statusFilter !== 'ALL' && r.attendance !== statusFilter) return false;
    if (deskFilter !== 'ALL' && !r.assignedDesk.toLowerCase().includes(deskFilter.toLowerCase())) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.assignedDesk.toLowerCase().includes(q) ||
        r.phone.includes(q)
      );
    }

    return true;
  });

  // KPI Calculations
  const morningCount = state.terminalRosters.filter(r => r.shift === 'MORNING').length;
  const eveningCount = state.terminalRosters.filter(r => r.shift === 'EVENING').length;
  const nightCount = state.terminalRosters.filter(r => r.shift === 'NIGHT').length;
  const onDutyCount = state.terminalRosters.filter(r => r.attendance === 'ON_DUTY' || r.attendance === 'PRESENT').length;

  return (
    <div className="w-full p-4 space-y-4 font-sans text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`px-4 py-2.5 text-xs flex items-center justify-between font-semibold rounded-lg shadow-md transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-slate-950'
          }`}
        >
          <span className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Shift Rosters</div>
            <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">{state.terminalRosters.length}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{onDutyCount} Staff Currently On-Duty</div>
          </div>
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Morning Shift (08:00-16:00)</div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-0.5">{morningCount}</div>
            <div className="text-[10px] text-amber-400 mt-0.5">Primary Retail & Desk Leads</div>
          </div>
          <div className="p-2.5 bg-amber-950/60 border border-amber-800/50 rounded-xl text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Evening Shift (16:00-00:00)</div>
            <div className="text-2xl font-black text-sky-400 font-mono mt-0.5">{eveningCount}</div>
            <div className="text-[10px] text-sky-300 mt-0.5">Enterprise Peak Traffic</div>
          </div>
          <div className="p-2.5 bg-sky-950/60 border border-sky-800/50 rounded-xl text-sky-400">
            <Sunset className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Night NOC Shift (00:00-08:00)</div>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-0.5">{nightCount}</div>
            <div className="text-[10px] text-indigo-300 mt-0.5">Datacenter 24/7 SLA Watch</div>
          </div>
          <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/50 rounded-xl text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Strip (Search, Shift Filters & Assign Button) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by specialist name, ID, desk, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Shift Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            {(['ALL', 'MORNING', 'EVENING', 'NIGHT', 'STANDBY'] as const).map(shift => (
              <button
                key={shift}
                onClick={() => setShiftFilter(shift)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  shiftFilter === shift
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            {(['ALL', 'ON_DUTY', 'PRESENT', 'ON_LEAVE', 'COMPLETED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchTerminalRosters()}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sync Live</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Assign Shift / Roster</span>
          </button>
        </div>
      </div>

      {/* Rosters Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">
            Datacenter & Terminal Desk Allocation Roster ({filteredRosters.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            DC01 Silicon Tower Datacenter
          </span>
        </div>

        {filteredRosters.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-slate-600 mb-1" />
            <div className="font-semibold text-sm">No terminal shift rosters recorded yet.</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Assign staff to morning, evening, or overnight NOC shifts to track live terminal desks and incentives.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Assign First Shift Roster</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3">Staff Specialist / Lead</th>
                  <th className="p-3">Practice Role & Domain</th>
                  <th className="p-3 text-center">Assigned Terminal Desk</th>
                  <th className="p-3 text-center">Shift Schedule</th>
                  <th className="p-3 text-right">Incentive (৳)</th>
                  <th className="p-3 text-center">Attendance / Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRosters.map(roster => (
                  <tr key={roster.id} className="hover:bg-slate-850/60 transition group">
                    <td className="p-3">
                      <div className="font-bold text-slate-100 text-xs">{roster.employeeName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ID: {roster.employeeId} • {roster.phone}
                      </div>
                    </td>

                    <td className="p-3 text-slate-300 font-medium">
                      <div>{roster.role}</div>
                      {roster.notes && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5">
                          {roster.notes}
                        </div>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <span className="bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2.5 py-0.5 rounded text-[11px] font-bold font-mono">
                        {roster.assignedDesk}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <div className="inline-flex items-center space-x-1 font-semibold text-[11px]">
                        {roster.shift === 'MORNING' && <Sun className="w-3 h-3 text-amber-400" />}
                        {roster.shift === 'EVENING' && <Sunset className="w-3 h-3 text-sky-400" />}
                        {roster.shift === 'NIGHT' && <Moon className="w-3 h-3 text-indigo-400" />}
                        {roster.shift === 'STANDBY' && <Shield className="w-3 h-3 text-emerald-400" />}
                        <span>{roster.shift}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{roster.shiftHours}</div>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-amber-300">
                      ৳{(roster.incentiveEarnedBDT || 0).toLocaleString()}
                    </td>

                    <td className="p-3 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <select
                          value={roster.attendance}
                          onChange={(e) => updateTerminalRosterStatus(roster.id, { attendance: e.target.value })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer focus:outline-none ${
                            roster.attendance === 'ON_DUTY'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : roster.attendance === 'PRESENT'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : roster.attendance === 'ON_LEAVE'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="ON_DUTY">ON DUTY</option>
                          <option value="PRESENT">PRESENT</option>
                          <option value="ON_LEAVE">ON LEAVE</option>
                          <option value="OFF_DUTY">OFF DUTY</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(roster)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                          title="Edit Roster"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {deleteConfirmId === roster.id ? (
                          <button
                            onClick={() => {
                              deleteTerminalRoster(roster.id);
                              setDeleteConfirmId(null);
                              showToast('Shift roster released.', 'warning');
                            }}
                            className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition"
                            title="Confirm Release"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(roster.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
                            title="Release Shift"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign / Edit Shift Modal */}
      {showAssignModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowAssignModal(false); }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-slate-100">
                  {editingRoster ? `Edit Shift Roster: ${editingRoster.employeeName}` : 'Assign Staff Member to Terminal Shift'}
                </h4>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">
                    Employee / Specialist Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nusrat Jahan"
                    value={formEmployeeName}
                    onChange={(e) => setFormEmployeeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP-101"
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+880-1700-000000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Practice Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Terminal Billing Lead">Terminal Billing Lead</option>
                    <option value="Senior SRE / DevOps Architect">Senior SRE / DevOps Architect</option>
                    <option value="Datacenter Hardware Specialist">Datacenter Hardware Specialist</option>
                    <option value="SOC Incident Responder">SOC Incident Responder</option>
                    <option value="Lead Solutions Engineer">Lead Solutions Engineer</option>
                    <option value="Support Operations Lead">Support Operations Lead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Shift Schedule *</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="MORNING">Morning Shift (08:00 - 16:00)</option>
                    <option value="EVENING">Evening Shift (16:00 - 00:00)</option>
                    <option value="NIGHT">Night NOC Shift (00:00 - 08:00)</option>
                    <option value="STANDBY">Standby / On-Call 24/7</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Assigned Terminal Desk *</label>
                  <select
                    value={formDesk}
                    onChange={(e) => setFormDesk(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Desk #901">Desk #901 (Primary Billing)</option>
                    <option value="Desk #902">Desk #902 (Express Terminal)</option>
                    <option value="Desk #903">Desk #903 (Corporate Retainers)</option>
                    <option value="DC01 NOC Bay">DC01 NOC Bay (Datacenter)</option>
                    <option value="Architecture Lab">Architecture Lab</option>
                    <option value="RMA Hardware Bench">RMA Hardware Bench</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Shift Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1">Incentive Target (৳ BDT)</label>
                  <input
                    type="number"
                    min="0"
                    value={formIncentive}
                    onChange={(e) => setFormIncentive(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1">Duty Handover Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key tasks, VIP customer visits, or specific server rack monitoring..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold transition shadow flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Saving...' : editingRoster ? 'Update Shift' : 'Assign Shift'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
