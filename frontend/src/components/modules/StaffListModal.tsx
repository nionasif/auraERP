import React from 'react';
import {
  X,
  Users,
  Award,
  Phone,
  Clock,
  DollarSign,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface StaffListModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const StaffListModal: React.FC<StaffListModalProps> = ({ store }) => {
  const { state, closeModal } = store;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Tech Hub Engineering Directory, Terminal Rosters & Shift Allocation (DC01)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Table */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          <div className="text-[11px] text-slate-400 mb-2">
            Current active duty roster for DC01 Silicon Tower Tech Hub & Datacenter:
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800 sticky top-0">
                <th className="p-2">Engineering Lead / Specialist</th>
                <th className="p-2">Practice Role & Domain</th>
                <th className="p-2 text-center">Assigned Terminal Desk</th>
                <th className="p-2">Shift Schedule</th>
                <th className="p-2 text-right">Today Billed (৳)</th>
                <th className="p-2 text-right">Incentive (৳)</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {state.staff.map(s => (
                <tr key={s.id} className="hover:bg-slate-850/50">
                  <td className="p-2 font-sans">
                    <div className="font-bold text-slate-200">{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">ID: {s.employeeId} • {s.phone}</div>
                  </td>
                  <td className="p-2 font-sans text-slate-300 font-semibold">{s.role}</td>
                  <td className="p-2 text-center">
                    {s.assignedRegister ? (
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                        Desk #{s.assignedRegister}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-sans">Architecture Lab</span>
                    )}
                  </td>
                  <td className="p-2 text-slate-400 font-sans text-[11px]">{s.shift}</td>
                  <td className="p-2 text-right font-bold text-emerald-400">
                    {s.todaySales > 0 ? `৳${s.todaySales.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-2 text-right text-amber-300 font-bold">
                    ৳{s.commissionEarned.toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                      {s.attendance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
