import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const assetsCSV = `Asset ID,Asset Type,Assigned Department,Usage (Avg Hours/Week),Utilization (%),Purchase Date,Purchase Cost (USD),Maintenance Count,Last Maintenance Date,Total Maintenance Cost (USD),Condition
AST0001,UPS,IT Operations,26,40,2021-06-27,520,11,2023-08-25,2200,Needs Replacement
AST0002,Software License,Human Resources,49,67,2025-05-21,1290,3,2026-07-27,78,Needs Replacement
AST0003,Software License,Sales & Marketing,24,73,2021-03-12,1210,0,,0,Needs Replacement
AST0004,Firewall,Human Resources,137,70,2022-10-23,1860,2,2026-01-13,72,Fair
AST0005,Monitor,Finance & Accounts,50,87,2025-01-27,400,0,,0,Good
AST0006,Software License,Sales & Marketing,39,45,2023-03-24,1780,0,,0,Needs Replacement
AST0007,Software License,Human Resources,31,78,2020-08-08,3470,0,,0,Needs Replacement
AST0008,Network Switch,IT Operations,125,98,2024-02-15,2400,6,2024-08-31,1020,Good
AST0009,Cloud Subscription,IT Operations,122,67,2021-12-27,680,10,2024-07-25,1550,Needs Replacement
AST0010,Server,Engineering,142,58,2021-10-21,10530,9,2023-11-14,360,Fair
AST0011,Server,Human Resources,138,44,2023-08-14,9010,0,,0,Good
AST0012,Software License,Finance & Accounts,19,69,2022-06-19,3190,2,2023-11-23,464,Needs Replacement
AST0013,Software License,Engineering,37,70,2026-01-08,1460,1,2026-07-11,170,Fair
AST0014,Network Switch,Project Management,101,80,2025-12-12,610,1,2026-06-07,248,Good
AST0015,Network Switch,IT Operations,141,44,2022-09-25,610,0,,0,Fair
AST0016,Software License,Finance & Accounts,38,89,2023-03-04,2150,0,,0,Needs Replacement
AST0017,Cloud Subscription,IT Operations,124,64,2025-06-16,930,0,,0,Needs Replacement
AST0018,Software License,Engineering,28,74,2020-01-31,2750,10,2024-03-12,2370,Needs Replacement
AST0019,Desktop,Project Management,42,42,2022-04-22,1170,8,2023-11-11,256,Fair
AST0020,Cloud Subscription,IT Operations,106,34,2023-09-20,1300,0,,0,Needs Replacement
AST0021,Software License,Project Management,29,83,2020-10-15,1910,9,2025-04-08,2169,Needs Replacement
AST0022,Monitor,Human Resources,22,58,2020-03-10,390,6,2026-08-06,312,Needs Replacement
AST0023,Printer,Engineering,19,54,2026-07-26,310,0,,0,Good
AST0024,Mobile Test Device,Project Management,43,84,2020-12-20,610,4,2026-09-15,140,Needs Replacement
AST0025,Cloud Subscription,IT Operations,150,78,2021-10-02,1830,8,2026-07-22,744,Needs Replacement
AST0026,Firewall,IT Operations,118,34,2024-03-08,1440,0,,0,Good
AST0027,Mobile Test Device,Sales & Marketing,49,60,2026-09-09,450,0,,0,Good
AST0028,Network Switch,IT Operations,120,65,2024-08-17,800,5,2026-05-10,745,Good
AST0029,Network Switch,IT Operations,106,92,2021-04-14,2980,2,2025-08-02,114,Fair
AST0030,Firewall,IT Operations,162,34,2020-10-02,5750,4,2025-01-01,340,Needs Replacement
AST0031,UPS,IT Operations,19,80,2022-08-18,650,1,2026-06-16,176,Fair
AST0032,Printer,IT Operations,51,58,2026-07-20,460,0,,0,Good
AST0033,Router,IT Operations,128,61,2021-11-21,320,0,,0,Fair
AST0034,Server,IT Operations,145,42,2023-09-20,14850,7,2026-06-13,525,Good
AST0035,Server,IT Operations,168,77,2020-12-01,12770,4,2023-06-04,116,Fair
AST0036,Software License,Finance & Accounts,52,95,2020-05-07,1740,13,2026-04-23,1664,Needs Replacement
AST0037,Laptop,Finance & Accounts,49,37,2026-03-09,1250,1,2026-05-05,168,Good
AST0038,Server,IT Operations,150,73,2025-03-18,9090,4,2025-03-28,568,Good
AST0039,Mobile Test Device,IT Operations,43,80,2021-11-10,790,8,2023-10-27,2136,Needs Replacement
AST0040,Monitor,Project Management,46,87,2020-06-14,250,3,2024-06-25,627,Needs Replacement
AST0041,Network Switch,IT Operations,146,37,2020-06-24,2680,10,2023-03-23,1850,Needs Replacement
AST0042,Desktop,Project Management,32,94,2025-11-05,1250,2,2026-03-19,596,Good
AST0044,Router,IT Operations,144,87,2022-07-01,490,8,2025-09-14,184,Fair
AST0048,Server,IT Operations,107,53,2025-09-30,6330,0,,0,Good`;

