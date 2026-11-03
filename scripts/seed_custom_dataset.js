import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ADMIN_PASSWORD_HASH = '$2a$10$y/7WIXxhjEE7TGlIUmXmSefWrtzkNXJuBVsMElsEgbgnFe8TpYhPu'; // password123

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const usersCSV = `User ID,Employee ID,Username,Email,Role,Department,Account Status,Last Login
USR001,EMP001,sabbir.haque,sabbir.haque@technova.example,Admin,Engineering,Active,2026-10-08
USR002,EMP002,rony.sarker,rony.sarker@technova.example,Employee,Engineering,Active,2026-09-21
USR003,EMP003,farhana.siddique,farhana.siddique@technova.example,Support Agent,Customer Support,Active,2026-09-29
USR004,EMP004,hasan.das,hasan.das@technova.example,Employee,Engineering,Active,2026-10-03
USR005,EMP005,mahmud.khan,mahmud.khan@technova.example,Employee,IT Operations,Inactive,2026-07-23
USR006,EMP006,sharmin.haque,sharmin.haque@technova.example,Employee,IT Operations,Active,2026-09-19
USR007,EMP007,shakil.uddin,shakil.uddin@technova.example,Executive,Management,Active,2026-10-11
USR008,EMP008,mim.karim,mim.karim@technova.example,Employee,Engineering,Active,2026-09-06
USR009,EMP009,anika.islam,anika.islam@technova.example,Employee,Engineering,Active,2026-10-19
USR010,EMP010,shuvo.haque,shuvo.haque@technova.example,Sales Manager,Sales & Marketing,Active,2026-09-20
USR011,EMP011,puja.ahmed,puja.ahmed@technova.example,Employee,Engineering,Active,2026-09-13
USR012,EMP012,puja.mia,puja.mia@technova.example,Finance Manager,Finance & Accounts,Active,2026-09-03
USR013,EMP013,shuvo.islam,shuvo.islam@technova.example,Procurement Officer,Procurement,Active,2026-10-01
USR014,EMP014,nusrat.uddin,nusrat.uddin@technova.example,Sales Manager,Sales & Marketing,Active,2026-10-20
USR015,EMP015,farhana.talukder,farhana.talukder@technova.example,Employee,Engineering,Active,2026-09-27
USR016,EMP016,rumana.rahman,rumana.rahman@technova.example,Executive,Management,Active,2026-10-07
USR017,EMP017,lamia.siddique,lamia.siddique@technova.example,Project Manager,Project Management,Active,2026-10-15
USR018,EMP018,shuvo.uddin,shuvo.uddin@technova.example,Employee,IT Operations,Active,2026-09-10
USR019,EMP019,rumana.haque,rumana.haque@technova.example,Sales Manager,Sales & Marketing,Active,2026-09-01
USR020,EMP020,shirin.rahman,shirin.rahman@technova.example,HR Manager,Human Resources,Active,2026-10-26
USR021,EMP021,rahim.rahman,rahim.rahman@technova.example,Employee,Project Management,Active,2026-09-07
USR022,EMP022,mim.sarker,mim.sarker@technova.example,Employee,Engineering,Active,2026-09-15
USR023,EMP023,sharmin.sarker,sharmin.sarker@technova.example,Employee,Engineering,Active,2026-10-15
USR024,EMP024,mizan.roy,mizan.roy@technova.example,Project Manager,Project Management,Active,2026-09-04
USR025,EMP025,naeem.islam,naeem.islam@technova.example,Sales Manager,Sales & Marketing,Active,2026-10-25
USR026,EMP026,hasan.khan,hasan.khan@technova.example,Employee,Engineering,Active,2026-09-09
USR027,EMP027,rafiq.roy,rafiq.roy@technova.example,Employee,Engineering,Active,2026-10-13
USR028,EMP028,tasnim.das,tasnim.das@technova.example,Support Agent,Customer Support,Active,2026-10-06
USR029,EMP029,nabila.sarker,nabila.sarker@technova.example,Support Agent,Customer Support,Active,2026-10-19
USR030,EMP030,ayesha.chowdhury,ayesha.chowdhury@technova.example,Employee,Engineering,Active,2026-10-10
USR031,EMP031,rafiq.roy.b,rafiq.roy.b@technova.example,Support Agent,Customer Support,Active,2026-10-03
USR032,EMP032,rumana.hossain,rumana.hossain@technova.example,Support Agent,Customer Support,Active,2026-10-06
USR033,EMP033,rumana.uddin,rumana.uddin@technova.example,Employee,Engineering,Active,2026-09-11
USR034,EMP034,sharmin.karim,sharmin.karim@technova.example,Employee,IT Operations,Active,2026-09-17
USR035,EMP035,farhana.chowdhury,farhana.chowdhury@technova.example,Finance Manager,Finance & Accounts,Active,2026-10-24
USR036,EMP036,hasan.haque,hasan.haque@technova.example,Finance Manager,Finance & Accounts,Active,2026-10-20
USR037,EMP037,shuvo.karim,shuvo.karim@technova.example,Employee,Engineering,Active,2026-10-02
USR038,EMP038,tahmina.hossain,tahmina.hossain@technova.example,Project Manager,Project Management,Active,2026-09-18
USR039,EMP039,rafiq.sarker,rafiq.sarker@technova.example,HR Manager,Human Resources,Active,2026-10-16
USR040,EMP040,kamal.uddin,kamal.uddin@technova.example,Executive,Management,Active,2026-09-18
USR057,EMP057,tanvir.roy,tanvir.roy@technova.example,Project Manager,Project Management,Active,2026-09-15`;

