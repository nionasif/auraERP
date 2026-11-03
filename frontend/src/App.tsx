import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useERPStore } from './store/erpStore';
import { TopHeader } from './components/common/TopHeader';
import { Sidebar } from './components/common/Sidebar';
import { StatusBar } from './components/common/StatusBar';
import { ManagementDashboard } from './components/dashboard/ManagementDashboard';
import { PosTerminal } from './components/pos/PosTerminal';
import { LoginPage } from './components/auth/LoginPage';
import { HomePage } from './components/home/HomePage';
import { InvoiceManagementModal } from './components/invoice/InvoiceManagementModal';

// Workspaces
import { StoringWorkspaceView } from './components/views/StoringWorkspaceView';
import { ReceiveWorkspaceView } from './components/views/ReceiveWorkspaceView';
import { TransferWorkspaceView } from './components/views/TransferWorkspaceView';
import { SetupWorkspaceView } from './components/views/SetupWorkspaceView';
import { RequisitionWorkspaceView } from './components/views/RequisitionWorkspaceView';
import { EcommerceWorkspaceView } from './components/views/EcommerceWorkspaceView';
import { CrmWorkspaceView } from './components/views/CrmWorkspaceView';
import { ReportWorkspaceView } from './components/views/ReportWorkspaceView';
import { AdminWorkspaceView } from './components/views/AdminWorkspaceView';
import { StaffWorkspaceView } from './components/views/StaffWorkspaceView';
import { DamageProductWorkspaceView } from './components/views/DamageProductWorkspaceView';
import { RepairProductWorkspaceView } from './components/views/RepairProductWorkspaceView';
import { ShoppingBagWorkspaceView } from './components/views/ShoppingBagWorkspaceView';
import { AuditWorkspaceView } from './components/views/AuditWorkspaceView';
import { BiWorkspaceView } from './components/views/BiWorkspaceView';
import { MyTasksWorkspaceView } from './components/views/MyTasksWorkspaceView';

// Modals
import { PaymentModal } from './components/pos/PaymentModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { ShiftRegisterModal } from './components/pos/ShiftRegisterModal';
import { StockSearchModal } from './components/modules/StockSearchModal';
import { StockAgingModal } from './components/modules/StockAgingModal';
import { GoodsReceiveModal } from './components/modules/GoodsReceiveModal';
import { StockTransferModal } from './components/modules/StockTransferModal';
import { RecallCartsModal } from './components/modules/RecallCartsModal';
import { NewCustomerModal } from './components/modules/NewCustomerModal';
import { OtherLinksDetailModal } from './components/modules/OtherLinksDetailModal';
import { ViewType } from './types/erp';

const ROUTE_MAP: Record<string, ViewType> = {
  '/': 'DASHBOARD',
  '/dashboard': 'DASHBOARD',
  '/tasks': 'MY_TASKS',
  '/my-tasks': 'MY_TASKS',
  '/hr': 'STAFF',
  '/employees': 'STAFF',
  '/crm': 'CRM',
  '/projects': 'ECOMMERCE',
  '/project-management': 'ECOMMERCE',
  '/sales': 'POS',
  '/service': 'POS',
  '/assets': 'STORING',
  '/it-assets': 'STORING',
  '/procurement': 'RECEIVE',
  '/vendors': 'RECEIVE',
  '/finance': 'REPORT',
  '/accounting': 'REPORT',
  '/helpdesk': 'REPAIR',
  '/support': 'REPAIR',
  '/reports': 'BI_TOOLS',
  '/analytics': 'BI_TOOLS',
  '/users': 'ADMIN',
  '/user-management': 'ADMIN',
  '/activity-log': 'AUDIT',
  '/audit': 'AUDIT',
  '/settings': 'SETUP',
};

