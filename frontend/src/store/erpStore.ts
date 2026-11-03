import { useState, useEffect, useCallback } from 'react';
import {
  ViewType,
  Product,
  DepartmentMetric,
  CashRegister,
  Customer,
  StoreInfo,
  HourlySalesData,
  ChallanItem,
  Invoice,
  CartItem,
  RequisitionItem,
  EcommerceOrder,
  StaffMember,
  BinRack,
  TransferRecord,
  StockMovementLog,
  DamageTicket,
  RepairTicket,
  BagStockItem,
  StocktakeItem,
  ShrinkageLog,
  DepartmentMarginData,
  HourlyFootfallData,
  UserAccount,
  UserRole,
  UserPermissions,
  InventoryItem,
  InventoryCategory,
  InventoryStatus,
  InventoryAssignment,
  InvoiceItem,
  ProjectEngagement,
  ProjectTask,
  ProjectTaskStatus,
  Vendor,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceiveNote,
  GLAccount,
  FinancialTransaction,
  FinancialSummary,
  HelpDeskTicket,
  HardwareAsset,
  SoftwareLicense,
  HREmployee,
  TerminalRoster
} from '../types/erp';
import {
  INITIAL_STORE_INFO,
  INITIAL_DEPARTMENTS,
  INITIAL_REGISTERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_HOURLY_SALES,
  INITIAL_CHALLANS,
  INITIAL_INVOICES,
  INITIAL_REQUISITIONS,
  INITIAL_ECOMMERCE_ORDERS,
  INITIAL_STAFF,
  INITIAL_BINS,
  INITIAL_TRANSFERS,
  INITIAL_MOVEMENT_LOGS,
  INITIAL_DAMAGE_TICKETS,
  INITIAL_REPAIR_TICKETS,
  INITIAL_BAG_STOCK,
  INITIAL_STOCKTAKE_ITEMS,
  INITIAL_SHRINKAGE_LOGS,
  INITIAL_DEPARTMENT_MARGINS,
  INITIAL_FOOTFALL_DATA
} from '../data/mockData';
import { INITIAL_USERS, getDefaultPermissionsForRole } from '../data/mockUsers';
import { INITIAL_INVENTORY } from '../data/mockInventory';
import api, { MLForecastData, MLRequisitionData, MLCLVData } from '../services/api';

const STORAGE_KEY = 'auratech_erp_state_v5_clean';

export const DEFAULT_STATE: AppState = {
  isAuthenticated: true,
  currentUser: INITIAL_USERS[0],
  users: INITIAL_USERS,
  authError: null,
  currentView: 'DASHBOARD',
  activeTopTab: 'DASHBOARD_MANAGER',
  activeSidebarSection: 'POS_BACK_OFFICE',
  activeSubmenu: 'DASHBOARD',
  storeInfo: INITIAL_STORE_INFO,
  products: [],
  departments: INITIAL_DEPARTMENTS,
  registers: INITIAL_REGISTERS,
  customers: [],
  hourlySales: INITIAL_HOURLY_SALES,
  challans: [],
  invoices: [],
  requisitions: [],
  ecommerceOrders: [],
  staff: [],
  bins: INITIAL_BINS,
  transfers: [],
  movementLogs: [],
  damageTickets: [],
  repairTickets: [],
  bagInventory: INITIAL_BAG_STOCK,
  stocktakeItems: [],
  shrinkageLogs: [],
  departmentMargins: INITIAL_DEPARTMENT_MARGINS,
  footfallData: INITIAL_FOOTFALL_DATA,
  inventory: [],
  activeModal: null,
  modalPayload: null,
  cart: [],
  selectedCustomer: null,
  parkedCarts: [],
  recentInvoice: null,
  mlInsights: null,
  projects: [],
  selectedProjectId: null,
  vendors: [],
  purchaseOrders: [],
  goodsReceiveNotes: [],
  isLoadingProcurement: false,
  generalLedger: [],
  financialTransactions: [],
  financialSummary: null,
  isLoadingFinance: false,
  helpDeskTickets: [],
  isLoadingHelpDesk: false,
  hardwareAssets: [],
  softwareLicenses: [],
  isLoadingITAssets: false,
  hrEmployees: [],
  isLoadingHR: false,
  terminalRosters: [],
  isLoadingRosters: false,
};

export interface AppState {
  // Authentication & Users
  isAuthenticated: boolean;
  currentUser: UserAccount;
  users: UserAccount[];
  authError: string | null;

  currentView: ViewType;
  activeTopTab: 'DASHBOARD_MANAGER' | 'UNSOLD_ANALYSIS' | 'STORE_ANALYSIS';
  activeSidebarSection: 'POS' | 'POS_BACK_OFFICE' | 'AUDIT' | 'CRM' | 'BI_TOOLS';
  activeSubmenu: 'DASHBOARD' | 'STOCK_SEARCH' | 'AGING_STOCK';
  storeInfo: StoreInfo;
  products: Product[];
  departments: DepartmentMetric[];
  registers: CashRegister[];
  customers: Customer[];
  hourlySales: HourlySalesData[];
  challans: ChallanItem[];
  invoices: Invoice[];
  requisitions: RequisitionItem[];
  ecommerceOrders: EcommerceOrder[];
  staff: StaffMember[];
  bins: BinRack[];
  transfers: TransferRecord[];
  movementLogs: StockMovementLog[];
  damageTickets: DamageTicket[];
  repairTickets: RepairTicket[];
  bagInventory: BagStockItem[];
  stocktakeItems: StocktakeItem[];
  shrinkageLogs: ShrinkageLog[];
  departmentMargins: DepartmentMarginData[];
  footfallData: HourlyFootfallData[];
  // IT Inventory & Office Inventory
  inventory: InventoryItem[];
  // Enterprise Project Management
  projects: ProjectEngagement[];
  selectedProjectId: string | null;
  // Procurement & Vendors
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  goodsReceiveNotes: GoodsReceiveNote[];
  isLoadingProcurement: boolean;
  // Finance & Accounting
  generalLedger: GLAccount[];
  financialTransactions: FinancialTransaction[];
  financialSummary: FinancialSummary | null;
  isLoadingFinance: boolean;
  // Help Desk & Incident Management
  helpDeskTickets: HelpDeskTicket[];
  isLoadingHelpDesk: boolean;
  // IT Assets & Datacenter Infrastructure
  hardwareAssets: HardwareAsset[];
  softwareLicenses: SoftwareLicense[];
  isLoadingITAssets: boolean;
  // HR & Employees
  hrEmployees: HREmployee[];
  isLoadingHR: boolean;
  // Terminal Rosters & Shifts
  terminalRosters: TerminalRoster[];
  isLoadingRosters: boolean;
  activeModal: string | null;
  modalPayload?: any;
  // POS Terminal State
  cart: CartItem[];
  selectedCustomer: Customer | null;
  parkedCarts: Array<{ id: string; time: string; items: CartItem[]; customer: Customer | null }>;
  recentInvoice: Invoice | null;
  mlInsights?: {
    forecast?: MLForecastData | null;
    smartRequisitions?: MLRequisitionData | null;
    customerCLV?: MLCLVData | null;
    status?: string;
  } | null;
}