const customersCSV = `Customer ID,Customer Name,Industry,First Contract Date,Number of Contracts,Total Contract Value (USD),Services Used,Number of Services Used,Total Interactions,Last Interaction Date,Status
CUS001,Unity Telecom,E-commerce,2022-07-25,3,149200,"Cybersecurity Audit, IT Support (AMC), Cloud Migration",3,21,2026-01-08,Active
CUS002,Star University,Government,2023-07-16,1,47200,DevOps Consulting,1,20,2026-03-06,Active
CUS003,Alpha University,Education,2022-07-30,4,176500,"Data Analytics & BI, UI/UX Design, DevOps Consulting",3,23,2026-04-05,Active
CUS004,Apex Hospital,Media,2024-09-05,1,273400,ERP Implementation,1,33,2026-02-07,Active
CUS005,Nova Textiles,Real Estate,2022-04-20,1,142600,"Mobile App Development, Cybersecurity Audit",2,9,2026-10-13,Active
CUS006,Apex Group,Real Estate,2025-05-05,3,378700,"DevOps Consulting, ERP Implementation",2,30,2026-08-15,Active
CUS007,Global Bank,Education,2024-05-28,1,127600,UI/UX Design,1,8,2026-04-17,Active
CUS008,Alpha Logistics,Government,2025-09-14,1,203800,Cloud Migration,1,14,2025-12-27,Churned
CUS009,Unity Mart,Government,2025-11-12,2,151000,"Web Development, Cybersecurity Audit",2,20,2026-05-25,Active
CUS010,Zenith Industries,E-commerce,2022-05-26,3,184700,"UI/UX Design, Cybersecurity Audit, ERP Implementation",3,9,2026-10-06,Active
CUS011,Metro Media,Real Estate,2023-06-29,3,124400,Web Development,1,12,2026-06-07,Active
CUS012,Meghna Hospital,Government,2023-08-15,2,274400,"AI/ML Solutions, ERP Implementation",2,19,2026-09-14,Active
CUS013,Delta Retail,Media,2022-06-14,2,450400,"IT Support (AMC), AI/ML Solutions",2,3,2026-02-16,Active
CUS014,Meghna Foods,E-commerce,2025-03-24,2,651700,AI/ML Solutions,1,38,2026-01-21,Active
CUS015,Surma Textiles,Government,2024-08-21,2,371100,"AI/ML Solutions, Cloud Migration",2,39,2026-08-12,Active
CUS016,Green Mart,Government,2022-07-06,2,109200,"IT Support (AMC), UI/UX Design",2,8,2026-03-24,Active
CUS017,Meghna Pharma,Manufacturing,2023-08-14,2,162000,"DevOps Consulting, Web Development",2,31,2026-02-15,Active
CUS018,Apex Properties,Real Estate,2022-08-26,5,182300,"DevOps Consulting, Web Development, Data Analytics & BI, Cybersecurity Audit",4,5,2026-04-07,Active
CUS019,Orbit Group,Government,2026-03-30,2,115000,"Web Development, Cybersecurity Audit",2,7,2026-04-17,Churned
CUS020,Dhaka Telecom,Banking & Finance,2025-12-01,2,129100,UI/UX Design,1,17,2026-03-23,Active
CUS021,Apex Textiles,E-commerce,2025-02-05,2,206300,Mobile App Development,1,31,2026-03-02,Active
CUS022,Jamuna Hospital,Retail,2024-10-17,4,209500,"DevOps Consulting, AI/ML Solutions, ERP Implementation",3,32,2026-08-30,Active
CUS023,Silver Hospital,Education,2022-10-24,1,129900,Mobile App Development,1,7,2025-11-02,Churned
CUS024,Green Foods,Manufacturing,2022-01-06,1,94800,"UI/UX Design, Data Analytics & BI",2,11,2026-08-17,Active
CUS025,Prime Pharma,Telecom,2023-11-12,2,0,"ERP Implementation, Data Analytics & BI, IT Support (AMC)",3,14,2026-05-03,Active
CUS026,Padma Properties,E-commerce,2024-04-21,1,174500,"ERP Implementation, UI/UX Design",2,11,2026-09-11,Active
CUS027,Pioneer Pharma,Logistics,2024-10-25,5,412500,"Mobile App Development, Data Analytics & BI, UI/UX Design",3,14,2025-03-21,Churned
CUS028,Star Textiles,Logistics,2025-09-02,5,309600,Data Analytics & BI,1,18,2026-06-23,Active
CUS029,Jamuna Logistics,Banking & Finance,2025-08-23,1,388000,"DevOps Consulting, ERP Implementation",2,22,2026-09-07,Active
CUS030,Summit Textiles,Healthcare,2025-06-18,1,209500,"Cybersecurity Audit, Mobile App Development",2,29,2026-02-20,Active
CUS031,Apex Telecom,Logistics,2024-06-27,1,139500,"Web Development, UI/UX Design",2,8,2025-07-15,Churned
CUS032,Meghna Properties,Real Estate,2022-10-26,1,403500,"UI/UX Design, Cloud Migration",2,4,2025-06-27,Churned
CUS033,Global Logistics,Media,2025-10-31,1,94400,Cybersecurity Audit,1,31,2026-05-11,Active
CUS034,Blue University,Education,2022-01-20,4,92000,"AI/ML Solutions, DevOps Consulting, Cloud Migration, Web Development",4,30,2026-06-26,Active
CUS035,Delta Properties,Logistics,2025-08-01,5,295000,"Data Analytics & BI, AI/ML Solutions, Cybersecurity Audit",3,26,2026-09-05,Active
CUS036,Nova Telecom,Banking & Finance,2025-03-17,1,166000,"AI/ML Solutions, Web Development",2,10,2026-03-03,Churned
CUS037,Alpha Industries,Media,2025-05-26,3,122100,"Cybersecurity Audit, IT Support (AMC), UI/UX Design",3,14,2026-05-09,Active
CUS038,Green Group,E-commerce,2025-10-26,3,78900,Web Development,1,8,2026-01-27,Churned
CUS039,Nova Holdings,Manufacturing,2022-07-04,4,240000,"ERP Implementation, Cloud Migration, Cybersecurity Audit",3,10,2026-10-04,Active
CUS040,Jamuna Bank,Manufacturing,2024-12-23,2,390700,"Cloud Migration, AI/ML Solutions",2,32,2026-06-01,Active`;

