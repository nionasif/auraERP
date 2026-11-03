import React from 'react';
import {
  X,
  ShieldAlert,
  Database,
  Lock,
  HardDrive,
  CheckCircle,
  Key,
  Server
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface AdminModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const AdminModal: React.FC<AdminModalProps> = ({ store }) => {
  const { closeModal } = store;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm text-slate-100">
              System Administrator & Terminal Security Audit (Node DC01 Silicon Tower)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {/* Status Metrics */}
          <div className="grid grid-cols-3 gap-2.5 font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[10px] text-slate-400 font-sans">Enterprise Database Backup:</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Synchronized (11:00 AM)</span>
              </div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">Central CDC Cloud Storage (AWS S3)</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[10px] text-slate-400 font-sans">Active Terminal Sessions:</div>
              <div className="text-sm font-bold text-amber-400 mt-1">5 Desks Connected</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">Desks 901 through 905</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[10px] text-slate-400 font-sans">Security Audit Level:</div>
              <div className="text-sm font-bold text-cyan-400 mt-1">ISO 27001 & SOC2 Compliant</div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">Tamper-proof digital ledger (SHA-256)</div>
            </div>
          </div>

          {/* Audit Trail Log */}
          <div>
            <div className="text-slate-300 font-bold text-xs mb-2 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Real-Time Operator Activity & Security Audit Trail</span>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px]">
              {[
                { time: '12:35 PM', user: '279597 (Tanvir Ahmed)', action: 'CTO SOW Rate Override Authorized', detail: 'INV-2026-DC01-0902 (-৳50,000 enterprise loyalty rebate)', severity: 'INFO' },
                { time: '12:00 PM', user: '281042 (Dr. Shahriar Rahman)', action: 'Mid-Day Wire Transfer Settlement', detail: '৳2,100,000 cleared to Corporate Escrow Vault', severity: 'INFO' },
                { time: '11:15 AM', user: '285108 (Sadia Sultana)', action: 'Billing Desk #905 Shift Opened', detail: 'Opening float & provisioning tokens verified', severity: 'INFO' },
                { time: '10:05 AM', user: '284511 (Mahmudul Hasan)', action: 'Billing Desk #904 Shift Opened', detail: 'Opening float & provisioning tokens verified', severity: 'INFO' },
                { time: '09:45 AM', user: '279597 (Tanvir Ahmed)', action: 'System Master Login & Tech Hub Open', detail: 'DC01-Silicon-01 Workstation Authenticated', severity: 'SECURE' },
              ].map((log, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-900 transition">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-[10px]">{log.time}</span>
                      <span className="text-amber-300 font-bold">{log.user}</span>
                    </div>
                    <div className="text-slate-200 font-sans text-xs mt-0.5">{log.action}</div>
                    <div className="text-[10px] text-slate-500">{log.detail}</div>
                  </div>
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {log.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
