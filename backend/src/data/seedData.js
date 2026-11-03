import bcrypt from 'bcryptjs';

// Pre-hashed password for root admin: "password123"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export function getInitialSeedData() {
  return {
    facility: {
      outletCode: 'DC01',
      outletName: 'Silicon Tower Tech Hub & Cloud Data Center',
      address: 'Level 14-16, Silicon Tower, Plot 8/A, Gulshan-2, Dhaka-1212',
      phone: '+880-2-9883401 / +880-1700-000001',
      vatRegNo: '002341982-0101',
      clusterName: 'US-EAST-CLOUD-01',
      pueEfficiency: 1.18,
      datacenterTier: 'Tier III High-Availability',
      coolingStatus: 'OPTIMAL (20.5°C)',
      status: 'ACTIVE_ONLINE'
    },

    users: [
      {
        id: 'USR-ROOT-001',
        email: 'admin@auratech.it',
        username: 'admin',
        name: 'System Administrator',
        role: 'Super Admin',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'Executive & Governance',
        title: 'Super Administrator',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      },
      {
        id: 'USR-HR-002',
        email: 'hr@auratech.it',
        username: 'hr',
        name: 'Fatima Rahman',
        role: 'HR Manager',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'People & Culture',
        title: 'Head of Human Resources & People',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      },
      {
        id: 'USR-SALES-003',
        email: 'sales@auratech.it',
        username: 'sales',
        name: 'Tanvir Ahmed',
        role: 'Sales Manager',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'Client Accounts & Growth',
        title: 'Enterprise Sales & Accounts Director',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      },
      {
        id: 'USR-PM-004',
        email: 'pm@auratech.it',
        username: 'pm',
        name: 'Nusrat Jahan',
        role: 'Project Manager',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'Engineering Delivery',
        title: 'Senior Project & Delivery Manager',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      },
      {
        id: 'USR-FIN-005',
        email: 'finance@auratech.it',
        username: 'finance',
        name: 'Rafiqul Islam',
        role: 'Finance Manager',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'Finance & Compliance',
        title: 'Chief Financial Officer & Comptroller',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      },
      {
        id: 'USR-PROC-006',
        email: 'procurement@auratech.it',
        username: 'procurement',
        name: 'Kamal Hossain',
        role: 'Procurement Manager',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'Supply Chain & Assets',
        title: 'Procurement & Asset Inventory Manager',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      },
      {
        id: 'USR-SUP-007',
        email: 'support@auratech.it',
        username: 'support',
        name: 'Ayesha Siddiqua',
        role: 'Support Staff',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'Tier-2 IT Help Desk',
        title: 'Tier-2 IT Support Lead Specialist',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      },
      {
        id: 'USR-EMP-008',
        email: 'employee@auratech.it',
        username: 'employee',
        name: 'Mahmud Hasan',
        role: 'Employee',
        passwordHash: ADMIN_PASSWORD_HASH,
        department: 'General Operations',
        title: 'Datacenter Systems Engineer',
        isActive: true,
        mfaEnabled: false,
        lastLogin: null
      }
    ],

    employees: [],
    timesheets: [],
    clients: [],
    opportunities: [],
    projects: [],
    itAssets: [],
    softwareLicenses: [],
    purchaseOrders: [],
    vendors: [],
    goodsReceiveNotes: [],
    invoices: [],
    financialTransactions: [],
    helpDeskTickets: [],

    generalLedger: [
      { accountCode: '1010', accountName: 'Cash & Bank Operating (SCB Corporate)', category: 'ASSET', balanceBDT: 0 },
      { accountCode: '1020', accountName: 'Accounts Receivable (Enterprise Clients)', category: 'ASSET', balanceBDT: 0 },
      { accountCode: '1500', accountName: 'Datacenter Server & Network Hardware', category: 'ASSET', balanceBDT: 0 },
      { accountCode: '2010', accountName: 'Accounts Payable (OEM Hardware Vendors)', category: 'LIABILITY', balanceBDT: 0 },
      { accountCode: '3010', accountName: 'Retained Earnings & Reserves', category: 'EQUITY', balanceBDT: 0 },
      { accountCode: '4010', accountName: 'Revenue: Cloud Architecture & DevOps', category: 'REVENUE', balanceBDT: 0 },
      { accountCode: '4020', accountName: 'Revenue: Custom Software Engineering', category: 'REVENUE', balanceBDT: 0 },
      { accountCode: '4030', accountName: 'Revenue: Cybersecurity & Managed Retainers', category: 'REVENUE', balanceBDT: 0 },
      { accountCode: '5010', accountName: 'Cost of Cloud Compute & OEM Hardware', category: 'EXPENSE_COGS', balanceBDT: 0 },
      { accountCode: '6010', accountName: 'Engineering Salaries & Payroll', category: 'EXPENSE_OPEX', balanceBDT: 0 }
    ],

    auditTrail: []
  };
}