const projectsCSV = `Project ID,Client ID,Client,Project Type,Project Manager (Employee ID),Budget (USD),Start Date,End Date,Status,Hours Worked
PRJ001,CUS013,Delta Retail,Support & Maintenance,EMP024,8300,2023-05-24,2023-11-09,Completed,248
PRJ002,CUS013,Delta Retail,AI/ML,EMP017,52400,2023-07-01,2023-12-18,Cancelled,174
PRJ003,CUS006,Apex Group,ERP,EMP038,41400,2023-06-19,2023-08-03,Completed,1354
PRJ004,CUS010,Zenith Industries,Web Application,EMP017,25100,2023-07-25,2023-12-22,Completed,750
PRJ005,CUS001,Unity Telecom,Cloud,EMP057,12900,2023-08-10,2024-02-14,Completed,445
PRJ006,CUS005,Nova Textiles,Design,EMP024,6800,2023-08-30,2024-04-21,Completed,210
PRJ007,CUS023,Silver Hospital,Mobile App,EMP024,19800,2023-10-01,2024-06-03,Completed,579
PRJ008,CUS011,Metro Media,Web Application,EMP038,8600,2023-09-25,2024-04-06,Completed,287
PRJ009,CUS012,Meghna Hospital,Mobile App,EMP017,28000,2023-10-26,2024-07-28,Completed,744
PRJ010,CUS001,Unity Telecom,Security,EMP038,14800,2023-11-03,2024-02-10,Completed,428
PRJ011,CUS003,Alpha University,DevOps,EMP024,14400,2023-11-12,2024-08-14,Completed,369
PRJ012,CUS024,Green Foods,Design,EMP038,14500,2024-02-09,2024-08-27,Completed,358
PRJ013,CUS004,Apex Hospital,Security,EMP038,14900,2024-01-27,2024-04-27,Cancelled,95
PRJ014,CUS011,Metro Media,Web Application,EMP024,9200,2024-02-19,2024-07-02,Completed,270
PRJ015,CUS006,Apex Group,ERP,EMP017,54200,2024-03-23,2024-12-29,Completed,1391
PRJ016,CUS023,Silver Hospital,Mobile App,EMP017,14100,2024-05-19,2024-09-07,Completed,453
PRJ017,CUS016,Green Mart,Support & Maintenance,EMP024,11700,2024-06-02,2024-11-26,Completed,417
PRJ018,CUS026,Padma Properties,Design,EMP038,20300,2024-06-10,2025-03-09,Completed,689
PRJ019,CUS005,Nova Textiles,Security,EMP057,14000,2024-05-29,2024-08-03,Completed,487
PRJ020,CUS009,Unity Mart,DevOps,EMP038,14100,2024-06-29,2025-03-03,Completed,411
PRJ021,CUS017,Meghna Pharma,Web Application,EMP024,23900,2024-06-21,2024-11-08,Completed,621
PRJ022,CUS020,Dhaka Telecom,DevOps,EMP017,16300,2024-07-14,2025-01-26,Completed,485
PRJ023,CUS020,Dhaka Telecom,DevOps,EMP024,10900,2024-07-27,2025-03-25,Completed,374
PRJ024,CUS018,Apex Properties,Web Application,EMP057,12400,2024-09-13,2024-11-06,Completed,352
PRJ025,CUS021,Apex Textiles,Mobile App,EMP024,19100,2024-09-07,2025-04-04,Completed,533
PRJ026,CUS032,Meghna Properties,Cloud,EMP024,43400,2024-08-29,2025-03-05,Cancelled,447
PRJ027,CUS022,Jamuna Hospital,Mobile App,EMP017,13800,2024-09-08,2024-12-13,Completed,419
PRJ028,CUS018,Apex Properties,Web Application,EMP024,6800,2024-09-19,2025-05-20,Completed,230
PRJ029,CUS031,Apex Telecom,Design,EMP017,19900,2024-09-29,2025-04-24,Completed,691
PRJ030,CUS007,Global Bank,DevOps,EMP024,10000,2024-10-25,2025-06-07,Completed,307
PRJ031,CUS016,Green Mart,Design,EMP024,10700,2024-10-19,2025-05-10,Completed,266
PRJ032,CUS020,Dhaka Telecom,DevOps,EMP024,14800,2024-10-10,2025-07-26,Completed,393
PRJ033,CUS026,Padma Properties,ERP,EMP017,51800,2024-10-23,2025-03-07,Completed,1449
PRJ034,CUS027,Pioneer Pharma,ERP,EMP017,66800,2024-10-27,2025-02-21,Completed,2279
PRJ035,CUS001,Unity Telecom,Security,EMP024,10200,2024-11-11,2025-07-16,Completed,285
PRJ036,CUS028,Star Textiles,Web Application,EMP038,13400,2024-12-05,2025-08-30,Cancelled,126
PRJ037,CUS026,Padma Properties,Design,EMP024,11900,2024-11-23,2025-04-06,Completed,329
PRJ038,CUS028,Star Textiles,Data & BI,EMP017,22500,2025-01-03,2025-02-17,Cancelled,205
PRJ039,CUS029,Jamuna Logistics,Mobile App,EMP057,11600,2024-12-18,2025-07-13,Cancelled,67
PRJ040,CUS010,Zenith Industries,Design,EMP024,9500,2025-01-03,2025-08-05,Completed,337
PRJ097,CUS027,Pioneer Pharma,Data & BI,EMP017,5900,2026-03-16,2026-12-20,In Progress,124
PRJ101,CUS031,Apex Telecom,Web Application,EMP017,12900,2026-03-30,2026-11-26,In Progress,366
PRJ115,CUS012,Meghna Hospital,ERP,EMP017,24000,2026-05-03,2027-02-18,In Progress,463
PRJ126,CUS040,Jamuna Bank,AI/ML,EMP038,33000,2026-07-12,2027-05-02,In Progress,295`;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Regex to handle quoted strings with commas
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

