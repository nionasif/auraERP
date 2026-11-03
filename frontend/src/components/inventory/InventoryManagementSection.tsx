import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Archive,
  Layers,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  RotateCcw,
  Building,
  Calendar,
  DollarSign,
  Tag,
  Shield,
  FileSpreadsheet,
  X,
  ChevronDown,
  Sparkles,
  Laptop,
  Armchair,
  Cpu
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import {
  InventoryItem,
  InventoryCategory,
  InventoryStatus,
  InventoryAssignment
} from '../../types/erp';
import { INVENTORY_CATEGORIES } from '../../data/mockInventory';

interface InventoryManagementSectionProps {
  store: ReturnType<typeof useERPStore>;
}

export const InventoryManagementSection: React.FC<InventoryManagementSectionProps> = ({ store }) => {
  const {
    state,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    assignInventoryItem,
    returnInventoryItem,
    addProduct
  } = store;

  // View & Filter states
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'ASSIGNMENT_LOGS'>('ITEMS');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [assigningItem, setAssigningItem] = useState<InventoryItem | null>(null);
  const [returningItem, setReturningItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InventoryItem | null>(null);

  // Assignment form state
  const [selectedStaffId, setSelectedStaffId] = useState(state.staff[0]?.employeeId || '');
  const [assignNotes, setAssignNotes] = useState('');

  // Return form state
  const [returnCondition, setReturnCondition] = useState('Good / Fully Functional');
  const [returnNotes, setReturnNotes] = useState('');

  // New Item form state
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'IT Equipment',
    subcategory: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    availableQuantity: 1,
    assignedQuantity: 0,
    purchasePrice: 50000,
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warranty: '1 Year Warranty',
    location: 'Floor 14 - IT Peripheral Room',
    status: 'Available',
    assignedEmployee: 'Unassigned',
    notes: '',
  });

  // Calculate Dashboard Metrics
  const totalItemsCount = state.inventory.length;
  const totalUnits = state.inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalAvailableUnits = state.inventory.reduce((sum, item) => sum + item.availableQuantity, 0);
  const totalAssignedUnits = state.inventory.reduce((sum, item) => sum + item.assignedQuantity, 0);
  const maintenanceUnits = state.inventory.filter((item) => item.status === 'Under Maintenance').length;
  const lowStockItems = state.inventory.filter((item) => item.availableQuantity <= 2 && item.status !== 'Retired').length;
  const totalInventoryValue = state.inventory.reduce(
    (sum, item) => sum + item.purchasePrice * item.quantity,
    0
  );

  // Filtered Items
  const filteredInventory = state.inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
      (item.assignedEmployee && item.assignedEmployee.toLowerCase().includes(search.toLowerCase())) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSubcategory = subcategoryFilter === 'ALL' || item.subcategory === subcategoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesLocation = locationFilter === 'ALL' || item.location === locationFilter;

    return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus && matchesLocation;
  });

  // Unique locations for filter dropdown
  const uniqueLocations = Array.from(new Set(state.inventory.map((i) => i.location))).filter(Boolean);

  // Available subcategories based on chosen category in filter or create
  const getSubcategoriesForCategory = (cat: InventoryCategory | string) => {
    if (cat === 'ALL') {
      return INVENTORY_CATEGORIES.flatMap((c) => c.items);
    }
    const found = INVENTORY_CATEGORIES.find((c) => c.category === cat);
    return found ? found.items : [];
  };

  // Status Badge Styles
  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Assigned':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Under Maintenance':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Damaged':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Lost':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Retired':
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
    }
  };

  // Submit Add Item
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.brand) {
      alert('Please fill out Item Name and Brand.');
      return;
    }
    const qty = Math.max(1, Number(newItem.quantity) || 1);
    const assigned = Math.min(qty, Number(newItem.assignedQuantity) || 0);
    const avail = Math.max(0, qty - assigned);

    addInventoryItem({
      name: newItem.name || 'New Item',
      category: (newItem.category as InventoryCategory) || 'IT Equipment',
      subcategory: newItem.subcategory || 'Laptop',
      brand: newItem.brand || '',
      model: newItem.model || '',
      serialNumber: newItem.serialNumber || 'N/A',
      quantity: qty,
      availableQuantity: avail,
      assignedQuantity: assigned,
      purchasePrice: Number(newItem.purchasePrice) || 0,
      supplier: newItem.supplier || 'Direct Sourced',
      purchaseDate: newItem.purchaseDate || new Date().toISOString().split('T')[0],
      warranty: newItem.warranty || 'Standard Warranty',
      location: newItem.location || 'Floor 14 Storage',
      assignedEmployee: assigned > 0 ? newItem.assignedEmployee : 'Unassigned (Buffer Stock)',
      status: (newItem.status as InventoryStatus) || (avail > 0 ? 'Available' : 'Assigned'),
      notes: newItem.notes || '',
    });

    if (addProduct) {
      addProduct({
        name: newItem.brand ? `${newItem.brand} ${newItem.name} ${newItem.model || ''}`.trim() : (newItem.name || 'Enterprise Hardware'),
        category: newItem.category || 'IT Equipment',
        price: Number(newItem.purchasePrice) || 0,
        costPrice: Number(newItem.purchasePrice) || 0,
        stock: qty,
        minStock: 1,
        sku: newItem.serialNumber && newItem.serialNumber !== 'N/A' ? newItem.serialNumber : `AST-${Date.now().toString().slice(-6)}`,
        department: newItem.category === 'IT Equipment' ? 'Datacenter & IT Infrastructure' : 'Corporate Assets',
        uom: 'UNIT',
        binLocation: newItem.location || 'BR-01'
      });
    }

    setShowAddModal(false);
    setNewItem({
      name: '',
      category: 'IT Equipment',
      subcategory: 'Laptop',
      brand: '',
      model: '',
      serialNumber: '',
      quantity: 1,
      availableQuantity: 1,
      assignedQuantity: 0,
      purchasePrice: 50000,
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      warranty: '1 Year Warranty',
      location: 'Floor 14 - IT Peripheral Room',
      status: 'Available',
      assignedEmployee: 'Unassigned',
      notes: '',
    });
  };

  // Submit Edit Item
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const qty = Math.max(1, editingItem.quantity);
    const assigned = Math.min(qty, editingItem.assignedQuantity);
    const avail = Math.max(0, qty - assigned);

    updateInventoryItem({
      ...editingItem,
      quantity: qty,
      availableQuantity: avail,
      assignedQuantity: assigned,
    });
    setEditingItem(null);
  };

  // Submit Assignment
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningItem) return;
    const staff = state.staff.find((s) => s.employeeId === selectedStaffId) || state.staff[0];
    assignInventoryItem(
      assigningItem.id,
      staff.employeeId,
      staff.name,
      staff.role,
      assignNotes
    );
    setAssigningItem(null);
    setAssignNotes('');
  };

  // Submit Return
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningItem) return;
    returnInventoryItem(returningItem.id, returnCondition, returnNotes);
    setReturningItem(null);
    setReturnNotes('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Asset ID',
      'Name',
      'Category',
      'Subcategory',
      'Brand',
      'Model',
      'Serial Number',
      'Total Qty',
      'Available Qty',
      'Assigned Qty',
      'Purchase Price',
      'Supplier',
      'Purchase Date',
      'Warranty',
      'Location',
      'Assigned Employee',
      'Status'
    ];
    const rows = state.inventory.map((item) => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.category,
      item.subcategory,
      item.brand,
      item.model,
      item.serialNumber || 'N/A',
      item.quantity,
      item.availableQuantity,
      item.assignedQuantity,
      item.purchasePrice,
      `"${item.supplier.replace(/"/g, '""')}"`,
      item.purchaseDate,
      `"${item.warranty.replace(/"/g, '""')}"`,
      `"${item.location.replace(/"/g, '""')}"`,
      `"${(item.assignedEmployee || 'Unassigned').replace(/"/g, '""')}"`,
      item.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AuraTech_IT_and_Office_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 1. Inventory Dashboard Metric Cards (Requirement 3) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Items */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Total Items</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-1 font-mono">
            {totalItemsCount} <span className="text-xs text-slate-500 font-sans font-normal">SKUs</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{totalUnits} total physical units</div>
        </div>

        {/* Available Items */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Available Items</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
            {totalAvailableUnits}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5 font-mono">Ready for assignment</div>
        </div>

        {/* Assigned Items */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Assigned Items</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-400 mt-1 font-mono">
            {totalAssignedUnits}
          </div>
          <div className="text-[10px] text-cyan-500/80 mt-0.5 font-mono">Assigned to employees</div>
        </div>

        {/* Under Maintenance */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>In Maintenance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 mt-1 font-mono">
            {maintenanceUnits}
          </div>
          <div className="text-[10px] text-amber-500/80 mt-0.5 font-mono">In lab / diagnostic service</div>
        </div>

        {/* Low Stock Items */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-extrabold text-orange-400 mt-1 font-mono">
            {lowStockItems}
          </div>
          <div className="text-[10px] text-orange-500/80 mt-0.5 font-mono">Available ≤ 2 units</div>
        </div>

        {/* Total Inventory Value */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Total Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-emerald-400 mt-1 font-mono truncate">
            ৳{totalInventoryValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs & Actions Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('ITEMS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'ITEMS'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory Master Table</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {filteredInventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ASSIGNMENT_LOGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'ASSIGNMENT_LOGS'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Employee Assignment History</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition"
            title="Download complete inventory ledger as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {Boolean(
            state.currentUser?.role === 'Super Admin' ||
            state.currentUser?.role === 'Procurement Manager' ||
            state.currentUser?.permissions?.canManageInventory ||
            !state.currentUser?.permissions
          ) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
              title="Add a new IT Equipment or Office Furniture item"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Inventory Item</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'ITEMS' && (
        <>
          {/* 3. Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 text-xs">
              {/* Search text */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Asset ID, name, brand, model, serial, or employee..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3 flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[11px] whitespace-nowrap">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setSubcategoryFilter('ALL');
                  }}
                  className="w-full bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">All Categories</option>
                  <option value="IT Equipment" className="bg-slate-900">IT Equipment</option>
                  <option value="Office Equipment & Furniture" className="bg-slate-900">Office Equipment & Furniture</option>
                  <option value="Other Office Items" className="bg-slate-900">Other Office Items</option>
                </select>
              </div>

              {/* Subcategory / Type Filter */}
              <div className="md:col-span-3 flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[11px] whitespace-nowrap">Type:</span>
                <select
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                  className="w-full bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer truncate"
                >
                  <option value="ALL" className="bg-slate-900">All Equipment Types</option>
                  {getSubcategoriesForCategory(categoryFilter).map((sub) => (
                    <option key={sub} value={sub} className="bg-slate-900">
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2 flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-[11px] whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-transparent text-slate-200 font-semibold focus:outline-none text-xs cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">All Statuses</option>
                  <option value="Available" className="bg-slate-900">Available</option>
                  <option value="Assigned" className="bg-slate-900">Assigned</option>
                  <option value="Under Maintenance" className="bg-slate-900">Under Maintenance</option>
                  <option value="Damaged" className="bg-slate-900">Damaged</option>
                  <option value="Lost" className="bg-slate-900">Lost</option>
                  <option value="Retired" className="bg-slate-900">Retired</option>
                </select>
              </div>
            </div>

            {/* Active filters pill row */}
            {(search || categoryFilter !== 'ALL' || subcategoryFilter !== 'ALL' || statusFilter !== 'ALL' || locationFilter !== 'ALL') && (
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400 font-medium">Active filters:</span>
                {categoryFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                    Category: {categoryFilter}
                  </span>
                )}
                {subcategoryFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                    Type: {subcategoryFilter}
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                    Status: {statusFilter}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('ALL');
                    setSubcategoryFilter('ALL');
                    setStatusFilter('ALL');
                    setLocationFilter('ALL');
                  }}
                  className="text-rose-400 hover:underline ml-auto font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* 4. Inventory Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-800 sticky top-0 z-10">
                    <th className="p-3">Asset ID & Item Name</th>
                    <th className="p-3">Category & Type</th>
                    <th className="p-3">Brand & Model</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3 text-center">Quantities (Tot / Avl / Asg)</th>
                    <th className="p-3 text-right">Unit Price (৳)</th>
                    <th className="p-3">Location & Assigned Employee</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-sans">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 font-mono">
                        No inventory equipment found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-850/60 transition group">
                        {/* Asset ID & Item Name */}
                        <td className="p-3">
                          <div className="flex items-start space-x-2">
                            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 mt-0.5">
                              {item.category === 'IT Equipment' ? (
                                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                              ) : item.category === 'Office Equipment & Furniture' ? (
                                <Armchair className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Cpu className="w-3.5 h-3.5 text-rose-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 hover:text-amber-300 transition cursor-pointer" onClick={() => setViewingItem(item)}>
                                {item.name}
                              </div>
                              <span className="font-mono text-[10px] text-amber-300/90 font-bold bg-amber-500/10 px-1 rounded">
                                {item.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category & Subcategory */}
                        <td className="p-3">
                          <div className="text-slate-200 font-semibold">{item.subcategory}</div>
                          <div className="text-[10px] text-slate-500">{item.category}</div>
                        </td>

                        {/* Brand & Model */}
                        <td className="p-3">
                          <div className="text-slate-200 font-medium">{item.brand}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={item.model}>
                            {item.model}
                          </div>
                        </td>

                        {/* Serial Number */}
                        <td className="p-3 font-mono text-[11px] text-slate-300">
                          {item.serialNumber && item.serialNumber !== 'N/A' ? (
                            <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {item.serialNumber}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">N/A</span>
                          )}
                        </td>

                        {/* Quantities */}
                        <td className="p-3 text-center font-mono">
                          <div className="inline-flex items-center space-x-1.5 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-xs">
                            <span className="text-slate-100 font-bold" title="Total Units">{item.quantity}</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-emerald-400 font-bold" title="Available Units">{item.availableQuantity}</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-cyan-400 font-bold" title="Assigned Units">{item.assignedQuantity}</span>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td className="p-3 text-right font-mono font-bold text-slate-200">
                          ৳{item.purchasePrice.toLocaleString()}
                        </td>

                        {/* Location & Employee */}
                        <td className="p-3">
                          <div className="text-slate-300 text-[11px] truncate max-w-[180px]" title={item.location}>
                            {item.location}
                          </div>
                          <div className="text-[10px] font-mono mt-0.5">
                            {item.assignedEmployee && item.assignedEmployee !== 'Unassigned' ? (
                              <span className="text-cyan-400 font-semibold truncate block max-w-[180px]" title={item.assignedEmployee}>
                                👤 {item.assignedEmployee}
                              </span>
                            ) : (
                              <span className="text-slate-500">Unassigned</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setViewingItem(item)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition"
                              title="View Full Item Details & Specs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Assign / Return Quick Trigger */}
                            {item.availableQuantity > 0 && (
                              <button
                                onClick={() => {
                                  setAssigningItem(item);
                                  setSelectedStaffId(state.staff[0]?.employeeId || '');
                                }}
                                className="p-1 rounded bg-slate-800 hover:bg-cyan-600/30 text-cyan-400 hover:text-cyan-300 transition"
                                title="Assign unit to employee"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {item.assignedQuantity > 0 && (
                              <button
                                onClick={() => setReturningItem(item)}
                                className="p-1 rounded bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 transition"
                                title="Return / Unassign unit to stock"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1 rounded bg-slate-800 hover:bg-amber-600/30 text-amber-400 hover:text-amber-300 transition"
                              title="Edit Item Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1 rounded bg-slate-800 hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 transition"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>
                Showing {filteredInventory.length} of {state.inventory.length} asset records
              </span>
              <span>Asset Ledger: DC01 Silicon Tower Verified</span>
            </div>
          </div>
        </>
      )}

      {/* 5. Assignment History Logs View */}
      {activeTab === 'ASSIGNMENT_LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Employee IT & Office Asset Assignment Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-400">
                Complete historical record of issued and returned equipment across engineering, administration, and facilities.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300">
              Total Log Entries: {state.inventory.flatMap((i) => i.assignmentHistory || []).length}
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {state.inventory.flatMap((item) =>
              (item.assignmentHistory || []).map((asg) => ({
                ...asg,
                itemName: item.name,
                itemCategory: item.category,
                itemSubcategory: item.subcategory,
                itemBrand: item.brand,
                itemModel: item.model,
                itemSerial: item.serialNumber,
              }))
            ).length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No asset assignment records logged yet. Use the "Assign" action on available items to issue equipment.
              </div>
            ) : (
              state.inventory
                .flatMap((item) =>
                  (item.assignmentHistory || []).map((asg) => ({
                    ...asg,
                    itemName: item.name,
                    itemCategory: item.category,
                    itemSubcategory: item.subcategory,
                    itemBrand: item.brand,
                    itemModel: item.model,
                    itemSerial: item.serialNumber,
                  }))
                )
                .map((log) => (
                  <div key={log.id} className="py-3 px-2 flex items-start justify-between hover:bg-slate-850/50 transition rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {log.employeeName} ({log.employeeId})
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs font-semibold text-slate-200">
                          {log.itemName}
                        </span>
                        <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-amber-300">
                          {log.assetId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {log.itemSubcategory} • {log.itemBrand} {log.itemModel} {log.itemSerial && `(SN: ${log.itemSerial})`}
                      </div>
                      {log.notes && (
                        <div className="text-[11px] text-slate-500 font-mono italic">
                          "{log.notes}"
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 flex items-center space-x-3 pt-0.5">
                        <span>Assigned by: <strong>{log.assignedBy}</strong></span>
                        <span>Date Assigned: <strong>{log.assignedDate}</strong></span>
                        {log.returnDate ? (
                          <span className="text-emerald-400 font-bold">
                            Returned on {log.returnDate} ({log.conditionOnReturn || 'Checked'})
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">Currently Active / In Custody</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {log.returnDate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          RETURNED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* --- ADD NEW INVENTORY ITEM MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Add IT & Office Inventory Item</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Item / Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. MacBook Pro 14 or Ergonomic Desk"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => {
                      const cat = e.target.value as InventoryCategory;
                      const subs = getSubcategoriesForCategory(cat);
                      setNewItem({
                        ...newItem,
                        category: cat,
                        subcategory: subs[0] || '',
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Equipment & Furniture">Office Equipment & Furniture</option>
                    <option value="Other Office Items">Other Office Items</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subcategory / Type *</label>
                  <select
                    value={newItem.subcategory}
                    onChange={(e) => setNewItem({ ...newItem, subcategory: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {getSubcategoriesForCategory(newItem.category || 'IT Equipment').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    placeholder="e.g. Dell, Apple, Cisco, Herman Miller"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model / Spec</label>
                  <input
                    type="text"
                    value={newItem.model}
                    onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                    placeholder="e.g. Precision 5820 or Remastered B"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={newItem.serialNumber}
                    onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
                    placeholder="e.g. SN-882109 or N/A"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.quantity}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setNewItem({
                        ...newItem,
                        quantity: q,
                        availableQuantity: Math.max(0, q - (newItem.assignedQuantity || 0)),
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Purchase Price (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItem.purchasePrice}
                    onChange={(e) => setNewItem({ ...newItem, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Supplier / Vendor</label>
                  <input
                    type="text"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    placeholder="e.g. Apple Enterprise, Global Brand"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={newItem.purchaseDate}
                    onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warranty Details</label>
                  <input
                    type="text"
                    value={newItem.warranty}
                    onChange={(e) => setNewItem({ ...newItem, warranty: e.target.value })}
                    placeholder="e.g. 3 Years Onsite Premier SLA"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Storage / Floor Location</label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    placeholder="e.g. Floor 14 - Engineering Pod B"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Asset Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value as InventoryStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Technical Notes / Specs</label>
                <textarea
                  rows={2}
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="Optional technical specifications or allocation notes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow"
                >
                  Save & Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW ITEM DETAILS MODAL --- */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{viewingItem.name}</h3>
                  <div className="text-[10px] font-mono text-amber-300">{viewingItem.id}</div>
                </div>
              </div>
              <button onClick={() => setViewingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Category</div>
                  <div className="text-slate-200 font-semibold mt-0.5">{viewingItem.category}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Equipment Type</div>
                  <div className="text-amber-300 font-semibold mt-0.5">{viewingItem.subcategory}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Brand & Model</div>
                  <div className="text-slate-200 font-semibold mt-0.5">{viewingItem.brand} {viewingItem.model}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Status</div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${getStatusBadge(viewingItem.status)}`}>
                    {viewingItem.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Serial Number</div>
                  <div className="text-slate-200 font-semibold mt-0.5">{viewingItem.serialNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Total Physical Quantity</div>
                  <div className="text-slate-100 font-extrabold mt-0.5">{viewingItem.quantity} units</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Available / Assigned</div>
                  <div className="mt-0.5">
                    <span className="text-emerald-400 font-bold">{viewingItem.availableQuantity} Avl</span> / <span className="text-cyan-400 font-bold">{viewingItem.assignedQuantity} Asg</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Purchase Price</div>
                  <div className="text-emerald-400 font-bold mt-0.5">৳{viewingItem.purchasePrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Supplier / Vendor</div>
                  <div className="text-slate-200 mt-0.5">{viewingItem.supplier}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-sans">Purchase Date</div>
                  <div className="text-slate-300 mt-0.5">{viewingItem.purchaseDate}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-400 text-[11px] font-medium">Warranty & Service SLA:</div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-200">
                  🛡️ {viewingItem.warranty}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-400 text-[11px] font-medium">Physical Location & Current Custody:</div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 flex justify-between">
                  <span>Location: <strong className="text-white">{viewingItem.location}</strong></span>
                  <span>Assigned: <strong className="text-cyan-400">{viewingItem.assignedEmployee || 'Unassigned'}</strong></span>
                </div>
              </div>

              {/* Assignment History Log */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>Item Assignment History & Chain of Custody</span>
                </h4>
                <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-850 max-h-48 overflow-y-auto">
                  {!viewingItem.assignmentHistory || viewingItem.assignmentHistory.length === 0 ? (
                    <div className="p-3 text-center text-slate-500 font-mono text-[11px]">
                      No previous employee assignment records on file.
                    </div>
                  ) : (
                    viewingItem.assignmentHistory.map((asg) => (
                      <div key={asg.id} className="p-2.5 text-[11px] flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-200">
                            {asg.employeeName} ({asg.employeeId}) • <span className="text-slate-400">{asg.department}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Issued: {asg.assignedDate} by {asg.assignedBy} • Condition: {asg.conditionOnAssign}
                          </div>
                          {asg.notes && <div className="text-[10px] text-slate-400 italic">"{asg.notes}"</div>}
                        </div>
                        <div>
                          {asg.returnDate ? (
                            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              Returned {asg.returnDate}
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              Current Assignee
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT ITEM MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Edit Inventory Asset: {editingItem.id}</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => {
                      const cat = e.target.value as InventoryCategory;
                      const subs = getSubcategoriesForCategory(cat);
                      setEditingItem({
                        ...editingItem,
                        category: cat,
                        subcategory: subs[0] || editingItem.subcategory,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Equipment & Furniture">Office Equipment & Furniture</option>
                    <option value="Other Office Items">Other Office Items</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subcategory / Type</label>
                  <select
                    value={editingItem.subcategory}
                    onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {getSubcategoriesForCategory(editingItem.category).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={editingItem.brand}
                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    value={editingItem.model}
                    onChange={(e) => setEditingItem({ ...editingItem, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={editingItem.serialNumber || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, serialNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Purchase Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.purchasePrice}
                    onChange={(e) => setEditingItem({ ...editingItem, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Supplier</label>
                  <input
                    type="text"
                    value={editingItem.supplier}
                    onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={editingItem.location}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as InventoryStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ASSIGN ITEM TO EMPLOYEE MODAL --- */}
      {assigningItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Assign Asset to Employee</h3>
              </div>
              <button onClick={() => setAssigningItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-slate-200">{assigningItem.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {assigningItem.id} • Available: <strong className="text-emerald-400">{assigningItem.availableQuantity} units</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Employee *</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                >
                  {state.staff.map((s) => (
                    <option key={s.employeeId} value={s.employeeId} className="bg-slate-900">
                      {s.name} ({s.employeeId}) — {s.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assignment Notes / Handover Purpose</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Assigned for core backend DevOps and project deployment..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAssigningItem(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow"
                >
                  Confirm Asset Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RETURN ITEM MODAL --- */}
      {returningItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Return Asset to Inventory</h3>
              </div>
              <button onClick={() => setReturningItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-slate-200">{returningItem.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Currently Assigned: <strong className="text-cyan-400">{returningItem.assignedQuantity} units</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Equipment Condition on Return</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Good / Fully Functional">Good / Fully Functional</option>
                  <option value="Minor Wear / Operational">Minor Wear / Operational</option>
                  <option value="Needs Diagnostic / Servicing">Needs Diagnostic / Servicing</option>
                  <option value="Damaged / Hardware Fault">Damaged / Hardware Fault</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Return Notes / Reason</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Project completion, employee department transfer..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReturningItem(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow"
                >
                  Confirm Return to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">Delete Inventory Asset?</h4>
                <p className="text-slate-400 text-[11px]">This action removes the asset from ERP records.</p>
              </div>
            </div>
            <p className="text-slate-300">
              Are you sure you want to delete <strong className="text-white">{deleteConfirmItem.name}</strong> ({deleteConfirmItem.id})?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteInventoryItem(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
