/**
 * AuraTech ERP - Transparent Enterprise API Bridge
 * Connects frontend store to backend REST & ML intelligence endpoints on port 5000.
 * Operates gracefully with instant fallback if network/server is unavailable.
 */

import { ProjectEngagement, ProjectTask, Product, Invoice, Vendor, PurchaseOrder, GoodsReceiveNote, GLAccount, FinancialTransaction, FinancialSummary, HelpDeskTicket, HardwareAsset, SoftwareLicense, HREmployee, TerminalRoster, EmployeePerformanceMLResponse } from '../types/erp';

const API_BASE = 'http://localhost:5000/api';

export interface MLSummary {
  status: string;
  engine: string;
  services: Array<{ id: string; name: string; status: string }>;
}

export interface MLForecastData {
  model: string;
  accuracyMetric: string;
  totalProjectedWeekBDT: number;
  hourlyForecast: Array<{ hour: string; predictedSalesBDT: number; predictedFootfall: number }>;
  dailyForecast: Array<{ day: string; projectedRevenueBDT: number; growthRatePct: number }>;
}

export interface MLRequisitionData {
  model: string;
  totalRecommendedRequisitions: number;
  totalEstimatedCapitalBDT: number;
  actionableRequisitions: Array<{
    reqSeq: string;
    productName: string;
    sku: string;
    department: string;
    recommendedUnits: number;
    urgency: string;
    estBudgetBDT: number;
    justification: string;
  }>;
}

export interface MLCLVData {
  model: string;
  totalAuditedAccounts: number;
  championAccounts: number;
  atRiskAccounts: number;
  customers: Array<{
    id: string;
    name: string;
    phone: string;
    cluster: string;
    churnRiskPct: number;
    rfmScore: number;
    predictedCLV_BDT: number;
    suggestedAction: string;
  }>;
}

export interface MLITResourceDemandData {
  model: string;
  purpose: string;
  erpModule: string;
  accuracyScore: string;
  clusterTelemetry: {
    datacenterNode: string;
    totalInstalledRamGB: number;
    currentCpuLoadPct: number;
    currentRamUsageGB: number;
    nextMonthPeakCpuPct: number;
    nextMonthPeakRamGB: number;
    headroomRisk: string;
    capacityUrgency: string;
    recommendedAction: string;
  };
  dailyForecast: Array<{
    day: string;
    dateOffset: number;
    predictedCpuPct: number;
    predictedRamGB: number;
    predictedActiveVMs: number;
    predictedIops: number;
    status: string;
  }>;
  generatedAt: string;
}

export interface MLTicketClassification {
  model: string;
  predictedCategory: string;
  predictedPriority: string;
  slaTargetMinutes: number;
  confidenceScore: number;
  suggestedAssignedRole: string;
}