const salesCSV = `Sale ID,Sale Date,Service Type,Customer ID,Customer Name,Unit Contract Value (USD),Quantity of Services Sold,Revenue (USD)
SAL0001,2023-01-06,DevOps Consulting,CUS018,Apex Properties,19800,1,19800
SAL0002,2023-03-08,ERP Implementation,CUS010,Zenith Industries,58700,1,58700
SAL0003,2023-04-24,Cloud Migration,CUS032,Meghna Properties,42000,1,42000
SAL0004,2023-05-07,Cloud Migration,CUS052,Nova Properties,73400,1,73400
SAL0005,2023-05-08,IT Support (AMC),CUS013,Delta Retail,12500,1,12500
SAL0006,2023-06-01,AI/ML Solutions,CUS013,Delta Retail,44600,2,89200
SAL0007,2023-06-02,ERP Implementation,CUS066,Nova Logistics,55900,1,55900
SAL0008,2023-06-05,Cybersecurity Audit,CUS005,Nova Textiles,17000,2,34000
SAL0009,2023-06-15,Web Development,CUS070,Silver Holdings,20100,1,20100
SAL0010,2023-06-23,AI/ML Solutions,CUS069,Jamuna Foods,31900,1,31900
SAL0011,2023-07-09,Web Development,CUS018,Apex Properties,20100,1,20100
SAL0012,2023-07-15,Web Development,CUS070,Silver Holdings,36800,1,36800
SAL0013,2023-07-30,Cloud Migration,CUS001,Unity Telecom,22500,1,22500
SAL0014,2023-08-01,UI/UX Design,CUS066,Nova Logistics,10300,1,10300
SAL0015,2023-08-03,Cloud Migration,CUS052,Nova Properties,77500,1,77500
SAL0016,2023-08-20,Data Analytics & BI,CUS054,Delta Holdings,26800,1,26800
SAL0017,2023-08-29,Cybersecurity Audit,CUS001,Unity Telecom,23400,1,23400
SAL0018,2023-09-04,Mobile App Development,CUS023,Silver Hospital,34900,1,34900
SAL0019,2023-09-11,Web Development,CUS011,Metro Media,14000,1,14000
SAL0020,2023-09-19,Cybersecurity Audit,CUS039,Nova Holdings,23900,2,47800
SAL0021,2023-10-01,IT Support (AMC),CUS001,Unity Telecom,15700,1,15700
SAL0022,2023-10-05,UI/UX Design,CUS016,Green Mart,20000,1,20000
SAL0023,2023-10-09,Cloud Migration,CUS034,Blue University,57200,1,57200
SAL0024,2023-10-09,Mobile App Development,CUS045,Crest Properties,45300,1,45300
SAL0025,2023-10-12,Web Development,CUS060,Vertex Textiles,8200,1,8200
SAL0026,2023-10-15,DevOps Consulting,CUS061,Bengal Group,19600,1,19600
SAL0027,2023-10-18,Mobile App Development,CUS045,Crest Properties,48100,1,48100
SAL0028,2023-10-23,Cybersecurity Audit,CUS001,Unity Telecom,12500,2,25000
SAL0029,2023-10-29,DevOps Consulting,CUS017,Meghna Pharma,30500,1,30500
SAL0030,2023-10-30,DevOps Consulting,CUS003,Alpha University,23000,1,23000
SAL0031,2023-11-04,IT Support (AMC),CUS013,Delta Retail,5900,5,29500
SAL0032,2023-11-06,Cybersecurity Audit,CUS018,Apex Properties,16100,1,16100
SAL0033,2023-11-06,AI/ML Solutions,CUS051,Pioneer Properties,29300,1,29300
SAL0034,2023-11-12,Cybersecurity Audit,CUS018,Apex Properties,17400,2,34800
SAL0035,2023-11-15,Mobile App Development,CUS054,Delta Holdings,42400,1,42400
SAL0036,2023-11-22,AI/ML Solutions,CUS012,Meghna Hospital,48200,1,48200
SAL0037,2023-11-23,Mobile App Development,CUS045,Crest Properties,45800,1,45800
SAL0038,2023-12-17,Data Analytics & BI,CUS003,Alpha University,27400,1,27400
SAL0039,2024-01-01,Mobile App Development,CUS063,Prime Group,46900,1,46900
SAL0040,2024-01-12,UI/UX Design,CUS024,Green Foods,19100,1,19100`;

