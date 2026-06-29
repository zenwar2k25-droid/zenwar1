import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Camera } from 'lucide-react';
import type { InventoryItem } from '../../data/seedData';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: InventoryItem | null;
}

const defaultFormData = {
  name: '',
  category: 'Spares',
  brand: '',
  sku: '',
  barcode: '',
  hsnCode: '',
  purchasePrice: 0,
  price: 0,
  gstRate: 18,
  stock: 0,
  threshold: 5,
  unitType: 'piece',
  rack: '',
  shelf: '',
  bin: '',
  supplier: '',
  supplierMobile: '',
  description: '',
  imageBase64: ''
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<any>(defaultFormData);
  const [imageError, setImageError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...defaultFormData, ...initialData });
      } else {
        setFormData({ ...defaultFormData });
      }
      setImageError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number = value;
    
    if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleImageProcess = (file: File) => {
    setImageError('');
    
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      // Need to compress
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.8 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData((prev: any) => ({ ...prev, imageBase64: compressedBase64 }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // Direct base64 conversion
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev: any) => ({ ...prev, imageBase64: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-card)] bg-black/20 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              {initialData ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {initialData ? 'Update product details and pricing.' : 'Enter product details to add to your inventory.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-text-primary hover:bg-hover-bg rounded-xl transition-all cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Details & Image Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Image Upload Area */}
              <div className="lg:col-span-1 space-y-3">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Product Image</label>
                <div 
                  className={`relative w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer ${dragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--border-card)] bg-black/20 hover:border-white/20'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.imageBase64 ? (
                    <>
                      <img src={formData.imageBase64} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-text-primary"><Camera size={18} /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData((prev: any) => ({ ...prev, imageBase64: '' })); }} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-text-primary"><Trash2 size={18} /></button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-[var(--text-secondary)]">
                        <Upload size={20} />
                      </div>
                      <p className="text-sm font-bold text-text-primary mb-1">Upload Image</p>
                      <p className="text-xs text-[var(--text-secondary)]">JPG, PNG, WEBP</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-2">Max: 1.5MB (Auto-compress)</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files && handleImageProcess(e.target.files[0])} />
                </div>
                {imageError && <p className="text-xs text-red-400 font-bold">{imageError}</p>}
              </div>

              {/* Basic Details */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Product Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="e.g. Castrol EDGE 5W-40" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Category <span className="text-red-500">*</span></label>
                  <input required type="text" name="category" value={formData.category} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="Spares, Lubricants, etc." />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="e.g. Bosch" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">SKU <span className="text-red-500">*</span></label>
                  <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="Stock Keeping Unit" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Barcode</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="Scan or type barcode" />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">HSN Code</label>
                  <input type="text" name="hsnCode" value={formData.hsnCode} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="Harmonized System Nomenclature" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--border-card)] w-full"></div>

            {/* 2. Pricing & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">₹</span>
                  <input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-8 pr-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Selling Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">₹</span>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-8 pr-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">GST %</label>
                <div className="relative">
                  <input type="number" name="gstRate" value={formData.gstRate} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Opening Stock <span className="text-red-500">*</span></label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Min Stock Alert</label>
                <input type="number" name="threshold" value={formData.threshold} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Unit Type</label>
                <select name="unitType" value={formData.unitType} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none">
                  <option value="piece">Piece (pcs)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="set">Set</option>
                  <option value="meter">Meter (m)</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--border-card)] w-full"></div>

            {/* 3. Location & Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-text-primary mb-2">Warehouse Location</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Rack</label>
                    <input type="text" name="rack" value={formData.rack} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="A1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Shelf</label>
                    <input type="text" name="shelf" value={formData.shelf} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Bin</label>
                    <input type="text" name="bin" value={formData.bin} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="B4" />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-sm font-bold text-text-primary mb-2">Supplier Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Supplier Name</label>
                    <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="AutoParts Inc." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Supplier Mobile</label>
                    <input type="text" name="supplierMobile" value={formData.supplierMobile} onChange={handleChange} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none" placeholder="+91 98765 43210" />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--border-card)] w-full"></div>

            {/* 4. Additional Info */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Product Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-[var(--color-primary)] focus:outline-none resize-none" placeholder="Detailed product specifications, fitment info, or compatibility notes..."></textarea>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-card)] bg-black/20 flex justify-end gap-3 sticky bottom-0 z-10">
          <button onClick={onClose} type="button" className="px-6 py-2.5 border border-border-card hover:bg-hover-bg rounded-xl text-sm font-bold text-text-primary transition-all cursor-pointer">
            Cancel
          </button>
          <button type="submit" form="productForm" className="px-6 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 rounded-xl text-sm font-bold text-text-primary shadow-lg shadow-cyan-500/20 transition-all cursor-pointer">
            {initialData ? 'Save Changes' : 'Add to Inventory'}
          </button>
        </div>
      </div>
    </div>
  );
};