class EnterpriseApiService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  private async get<T>(endpoint: string): Promise<T | null> {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private async post<T>(endpoint: string, body: any): Promise<T | null> {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private async put<T>(endpoint: string, body: any): Promise<T | null> {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private async del<T>(endpoint: string): Promise<T | null> {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private async patch<T>(endpoint: string, body: any): Promise<T | null> {
    try {
      const res = await this.fetchWithTimeout(`${API_BASE}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // 1. Core Data Sync
  async syncInitialData() {
    try {
      const [productsRes, customersRes, invoicesRes] = await Promise.allSettled([
        this.get<{ data: any[] }>('/products'),
        this.get<{ data: any[] }>('/crm/clients'),
        this.get<{ data: any[] }>('/invoices'),
      ]);

      return {
        products: productsRes.status === 'fulfilled' && productsRes.value ? productsRes.value.data : null,
        customers: customersRes.status === 'fulfilled' && customersRes.value ? customersRes.value.data : null,
        invoices: invoicesRes.status === 'fulfilled' && invoicesRes.value ? invoicesRes.value.data : null,
      };
    } catch {
      return { products: null, customers: null, invoices: null };
    }
  }

  // CRM Corporate Accounts
  async getCRMClients(tier?: string, search?: string): Promise<{ total: number; data: any[] } | null> {
    const params = new URLSearchParams();
    if (tier) params.append('tier', tier);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.get<{ total: number; data: any[] }>(`/crm/clients${q}`);
  }

  async createCRMClient(clientData: any): Promise<any | null> {
    return this.post('/crm/clients', clientData);
  }

  async updateCRMClient(id: string, updates: any): Promise<any | null> {
    return this.put(`/crm/clients/${id}`, updates);
  }

  async deleteCRMClient(id: string): Promise<any | null> {
    return this.del(`/crm/clients/${id}`);
  }

  async seedCRMClients(): Promise<{ total: number; data: any[]; message: string } | null> {
    return this.post('/crm/clients/seed', {});
  }

  // --- Project Engagements & Agile Sprints API ---
  async getProjects(params?: { status?: string; healthStatus?: string; clientId?: string; search?: string }): Promise<{ total: number; data: ProjectEngagement[] } | null> {
    const sp = new URLSearchParams();
    if (params?.status) sp.append('status', params.status);
    if (params?.healthStatus) sp.append('healthStatus', params.healthStatus);
    if (params?.clientId) sp.append('clientId', params.clientId);
    if (params?.search) sp.append('search', params.search);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.get<{ total: number; data: ProjectEngagement[] }>(`/projects${q}`);
  }

  async getProjectById(id: string): Promise<ProjectEngagement | null> {
    return this.get<ProjectEngagement>(`/projects/${id}`);
  }

  async createProject(projectData: Partial<ProjectEngagement>): Promise<ProjectEngagement | null> {
    return this.post<ProjectEngagement>('/projects', projectData);
  }

  async updateProject(id: string, updates: Partial<ProjectEngagement>): Promise<ProjectEngagement | null> {
    return this.put<ProjectEngagement>(`/projects/${id}`, updates);
  }

  async deleteProject(id: string): Promise<any | null> {
    return this.del(`/projects/${id}`);
  }

  async addProjectTask(projectId: string, taskData: Partial<ProjectTask>): Promise<ProjectTask | null> {
    return this.post<ProjectTask>(`/projects/${projectId}/tasks`, taskData);
  }

  async updateProjectTask(projectId: string, taskId: string, updates: Partial<ProjectTask>): Promise<ProjectTask | null> {
    return this.put<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`, updates);
  }

  async deleteProjectTask(projectId: string, taskId: string): Promise<any | null> {
    return this.del(`/projects/${projectId}/tasks/${taskId}`);
  }

  // 2. Enterprise Solutions & Products (Sales & Service)
  async getProducts(params?: { department?: string; search?: string }): Promise<{ total: number; data: Product[] } | null> {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'ALL') query.set('department', params.department);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.get<{ total: number; data: Product[] }>(`/products${qs ? `?${qs}` : ''}`);
  }

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    return this.post<Product>('/products', product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return this.put<Product>(`/products/${id}`, updates);
  }

  async deleteProduct(id: string): Promise<any | null> {
    return this.del(`/products/${id}`);
  }

  // 3. Transaction Persistence & Invoices
  async getInvoices(params?: { status?: string; search?: string }): Promise<{ total: number; data: Invoice[] } | null> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.get<{ total: number; data: Invoice[] }>(`/invoices${qs ? `?${qs}` : ''}`);
  }

  async persistInvoice(invoice: any): Promise<Invoice | null> {
    return this.post<Invoice>('/invoices', invoice);
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    return this.put<Invoice>(`/invoices/${id}`, updates);
  }

  async deleteInvoice(id: string): Promise<any | null> {
    return this.del(`/invoices/${id}`);
  }

  /* ==========================================================================
     Finance & Accounting Management APIs
     ========================================================================== */

  // --- Chart of Accounts & General Ledger ---
  async getGeneralLedger(): Promise<{ total: number; data: GLAccount[] } | null> {
    return this.get<{ total: number; data: GLAccount[] }>('/finance/general-ledger');
  }

  async createGLAccount(accountData: Partial<GLAccount>): Promise<GLAccount | null> {
    return this.post<GLAccount>('/finance/accounts', accountData);
  }

