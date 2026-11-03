export type ViewType =
  | 'DASHBOARD'
  | 'MY_TASKS'
  | 'POS'
  | 'SETUP'
  | 'RECEIVE'
  | 'STORING'
  | 'TRANSFER'
  | 'REQUISITION'
  | 'ECOMMERCE'
  | 'CRM'
  | 'REPORT'
  | 'SHOPPING_BAG'
  | 'ADMIN'
  | 'DAMAGE'
  | 'REPAIR'
  | 'STAFF'
  | 'AUDIT'
  | 'BI_TOOLS';

export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  department: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  image?: string;
  size?: string; // Spec / Tier / Deployment Model
  color?: string; // Environment / Edition
  uom: string; // DEPLOYMENT, LICENSE, INSTANCE, UNIT, RETAINER, HOURS
  agingDays: number;
  binLocation?: string;
}

export interface DepartmentMetric {
  id: string;
  name: string;
  code: string;
  todaySales: number;
  prevSales: number;
  currSales: number;
  qtySold: number;
  targetToday: number;
  percentageChange: number;
}

export interface CashRegister {
  registerNo: number;
  cashierId: string;
  cashierName: string;
  totalSales: number;
  cashBalance: number;
  cardSales: number;
  mfsSales: number;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  openedAt: string;
  ipAddress?: string;
  printerType?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
  lineTotal: number;
}

export type UserRole =
  | 'Super Admin'
  | 'HR Manager'
  | 'Sales Manager'
  | 'Project Manager'
  | 'Finance Manager'
  | 'Procurement Manager'
  | 'Support Staff'
  | 'Employee';

export interface UserPermissions {
  canManageUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canManageInventory: boolean;
  canAssignInventory: boolean;
  canDeleteInventory: boolean;
  canGenerateInvoices: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  allowedViews: ViewType[];
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  permissions: UserPermissions;
  employee_id?: string;
  employee_name?: string;
  employee_status?: string;
}

export interface EmployeeRecord {
  id: number | string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joining_date: string;
  employment_status: 'Active' | 'Inactive' | 'Terminated' | string;
  salary: number;
  address: string;
  has_login_account?: boolean;
  account_role?: UserRole | string;
  account_active?: boolean;
  account_username?: string;
  created_at?: string;
  updated_at?: string;
}

export type InventoryCategory =
  | 'IT Equipment'
  | 'Office Equipment & Furniture'
  | 'Other Office Items';

export type InventoryStatus =
  | 'Available'
  | 'Assigned'
  | 'Under Maintenance'
  | 'Damaged'
  | 'Lost'
  | 'Retired';

export interface InventoryAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  assignedDate: string;
  returnDate?: string;
  assignedBy: string;
  conditionOnAssign: string;
  conditionOnReturn?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string; // Asset/Product ID (e.g. AST-IT-1001)
  name: string;
  category: InventoryCategory;
  subcategory: string; // e.g. Laptop, Monitor, Office Chair, etc.
  brand: string;
  model: string;
  serialNumber?: string;
  quantity: number;
  availableQuantity: number;
  assignedQuantity: number;
  purchasePrice: number;
  supplier: string;
  purchaseDate: string;
  warranty: string;
  location: string;
  assignedEmployee?: string;
  assignedEmployeeId?: string;
  status: InventoryStatus;
  notes?: string;
  assignmentHistory?: InventoryAssignment[];
}

export interface InvoiceItem {
  barcode?: string;
  name: string;
  size?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  dueDate?: string;
  outletId?: string;
  outletName?: string;
  registerNo?: number;
  cashierId?: string;
  cashierName?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
    address?: string;
    pointsEarned?: number;
    pointsUsed?: number;
    tier?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  vatRate: number; // e.g., 0.05
  vatAmount: number;
  bagCharge: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'MFS' | 'SPLIT' | 'WIRE_TRANSFER' | 'NET_30';
  paymentStatus?: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  cashTendered?: number;
  changeDue?: number;
  cardRef?: string;
  mfsRef?: string;
  notes?: string;
  status: 'COMPLETED' | 'VOIDED' | 'REFUNDED' | 'PAID' | 'PENDING' | 'OVERDUE';
  // Corporate & NBR Mushak-6.3 Fields
  invoiceNumber?: string;
  mushakChallanNo?: string;
  clientId?: string;
  clientName?: string;
  issueDate?: string;
  subtotalBDT?: number;
  corporateDiscountBDT?: number;
  vatAmountBDT?: number;
  totalPayableBDT?: number;
  transactionRef?: string;
  issuedBy?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM' | 'REGULAR' | 'ENTERPRISE';
  points: number;
  totalSpent: number;
  lastVisit: string;
}