const invoicesCSV = `Invoice ID,Sale ID,Customer ID,Invoice Date,Revenue (USD),Expenses (USD),Tax - VAT 15% (USD),Total Invoice Amount (USD),Payments Received (USD),Payment Status
INV0001,SAL0001,CUS018,2023-01-09,19800,11608.01,2970.0,22770.0,22770.0,Paid
INV0002,SAL0002,CUS010,2023-03-15,58700,36680.01,8805.0,67505.0,67505.0,Paid
INV0003,SAL0003,CUS032,2023-04-25,42000,28151.86,6300.0,48300.0,48300.0,Paid
INV0004,SAL0004,CUS052,2023-05-14,73400,52756.94,11010.0,84410.0,84410.0,Paid
INV0005,SAL0005,CUS013,2023-05-14,12500,6328.92,1875.0,14375.0,14375.0,Paid
INV0006,SAL0006,CUS013,2023-06-15,89200,61510.34,13380.0,102580.0,70814.65,Partial
INV0007,SAL0007,CUS066,2023-06-14,55900,30993.53,8385.0,64285.0,64285.0,Paid
INV0008,SAL0008,CUS005,2023-06-06,34000,25648.41,5100.0,39100.0,39100.0,Paid
INV0009,SAL0009,CUS070,2023-06-19,20100,14079.44,3015.0,23115.0,23115.0,Paid
INV0010,SAL0010,CUS069,2023-07-05,31900,19280.13,4785.0,36685.0,36685.0,Paid
INV0011,SAL0011,CUS018,2023-07-20,20100,11783.9,3015.0,23115.0,23115.0,Paid
INV0012,SAL0012,CUS070,2023-07-17,36800,20622.52,5520.0,42320.0,0.0,Overdue
INV0013,SAL0013,CUS001,2023-08-12,22500,16313.22,3375.0,25875.0,25875.0,Paid
INV0014,SAL0014,CUS066,2023-08-14,10300,7251.3,1545.0,11845.0,11845.0,Paid
INV0015,SAL0015,CUS052,2023-08-05,77500,41866.97,11625.0,89125.0,89125.0,Paid
INV0016,SAL0016,CUS054,2023-08-30,26800,13896.13,4020.0,30820.0,18567.37,Partial
INV0017,SAL0017,CUS001,2023-08-31,23400,11743.37,3510.0,26910.0,26910.0,Paid
INV0018,SAL0018,CUS023,2023-09-12,34900,21500.63,5235.0,40135.0,40135.0,Paid
INV0019,SAL0019,CUS011,2023-09-15,14000,7781.09,2100.0,16100.0,16100.0,Paid
INV0020,SAL0020,CUS039,2023-09-28,47800,31312.95,7170.0,54970.0,54970.0,Paid
INV0021,SAL0021,CUS001,2023-10-10,15700,11518.84,2355.0,18055.0,18055.0,Paid
INV0022,SAL0022,CUS016,2023-10-19,20000,11257.31,3000.0,23000.0,23000.0,Paid
INV0023,SAL0023,CUS034,2023-10-13,57200,32807.04,8580.0,65780.0,41684.6,Partial
INV0024,SAL0024,CUS045,2023-10-24,45300,24225.06,6795.0,52095.0,52095.0,Paid
INV0025,SAL0025,CUS060,2023-10-21,8200,5057.79,1230.0,9430.0,9430.0,Paid
INV0026,SAL0026,CUS061,2023-10-22,19600,9956.09,2940.0,22540.0,22540.0,Paid
INV0027,SAL0027,CUS045,2023-11-02,48100,37441.68,7215.0,55315.0,55315.0,Paid
INV0028,SAL0028,CUS001,2023-11-03,25000,16567.46,3750.0,28750.0,28750.0,Paid
INV0029,SAL0029,CUS017,2023-11-06,30500,20613.09,4575.0,35075.0,35075.0,Paid
INV0030,SAL0030,CUS003,2023-11-02,23000,13903.42,3450.0,26450.0,26450.0,Paid
INV0031,SAL0031,CUS013,2023-11-04,29500,21732.01,4425.0,33925.0,33925.0,Paid
INV0032,SAL0032,CUS018,2023-11-07,16100,8708.79,2415.0,18515.0,18515.0,Paid
INV0033,SAL0033,CUS051,2023-11-10,29300,17581.99,4395.0,33695.0,33695.0,Paid
INV0034,SAL0034,CUS018,2023-11-23,34800,21487.74,5220.0,40020.0,0.0,Overdue
INV0035,SAL0035,CUS054,2023-11-26,42400,21778.34,6360.0,48760.0,48760.0,Paid
INV0036,SAL0036,CUS012,2023-11-24,48200,31035.14,7230.0,55430.0,55430.0,Paid
INV0037,SAL0037,CUS045,2023-11-28,45800,32706.38,6870.0,52670.0,52670.0,Paid
INV0038,SAL0038,CUS003,2023-12-22,27400,17871.36,4110.0,31510.0,0.0,Overdue
INV0039,SAL0039,CUS063,2024-01-10,46900,27014.8,7035.0,53935.0,53935.0,Paid
INV0040,SAL0040,CUS024,2024-01-23,19100,10062.52,2865.0,21965.0,21965.0,Paid`;

