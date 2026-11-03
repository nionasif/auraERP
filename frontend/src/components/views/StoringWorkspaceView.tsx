import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  ArrowLeftRight,
  MoveRight,
  CheckCircle,
  Package,
  History,
  LayoutGrid,
  ShieldCheck,
  ChevronRight,
  Store,
  Server,
  X,
  Boxes,
  Plus
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { InventoryManagementSection } from '../inventory/InventoryManagementSection';
import { ITResourceDemandSection } from '../inventory/ITResourceDemandSection';
import { Brain, Cpu } from 'lucide-react';

interface StoringWorkspaceViewProps {
  store: ReturnType<typeof useERPStore>;
}

export const StoringWorkspaceView: React.FC<StoringWorkspaceViewProps> = ({ store }) => {
  const { state, setView, moveStockBetweenBins, addProduct, addInventoryItem } = store;

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'MOVEMENT_WIZARD' | 'PLANOGRAM' | 'LOGS' | 'ML_RESOURCE_PREDICTION'>('INVENTORY');
  const [selectedProductId, setSelectedProductId] = useState<string>(state.products[0]?.id || '');
  const [sourceBin, setSourceBin] = useState<string>('BR-01');
  const [targetBin, setTargetBin] = useState<string>('Rack DC-01');
  const [transferQty, setTransferQty] = useState<number>(10);
  const [movementReason, setMovementReason] = useState<'FLOOR_REPLENISHMENT' | 'BACK_TO_STORAGE'>('FLOOR_REPLENISHMENT');
  const [successIMN, setSuccessIMN] = useState<string | null>(null);

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Datacenter Servers',
    stock: 10,
    price: 75000,
    sku: '',
    binLocation: 'BR-01',
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) return;

    const sku = newProductForm.sku.trim() || `AST-${Date.now().toString().slice(-6)}`;
    const created = await addProduct({
      name: newProductForm.name.trim(),
      category: newProductForm.category,
      department: 'Datacenter & IT Infrastructure',
      price: Number(newProductForm.price) || 0,
      costPrice: Number(newProductForm.price) || 0,
      stock: Number(newProductForm.stock) || 1,
      minStock: 2,
      sku: sku,
      binLocation: newProductForm.binLocation,
      uom: 'UNIT',
    });

    if (addInventoryItem) {
      addInventoryItem({
        name: newProductForm.name.trim(),
        category: 'IT Equipment',
        subcategory: newProductForm.category,
        brand: 'AuraTech Enterprise',
        model: sku,
        serialNumber: sku,
        quantity: Number(newProductForm.stock) || 1,
        availableQuantity: Number(newProductForm.stock) || 1,
        assignedQuantity: 0,
        purchasePrice: Number(newProductForm.price) || 0,
        supplier: 'AuraTech IT Procurement',
        purchaseDate: new Date().toISOString().split('T')[0],
        warranty: '3 Year Enterprise On-site',
        location: newProductForm.binLocation === 'BR-01' ? 'Storage Vault BR-01' : 'Server Hall Rack DC-01',
        assignedEmployee: 'Unassigned (Buffer Stock)',
        status: 'Available',
        notes: 'Registered via Hardware Re-allocation Portal',
      });
    }

    if (created?.id) {
      setSelectedProductId(created.id);
    }
    setShowAddProductModal(false);
    setNewProductForm({
      name: '',
      category: 'Datacenter Servers',
      stock: 10,
      price: 75000,
      sku: '',
      binLocation: 'BR-01',
    });
  };

  const selectedProduct = (state.products && state.products.length > 0)
    ? (state.products.find(p => p.id === selectedProductId) || state.products[0])
    : null;

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    moveStockBetweenBins(
      selectedProductId,
      sourceBin,
      targetBin,
      transferQty,
      movementReason
    );
    const imnSeq = `IMN-20260924-${(state.movementLogs.length + 20).toString().padStart(3, '0')}`;
    setSuccessIMN(imnSeq);
    setTimeout(() => {
      setSuccessIMN(null);
    }, 4000);
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Workspace Breadcrumb & Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('DASHBOARD')}
            className="text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="font-bold text-amber-300 flex items-center space-x-1.5">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>IT Assets & Resources — Inventory Management</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px] hidden md:inline">
            [DC01 Silicon Tower Datacenter & Enterprise Hub]
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-[11px] text-slate-300 hidden sm:block">
            Lead: <strong className="text-amber-300">{state.currentUser?.name || state.storeInfo.currentUser.name}</strong>
          </div>
          <button
            onClick={() => setView('DASHBOARD')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition text-[11px] font-semibold"
            title="Close workspace and return to Dashboard (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close (Esc)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 flex items-center space-x-1 text-xs select-none overflow-x-auto whitespace-nowrap">
        {/* Main User Requirement: IT Inventory & Office Inventory */}
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'INVENTORY'
              ? 'border-amber-400 text-amber-300 bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span>IT Inventory & Office Inventory</span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {state.inventory?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MOVEMENT_WIZARD')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'MOVEMENT_WIZARD'
              ? 'border-amber-400 text-amber-300 bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          <span>Hardware Re-allocation Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('PLANOGRAM')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'PLANOGRAM'
              ? 'border-amber-400 text-amber-300 bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-sky-400" />
          <span>Datacenter Server Racks</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'LOGS'
              ? 'border-amber-400 text-amber-300 bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 text-emerald-400" />
          <span>Movement Notes (IMN Ledger)</span>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {state.movementLogs.length}
          </span>
        </button>

        {/* DIIT PDF Standard: ML Feature 4 - IT Resource Demand Prediction */}
        <button
          onClick={() => setActiveTab('ML_RESOURCE_PREDICTION')}
          className={`py-2.5 px-4 font-semibold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
            activeTab === 'ML_RESOURCE_PREDICTION'
              ? 'border-[#F26522] text-[#F26522] bg-orange-50/60 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Brain className="w-4 h-4 text-[#F26522]" />
          <span>ML IT Resource Demand Forecast</span>
          <span className="bg-[#30AFFF] text-white px-2 py-0.5 rounded-full text-[9px] font-bold border border-sky-300">
            ML Feature 4
          </span>
        </button>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Render ML Feature 4: IT Resource & Computing Demand Prediction */}
        {activeTab === 'ML_RESOURCE_PREDICTION' && <ITResourceDemandSection />}

        {/* Render Inventory & Office Inventory Section */}
        {activeTab === 'INVENTORY' && <InventoryManagementSection store={store} />}
        {activeTab === 'MOVEMENT_WIZARD' && (
          !selectedProduct ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto shadow-2xl space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Boxes className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">No Hardware Assets Available for Relocation</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                  The datacenter asset catalog is currently empty. Please register hardware assets or equipment in the IT Inventory section before executing rack re-allocations.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs inline-flex items-center space-x-2 shadow-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Hardware Product Here</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('INVENTORY')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs inline-flex items-center space-x-2 shadow-lg transition"
                >
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  <span>Go to IT Inventory & Office Inventory</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Movement Form (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
                      <MoveRight className="w-4 h-4 text-amber-400" />
                      <span>Execute Internal Hardware & Asset Re-allocation</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Mount or relocate physical servers, network modules and license vaults between storage and active rack bays.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(true)}
                      className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded text-xs font-bold flex items-center space-x-1 shadow transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                    <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      Authorized Lead Action
                    </span>
                  </div>
                </div>

                {successIMN && (
                  <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-lg flex items-center space-x-2 animate-fade-in font-mono text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <strong>Asset Successfully Relocated!</strong> Note #{successIMN} issued.
                      <div>
                        {transferQty} units of {selectedProduct?.name || 'Asset'} transferred from {sourceBin} to {targetBin}.
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-xs font-sans">
                  {/* Movement Direction */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                      Movement Operation Type:
                    </label>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setMovementReason('FLOOR_REPLENISHMENT');
                          setSourceBin('BR-01');
                          setTargetBin('Rack DC-01');
                        }}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          movementReason === 'FLOOR_REPLENISHMENT'
                            ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-1 ring-amber-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-sans text-xs">Storage Vault ➔ Server Hall Racks</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Active Deployment & Production Provisioning</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMovementReason('BACK_TO_STORAGE');
                          setSourceBin('Rack DC-01');
                          setTargetBin('BR-01');
                        }}
                        className={`p-2.5 rounded-lg border text-left transition ${
                          movementReason === 'BACK_TO_STORAGE'
                            ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-1 ring-amber-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-sans text-xs">Server Hall Racks ➔ Storage Vault</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Decommissioning or Maintenance Pullback</div>
                      </button>
                    </div>
                  </div>

                  {/* Product Selector */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                      Select Solution / Asset to Relocate:
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                    >
                      {state.products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Total Stock: {p.stock} units • Spec: {p.size || 'Enterprise'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Source & Destination Bins */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                        Source Location (From):
                      </label>
                      <select
                        value={sourceBin}
                        onChange={(e) => setSourceBin(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                      >
                        {state.bins.map(b => (
                          <option key={`src-${b.id}`} value={b.code}>
                            {b.code} ({b.name}) - {b.occupiedUnits}/{b.capacityUnits} units
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                        Destination Location (To):
                      </label>
                      <select
                        value={targetBin}
                        onChange={(e) => setTargetBin(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                      >
                        {state.bins.map(b => (
                          <option key={`tgt-${b.id}`} value={b.code}>
                            {b.code} ({b.name}) - {b.occupiedUnits}/{b.capacityUnits} units
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-slate-400 font-semibold">
                          Quantity of Units to Relocate:
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (In Stock: <span className="text-amber-400 font-bold">{selectedProduct?.stock ?? 0}</span>)
                        </span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={transferQty}
                        onChange={(e) => setTransferQty(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 font-mono font-bold text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1 font-semibold">
                        Inventory Asset Transfer Value:
                      </label>
                      <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-emerald-400 font-bold text-sm">
                        ৳{(transferQty * (selectedProduct?.price ?? 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Authorize & Execute Rack Allocation (Generate IMN)</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Live Rack Preview & Recent Audit (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Selected Product Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                  <div className="text-[10px] text-slate-400 font-sans uppercase font-bold">
                    Active Selected Hardware / Solution
                  </div>
                  <div className="text-sm font-bold text-slate-100 font-sans">{selectedProduct?.name || 'No Asset Selected'}</div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                    <span>SKU: {selectedProduct?.sku || '-'}</span>
                    <span>Barcode: {selectedProduct?.barcode || '-'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Unit Rate: ৳{(selectedProduct?.price ?? 0).toLocaleString()}</span>
                    <span className="text-amber-300 font-bold">Total Stock: {selectedProduct?.stock ?? 0} units</span>
                  </div>
                </div>

                {/* Live Location Visual */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 text-xs">
                  <div className="font-bold text-slate-200">Current Datacenter Distribution</div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center font-mono">
                    <div>
                      <span className="text-amber-300 font-bold">{sourceBin}</span>
                      <div className="text-[10px] text-slate-500 font-sans">Source Vault / Bay</div>
                    </div>
                    <MoveRight className="w-4 h-4 text-slate-500" />
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{targetBin}</span>
                      <div className="text-[10px] text-slate-500 font-sans">Target Rack Cluster</div>
                    </div>
                  </div>
                </div>

                {/* Recent Movement Notes */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="font-bold text-slate-200">Recent Movement Notes (IMN)</div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {state.movementLogs.slice(0, 3).map(log => (
                      <div key={log.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-amber-300 font-bold">{log.imnNo}</span>
                          <div className="text-[10px] text-slate-400 font-sans">{log.fromLocation} ➔ {log.toLocation}</div>
                        </div>
                        <span className="text-emerald-400 font-bold">+{log.qty} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'PLANOGRAM' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {state.bins.map(bin => {
                const capacity = bin.capacityUnits || 1;
                const percent = Math.min(100, Math.round(((bin.occupiedUnits || 0) / capacity) * 100));
                return (
                  <div key={bin.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-amber-300 text-xs">{bin.code}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{percent}% capacity</span>
                    </div>
                    <div className="font-semibold text-slate-200 text-xs">{bin.name}</div>
                    <div className="text-[10px] text-slate-400">{bin.department}</div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>Mounted: {bin.occupiedUnits}</span>
                      <span>Total Bays: {bin.capacityUnits}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="p-2.5">IMN Note #</th>
                  <th className="p-2.5">Date & Time</th>
                  <th className="p-2.5">Asset / Solution Description</th>
                  <th className="p-2.5">From Location</th>
                  <th className="p-2.5">To Location</th>
                  <th className="p-2.5 text-center">Units Moved</th>
                  <th className="p-2.5">Authorized By</th>
                  <th className="p-2.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {state.movementLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                      No internal hardware movement notes (IMN) recorded yet.
                    </td>
                  </tr>
                ) : (
                  state.movementLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="p-2.5 text-amber-300 font-bold">{log.imnNo}</td>
                      <td className="p-2.5 text-slate-400">{log.date} {log.time}</td>
                      <td className="p-2.5 font-sans text-slate-200">{log.productName}</td>
                      <td className="p-2.5 text-slate-300">{log.fromLocation}</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{log.toLocation}</td>
                      <td className="p-2.5 text-center font-bold text-slate-100">{log.qty} units</td>
                      <td className="p-2.5 font-sans text-slate-400">{log.authorizedBy}</td>
                      <td className="p-2.5 font-sans text-slate-500 text-[10px]">{log.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Hardware / Datacenter Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Add Hardware Product / Asset</h3>
                  <p className="text-[11px] text-slate-400">Register new equipment into the Datacenter Catalog</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProduct} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Product / Hardware Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell PowerEdge R740 Server / Cisco Catalyst Switch"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-100 outline-none"
                  >
                    <option value="Datacenter Servers">Datacenter Servers</option>
                    <option value="Network Infrastructure">Network Infrastructure</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Storage Array & SAN">Storage Array & SAN</option>
                    <option value="Security Appliance">Security Appliance</option>
                    <option value="Enterprise Solution">Enterprise Solution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Serial / SKU Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SRV-2026-001"
                    value={newProductForm.sku}
                    onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Quantity / Units</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-100 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit Value (৳ Taka)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-100 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Storage / Rack Location</label>
                <select
                  value={newProductForm.binLocation}
                  onChange={(e) => setNewProductForm({ ...newProductForm, binLocation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-slate-100 outline-none font-mono"
                >
                  <option value="BR-01">BR-01 Storage Vault (Warehouse)</option>
                  <option value="Rack DC-01">Rack DC-01 Server Hall Racks (Production)</option>
                  <option value="Floor 14 Storage">Floor 14 - IT Peripheral Room</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save & Add Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
