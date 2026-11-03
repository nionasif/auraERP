import React, { useState } from 'react';
import { X, Sparkles, Plus, Layers, DollarSign, Package, ShieldCheck, Tag } from 'lucide-react';
import { Product } from '../../types/erp';

interface AddSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (productData: Partial<Product>) => Promise<any>;
  departments: Array<{ id: string; name: string }>;
}

export const AddSolutionModal: React.FC<AddSolutionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  departments
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(departments[0]?.name || 'Cloud Infrastructure & DevOps');
  const [category, setCategory] = useState('Enterprise Solution');
  const [price, setPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [size, setSize] = useState('Tier-1 High-Availability');
  const [uom, setUom] = useState('DEPLOYMENT');
  const [sku, setSku] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a Solution / Service name.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setError('Please provide a valid selling price.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onAdd({
        name: name.trim(),
        department,
        category,
        price: Number(price),
        costPrice: costPrice !== '' ? Number(costPrice) : Math.round(Number(price) * 0.6),
        stock: stock !== '' ? Number(stock) : 10,
        minStock: 2,
        size: size.trim(),
        uom,
        sku: sku.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add solution to real-time database');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Add Real-Time IT Solution / Service</h3>
              <p className="text-[11px] text-slate-400">Directly syncs to backend enterprise database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Solution / Service Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS & Azure Multi-Cloud Landing Zone Architecture"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Practice Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Service Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                <option value="Enterprise Solution">Enterprise Solution</option>
                <option value="Cloud Architecture">Cloud Architecture</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cybersecurity Retainer">Cybersecurity Retainer</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Cloud Subscription">Cloud Subscription</option>
                <option value="Managed Services">Managed Services</option>
                <option value="Datacenter Hardware">Datacenter Hardware</option>
                <option value="Consulting & Advisory">Consulting & Advisory</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Selling Price (৳ BDT) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="450000"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Estimated Delivery Cost (৳ BDT)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Auto (60% of price)"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Available Units / Capacity</label>
              <input
                type="number"
                min="1"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Billing UOM</label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                <option value="DEPLOYMENT">DEPLOYMENT</option>
                <option value="MILESTONE">MILESTONE</option>
                <option value="MONTHLY_SLA">MONTHLY_SLA</option>
                <option value="ANNUAL_RETAINER">ANNUAL_RETAINER</option>
                <option value="SOLUTION">SOLUTION</option>
                <option value="SEAT_PACK">SEAT_PACK</option>
                <option value="UNIT">UNIT</option>
                <option value="HOURS">HOURS</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Specification / Tier</label>
              <input
                type="text"
                placeholder="Tier-1 High-Availability"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Custom SKU / Solution Code <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CLD-AWS-LZ01 (leave blank to auto-generate)"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Adding...' : 'Add to Catalog & Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