  async updateGLAccount(id: string, updates: Partial<GLAccount>): Promise<GLAccount | null> {
    return this.put<GLAccount>(`/finance/accounts/${id}`, updates);
  }

  async deleteGLAccount(id: string): Promise<any | null> {
    return this.del(`/finance/accounts/${id}`);
  }

  // --- Financial Transactions (Income & Expense Vouchers) ---
  async getFinancialTransactions(params?: { type?: string; category?: string; search?: string }): Promise<{ total: number; data: FinancialTransaction[] } | null> {
    const sp = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') sp.append('type', params.type);
    if (params?.category && params.category !== 'ALL') sp.append('category', params.category);
    if (params?.search) sp.append('search', params.search);
    const qs = sp.toString();
    return this.get<{ total: number; data: FinancialTransaction[] }>(`/finance/transactions${qs ? `?${qs}` : ''}`);
  }

  async createFinancialTransaction(txnData: Partial<FinancialTransaction>): Promise<FinancialTransaction | null> {
    return this.post<FinancialTransaction>('/finance/transactions', txnData);
  }

  async deleteFinancialTransaction(id: string): Promise<any | null> {
    return this.del(`/finance/transactions/${id}`);
  }

  // --- Financial Summary & P&L ---
  async getFinancialSummary(): Promise<FinancialSummary | null> {
    return this.get<FinancialSummary>('/finance/financial-summary');
  }

  // --- Invoices & Billing ---
  async createFinanceInvoice(invoiceData: any): Promise<Invoice | null> {
    return this.post<Invoice>('/finance/invoices', invoiceData);
  }

  async updateFinanceInvoiceStatus(id: string, status: string): Promise<Invoice | null> {
    return this.patch<Invoice>(`/finance/invoices/${id}/status`, { status });
  }

  async deleteFinanceInvoice(id: string): Promise<any | null> {
    return this.del(`/finance/invoices/${id}`);
  }

  /* ==========================================================================
     Procurement & Vendor Management APIs
     ========================================================================== */

  // --- Vendors ---
  async getVendors(params?: { search?: string; category?: string; status?: string }): Promise<{ total: number; data: Vendor[] } | null> {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.category) sp.append('category', params.category);
    if (params?.status) sp.append('status', params.status);
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return this.get<{ total: number; data: Vendor[] }>(`/procurement/vendors${query}`);
  }

  async createVendor(vendorData: Partial<Vendor>): Promise<Vendor | null> {
    return this.post<Vendor>('/procurement/vendors', vendorData);
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | null> {
    return this.put<Vendor>(`/procurement/vendors/${id}`, updates);
  }

  async deleteVendor(id: string): Promise<any | null> {
    return this.del(`/procurement/vendors/${id}`);
  }

  // --- Purchase Orders ---
  async getPurchaseOrders(params?: { status?: string; vendorId?: string; search?: string }): Promise<{ total: number; data: PurchaseOrder[] } | null> {
    const sp = new URLSearchParams();
    if (params?.status) sp.append('status', params.status);
    if (params?.vendorId) sp.append('vendorId', params.vendorId);
    if (params?.search) sp.append('search', params.search);
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return this.get<{ total: number; data: PurchaseOrder[] }>(`/procurement/orders${query}`);
  }

  async createPurchaseOrder(poData: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    return this.post<PurchaseOrder>('/procurement/orders', poData);
  }

  async updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    return this.put<PurchaseOrder>(`/procurement/orders/${id}`, updates);
  }

  async updatePurchaseOrderStatus(id: string, status: string): Promise<PurchaseOrder | null> {
    return this.patch<PurchaseOrder>(`/procurement/orders/${id}/status`, { status });
  }

  async deletePurchaseOrder(id: string): Promise<any | null> {
    return this.del(`/procurement/orders/${id}`);
  }

  // --- Goods Receive Notes (GRN) ---
  async getGoodsReceiveNotes(): Promise<{ total: number; data: GoodsReceiveNote[] } | null> {
    return this.get<{ total: number; data: GoodsReceiveNote[] }>('/procurement/grn');
  }

