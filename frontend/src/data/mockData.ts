import {
  Product,
  DepartmentMetric,
  CashRegister,
  Customer,
  StoreInfo,
  HourlySalesData,
  ChallanItem,
  Invoice,
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
} from '../types/erp';

export const INITIAL_STORE_INFO: StoreInfo = {
  outletCode: 'DC01',
  outletName: 'Enterprise Tech Hub & Cloud Data Center',
  address: 'Silicon Tower, Plot 8/A, Gulshan-2, Dhaka-1212',
  vatRegNo: '002341982-0101',
  computerName: 'AuraTech-Node-01',
  currentUser: {
    id: 'USR-001',
    name: 'System Administrator',
    role: 'Super Admin',
  },
  activeRegisterNo: 901,
};

export const INITIAL_DEPARTMENTS: DepartmentMetric[] = [
  { id: 'DEP-01', code: 'CLD-IN', name: 'Cloud Infrastructure & DevOps', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-02', code: 'DEV-CS', name: 'Custom Software & Web Engineering', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-03', code: 'CYB-SC', name: 'Cybersecurity & Compliance Auditing', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-04', code: 'AI-DAT', name: 'AI, Machine Learning & Big Data', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-05', code: 'ENT-SA', name: 'Enterprise SaaS & ERP Solutions', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-06', code: 'MGD-IT', name: '24/7 Managed IT Support & NOC', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-07', code: 'NET-HW', name: 'Datacenter Hardware & Edge Networking', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-08', code: 'APP-MO', name: 'Mobile App Engineering (iOS & Android)', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
  { id: 'DEP-09', code: 'IT-CON', name: 'Digital Transformation & IT Consulting', todaySales: 0, prevSales: 0, currSales: 0, qtySold: 0, targetToday: 0, percentageChange: 0 },
];

export const INITIAL_REGISTERS: CashRegister[] = [
  { registerNo: 901, cashierId: 'USR-001', cashierName: 'System Administrator', totalSales: 0, cashBalance: 0, cardSales: 0, mfsSales: 0, status: 'OPEN', openedAt: '09:00 AM', ipAddress: '10.240.10.101', printerType: 'Zebra Enterprise Thermal' },
  { registerNo: 902, cashierId: '', cashierName: 'Unassigned', totalSales: 0, cashBalance: 0, cardSales: 0, mfsSales: 0, status: 'CLOSED', openedAt: '-', ipAddress: '10.240.10.102', printerType: 'Epson TM-T88VI' },
  { registerNo: 903, cashierId: '', cashierName: 'Unassigned', totalSales: 0, cashBalance: 0, cardSales: 0, mfsSales: 0, status: 'CLOSED', openedAt: '-', ipAddress: '10.240.10.103', printerType: 'HP LaserJet Pro' },
  { registerNo: 904, cashierId: '', cashierName: 'Unassigned', totalSales: 0, cashBalance: 0, cardSales: 0, mfsSales: 0, status: 'CLOSED', openedAt: '-', ipAddress: '10.240.10.104', printerType: 'Zebra Enterprise Thermal' },
  { registerNo: 905, cashierId: '', cashierName: 'Unassigned', totalSales: 0, cashBalance: 0, cardSales: 0, mfsSales: 0, status: 'CLOSED', openedAt: '-', ipAddress: '10.240.10.105', printerType: 'Star TSP100III' },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    "id": "CUS001",
    "name": "Unity Telecom",
    "phone": "+880-2-8895404",
    "email": "contact@unitytelecom.corp",
    "tier": "SILVER",
    "points": 179040,
    "totalSpent": 17904000,
    "lastVisit": "2026-01-08"
  },
  {
    "id": "CUS002",
    "name": "Star University",
    "phone": "+880-2-8927105",
    "email": "contact@staruniversity.corp",
    "tier": "SILVER",
    "points": 56640,
    "totalSpent": 5664000,
    "lastVisit": "2026-03-06"
  },
  {
    "id": "CUS003",
    "name": "Alpha University",
    "phone": "+880-2-8962468",
    "email": "contact@alphauniversity.corp",
    "tier": "GOLD",
    "points": 211800,
    "totalSpent": 21180000,
    "lastVisit": "2026-04-05"
  },
  {
    "id": "CUS004",
    "name": "Apex Hospital",
    "phone": "+880-2-8770205",
    "email": "contact@apexhospital.corp",
    "tier": "GOLD",
    "points": 328080,
    "totalSpent": 32808000,
    "lastVisit": "2026-02-07"
  },
  {
    "id": "CUS005",
    "name": "Nova Textiles",
    "phone": "+880-2-8630623",
    "email": "contact@novatextiles.corp",
    "tier": "SILVER",
    "points": 171120,
    "totalSpent": 17112000,
    "lastVisit": "2026-10-13"
  },
  {
    "id": "CUS006",
    "name": "Apex Group",
    "phone": "+880-2-8151003",
    "email": "contact@apexgroup.corp",
    "tier": "PLATINUM",
    "points": 454440,
    "totalSpent": 45444000,
    "lastVisit": "2026-08-15"
  },
  {
    "id": "CUS007",
    "name": "Global Bank",
    "phone": "+880-2-8378929",
    "email": "contact@globalbank.corp",
    "tier": "SILVER",
    "points": 153120,
    "totalSpent": 15312000,
    "lastVisit": "2026-04-17"
  },
  {
    "id": "CUS008",
    "name": "Alpha Logistics",
    "phone": "+880-2-8783682",
    "email": "contact@alphalogistics.corp",
    "tier": "GOLD",
    "points": 244560,
    "totalSpent": 24456000,
    "lastVisit": "2025-12-27"
  },
  {
    "id": "CUS009",
    "name": "Unity Mart",
    "phone": "+880-2-8152585",
    "email": "contact@unitymart.corp",
    "tier": "GOLD",
    "points": 181200,
    "totalSpent": 18120000,
    "lastVisit": "2026-05-25"
  },
  {
    "id": "CUS010",
    "name": "Zenith Industries",
    "phone": "+880-2-8204141",
    "email": "contact@zenithindustries.corp",
    "tier": "GOLD",
    "points": 221640,
    "totalSpent": 22164000,
    "lastVisit": "2026-10-06"
  },
  {
    "id": "CUS011",
    "name": "Metro Media",
    "phone": "+880-2-8813815",
    "email": "contact@metromedia.corp",
    "tier": "SILVER",
    "points": 149280,
    "totalSpent": 14928000,
    "lastVisit": "2026-06-07"
  },
  {
    "id": "CUS012",
    "name": "Meghna Hospital",
    "phone": "+880-2-8098433",
    "email": "contact@meghnahospital.corp",
    "tier": "GOLD",
    "points": 329280,
    "totalSpent": 32928000,
    "lastVisit": "2026-09-14"
  },
  {
    "id": "CUS013",
    "name": "Delta Retail",
    "phone": "+880-2-8745699",
    "email": "contact@deltaretail.corp",
    "tier": "PLATINUM",
    "points": 540480,
    "totalSpent": 54048000,
    "lastVisit": "2026-02-16"
  },
  {
    "id": "CUS014",
    "name": "Meghna Foods",
    "phone": "+880-2-8446672",
    "email": "contact@meghnafoods.corp",
    "tier": "PLATINUM",
    "points": 782040,
    "totalSpent": 78204000,
    "lastVisit": "2026-01-21"
  },
  {
    "id": "CUS015",
    "name": "Surma Textiles",
    "phone": "+880-2-8272905",
    "email": "contact@surmatextiles.corp",
    "tier": "PLATINUM",
    "points": 445320,
    "totalSpent": 44532000,
    "lastVisit": "2026-08-12"
  },
  {
    "id": "CUS016",
    "name": "Green Mart",
    "phone": "+880-2-8476209",
    "email": "contact@greenmart.corp",
    "tier": "SILVER",
    "points": 131040,
    "totalSpent": 13104000,
    "lastVisit": "2026-03-24"
  },
  {
    "id": "CUS017",
    "name": "Meghna Pharma",
    "phone": "+880-2-8176683",
    "email": "contact@meghnapharma.corp",
    "tier": "GOLD",
    "points": 194400,
    "totalSpent": 19440000,
    "lastVisit": "2026-02-15"
  },
  {
    "id": "CUS018",
    "name": "Apex Properties",
    "phone": "+880-2-8252087",
    "email": "contact@apexproperties.corp",
    "tier": "GOLD",
    "points": 218760,
    "totalSpent": 21876000,
    "lastVisit": "2026-04-07"
  },
  {
    "id": "CUS019",
    "name": "Orbit Group",
    "phone": "+880-2-8628322",
    "email": "contact@orbitgroup.corp",
    "tier": "SILVER",
    "points": 138000,
    "totalSpent": 13800000,
    "lastVisit": "2026-04-17"
  },
  {
    "id": "CUS020",
    "name": "Dhaka Telecom",
    "phone": "+880-2-8013428",
    "email": "contact@dhakatelecom.corp",
    "tier": "SILVER",
    "points": 154920,
    "totalSpent": 15492000,
    "lastVisit": "2026-03-23"
  },
  {
    "id": "CUS021",
    "name": "Apex Textiles",
    "phone": "+880-2-8359896",
    "email": "contact@apextextiles.corp",
    "tier": "GOLD",
    "points": 247560,
    "totalSpent": 24756000,
    "lastVisit": "2026-03-02"
  },
  {
    "id": "CUS022",
    "name": "Jamuna Hospital",
    "phone": "+880-2-8771607",
    "email": "contact@jamunahospital.corp",
    "tier": "GOLD",
    "points": 251400,
    "totalSpent": 25140000,
    "lastVisit": "2026-08-30"
  },
  {
    "id": "CUS023",
    "name": "Silver Hospital",
    "phone": "+880-2-8541388",
    "email": "contact@silverhospital.corp",
    "tier": "SILVER",
    "points": 155880,
    "totalSpent": 15588000,
    "lastVisit": "2025-11-02"
  },
  {
    "id": "CUS024",
    "name": "Green Foods",
    "phone": "+880-2-8578909",
    "email": "contact@greenfoods.corp",
    "tier": "SILVER",
    "points": 113760,
    "totalSpent": 11376000,
    "lastVisit": "2026-08-17"
  },
  {
    "id": "CUS025",
    "name": "Prime Pharma",
    "phone": "+880-2-8555164",
    "email": "contact@primepharma.corp",
    "tier": "SILVER",
    "points": 60000,
    "totalSpent": 6000000,
    "lastVisit": "2026-05-03"
  },
  {
    "id": "CUS026",
    "name": "Padma Properties",
    "phone": "+880-2-8764317",
    "email": "contact@padmaproperties.corp",
    "tier": "GOLD",
    "points": 209400,
    "totalSpent": 20940000,
    "lastVisit": "2026-09-11"
  },
  {
    "id": "CUS027",
    "name": "Pioneer Pharma",
    "phone": "+880-2-8484124",
    "email": "contact@pioneerpharma.corp",
    "tier": "PLATINUM",
    "points": 495000,
    "totalSpent": 49500000,
    "lastVisit": "2025-03-21"
  },
  {
    "id": "CUS028",
    "name": "Star Textiles",
    "phone": "+880-2-8545695",
    "email": "contact@startextiles.corp",
    "tier": "PLATINUM",
    "points": 371520,
    "totalSpent": 37152000,
    "lastVisit": "2026-06-23"
  },
  {
    "id": "CUS029",
    "name": "Jamuna Logistics",
    "phone": "+880-2-8255495",
    "email": "contact@jamunalogistics.corp",
    "tier": "PLATINUM",
    "points": 465600,
    "totalSpent": 46560000,
    "lastVisit": "2026-09-07"
  },
  {
    "id": "CUS030",
    "name": "Summit Textiles",
    "phone": "+880-2-8531206",
    "email": "contact@summittextiles.corp",
    "tier": "GOLD",
    "points": 251400,
    "totalSpent": 25140000,
    "lastVisit": "2026-02-20"
  },
  {
    "id": "CUS031",
    "name": "Apex Telecom",
    "phone": "+880-2-8913674",
    "email": "contact@apextelecom.corp",
    "tier": "SILVER",
    "points": 167400,
    "totalSpent": 16740000,
    "lastVisit": "2025-07-15"
  },
  {
    "id": "CUS032",
    "name": "Meghna Properties",
    "phone": "+880-2-8513183",
    "email": "contact@meghnaproperties.corp",
    "tier": "PLATINUM",
    "points": 484200,
    "totalSpent": 48420000,
    "lastVisit": "2025-06-27"
  },
  {
    "id": "CUS033",
    "name": "Global Logistics",
    "phone": "+880-2-8575087",
    "email": "contact@globallogistics.corp",
    "tier": "SILVER",
    "points": 113280,
    "totalSpent": 11328000,
    "lastVisit": "2026-05-11"
  },
  {
    "id": "CUS034",
    "name": "Blue University",
    "phone": "+880-2-8131370",
    "email": "contact@blueuniversity.corp",
    "tier": "SILVER",
    "points": 110400,
    "totalSpent": 11040000,
    "lastVisit": "2026-06-26"
  },
  {
    "id": "CUS035",
    "name": "Delta Properties",
    "phone": "+880-2-8357215",
    "email": "contact@deltaproperties.corp",
    "tier": "GOLD",
    "points": 354000,
    "totalSpent": 35400000,
    "lastVisit": "2026-09-05"
  },
  {
    "id": "CUS036",
    "name": "Nova Telecom",
    "phone": "+880-2-8102563",
    "email": "contact@novatelecom.corp",
    "tier": "GOLD",
    "points": 199200,
    "totalSpent": 19920000,
    "lastVisit": "2026-03-03"
  },
  {
    "id": "CUS037",
    "name": "Alpha Industries",
    "phone": "+880-2-8065433",
    "email": "contact@alphaindustries.corp",
    "tier": "SILVER",
    "points": 146520,
    "totalSpent": 14652000,
    "lastVisit": "2026-05-09"
  },
  {
    "id": "CUS038",
    "name": "Green Group",
    "phone": "+880-2-8474585",
    "email": "contact@greengroup.corp",
    "tier": "SILVER",
    "points": 94680,
    "totalSpent": 9468000,
    "lastVisit": "2026-01-27"
  },
  {
    "id": "CUS039",
    "name": "Nova Holdings",
    "phone": "+880-2-8791581",
    "email": "contact@novaholdings.corp",
    "tier": "GOLD",
    "points": 288000,
    "totalSpent": 28800000,
    "lastVisit": "2026-10-04"
  },
  {
    "id": "CUS040",
    "name": "Jamuna Bank",
    "phone": "+880-2-8396405",
    "email": "contact@jamunabank.corp",
    "tier": "PLATINUM",
    "points": 468840,
    "totalSpent": 46884000,
    "lastVisit": "2026-06-01"
  }
];