// 1. Process Users & Employees
const rawUsers = parseCSV(usersCSV);
console.log(`Parsed ${rawUsers.length} raw users & employees`);

const employeeNamesMap = {};
function formatName(username) {
  return username
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mapRoleToSystem(role) {
  const r = role.toLowerCase();
  if (r.includes('admin') || r.includes('executive') || r.includes('it manager')) return 'Super Admin';
  if (r.includes('hr')) return 'HR Manager';
  if (r.includes('sales')) return 'Sales Manager';
  if (r.includes('project')) return 'Project Manager';
  if (r.includes('finance')) return 'Finance Manager';
  if (r.includes('procurement')) return 'Procurement Manager';
  if (r.includes('support')) return 'Support Staff';
  return 'Employee';
}

const employees = rawUsers.map(u => {
  const name = formatName(u.Username);
  employeeNamesMap[u['Employee ID']] = name;
  const sysRole = mapRoleToSystem(u.Role);
  const salaryBase = sysRole === 'Super Admin' ? 220000 :
                     sysRole.includes('Manager') ? 160000 :
                     sysRole === 'Support Staff' ? 85000 : 110000;

  return {
    id: u['Employee ID'],
    employee_id: u['Employee ID'],
    name,
    full_name: name,
    email: u.Email,
    phone: `+880-17${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`,
    department: u.Department,
    designation: u.Role,
    level: sysRole.includes('Manager') || sysRole === 'Super Admin' ? 'Senior' : 'Associate',
    joinDate: '2024-01-15',
    employmentType: 'FULL_TIME',
    employment_status: u['Account Status'] || 'Active',
    status: (u['Account Status'] || 'Active').toUpperCase(),
    baseSalaryBDT: salaryBase,
    salary: salaryBase,
    hourlyBillableRateUSD: Math.round(salaryBase / 1500),
    address: 'Dhaka, Bangladesh',
    has_login_account: true,
    account_username: u.Username,
    account_role: sysRole,
    account_active: u['Account Status'] === 'Active',
    last_login: u['Last Login']
  };
});

// Explicit PM names
employeeNamesMap['EMP017'] = 'Lamia Siddique';
employeeNamesMap['EMP024'] = 'Mizan Roy';
employeeNamesMap['EMP038'] = 'Tahmina Hossain';
employeeNamesMap['EMP057'] = 'Tanvir Roy';

// 2. Process Customers
const rawCustomers = parseCSV(customersCSV);
console.log(`Parsed ${rawCustomers.length} customers`);

const clients = rawCustomers.map(c => {
  const usdVal = Number(c['Total Contract Value (USD)']) || 50000;
  const bdtVal = usdVal * 120; // 120 BDT per USD
  const tier = usdVal >= 300000 ? 'PLATINUM' : usdVal >= 150000 ? 'GOLD' : 'SILVER';
  const services = c['Services Used'] ? c['Services Used'].split(',').map(s => s.trim()) : ['Cloud Migration'];
  const phone = `+880-2-${Math.floor(8000000 + Math.random() * 1000000)}`;

  return {
    id: c['Customer ID'],
    name: c['Customer Name'],
    companyName: c['Customer Name'],
    industry: c.Industry || 'Enterprise IT & Financial',
    tier,
    slaTier: tier,
    primaryContact: {
      name: `${c['Customer Name']} IT Procurement Lead`,
      email: `procurement@${c['Customer Name'].toLowerCase().replace(/[^a-z0-9]/g, '')}.corp`,
      phone
    },
    email: `contact@${c['Customer Name'].toLowerCase().replace(/[^a-z0-9]/g, '')}.corp`,
    phone,
    billingAddress: 'Commercial District, Dhaka, Bangladesh',
    taxIdentificationBIN: `00${Math.floor(100000000 + Math.random() * 900000000)}-0101`,
    contractValueBDT: bdtVal,
    totalSpent: bdtVal,
    points: Math.round(bdtVal * 0.01),
    slaCreditsBDT: Math.round(bdtVal * 0.01),
    slaUptimeCommitment: tier === 'PLATINUM' ? '99.99%' : tier === 'GOLD' ? '99.95%' : '99.90%',
    status: c.Status === 'Active' ? 'ACTIVE_CLIENT' : 'CHURNED',
    retainedHoursBalance: tier === 'PLATINUM' ? 48 : 24,
    lastVisit: c['Last Interaction Date'] || '2026-09-01',
    lastInteraction: c['Last Interaction Date'] || '2026-09-01',
    numberOfContracts: Number(c['Number of Contracts']) || 1,
    servicesUsed: services,
    notes: `Industry: ${c.Industry}. Services engaged: ${services.join(', ')}. Total Interactions: ${c['Total Interactions']}`,
    createdAt: c['First Contract Date'] || '2023-01-01'
  };
});

// 3. Process Projects
const rawProjects = parseCSV(projectsCSV);
console.log(`Parsed ${rawProjects.length} projects`);

const projects = rawProjects.map(p => {
  const budgetUsd = Number(p['Budget (USD)']) || 20000;
  const budgetBdt = budgetUsd * 120;
  const pmName = employeeNamesMap[p['Project Manager (Employee ID)']] || 'Mizan Roy';
  const burnedHours = Number(p['Hours Worked']) || 100;
  const allocatedHours = Math.max(burnedHours + 50, Math.round(burnedHours * 1.2));
  
  let pStatus = 'COMPLETED';
  let health = 'HEALTHY_GREEN';
  const rawStatus = (p.Status || '').toLowerCase();
  if (rawStatus.includes('cancel')) {
    pStatus = 'CANCELLED';
    health = 'CRITICAL_RED';
  } else if (rawStatus.includes('progress')) {
    pStatus = 'IN_PROGRESS';
    health = 'HEALTHY_GREEN';
  } else if (rawStatus.includes('hold')) {
    pStatus = 'ON_HOLD';
    health = 'AT_RISK_YELLOW';
  } else if (rawStatus.includes('plan')) {
    pStatus = 'PLANNING';
    health = 'HEALTHY_GREEN';
  }

  const cleanCode = `PRJ-${p['Project ID']}-${(p.Client || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}`;

  return {
    id: p['Project ID'],
    code: cleanCode,
    name: `${p.Client} ${p['Project Type']}`,
    description: `Enterprise ${p['Project Type']} solution engineered for ${p.Client}`,
    clientId: p['Client ID'],
    clientName: p.Client,
    projectType: p['Project Type'],
    leadArchitect: pmName,
    managerEmployeeId: p['Project Manager (Employee ID)'],
    budgetBDT: budgetBdt,
    budgetUSD: budgetUsd,
    billedBDT: pStatus === 'COMPLETED' ? budgetBdt : Math.round(budgetBdt * 0.6),
    burnedHours,
    allocatedHours,
    currentSprint: pStatus === 'COMPLETED' ? 'Sprint Final - Delivered & Closed' : 'Sprint 3 - Core Production Rollout',
    status: pStatus,
    healthStatus: health,
    startDate: p['Start Date'] || '2024-01-01',
    targetCompletionDate: p['End Date'] || '2025-12-31',
    techStack: [p['Project Type'], 'DevOps', 'Cloud Infrastructure', 'Kubernetes'],
    milestones: [
      { id: `MLS-${p['Project ID']}-1`, name: 'Discovery & Enterprise Architecture Blueprint', status: 'COMPLETED', dueDate: p['Start Date'], completionPct: 100 },
      { id: `MLS-${p['Project ID']}-2`, name: 'Staging Delivery & Integration Verification', status: pStatus === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS', dueDate: p['End Date'], completionPct: pStatus === 'COMPLETED' ? 100 : 65 }
    ],
    tasks: [
      {
        id: `TSK-${p['Project ID']}-101`,
        title: `${p['Project Type']} Security & SLA Assessment`,
        description: `Audit infrastructure compliance and access controls for ${p.Client}`,
        status: pStatus === 'COMPLETED' ? 'DONE' : 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: pmName,
        estimatedHours: Math.round(burnedHours * 0.5),
        loggedHours: Math.round(burnedHours * 0.5),
        sprint: 'Sprint 1',
        createdAt: p['Start Date'],
        dueDate: p['End Date']
      },
      {
        id: `TSK-${p['Project ID']}-102`,
        title: 'Production Deployment & Monitoring Setup',
        description: `Deploy Prometheus, Grafana, and automated pipelines for ${p.Client}`,
        status: pStatus === 'COMPLETED' ? 'DONE' : 'TODO',
        priority: 'MEDIUM',
        assignee: 'Mahmud Hasan',
        estimatedHours: Math.round(burnedHours * 0.5),
        loggedHours: pStatus === 'COMPLETED' ? Math.round(burnedHours * 0.5) : 0,
        sprint: 'Sprint 2',
        createdAt: p['Start Date'],
        dueDate: p['End Date']
      }
    ],
    createdAt: `${p['Start Date']}T00:00:00.000Z`
  };
});

// Update backend/src/data/database.json
const dbPath = path.join(ROOT_DIR, 'backend', 'src', 'data', 'database.json');
const currentDB = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Retain default users and add newly imported users
const existingUsers = currentDB.users || [];
const newUsers = employees.map(emp => {
  const existing = existingUsers.find(u => u.username === emp.account_username || u.email === emp.email);
  if (existing) return existing;
  return {
    id: `USR-${emp.id}`,
    email: emp.email,
    username: emp.account_username,
    name: emp.name,
    role: emp.account_role,
    passwordHash: ADMIN_PASSWORD_HASH,
    department: emp.department,
    title: emp.designation,
    isActive: emp.account_active,
    mfaEnabled: false,
    lastLogin: emp.last_login || null
  };
});

// Combine users ensuring uniqueness by username
const mergedUsersMap = new Map();
existingUsers.forEach(u => mergedUsersMap.set(u.username, u));
newUsers.forEach(u => {
  if (!mergedUsersMap.has(u.username)) {
    mergedUsersMap.set(u.username, u);
  }
});

currentDB.users = Array.from(mergedUsersMap.values());
currentDB.employees = employees;
currentDB.clients = clients;
currentDB.projects = projects;

fs.writeFileSync(dbPath, JSON.stringify(currentDB, null, 2), 'utf8');
console.log(`✅ Updated backend/src/data/database.json:`);
console.log(`   - Users: ${currentDB.users.length}`);
console.log(`   - Employees: ${currentDB.employees.length}`);
console.log(`   - Clients: ${currentDB.clients.length}`);
console.log(`   - Projects: ${currentDB.projects.length}`);

// Update frontend/src/data/mockData.ts INITIAL_CUSTOMERS
const mockDataPath = path.join(ROOT_DIR, 'frontend', 'src', 'data', 'mockData.ts');
let mockDataContent = fs.readFileSync(mockDataPath, 'utf8');

const frontendCustomers = clients.map(c => ({
  id: c.id,
  name: c.companyName,
  phone: c.phone,
  email: c.email,
  tier: c.tier,
  points: c.points,
  totalSpent: c.totalSpent,
  lastVisit: c.lastVisit
}));

const customersCode = `export const INITIAL_CUSTOMERS: Customer[] = ${JSON.stringify(frontendCustomers, null, 2)};`;

// Replace INITIAL_CUSTOMERS in mockData.ts
mockDataContent = mockDataContent.replace(
  /export const INITIAL_CUSTOMERS: Customer\[\] = \[[\s\S]*?\];/,
  customersCode
);

fs.writeFileSync(mockDataPath, mockDataContent, 'utf8');
console.log(`✅ Updated frontend/src/data/mockData.ts with ${frontendCustomers.length} initial customers!`);
