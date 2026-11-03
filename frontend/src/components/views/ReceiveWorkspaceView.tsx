import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Building,
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Printer,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  Server,
  Check,
  DollarSign,
  Layers,
  ShieldCheck,
  Barcode,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowRight,
  AlertTriangle,
  BadgeAlert
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { Vendor, PurchaseOrder, PurchaseOrderItem, GoodsReceiveNote, GRNReceivedItem } from '../../types/erp';

interface ReceiveWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

type ActiveTab = 'VENDORS' | 'ORDERS' | 'GRN';

export const ReceiveWorkspaceView: React.FC<ReceiveWorkspaceViewProps> = ({ store }) => {
  const {
    state,
    setView,
    fetchProcurementData,
    addVendor,
    updateVendor,
    deleteVendor,
    addPurchaseOrder,
    updatePurchaseOrder,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    addGoodsReceiveNote,
    deleteGoodsReceiveNote
  } = store;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('VENDORS');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Search & Filters
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [grnSearch, setGrnSearch] = useState('');

  // Modals
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedPOForView, setSelectedPOForView] = useState<PurchaseOrder | null>(null);

  const [showGRNModal, setShowGRNModal] = useState(false);
  const [selectedGRNForView, setSelectedGRNForView] = useState<GoodsReceiveNote | null>(null);
  const [prefilledPOForGRN, setPrefilledPOForGRN] = useState<PurchaseOrder | null>(null);

  // Delete confirmations
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'VENDOR' | 'PO' | 'GRN'; id: string; name: string } | null>(null);

  // Initial load
  useEffect(() => {
    fetchProcurementData();
  }, [fetchProcurementData]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProcurementData();
    setIsRefreshing(false);
    showToast('Procurement data refreshed from corporate backend', 'info');
  };

  // -------------------------------------------------------------
  // Form State: Vendor
  // -------------------------------------------------------------
  const [vendorName, setVendorName] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Hardware & Networking OEM');
  const [vendorContact, setVendorContact] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorTaxId, setVendorTaxId] = useState('');
  const [vendorBinNo, setVendorBinNo] = useState('');
  const [vendorPaymentTerms, setVendorPaymentTerms] = useState('Net 30 Days');
  const [vendorStatus, setVendorStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [vendorNotes, setVendorNotes] = useState('');

  const openAddVendor = () => {
    setEditingVendor(null);
    setVendorName('');
    setVendorCode(`VND-${Math.floor(1000 + Math.random() * 9000)}`);
    setVendorCategory('Hardware & Networking OEM');
    setVendorContact('');
    setVendorEmail('');
    setVendorPhone('');
    setVendorAddress('Dhaka, Bangladesh');
    setVendorTaxId('');
    setVendorBinNo('');
    setVendorPaymentTerms('Net 30 Days');
    setVendorStatus('ACTIVE');
    setVendorNotes('');
    setShowVendorModal(true);
  };

  const openEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorName(vendor.name);
    setVendorCode(vendor.code);
    setVendorCategory(vendor.category);
    setVendorContact(vendor.contactPerson);
    setVendorEmail(vendor.email);
    setVendorPhone(vendor.phone);
    setVendorAddress(vendor.address);
    setVendorTaxId(vendor.taxId || '');
    setVendorBinNo(vendor.binNo || '');
    setVendorPaymentTerms(vendor.paymentTerms);
    setVendorStatus(vendor.status);
    setVendorNotes(vendor.notes || '');
    setShowVendorModal(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      showToast('Vendor / Company name is required', 'warning');
      return;
    }

    const payload: Partial<Vendor> = {
      name: vendorName.trim(),
      code: vendorCode.trim() || `VND-${Math.floor(1000 + Math.random() * 9000)}`,
      category: vendorCategory,
      contactPerson: vendorContact.trim(),
      email: vendorEmail.trim(),
      phone: vendorPhone.trim(),
      address: vendorAddress.trim(),
      taxId: vendorTaxId.trim(),
      binNo: vendorBinNo.trim(),
      paymentTerms: vendorPaymentTerms,
      status: vendorStatus,
      notes: vendorNotes.trim(),
    };

    if (editingVendor) {
      await updateVendor(editingVendor.id, payload);
      showToast(`Vendor '${payload.name}' updated successfully!`, 'success');
    } else {
      await addVendor(payload);
      showToast(`New vendor '${payload.name}' registered successfully!`, 'success');
    }

    setShowVendorModal(false);
  };

  // -------------------------------------------------------------
  // Form State: Purchase Order (PO)
  // -------------------------------------------------------------
  const [poVendorId, setPoVendorId] = useState<string>('');
  const [poPriority, setPoPriority] = useState<'NORMAL' | 'URGENT' | 'CRITICAL'>('NORMAL');
  const [poDeliveryDate, setPoDeliveryDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [poDeliveryLoc, setPoDeliveryLoc] = useState('DC01 Silicon Tower - Inward Intake Bay');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<Array<{ itemName: string; sku: string; specs: string; quantity: number; unitPriceBDT: number }>>([
    { itemName: '', sku: '', specs: '', quantity: 1, unitPriceBDT: 0 }
  ]);

  const openAddPO = () => {
    const defaultVendor = state.vendors[0];
    setPoVendorId(defaultVendor ? defaultVendor.id : '');
    setPoPriority('NORMAL');
    setPoDeliveryDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setPoDeliveryLoc('DC01 Silicon Tower - Inward Intake Bay');
    setPoNotes('');
    setPoItems([{ itemName: '', sku: '', specs: '', quantity: 1, unitPriceBDT: 0 }]);
    setShowPOModal(true);
  };

  const handleAddPOLineItem = () => {
    setPoItems(prev => [...prev, { itemName: '', sku: '', specs: '', quantity: 1, unitPriceBDT: 0 }]);
  };

  const handleRemovePOLineItem = (index: number) => {
    if (poItems.length <= 1) return;
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePOLineItem = (index: number, field: string, value: any) => {
    setPoItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    }));
  };

  const poGrandTotalBDT = useMemo(() => {
    return poItems.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPriceBDT) || 0), 0);
  }, [poItems]);

  const handleSavePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = state.vendors.find(v => v.id === poVendorId);
    if (!vendor && state.vendors.length > 0) {
      showToast('Please select a valid supplier/vendor', 'warning');
      return;
    }

    const validItems = poItems.filter(it => it.itemName.trim() !== '');
    if (validItems.length === 0) {
      showToast('Please enter at least one line item', 'warning');
      return;
    }

    const payload: Partial<PurchaseOrder> = {
      vendorId: vendor ? vendor.id : null,
      vendorName: vendor ? vendor.name : 'OEM Hardware Supplier',
      vendorCode: vendor ? vendor.code : 'VND-OEM',
      priority: poPriority,
      deliveryLocation: poDeliveryLoc,
      expectedDelivery: poDeliveryDate,
      notes: poNotes,
      status: 'APPROVED',
      items: validItems.map((it, idx) => ({
        id: `po-item-${idx + 1}-${Date.now()}`,
        itemName: it.itemName.trim(),
        sku: it.sku.trim() || `SKU-${idx + 1}`,
        specs: it.specs.trim(),
        quantity: Number(it.quantity) || 1,
        unitPriceBDT: Number(it.unitPriceBDT) || 0,
        totalBDT: (Number(it.quantity) || 1) * (Number(it.unitPriceBDT) || 0)
      })),
      totalAmountBDT: poGrandTotalBDT,
    };

    await addPurchaseOrder(payload);
    showToast(`Purchase Order issued successfully!`, 'success');
    setShowPOModal(false);
  };

  // -------------------------------------------------------------
  // Form State: GRN / Inward Consignment Intake
  // -------------------------------------------------------------
  const [grnChallanNo, setGrnChallanNo] = useState('');
  const [grnVehicle, setGrnVehicle] = useState('Consignment Truck (DHAKA-METRO-TA-11-9042)');
  const [grnDriverName, setGrnDriverName] = useState('Md. Rafiqul Islam');
  const [grnDriverPhone, setGrnDriverPhone] = useState('+880-1711-209843');
  const [grnReceivingBay, setGrnReceivingBay] = useState('DC01 Staging & Racks Allocation Bay');
  const [grnRemarks, setGrnRemarks] = useState('100% serial tags scanned and verified');
  const [grnPOId, setGrnPOId] = useState<string>('');
  const [grnItems, setGrnItems] = useState<Array<{ itemName: string; orderedQty: number; receivedQty: number; serialNumbers: string; remarks: string }>>([]);

  const openAddGRN = (po?: PurchaseOrder) => {
    const targetPO = po || state.purchaseOrders.find(p => p.status === 'APPROVED' || p.status === 'IN_TRANSIT');
    setPrefilledPOForGRN(targetPO || null);
    setGrnPOId(targetPO ? targetPO.id : '');
    setGrnChallanNo(`CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setGrnVehicle('Consignment Truck (DHAKA-METRO-TA-11-9042)');
    setGrnDriverName('Md. Rafiqul Islam');
    setGrnDriverPhone('+880-1711-209843');
    setGrnReceivingBay('DC01 Staging & Racks Allocation Bay');
    setGrnRemarks('100% serial tags scanned and verified');

    if (targetPO && targetPO.items && targetPO.items.length > 0) {
      setGrnItems(targetPO.items.map(it => ({
        itemName: it.itemName,
        orderedQty: it.quantity,
        receivedQty: it.quantity,
        serialNumbers: 'SN-' + Math.floor(100000 + Math.random() * 900000),
        remarks: 'Physical QC Passed'
      })));
    } else {
      setGrnItems([{ itemName: 'Standard Hardware Delivery', orderedQty: 1, receivedQty: 1, serialNumbers: '', remarks: 'Accepted' }]);
    }

    setShowGRNModal(true);
  };

  const handlePOSelectionChangeInGRN = (poId: string) => {
    setGrnPOId(poId);
    const target = state.purchaseOrders.find(p => p.id === poId);
    setPrefilledPOForGRN(target || null);
    if (target && target.items) {
      setGrnItems(target.items.map(it => ({
        itemName: it.itemName,
        orderedQty: it.quantity,
        receivedQty: it.quantity,
        serialNumbers: 'SN-' + Math.floor(100000 + Math.random() * 900000),
        remarks: 'Physical QC Passed'
      })));
    }
  };

  const handleSaveGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnChallanNo.trim()) {
      showToast('Challan number is required', 'warning');
      return;
    }

    const linkedPO = state.purchaseOrders.find(p => p.id === grnPOId);

    const totalVal = linkedPO ? linkedPO.totalAmountBDT : 0;
    const payload: Partial<GoodsReceiveNote> = {
      poId: linkedPO ? linkedPO.id : null,
      poNumber: linkedPO ? linkedPO.poNumber : 'DIRECT-CHALLAN',
      vendorName: linkedPO ? linkedPO.vendorName : (state.vendors[0]?.name || 'OEM Vendor'),
      challanNo: grnChallanNo.trim(),
      carrierVehicle: grnVehicle.trim(),
      driverName: grnDriverName.trim(),
      driverPhone: grnDriverPhone.trim(),
      receivingBay: grnReceivingBay,
      remarks: grnRemarks.trim(),
      receivedItems: grnItems,
      itemCount: grnItems.reduce((acc, it) => acc + (Number(it.receivedQty) || 0), 0),
      totalValueBDT: totalVal,
      status: 'ACCEPTED_INTO_INVENTORY',
    };

    const created = await addGoodsReceiveNote(payload);
    showToast(`Goods Receive Note registered and allocated to inventory!`, 'success');
    setShowGRNModal(false);
    if (created) {
      setSelectedGRNForView(created);
    }
  };

  // -------------------------------------------------------------
  // Filtered Lists
  // -------------------------------------------------------------
  const filteredVendors = useMemo(() => {
    return (state.vendors || []).filter(v => {
      const matchCategory = vendorCategoryFilter === 'ALL' || v.category === vendorCategoryFilter;
      const q = vendorSearch.toLowerCase();
      const matchSearch =
        !q ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.code && v.code.toLowerCase().includes(q)) ||
        (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q)) ||
        (v.phone && v.phone.includes(q));
      return matchCategory && matchSearch;
    });
  }, [state.vendors, vendorCategoryFilter, vendorSearch]);

  const filteredOrders = useMemo(() => {
    return (state.purchaseOrders || []).filter(o => {
      const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      const q = orderSearch.toLowerCase();
      const matchSearch =
        !q ||
        (o.poNumber && o.poNumber.toLowerCase().includes(q)) ||
        (o.vendorName && o.vendorName.toLowerCase().includes(q)) ||
        (o.approvedBy && o.approvedBy.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [state.purchaseOrders, orderStatusFilter, orderSearch]);

  const filteredGRNs = useMemo(() => {
    return (state.goodsReceiveNotes || []).filter(g => {
      const q = grnSearch.toLowerCase();
      return (
        !q ||
        (g.grnNumber && g.grnNumber.toLowerCase().includes(q)) ||
        (g.poNumber && g.poNumber.toLowerCase().includes(q)) ||
        (g.challanNo && g.challanNo.toLowerCase().includes(q)) ||
        (g.vendorName && g.vendorName.toLowerCase().includes(q)) ||
        (g.driverName && g.driverName.toLowerCase().includes(q))
      );
    });
  }, [state.goodsReceiveNotes, grnSearch]);

  // Dynamic KPI Stats derived purely from real backend database
  const totalVendorsCount = state.vendors?.length || 0;
  const activeOrdersCount = (state.purchaseOrders || []).filter(o => o.status !== 'RECEIVED' && o.status !== 'CANCELLED').length;
  const totalProcurementSpendBDT = (state.purchaseOrders || []).reduce((acc, o) => acc + (o.totalAmountBDT || 0), 0);
  const grnCount = state.goodsReceiveNotes?.length || 0;

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'VENDOR') {
      await deleteVendor(deleteTarget.id);
      showToast(`Vendor '${deleteTarget.name}' deleted`, 'info');
    } else if (deleteTarget.type === 'PO') {
      await deletePurchaseOrder(deleteTarget.id);
      showToast(`Purchase Order '${deleteTarget.name}' deleted`, 'info');
    } else if (deleteTarget.type === 'GRN') {
      await deleteGoodsReceiveNote(deleteTarget.id);
      showToast(`GRN record '${deleteTarget.name}' deleted`, 'info');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* Top Workspace Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('DASHBOARD')}
            className="text-slate-400 hover:text-white flex items-center space-x-1 transition"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-bold text-amber-300 flex items-center space-x-1.5">
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>Procurement, OEM Vendors & Consignment Intake Workspace</span>
          </span>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold ml-2">
            LIVE BACKEND CONNECTED
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition text-[11px]"
            title="Reload real data from backend"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setView('DASHBOARD')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition text-[11px] font-semibold"
            title="Close workspace (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
            : toastMessage.type === 'warning'
            ? 'bg-amber-950/90 text-amber-300 border-amber-800'
            : 'bg-cyan-950/90 text-cyan-300 border-cyan-800'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Summary Bar (Real computed counts, zero dummy data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/60 border-b border-slate-800">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Registered Vendors</div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{totalVendorsCount}</div>
            <div className="text-[10px] text-slate-500">Hardware & OEM Partners</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active PO Orders</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{activeOrdersCount}</div>
            <div className="text-[10px] text-slate-500">Approved / In-Transit</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Committed PO Value</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">৳{totalProcurementSpendBDT.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Total Hardware Indents</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verified GRNs</div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">{grnCount}</div>
            <div className="text-[10px] text-slate-500">Intake Allocated to Bay</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Navigation & Action Controls */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('VENDORS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'VENDORS'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>OEM & Suppliers Directory ({totalVendorsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'ORDERS'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Purchase Orders (PO) ({state.purchaseOrders?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('GRN')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'GRN'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Consignment Intake (GRN) ({grnCount})</span>
          </button>
        </div>

        <div>
          {activeTab === 'VENDORS' && (
            <button
              onClick={openAddVendor}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Vendor</span>
            </button>
          )}

          {activeTab === 'ORDERS' && (
            <button
              onClick={openAddPO}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Purchase Order (PO)</span>
            </button>
          )}

          {activeTab === 'GRN' && (
            <button
              onClick={() => openAddGRN()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inward Intake (Create GRN)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================================= */}
        {/* TAB 1: VENDORS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === 'VENDORS' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search vendors by name, code, contact..."
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={vendorCategoryFilter}
                  onChange={(e) => setVendorCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Hardware & Networking OEM">Hardware & Networking OEM</option>
                  <option value="Enterprise Cloud & SaaS">Enterprise Cloud & SaaS</option>
                  <option value="Datacenter Power & Cooling">Datacenter Power & Cooling</option>
                  <option value="Cybersecurity Appliances">Cybersecurity Appliances</option>
                  <option value="Consumables & Accessories">Consumables & Accessories</option>
                </select>
              </div>
            </div>

            {/* Vendor Table or Empty State */}
            {filteredVendors.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-3">
                <Building className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">No Vendors Registered Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your procurement database is ready for real vendor data. Click the button below to register your first supplier/vendor.
                </p>
                <button
                  onClick={openAddVendor}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register First Vendor</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Vendor Code</th>
                      <th className="py-3 px-4">Company Name</th>
                      <th className="py-3 px-4">Supply Category</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Payment Terms</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredVendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">{vendor.code}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100">{vendor.name}</div>
                          {vendor.binNo && <div className="text-[10px] text-slate-400">BIN: {vendor.binNo}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-700">
                            {vendor.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{vendor.contactPerson}</td>
                        <td className="py-3 px-4 text-slate-400 space-y-0.5">
                          {vendor.phone && <div className="flex items-center space-x-1 text-[11px]"><Phone className="w-3 h-3 text-emerald-400" /><span>{vendor.phone}</span></div>}
                          {vendor.email && <div className="flex items-center space-x-1 text-[11px]"><Mail className="w-3 h-3 text-cyan-400" /><span>{vendor.email}</span></div>}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{vendor.paymentTerms}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vendor.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => openEditVendor(vendor)}
                              className="p-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
                              title="Edit Vendor"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'VENDOR', id: vendor.id, name: vendor.name })}
                              className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                              title="Delete Vendor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PURCHASE ORDERS (PO) */}
        {/* ========================================================================= */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search PO number, vendor, approver..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Order Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="IN_TRANSIT">In-Transit</option>
                  <option value="RECEIVED">Received</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table or Empty State */}
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">No Purchase Orders Issued Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Issue hardware/license purchase orders directly to registered vendors. All orders are recorded into the corporate database.
                </p>
                <button
                  onClick={openAddPO}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold transition shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue First Purchase Order</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">PO Number</th>
                      <th className="py-3 px-4">Vendor / Supplier</th>
                      <th className="py-3 px-4">Items Summary</th>
                      <th className="py-3 px-4">Total Amount (BDT)</th>
                      <th className="py-3 px-4">Delivery Due</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{order.poNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-100">{order.vendorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{order.vendorCode}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div>{order.items?.length || 0} line item(s)</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {order.items?.map(i => `${i.itemName} (${i.quantity})`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          ৳{(order.totalAmountBDT || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                          {order.expectedDelivery}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.priority === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : order.priority === 'URGENT'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {order.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updatePurchaseOrderStatus(order.id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="IN_TRANSIT">IN_TRANSIT</option>
                            <option value="RECEIVED">RECEIVED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {order.status !== 'RECEIVED' && (
                              <button
                                onClick={() => openAddGRN(order)}
                                className="px-2 py-1 bg-purple-950 hover:bg-purple-800 text-purple-300 border border-purple-700 rounded text-[10px] font-bold flex items-center space-x-1 transition"
                                title="Receive goods against this PO"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Receive</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedPOForView(order)}
                              className="p-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                              title="View / Print PO"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteTarget({ type: 'PO', id: order.id, name: order.poNumber })}
                              className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                              title="Delete PO"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CONSIGNMENT INTAKE & GRN */}
        {/* ========================================================================= */}
        {activeTab === 'GRN' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search GRN, challan, carrier, vendor..."
                  value={grnSearch}
                  onChange={(e) => setGrnSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <button
                onClick={() => openAddGRN()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Inward Challan Intake</span>
              </button>
            </div>

            {/* GRN List or Empty State */}
            {filteredGRNs.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center space-y-3">
                <Truck className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">No Goods Receive Notes (GRN) Generated Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When deliveries arrive at the datacenter staging bay, register the Challan to issue an official Goods Receive Note.
                </p>
                <button
                  onClick={() => openAddGRN()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Receive First Consignment</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGRNs.map((grn) => (
                  <div key={grn.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-purple-600/50 transition shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-mono font-bold text-purple-400 text-xs">{grn.grnNumber}</span>
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          ALLOCATED TO RACK
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">OEM Challan:</span>
                          <span className="font-mono text-amber-400 font-bold">{grn.challanNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">PO Reference:</span>
                          <span className="font-mono text-slate-200">{grn.poNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Supplier:</span>
                          <span className="text-slate-100 font-semibold">{grn.vendorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Units Received:</span>
                          <span className="font-bold text-emerald-400">{grn.itemCount} Units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Carrier Vehicle:</span>
                          <span className="text-slate-300 text-[11px] truncate max-w-[180px]">{grn.carrierVehicle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Intake By:</span>
                          <span className="text-slate-300">{grn.receivedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {grn.receivedDate ? new Date(grn.receivedDate).toLocaleDateString() : ''}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedGRNForView(grn)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white rounded text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Certificate</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'GRN', id: grn.id, name: grn.grnNumber })}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
                          title="Delete GRN"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER / EDIT VENDOR */}
      {/* ========================================================================= */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  {editingVendor ? 'Edit Supplier / Vendor Details' : 'Register New Infrastructure & OEM Supplier'}
                </h3>
              </div>
              <button onClick={() => setShowVendorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Company / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell Technologies Enterprise Ltd."
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Vendor Code *</label>
                  <input
                    type="text"
                    required
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Supply Category *</label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Hardware & Networking OEM">Hardware & Networking OEM</option>
                    <option value="Enterprise Cloud & SaaS">Enterprise Cloud & SaaS</option>
                    <option value="Datacenter Power & Cooling">Datacenter Power & Cooling</option>
                    <option value="Cybersecurity Appliances">Cybersecurity Appliances</option>
                    <option value="Consumables & Accessories">Consumables & Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir Ahmed (Account Director)"
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="e.g. enterprise.sales@vendor.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +880-1700-000000"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tax / TIN No</label>
                  <input
                    type="text"
                    placeholder="e.g. 84920491823"
                    value={vendorTaxId}
                    onChange={(e) => setVendorTaxId(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">VAT / BIN No</label>
                  <input
                    type="text"
                    placeholder="e.g. 002341982-0101"
                    value={vendorBinNo}
                    onChange={(e) => setVendorBinNo(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Payment Terms</label>
                  <select
                    value={vendorPaymentTerms}
                    onChange={(e) => setVendorPaymentTerms(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="100% Advance">100% Advance</option>
                    <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Office / Dispatch Address</label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan-2, Dhaka-1212"
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  placeholder="Additional contractual notes or SLA warranty coverage..."
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs shadow-lg transition"
                >
                  {editingVendor ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ISSUE PURCHASE ORDER (PO) */}
      {/* ========================================================================= */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Issue Hardware & Infrastructure Purchase Order (PO)
                </h3>
              </div>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target Vendor *</label>
                  {state.vendors.length === 0 ? (
                    <div className="p-2 bg-amber-950/60 border border-amber-800 text-amber-300 rounded text-[11px]">
                      No vendors registered yet. Please add a vendor first!
                    </div>
                  ) : (
                    <select
                      value={poVendorId}
                      onChange={(e) => setPoVendorId(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400 font-medium"
                    >
                      {state.vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Order Priority *</label>
                  <select
                    value={poPriority}
                    onChange={(e) => setPoPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="NORMAL">Normal Delivery</option>
                    <option value="URGENT">Urgent SLA Replacement</option>
                    <option value="CRITICAL">Critical Mission Failover</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Expected Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={poDeliveryDate}
                    onChange={(e) => setPoDeliveryDate(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Delivery Destination / Facility</label>
                <input
                  type="text"
                  value={poDeliveryLoc}
                  onChange={(e) => setPoDeliveryLoc(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">PO Line Items (Hardware / Licenses)</span>
                  <button
                    type="button"
                    onClick={handleAddPOLineItem}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[11px] font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-950 p-2 rounded border border-slate-800 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Hardware Item Name (e.g. Cisco Switch)"
                          value={item.itemName}
                          onChange={(e) => handleUpdatePOLineItem(idx, 'itemName', e.target.value)}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="SKU / Spec"
                          value={item.sku}
                          onChange={(e) => handleUpdatePOLineItem(idx, 'sku', e.target.value)}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdatePOLineItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="Unit BDT"
                          value={item.unitPriceBDT}
                          onChange={(e) => handleUpdatePOLineItem(idx, 'unitPriceBDT', Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-400 font-mono text-right"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePOLineItem(idx)}
                          disabled={poItems.length <= 1}
                          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end p-2 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 mr-2">Calculated Total PO Amount:</span>
                  <span className="text-emerald-400 font-bold text-sm">৳{poGrandTotalBDT.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Remarks / Purchase Justification</label>
                <textarea
                  rows={2}
                  placeholder="Cluster expansion buffer or project specific deployment requirement..."
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded font-bold text-xs shadow-lg transition"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INWARD CONSIGNMENT INTAKE (GENERATE GRN) */}
      {/* ========================================================================= */}
      {showGRNModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Hardware Intake, Server Consignment & OEM Receiving Hub (GRN)
                </h3>
              </div>
              <button onClick={() => setShowGRNModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGRN} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Select Purchase Order Reference</label>
                  <select
                    value={grnPOId}
                    onChange={(e) => handlePOSelectionChangeInGRN(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-purple-400 font-mono"
                  >
                    <option value="">Direct Delivery (No Prior PO)</option>
                    {state.purchaseOrders.map(p => (
                      <option key={p.id} value={p.id}>{p.poNumber} — {p.vendorName} ({p.status})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">OEM Delivery Challan No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CH-2026-9042"
                    value={grnChallanNo}
                    onChange={(e) => setGrnChallanNo(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 font-mono font-bold focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Carrier Vehicle</label>
                  <input
                    type="text"
                    value={grnVehicle}
                    onChange={(e) => setGrnVehicle(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Driver / Representative Name</label>
                  <input
                    type="text"
                    value={grnDriverName}
                    onChange={(e) => setGrnDriverName(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={grnDriverPhone}
                    onChange={(e) => setGrnDriverPhone(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Receiving Facility / Staging Bay</label>
                <input
                  type="text"
                  value={grnReceivingBay}
                  onChange={(e) => setGrnReceivingBay(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Items Verification */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-200 block">Line Items Verification (Physical QC & Serial Tagging)</span>
                <div className="space-y-2">
                  {grnItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200">{item.itemName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-[11px]">Received Qty:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.receivedQty}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setGrnItems(prev => prev.map((it, i) => i === idx ? { ...it, receivedQty: val } : it));
                            }}
                            className="w-16 p-1 bg-slate-900 border border-slate-700 rounded text-center font-mono text-emerald-400 font-bold"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Serial Numbers (e.g. SN-892104)"
                          value={item.serialNumbers}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGrnItems(prev => prev.map((it, i) => i === idx ? { ...it, serialNumbers: val } : it));
                          }}
                          className="p-1 bg-slate-900 border border-slate-700 rounded text-slate-300 text-[11px] font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Inspection Remarks"
                          value={item.remarks}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGrnItems(prev => prev.map((it, i) => i === idx ? { ...it, remarks: val } : it));
                          }}
                          className="p-1 bg-slate-900 border border-slate-700 rounded text-slate-300 text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Gate Entry & Inward Remarks</label>
                <textarea
                  rows={2}
                  value={grnRemarks}
                  onChange={(e) => setGrnRemarks(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGRNModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs shadow-lg transition"
                >
                  Register & Issue GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VIEW / PRINT OFFICIAL PURCHASE ORDER */}
      {/* ========================================================================= */}
      {selectedPOForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-amber-400 font-mono">
                Official Purchase Order: {selectedPOForView.poNumber}
              </span>
              <button onClick={() => setSelectedPOForView(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 font-sans text-xs bg-slate-950">
              <div className="border-b border-slate-800 pb-4 text-center">
                <div className="text-base font-bold text-slate-100">AURATECH IT & CLOUD ENTERPRISE</div>
                <div className="text-[11px] text-slate-400">Silicon Tower Data Center DC01, Gulshan-2, Dhaka-1212</div>
                <div className="mt-2 inline-block bg-amber-950 border border-amber-800 text-amber-300 px-3 py-1 rounded font-mono font-bold">
                  PURCHASE ORDER: {selectedPOForView.poNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-900 p-3 rounded border border-slate-800">
                <div>
                  <div className="text-slate-400 font-bold mb-1">VENDOR DETAILS</div>
                  <div className="font-bold text-slate-100">{selectedPOForView.vendorName}</div>
                  <div className="text-slate-400 font-mono">{selectedPOForView.vendorCode}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1">ORDER METADATA</div>
                  <div>Issued Date: <span className="font-mono text-slate-200">{selectedPOForView.issuedDate}</span></div>
                  <div>Delivery Due: <span className="font-mono text-amber-400 font-bold">{selectedPOForView.expectedDelivery}</span></div>
                  <div>Status: <span className="font-bold text-emerald-400">{selectedPOForView.status}</span></div>
                </div>
              </div>

              <div>
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit BDT</th>
                      <th className="p-2 text-right">Total BDT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {selectedPOForView.items?.map((it, i) => (
                      <tr key={i}>
                        <td className="p-2 font-sans font-bold text-slate-200">{it.itemName}</td>
                        <td className="p-2 text-slate-400">{it.sku}</td>
                        <td className="p-2 text-center">{it.quantity}</td>
                        <td className="p-2 text-right">৳{it.unitPriceBDT.toLocaleString()}</td>
                        <td className="p-2 text-right text-emerald-400 font-bold">৳{it.totalBDT.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 border-t border-slate-800 font-mono font-bold">
                      <td colSpan={4} className="p-2 text-right text-slate-300">Total Purchase Commitment:</td>
                      <td className="p-2 text-right text-emerald-400 text-sm">৳{(selectedPOForView.totalAmountBDT || 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                <div>
                  <div>Approved By: <span className="text-slate-200 font-bold">{selectedPOForView.approvedBy}</span></div>
                  <div>Destination: <span className="text-slate-300">{selectedPOForView.deliveryLocation}</span></div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: VIEW / PRINT OFFICIAL GRN CERTIFICATE */}
      {/* ========================================================================= */}
      {selectedGRNForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-purple-400 font-mono">
                Official Goods Receive Note (GRN): {selectedGRNForView.grnNumber}
              </span>
              <button onClick={() => setSelectedGRNForView(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 font-sans text-xs bg-slate-950">
              <div className="text-center pb-3 border-b border-slate-800">
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  HARDWARE GRN REGISTERED & ALLOCATED TO DC01 RACKS
                </span>
                <h2 className="text-lg font-bold text-slate-100 mt-2 font-mono">{selectedGRNForView.grnNumber}</h2>
                <div className="text-xs text-slate-400">
                  Intake verified at {selectedGRNForView.receivingBay} • {new Date(selectedGRNForView.receivedDate).toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">OEM Delivery Challan Ref:</span>
                  <span className="text-amber-300 font-bold">{selectedGRNForView.challanNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Linked Purchase Order:</span>
                  <span className="text-cyan-400 font-bold">{selectedGRNForView.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">OEM / Vendor Dispatch Source:</span>
                  <span className="text-slate-200">{selectedGRNForView.vendorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carrier Vehicle & Driver:</span>
                  <span className="text-slate-200">{selectedGRNForView.carrierVehicle} ({selectedGRNForView.driverName} - {selectedGRNForView.driverPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Hardware Assets Accepted:</span>
                  <span className="text-emerald-400 font-bold">{selectedGRNForView.itemCount} Units (100% Serial Verified)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Received & Inspected By:</span>
                  <span className="text-slate-200">{selectedGRNForView.receivedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remarks / Bay Placement:</span>
                  <span className="text-slate-300">{selectedGRNForView.remarks}</span>
                </div>
              </div>

              {selectedGRNForView.receivedItems && selectedGRNForView.receivedItems.length > 0 && (
                <div className="border border-slate-800 rounded p-3 bg-slate-900">
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Verified Items Breakdown</div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {selectedGRNForView.receivedItems.map((it, i) => (
                      <div key={i} className="flex justify-between text-slate-300 border-b border-slate-800/60 pb-1">
                        <span>{it.itemName}</span>
                        <span className="text-emerald-400 font-bold">{it.receivedQty} Units {it.serialNumbers ? `[${it.serialNumbers}]` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print GRN Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">Confirm Deletion</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete {deleteTarget.type === 'VENDOR' ? 'vendor' : deleteTarget.type === 'PO' ? 'purchase order' : 'GRN'} <span className="text-rose-400 font-bold font-mono">"{deleteTarget.name}"</span>?
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold shadow"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