const VIEW_TO_PATH: Record<ViewType, string> = {
  DASHBOARD: '/dashboard',
  MY_TASKS: '/tasks',
  STAFF: '/hr',
  CRM: '/crm',
  ECOMMERCE: '/projects',
  POS: '/sales',
  STORING: '/assets',
  RECEIVE: '/procurement',
  REPORT: '/finance',
  REPAIR: '/helpdesk',
  BI_TOOLS: '/reports',
  ADMIN: '/users',
  AUDIT: '/activity-log',
  SETUP: '/settings',
  TRANSFER: '/assets',
  REQUISITION: '/procurement',
  DAMAGE: '/assets',
  SHOPPING_BAG: '/assets',
};

const VIEW_TO_TITLE: Record<ViewType, string> = {
  DASHBOARD: 'Dashboard',
  MY_TASKS: 'My Tasks & Work',
  STAFF: 'HR & Employees',
  CRM: 'CRM',
  ECOMMERCE: 'Project Management',
  POS: 'Sales & Service',
  STORING: 'IT Assets & Resources',
  RECEIVE: 'Procurement & Vendors',
  REPORT: 'Finance & Accounting',
  REPAIR: 'Help Desk & Support',
  BI_TOOLS: 'Reports & Analytics',
  ADMIN: 'User Management',
  AUDIT: 'Activity Log',
  SETUP: 'Settings',
  TRANSFER: 'IT Assets - Node Transfer',
  REQUISITION: 'Procurement - Requisition',
  DAMAGE: 'IT Assets - Hardware RMA',
  SHOPPING_BAG: 'IT Assets - Consumables',
};

