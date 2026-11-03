// AuraTech Enterprise IT Corporate Constants & Enums

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CTO: 'CTO',
  ENGINEERING_LEAD: 'ENGINEERING_LEAD',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  FINANCE_CONTROLLER: 'FINANCE_CONTROLLER',
  DEVOPS_ENGINEER: 'DEVOPS_ENGINEER',
  HR_MANAGER: 'HR_MANAGER',
  SALES_DIRECTOR: 'SALES_DIRECTOR',
  SUPPORT_ENGINEER: 'SUPPORT_ENGINEER'
};

export const PRACTICE_AREAS = [
  'Cloud & DevOps Engineering',
  'Custom Software & Microservices',
  'Cybersecurity & Zero-Trust SOC',
  'AI & Big Data Pipelines',
  'Enterprise SaaS & Licenses',
  '24/7 Managed IT Retainers',
  'Datacenter Server Racks & Planogram',
  'Hardware Defect & Vendor RMA Bench'
];

export const SLA_TIERS = {
  PLATINUM: { name: 'Platinum Enterprise', uptime: '99.99%', responseMinutes: 15, discountPercent: 15 },
  GOLD: { name: 'Gold Corporate', uptime: '99.95%', responseMinutes: 60, discountPercent: 10 },
  SILVER: { name: 'Silver Business', uptime: '99.90%', responseMinutes: 240, discountPercent: 5 },
  STANDARD: { name: 'Standard IT', uptime: '99.00%', responseMinutes: 480, discountPercent: 0 }
};

export const PROJECT_STATUS = {
  PIPELINE: 'PIPELINE',
  DISCOVERY: 'DISCOVERY',
  IN_SPRINT: 'IN_SPRINT',
  UAT: 'UAT',
  PRODUCTION_LIVE: 'PRODUCTION_LIVE',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD'
};

export const INCIDENT_PRIORITY = {
  P1_CRITICAL: { level: 'P1', label: 'Critical Outage', targetResolutionHours: 2 },
  P2_HIGH: { level: 'P2', label: 'Degraded Performance', targetResolutionHours: 8 },
  P3_MEDIUM: { level: 'P3', label: 'Service Request', targetResolutionHours: 24 },
  P4_LOW: { level: 'P4', label: 'Advisory / Inquiry', targetResolutionHours: 72 }
};

export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_CLIENT_APPROVAL: 'PENDING_CLIENT_APPROVAL',
  ISSUED: 'ISSUED',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
};

export const PURCHASE_ORDER_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_CTO_APPROVAL: 'PENDING_CTO_APPROVAL',
  APPROVED: 'APPROVED',
  DISPATCHED_BY_OEM: 'DISPATCHED_BY_OEM',
  GOODS_RECEIVED_GRN: 'GOODS_RECEIVED_GRN',
  REJECTED: 'REJECTED'
};
