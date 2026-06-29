import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  MoreVertical, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  Barcode, 
  Trash2, 
  X,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useDatabase } from '../context/DatabaseContext';
import { ProductFormModal } from '../components/inventory/ProductFormModal';
import { InventoryDetailsDrawer } from '../components/inventory/InventoryDetailsDrawer';
import type { InventoryItem } from '../data/seedData';

export const Inventory: React.FC = () => {
  const { 
    inventory, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    bulkAddInventoryItems,
    bulkUpdateInventoryItems,
    bulkUpdateInventoryStock,
    currentUser,
    permissionRules,
    mechanics
  } = useDatabase();

  const activePermissions = useMemo(() => {
    if (!currentUser) return null;
    
    // 1. Check if logged in as a staff member with granular matrix permissions
    if (currentUser.mechanicId) {
      const staff = mechanics.find(m => m.id === currentUser.mechanicId);
      if (staff?.permissions) {
        return staff.permissions;
      }
    }
    
    // 2. Otherwise fall back to global role-based rule mapping
    let searchRole = currentUser.role;
    if (searchRole === 'admin') searchRole = 'Business Admin';
    if (searchRole === 'mechanic') searchRole = 'Mechanic';
    const rule = permissionRules.find(r => r.role.toLowerCase() === searchRole.toLowerCase()) || 
                 permissionRules.find(r => r.role.toLowerCase() === currentUser.role.toLowerCase());
                 
    if (rule) {
      return {
        billing: { read: rule.billing.read, create: rule.billing.create, edit: rule.billing.edit, delete: rule.billing.delete, export: rule.billing.export || false, approve: rule.billing.approve || false },
        invoices: { read: rule.invoices.read, create: rule.invoices.create, edit: rule.invoices.edit, delete: rule.invoices.delete, export: rule.invoices.export || false, approve: rule.invoices.approve || false },
        inventory: { read: rule.inventory.read, create: rule.inventory.create, edit: rule.inventory.edit, delete: rule.inventory.delete, export: rule.inventory.export || false, approve: rule.inventory.approve || false },
        reports: { read: rule.reports.read, create: rule.reports.create, edit: rule.reports.edit, delete: rule.reports.delete, export: rule.reports.export || false, approve: rule.reports.approve || false },
        dashboard: { read: rule.dashboard?.read || true, create: false, edit: false, delete: false, export: false, approve: false },
      };
    }
    
    return null;
  }, [currentUser, permissionRules, mechanics]);

  const hasAccess = activePermissions ? activePermissions.inventory.read : true;
  const canCreate = activePermissions ? activePermissions.inventory.create : true;
  const canExport = activePermissions ? (activePermissions.inventory.export ?? true) : true;
  const canEdit = activePermissions ? activePermissions.inventory.edit : true;
  const canDelete = activePermissions ? activePermissions.inventory.delete : true;
  const isDemo = currentUser?.tenantDomain === 'DEMO001';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'scan' | 'manual'>('scan');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedMsg, setScannedMsg] = useState('');

  // Barcode quick lookup in the modal
  const [modalBarcodeSearch, setModalBarcodeSearch] = useState('');
  const [quickLookupItem, setQuickLookupItem] = useState<InventoryItem | null>(null);

  // Manual Add Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Spares' as InventoryItem['category'],
    brand: '',
    sku: '',
    barcode: '',
    hsnCode: '',
    location: '',
    unitType: 'piece' as NonNullable<InventoryItem['unitType']>,
    purchasePrice: 0,
    price: 0, // selling price
    gstRate: 18,
    stock: 20,
    threshold: 5,
    supplier: '',
    description: '',
    imageBase64: ''
  });

  const [imageError, setImageError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Import/Export State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'add' | 'overwrite' | 'stock'>('add');
  const [importSummary, setImportSummary] = useState<{ created: number, updated: number, skipped: number, failed: number } | null>(null);

  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<InventoryItem | null>(null);

  const handleSaveProduct = (data: any) => {
    if (editingProduct) {
      updateInventoryItem(editingProduct.id, data);
    } else {
      addInventoryItem(data);
    }
    setAddModalOpen(false);
    setEditingProduct(null);
  };

  const categories = ['All', 'Spares', 'Lubricants', 'Filters', 'Electrical', 'Accessories'];
  const unitTypes = ['piece', 'liter', 'kg', 'set', 'meter'];

  // Multi-Tenant Isolation
  const tenantInventory = useMemo(() => {
    return inventory.filter(item => item.tenantDomain === currentUser?.tenantDomain);
  }, [inventory, currentUser]);

  // Dynamic filter
  const filteredInventory = useMemo(() => {
    return tenantInventory.filter(item => {
      const matchQuery = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.barcode && item.barcode.includes(searchQuery)) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [tenantInventory, searchQuery, selectedCategory]);

  const { invoices } = useDatabase();
  const stats = useMemo(() => {
    const totalProducts = tenantInventory.length;
    const lowStockAlerts = tenantInventory.filter(i => i.stock <= i.threshold && i.stock > 0).length;
    const outOfStock = tenantInventory.filter(i => i.stock === 0).length;
    const valuation = tenantInventory.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
    
    // Calculate Top Selling
    const productSales: Record<string, number> = {};
    const tenantInvoices = invoices.filter(inv => inv.tenantDomain === currentUser?.tenantDomain);
    tenantInvoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.type === 'part' && item.productId) {
          productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
        }
      });
    });
    
    let topSellingName = 'N/A';
    let maxSold = 0;
    Object.entries(productSales).forEach(([pid, qty]) => {
      if (qty > maxSold) {
        maxSold = qty;
        const p = tenantInventory.find(i => i.id === pid);
        if (p) topSellingName = p.name;
      }
    });
    
    return { totalProducts, lowStockAlerts, outOfStock, valuation, topSellingName };
  }, [tenantInventory, invoices, currentUser]);

  // Barcode quick lookup handler
  useEffect(() => {
    if (!modalBarcodeSearch) {
      setQuickLookupItem(null);
      return;
    }
    const match = tenantInventory.find(item => item.barcode === modalBarcodeSearch);
    setQuickLookupItem(match || null);
  }, [modalBarcodeSearch, tenantInventory]);

  // Auto SKU and Barcode generation
  const handleAutoSKU = () => {
    const catCode = newItem.category.substring(0, 3).toUpperCase();
    const brandCode = newItem.brand ? newItem.brand.trim().substring(0, 3).toUpperCase() : 'GEN';
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const sku = `SG-${catCode}-${brandCode}-${randomCode}`;
    
    setNewItem(prev => {
      const updates = { ...prev, sku };
      if (!prev.barcode) {
        updates.barcode = Math.floor(890100000000 + Math.random() * 9999999999).toString();
      }
      return updates;
    });
  };

  // Sync barcode if SKU changes and barcode is empty
  const handleSkuChange = (skuVal: string) => {
    setNewItem(prev => {
      const updates = { ...prev, sku: skuVal };
      if (!prev.barcode) {
        updates.barcode = Math.floor(890100000000 + Math.random() * 9999999999).toString();
      }
      return updates;
    });
  };

  // Base64 file parser
  const handleImageFile = (file: File) => {
    if (file.size > 1.5 * 1024 * 1024) {
      setImageError('File size exceeds the 1.5 MB limit.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setImageError('Only PNG, JPG, and WEBP formats are supported.');
      return;
    }
    setImageError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewItem(prev => ({ ...prev, imageBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
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
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Submit product registration
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.price <= 0 || newItem.stock < 0) return;

    // Generated barcode fallback if not provided
    const barcodeVal = newItem.barcode || Math.floor(890100000000 + Math.random() * 9999999999).toString();

    // Deduct/Set default Location if blank
    const finalLocation = newItem.location || 'Unassigned';

    addInventoryItem({
      ...newItem,
      barcode: barcodeVal,
      location: finalLocation
    });

    // Reset fields
    setNewItem({
      name: '',
      category: 'Spares',
      brand: '',
      sku: '',
      barcode: '',
      hsnCode: '',
      location: '',
      unitType: 'piece',
      purchasePrice: 0,
      price: 0,
      gstRate: 18,
      stock: 20,
      threshold: 5,
      supplier: '',
      description: '',
      imageBase64: ''
    });
    setAddModalOpen(false);
  };

  const handleStockAdjust = (id: string, amount: number) => {
    const item = tenantInventory.find(i => i.id === id);
    if (!item) return;
    updateInventoryItem(id, { stock: Math.max(0, item.stock + amount) });
  };

  // Web camera scan simulation
  const startBarcodeSimulation = (isModalLookup = false) => {
    setScannerOpen(true);
    setScannedMsg('Calibrating hardware focus...');
    
    setTimeout(() => {
      setScannedMsg('Aligning scan grid lines...');
    }, 800);

    setTimeout(() => {
      // Pick a random product from tenant inventory
      const randomProduct = tenantInventory[Math.floor(Math.random() * tenantInventory.length)];
      if (randomProduct) {
        setScannedMsg(`SUCCESS! Identified code: ${randomProduct.barcode}`);
        if (isModalLookup) {
          setModalBarcodeSearch(randomProduct.barcode);
        } else {
          setSearchQuery(randomProduct.barcode);
        }
      } else {
        setScannedMsg('No items cataloged to simulate scans.');
      }
    }, 1800);

    setTimeout(() => {
      setScannerOpen(false);
      setScannedMsg('');
    }, 2800);
  };

  // ==================== EXPORT SYSTEM ====================
  const handleExportCSV = () => {
    const data: any[] = tenantInventory.map(item => ({
      'Product Name': item.name,
      'Category': item.category,
      'Brand': item.brand || '',
      'SKU': item.sku || '',
      'Barcode': item.barcode || '',
      'HSN Code': item.hsnCode || '',
      'Purchase Price': item.purchasePrice || 0,
      'Selling Price': item.price,
      'GST %': item.gstRate || 18,
      'Stock Quantity': item.stock,
      'Min Stock Alert': item.threshold,
      'Supplier': item.supplier || '',
      'Description': item.description || ''
    }));
    
    // Add Summary Footer
    data.push({});
    data.push({});
    data.push({ 'Product Name': 'SUMMARY REPORT' });
    data.push({ 'Product Name': 'Total Products:', 'Category': stats.totalProducts });
    data.push({ 'Product Name': 'Total Stock Units:', 'Category': tenantInventory.reduce((acc, curr) => acc + curr.stock, 0) });
    data.push({ 'Product Name': 'Total Valuation:', 'Category': `Rs. ${stats.valuation.toLocaleString()}` });
    data.push({ 'Product Name': 'Low Stock Warnings:', 'Category': stats.lowStockAlerts });
    data.push({ 'Product Name': 'Out Of Stock:', 'Category': stats.outOfStock });

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Inventory_Export_${currentUser?.tenantDomain}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Main Data
    const data = tenantInventory.map(item => ({
      'Product Name': item.name,
      'Category': item.category,
      'Brand': item.brand || '',
      'SKU': item.sku || '',
      'Barcode': item.barcode || '',
      'Stock Quantity': item.stock,
      'Purchase Price': item.purchasePrice || 0,
      'Selling Price': item.price,
      'Inventory Value': item.stock * (item.purchasePrice || item.price)
    }));
    const ws1 = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws1, "Inventory Details");

    // Sheet 2: Stock Valuation
    const valuation = [{ 'Total Items': stats.totalProducts, 'Low Stock Alerts': stats.lowStockAlerts, 'Total Valuation': stats.valuation }];
    const ws2 = XLSX.utils.json_to_sheet(valuation);
    XLSX.utils.book_append_sheet(wb, ws2, "Stock Valuation");

    XLSX.writeFile(wb, `Inventory_Report_${currentUser?.tenantDomain}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(18);
    doc.text(`Inventory Report - ${currentUser?.tenantDomain}`, 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const tableColumn = ["Product Name", "SKU", "Category", "Stock", "Price", "Value"];
    const tableRows: any[] = [];

    tenantInventory.forEach(item => {
      const rowData = [
        item.name,
        item.sku || '-',
        item.category,
        item.stock,
        item.price,
        item.stock * item.price
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.text(`Total Products: ${tenantInventory.length}`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Stock Units: ${tenantInventory.reduce((acc, curr) => acc + curr.stock, 0)}`, 14, doc.lastAutoTable.finalY + 16);
    doc.text(`Total Valuation: Rs. ${stats.valuation}`, 14, doc.lastAutoTable.finalY + 22);

    doc.save(`Inventory_PDF_${currentUser?.tenantDomain}.pdf`);
  };

  // ==================== IMPORT SYSTEM ====================
  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    if (importMode === 'stock') {
      headers = ['SKU', 'Stock Quantity'];
    } else {
      headers = [
        'Product Name', 'Category', 'Brand', 'SKU', 'Barcode', 'HSN Code', 
        'Purchase Price', 'Selling Price', 'GST %', 'Stock Quantity', 
        'Min Stock Alert', 'Supplier', 'Description'
      ];
    }
    const csv = Papa.unparse({ fields: headers, data: [] });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Inventory_Template_${importMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows: any[] = results.data;
          
          if (importMode === 'stock') {
            const updates = rows.map(r => ({
              sku: r['SKU'] || '',
              stock: parseInt(r['Stock Quantity']) || 0
            })).filter(r => r.sku !== '');
            bulkUpdateInventoryStock(updates);
          } else if (importMode === 'add') {
            const newItems = rows.map(r => ({
              name: r['Product Name'] || 'Unknown Item',
              category: (r['Category'] || 'Spares') as any,
              brand: r['Brand'] || '',
              sku: r['SKU'] || '',
              barcode: r['Barcode'] || '',
              hsnCode: r['HSN Code'] || '',
              unitType: 'piece' as any,
              purchasePrice: parseFloat(r['Purchase Price']) || 0,
              price: parseFloat(r['Selling Price']) || 0,
              gstRate: parseFloat(r['GST %']) || 18,
              stock: parseInt(r['Stock Quantity']) || 0,
              threshold: parseInt(r['Min Stock Alert']) || 5,
              location: 'Unassigned',
              supplier: r['Supplier'] || '',
              description: r['Description'] || '',
              imageBase64: ''
            }));
            bulkAddInventoryItems(newItems);
          } else if (importMode === 'overwrite') {
            const updates = rows.map(r => {
              const u: any = { sku: r['SKU'] || '' };
              if (r['Product Name']) u.name = r['Product Name'];
              if (r['Category']) u.category = r['Category'];
              if (r['Brand']) u.brand = r['Brand'];
              if (r['Barcode']) u.barcode = r['Barcode'];
              if (r['HSN Code']) u.hsnCode = r['HSN Code'];
              if (r['Purchase Price']) u.purchasePrice = parseFloat(r['Purchase Price']);
              if (r['Selling Price']) u.price = parseFloat(r['Selling Price']);
              if (r['GST %']) u.gstRate = parseFloat(r['GST %']);
              if (r['Stock Quantity']) u.stock = parseInt(r['Stock Quantity']);
              if (r['Min Stock Alert']) u.threshold = parseInt(r['Min Stock Alert']);
              if (r['Supplier']) u.supplier = r['Supplier'];
              if (r['Description']) u.description = r['Description'];
              return u;
            }).filter(r => r.sku !== '');
            bulkUpdateInventoryItems(updates);
          }
          setImportModalOpen(false);
        }
      });
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md border-red-500/20 bg-red-950/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <X size={32} />
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">Module Access Restrict</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your current profile role (<span className="text-red-400 font-semibold">{currentUser?.role}</span>) does not have access permissions to view the <strong>Inventory & Spares</strong> module.
          </p>
          <div className="p-3 bg-bg-card rounded-xl border border-border-card text-[10px] text-text-muted font-mono">
            Security Policy enforced by Super Admin access matrix.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Inventory & Spares
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Verify storage levels, shelf indexing, and log updates for {currentUser?.tenantDomain}
          </p>
        </div>

        <div className="flex gap-2.5 self-start sm:self-center flex-wrap">
          {(canCreate || isDemo) && (
            <button 
              onClick={() => {
                setEditingProduct(null);
                setAddModalOpen(true);
                setActiveAddTab('manual');
              }}
              className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={15} /> Add Product
            </button>
          )}

          {(canCreate || isDemo) && (
            <button 
              onClick={() => setImportModalOpen(true)}
              className="px-4 py-3 border border-[var(--border-card)] bg-[var(--bg-card)] rounded-xl text-xs text-text-primary hover:border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer font-bold"
            >
              <Upload size={15} /> Import
            </button>
          )}

          {(canExport || isDemo) && (
            <div className="flex p-1 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl group relative cursor-pointer">
               <button className="px-4 py-2 text-xs font-bold text-text-primary flex items-center gap-2 hover:bg-hover-bg rounded-lg transition-all">
                  <Download size={15} /> Export
               </button>
               {/* Simple hover dropdown for export */}
               <div className="absolute top-full left-0 mt-2 w-32 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl hidden group-hover:block z-50 overflow-hidden shadow-2xl">
                 <div onClick={handleExportCSV} className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-text-primary hover:bg-hover-bg transition-all">CSV</div>
                 <div onClick={handleExportExcel} className="px-4 py-2 text-xs font-bold text-emerald-400 hover:text-text-primary hover:bg-hover-bg transition-all">Excel</div>
                 <div onClick={handleExportPDF} className="px-4 py-2 text-xs font-bold text-red-400 hover:text-text-primary hover:bg-hover-bg transition-all">PDF</div>
               </div>
            </div>
          )}

          <button 
            onClick={() => startBarcodeSimulation(false)}
            className="px-4 py-3 border border-[var(--border-card)] bg-[var(--bg-card)] rounded-xl text-xs text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-text-primary flex items-center justify-center gap-2 transition-all cursor-pointer font-bold"
          >
            <Barcode size={15} /> Scan Search
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total Products</span>
          <h4 className="text-xl font-extrabold text-text-primary font-mono">{stats.totalProducts}</h4>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center border-orange-500/10">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Low Stock Items</span>
          <h4 className="text-xl font-extrabold text-text-primary font-mono">{stats.lowStockAlerts}</h4>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center border-[var(--color-secondary)]/10">
          <span className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-wider mb-1">Out Of Stock</span>
          <h4 className="text-xl font-extrabold text-text-primary font-mono">{stats.outOfStock}</h4>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Inventory Value</span>
          <h4 className="text-xl font-extrabold text-[var(--color-primary)] font-mono">₹{stats.valuation.toLocaleString()}</h4>
        </div>
        <div className="glass-panel p-4 flex flex-col justify-center col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Top Selling</span>
          <h4 className="text-sm font-bold text-text-primary truncate" title={stats.topSellingName}>{stats.topSellingName}</h4>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category List */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] border border-cyan-500/20' : 'bg-white/5 border border-transparent text-[var(--text-secondary)] hover:text-text-primary'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, brand, barcode..." 
            className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)]"
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="glass-panel p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border-card text-[var(--text-secondary)] font-bold">
                <th className="pb-3 text-left">Product Details</th>
                <th className="pb-3 text-center">Category</th>
                <th className="pb-3 text-center">Stock Level</th>
                <th className="pb-3 text-center">Selling Price</th>
                <th className="pb-3 text-center">GST Rate</th>
                <th className="pb-3 text-center">Location</th>
                <th className="pb-3 text-center">Barcode / HSN</th>
                <th className="pb-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-text-primary">
              {filteredInventory.map((item) => {
                const isLow = item.stock <= item.threshold;
                
                return (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 flex items-center gap-3">
                      {item.imageBase64 ? (
                        <img 
                          src={item.imageBase64} 
                          alt={item.name} 
                          className="w-9 h-9 rounded-lg object-cover border border-border-card shadow-md shadow-black/40"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-border-card text-text-muted">
                          <ImageIcon size={16} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-text-primary leading-tight">{item.name}</p>
                        <div className="flex gap-2 text-[10px] text-text-muted mt-0.5">
                          {item.brand && <span>Brand: {item.brand}</span>}
                          {item.sku && <span>SKU: {item.sku}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center text-text-secondary font-medium">{item.category}</td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${isLow ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {item.stock} {item.unitType || 'piece'}(s)
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-mono">₹{item.price.toLocaleString()}</td>
                    <td className="py-3.5 text-center font-mono text-text-secondary">{item.gstRate || 18}%</td>
                    <td className="py-3.5 text-center text-text-secondary font-mono">{item.location}</td>
                    <td className="py-3.5 text-center text-text-secondary font-mono">
                      <div>BC: {item.barcode}</div>
                      {item.hsnCode && <div className="text-[9px] text-text-muted">HSN: {item.hsnCode}</div>}
                    </td>
                    <td className="py-3.5 text-right pr-4 relative">
                      <button 
                        onClick={() => setActionMenuOpenId(actionMenuOpenId === item.id ? null : item.id)}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-text-primary hover:bg-hover-bg rounded-lg transition-all cursor-pointer inline-flex"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionMenuOpenId === item.id && (
                        <div className="absolute right-8 top-10 w-40 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            onClick={() => { setEditingProduct(item); setAddModalOpen(true); setActionMenuOpenId(null); }}
                            className="w-full px-4 py-2 text-xs font-bold text-text-primary hover:bg-hover-bg flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            Edit Product
                          </button>
                          <button 
                            onClick={() => { setDetailsProduct(item); setActionMenuOpenId(null); }}
                            className="w-full px-4 py-2 text-xs font-bold text-text-primary hover:bg-hover-bg flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => { 
                              // Duplicate product
                              const { id, ...rest } = item;
                              addInventoryItem({ ...rest, name: `${item.name} (Copy)`, sku: item.sku ? `${item.sku}-COPY` : '' });
                              setActionMenuOpenId(null); 
                            }}
                            className="w-full px-4 py-2 text-xs font-bold text-text-primary hover:bg-hover-bg flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            Duplicate Product
                          </button>
                          <div className="h-px bg-white/10 my-1"></div>
                          {canDelete && (
                            <button 
                              onClick={() => { deleteInventoryItem(item.id); setActionMenuOpenId(null); }}
                              className="w-full px-4 py-2 text-xs font-bold text-red-400 hover:bg-hover-bg flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              Delete Product
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--text-secondary)]">
                    No products cataloged matching query parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WEBCAM SCANNER SIMULATOR MODAL */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-sm w-full border-border-card relative text-center space-y-4 animate-in zoom-in-95 duration-200 bg-[#080910]">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center justify-center gap-2">
              <Barcode size={18} className="text-[var(--color-primary)] animate-pulse" /> Webcam Barcode Reader
            </h3>
            
            {/* Animated Guideline Grid */}
            <div className="w-full h-44 border border-border-card rounded-xl relative overflow-hidden bg-bg-card flex items-center justify-center">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
              
              {/* Scan laser */}
              <div className="absolute left-4 right-4 h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" style={{ animationDuration: '2.2s' }} />

              <span className="text-[10px] font-mono text-gray-600 animate-pulse">camera feed simulation</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-text-secondary font-mono leading-none">{scannedMsg}</p>
              <p className="text-[9px] text-gray-600 font-mono">Locks barcode sequence onto catalog inputs</p>
            </div>

            <button 
              onClick={() => setScannerOpen(false)}
              className="w-full py-2 bg-white/5 border border-border-card text-text-primary rounded-lg text-xs font-semibold hover:bg-hover-bg cursor-pointer"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-md w-full border-border-card relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setImportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Upload className="text-[var(--color-primary)]" size={20} /> Import Inventory
            </h3>

            <div className="space-y-4">
              {/* Import Mode Toggle */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">Import Mode</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer bg-black/20 p-2 rounded-lg border border-border-card hover:border-[var(--color-primary)]">
                    <input type="radio" name="importMode" checked={importMode === 'add'} onChange={() => setImportMode('add')} className="accent-[var(--color-primary)]" />
                    <span><strong>Add New Products</strong> (Generates new SKUs if empty)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer bg-black/20 p-2 rounded-lg border border-border-card hover:border-[var(--color-primary)]">
                    <input type="radio" name="importMode" checked={importMode === 'overwrite'} onChange={() => setImportMode('overwrite')} className="accent-[var(--color-primary)]" />
                    <span><strong>Overwrite Existing</strong> (Matches strictly by SKU)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer bg-black/20 p-2 rounded-lg border border-border-card hover:border-[var(--color-primary)]">
                    <input type="radio" name="importMode" checked={importMode === 'stock'} onChange={() => setImportMode('stock')} className="accent-[var(--color-primary)]" />
                    <span><strong>Bulk Stock Update</strong> (Quick SKU and Quantity sync)</span>
                  </label>
                </div>
              </div>

              {/* Template Download */}
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-cyan-400">CSV Template</h4>
                  <p className="text-[10px] text-text-secondary">Download the required column structure</p>
                </div>
                <button 
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-xs font-semibold transition-all cursor-pointer"
                >
                  Download
                </button>
              </div>

              {/* File Upload */}
              <div className="space-y-1.5 pt-2 border-t border-border-card">
                <label className="text-xs font-semibold text-text-secondary block">Upload Data File (.csv)</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={processImportFile}
                  className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary-glow)] file:text-[var(--color-primary)] hover:file:bg-cyan-500/20 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <InventoryDetailsDrawer 
        product={detailsProduct} 
        onClose={() => setDetailsProduct(null)} 
      />

      <ProductFormModal 
        isOpen={addModalOpen} 
        onClose={() => { setAddModalOpen(false); setEditingProduct(null); }} 
        onSave={handleSaveProduct} 
        initialData={editingProduct} 
      />
      {/* IMPORT SUMMARY MODAL */}
      {importSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="glass-panel p-6 max-w-sm w-full border-border-card relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Upload className="text-[var(--color-primary)]" size={20} /> Import Results
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Created</span>
                <span className="text-text-primary font-mono font-extrabold">{importSummary.created}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span className="text-blue-400 font-bold text-xs uppercase tracking-wider">Updated</span>
                <span className="text-text-primary font-mono font-extrabold">{importSummary.updated}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">Skipped</span>
                <span className="text-text-primary font-mono font-extrabold">{importSummary.skipped}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Failed</span>
                <span className="text-text-primary font-mono font-extrabold">{importSummary.failed}</span>
              </div>
            </div>
            <button 
              onClick={() => setImportSummary(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