const poCSV = `PO ID,Vendor,Purchase Date,Item / Service,Cost (USD),Delivery Time (Days),Purchase Status
PO0001,Grameenphone Business,2023-01-24,Internet Bandwidth,2270,21.0,Delivered
PO0002,Office Supplies BD,2023-01-25,Stationery,580,9.0,Delivered
PO0003,Ryans Computers,2023-01-30,Peripherals,2740,6.0,Delivered
PO0004,HP Bangladesh,2023-02-02,Printers,2140,34.0,Delivered
PO0005,Office Supplies BD,2023-02-03,Furniture,2360,6.0,Delivered
PO0006,Amazon Web Services,2023-02-08,Cloud Credits,17020,3.0,Delivered
PO0007,Office Supplies BD,2023-03-02,Stationery,770,29.0,Delivered
PO0008,Lenovo,2023-03-05,Desktops,17530,27.0,Delivered
PO0009,Dell Technologies,2023-03-08,Laptops,20250,22.0,Delivered
PO0010,JetBrains,2023-03-10,IDE Licenses,4470,,Cancelled
PO0011,Atlassian,2023-03-28,Jira/Confluence Licenses,5150,4.0,Delivered
PO0012,Microsoft,2023-04-07,Azure Credits,12490,5.0,Delivered
PO0013,Amazon Web Services,2023-04-11,Cloud Credits,17030,1.0,Delivered
PO0014,Lenovo,2023-04-21,Laptops,15750,21.0,Delivered
PO0015,Star Tech,2023-04-22,Laptops,9940,10.0,Delivered
PO0016,Google Cloud,2023-04-22,Cloud Credits,12410,6.0,Delivered
PO0017,Amazon Web Services,2023-04-24,Cloud Credits,10400,2.0,Delivered
PO0018,Ryans Computers,2023-05-06,UPS,3610,11.0,Delivered
PO0019,Office Supplies BD,2023-05-08,Furniture,500,6.0,Delivered
PO0020,Office Supplies BD,2023-06-14,Furniture,4060,21.0,Delivered
PO0021,Dell Technologies,2023-06-15,Servers,37490,14.0,Delivered
PO0022,Amazon Web Services,2023-06-15,Cloud Credits,18920,6.0,Delivered
PO0023,JetBrains,2023-06-27,IDE Licenses,5280,8.0,Delivered
PO0024,Ryans Computers,2023-07-05,Monitors,2260,10.0,Delivered
PO0025,Cisco Systems,2023-07-05,Routers,1070,22.0,Delivered
PO0026,Star Tech,2023-07-31,Laptops,29140,7.0,Delivered
PO0027,Slack Technologies,2023-08-05,Collaboration Licenses,2590,2.0,Delivered
PO0028,Fortinet,2023-08-12,Firewalls,8290,8.0,Delivered
PO0029,HP Bangladesh,2023-08-12,Laptops,13970,14.0,Delivered
PO0030,JetBrains,2023-08-13,IDE Licenses,2020,1.0,Delivered
PO0031,Grameenphone Business,2023-08-16,Internet Bandwidth,2470,19.0,Delivered
PO0032,Amazon Web Services,2023-08-17,Cloud Credits,17160,3.0,Delivered
PO0033,Amazon Web Services,2023-08-18,Cloud Credits,19890,1.0,Delivered
PO0034,Cisco Systems,2023-08-31,Network Switches,9110,10.0,Delivered
PO0035,Ryans Computers,2023-09-03,Peripherals,1320,11.0,Delivered
PO0036,Office Supplies BD,2023-09-06,Furniture,2330,25.0,Delivered
PO0037,Slack Technologies,2023-09-11,Collaboration Licenses,3460,8.0,Delivered
PO0038,Grameenphone Business,2023-09-17,Leased Line,4380,20.0,Delivered
PO0039,Fortinet,2023-09-23,Security Subscriptions,5920,8.0,Delivered
PO0040,Lenovo,2023-09-27,Laptops,31030,,Cancelled`;