export interface StoreInfo {
  outletCode: string;
  outletName: string;
  address: string;
  vatRegNo: string;
  computerName: string;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  activeRegisterNo: number;
}

export interface HourlySalesData {
  hour: string;
  amount: number;
  invoices: number;
  items: number;
}

export interface ChallanItem {
  id: string;
  challanNo: string;
  source: string;
  destination: string;
  date: string;
  itemCount: number;
  totalValue: number;
  status: 'QUEUE' | 'IN_TRANSIT' | 'RECEIVED' | 'VERIFIED' | string;
  carrierVehicle?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface RequisitionItem {
  id: string;
  reqNo: string;
  date: string;
  department: string;
  itemCount: number;
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
  status: 'PENDING_APPROVAL' | 'APPROVED_CDC' | 'APPROVED_HQ' | 'PACKING' | 'PROVISIONING' | 'DISPATCHED' | string;
  estimatedValue: number;
  notes: string;
}

export interface EcommerceOrder {
  orderId: string;
  customerName: string;
  phone: string;
  orderDate: string;
  items: Array<{ name: string; size: string; qty: number; price: number }>;
  totalAmount: number;
  fulfillmentType: 'STORE_PICKUP' | 'HOME_DELIVERY' | 'CLOUD_PROVISION' | 'HARDWARE_DELIVERY' | string;
  courier?: string;
  status: 'NEW' | 'PACKED' | 'READY_FOR_PICKUP' | 'COLLECTED' | 'DISPATCHED' | 'PROVISIONED' | string;
  lockerNumber?: string;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  phone: string;
  assignedRegister?: number;
  shift: string;
  todaySales: number;
  attendance: 'PRESENT' | 'ON_DUTY' | 'ON_LEAVE';
  commissionEarned: number;
}

export interface BinRack {
  id: string;
  code: string;
  name: string;
  zone: 'SHOWROOM_FLOOR' | 'BACKROOM_STORAGE' | 'SERVER_HALL_FLOOR' | 'DC_VAULT' | string;
  department: string;
  capacityUnits: number;
  occupiedUnits: number;
  status: 'OPTIMAL' | 'NEAR_FULL' | 'REPLENISH_NEEDED';
}

export interface TransferRecord {
  id: string;
  stnNo: string;
  date: string;
  fromOutlet: string;
  toOutlet: string;
  itemsSummary: string;
  totalUnits: number;
  totalValue: number;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  eta: string;
  status: 'DISPATCHED' | 'IN_TRANSIT' | 'RECEIVED' | 'VERIFIED' | string;
}

export interface StockMovementLog {
  id: string;
  imnNo: string;
  date: string;
  time: string;
  productName: string;
  sku: string;
  fromLocation: string;
  toLocation: string;
  qty: number;
  authorizedBy: string;
  reason: 'FLOOR_REPLENISHMENT' | 'BACK_TO_STORAGE' | 'SEASONAL_ROTATION' | 'DAMAGE_PULL' | 'RACK_REALLOCATION' | string;
}

export interface DamageTicket {
  id: string;
  ticketNo: string;
  date: string;
  productName: string;
  barcode: string;
  sku: string;
  reportedBy: string;
  defectType: 'HARDWARE_FAULT' | 'MEMORY_CORRUPTION' | 'PORT_FAILURE' | 'CIRCUIT_DAMAGE' | 'FIRMWARE_CORRUPTION' | 'FABRIC_TEAR' | 'STAIN_DYE_BLEED' | 'ZIPPER_BUTTON_DEFECT' | 'BROKEN_CRAFT' | 'COLOR_FADE' | string;
  quantity: number;
  unitPrice: number;
  actionTaken: 'IN_HOUSE_REPAIR' | 'RETURN_TO_VENDOR' | 'SCRAP_WRITE_OFF' | string;
  status: 'PENDING_APPROVAL' | 'SENT_TO_TAILOR' | 'SENT_TO_LAB' | 'DISPATCHED_RTV' | 'WRITTEN_OFF' | string;
}

export interface RepairTicket {
  id: string;
  ticketNo: string;
  customerName?: string;
  customerPhone?: string;
  itemType: string;
  barcode?: string;
  receivedDate: string;
  expectedDelivery: string;
  alterationType: 'FIRMWARE_REFLASH' | 'MEMORY_UPGRADE' | 'POWER_SUPPLY_REPLACE' | 'BOARD_REPAIR' | 'PORT_RECONDITION' | 'SLEEVE_SHORTENING' | 'SAREE_FALL_PICO' | 'WAIST_ADJUSTMENT' | 'ZIPPER_REPLACE' | 'EMBROIDERY_REPAIR' | string;
  assignedTailor: string; // Technician / Hardware Specialist
  tailoringCharge: number;
  status: 'RECEIVED' | 'IN_TAILORING' | 'IN_DIAGNOSTICS' | 'QC_PASSED' | 'READY_FOR_PICKUP' | 'DELIVERED' | string;
}

export interface BagStockItem {
  id: string;
  type: 'CAT6A_PATCH_KIT' | 'FIBER_OPTIC_PATCH' | 'SAS_DRIVE_CADDY' | 'STATIC_SHIELD_PACK' | 'STANDARD_PAPER' | 'ARTISAN_JUTE' | 'ECO_COTTON' | string;
  name: string;
  size: string;
  charge: number;
  warehouseStock: number;
  floorStock: number;
  todayDispensed: number;
}

export interface StocktakeItem {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  department: string;
  location: string;
  bookStock: number;
  physicalCount: number;
  variance: number;
  unitCost: number;
  varianceValue: number;
  status: 'PENDING' | 'COUNTED' | 'MATCHED' | 'DISCREPANCY';
  lastScannedTime?: string;
}

export interface ShrinkageLog {
  id: string;
  auditNo: string;
  date: string;
  productName: string;
  barcode: string;
  varianceQty: number;
  lossValue: number;
  reason: 'UNRECORDED_USAGE' | 'DECOMMISSIONED_DEFECT' | 'AUDIT_MISCOUNT' | 'VENDOR_SHORTAGE' | 'THEFT_UNRECORDED' | 'EXPIRED_DAMAGE' | 'DATA_MISCOUNT' | string;
  approvedBy: string;
  actionTaken: 'WRITTEN_OFF' | 'ADJUSTED_LEDGER' | 'UNDER_INVESTIGATION' | string;
}

export interface DepartmentMarginData {
  id: string;
  department: string;
  code: string;
  grossSales: number;
  cogs: number;
  grossProfit: number;
  marginPct: number;
  discountBurn: number;
  netMarginPct: number;
  topSellerSKU: string;
}

export interface HourlyFootfallData {
  hour: string;
  footfallCount: number;
  billsCount: number;
  salesValue: number;
  conversionRate: number;
  cashierSpeedSec: number;
}

// --- Enterprise Project Management Types ---
export type ProjectHealthStatus = 'HEALTHY_GREEN' | 'AT_RISK_YELLOW' | 'CRITICAL_RED';
export type ProjectEngagementStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED';
export type ProjectTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type ProjectTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProjectMilestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  completionPct: number;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  assignee: string;
  estimatedHours: number;
  loggedHours: number;
  sprint: string;
  createdAt: string;
  dueDate: string;
}