export const ROUTE_PATH_MAP: Record<string, ViewType> = {
  '/': 'DASHBOARD',
  '/dashboard': 'DASHBOARD',
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

export const getInitialViewFromUrl = (): ViewType => {
  if (typeof window !== 'undefined' && window.location) {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (ROUTE_PATH_MAP[path]) {
      return ROUTE_PATH_MAP[path];
    }
  }
  return 'DASHBOARD';
};

export function useERPStore() {
  const [state, setState] = useState<AppState>(() => {
    const initialView = getInitialViewFromUrl();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const storedProducts = Array.isArray(parsed.products)
          ? parsed.products
          : [];

        const rawUsers = Array.isArray(parsed.users) && parsed.users.length > 0
          ? parsed.users
          : INITIAL_USERS;

        // Ensure all default enterprise role accounts are always present in the store
        const existingRoles = new Set(rawUsers.map((u: UserAccount) => u.role));
        const missingUsers = INITIAL_USERS.filter(u => !existingRoles.has(u.role));
        const storedUsers = [...rawUsers, ...missingUsers];

        let storedCurrentUser = parsed.currentUser || storedUsers[0] || INITIAL_USERS[0];
        if (!storedCurrentUser.permissions) {
          storedCurrentUser = {
            ...storedCurrentUser,
            permissions: getDefaultPermissionsForRole(storedCurrentUser.role || 'Super Admin'),
          };
        }

        const storedInventory = Array.isArray(parsed.inventory)
          ? parsed.inventory
          : [];

        const storedVendors = Array.isArray(parsed.vendors) ? parsed.vendors : [];
        const storedPOs = Array.isArray(parsed.purchaseOrders) ? parsed.purchaseOrders : [];
        const storedGRNs = Array.isArray(parsed.goodsReceiveNotes) ? parsed.goodsReceiveNotes : [];
        const storedGL = Array.isArray(parsed.generalLedger) ? parsed.generalLedger : [];
        const storedTxns = Array.isArray(parsed.financialTransactions) ? parsed.financialTransactions : [];
        const storedTickets = Array.isArray(parsed.helpDeskTickets) ? parsed.helpDeskTickets : [];
        const storedHardware = Array.isArray(parsed.hardwareAssets) ? parsed.hardwareAssets : [];
        const storedLicenses = Array.isArray(parsed.softwareLicenses) ? parsed.softwareLicenses : [];
        const storedHREmps = Array.isArray(parsed.hrEmployees) ? parsed.hrEmployees : [];
        const storedRosters = Array.isArray(parsed.terminalRosters) ? parsed.terminalRosters : [];
        const storedProjects = Array.isArray(parsed.projects) ? parsed.projects : [];

        return {
          ...DEFAULT_STATE,
          ...parsed,
          products: storedProducts,
          users: storedUsers,
          currentUser: storedCurrentUser,
          isAuthenticated: parsed.isAuthenticated !== undefined ? parsed.isAuthenticated : true,
          inventory: storedInventory,
          storeInfo: {
            ...DEFAULT_STATE.storeInfo,
            ...(parsed.storeInfo || {}),
            currentUser: {
              id: storedCurrentUser.id,
              name: storedCurrentUser.name,
              role: storedCurrentUser.role,
            },
          },
          currentView: initialView,
          activeModal: null,
          modalPayload: null,
          projects: storedProjects,
          vendors: storedVendors,
          purchaseOrders: storedPOs,
          goodsReceiveNotes: storedGRNs,
          isLoadingProcurement: false,
          generalLedger: storedGL,
          financialTransactions: storedTxns,
          financialSummary: null,
          isLoadingFinance: false,
          helpDeskTickets: storedTickets,
          isLoadingHelpDesk: false,
          hardwareAssets: storedHardware,
          softwareLicenses: storedLicenses,
          isLoadingITAssets: false,
          hrEmployees: storedHREmps,
          isLoadingHR: false,
          terminalRosters: storedRosters,
          isLoadingRosters: false,
        };
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
    return {
      ...DEFAULT_STATE,
      currentView: initialView,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error persisting state:', e);
    }
  }, [state]);

  // Transparent Enterprise API Bridge: Synchronize with Node.js backend and ML core
  useEffect(() => {
    let isMounted = true;
    const fetchBackendAndML = async () => {
      try {
        const [data, forecast, reqs, clv, projectsRes, vendorsRes, ordersRes, grnsRes, glRes, txnsRes, summaryRes, ticketsRes, hwRes, licRes, hrRes, rostersRes] = await Promise.allSettled([
          api.syncInitialData(),
          api.getMLForecast(),
          api.getMLSmartRequisition(),
          api.getMLCustomerCLV(),
          api.getProjects(),
          api.getVendors(),
          api.getPurchaseOrders(),
          api.getGoodsReceiveNotes(),
          api.getGeneralLedger(),
          api.getFinancialTransactions(),
          api.getFinancialSummary(),
          api.getHelpDeskTickets(),
          api.getHardwareAssets(),
          api.getSoftwareLicenses(),
          api.getHREmployees(),
          api.getTerminalRosters(),
        ]);

        if (!isMounted) return;

        setState(prev => {
          const updates: Partial<AppState> = {};

          if (data.status === 'fulfilled' && data.value) {
            if (data.value.products && data.value.products.length > 0) {
              updates.products = data.value.products;
            }
            if (data.value.invoices && data.value.invoices.length > 0) {
              updates.invoices = data.value.invoices;
            }
            if (data.value.customers && data.value.customers.length > 0) {
              updates.customers = data.value.customers.map((c: any) => ({
                id: c.id,
                name: c.companyName || c.name,
                phone: c.phone || c.primaryContact?.phone || '',
                email: c.email || c.primaryContact?.email || '',
                tier: (c.tier || c.slaTier || 'SILVER').toUpperCase(),
                points: Number(c.points ?? c.slaCreditsBDT ?? 0),
                totalSpent: Number(c.totalSpent ?? c.contractValueBDT ?? 0),
                lastVisit: c.lastVisit || c.lastInteraction || new Date().toISOString().split('T')[0],
              }));
            }
          }

          if (projectsRes.status === 'fulfilled' && projectsRes.value?.data) {
            updates.projects = projectsRes.value.data;
            if (!prev.selectedProjectId && projectsRes.value.data.length > 0) {
              updates.selectedProjectId = projectsRes.value.data[0].id;
            }
          }

          if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.data) {
            updates.vendors = vendorsRes.value.data;
          }

          if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
            updates.purchaseOrders = ordersRes.value.data;
          }

          if (grnsRes.status === 'fulfilled' && grnsRes.value?.data) {
            updates.goodsReceiveNotes = grnsRes.value.data;
          }

          if (glRes.status === 'fulfilled' && glRes.value?.data) {
            updates.generalLedger = glRes.value.data;
          }

          if (txnsRes.status === 'fulfilled' && txnsRes.value?.data) {
            updates.financialTransactions = txnsRes.value.data;
          }

          if (summaryRes.status === 'fulfilled' && summaryRes.value) {
            updates.financialSummary = summaryRes.value;
          }

          if (ticketsRes.status === 'fulfilled' && ticketsRes.value?.data) {
            updates.helpDeskTickets = ticketsRes.value.data;
          }

          if (hwRes.status === 'fulfilled' && hwRes.value?.data) {
            updates.hardwareAssets = hwRes.value.data;
          }

          if (licRes.status === 'fulfilled' && licRes.value?.data) {
            updates.softwareLicenses = licRes.value.data;
          }

          if (hrRes.status === 'fulfilled' && hrRes.value?.data) {
            updates.hrEmployees = hrRes.value.data;
          }

          if (rostersRes.status === 'fulfilled' && rostersRes.value?.data) {
            updates.terminalRosters = rostersRes.value.data;
          }

          updates.mlInsights = {
            forecast: forecast.status === 'fulfilled' ? forecast.value : null,
            smartRequisitions: reqs.status === 'fulfilled' ? reqs.value : null,
            customerCLV: clv.status === 'fulfilled' ? clv.value : null,
            status: 'ONLINE',
          };

          return { ...prev, ...updates };
        });
      } catch (err) {
        console.warn('[AuraTech Bridge] Backend API sync note:', err);
      }
    };

    fetchBackendAndML();
    return () => {
      isMounted = false;
    };
  }, []);

  const setView = useCallback((view: ViewType) => {
    setState(prev => (prev.currentView === view ? prev : { ...prev, currentView: view }));
  }, []);

  const setTopTab = useCallback((tab: 'DASHBOARD_MANAGER' | 'UNSOLD_ANALYSIS' | 'STORE_ANALYSIS') => {
    setState(prev => (prev.activeTopTab === tab ? prev : { ...prev, activeTopTab: tab }));
  }, []);

  const setSidebarSection = useCallback((section: 'POS' | 'POS_BACK_OFFICE' | 'AUDIT' | 'CRM' | 'BI_TOOLS') => {
    setState(prev => {
      if (section === 'POS') {
        return { ...prev, currentView: 'POS', activeSidebarSection: 'POS' };
      } else if (section === 'AUDIT') {
        return { ...prev, currentView: 'AUDIT', activeSidebarSection: 'AUDIT' };
      } else if (section === 'CRM') {
        return { ...prev, currentView: 'CRM', activeSidebarSection: 'CRM' };
      } else if (section === 'BI_TOOLS') {
        return { ...prev, currentView: 'BI_TOOLS', activeSidebarSection: 'BI_TOOLS' };
      } else {
        return { ...prev, activeSidebarSection: 'POS_BACK_OFFICE', currentView: 'DASHBOARD' };
      }
    });
  }, []);

  const setSubmenu = useCallback((menu: 'DASHBOARD' | 'STOCK_SEARCH' | 'AGING_STOCK') => {
    setState(prev => (prev.activeSubmenu === menu ? prev : { ...prev, activeSubmenu: menu }));
  }, []);

  const openModal = useCallback((modalName: string, payload?: any) => {
    setState(prev => ({ ...prev, activeModal: modalName, modalPayload: payload }));
  }, []);

  const closeModal = useCallback(() => {
    setState(prev => {
      const isWorkspaceView = prev.currentView !== 'DASHBOARD' && prev.currentView !== 'POS';
      return {
        ...prev,
        activeModal: null,
        modalPayload: null,
        currentView: isWorkspaceView ? 'DASHBOARD' : prev.currentView,
      };
    });
  }, []);

  const closeToDashboard = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeModal: null,
      modalPayload: null,
      currentView: 'DASHBOARD',
    }));
  }, []);

  // Manager Storing Journey: Internal Stock Movement
  const moveStockBetweenBins = (
    productId: string,
    sourceBinCode: string,
    targetBinCode: string,
    qty: number,
    reason: 'FLOOR_REPLENISHMENT' | 'BACK_TO_STORAGE' | 'SEASONAL_ROTATION' | 'DAMAGE_PULL'
  ) => {
    setState(prev => {
      const product = prev.products.find(p => p.id === productId);
      if (!product) return prev;

      const imnSeq = (prev.movementLogs.length + 20).toString().padStart(3, '0');
      const now = new Date();
      const newLog: StockMovementLog = {
        id: `IMN-${Date.now()}`,
        imnNo: `IMN-20260924-${imnSeq}`,
        date: '24/09/2026',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productName: product.name,
        sku: product.sku,
        fromLocation: sourceBinCode,
        toLocation: targetBinCode,
        qty,
        authorizedBy: `${prev.storeInfo.currentUser.name} (Manager)`,
        reason,
      };

      // Update bin occupied units
      const updatedBins = prev.bins.map(bin => {
        if (bin.code === sourceBinCode) {
          return { ...bin, occupiedUnits: Math.max(0, bin.occupiedUnits - qty) };
        }
        if (bin.code === targetBinCode) {
          return { ...bin, occupiedUnits: Math.min(bin.capacityUnits, bin.occupiedUnits + qty) };
        }
        return bin;
      });

      return {
        ...prev,
        bins: updatedBins,
        movementLogs: [newLog, ...prev.movementLogs],
      };
    });
  };

  // Damage Ticket Action
  const createDamageTicket = (ticket: Omit<DamageTicket, 'id' | 'ticketNo' | 'date'>) => {
    setState(prev => {
      const seq = (prev.damageTickets.length + 5).toString().padStart(3, '0');
      const newTicket: DamageTicket = {
        ...ticket,
        id: `DMG-${Date.now()}`,
        ticketNo: `DMG-${prev.storeInfo.outletCode}-20260924-${seq}`,
        date: '24/09/2026',
      };
      return {
        ...prev,
        damageTickets: [newTicket, ...prev.damageTickets],
      };
    });
  };

  // Repair Status Action
  const updateRepairStatus = (ticketId: string, status: RepairTicket['status']) => {
    setState(prev => {
      const updated = prev.repairTickets.map(r => r.id === ticketId ? { ...r, status } : r);
      return {
        ...prev,
        repairTickets: updated,
      };
    });
  };

  const createRepairTicket = (ticket: RepairTicket) => {
    setState(prev => ({
      ...prev,
      repairTickets: [ticket, ...prev.repairTickets],
    }));
  };

  // Shopping Bag Stock Addition
  const receiveBags = (bagId: string, count: number) => {
    setState(prev => {
      const updated = prev.bagInventory.map(b => b.id === bagId ? { ...b, warehouseStock: b.warehouseStock + count } : b);
      return {
        ...prev,
        bagInventory: updated,
      };
    });
  };

  // Audit Actions: Stocktake & Shrinkage Mutations
  const updateStocktakeCount = (itemId: string, physicalCount: number) => {
    setState(prev => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updated = prev.stocktakeItems.map(item => {
        if (item.id === itemId) {
          const count = Math.max(0, physicalCount);
          const variance = count - item.bookStock;
          const varianceValue = variance * item.unitCost;
          const status = variance === 0 ? 'MATCHED' as const : 'DISCREPANCY' as const;
          return {
            ...item,
            physicalCount: count,
            variance,
            varianceValue,
            status,
            lastScannedTime: now,
          };
        }
        return item;
      });
      return { ...prev, stocktakeItems: updated };
    });
  };

  const scanBarcodeStocktake = (barcode: string) => {
    setState(prev => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let matched = false;
      const updated = prev.stocktakeItems.map(item => {
        if (item.barcode === barcode.trim()) {
          matched = true;
          const count = item.physicalCount + 1;
          const variance = count - item.bookStock;
          const varianceValue = variance * item.unitCost;
          const status = variance === 0 ? 'MATCHED' as const : 'DISCREPANCY' as const;
          return {
            ...item,
            physicalCount: count,
            variance,
            varianceValue,
            status,
            lastScannedTime: now,
          };
        }
        return item;
      });
      return { ...prev, stocktakeItems: updated };
    });
  };

  const commitStockAdjustment = (itemId: string, reason: ShrinkageLog['reason']) => {
    setState(prev => {
      const targetItem = prev.stocktakeItems.find(i => i.id === itemId);
      if (!targetItem || targetItem.variance === 0) return prev;

      const logSeq = (prev.shrinkageLogs.length + 1).toString().padStart(2, '0');
      const newLog: ShrinkageLog = {
        id: `SHR-${Date.now()}`,
        auditNo: `AUD-${prev.storeInfo.outletCode}-20260924-${logSeq}`,
        date: '24/09/2026',
        productName: targetItem.name,
        barcode: targetItem.barcode,
        varianceQty: targetItem.variance,
        lossValue: Math.abs(targetItem.varianceValue),
        reason,
        approvedBy: `${prev.storeInfo.currentUser.name} (Lead)`,
        actionTaken: 'ADJUSTED_LEDGER',
      };

      const updatedItems = prev.stocktakeItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            bookStock: item.physicalCount,
            variance: 0,
            varianceValue: 0,
            status: 'MATCHED' as const,
          };
        }
        return item;
      });

      return {
        ...prev,
        stocktakeItems: updatedItems,
        shrinkageLogs: [newLog, ...prev.shrinkageLogs],
      };
    });
  };

  // POS Actions
  const addToCart = (product: Product, qty: number = 1) => {
    setState(prev => {
      const existingIndex = prev.cart.findIndex(item => item.product.id === product.id);
      let newCart = [...prev.cart];
      if (existingIndex >= 0) {
        const item = newCart[existingIndex];
        const newQty = item.quantity + qty;
        const lineTotal = newQty * item.product.price * (1 - item.discountPercent / 100);
        newCart[existingIndex] = { ...item, quantity: newQty, lineTotal };
      } else {
        newCart.push({
          product,
          quantity: qty,
          discountPercent: 0,
          lineTotal: qty * product.price,
        });
      }
      return { ...prev, cart: newCart };
    });
  };

  const updateCartQty = (productId: string, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) {
        return { ...prev, cart: prev.cart.filter(i => i.product.id !== productId) };
      }
      const newCart = prev.cart.map(item => {
        if (item.product.id === productId) {
          const lineTotal = quantity * item.product.price * (1 - item.discountPercent / 100);
          return { ...item, quantity, lineTotal };
        }
        return item;
      });
      return { ...prev, cart: newCart };
    });
  };

  const updateCartDiscount = (productId: string, discountPercent: number) => {
    setState(prev => {
      const newCart = prev.cart.map(item => {
        if (item.product.id === productId) {
          const lineTotal = item.quantity * item.product.price * (1 - discountPercent / 100);
          return { ...item, discountPercent, lineTotal };
        }
        return item;
      });
      return { ...prev, cart: newCart };
    });
  };

  const removeFromCart = (productId: string) => {
    setState(prev => ({ ...prev, cart: prev.cart.filter(i => i.product.id !== productId) }));
  };

  const clearCart = () => {
    setState(prev => ({ ...prev, cart: [], selectedCustomer: null }));
  };

  const parkCart = () => {
    setState(prev => {
      if (prev.cart.length === 0) return prev;
      const parked = {
        id: `PARK-${Date.now().toString().slice(-4)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: prev.cart,
        customer: prev.selectedCustomer,
      };
      return {
        ...prev,
        parkedCarts: [parked, ...prev.parkedCarts],
        cart: [],
        selectedCustomer: null,
      };
    });
  };

  const recallParkedCart = (id: string) => {
    setState(prev => {
      const target = prev.parkedCarts.find(p => p.id === id);
      if (!target) return prev;
      return {
        ...prev,
        cart: target.items,
        selectedCustomer: target.customer,
        parkedCarts: prev.parkedCarts.filter(p => p.id !== id),
      };
    });
  };

  const selectCustomer = (customer: Customer | null) => {
    setState(prev => ({ ...prev, selectedCustomer: customer }));
  };

  const addCustomer = useCallback((customer: Customer) => {
    setState(prev => {
      const exists = prev.customers.some(c => c.id === customer.id);
      const updated = exists
        ? prev.customers.map(c => (c.id === customer.id ? customer : c))
        : [customer, ...prev.customers];
      return { ...prev, customers: updated };
    });
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => (c.id === id ? { ...c, ...updates } : c)),
      selectedCustomer: prev.selectedCustomer?.id === id ? { ...prev.selectedCustomer, ...updates } : prev.selectedCustomer,
    }));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      selectedCustomer: prev.selectedCustomer?.id === id ? null : prev.selectedCustomer,
    }));
  }, []);

  const setCustomers = useCallback((customers: Customer[]) => {
    setState(prev => ({ ...prev, customers }));
  }, []);

  // Complete Checkout
  const completeCheckout = (payment: {
    method: 'CASH' | 'CARD' | 'MFS' | 'SPLIT';
    tendered?: number;
    change?: number;
    cardRef?: string;
    mfsRef?: string;
    bagCharge?: number;
  }) => {
    setState(prev => {
      if (prev.cart.length === 0) return prev;

      const subtotal = prev.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const discountedSubtotal = prev.cart.reduce((sum, item) => sum + item.lineTotal, 0);
      const discountTotal = subtotal - discountedSubtotal;
      const vatRate = 0.05;
      const vatAmount = Math.round(discountedSubtotal * vatRate);
      const bagCharge = payment.bagCharge || 0;
      const grandTotal = discountedSubtotal + vatAmount + bagCharge;

      const invoiceSeq = (prev.invoices.length + 905).toString().padStart(4, '0');
      const invoiceNo = `INV-2026-0924-${invoiceSeq}`;
      const now = new Date();

      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        invoiceNo,
        date: '24/09/2026',
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        outletId: prev.storeInfo.outletCode,
        outletName: prev.storeInfo.outletName,
        registerNo: prev.storeInfo.activeRegisterNo,
        cashierId: prev.storeInfo.currentUser.id,
        cashierName: prev.storeInfo.currentUser.name,
        customer: prev.selectedCustomer ? {
          name: prev.selectedCustomer.name,
          phone: prev.selectedCustomer.phone,
          tier: prev.selectedCustomer.tier,
          pointsEarned: Math.floor(grandTotal * 0.02),
          pointsUsed: 0,
        } : undefined,
        items: prev.cart.map(c => ({
          barcode: c.product.barcode,
          name: c.product.name,
          size: c.product.size,
          qty: c.quantity,
          unitPrice: c.product.price,
          discount: Math.round(c.product.price * c.quantity * (c.discountPercent / 100)),
          total: c.lineTotal,
        })),
        subtotal,
        discountTotal,
        vatRate,
        vatAmount,
        bagCharge,
        grandTotal,
        paymentMethod: payment.method,
        cashTendered: payment.tendered,
        changeDue: payment.change,
        cardRef: payment.cardRef,
        mfsRef: payment.mfsRef,
        paymentStatus: 'PAID',
        status: 'COMPLETED',
      };

      // Decrement inventory stock
      const updatedProducts = prev.products.map(prod => {
        const sold = prev.cart.find(c => c.product.id === prod.id);
        if (sold) {
          return { ...prod, stock: Math.max(0, prod.stock - sold.quantity) };
        }
        return prod;
      });

      // Update register balance & total sales
      const updatedRegisters = prev.registers.map(reg => {
        if (reg.registerNo === prev.storeInfo.activeRegisterNo) {
          return {
            ...reg,
            totalSales: reg.totalSales + grandTotal,
            cashBalance: payment.method === 'CASH' ? reg.cashBalance + (payment.tendered ? (payment.tendered - (payment.change || 0)) : grandTotal) : reg.cashBalance,
            cardSales: payment.method === 'CARD' ? reg.cardSales + grandTotal : reg.cardSales,
            mfsSales: payment.method === 'MFS' ? reg.mfsSales + grandTotal : reg.mfsSales,
          };
        }
        return reg;
      });

      // Update department sales
      const updatedDepartments = [...prev.departments];
      prev.cart.forEach(cartItem => {
        const deptIndex = updatedDepartments.findIndex(d => d.name === cartItem.product.department);
        if (deptIndex >= 0) {
          const dept = updatedDepartments[deptIndex];
          const newCurrSales = dept.currSales + cartItem.lineTotal;
          const newQty = dept.qtySold + cartItem.quantity;
          const pct = dept.prevSales > 0 ? Number((((newCurrSales - dept.prevSales) / dept.prevSales) * 100).toFixed(1)) : 0;
          updatedDepartments[deptIndex] = {
            ...dept,
            todaySales: newCurrSales,
            currSales: newCurrSales,
            qtySold: newQty,
            percentageChange: pct,
          };
        }
      });

      // Transparently persist invoice to backend database
      api.persistInvoice(newInvoice).catch(() => {});

      return {
        ...prev,
        invoices: [newInvoice, ...prev.invoices],
        products: updatedProducts,
        registers: updatedRegisters,
        departments: updatedDepartments,
        cart: [],
        selectedCustomer: null,
        recentInvoice: newInvoice,
        activeModal: 'RECEIPT_PREVIEW',
        modalPayload: newInvoice,
      };
    });
  };

  // Requisition Action
  const createRequisition = (newReq: Omit<RequisitionItem, 'id' | 'reqNo' | 'date' | 'status'>) => {
    setState(prev => {
      const seq = (prev.requisitions.length + 14).toString().padStart(3, '0');
      const req: RequisitionItem = {
        ...newReq,
        id: `REQ-${Date.now().toString().slice(-4)}`,
        reqNo: `REQ-${prev.storeInfo.outletCode}-20260924-${seq}`,
        date: '24/09/2026',
        status: 'PENDING_APPROVAL',
      };

      // Transparently persist requisition to backend database
      api.persistRequisition(req).catch(() => {});

      return {
        ...prev,
        requisitions: [req, ...prev.requisitions],
      };
    });
  };

  // ML Smart Requisition Recommendation Action
  const applyMLSmartRequisitions = useCallback(() => {
    setState(prev => {
      const actionable = prev.mlInsights?.smartRequisitions?.actionableRequisitions;
      if (!actionable || actionable.length === 0) return prev;

      const newItems: RequisitionItem[] = actionable.map((act: any, idx: number) => ({
        id: `REQ-ML-${Date.now()}-${idx}`,
        reqNo: `REQ-${prev.storeInfo.outletCode}-ML-${(prev.requisitions.length + idx + 1).toString().padStart(3, '0')}`,
        date: new Date().toLocaleDateString('en-GB'),
        department: act.department || 'Cloud & DevOps Engineering',
        itemCount: Number(act.recommendedUnits) || 1,
        priority: act.urgency === 'HIGH' ? 'URGENT' : 'NORMAL',
        status: 'PENDING_APPROVAL',
        estimatedValue: Number(act.estBudgetBDT) || 25000,
        notes: `[AuraTech ML EOQ] ${act.productName} (${act.sku}): ${act.justification}`,
      }));

      newItems.forEach(item => api.persistRequisition(item).catch(() => {}));

      return {
        ...prev,
        requisitions: [...newItems, ...prev.requisitions],
      };
    });
  }, []);

  // Transfer Action
  const createTransfer = (newTrf: Omit<TransferRecord, 'id' | 'stnNo' | 'date' | 'status'>) => {
    setState(prev => {
      const seq = (prev.transfers.length + 51).toString().padStart(3, '0');
      const trf: TransferRecord = {
        ...newTrf,
        id: `TRF-${Date.now().toString().slice(-4)}`,
        stnNo: `STN-${prev.storeInfo.outletCode}-20260924-${seq}`,
        date: '24/09/2026',
        status: 'IN_TRANSIT',
      };
      return {
        ...prev,
        transfers: [trf, ...prev.transfers],
      };
    });
  };

  // --- Authentication Actions ---
  const login = (username: string, password?: string): boolean => {
    const user = state.users.find(
      u => (u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === username.trim().toLowerCase())
    );
    if (!user) {
      setState(prev => ({ ...prev, authError: 'Invalid username or password' }));
      return false;
    }
    if (user.status === 'INACTIVE') {
      setState(prev => ({ ...prev, authError: 'Account is deactivated. Please contact your System Administrator.' }));
      return false;
    }
    if (user.role === 'Procurement Manager' || user.role === 'Support Staff') {
      setState(prev => ({ ...prev, authError: `Access Denied: Login access for ${user.role} has been disabled.` }));
      return false;
    }
    if (password && user.password && user.password !== password) {
      setState(prev => ({ ...prev, authError: 'Incorrect password entered' }));
      return false;
    }
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      currentUser: user,
      authError: null,
      storeInfo: {
        ...prev.storeInfo,
        currentUser: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      },
    }));
    return true;
  };

  const setAuthenticatedUser = (user: UserAccount) => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      currentUser: user,
      authError: null,
      storeInfo: {
        ...prev.storeInfo,
        currentUser: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      },
      currentView: 'DASHBOARD',
    }));
  };

  const loginAsRole = (role: UserRole) => {
    const user = state.users.find(u => u.role === role && u.status === 'ACTIVE') || state.users.find(u => u.role === role) || INITIAL_USERS.find(u => u.role === role);
    if (user) {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        currentUser: user,
        authError: null,
        storeInfo: {
          ...prev.storeInfo,
          currentUser: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        },
        currentView: 'DASHBOARD',
      }));
    }
  };

  const logout = () => {
    api.logoutFastAPI().catch(() => {});
    api.clearToken();
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      authError: null,
    }));
  };

  // --- Admin User Management Actions ---
  const createUser = (userData: Partial<UserAccount>) => {
    const assignedRole: UserRole = (userData.role as UserRole) || 'Employee';
    const newUser: UserAccount = {
      id: `USR-${(state.users.length + 101).toString()}`,
      username: userData.username || `user_${Date.now().toString().slice(-4)}`,
      password: userData.password || 'password123',
      name: userData.name || 'New Team Member',
      email: userData.email || 'user@auratech.io',
      phone: userData.phone || '+880 1700-000000',
      role: assignedRole,
      department: userData.department || 'General Operations',
      status: userData.status || 'ACTIVE',
      avatar: (userData.name || 'NT').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: userData.permissions || getDefaultPermissionsForRole(assignedRole),
    };
    setState(prev => ({
      ...prev,
      users: [newUser, ...prev.users],
    }));
  };

  const updateUser = (updatedUser: UserAccount) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u),
      currentUser: prev.currentUser.id === updatedUser.id ? updatedUser : prev.currentUser,
      storeInfo: prev.currentUser.id === updatedUser.id ? {
        ...prev.storeInfo,
        currentUser: {
          id: updatedUser.id,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      } : prev.storeInfo,
    }));
  };

  const toggleUserStatus = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => {
        if (u.id === userId) {
          return { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };
        }
        return u;
      }),
    }));
  };

  const deleteUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId),
    }));
  };

  const updateUserPermissions = (userId: string, permissions: UserPermissions) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, permissions } : u),
      currentUser: prev.currentUser.id === userId ? { ...prev.currentUser, permissions } : prev.currentUser,
    }));
  };

  // --- IT Assets & Office Inventory Actions ---
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'> & { id?: string }) => {
    const prefix = itemData.category === 'IT Equipment' ? 'IT' : itemData.category === 'Other Office Items' ? 'OTH' : 'OFF';
    const newItem: InventoryItem = {
      ...itemData,
      id: itemData.id || `AST-${prefix}-${(state.inventory.length + 1001)}`,
      assignmentHistory: itemData.assignmentHistory || [],
    };
    setState(prev => ({
      ...prev,
      inventory: [newItem, ...prev.inventory],
    }));
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => item.id === updatedItem.id ? updatedItem : item),
    }));
  };

  const deleteInventoryItem = (itemId: string) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== itemId),
    }));
  };

  const assignInventoryItem = (itemId: string, employeeId: string, employeeName: string, department: string, notes?: string) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.id === itemId) {
          const newAssignment: InventoryAssignment = {
            id: `ASG-${Date.now().toString().slice(-4)}`,
            assetId: item.id,
            employeeId,
            employeeName,
            department,
            assignedDate: new Date().toISOString().split('T')[0],
            assignedBy: `${prev.currentUser.name} (${prev.currentUser.role})`,
            conditionOnAssign: 'Verified Operational & Functional',
            notes: notes || 'Assigned via IT Inventory Management portal',
          };
          const nextAssigned = item.assignedQuantity + 1;
          const nextAvailable = Math.max(0, item.quantity - nextAssigned);
          return {
            ...item,
            assignedQuantity: nextAssigned,
            availableQuantity: nextAvailable,
            assignedEmployee: `${employeeName} (${employeeId})`,
            assignedEmployeeId: employeeId,
            status: 'Assigned' as InventoryStatus,
            assignmentHistory: [newAssignment, ...(item.assignmentHistory || [])],
          };
        }
        return item;
      }),
    }));
  };

  const returnInventoryItem = (itemId: string, condition?: string, notes?: string) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.id === itemId) {
          const nextAssigned = Math.max(0, item.assignedQuantity - 1);
          const nextAvailable = Math.min(item.quantity, item.availableQuantity + 1);
          const updatedHistory = (item.assignmentHistory || []).map((asg, idx) => {
            if (idx === 0 && !asg.returnDate) {
              return {
                ...asg,
                returnDate: new Date().toISOString().split('T')[0],
                conditionOnReturn: condition || 'Normal Operational Condition',
                notes: notes ? `${asg.notes || ''} [Returned: ${notes}]` : asg.notes,
              };
            }
            return asg;
          });
          return {
            ...item,
            assignedQuantity: nextAssigned,
            availableQuantity: nextAvailable,
            assignedEmployee: nextAssigned > 0 ? item.assignedEmployee : 'Unassigned (Buffer Stock)',
            assignedEmployeeId: nextAssigned > 0 ? item.assignedEmployeeId : undefined,
            status: (nextAvailable > 0 ? 'Available' : 'Available') as InventoryStatus,
            assignmentHistory: updatedHistory,
          };
        }
        return item;
      }),
    }));
  };

  // --- Invoice Actions ---
  const createCustomInvoice = (invoiceData: Partial<Invoice> & { items: InvoiceItem[] }): Invoice => {
    const subtotal = invoiceData.subtotal !== undefined
      ? invoiceData.subtotal
      : invoiceData.items.reduce((sum, item) => sum + (item.total || (item.qty * item.unitPrice)), 0);
    const discountTotal = invoiceData.discountTotal || 0;
    const vatRate = invoiceData.vatRate !== undefined ? invoiceData.vatRate : 0.05;
    const vatAmount = invoiceData.vatAmount !== undefined ? invoiceData.vatAmount : Math.round((subtotal - discountTotal) * vatRate);
    const bagCharge = invoiceData.bagCharge || 0;
    const grandTotal = invoiceData.grandTotal || (subtotal - discountTotal + vatAmount + bagCharge);

    const seq = (state.invoices.length + 906).toString().padStart(4, '0');
    const invoiceNo = invoiceData.invoiceNo || `INV-2026-IT-${seq}`;

    const now = new Date();
    const dateStr = invoiceData.date || '24/09/2026';
    const timeStr = invoiceData.time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNo,
      date: dateStr,
      time: timeStr,
      dueDate: invoiceData.dueDate,
      outletId: invoiceData.outletId || state.storeInfo.outletCode,
      outletName: invoiceData.outletName || state.storeInfo.outletName,
      registerNo: invoiceData.registerNo || state.storeInfo.activeRegisterNo,
      cashierId: invoiceData.cashierId || state.currentUser.id,
      cashierName: invoiceData.cashierName || state.currentUser.name,
      customer: invoiceData.customer,
      items: invoiceData.items,
      subtotal,
      discountTotal,
      vatRate,
      vatAmount,
      bagCharge,
      grandTotal,
      paymentMethod: invoiceData.paymentMethod || 'WIRE_TRANSFER',
      paymentStatus: invoiceData.paymentStatus || 'PAID',
      cashTendered: invoiceData.cashTendered,
      changeDue: invoiceData.changeDue,
      notes: invoiceData.notes,
      status: 'COMPLETED',
    };

    // Persist custom invoice to backend database
    api.persistInvoice(newInvoice).catch(e => console.warn('Failed to persist custom invoice:', e));

    setState(prev => ({
      ...prev,
      invoices: [newInvoice, ...prev.invoices],
      recentInvoice: newInvoice,
    }));

    return newInvoice;
  };

  const updateInvoiceStatus = (invoiceId: string, status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE' | 'COMPLETED' | 'VOIDED' | 'REFUNDED') => {
    api.updateInvoice(invoiceId, { status: status as any, paymentStatus: status as any }).catch(e => console.warn('Failed to update invoice status:', e));
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => {
        if (inv.id === invoiceId) {
          if (['PAID', 'PENDING', 'PARTIAL', 'OVERDUE'].includes(status)) {
            return { ...inv, paymentStatus: status as any };
          } else {
            return { ...inv, status: status as any };
          }
        }
        return inv;
      }),
    }));
  };

  const deleteInvoice = (invoiceId: string) => {
    api.deleteInvoice(invoiceId).catch(e => console.warn('Failed to delete invoice from backend:', e));
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.filter(inv => inv.id !== invoiceId),
    }));
  };

  // --- Enterprise Solutions & Services (Sales & Service) Methods ---
  const fetchProducts = async () => {
    try {
      const res = await api.getProducts();
      if (res && res.data && res.data.length > 0) {
        setState(prev => ({ ...prev, products: res.data }));
      }
    } catch (e) {
      console.warn('Failed to fetch products:', e);
    }
  };

  const addProduct = async (productData: Partial<Product>) => {
    try {
      const created = await api.createProduct(productData);
      if (created) {
        setState(prev => ({
          ...prev,
          products: [created, ...prev.products]
        }));
        return created;
      }
    } catch (e) {
      console.warn('Failed to add product to backend:', e);
    }
    const newProd: Product = {
      id: `PRD-${Date.now()}`,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: productData.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: productData.name || 'Untitled Enterprise Solution',
      department: productData.department || 'Cloud Infrastructure & DevOps',
      category: productData.category || 'Enterprise Solution',
      price: Number(productData.price) || 0,
      costPrice: Number(productData.costPrice || (Number(productData.price) * 0.6)),
      stock: Number(productData.stock !== undefined ? productData.stock : 10),
      minStock: Number(productData.minStock || 2),
      uom: productData.uom || 'UNIT',
      agingDays: 0,
      size: productData.size || 'Enterprise Spec',
      color: productData.color || 'Production'
    };
    setState(prev => ({
      ...prev,
      products: [newProd, ...prev.products]
    }));
    return newProd;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await api.updateProduct(id, updates);
    } catch (e) {
      console.warn('Failed to update product on backend:', e);
    }
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
    } catch (e) {
      console.warn('Failed to delete product from backend:', e);
    }
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.getInvoices();
      if (res && res.data && res.data.length > 0) {
        setState(prev => ({ ...prev, invoices: res.data }));
      }
    } catch (e) {
      console.warn('Failed to fetch invoices:', e);
    }
  };

  const resetToDemo = () => {
    setState({
      ...DEFAULT_STATE,
      isAuthenticated: true,
      currentUser: INITIAL_USERS[0],
      users: INITIAL_USERS,
      inventory: [],
      currentView: 'DASHBOARD',
      activeTopTab: 'DASHBOARD_MANAGER',
      activeSidebarSection: 'POS_BACK_OFFICE',
      activeSubmenu: 'DASHBOARD',
      storeInfo: INITIAL_STORE_INFO,
      products: [],
      departments: INITIAL_DEPARTMENTS,
      registers: INITIAL_REGISTERS,
      customers: [],
      hourlySales: INITIAL_HOURLY_SALES,
      challans: [],
      invoices: [],
      requisitions: [],
      ecommerceOrders: [],
      staff: [],
      bins: INITIAL_BINS,
      transfers: [],
      movementLogs: [],
      damageTickets: [],
      repairTickets: [],
      bagInventory: INITIAL_BAG_STOCK,
      stocktakeItems: [],
      shrinkageLogs: [],
      departmentMargins: INITIAL_DEPARTMENT_MARGINS,
      footfallData: INITIAL_FOOTFALL_DATA,
      activeModal: null,
      modalPayload: null,
      cart: [],
      selectedCustomer: null,
      parkedCarts: [],
      recentInvoice: null,
      projects: [],
      vendors: [],
      purchaseOrders: [],
      goodsReceiveNotes: [],
      generalLedger: [],
      financialTransactions: [],
      financialSummary: null,
      helpDeskTickets: [],
      hardwareAssets: [],
      softwareLicenses: [],
      hrEmployees: [],
      terminalRosters: [],
    });
  };

  // --- Enterprise Project Management Methods ---
  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.getProjects();
      if (res && res.data && res.data.length > 0) {
        setState(prev => ({
          ...prev,
          projects: res.data,
          selectedProjectId: prev.selectedProjectId || (res.data[0]?.id ?? null)
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch projects:', e);
    }
  }, []);

  const selectProject = (id: string | null) => {
    setState(prev => ({ ...prev, selectedProjectId: id }));
  };

  const createProject = async (projectData: Partial<ProjectEngagement>) => {
    const tempId = `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const optimisticProject: ProjectEngagement = {
      id: tempId,
      code: `PRJ-${(projectData.name || 'NEW').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}`,
      name: projectData.name || 'New Project Engagement',
      description: projectData.description || '',
      clientId: projectData.clientId || 'CUST-1001',
      clientName: projectData.clientName || 'Enterprise Client',
      leadArchitect: projectData.leadArchitect || state.currentUser?.name || 'Nusrat Jahan',
      budgetBDT: Number(projectData.budgetBDT) || 5000000,
      billedBDT: 0,
      burnedHours: 0,
      allocatedHours: Number(projectData.allocatedHours) || 400,
      currentSprint: projectData.currentSprint || 'Sprint 1',
      status: projectData.status || 'IN_PROGRESS',
      healthStatus: projectData.healthStatus || 'HEALTHY_GREEN',
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      targetCompletionDate: projectData.targetCompletionDate || '2026-12-31',
      techStack: projectData.techStack || ['Cloud', 'DevOps'],
      milestones: [],
      tasks: [],
      createdAt: new Date().toISOString()
    };

    // 1. Immediate optimistic UI update (0ms delay)
    setState(prev => ({
      ...prev,
      projects: [optimisticProject, ...prev.projects],
      selectedProjectId: optimisticProject.id
    }));

    // 2. Persist to backend asynchronously
    try {
      const created = await api.createProject(projectData);
      if (created) {
        setState(prev => ({
          ...prev,
          projects: prev.projects.map(p => p.id === tempId ? created : p),
          selectedProjectId: created.id
        }));
        return created;
      }
    } catch (e) {
      console.warn('Backend create project failed, kept optimistic project:', e);
    }
    return optimisticProject;
  };

  const updateProject = async (id: string, updates: Partial<ProjectEngagement>) => {
    // 1. Immediate optimistic local update
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));

    // 2. Persist to backend API asynchronously
    try {
      const updated = await api.updateProject(id, updates);
      if (updated) {
        setState(prev => ({
          ...prev,
          projects: prev.projects.map(p => p.id === id ? { ...p, ...updated } : p)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('Backend update project failed:', e);
    }
  };

  const deleteProject = async (id: string) => {
    // 1. Immediate optimistic local update
    setState(prev => {
      const remaining = prev.projects.filter(p => p.id !== id);
      return {
        ...prev,
        projects: remaining,
        selectedProjectId: prev.selectedProjectId === id ? (remaining[0]?.id ?? null) : prev.selectedProjectId
      };
    });

    // 2. Persist to backend API asynchronously
    try {
      await api.deleteProject(id);
    } catch (e) {
      console.warn('Backend delete project failed:', e);
    }
  };

  const addTaskToProject = async (projectId: string, taskData: Partial<ProjectTask>) => {
    const tempId = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
    const optimisticTask: ProjectTask = {
      id: tempId,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'TODO',
      priority: taskData.priority || 'MEDIUM',
      assignee: taskData.assignee || state.currentUser?.name || 'Nusrat Jahan',
      estimatedHours: Number(taskData.estimatedHours) || 8,
      loggedHours: Number(taskData.loggedHours) || 0,
      sprint: taskData.sprint || 'Sprint 1',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: taskData.dueDate || '2026-12-31'
    };

    // 1. Immediate optimistic UI update
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: [...(p.tasks || []), optimisticTask]
        };
      })
    }));

    // 2. Persist to backend API asynchronously
    try {
      const newTask = await api.addProjectTask(projectId, taskData);
      if (newTask) {
        setState(prev => ({
          ...prev,
          projects: prev.projects.map(p => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              tasks: (p.tasks || []).map(t => t.id === tempId ? newTask : t)
            };
          })
        }));
        return newTask;
      }
    } catch (e) {
      console.warn('Backend add task failed:', e);
    }
    return optimisticTask;
  };

  const updateTaskStatus = async (projectId: string, taskId: string, newStatus: ProjectTaskStatus) => {
    // 1. Optimistic immediate state update for zero-latency card movement
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: (p.tasks || []).map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        };
      })
    }));

    // 2. Persist to backend API asynchronously
    try {
      await api.updateProjectTask(projectId, taskId, { status: newStatus });
    } catch (e) {
      console.warn('Backend update task status failed:', e);
    }
  };

  const updateProjectTask = async (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
    // 1. Immediate optimistic local update
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        const updatedTasks = (p.tasks || []).map(t => t.id === taskId ? { ...t, ...updates } : t);
        const totalBurned = updatedTasks.reduce((sum, t) => sum + (Number(t.loggedHours) || 0), 0);
        return {
          ...p,
          tasks: updatedTasks,
          burnedHours: totalBurned > 0 ? totalBurned : p.burnedHours
        };
      })
    }));

    // 2. Persist to backend API asynchronously
    try {
      const updated = await api.updateProjectTask(projectId, taskId, updates);
      if (updated) {
        setState(prev => ({
          ...prev,
          projects: prev.projects.map(p => {
            if (p.id !== projectId) return p;
            const updatedTasks = (p.tasks || []).map(t => t.id === taskId ? { ...t, ...updated } : t);
            const totalBurned = updatedTasks.reduce((sum, t) => sum + (Number(t.loggedHours) || 0), 0);
            return {
              ...p,
              tasks: updatedTasks,
              burnedHours: totalBurned > 0 ? totalBurned : p.burnedHours
            };
          })
        }));
        return updated;
      }
    } catch (e) {
      console.warn('Backend update project task failed:', e);
    }
  };

  const deleteTaskFromProject = async (projectId: string, taskId: string) => {
    // 1. Immediate optimistic local update
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        const filteredTasks = (p.tasks || []).filter(t => t.id !== taskId);
        const totalBurned = filteredTasks.reduce((sum, t) => sum + (Number(t.loggedHours) || 0), 0);
        return {
          ...p,
          tasks: filteredTasks,
          burnedHours: totalBurned
        };
      })
    }));

    // 2. Persist to backend API asynchronously
    try {
      await api.deleteProjectTask(projectId, taskId);
    } catch (e) {
      console.warn('Backend delete task failed:', e);
    }
  };

  // Procurement & Vendors Action Handlers
  const fetchProcurementData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingProcurement: true }));
    try {
      const [vRes, poRes, grnRes] = await Promise.allSettled([
        api.getVendors(),
        api.getPurchaseOrders(),
        api.getGoodsReceiveNotes()
      ]);
      setState(prev => ({
        ...prev,
        vendors: vRes.status === 'fulfilled' && vRes.value?.data ? vRes.value.data : prev.vendors,
        purchaseOrders: poRes.status === 'fulfilled' && poRes.value?.data ? poRes.value.data : prev.purchaseOrders,
        goodsReceiveNotes: grnRes.status === 'fulfilled' && grnRes.value?.data ? grnRes.value.data : prev.goodsReceiveNotes,
        isLoadingProcurement: false
      }));
    } catch (e) {
      console.warn('fetchProcurementData error:', e);
      setState(prev => ({ ...prev, isLoadingProcurement: false }));
    }
  }, []);

  const addVendor = async (vendorData: Partial<Vendor>): Promise<Vendor | null> => {
    try {
      const created = await api.createVendor(vendorData);
      if (created) {
        setState(prev => ({ ...prev, vendors: [created, ...prev.vendors.filter(v => v.id !== created.id)] }));
        return created;
      }
    } catch (e) {
      console.warn('API createVendor failed:', e);
    }
    const fallback: Vendor = {
      id: `VND-${Date.now()}`,
      code: vendorData.code || `VND-${Math.floor(1000 + Math.random() * 9000)}`,
      name: vendorData.name || 'New Vendor',
      category: vendorData.category || 'Hardware & Networking OEM',
      contactPerson: vendorData.contactPerson || 'Authorized Representative',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      address: vendorData.address || '',
      taxId: vendorData.taxId || '',
      binNo: vendorData.binNo || '',
      paymentTerms: vendorData.paymentTerms || 'Net 30 Days',
      status: vendorData.status || 'ACTIVE',
      rating: vendorData.rating || 5.0,
      notes: vendorData.notes || '',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, vendors: [fallback, ...prev.vendors] }));
    return fallback;
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>): Promise<Vendor | null> => {
    try {
      const updated = await api.updateVendor(id, updates);
      if (updated) {
        setState(prev => ({ ...prev, vendors: prev.vendors.map(v => v.id === id ? updated : v) }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateVendor failed:', e);
    }
    setState(prev => ({ ...prev, vendors: prev.vendors.map(v => v.id === id ? { ...v, ...updates } : v) }));
    return null;
  };

  const deleteVendor = async (id: string) => {
    try {
      await api.deleteVendor(id);
    } catch (e) {
      console.warn('API deleteVendor failed:', e);
    }
    setState(prev => ({ ...prev, vendors: prev.vendors.filter(v => v.id !== id) }));
  };

  const addPurchaseOrder = async (poData: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    try {
      const created = await api.createPurchaseOrder(poData);
      if (created) {
        setState(prev => ({ ...prev, purchaseOrders: [created, ...prev.purchaseOrders.filter(p => p.id !== created.id)] }));
        return created;
      }
    } catch (e) {
      console.warn('API createPurchaseOrder failed:', e);
    }
    const fallback: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNumber: poData.poNumber || `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: poData.vendorId || null,
      vendorName: poData.vendorName || 'Selected Vendor',
      vendorCode: poData.vendorCode || 'VND-GEN',
      issuedDate: new Date().toISOString().split('T')[0],
      items: poData.items || [],
      totalAmountBDT: poData.totalAmountBDT || 0,
      priority: poData.priority || 'NORMAL',
      status: poData.status || 'APPROVED',
      deliveryLocation: poData.deliveryLocation || 'DC01 Silicon Tower',
      approvedBy: state.currentUser?.name || 'System Administrator',
      expectedDelivery: poData.expectedDelivery || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: poData.notes || '',
      grnNumber: null,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, purchaseOrders: [fallback, ...prev.purchaseOrders] }));
    return fallback;
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    try {
      const updated = await api.updatePurchaseOrder(id, updates);
      if (updated) {
        setState(prev => ({ ...prev, purchaseOrders: prev.purchaseOrders.map(p => p.id === id ? updated : p) }));
        return updated;
      }
    } catch (e) {
      console.warn('API updatePurchaseOrder failed:', e);
    }
    setState(prev => ({ ...prev, purchaseOrders: prev.purchaseOrders.map(p => p.id === id ? { ...p, ...updates } : p) }));
    return null;
  };

  const updatePurchaseOrderStatus = async (id: string, status: string): Promise<PurchaseOrder | null> => {
    try {
      const updated = await api.updatePurchaseOrderStatus(id, status);
      if (updated) {
        setState(prev => ({ ...prev, purchaseOrders: prev.purchaseOrders.map(p => p.id === id ? updated : p) }));
        return updated;
      }
    } catch (e) {
      console.warn('API updatePurchaseOrderStatus failed:', e);
    }
    setState(prev => ({ ...prev, purchaseOrders: prev.purchaseOrders.map(p => p.id === id ? { ...p, status: status as any } : p) }));
    return null;
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      await api.deletePurchaseOrder(id);
    } catch (e) {
      console.warn('API deletePurchaseOrder failed:', e);
    }
    setState(prev => ({ ...prev, purchaseOrders: prev.purchaseOrders.filter(p => p.id !== id) }));
  };

  const addGoodsReceiveNote = async (grnData: Partial<GoodsReceiveNote>): Promise<GoodsReceiveNote | null> => {
    try {
      const created = await api.createGoodsReceiveNote(grnData);
      if (created) {
        setState(prev => ({
          ...prev,
          goodsReceiveNotes: [created, ...prev.goodsReceiveNotes.filter(g => g.id !== created.id)],
          purchaseOrders: grnData.poId
            ? prev.purchaseOrders.map(p => p.id === grnData.poId ? { ...p, status: 'RECEIVED', grnNumber: created.grnNumber } : p)
            : prev.purchaseOrders
        }));
        return created;
      }
    } catch (e) {
      console.warn('API createGoodsReceiveNote failed:', e);
    }
    const fallback: GoodsReceiveNote = {
      id: `GRN-${Date.now()}`,
      grnNumber: `GRN-${new Date().getFullYear()}-DC01-${Math.floor(1000 + Math.random() * 9000)}`,
      poId: grnData.poId || null,
      poNumber: grnData.poNumber || 'DIRECT-CHALLAN',
      vendorName: grnData.vendorName || 'Vendor',
      challanNo: grnData.challanNo || 'CH-001',
      carrierVehicle: grnData.carrierVehicle || 'Truck',
      driverName: grnData.driverName || 'Driver',
      driverPhone: grnData.driverPhone || '',
      receivedDate: new Date().toISOString(),
      receivedBy: state.currentUser?.name || 'Store & Inward Manager',
      receivingBay: grnData.receivingBay || 'DC01 Staging Bay',
      receivedItems: grnData.receivedItems || [],
      itemCount: grnData.itemCount || 0,
      totalValueBDT: grnData.totalValueBDT || 0,
      remarks: grnData.remarks || 'Accepted into inventory',
      status: 'ACCEPTED_INTO_INVENTORY'
    };
    setState(prev => ({
      ...prev,
      goodsReceiveNotes: [fallback, ...prev.goodsReceiveNotes],
      purchaseOrders: grnData.poId
        ? prev.purchaseOrders.map(p => p.id === grnData.poId ? { ...p, status: 'RECEIVED', grnNumber: fallback.grnNumber } : p)
        : prev.purchaseOrders
    }));
    return fallback;
  };

  const deleteGoodsReceiveNote = async (id: string) => {
    try {
      await api.deleteGoodsReceiveNote(id);
    } catch (e) {
      console.warn('API deleteGoodsReceiveNote failed:', e);
    }
    setState(prev => ({ ...prev, goodsReceiveNotes: prev.goodsReceiveNotes.filter(g => g.id !== id) }));
  };

  // Finance & Accounting Action Handlers
  const fetchFinanceData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingFinance: true }));
    try {
      const [glRes, txnsRes, summaryRes, invRes] = await Promise.allSettled([
        api.getGeneralLedger(),
        api.getFinancialTransactions(),
        api.getFinancialSummary(),
        api.getInvoices()
      ]);
      setState(prev => ({
        ...prev,
        generalLedger: glRes.status === 'fulfilled' && glRes.value?.data ? glRes.value.data : prev.generalLedger,
        financialTransactions: txnsRes.status === 'fulfilled' && txnsRes.value?.data ? txnsRes.value.data : prev.financialTransactions,
        financialSummary: summaryRes.status === 'fulfilled' && summaryRes.value ? summaryRes.value : prev.financialSummary,
        invoices: invRes.status === 'fulfilled' && invRes.value?.data ? invRes.value.data : prev.invoices,
        isLoadingFinance: false
      }));
    } catch (e) {
      console.warn('fetchFinanceData error:', e);
      setState(prev => ({ ...prev, isLoadingFinance: false }));
    }
  }, []);

  const addGLAccount = async (accountData: Partial<GLAccount>): Promise<GLAccount | null> => {
    try {
      const created = await api.createGLAccount(accountData);
      if (created) {
        setState(prev => ({
          ...prev,
          generalLedger: [created, ...prev.generalLedger.filter(a => a.id !== created.id)]
        }));
        return created;
      }
    } catch (e) {
      console.warn('API createGLAccount failed:', e);
    }
    const fallback: GLAccount = {
      id: `ACC-${Date.now()}`,
      accountCode: accountData.accountCode || `${Math.floor(1000 + Math.random() * 8999)}`,
      accountName: accountData.accountName || 'New Account',
      category: accountData.category || 'ASSET',
      balanceBDT: Number(accountData.balanceBDT) || 0,
      currency: 'BDT',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, generalLedger: [fallback, ...prev.generalLedger] }));
    return fallback;
  };

  const updateGLAccount = async (id: string, updates: Partial<GLAccount>): Promise<GLAccount | null> => {
    try {
      const updated = await api.updateGLAccount(id, updates);
      if (updated) {
        setState(prev => ({
          ...prev,
          generalLedger: prev.generalLedger.map(a => a.id === id || a.accountCode === id ? updated : a)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateGLAccount failed:', e);
    }
    setState(prev => ({
      ...prev,
      generalLedger: prev.generalLedger.map(a => a.id === id || a.accountCode === id ? { ...a, ...updates } : a)
    }));
    return null;
  };

  const deleteGLAccount = async (id: string) => {
    try {
      await api.deleteGLAccount(id);
    } catch (e) {
      console.warn('API deleteGLAccount failed:', e);
    }
    setState(prev => ({
      ...prev,
      generalLedger: prev.generalLedger.filter(a => a.id !== id && a.accountCode !== id)
    }));
  };

  const addFinancialTransaction = async (txnData: Partial<FinancialTransaction>): Promise<FinancialTransaction | null> => {
    try {
      const created = await api.createFinancialTransaction(txnData);
      if (created) {
        setState(prev => {
          const updatedLedger = prev.generalLedger.map(acc => {
            if (acc.accountCode === created.accountCode) {
              const delta = created.type === 'INCOME' ? created.amountBDT : -created.amountBDT;
              return { ...acc, balanceBDT: (acc.balanceBDT || 0) + delta };
            }
            return acc;
          });
          return {
            ...prev,
            financialTransactions: [created, ...prev.financialTransactions.filter(t => t.id !== created.id)],
            generalLedger: updatedLedger
          };
        });
        // Refresh summary
        api.getFinancialSummary().then(summary => {
          if (summary) setState(p => ({ ...p, financialSummary: summary }));
        });
        return created;
      }
    } catch (e) {
      console.warn('API createFinancialTransaction failed:', e);
    }
    const fallback: FinancialTransaction = {
      id: `TXN-${Date.now()}`,
      voucherNo: `VCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: txnData.type || 'EXPENSE',
      category: txnData.category || 'General Operating Expense',
      description: txnData.description || 'Transaction',
      amountBDT: Number(txnData.amountBDT) || 0,
      paymentMethod: txnData.paymentMethod || 'Bank Wire',
      accountCode: txnData.accountCode || '1010',
      referenceNo: txnData.referenceNo || `REF-${Date.now().toString().slice(-6)}`,
      date: txnData.date || new Date().toISOString().split('T')[0],
      recordedBy: state.currentUser?.name || 'Financial Controller',
      notes: txnData.notes || '',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      financialTransactions: [fallback, ...prev.financialTransactions]
    }));
    return fallback;
  };

  const deleteFinancialTransaction = async (id: string) => {
    try {
      await api.deleteFinancialTransaction(id);
    } catch (e) {
      console.warn('API deleteFinancialTransaction failed:', e);
    }
    setState(prev => ({
      ...prev,
      financialTransactions: prev.financialTransactions.filter(t => t.id !== id)
    }));
    api.getFinancialSummary().then(summary => {
      if (summary) setState(p => ({ ...p, financialSummary: summary }));
    });
  };

  const addFinanceInvoice = async (invoiceData: any): Promise<Invoice | null> => {
    try {
      const created = await api.createFinanceInvoice(invoiceData);
      if (created) {
        setState(prev => ({
          ...prev,
          invoices: [created, ...prev.invoices.filter(i => i.id !== created.id)]
        }));
        api.getFinancialSummary().then(summary => {
          if (summary) setState(p => ({ ...p, financialSummary: summary }));
        });
        return created;
      }
    } catch (e) {
      console.warn('API createFinanceInvoice failed:', e);
    }
    return null;
  };

  const updateFinanceInvoiceStatus = async (id: string, status: string): Promise<Invoice | null> => {
    try {
      const updated = await api.updateFinanceInvoiceStatus(id, status);
      if (updated) {
        setState(prev => ({
          ...prev,
          invoices: prev.invoices.map(i => i.id === id ? updated : i)
        }));
        api.getFinancialSummary().then(summary => {
          if (summary) setState(p => ({ ...p, financialSummary: summary }));
        });
        return updated;
      }
    } catch (e) {
      console.warn('API updateFinanceInvoiceStatus failed:', e);
    }
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => i.id === id ? { ...i, status: status as any } : i)
    }));
    return null;
  };

  const deleteFinanceInvoice = async (id: string) => {
    try {
      await api.deleteFinanceInvoice(id);
    } catch (e) {
      console.warn('API deleteFinanceInvoice failed:', e);
    }
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.filter(i => i.id !== id)
    }));
    api.getFinancialSummary().then(summary => {
      if (summary) setState(p => ({ ...p, financialSummary: summary }));
    });
  };

  /* ==========================================================================
     Help Desk & Incident Management Store Actions
     ========================================================================== */
  const fetchHelpDeskTickets = async () => {
    setState(prev => ({ ...prev, isLoadingHelpDesk: true }));
    try {
      const res = await api.getHelpDeskTickets();
      if (res?.data) {
        setState(prev => ({ ...prev, helpDeskTickets: res.data, isLoadingHelpDesk: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoadingHelpDesk: false }));
    }
  };

  const addHelpDeskTicket = async (ticketData: Partial<HelpDeskTicket>): Promise<HelpDeskTicket | null> => {
    try {
      const created = await api.createHelpDeskTicket(ticketData);
      if (created) {
        setState(prev => ({ ...prev, helpDeskTickets: [created, ...prev.helpDeskTickets] }));
        return created;
      }
    } catch (e) {
      console.warn('API addHelpDeskTicket failed:', e);
    }
    return null;
  };

  const updateHelpDeskTicket = async (id: string, updates: Partial<HelpDeskTicket>): Promise<HelpDeskTicket | null> => {
    try {
      const updated = await api.updateHelpDeskTicket(id, updates);
      if (updated) {
        setState(prev => ({
          ...prev,
          helpDeskTickets: prev.helpDeskTickets.map(t => t.id === id ? updated : t)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateHelpDeskTicket failed:', e);
    }
    return null;
  };

  const updateHelpDeskTicketStatus = async (id: string, status: string): Promise<HelpDeskTicket | null> => {
    try {
      const updated = await api.updateHelpDeskTicketStatus(id, status);
      if (updated) {
        setState(prev => ({
          ...prev,
          helpDeskTickets: prev.helpDeskTickets.map(t => t.id === id ? updated : t)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateHelpDeskTicketStatus failed:', e);
    }
    setState(prev => ({
      ...prev,
      helpDeskTickets: prev.helpDeskTickets.map(t => t.id === id ? { ...t, status: status as any } : t)
    }));
    return null;
  };

  const deleteHelpDeskTicket = async (id: string) => {
    try {
      await api.deleteHelpDeskTicket(id);
    } catch (e) {
      console.warn('API deleteHelpDeskTicket failed:', e);
    }
    setState(prev => ({
      ...prev,
      helpDeskTickets: prev.helpDeskTickets.filter(t => t.id !== id)
    }));
  };

  /* ==========================================================================
     IT Assets & Hardware Store Actions
     ========================================================================== */
  const fetchITAssetsData = async () => {
    setState(prev => ({ ...prev, isLoadingITAssets: true }));
    try {
      const [hwRes, licRes] = await Promise.allSettled([
        api.getHardwareAssets(),
        api.getSoftwareLicenses()
      ]);
      setState(prev => ({
        ...prev,
        isLoadingITAssets: false,
        hardwareAssets: hwRes.status === 'fulfilled' && hwRes.value?.data ? hwRes.value.data : prev.hardwareAssets,
        softwareLicenses: licRes.status === 'fulfilled' && licRes.value?.data ? licRes.value.data : prev.softwareLicenses,
      }));
    } catch {
      setState(prev => ({ ...prev, isLoadingITAssets: false }));
    }
  };

  const addHardwareAsset = async (assetData: Partial<HardwareAsset>): Promise<HardwareAsset | null> => {
    try {
      const created = await api.createHardwareAsset(assetData);
      if (created) {
        setState(prev => ({ ...prev, hardwareAssets: [created, ...prev.hardwareAssets] }));
        return created;
      }
    } catch (e) {
      console.warn('API addHardwareAsset failed:', e);
    }
    return null;
  };

  const updateHardwareAsset = async (id: string, updates: Partial<HardwareAsset>): Promise<HardwareAsset | null> => {
    try {
      const updated = await api.updateHardwareAsset(id, updates);
      if (updated) {
        setState(prev => ({
          ...prev,
          hardwareAssets: prev.hardwareAssets.map(a => a.id === id ? updated : a)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateHardwareAsset failed:', e);
    }
    return null;
  };

  const deleteHardwareAsset = async (id: string) => {
    try {
      await api.deleteHardwareAsset(id);
    } catch (e) {
      console.warn('API deleteHardwareAsset failed:', e);
    }
    setState(prev => ({
      ...prev,
      hardwareAssets: prev.hardwareAssets.filter(a => a.id !== id)
    }));
  };

  const addSoftwareLicense = async (licData: Partial<SoftwareLicense>): Promise<SoftwareLicense | null> => {
    try {
      const created = await api.createSoftwareLicense(licData);
      if (created) {
        setState(prev => ({ ...prev, softwareLicenses: [created, ...prev.softwareLicenses] }));
        return created;
      }
    } catch (e) {
      console.warn('API addSoftwareLicense failed:', e);
    }
    return null;
  };

  const deleteSoftwareLicense = async (id: string) => {
    try {
      await api.deleteSoftwareLicense(id);
    } catch (e) {
      console.warn('API deleteSoftwareLicense failed:', e);
    }
    setState(prev => ({
      ...prev,
      softwareLicenses: prev.softwareLicenses.filter(l => l.id !== id)
    }));
  };

  /* ==========================================================================
     HR & Employee Store Actions (Node.js Backend)
     ========================================================================== */
  const fetchHREmployees = async () => {
    setState(prev => ({ ...prev, isLoadingHR: true }));
    try {
      const res = await api.getHREmployees();
      if (res?.data) {
        setState(prev => ({ ...prev, hrEmployees: res.data, isLoadingHR: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoadingHR: false }));
    }
  };

  const addHREmployee = async (empData: Partial<HREmployee>): Promise<HREmployee | null> => {
    try {
      const created = await api.createHREmployee(empData);
      if (created) {
        setState(prev => ({ ...prev, hrEmployees: [created, ...prev.hrEmployees] }));
        return created;
      }
    } catch (e) {
      console.warn('API addHREmployee failed:', e);
    }
    return null;
  };

  const updateHREmployee = async (id: string, updates: Partial<HREmployee>): Promise<HREmployee | null> => {
    try {
      const updated = await api.updateHREmployee(id, updates);
      if (updated) {
        setState(prev => ({
          ...prev,
          hrEmployees: prev.hrEmployees.map(e => e.id === id ? updated : e)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateHREmployee failed:', e);
    }
    return null;
  };

  const deleteHREmployee = async (id: string) => {
    try {
      await api.deleteHREmployee(id);
    } catch (e) {
      console.warn('API deleteHREmployee failed:', e);
    }
    setState(prev => ({
      ...prev,
      hrEmployees: prev.hrEmployees.filter(e => e.id !== id)
    }));
  };

  /* ==========================================================================
     Terminal Rosters & Shift Allocation Actions
     ========================================================================== */
  const fetchTerminalRosters = async () => {
    setState(prev => ({ ...prev, isLoadingRosters: true }));
    try {
      const res = await api.getTerminalRosters();
      if (res?.data) {
        setState(prev => ({ ...prev, terminalRosters: res.data, isLoadingRosters: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoadingRosters: false }));
    }
  };

  const addTerminalRoster = async (rosterData: Partial<TerminalRoster>): Promise<TerminalRoster | null> => {
    try {
      const created = await api.createTerminalRoster(rosterData);
      if (created) {
        setState(prev => ({ ...prev, terminalRosters: [created, ...prev.terminalRosters] }));
        return created;
      }
    } catch (e) {
      console.warn('API addTerminalRoster failed:', e);
    }
    return null;
  };

  const updateTerminalRoster = async (id: string, updates: Partial<TerminalRoster>): Promise<TerminalRoster | null> => {
    try {
      const updated = await api.updateTerminalRoster(id, updates);
      if (updated) {
        setState(prev => ({
          ...prev,
          terminalRosters: prev.terminalRosters.map(r => r.id === id ? updated : r)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateTerminalRoster failed:', e);
    }
    return null;
  };

  const updateTerminalRosterStatus = async (id: string, statusPayload: { attendance?: string; todaySalesBDT?: number; incentiveEarnedBDT?: number }): Promise<TerminalRoster | null> => {
    try {
      const updated = await api.updateTerminalRosterStatus(id, statusPayload);
      if (updated) {
        setState(prev => ({
          ...prev,
          terminalRosters: prev.terminalRosters.map(r => r.id === id ? updated : r)
        }));
        return updated;
      }
    } catch (e) {
      console.warn('API updateTerminalRosterStatus failed:', e);
    }
    setState(prev => ({
      ...prev,
      terminalRosters: prev.terminalRosters.map(r => r.id === id ? { ...r, attendance: (statusPayload.attendance as any) || r.attendance } : r)
    }));
    return null;
  };

  const deleteTerminalRoster = async (id: string) => {
    try {
      await api.deleteTerminalRoster(id);
    } catch (e) {
      console.warn('API deleteTerminalRoster failed:', e);
    }
    setState(prev => ({
      ...prev,
      terminalRosters: prev.terminalRosters.filter(r => r.id !== id)
    }));
  };

  return {
    state,
    setView,
    setTopTab,
    setSidebarSection,
    setSubmenu,
    openModal,
    closeModal,
    closeToDashboard,
    moveStockBetweenBins,
    createDamageTicket,
    updateRepairStatus,
    createRepairTicket,
    receiveBags,
    updateStocktakeCount,
    scanBarcodeStocktake,
    commitStockAdjustment,
    addToCart,
    updateCartQty,
    updateCartDiscount,
    removeFromCart,
    clearCart,
    parkCart,
    recallParkedCart,
    selectCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setCustomers,
    completeCheckout,
    createRequisition,
    applyMLSmartRequisitions,
    createTransfer,
    resetToDemo,
    // Authentication
    login,
    loginAsRole,
    logout,
    setAuthenticatedUser,
    // User Management
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    updateUserPermissions,
    // IT Assets & Inventory Management
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    assignInventoryItem,
    returnInventoryItem,
    // Invoices & Sales
    createCustomInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    fetchInvoices,
    // Enterprise Solutions & Services
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    // Enterprise Project Management
    fetchProjects,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    updateTaskStatus,
    updateProjectTask,
    deleteTaskFromProject,
    // Procurement & Vendors
    fetchProcurementData,
    addVendor,
    updateVendor,
    deleteVendor,
    addPurchaseOrder,
    updatePurchaseOrder,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    addGoodsReceiveNote,
    deleteGoodsReceiveNote,
    // Finance & Accounting
    fetchFinanceData,
    addGLAccount,
    updateGLAccount,
    deleteGLAccount,
    addFinancialTransaction,
    deleteFinancialTransaction,
    addFinanceInvoice,
    updateFinanceInvoiceStatus,
    deleteFinanceInvoice,
    // Help Desk & ITSM
    fetchHelpDeskTickets,
    addHelpDeskTicket,
    updateHelpDeskTicket,
    updateHelpDeskTicketStatus,
    deleteHelpDeskTicket,
    // IT Assets & Datacenter
    fetchITAssetsData,
    addHardwareAsset,
    updateHardwareAsset,
    deleteHardwareAsset,
    addSoftwareLicense,
    deleteSoftwareLicense,
    // HR & Employees
    fetchHREmployees,
    addHREmployee,
    updateHREmployee,
    deleteHREmployee,
    // Terminal Rosters & Shifts
    fetchTerminalRosters,
    addTerminalRoster,
    updateTerminalRoster,
    updateTerminalRosterStatus,
    deleteTerminalRoster,
  };
}