const ticketsCSV = `Ticket ID,Created Date,Customer ID,Issue Category,Priority,Assigned Agent (Employee ID),Response Time (Minutes),Resolution Time (Hours),Status
TKT0001,1/11/2023,CUS050,Training / How-to,Medium,EMP003,82,30,Closed
TKT0002,1/14/2023,CUS060,Training / How-to,Low,EMP032,893,146,Resolved
TKT0003,1/15/2023,CUS048,Server Downtime,High,EMP058,80,30,Closed
TKT0004,1/16/2023,CUS052,Training / How-to,Medium,EMP029,186,83,Closed
TKT0005,1/20/2023,CUS039,Access / Login Issue,Medium,EMP029,175,69,Closed
TKT0006,1/20/2023,CUS001,Billing Query,Medium,EMP050,310,66,Closed
TKT0007,1/20/2023,CUS063,Feature Request,Low,EMP029,433,160,Closed
TKT0008,1/22/2023,CUS001,Performance Issue,Medium,EMP031,297,78,Resolved
TKT0009,1/25/2023,CUS063,Access / Login Issue,Medium,EMP031,136,66,Closed
TKT0010,1/27/2023,CUS069,Data / Report Issue,Medium,EMP058,267,69,Closed
TKT0011,1/31/2023,CUS050,Data / Report Issue,High,EMP031,27,10,Resolved
TKT0012,2/5/2023,CUS063,Feature Request,Low,EMP031,351,233,Closed
TKT0013,2/6/2023,CUS060,Feature Request,Low,EMP031,580,83,Closed
TKT0014,2/18/2023,CUS054,Performance Issue,Medium,EMP029,165,85,Resolved
TKT0015,2/20/2023,CUS001,Software Bug,High,EMP003,65,34,Closed
TKT0016,3/2/2023,CUS024,Software Bug,High,EMP029,53,29,Resolved
TKT0017,3/2/2023,CUS063,Security Concern,High,EMP031,68,10,Closed
TKT0018,3/6/2023,CUS048,Feature Request,Low,EMP050,524,107,Closed
TKT0019,3/20/2023,CUS034,Access / Login Issue,Low,EMP028,505,88,Closed
TKT0020,3/20/2023,CUS018,Feature Request,Low,EMP029,507,185,Closed
TKT0021,3/28/2023,CUS024,Access / Login Issue,Low,EMP050,889,98,Closed
TKT0022,4/15/2023,CUS050,Access / Login Issue,Medium,EMP058,117,59,Closed
TKT0023,5/2/2023,CUS060,Software Bug,Medium,EMP003,91,46,Closed
TKT0024,5/12/2023,CUS001,Server Downtime,High,EMP029,117,9,Closed
TKT0025,5/19/2023,CUS013,Software Bug,Low,EMP031,278,210,Resolved
TKT0026,5/27/2023,CUS060,Server Downtime,High,EMP031,62,14,Resolved
TKT0027,6/6/2023,CUS061,Network Issue,Low,EMP028,851,77,Closed
TKT0028,6/16/2023,CUS070,Server Downtime,High,EMP032,109,34,Closed
TKT0029,6/19/2023,CUS039,Feature Request,Medium,EMP028,202,36,Resolved
TKT0030,6/21/2023,CUS001,Performance Issue,Low,EMP032,189,67,Closed
TKT0031,6/28/2023,CUS005,Training / How-to,Medium,EMP028,100,25,Closed
TKT0032,7/2/2023,CUS060,Software Bug,Low,EMP058,460,200,Closed
TKT0033,7/3/2023,CUS060,Software Bug,Low,EMP050,514,138,Resolved
TKT0034,7/11/2023,CUS034,Access / Login Issue,Medium,EMP003,150,40,Closed
TKT0035,7/11/2023,CUS070,Software Bug,Critical,EMP032,22,9,Closed
TKT0036,7/14/2023,CUS010,Feature Request,Medium,EMP032,128,58,Closed
TKT0037,7/15/2023,CUS011,Access / Login Issue,Medium,EMP029,181,80,Resolved
TKT0038,7/23/2023,CUS016,Training / How-to,Low,EMP028,196,197,Resolved
TKT0039,7/25/2023,CUS069,Network Issue,High,EMP032,21,25,Closed
TKT0040,7/26/2023,CUS069,Performance Issue,Low,EMP032,594,140,Closed`;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const values = [];
    let match;
    while ((match = regex.exec(line)) !== null && values.length < headers.length) {
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      values.push(val.trim());
      if (regex.lastIndex >= line.length) break;
    }

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
}

// Read current database
const dbPath = path.join(ROOT_DIR, 'backend', 'src', 'data', 'database.json');
const currentDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Build lookup maps
const clientsMap = {};
(currentDB.clients || []).forEach(c => {
  clientsMap[c.id] = c.companyName || c.name;
});

const employeeNamesMap = {};
(currentDB.employees || []).forEach(e => {
  employeeNamesMap[e.employee_id || e.id] = e.full_name || e.name;
});

