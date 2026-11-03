import React from 'react';
import { CheckSquare } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface OtherLinksBoxProps {
  store: ReturnType<typeof useERPStore>;
}

export const OtherLinksBox: React.FC<OtherLinksBoxProps> = ({ store }) => {
  const { openModal, setView } = store;

  const links = [
    { id: 'IT_INVENTORY', label: 'IT & Office Inventory', action: () => setView('STORING') },
    { id: 'DAY_SALES_GROWTH', label: 'Day Wise Contract Growth', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Day Wise Contract Revenue Growth', type: 'SALES_GROWTH' }) },
    { id: 'TOP_TEN_INVOICE', label: 'Top 10 High-Value Invoices', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Top 10 High-Value Invoices & SOWs', type: 'TOP_INVOICES' }) },
    { id: 'LAST_DAY_OUTLET_SALES', label: 'Last Day Node Comparison', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Last Day Tech Node Revenue Comparison', type: 'LAST_DAY' }) },
    { id: 'HOURLY_SALES', label: 'Hourly Billing Trajectory', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Hourly Billing Trajectory & Ticket Traffic', type: 'HOURLY' }) },
    { id: 'CASH_TRANSFER', label: 'Wire & Escrow Transfer Log', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Corporate Wire & Escrow Settlement Log', type: 'CASH_TRANSFER' }) },
    { id: 'INVOICE_LIST', label: 'Invoice Register', action: () => openModal('INVOICE_LIST') },
    { id: 'DELETED_HISTORY', label: 'Void & Reversal Audit Trail', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Void Invoices & Billing Reversal Audit Trail', type: 'DELETED' }) },
    { id: 'AURA_PORTAL', label: 'AuraTech Developer Portal', action: () => openModal('OTHER_LINK_DETAIL', { title: 'AuraTech Architecture Blueprints & API Bulletins', type: 'PORTAL' }) },
    { id: 'TASK_MGMT', label: 'Engineering Sprints & SOPs', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Engineering Sprints, Incidents & SOP Tasks', type: 'TASKS' }) },
    { id: 'REDEMPTION_REPORT', label: 'SLA Credits Redemption', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Enterprise Partner SLA Credits & Retainer Redemption', type: 'REDEMPTION' }) },
    { id: 'AVG_INVOICE_VALUE', label: 'Average Contract Value (ACV)', action: () => openModal('OTHER_LINK_DETAIL', { title: 'Average Contract Value (ACV) & Retainer Trends', type: 'AVG_INVOICE' }) },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded p-2 text-xs shadow-sm flex flex-col justify-between">
      <div className="text-[11px] font-bold text-amber-400 mb-1.5 flex items-center space-x-1 border-b border-slate-800 pb-1">
        <span>Other Operations Links</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[11px]">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={link.action}
            className="flex items-center space-x-1.5 text-left text-slate-300 hover:text-amber-300 transition py-0.5 group"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-400 flex-shrink-0" />
            <span className="truncate group-hover:underline">{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