export const App: React.FC = () => {
  const store = useERPStore();
  const { state, closeModal, setView } = store;

  const isInitialMount = React.useRef(true);
  const isPopStateNavigation = React.useRef(false);

  // 1. Initial canonical URL synchronization and popstate handler for Back/Forward navigation
  React.useEffect(() => {
    // If authenticated, keep address bar in sync with canonical view
    if (state.isAuthenticated) {
      const targetPath = VIEW_TO_PATH[state.currentView] || '/dashboard';
      const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (currentPath !== targetPath) {
        window.history.replaceState({ view: state.currentView }, '', targetPath);
      }
    }

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (ROUTE_MAP[path]) {
        isPopStateNavigation.current = true;
        setView(ROUTE_MAP[path]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.isAuthenticated, setView]);

  // 2. Synchronize address bar URL whenever view changes in UI (Sidebar, TopNav, Hotkeys)
  React.useEffect(() => {
    if (!state.isAuthenticated) return;
    const targetPath = VIEW_TO_PATH[state.currentView] || '/dashboard';
    const title = VIEW_TO_TITLE[state.currentView] || 'Dashboard';
    document.title = `AuraTech ERP - ${title}`;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isPopStateNavigation.current) {
      isPopStateNavigation.current = false;
      return;
    }

    if (window.location.pathname.toLowerCase() !== targetPath) {
      window.history.pushState({ view: state.currentView }, '', targetPath);
    }
  }, [state.isAuthenticated, state.currentView]);

  // Global keyboard shortcuts (Escape closes modals/workspaces, F1 goes to Dashboard, F2 goes to POS)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.activeModal) {
          closeModal();
        } else if (state.currentView !== 'DASHBOARD' && state.currentView !== 'POS') {
          setView('DASHBOARD');
        }
      } else if (e.key === 'F1') {
        e.preventDefault();
        setView('DASHBOARD');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setView('POS');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeModal, state.currentView, closeModal, setView]);

  // If not authenticated, render the Modern Interactive Home Page with Portal Login
  if (!state.isAuthenticated) {
    return <HomePage store={store} />;
  }

  const isCurrentViewAllowed =
    !state.currentUser?.permissions?.allowedViews ||
    state.currentUser.permissions.allowedViews.includes(state.currentView);

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-[#001E46] overflow-hidden font-sans select-none">
      {/* Top ERP Header & Windows Title Bar */}
      <TopHeader store={store} />

      {/* Main Workspace Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left ERP Sidebar */}
        <Sidebar store={store} />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative bg-white">
          {!isCurrentViewAllowed ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-[#001E46]">
              <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">Access Restricted by Role</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Your assigned role (<span className="text-amber-400 font-bold">{state.currentUser?.role}</span>) does not have authorization to access the <span className="text-slate-200 font-semibold">{VIEW_TO_TITLE[state.currentView]}</span> workspace.
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 mb-5 text-left space-y-1">
                  <div className="flex justify-between">
                    <span>Active Account:</span>
                    <span className="text-slate-200 font-mono">{state.currentUser?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Role:</span>
                    <span className="text-amber-400 font-mono font-bold">{state.currentUser?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Allowed Modules:</span>
                    <span className="text-emerald-400 font-mono font-bold">{state.currentUser?.permissions?.allowedViews.length || 0} modules</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setView('DASHBOARD')}
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {state.currentView === 'DASHBOARD' && <ManagementDashboard store={store} />}
              {state.currentView === 'MY_TASKS' && <MyTasksWorkspaceView store={store} />}
              {state.currentView === 'POS' && <PosTerminal store={store} />}
              {state.currentView === 'STORING' && <StoringWorkspaceView store={store} />}
              {state.currentView === 'RECEIVE' && <ReceiveWorkspaceView store={store} />}
              {state.currentView === 'TRANSFER' && <TransferWorkspaceView store={store} />}
              {state.currentView === 'SETUP' && <SetupWorkspaceView store={store} />}
              {state.currentView === 'REQUISITION' && <RequisitionWorkspaceView store={store} />}
              {state.currentView === 'ECOMMERCE' && <EcommerceWorkspaceView store={store} />}
              {state.currentView === 'CRM' && <CrmWorkspaceView store={store} />}
              {state.currentView === 'REPORT' && <ReportWorkspaceView store={store} />}
              {state.currentView === 'ADMIN' && <AdminWorkspaceView store={store} />}
              {state.currentView === 'STAFF' && <StaffWorkspaceView store={store} />}
              {state.currentView === 'DAMAGE' && <DamageProductWorkspaceView store={store} />}
              {state.currentView === 'REPAIR' && <RepairProductWorkspaceView store={store} />}
              {state.currentView === 'SHOPPING_BAG' && <ShoppingBagWorkspaceView store={store} />}
              {state.currentView === 'AUDIT' && <AuditWorkspaceView store={store} />}
              {state.currentView === 'BI_TOOLS' && <BiWorkspaceView store={store} />}
            </>
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar store={store} />

      {/* Interactive Modal Registry */}
      {state.activeModal === 'PAYMENT' && <PaymentModal store={store} />}
      {state.activeModal === 'RECEIPT_PREVIEW' && <ReceiptModal store={store} />}
      {state.activeModal === 'SHIFT_REGISTER' && <ShiftRegisterModal store={store} />}
      {state.activeModal === 'STOCK_SEARCH' && <StockSearchModal store={store} />}
      {state.activeModal === 'AGING_STOCK' && <StockAgingModal store={store} />}
      {state.activeModal === 'GOODS_RECEIVE' && <GoodsReceiveModal store={store} />}
      {state.activeModal === 'STOCK_TRANSFER' && <StockTransferModal store={store} />}
      {(state.activeModal === 'INVOICE_MANAGEMENT' || state.activeModal === 'INVOICE_LIST') && (
        <InvoiceManagementModal store={store} />
      )}
      {state.activeModal === 'RECALL_CARTS' && <RecallCartsModal store={store} />}
      {state.activeModal === 'NEW_CUSTOMER' && <NewCustomerModal store={store} />}
      {state.activeModal === 'OTHER_LINK_DETAIL' && <OtherLinksDetailModal store={store} />}
    </div>
  );
};

export default App;