// Fallback employee names
employeeNamesMap['EMP003'] = 'Farhana Siddique';
employeeNamesMap['EMP028'] = 'Tasnim Das';
employeeNamesMap['EMP029'] = 'Nabila Sarker';
employeeNamesMap['EMP031'] = 'Rafiq Roy B';
employeeNamesMap['EMP032'] = 'Rumana Hossain';
employeeNamesMap['EMP050'] = 'Jannat Hossain';
employeeNamesMap['EMP058'] = 'Sadia Mia';

// 1. Process Assets -> itAssets & softwareLicenses
const rawAssets = parseCSV(assetsCSV);
const itAssets = [];
const softwareLicenses = [];

rawAssets.forEach(a => {
  const assetType = a['Asset Type'];
  const costUSD = Number(a['Purchase Cost (USD)']) || 1000;
  const costBDT = costUSD * 120;
  const util = Number(a['Utilization (%)']) || 70;

  if (assetType === 'Software License' || assetType === 'Cloud Subscription') {
    softwareLicenses.push({
      id: a['Asset ID'],
      name: `${a['Assigned Department']} ${assetType} Enterprise`,
      publisher: a['Assigned Department'] === 'Engineering' ? 'JetBrains / GitHub' :
                 a['Assigned Department'] === 'IT Operations' ? 'AWS / Microsoft Azure' :
                 a['Assigned Department'] === 'Finance & Accounts' ? 'SAP / Oracle Finance' : 'Atlassian & Slack',
      type: assetType === 'Cloud Subscription' ? 'Cloud_Compute_PaaS' : 'Enterprise_SaaS',
      totalSeats: Math.max(25, util),
      allocatedSeats: Math.round(util * 0.9),
      renewalDate: '2026-12-31',
      annualCostBDT: costBDT,
      status: a.Condition === 'Needs Replacement' ? 'RENEWAL_DUE' : 'ACTIVE'
    });
  } else {
    const oem = assetType === 'Server' ? 'Dell Technologies' :
                assetType === 'Network Switch' ? 'Cisco Systems' :
                assetType === 'Firewall' ? 'Fortinet Security' :
                assetType === 'Router' ? 'Cisco Systems' :
                assetType === 'UPS' ? 'APC Smart-UPS' :
                assetType === 'Printer' ? 'HP Enterprise' :
                assetType === 'Laptop' ? 'Lenovo ThinkPad' : 'Dell Precision';

    itAssets.push({
      id: a['Asset ID'],
      assetTag: `AT-${a['Asset ID']}`,
      serialNumber: `SN-${a['Asset ID']}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${oem} ${assetType}`,
      category: assetType,
      specs: `Department: ${a['Assigned Department']} | Weekly Usage: ${a['Usage (Avg Hours/Week)']}h | Utilization: ${util}%`,
      facility: 'DC01 Silicon Tower',
      rackLocation: `Row-B Rack-${(itAssets.length % 8) + 1}`,
      status: a.Condition === 'Needs Replacement' ? 'MAINTENANCE_STANDBY' : 'OPERATIONAL_LIVE',
      oemVendor: oem,
      purchasePriceBDT: costBDT,
      warrantyExpiry: '2027-12-31',
      lastDiagnostics: a['Last Maintenance Date'] || '2026-08-01',
      healthScore: util
    });
  }
});

// 2. Process Sales and Invoices
const rawSales = parseCSV(salesCSV);
const salesMap = {};
rawSales.forEach(s => {
  salesMap[s['Sale ID']] = s;
});

