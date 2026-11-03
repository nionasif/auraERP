# AuraTech ERP - Enterprise IT Backend Service

Enterprise REST API engine for AuraTech IT & Software Solutions ERP suite.

## Architecture & Standards
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Security**: Helmet, CORS, JWT (Access & Refresh), Role-Based Access Control (RBAC)
- **Compliance**: SOC 2 Type II & ISO 27001 Tamper-Evident SHA-256 Audit Logging
- **Error Standard**: RFC 7807 Problem Details for HTTP APIs

---

## Directory Structure
```
backend/
├── src/
│   ├── config/           # Constants (roles, practice areas, SLA tiers) and env config
│   ├── data/             # Enterprise seed dataset & persisted database.json
│   ├── middleware/       # JWT auth, RBAC guards, audit logger, RFC 7807 error handler
│   ├── routes/           # REST endpoints for all corporate operations
│   │   ├── auth.js       # /api/auth (login, me, users, registration)
│   │   ├── health.js     # /api/health (uptime, memory, DC cluster sync)
│   │   ├── hr.js         # /api/hr (employees, timesheets, payroll metrics)
│   │   ├── crm.js        # /api/crm (corporate clients, deals pipeline, SLA credits)
│   │   ├── projects.js   # /api/projects (engagements, sprints, burn rates)
│   │   ├── itAssets.js   # /api/it-assets (hardware inventory, rack PUE, licenses)
│   │   ├── procurement.js# /api/procurement (vendor directory, purchase orders)
│   │   ├── finance.js    # /api/finance (tax invoices, Mushak-6.3, general ledger)
│   │   ├── helpDesk.js   # /api/helpdesk (incident tickets P1-P4, SLA countdowns)
│   │   ├── reports.js    # /api/reports (BI practice margins, billability, ARR)
│   │   └── system.js     # /api/system (tamper-evident audit trail, node telemetry)
│   ├── services/         # Corporate database persistence service
│   └── server.js         # Express master application
├── .env                  # Port 5000, JWT Secret, Facility ID
└── package.json
```

---

## Quick Start
```bash
npm install
npm start
```
Server runs at: **`http://localhost:5000`**

### Pre-Configured Demo Accounts
- **CTO / Superadmin**: `cto@auratech.io` / `AuraTech@2026!`
- **Lead DevOps Architect**: `farhan.k@auratech.io` / `AuraTech@2026!`
- **Principal Security Lead**: `nusrat.j@auratech.io` / `AuraTech@2026!`
- **Financial Controller**: `faisal.a@auratech.io` / `AuraTech@2026!`
- **HR Director**: `sadia.i@auratech.io` / `AuraTech@2026!`
