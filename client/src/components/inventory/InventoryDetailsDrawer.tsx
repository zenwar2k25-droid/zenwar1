import React from 'react';
import { X, Package, Calendar, Tag, Layers, MapPin, CheckCircle, Image as ImageIcon, History } from 'lucide-react';
import type { InventoryItem, InventoryHistory } from '../../data/seedData';
import { useDatabase } from '../../context/DatabaseContext';

interface InventoryDetailsDrawerProps {
  product: InventoryItem | null;
  onClose: () => void;
}

export const InventoryDetailsDrawer: React.FC<InventoryDetailsDrawerProps> = ({ product, onClose }) => {
  const { inventoryHistory, currentUser } = useDatabase();

  if (!product) return null;

  // Filter history for this product
  const history = inventoryHistory
    .filter(h => h.productId === product.id && h.tenantDomain === currentUser?.tenantDomain)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[var(--bg-card)] border-l border-[var(--border-card)] shadow-2xl z-[150] flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-[var(--border-card)] bg-black/20">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Product Details</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 tracking-wide">
            SKU: {product.sku || 'N/A'}
          </p>
        </div>
        <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-text-primary hover:bg-hover-bg rounded-xl transition-all cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* Product Identity */}
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-2xl bg-bg-card border border-border-card flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
            {product.imageBase64 ? (
              <img src={product.imageBase64} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-600" size={32} />
            )}
          </div>
          <div className="pt-1">
            <h3 className="text-lg font-bold text-text-primary leading-tight">{product.name}</h3>
            <div className="flex gap-2 text-xs text-[var(--color-primary)] font-semibold mt-1">
              <span>{product.brand || 'No Brand'}</span>
              <span>•</span>
              <span>{product.category}</span>
            </div>
            {product.barcode && (
              <p className="text-[10px] text-text-muted font-mono mt-2 bg-white/5 px-2 py-1 rounded w-fit border border-border-card">
                BC: {product.barcode}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="p-4 bg-black/20 rounded-xl border border-[var(--border-card)]">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
          </div>
        )}

        <div className="h-px bg-white/5"></div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-black/20 rounded-xl border border-[var(--border-card)]">
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Stock</span>
            </div>
            <div className="text-xl font-extrabold text-text-primary font-mono">
              {product.stock} <span className="text-xs text-text-muted font-sans">{product.unitType || 'pcs'}</span>
            </div>
            {product.stock <= product.threshold && (
              <p className="text-[10px] text-red-400 font-bold mt-1">Low Stock Warning</p>
            )}
          </div>
          
          <div className="p-4 bg-black/20 rounded-xl border border-[var(--border-card)]">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={14} className="text-[var(--color-primary)]" />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Selling Price</span>
            </div>
            <div className="text-xl font-extrabold text-[var(--color-primary)] font-mono">
              ₹{product.price.toLocaleString()}
            </div>
            <p className="text-[10px] text-text-muted font-mono mt-1">Cost: ₹{product.purchasePrice || 0}</p>
          </div>
        </div>

        {/* Location & Tax Info */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-black/20 border border-[var(--border-card)] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-text-secondary"><MapPin size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Location</p>
                <p className="text-xs font-semibold text-text-primary">
                  {[product.rack, product.shelf, product.bin].filter(Boolean).join(' • ') || product.location || 'Unassigned'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 border border-[var(--border-card)] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-text-secondary"><Layers size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">Tax & HSN</p>
                <p className="text-xs font-semibold text-text-primary">
                  GST {product.gstRate || 18}% {product.hsnCode && <span className="text-text-muted font-mono ml-2">(HSN: {product.hsnCode})</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5"></div>

        {/* History Log */}
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <History size={16} className="text-[var(--color-primary)]" /> Stock History
          </h3>
          <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-white/10">
            {history.length > 0 ? (
              history.map((h, i) => (
                <div key={h.id} className="relative pl-8">
                  <div className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center ${h.quantityChange > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${h.quantityChange > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  </div>
                  <div className="bg-black/20 border border-[var(--border-card)] p-3 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-text-primary">{h.changeType}</p>
                      <span className="text-[10px] text-text-muted font-mono">{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[10px] text-[var(--text-secondary)]">{h.notes}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold font-mono ${h.quantityChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {h.quantityChange > 0 ? '+' : ''}{h.quantityChange}
                        </span>
                        <span className="text-gray-600 text-[10px]">→</span>
                        <span className="text-xs font-bold text-text-primary font-mono">{h.newStockLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="pl-8 text-xs text-text-muted font-mono py-2">No history recorded yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
