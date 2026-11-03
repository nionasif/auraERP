import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  PlayCircle,
  CreditCard,
  UserPlus,
  UserCheck,
  ShoppingBag,
  Percent,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  Receipt,
  Package
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { Product } from '../../types/erp';
import { AddSolutionModal } from './AddSolutionModal';

interface PosTerminalProps {
  store: ReturnType<typeof useERPStore>;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({ store }) => {
  const {
    state,
    addToCart,
    updateCartQty,
    updateCartDiscount,
    removeFromCart,
    clearCart,
    parkCart,
    recallParkedCart,
    selectCustomer,
    openModal,
    setView,
    addProduct,
    deleteProduct
  } = store;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bagChargeSelected, setBagChargeSelected] = useState<boolean>(true);
  const [bagType, setBagType] = useState<'STANDARD' | 'JUTE'>('STANDARD');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filter products by department and search
  const filteredProducts = state.products.filter(product => {
    const matchesDept = selectedDept === 'ALL' || product.department === selectedDept;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Handle barcode quick scan enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const matched = state.products.find(
      p => p.barcode === searchTerm.trim() || p.sku.toLowerCase() === searchTerm.trim().toLowerCase()
    );

    if (matched) {
      addToCart(matched, 1);
      setSearchTerm('');
    } else {
      // First partial match
      const partial = state.products.find(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (partial) {
        addToCart(partial, 1);
        setSearchTerm('');
      }
    }
  };

  // Calculations
  const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountedSubtotal = state.cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountTotal = subtotal - discountedSubtotal;
  const vatRate = 0.05; // 5% IT Services VAT
  const vatAmount = Math.round(discountedSubtotal * vatRate);
  const bagCharge = bagChargeSelected ? (bagType === 'STANDARD' ? 200 : 350) : 0;
  const grandTotal = discountedSubtotal + vatAmount + bagCharge;
  const totalItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  // Management authorization check for Enterprise Solutions & Services
  const canManageSolutions =
    state.currentUser?.role === 'Super Admin' ||
    state.currentUser?.role === 'Sales Manager' ||
    Boolean(state.currentUser?.permissions?.canManageInventory);

  // Handle checkout
  const handleProceedPayment = () => {
    if (state.cart.length === 0) return;
    openModal('PAYMENT', {
      grandTotal,
      subtotal,
      discountTotal,
      vatAmount,
      bagCharge,
    });
  };

  // Handle Customer Lookup
  const handleCustomerLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerSearch.trim()) return;
    const found = state.customers.find(
      c => c.phone.includes(customerSearch.trim()) || c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );
    if (found) {
      selectCustomer(found);
      setCustomerSearch('');
    } else {
      alert(`Corporate Client with query "${customerSearch}" not found. You can register them as a new account!`);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden text-slate-200">
      {/* POS Top Control Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Billing Terminal Desk #{state.storeInfo.activeRegisterNo}</span>
          </div>

          <div className="text-slate-400 hidden sm:flex items-center space-x-1">
            <span>Billing Lead:</span>
            <strong className="text-slate-200 font-semibold">{state.storeInfo.currentUser.name}</strong>
          </div>

          <div className="text-slate-500 font-mono text-[11px] hidden md:inline">
            Node: {state.storeInfo.outletCode} - {state.storeInfo.outletName}
          </div>
        </div>

        {/* Parked Carts and Shift Management */}
        <div className="flex items-center space-x-2">
          {state.parkedCarts.length > 0 && (
            <div className="flex items-center space-x-1 bg-amber-950/70 border border-amber-800 px-2 py-0.5 rounded text-amber-300 font-mono">
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{state.parkedCarts.length} Parked SOW(s)</span>
              <button
                onClick={() => openModal('RECALL_CARTS')}
                className="ml-1 underline font-bold hover:text-white"
              >
                Recall
              </button>
            </div>
          )}

          {canManageSolutions && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-bold transition shadow-sm text-xs"
              title="Add Enterprise Solution or Service to Live Catalog & Database"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Solution</span>
            </button>
          )}

          <button
            onClick={() => openModal('INVOICE_MANAGEMENT')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition"
            title="Generate & View IT Invoices"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>Invoices & SOWs</span>
            {state.invoices.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-bold">
                {state.invoices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => openModal('SHIFT_REGISTER')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition"
          >
            <span>Shift / Day Close</span>
          </button>

          <button
            onClick={() => setView('DASHBOARD')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 font-medium transition"
            title="Exit Billing to Management Dashboard"
          >
            <span>Exit to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane POS Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT / CENTER PANE: Product Catalog & Fast Barcode Scanner (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col border-r border-slate-800 p-3 space-y-3 overflow-hidden bg-slate-950">
          {/* Barcode Scanner Bar */}
          <form onSubmit={handleBarcodeSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 text-amber-400 absolute left-3 top-2.5" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan Barcode or Search SKU / Solution Name (e.g. 8941001201, AWS, Kubernetes, Fortinet)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add (Enter)</span>
            </button>
          </form>

          {/* Department Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs select-none">
            <button
              onClick={() => setSelectedDept('ALL')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                selectedDept === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Solutions
            </button>
            {state.departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.name)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                  selectedDept === dept.name
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Product Grid / Empty State */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-xl border border-slate-850">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3 text-slate-400">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">No Solutions Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                  {searchTerm
                    ? `No solutions matching "${searchTerm}" in the selected department.`
                    : `No enterprise solutions currently cataloged under ${selectedDept}.`}
                </p>
                {canManageSolutions && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Real-Time Solution Now</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {filteredProducts.map(product => {
                  const inCart = state.cart.find(c => c.product.id === product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product, 1)}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-150 relative group shadow-sm select-none"
                    >
                      {inCart && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow">
                          {inCart.quantity}
                        </span>
                      )}

                      {canManageSolutions && !inCart && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${product.name}" from live catalog?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 transition shadow"
                          title="Delete solution from database"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                          <span className="truncate">{product.sku}</span>
                          {product.size && (
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-semibold truncate max-w-[80px]">
                              {product.size}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-tight">
                          {product.name}
                        </h4>
                        <div className="text-[10px] text-slate-400 mt-1 truncate">{product.department}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-sm font-extrabold text-amber-400 font-mono">
                          ৳{product.price.toLocaleString()}
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          product.stock <= product.minStock
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'text-slate-400 bg-slate-800'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Cart & Checkout Summary (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border-l border-slate-800 p-3 select-none">
          {/* Customer Loyalty Search Bar */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 mb-2.5">
            {state.selectedCustomer ? (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                      <span>{state.selectedCustomer.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        state.selectedCustomer.tier === 'PLATINUM' || state.selectedCustomer.tier === 'ENTERPRISE'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : state.selectedCustomer.tier === 'GOLD'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {state.selectedCustomer.tier} ACCOUNT
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {state.selectedCustomer.phone} • {state.selectedCustomer.points} SLA credits available
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => selectCustomer(null)}
                  className="text-slate-400 hover:text-rose-400 text-xs p-1"
                  title="Remove customer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomerLookup} className="flex items-center space-x-1.5">
                <input
                  type="text"
                  placeholder="Enter Corporate Client Mobile / Name (017..., Apex, FinTech)..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700 transition"
                >
                  Find
                </button>
                <button
                  type="button"
                  onClick={() => openModal('NEW_CUSTOMER')}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  title="Add new corporate account"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                </button>
              </form>
            )}
          </div>

          {/* Cart Items Table */}
          <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 overflow-y-auto mb-2.5">
            {state.cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <ShoppingBag className="w-10 h-10 mb-2 text-slate-700" />
                <p className="text-xs font-semibold text-slate-400">Billing invoice is empty</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Scan barcode, search SKU, or select IT solutions from catalog to start billing.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800 sticky top-0">
                    <th className="p-2">Solution / Asset</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Disc %</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-[11px]">
                  {state.cart.map(item => (
                    <tr key={item.product.id} className="hover:bg-slate-900/60">
                      <td className="p-2 font-sans">
                        <div className="font-semibold text-slate-200 line-clamp-1">{item.product.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.product.barcode} {item.product.size && `• Spec: ${item.product.size}`}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-bold text-amber-300 w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-2 text-right text-slate-300">
                        ৳{item.product.price.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={item.discountPercent}
                          onChange={(e) => updateCartDiscount(item.product.id, Number(e.target.value))}
                          aria-label="Item discount percentage"
                          className="w-10 bg-slate-850 border border-slate-700 rounded text-center text-[10px] py-0.5 text-amber-300"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-emerald-400">
                        ৳{item.lineTotal.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                          title="Void item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Provisioning Kit & Documentation Fee */}
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs mb-2.5">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={bagChargeSelected}
                onChange={(e) => setBagChargeSelected(e.target.checked)}
                className="accent-amber-400"
              />
              <span className="text-[11px] font-medium">Add Hardware Provisioning / Cable Kit</span>
            </label>

            {bagChargeSelected && (
              <div className="flex items-center space-x-2 text-[10px] font-mono">
                <button
                  onClick={() => setBagType('STANDARD')}
                  className={`px-2 py-0.5 rounded ${bagType === 'STANDARD' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}
                >
                  Cat6A Kit (৳200)
                </button>
                <button
                  onClick={() => setBagType('JUTE')}
                  className={`px-2 py-0.5 rounded ${bagType === 'JUTE' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}
                >
                  Fiber Kit (৳350)
                </button>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs font-mono mb-2.5">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({totalItemCount} deliverables):</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Discount Applied:</span>
                <span>-৳{discountTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>VAT / Tax (5% Mushak 6.3 IT Services):</span>
              <span>৳{vatAmount.toLocaleString()}</span>
            </div>
            {bagChargeSelected && (
              <div className="flex justify-between text-slate-400">
                <span>Provisioning & Patch Kit:</span>
                <span>৳{bagCharge}</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-slate-100 font-sans">
              <span className="text-sm font-bold uppercase tracking-wider">Grand Total:</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* POS Action Hotkeys & Payment Trigger */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            <button
              onClick={parkCart}
              disabled={state.cart.length === 0}
              className="px-2 py-2 rounded bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-amber-300 font-semibold text-[11px] border border-slate-700 flex flex-col items-center justify-center transition"
              title="Hold active invoice for client"
            >
              <PauseCircle className="w-3.5 h-3.5 mb-0.5" />
              <span>Hold (F3)</span>
            </button>

            <button
              onClick={() => openModal('RECALL_CARTS')}
              disabled={state.parkedCarts.length === 0}
              className="px-2 py-2 rounded bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-sky-300 font-semibold text-[11px] border border-slate-700 flex flex-col items-center justify-center transition"
              title="Recall held invoices"
            >
              <PlayCircle className="w-3.5 h-3.5 mb-0.5" />
              <span>Recall ({state.parkedCarts.length})</span>
            </button>

            <button
              onClick={clearCart}
              disabled={state.cart.length === 0}
              className="px-2 py-2 rounded bg-slate-800 hover:bg-rose-950/60 disabled:opacity-40 text-rose-400 font-semibold text-[11px] border border-slate-700 flex flex-col items-center justify-center transition"
              title="Clear active invoice"
            >
              <Trash2 className="w-3.5 h-3.5 mb-0.5" />
              <span>Void (F8)</span>
            </button>

            <button
              onClick={() => openModal('INVOICE_LIST')}
              className="px-2 py-2 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-[11px] border border-slate-700 flex flex-col items-center justify-center transition"
              title="Billing History & SOW Reprint"
            >
              <ShoppingBag className="w-3.5 h-3.5 mb-0.5" />
              <span>Invoices</span>
            </button>
          </div>

          {/* Large Primary Pay Button */}
          <button
            onClick={handleProceedPayment}
            disabled={state.cart.length === 0}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <CreditCard className="w-5 h-5" />
            <span>Generate SOW & Invoice (F12) • ৳{grandTotal.toLocaleString()}</span>
          </button>
        </div>
      </div>

      {/* Add Solution Modal */}
      <AddSolutionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addProduct}
        departments={state.departments}
      />
    </div>
  );
};