const rawInvoices = parseCSV(invoicesCSV);
const invoices = rawInvoices.map((inv, idx) => {
  const sale = salesMap[inv['Sale ID']] || {};
  const cName = clientsMap[inv['Customer ID']] || sale['Customer Name'] || 'Enterprise Client';
  const revUSD = Number(inv['Revenue (USD)']) || 20000;
  const revBDT = revUSD * 120;
  const vatUSD = Number(inv['Tax - VAT 15% (USD)']) || (revUSD * 0.15);
  const vatBDT = vatUSD * 120;
  const totalUSD = Number(inv['Total Invoice Amount (USD)']) || (revUSD + vatUSD);
  const totalBDT = totalUSD * 120;
  const paidUSD = Number(inv['Payments Received (USD)']) || 0;
  const paidBDT = paidUSD * 120;
  const serviceType = sale['Service Type'] || 'Enterprise IT Solutions';

  const statusRaw = (inv['Payment Status'] || 'Paid').toUpperCase();
  const paymentStatus = statusRaw === 'PAID' ? 'PAID' : statusRaw === 'PARTIAL' ? 'PARTIAL' : statusRaw === 'OVERDUE' ? 'OVERDUE' : 'UNPAID';

  return {
    id: inv['Invoice ID'],
    invoiceNo: inv['Invoice ID'],
    invoiceNumber: inv['Invoice ID'],
    mushakChallanNo: `NBR-6.3-2024-${1000 + idx}`,
    saleId: inv['Sale ID'],
    clientId: inv['Customer ID'],
    clientName: cName,
    customerName: cName,
    date: inv['Invoice Date'],
    issueDate: inv['Invoice Date'],
    time: '11:00 AM',
    outletId: 'DC01',
    outletName: 'Silicon Tower Tech Hub & Cloud Data Center',
    registerNo: 901,
    cashierId: 'USR-001',
    cashierName: 'System Administrator',
    customer: {
      name: cName,
      tier: 'PLATINUM',
      pointsEarned: Math.floor(revUSD * 0.1),
      pointsUsed: 0
    },
    items: [
      {
        barcode: `SRV-${(sale['Service Type'] || 'ENG').slice(0, 3).toUpperCase()}`,
        name: `${serviceType} Enterprise Delivery`,
        size: 'Enterprise SLA',
        qty: Number(sale['Quantity of Services Sold']) || 1,
        unitPrice: revBDT,
        discount: 0,
        total: revBDT
      }
    ],
    subtotal: revBDT,
    subtotalBDT: revBDT,
    discountTotal: 0,
    corporateDiscountBDT: 0,
    vatRate: 0.15,
    vatAmount: vatBDT,
    vatAmountBDT: vatBDT,
    bagCharge: 0,
    grandTotal: totalBDT,
    totalPayableBDT: totalBDT,
    paymentsReceivedBDT: paidBDT,
    paymentMethod: 'Corporate RTGS Wire',
    paymentStatus,
    status: paymentStatus === 'PAID' ? 'COMPLETED' : paymentStatus === 'OVERDUE' ? 'OVERDUE' : 'PENDING',
    transactionRef: `TXN-RTGS-${Math.floor(100000 + Math.random() * 900000)}`,
    issuedBy: 'Rafiqul Islam (CFO)',
    createdAt: `${inv['Invoice Date']}T11:00:00.000Z`
  };
});

// 3. Process Purchase Orders & Vendors
const rawPOs = parseCSV(poCSV);
const vendorsMap = new Map();

const purchaseOrders = rawPOs.map((po, idx) => {
  const vName = po.Vendor;
  const costUSD = Number(po['Cost (USD)']) || 5000;
  const costBDT = costUSD * 120;
  const pDate = po['Purchase Date'];
  const deliveryDays = Number(po['Delivery Time (Days)']) || 14;

  const expectedDate = new Date(new Date(pDate).getTime() + deliveryDays * 24 * 3600 * 1000).toISOString().split('T')[0];
  const vCode = `VND-${vName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)}`;

  // Record vendor
  if (!vendorsMap.has(vName)) {
    vendorsMap.set(vName, {
      id: vCode,
      code: vCode,
      name: vName,
      category: po['Item / Service'].includes('Cloud') ? 'Cloud Infrastructure Provider' :
                po['Item / Service'].includes('License') ? 'Software & SaaS Publisher' :
                po['Item / Service'].includes('Bandwidth') || po['Item / Service'].includes('Line') ? 'Telecom & ISP' :
                'OEM Hardware & Datacenter Gear',
      contactPerson: `${vName} Key Account Manager`,
      email: `orders@${vName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: `+880-2-${Math.floor(8000000 + Math.random() * 1000000)}`,
      address: 'Dhaka Commercial Zone, Bangladesh',
      taxId: `BIN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      binNo: `00${Math.floor(100000000 + Math.random() * 900000000)}-0101`,
      paymentTerms: 'NET_30',
      status: 'ACTIVE',
      rating: 4.8,
      notes: `Official OEM partner for ${po['Item / Service']}`,
      createdAt: pDate
    });
  }

  const pStatus = po['Purchase Status'] === 'Delivered' ? 'RECEIVED' : 'CANCELLED';

  return {
    id: po['PO ID'],
    poNumber: po['PO ID'],
    vendorId: vCode,
    vendorName: vName,
    vendorCode: vCode,
    issuedDate: pDate,
    items: [
      {
        id: `item-${idx + 1}`,
        itemName: `${po['Item / Service']} Enterprise Supply`,
        sku: `SKU-${po['Item / Service'].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}`,
        specs: 'High Availability Commercial Spec',
        quantity: 1,
        unitPriceBDT: costBDT,
        totalBDT: costBDT
      }
    ],
    totalAmountBDT: costBDT,
    priority: costUSD >= 20000 ? 'CRITICAL' : costUSD >= 10000 ? 'URGENT' : 'NORMAL',
    status: pStatus,
    deliveryLocation: 'Silicon Tower DC01, Dhaka',
    approvedBy: 'Kamal Hossain (Procurement Manager)',
    expectedDelivery: expectedDate,
    notes: `Procured for Datacenter & Engineering delivery`,
    grnNumber: pStatus === 'RECEIVED' ? `GRN-2024-${100 + idx}` : null,
    createdAt: `${pDate}T09:00:00.000Z`
  };
});

