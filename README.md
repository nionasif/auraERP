# AuraTech ERP - Enterprise IT & Software Solutions ERP Suite

A high-performance Enterprise Resource Planning (ERP) suite tailored for an **Enterprise IT & Cloud Engineering Company** (Cloud & DevOps, Custom Software Engineering, Cybersecurity & Zero Trust, AI & Big Data Pipelines, Datacenter Infrastructure, Hardware & Edge Networking, and 24/7 Managed IT Retainers).

---

## Project Structure

```
auratech-erp/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS ERP Application
│   ├── src/              # Application source code
│   │   ├── components/   # Views, dashboard widgets, and dialog modals
│   │   ├── data/         # Mock data & Enterprise IT seed state
│   │   ├── store/        # Zustand/React state management
│   │   └── types/        # TypeScript interfaces & definitions
│   ├── public/           # Static assets, icons, SVGs
│   ├── package.json      # Frontend dependencies & scripts
│   └── vite.config.ts    # Vite bundler configuration
│
├── backend/              # Node.js + Express REST API Server
│   ├── src/              # Server source code
│   │   ├── routes/       # API endpoints (health, products, customers, invoices...)
│   │   ├── data/         # Seed data & datacenter models
│   │   └── server.js     # Express application entry point
│   ├── .env              # Environment configuration
│   └── package.json      # Backend dependencies & scripts
│
├── package.json          # Root orchestration package
└── README.md             # Project documentation
```

---

## Quick Start

### 🚀 All-in-One Full-Stack Runner
Run all 4 microservices simultaneously (Vite Frontend, Node.js Backend, FastAPI HR & Auth Core, Python ML Engine):
```bash
python run.py
```
Or double-click `run.bat` on Windows.

### Individual Subsystems

#### 1. Frontend (ERP Web Client)
```bash
cd frontend
npm install
npm run dev
```
Runs at: **`http://localhost:5173/`**

#### 2. Node Backend (REST API Service)
```bash
cd backend
npm install
npm run dev
```
Runs at: **`http://localhost:5000/`**

#### 3. FastAPI HR & Authentication Service
```bash
cd fastapi_backend
pip install -r requirements.txt
python main.py
```
Runs at: **`http://localhost:8001/`**

#### 4. Python ML Predictive Intelligence Core
```bash
cd ml
pip install -r requirements.txt
python server.py
```
Runs at: **`http://localhost:8000/`**

---

## Features & Subsystems

1. **IT Operations & Management Dashboard**:
   - Executive KPIs: Target vs. Billed Revenue, Active Billing Desks, Invoices/SOWs, Units Delivered, Rate Approvals, SLA Guarantees.
   - Practice Area Wise Revenue Matrix (Cloud, Custom Software, Cybersecurity, AI, SaaS, Managed IT).
   - Billing Terminal Desk Breakdown (#901 to #905).
   - Hourly Billing Trajectory & Deliverable Velocity.
   - Idle Solutions & Unassigned License Analysis with SOW Promo action.
   - Datacenter Server Racks & PUE/Thermal Compliance telemetry.

2. **Service Billing & Procurement Terminal (POS)**:
   - High-throughput billing terminal for IT solutions, software licenses, hardware kits, and consulting retainer SOWs.
   - Hotkey navigation (`F1` for Dashboard, `F2` for POS, `Esc` to close workspaces/modals).
   - Corporate client lookup & SLA tier discounting (Platinum, Gold, Silver).
   - Tax Invoice / Mushak-6.3 generation with SLA credit statements.

3. **Datacenter Infrastructure & Planogram**:
   - 42U Server Rack layout, U-space allocation, and PUE/temperature sensor monitoring.
   - Hardware Staging Vaults and component management.

4. **Hardware RMA, Defective Assets & Vendor Claims**:
   - Defect triage, vendor warranty claims, serial number tracing.

5. **Hardware Diagnostics & Lab Bench**:
   - Firmware reflash, BIOS calibration, burn-in load testing.

6. **Datacenter Asset Audit & Cycle Count**:
   - Barcode/RFID physical hardware count, discrepancies ledger, decommission audits.

7. **AuraBI Practice Profitability**:
   - Practice gross margin matrix, hourly billing velocity, SKU turnover Pareto analysis.