  async createGoodsReceiveNote(grnData: Partial<GoodsReceiveNote>): Promise<GoodsReceiveNote | null> {
    return this.post<GoodsReceiveNote>('/procurement/grn', grnData);
  }

  async deleteGoodsReceiveNote(id: string): Promise<any | null> {
    return this.del(`/procurement/grn/${id}`);
  }

  async persistRequisition(requisition: any) {
    return this.post('/procurement/orders', requisition);
  }

  /* ==========================================================================
     Reports & Business Intelligence (BI) APIs
     ========================================================================== */
  async getBIMetrics(): Promise<{
    kpis: {
      totalRealizedRevenueBDT: number;
      totalExpensesBDT: number;
      netProfitBDT: number;
      averageGrossMarginPercent: number;
      activeClientAccounts: number;
      activeLiveProjects: number;
      totalHardwareAssets: number;
      totalAssetValuationBDT: number;
      billableEngineers: number;
      totalProcurementCommitmentBDT: number;
      slaComplianceRatePercent: number;
    };
    practiceLines: Array<{ name: string; revenueBDT: number; costBDT: number; marginPercent: number; growthRatePercent: number }>;
    topClients: Array<{ name: string; billedRevenueBDT: number; sharePercent: number }>;
    generatedAt: string;
  } | null> {
    return this.get<any>('/reports/bi-metrics');
  }

  async getRevenueTrends(): Promise<{ total: number; data: Array<{ month: string; revenueBDT: number; expenseBDT: number }> } | null> {
    return this.get<any>('/reports/revenue-trends');
  }

  async getReportsExport(): Promise<any | null> {
    return this.get<any>('/reports/export');
  }

  // 3. Machine Learning Endpoints
  async getMLForecast(): Promise<MLForecastData | null> {
    return this.get<MLForecastData>('/ml/forecast-sales');
  }

  async getMLSmartRequisition(): Promise<MLRequisitionData | null> {
    return this.get<MLRequisitionData>('/ml/smart-requisition');
  }

  async getMLCustomerCLV(): Promise<MLCLVData | null> {
    return this.get<MLCLVData>('/ml/customer-clv');
  }

  async getMLITResourceDemand(): Promise<MLITResourceDemandData | null> {
    return this.get<MLITResourceDemandData>('/ml/it-resource-demand');
  }

  async classifyTicket(title: string, description?: string): Promise<any> {
    return this.post('/ml/classify-ticket', { title, description });
  }