export interface ProjectEngagement {
  id: string;
  code: string;
  name: string;
  description?: string;
  clientId: string;
  clientName: string;
  leadArchitect: string;
  budgetBDT: number;
  billedBDT: number;
  burnedHours: number;
  allocatedHours: number;
  currentSprint: string;
  status: ProjectEngagementStatus;
  healthStatus: ProjectHealthStatus;
  startDate: string;
  targetCompletionDate: string;
  techStack: string[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  createdAt?: string;
}

// --- Procurement & Vendor Management Types ---
export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  binNo?: string;
  paymentTerms: string;
  status: 'ACTIVE' | 'INACTIVE';
  rating?: number;
  notes?: string;
  createdAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemName: string;
  sku: string;
  specs?: string;
  quantity: number;
  unitPriceBDT: number;
  totalBDT: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId?: string | null;
  vendorName: string;
  vendorCode: string;
  issuedDate: string;
  items: PurchaseOrderItem[];
  totalAmountBDT: number;
  priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
  deliveryLocation: string;
  approvedBy: string;
  expectedDelivery: string;
  notes?: string;
  grnNumber?: string | null;
  createdAt?: string;
}

export interface GRNReceivedItem {
  id?: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  serialNumbers?: string;
  remarks?: string;
}

export interface GoodsReceiveNote {
  id: string;
  grnNumber: string;
  poId?: string | null;
  poNumber: string;
  vendorName: string;
  challanNo: string;
  carrierVehicle: string;
  driverName: string;
  driverPhone: string;
  receivedDate: string;
  receivedBy: string;
  receivingBay: string;
  receivedItems: GRNReceivedItem[];
  itemCount: number;
  totalValueBDT: number;
  remarks: string;
  status: 'ACCEPTED_INTO_INVENTORY' | 'QUARANTINE_INSPECTION' | 'REJECTED';
}

// --- Finance & Accounting Types ---
export interface GLAccount {
  id: string;
  accountCode: string;
  accountName: string;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE_OPEX' | 'EXPENSE_COGS' | string;
  balanceBDT: number;
  currency?: string;
  createdAt?: string;
}

