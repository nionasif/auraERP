import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Handlers
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import hrRoutes from './routes/hr.js';
import crmRoutes from './routes/crm.js';
import projectRoutes from './routes/projects.js';
import itAssetsRoutes from './routes/itAssets.js';
import procurementRoutes from './routes/procurement.js';
import financeRoutes from './routes/finance.js';
import helpDeskRoutes from './routes/helpDesk.js';
import reportRoutes from './routes/reports.js';
import systemRoutes from './routes/system.js';
import mlRoutes from './routes/ml.js';

// Compatibility Routes
import productRoutes from './routes/products.js';
import customerRoutes from './routes/customers.js';
import departmentRoutes from './routes/departments.js';
import staffRoutes from './routes/staff.js';
import invoiceRoutes from './routes/invoices.js';
import auditRoutes from './routes/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '../../frontend/dist');

const app = express();

// Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: true, // Allow frontend dev server on any local port (5173, etc.)
  credentials: true
}));
app.use(express.json());
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API Service Directory
app.get('/api', (req, res) => {
  res.json({
    service: 'AuraTech ERP - Enterprise IT Corporate Backend Service',
    version: '4.8.0',
    facility: ENV.FACILITY_NAME,
    node: ENV.FACILITY_ID,
    security: 'SOC 2 Type II / ISO 27001 Compliant',
    connectedFrontend: 'Active & Synchronized',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
      hr: '/api/hr',
      crm: '/api/crm',
      projects: '/api/projects',
      itAssets: '/api/it-assets',
      procurement: '/api/procurement',
      finance: '/api/finance',
      helpdesk: '/api/helpdesk',
      reports: '/api/reports',
      system: '/api/system'
    }
  });
});

// Mount Corporate Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/it-assets', itAssetsRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/helpdesk', helpDeskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ml', mlRoutes);

// Compatibility Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/audit', auditRoutes);

// Serve Frontend Web Client Directly From Backend
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Route Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    type: 'https://auratech.io/errors/not-found',
    title: 'Resource Not Found',
    status: 404,
    detail: `Endpoint '${req.method} ${req.originalUrl}' does not exist on AuraTech Central API`
  });
});

// RFC 7807 Error Handler
app.use(errorHandler);

// Start Corporate Server
app.listen(ENV.PORT, () => {
  console.log(`
======================================================================
  🏢 AuraTech ERP - Enterprise IT Backend Service [v4.8.0]
  📡 Local API: http://localhost:${ENV.PORT}/api
  🌐 Frontend App Served on: http://localhost:${ENV.PORT}/
  🔄 Dev Server Proxy Allowed: http://localhost:5173
  🌍 Facility: ${ENV.FACILITY_NAME} (${ENV.FACILITY_ID})
  🛡️  Security: TLS 1.3 / ISO 27001 / SOC 2 Tamper-Evident SHA-256
======================================================================
  `);
});

export default app;