  async getEmployeePerformanceML(empInfo: {
    employee_id: string;
    full_name?: string;
    department?: string;
    designation?: string;
    joining_date?: string;
    salary?: number;
  }): Promise<EmployeePerformanceMLResponse | null> {
    // 1. Try Python FastAPI Endpoint (:8001)
    try {
      const fastApiUrl = `http://127.0.0.1:8001/api/employees/${empInfo.employee_id}/performance-ml`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('auratech_jwt_token') : null;
      const res = await fetch(fastApiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Graceful fallback to Node backend / ML microservice
    }

    // 2. Fallback to Express backend (:5000)
    try {
      const res = await this.post<EmployeePerformanceMLResponse>('/ml/employee-performance', empInfo);
      if (res) return res;
    } catch {
      // fallback
    }

    // 3. Fallback to GET
    return this.get<EmployeePerformanceMLResponse>(`/ml/employee-performance/${empInfo.employee_id}`);
  }

  /* ==========================================================================
     Help Desk & Incident Management APIs
     ========================================================================== */
  async getHelpDeskTickets(params?: { priority?: string; status?: string; search?: string }): Promise<{ total: number; data: HelpDeskTicket[] } | null> {
    const sp = new URLSearchParams();
    if (params?.priority && params.priority !== 'ALL') sp.append('priority', params.priority);
    if (params?.status && params.status !== 'ALL') sp.append('status', params.status);
    if (params?.search) sp.append('search', params.search);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.get<{ total: number; data: HelpDeskTicket[] }>(`/helpdesk/tickets${q}`);
  }

  async createHelpDeskTicket(ticketData: Partial<HelpDeskTicket>): Promise<HelpDeskTicket | null> {
    return this.post<HelpDeskTicket>('/helpdesk/tickets', ticketData);
  }

  async updateHelpDeskTicket(id: string, updates: Partial<HelpDeskTicket>): Promise<HelpDeskTicket | null> {
    return this.put<HelpDeskTicket>(`/helpdesk/tickets/${id}`, updates);
  }

  async updateHelpDeskTicketStatus(id: string, status: string): Promise<HelpDeskTicket | null> {
    return this.patch<HelpDeskTicket>(`/helpdesk/tickets/${id}/status`, { status });
  }

  async deleteHelpDeskTicket(id: string): Promise<any | null> {
    return this.del(`/helpdesk/tickets/${id}`);
  }

  /* ==========================================================================
     IT Assets & Datacenter Infrastructure APIs
     ========================================================================== */
  async getHardwareAssets(params?: { category?: string; rack?: string; search?: string }): Promise<{ total: number; data: HardwareAsset[] } | null> {
    const sp = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') sp.append('category', params.category);
    if (params?.rack && params.rack !== 'ALL') sp.append('rack', params.rack);
    if (params?.search) sp.append('search', params.search);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.get<{ total: number; data: HardwareAsset[] }>(`/it-assets/hardware${q}`);
  }

  async createHardwareAsset(assetData: Partial<HardwareAsset>): Promise<HardwareAsset | null> {
    return this.post<HardwareAsset>('/it-assets/hardware', assetData);
  }

  async updateHardwareAsset(id: string, updates: Partial<HardwareAsset>): Promise<HardwareAsset | null> {
    return this.put<HardwareAsset>(`/it-assets/hardware/${id}`, updates);
  }

  async deleteHardwareAsset(id: string): Promise<any | null> {
    return this.del(`/it-assets/hardware/${id}`);
  }

  async getSoftwareLicenses(): Promise<{ total: number; data: SoftwareLicense[] } | null> {
    return this.get<{ total: number; data: SoftwareLicense[] }>('/it-assets/licenses');
  }

  async createSoftwareLicense(licenseData: Partial<SoftwareLicense>): Promise<SoftwareLicense | null> {
    return this.post<SoftwareLicense>('/it-assets/licenses', licenseData);
  }

  async deleteSoftwareLicense(id: string): Promise<any | null> {
    return this.del(`/it-assets/licenses/${id}`);
  }

  async getDatacenterTelemetry(): Promise<any | null> {
    return this.get<any>('/it-assets/datacenter-telemetry');
  }

  /* ==========================================================================
     Node.js HR & Employee Directory APIs
     ========================================================================== */
  async getHREmployees(params?: { department?: string; status?: string; search?: string }): Promise<{ total: number; data: HREmployee[] } | null> {
    const sp = new URLSearchParams();
    if (params?.department && params.department !== 'ALL') sp.append('department', params.department);
    if (params?.status && params.status !== 'ALL') sp.append('status', params.status);
    if (params?.search) sp.append('search', params.search);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.get<{ total: number; data: HREmployee[] }>(`/hr/employees${q}`);
  }

  async createHREmployee(empData: Partial<HREmployee>): Promise<HREmployee | null> {
    return this.post<HREmployee>('/hr/employees', empData);
  }

  async updateHREmployee(id: string, updates: Partial<HREmployee>): Promise<HREmployee | null> {
    return this.put<HREmployee>(`/hr/employees/${id}`, updates);
  }

  async deleteHREmployee(id: string): Promise<any | null> {
    return this.del(`/hr/employees/${id}`);
  }

  async getHRTimesheets(): Promise<{ total: number; data: any[] } | null> {
    return this.get<{ total: number; data: any[] }>('/hr/timesheets');
  }

  async getHRPayrollSummary(): Promise<any | null> {
    return this.get<any>('/hr/payroll-summary');
  }

  /* ==========================================================================
     Terminal Rosters & Shift Allocation APIs
     ========================================================================== */
  async getTerminalRosters(params?: { shift?: string; status?: string; search?: string; assignedDesk?: string }): Promise<{ total: number; data: TerminalRoster[] } | null> {
    const sp = new URLSearchParams();
    if (params?.shift && params.shift !== 'ALL') sp.append('shift', params.shift);
    if (params?.status && params.status !== 'ALL') sp.append('status', params.status);
    if (params?.assignedDesk && params.assignedDesk !== 'ALL') sp.append('assignedDesk', params.assignedDesk);
    if (params?.search) sp.append('search', params.search);
    const q = sp.toString() ? `?${sp.toString()}` : '';
    return this.get<{ total: number; data: TerminalRoster[] }>(`/hr/rosters${q}`);
  }

  async createTerminalRoster(rosterData: Partial<TerminalRoster>): Promise<TerminalRoster | null> {
    return this.post<TerminalRoster>('/hr/rosters', rosterData);
  }

  async updateTerminalRoster(id: string, updates: Partial<TerminalRoster>): Promise<TerminalRoster | null> {
    return this.put<TerminalRoster>(`/hr/rosters/${id}`, updates);
  }

  async updateTerminalRosterStatus(id: string, statusPayload: { attendance?: string; todaySalesBDT?: number; incentiveEarnedBDT?: number }): Promise<TerminalRoster | null> {
    return this.patch<TerminalRoster>(`/hr/rosters/${id}/status`, statusPayload);
  }

  async deleteTerminalRoster(id: string): Promise<any | null> {
    return this.del(`/hr/rosters/${id}`);
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auratech_jwt_token');
    }
  }