export const INITIAL_HOURLY_SALES: HourlySalesData[] = [
  { hour: '10:00 AM', amount: 0, invoices: 0, items: 0 },
  { hour: '11:00 AM', amount: 0, invoices: 0, items: 0 },
  { hour: '12:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '01:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '02:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '03:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '04:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '05:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '06:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '07:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '08:00 PM', amount: 0, invoices: 0, items: 0 },
  { hour: '09:00 PM', amount: 0, invoices: 0, items: 0 },
];

export const INITIAL_CHALLANS: ChallanItem[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_REQUISITIONS: RequisitionItem[] = [];

export const INITIAL_ECOMMERCE_ORDERS: EcommerceOrder[] = [];

export const INITIAL_STAFF: StaffMember[] = [];

export const INITIAL_BINS: BinRack[] = [
  { id: 'BIN-A1', code: 'Rack DC-01', name: 'Compute Cluster Rack 01 (42U)', zone: 'SERVER_HALL_FLOOR', department: 'Datacenter Hardware & Edge Networking', capacityUnits: 42, occupiedUnits: 0, status: 'OPTIMAL' },
  { id: 'BIN-A2', code: 'Rack DC-02', name: 'Core Routing & Security Bay (42U)', zone: 'SERVER_HALL_FLOOR', department: 'Datacenter Hardware & Edge Networking', capacityUnits: 42, occupiedUnits: 0, status: 'OPTIMAL' },
  { id: 'BIN-BR1', code: 'BR-01', name: 'Hardware Staging Vault', zone: 'BACKROOM_STORAGE', department: 'Datacenter Hardware & Edge Networking', capacityUnits: 200, occupiedUnits: 0, status: 'OPTIMAL' },
];

export const INITIAL_TRANSFERS: TransferRecord[] = [];

export const INITIAL_MOVEMENT_LOGS: StockMovementLog[] = [];

export const INITIAL_DAMAGE_TICKETS: DamageTicket[] = [];

export const INITIAL_REPAIR_TICKETS: RepairTicket[] = [];

export const INITIAL_BAG_STOCK: BagStockItem[] = [
  { id: 'BAG-01', type: 'CAT6A_PATCH_KIT', name: 'Shielded Cat6A High-Speed Patch Cord Kit (10m)', size: '10 Gbps Spec', charge: 200, warehouseStock: 0, floorStock: 0, todayDispensed: 0 },
  { id: 'BAG-02', type: 'FIBER_OPTIC_PATCH', name: 'Single-Mode LC-LC Duplex Fiber Patch Cable (5m)', size: '40G / 100G', charge: 350, warehouseStock: 0, floorStock: 0, todayDispensed: 0 },
  { id: 'BAG-03', type: 'SAS_DRIVE_CADDY', name: 'Hot-Swap SAS 3.5" Drive Tray Caddy & Screws', size: 'Server Bay Fit', charge: 450, warehouseStock: 0, floorStock: 0, todayDispensed: 0 },
  { id: 'BAG-04', type: 'STATIC_SHIELD_PACK', name: 'Anti-Static ESD Shielding Component Bags (Pack of 5)', size: '12x10 Inch', charge: 150, warehouseStock: 0, floorStock: 0, todayDispensed: 0 },
];

export const INITIAL_STOCKTAKE_ITEMS: StocktakeItem[] = [];

export const INITIAL_SHRINKAGE_LOGS: ShrinkageLog[] = [];

export const INITIAL_DEPARTMENT_MARGINS: DepartmentMarginData[] = [
  { id: 'MAR-01', department: 'Cloud Infrastructure & DevOps', code: 'CLD', grossSales: 0, cogs: 0, grossProfit: 0, marginPct: 0, discountBurn: 0, netMarginPct: 0, topSellerSKU: '-' },
  { id: 'MAR-02', department: 'Custom Software & Web Engineering', code: 'DEV', grossSales: 0, cogs: 0, grossProfit: 0, marginPct: 0, discountBurn: 0, netMarginPct: 0, topSellerSKU: '-' },
  { id: 'MAR-03', department: 'Enterprise SaaS & ERP Solutions', code: 'SaaS', grossSales: 0, cogs: 0, grossProfit: 0, marginPct: 0, discountBurn: 0, netMarginPct: 0, topSellerSKU: '-' },
  { id: 'MAR-04', department: 'Datacenter Hardware & Edge Networking', code: 'NET', grossSales: 0, cogs: 0, grossProfit: 0, marginPct: 0, discountBurn: 0, netMarginPct: 0, topSellerSKU: '-' },
  { id: 'MAR-05', department: 'Cybersecurity & Compliance Auditing', code: 'CYB', grossSales: 0, cogs: 0, grossProfit: 0, marginPct: 0, discountBurn: 0, netMarginPct: 0, topSellerSKU: '-' },
  { id: 'MAR-06', department: 'AI, Machine Learning & Big Data', code: 'AI', grossSales: 0, cogs: 0, grossProfit: 0, marginPct: 0, discountBurn: 0, netMarginPct: 0, topSellerSKU: '-' },
  { id: 'MAR-07', department: '24/7 Managed IT Support & NOC', code: 'NOC', grossSales: 0, cogs: 0, grossProfit: 0, marginPct: 0, discountBurn: 0, netMarginPct: 0, topSellerSKU: '-' },
];

export const INITIAL_FOOTFALL_DATA: HourlyFootfallData[] = [
  { hour: '10:00 - 11:00 AM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '11:00 - 12:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '12:00 - 01:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '01:00 - 02:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '02:00 - 03:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '03:00 - 04:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '04:00 - 05:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '05:00 - 06:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '06:00 - 07:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
  { hour: '07:00 - 08:00 PM', footfallCount: 0, billsCount: 0, salesValue: 0, conversionRate: 0, cashierSpeedSec: 0 },
];