export interface FinancialTransaction {
  id: string;
  voucherNo: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amountBDT: number;
  paymentMethod: string;
  accountCode: string;
  referenceNo?: string;
  date: string;
  recordedBy: string;
  notes?: string;
  createdAt?: string;
}

export interface FinancialSummary {
  totalRevenueBDT: number;
  totalExpensesBDT: number;
  netProfitBDT: number;
  cashAndEquivalentsBDT: number;
  totalVATMushakBDT: number;
  accountsReceivableBDT: number;
  taxComplianceStandard?: string;
  fiscalYear?: string;
  totalInvoicesCount?: number;
  totalTransactionsCount?: number;
}

// --- Help Desk & Incident Management Types ---
export interface HelpDeskTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  category: string;
  status: 'INVESTIGATING' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED' | 'CLOSED';
  reportedAt: string;
  resolvedAt?: string | null;
  assignedTo: string;
  slaTargetMinutes: number;
  actualResolutionMinutes?: number | null;
  slaMet?: boolean | null;
  rootCauseAnalysis?: string;
}

// --- IT Assets & Datacenter Infrastructure Types ---
export interface HardwareAsset {
  id: string;
  assetTag: string;
  serialNumber: string;
  name: string;
  category: string;
  specs: string;
  facility: string;
  rackLocation: string;
  status: 'OPERATIONAL_LIVE' | 'MAINTENANCE_STANDBY' | 'DECOMMISSIONED' | string;
  oemVendor: string;
  purchasePriceBDT: number;
  warrantyExpiry: string;
  lastDiagnostics: string;
  healthScore: number;
}

export interface SoftwareLicense {
  id: string;
  name: string;
  publisher: string;
  type: string;
  totalSeats: number;
  allocatedSeats: number;
  renewalDate: string;
  annualCostBDT: number;
  status: string;
}

// --- Node HR Employee Record ---
export interface HREmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  level: string;
  joinDate: string;
  employmentType: string;
  baseSalaryBDT: number;
  hourlyBillableRateUSD: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | string;
  skills: string[];
  certifications?: string[];
}

// --- Terminal Rosters & Shift Allocation Types ---
export interface TerminalRoster {
  id: string;
  rosterCode: string;
  employeeId: string;
  employeeName: string;
  phone: string;
  role: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT' | 'STANDBY';
  shiftHours: string;
  assignedDesk: string;
  date: string;
  attendance: 'ON_DUTY' | 'PRESENT' | 'ON_LEAVE' | 'OFF_DUTY' | 'COMPLETED';
  todaySalesBDT: number;
  incentiveEarnedBDT: number;
  notes?: string;
  createdAt?: string;
}

// --- ML-Powered Employee Performance & Attendance Analytics ---
export interface EmployeeDailyAttendance {
  date: string;
  day: string;
  status: 'PRESENT' | 'ON_DUTY' | 'LATE' | 'ON_LEAVE' | 'WEEKEND' | 'NOT_JOINED' | 'SCHEDULED';
  checkIn: string;
  checkOut: string;
  workHours: number;
  notes: string;
}

export interface EmployeeMonthlyPerformance {
  month: string;
  year?: number;
  score: number;
  tasksCompleted: number;
  punctuality: number;
  qualityRating: number;
  status?: string;
  notes?: string;
}

export interface EmployeePerformanceMLResponse {
  status: string;
  employee: {
    id: string;
    name: string;
    department: string;
    designation: string;
    joiningDate: string;
    salary: number;
  };
  currentMonthMeta?: {
    monthName: string;
    year: number;
    daysInMonth: number;
    monthLabel: string;
  };
  kpiSummary: {
    overallProductivityScore: number;
    attendanceRate: number;
    punctualityScore: number;
    presentDays: number;
    lateDays: number;
    leaveDays: number;
    workingDays: number;
    currentMonthHours: number;
    daysInMonth?: number;
    monthName?: string;
    year?: number;
  };
  dailyAttendance: EmployeeDailyAttendance[];
  performanceTrend: EmployeeMonthlyPerformance[];
  mlPredictions: {
    attendanceReliabilityIndex: number;
    attendanceForecastNextMonth: string;
    flightRisk: {
      level: 'LOW' | 'MODERATE' | 'HIGH';
      probabilityPercent: number;
      interpretation: string;
    };
    burnoutRisk: {
      level: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
      score: number;
      workloadPacing: string;
    };
    appraisalRecommendation: {
      status: string;
      suggestedIncrement: string;
      justification: string;
    };
    strengths: string[];
    focusArea: string;
  };
  analyzedAt: string;
}