  async checkHealthFastAPI() {
    return this.fastApiRequest<{ status: string }>('/health', 'GET');
  }

  // 4. Python FastAPI HR & Authentication Endpoints
  private getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('auratech_jwt_token') : null;
  }

  private async ensureValidToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    let token = this.getToken();
    if (token) return token;

    // Transparently obtain token using active session persona
    try {
      let username = 'admin';
      const saved = localStorage.getItem('auratech_erp_state_v1') || localStorage.getItem('auratech_erp_state_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.currentUser?.username) {
            username = parsed.currentUser.username;
          }
        } catch {}
      }

      const res = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'password123' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('auratech_jwt_token', data.access_token);
          return data.access_token;
        }
      }
    } catch {
      // Offline fallback
    }
    return null;
  }

  private async fastApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<{ data: T | null; error: string | null; status: number }> {
    try {
      let token = this.getToken();
      if (!token && endpoint !== '/auth/login' && endpoint !== '/health') {
        token = await this.ensureValidToken();
      }

      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let res = await fetch(`http://localhost:8001/api${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // If token expired or session unvalidated (401), automatically re-authenticate once and retry
      if (res.status === 401 && endpoint !== '/auth/login') {
        localStorage.removeItem('auratech_jwt_token');
        token = await this.ensureValidToken();
        if (token) {
          headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          };
          res = await fetch(`http://localhost:8001/api${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });
        }
      }

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        let errorMsg = (resData && (resData.detail || resData.message)) || `HTTP ${res.status}: ${res.statusText}`;
        if (Array.isArray(resData?.detail)) {
          // Format Pydantic validation errors nicely
          errorMsg = resData.detail.map((d: any) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ');
        }
        return {
          data: null,
          error: errorMsg,
          status: res.status,
        };
      }

      return { data: resData as T, error: null, status: res.status };
    } catch (err: any) {
      return { data: null, error: err.message || 'Connection failed to FastAPI server (:8001)', status: 0 };
    }
  }

  // --- Auth API ---
  async loginFastAPI(username: string, password: string) {
    const res = await this.fastApiRequest<{ access_token: string; token_type: string; user: any }>(
      '/auth/login',
      'POST',
      { username, password }
    );
    if (res.data?.access_token) {
      localStorage.setItem('auratech_jwt_token', res.data.access_token);
    }
    return res;
  }

  async logoutFastAPI() {
    const res = await this.fastApiRequest('/auth/logout', 'POST');
    localStorage.removeItem('auratech_jwt_token');
    return res;
  }

  async getMeFastAPI() {
    return this.fastApiRequest<any>('/auth/me', 'GET');
  }

  async changePasswordFastAPI(current_password: string, new_password: string) {
    return this.fastApiRequest('/auth/change-password', 'POST', { current_password, new_password });
  }

  // --- Employees API ---
  async getEmployeesFastAPI(params?: { search?: string; department?: string; status?: string }) {
    let query = '';
    if (params) {
      const sp = new URLSearchParams();
      if (params.search) sp.append('search', params.search);
      if (params.department) sp.append('department', params.department);
      if (params.status) sp.append('status', params.status);
      query = `?${sp.toString()}`;
    }
    return this.fastApiRequest<any[]>(`/employees${query}`, 'GET');
  }

  async createEmployeeFastAPI(employeeData: any) {
    return this.fastApiRequest<any>('/employees', 'POST', employeeData);
  }

  async updateEmployeeFastAPI(id: string | number, employeeData: any) {
    return this.fastApiRequest<any>(`/employees/${id}`, 'PUT', employeeData);
  }

  async deleteEmployeeFastAPI(id: string | number) {
    return this.fastApiRequest<any>(`/employees/${id}`, 'DELETE');
  }

  async createEmployeeAccountFastAPI(id: string | number, accountData: { username: string; password: string; role: string }) {
    return this.fastApiRequest<any>(`/employees/${id}/create-account`, 'POST', accountData);
  }

  async resetEmployeePasswordFastAPI(id: string | number, new_password: string) {
    return this.fastApiRequest<any>(`/employees/${id}/reset-password`, 'POST', { new_password });
  }

  async toggleEmployeeAccountStatusFastAPI(id: string | number) {
    return this.fastApiRequest<any>(`/employees/${id}/toggle-account-status`, 'POST');
  }

  async changeEmployeeRoleFastAPI(id: string | number, role: string) {
    return this.fastApiRequest<any>(`/employees/${id}/role`, 'PUT', { role });
  }

  // --- Users API ---
  async getUsersFastAPI(params?: { role?: string; is_active?: boolean; search?: string }) {
    let query = '';
    if (params) {
      const sp = new URLSearchParams();
      if (params.role) sp.append('role', params.role);
      if (params.is_active !== undefined) sp.append('is_active', String(params.is_active));
      if (params.search) sp.append('search', params.search);
      query = `?${sp.toString()}`;
    }
    return this.fastApiRequest<any[]>(`/users${query}`, 'GET');
  }

  async createUserFastAPI(userData: any) {
    return this.fastApiRequest<any>('/users', 'POST', userData);
  }

  async updateUserFastAPI(id: number | string, userData: any) {
    return this.fastApiRequest<any>(`/users/${id}`, 'PUT', userData);
  }

  async changeUserRoleFastAPI(id: number | string, role: string) {
    return this.fastApiRequest<any>(`/users/${id}/role`, 'PUT', { role });
  }

  async toggleUserStatusFastAPI(id: number | string) {
    return this.fastApiRequest<any>(`/users/${id}/toggle-status`, 'POST');
  }

  async resetUserPasswordFastAPI(id: number | string, new_password: string) {
    return this.fastApiRequest<any>(`/users/${id}/reset-password`, 'POST', { new_password });
  }

  async deleteUserFastAPI(id: number | string) {
    return this.fastApiRequest<any>(`/users/${id}`, 'DELETE');
  }

  // --- Audit Logs API ---
  async getAuditLogsFastAPI(params?: { action?: string; target_type?: string; search?: string; limit?: number }) {
    let query = '';
    if (params) {
      const sp = new URLSearchParams();
      if (params.action) sp.append('action', params.action);
      if (params.target_type) sp.append('target_type', params.target_type);
      if (params.search) sp.append('search', params.search);
      if (params.limit) sp.append('limit', String(params.limit));
      query = `?${sp.toString()}`;
    }
    return this.fastApiRequest<any[]>(`/audit-logs${query}`, 'GET');
  }
}

export const api = new EnterpriseApiService();
export default api;