const vendors = Array.from(vendorsMap.values());

// 4. Process Help Desk Tickets
const rawTickets = parseCSV(ticketsCSV);
const helpDeskTickets = rawTickets.map(t => {
  const cName = clientsMap[t['Customer ID']] || 'Enterprise Corporate Client';
  const prio = t.Priority === 'Critical' ? 'P1_CRITICAL' :
               t.Priority === 'High' ? 'P2_HIGH' :
               t.Priority === 'Medium' ? 'P3_MEDIUM' : 'P4_LOW';

  const assignedName = employeeNamesMap[t['Assigned Agent (Employee ID)']] || 'Support Specialist';
  const resHours = Number(t['Resolution Time (Hours)']) || 24;
  const slaTarget = prio === 'P1_CRITICAL' ? 120 : prio === 'P2_HIGH' ? 480 : prio === 'P3_MEDIUM' ? 1440 : 2880;

  // Format date to ISO
  const parts = t['Created Date'].split('/');
  const dateFormatted = parts.length === 3 ? `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}` : '2024-01-15';

  return {
    id: t['Ticket ID'],
    ticketNumber: `INC-${t['Ticket ID']}`,
    title: `${t['Issue Category']} - ${cName}`,
    description: `Incident logged regarding ${t['Issue Category']}. Impacting production workloads. Resolution SLA target: ${resHours}h.`,
    clientId: t['Customer ID'],
    clientName: cName,
    priority: prio,
    category: t['Issue Category'],
    status: t.Status === 'Closed' ? 'CLOSED' : t.Status === 'Resolved' ? 'RESOLVED' : 'IN_PROGRESS',
    reportedAt: `${dateFormatted}T10:00:00.000Z`,
    resolvedAt: t.Status !== 'Open' ? `${dateFormatted}T18:00:00.000Z` : null,
    assignedTo: assignedName,
    slaTargetMinutes: slaTarget,
    actualResolutionMinutes: resHours * 60,
    slaMet: (resHours * 60) <= slaTarget,
    rootCauseAnalysis: t.Status !== 'Open' ? `Resolved after diagnostics on ${t['Issue Category']} endpoints.` : ''
  };
});

// 5. Generate Financial Transactions (Vouchers) from Invoices & POs
const financialTransactions = [];
invoices.slice(0, 20).forEach((inv, i) => {
  financialTransactions.push({
    id: `TXN-INC-${i + 1}`,
    voucherNo: `VCH-INC-${202400 + i}`,
    type: 'INCOME',
    category: 'Client SOW & Consulting Revenue',
    description: `Payment received for Invoice ${inv.invoiceNo} (${inv.clientName})`,
    amountBDT: inv.subtotalBDT,
    paymentMethod: 'RTGS Wire Transfer',
    accountCode: '4010',
    referenceNo: inv.transactionRef,
    date: inv.date,
    recordedBy: 'Rafiqul Islam (CFO)',
    notes: `Settlement for ${inv.clientName}`,
    createdAt: inv.createdAt
  });
});

purchaseOrders.slice(0, 20).forEach((po, i) => {
  financialTransactions.push({
    id: `TXN-EXP-${i + 1}`,
    voucherNo: `VCH-EXP-${202400 + i}`,
    type: 'EXPENSE',
    category: 'Hardware & Infrastructure OPEX',
    description: `Vendor payment for ${po.poNumber} (${po.vendorName})`,
    amountBDT: po.totalAmountBDT,
    paymentMethod: 'Corporate Bank Transfer',
    accountCode: '5010',
    referenceNo: `PO-REF-${po.poNumber}`,
    date: po.issuedDate,
    recordedBy: 'Rafiqul Islam (CFO)',
    notes: `Procurement payment to ${po.vendorName}`,
    createdAt: po.createdAt
  });
});

// Update database.json
currentDB.itAssets = itAssets;
currentDB.softwareLicenses = softwareLicenses;
currentDB.invoices = invoices;
currentDB.purchaseOrders = purchaseOrders;
currentDB.vendors = vendors;
currentDB.helpDeskTickets = helpDeskTickets;
currentDB.financialTransactions = financialTransactions;

fs.writeFileSync(dbPath, JSON.stringify(currentDB, null, 2), 'utf8');

console.log('✅ Successfully seeded extended datasets into backend/src/data/database.json:');
console.log(`   - Hardware Assets: ${itAssets.length}`);
console.log(`   - Software Licenses: ${softwareLicenses.length}`);
console.log(`   - Invoices: ${invoices.length}`);
console.log(`   - Purchase Orders: ${purchaseOrders.length}`);
console.log(`   - Vendors: ${vendors.length}`);
console.log(`   - Help Desk Tickets: ${helpDeskTickets.length}`);
console.log(`   - Financial Transactions: ${financialTransactions.length}`);
