import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  CheckCircle,
  Truck,
  Search,
  UserCheck,
  Check,
  Server,
  Key
} from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface EcommerceModalProps {
  store: ReturnType<typeof useERPStore>;
}

export const EcommerceModal: React.FC<EcommerceModalProps> = ({ store }) => {
  const { state, closeModal } = store;
  const [activeTab, setActiveTab] = useState<'PICKUP' | 'DISPATCH'>('PICKUP');
  const [otpInput, setOtpInput] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ECOM-DH-4891');
  const [collectedAlert, setCollectedAlert] = useState<string | null>(null);

  const activeOrder = state.ecommerceOrders.find(o => o.orderId === selectedOrderId) || state.ecommerceOrders[0];

  const handleHandover = () => {
    setCollectedAlert(`Order ${activeOrder.orderId} verified and provisioned to ${activeOrder.customerName}!`);
    setTimeout(() => setCollectedAlert(null), 3000);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Client Portal & Cloud License Self-Service Provisioning (DC01 Desk)
            </h3>
          </div>
          <button onClick={closeModal} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-2 bg-slate-950 border-b border-slate-800 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('PICKUP')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'PICKUP' ? 'bg-slate-850 text-emerald-400 border-b-2 border-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Client Portal Direct Key / Hardware Pickups</span>
          </button>

          <button
            onClick={() => setActiveTab('DISPATCH')}
            className={`py-2.5 px-3 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'DISPATCH' ? 'bg-slate-850 text-emerald-400 border-b-2 border-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Corporate Hardware Shipments (B2B Logistics)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {collectedAlert && (
            <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{collectedAlert}</span>
            </div>
          )}

          {activeTab === 'PICKUP' && (
            <div className="space-y-4">
              <div className="text-[11px] text-slate-400">
                Enterprise clients who placed orders via AuraTech Client Portal for physical appliance hand-off or cryptographic key pickup:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {state.ecommerceOrders.filter(o => o.fulfillmentType === 'STORE_PICKUP').map(order => (
                  <div
                    key={order.orderId}
                    onClick={() => setSelectedOrderId(order.orderId)}
                    className={`p-3 rounded-lg border cursor-pointer transition select-none ${
                      selectedOrderId === order.orderId
                        ? 'bg-emerald-950/40 border-emerald-500 shadow ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-amber-300">{order.orderId}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-sans font-bold ${
                        order.status === 'READY_FOR_PICKUP'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : order.status === 'COLLECTED'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-950 text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="text-slate-200 font-semibold mt-1">{order.customerName} ({order.phone})</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Vault / Bin: <strong className="text-amber-300 font-mono">{order.lockerNumber}</strong> • Ordered: {order.orderDate}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-850 flex justify-between items-center font-mono">
                      <span className="text-[10px] text-slate-400">{order.items[0]?.name}</span>
                      <span className="text-emerald-400 font-bold">৳{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Handover OTP Terminal */}
              {activeOrder && activeOrder.status !== 'COLLECTED' && (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-slate-400 text-[10px] font-sans">Active Enterprise Client Handover:</span>
                      <div className="text-sm font-bold text-slate-100">{activeOrder.customerName} ({activeOrder.orderId})</div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] font-sans">Hardware Vault / Bay:</span>
                      <div className="text-xs text-amber-300 font-bold">{activeOrder.lockerNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit Portal Verification OTP / Token (e.g. 482109)"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded p-2 text-xs font-mono text-emerald-300 w-72 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={handleHandover}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 font-sans"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify Security Token & Complete Handover</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'DISPATCH' && (
            <div className="space-y-3 font-mono">
              <div className="text-[11px] text-slate-400 font-sans mb-1">
                Client portal hardware appliance orders provisioned directly from DC01 datacenter inventory for corporate courier dispatch:
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-amber-300">ORD-DC-4890</span>
                    <span className="bg-sky-950 text-sky-400 border border-sky-800 px-1.5 py-0.2 rounded text-[10px]">
                      DISPATCHED
                    </span>
                  </div>
                  <div className="text-slate-200 font-sans text-[11px] mt-1">Mahir Faisal, Head of Infrastructure (01922-113355)</div>
                  <div className="text-[10px] text-slate-400">
                    Carrier: <strong>Secure B2B Express (Tracking: B2B-EXP-98012)</strong> • Fortinet FortiGate 100F Appliance
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">৳385,000</span>
                  <div className="text-[10px] text-slate-500">Corporate Wire Settled</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
