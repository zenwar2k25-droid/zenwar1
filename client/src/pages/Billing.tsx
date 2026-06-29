// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  // Trash2, 
  Printer, 
  Percent, 
  Sparkles,
  // CreditCard,
  // Coins,
  // Smartphone,
  ChevronLeft,
  X,
  FileText,
  Mail,
  MessageSquare,
  Barcode,
  // Building,
  Copy,
  AlertCircle
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import QRCode from 'react-qr-code';
import { useDatabase } from '../context/DatabaseContext';
import type { InvoiceItem, Invoice } from '../data/seedData';
import { useBranding } from '../hooks/useBranding';
import { jsPDF } from 'jspdf';

const loadQrCodeBase64 = (upiId: string, amount: number, shopName: string): Promise<string> => {
  return new Promise((resolve) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = qrUrl;
  });
};

const getQrCodeWithTimeout = (upiId: string, amount: number, shopName: string, timeoutMs: number = 3000): Promise<string> => {
  return Promise.race([
    loadQrCodeBase64(upiId, amount, shopName),
    new Promise<string>((resolve) => setTimeout(() => resolve(''), timeoutMs))
  ]);
};

export const Billing: React.FC = () => {
  const { 
    customers, 
    inventory, 
    addInvoice, 
    settings,
    currentUser,
    permissionRules,
    mechanics,
    getWorkshopPaymentConfig
  } = useDatabase();
  const branding = useBranding();

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

  const isDemo = currentUser?.tenantDomain === 'DEMO001';
  const hasAccess = activePermissions ? activePermissions.billing.read : true;
  const canCreate = isDemo || (activePermissions ? activePermissions.billing.create : true);

  // Multi-Tenant Isolation
  const tenantCustomers = useMemo(() => {
    return customers.filter(c => c.tenantDomain === currentUser?.tenantDomain);
  }, [customers, currentUser]);

  const tenantInventory = useMemo(() => {
    return inventory.filter(item => item.tenantDomain === currentUser?.tenantDomain);
  }, [inventory, currentUser]);

  // Active invoicing state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Razorpay'>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'PENDING'>('PAID');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  const activeTenant = currentUser?.tenantDomain || 'APEXAUTO';
  const paymentConfig = useMemo(() => getWorkshopPaymentConfig(activeTenant), [getWorkshopPaymentConfig, activeTenant]);

  useEffect(() => {
    if (paymentConfig?.defaultMethod) {
      setPaymentMethod(paymentConfig.defaultMethod);
    }
  }, [paymentConfig]);

  // Search Switcher State
  const [searchMode, setSearchMode] = useState<'barcode' | 'manual'>('barcode');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [scannedMsg, setScannedMsg] = useState('');

  // Search references for Manual search
  const [searchPartQuery, setSearchPartQuery] = useState('');
  const [customLaborName, setCustomLaborName] = useState('');
  const [customLaborDesc, setCustomLaborDesc] = useState('');
  const [customLaborCost, setCustomLaborCost] = useState<number>(0);
  const [customLaborGst, setCustomLaborGst] = useState<number>(18);

  const [showCustomPartForm, setShowCustomPartForm] = useState(false);
  const [customPartName, setCustomPartName] = useState('');
  const [customPartDesc, setCustomPartDesc] = useState('');
  const [customPartCost, setCustomPartCost] = useState<number>(0);
  const [customPartGst, setCustomPartGst] = useState<number>(18);

  // View modes
  const [invoiceViewMode, setInvoiceViewMode] = useState<'create' | 'preview'>('create');
  const [activeInvoiceToShow, setActiveInvoiceToShow] = useState<Invoice | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+B -> Barcode Mode
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSearchMode('barcode');
        triggerToast('Switched to Barcode Scan mode');
        setTimeout(() => document.getElementById('barcode-scan-input')?.focus(), 50);
      }
      // Alt+M -> Manual Mode
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setSearchMode('manual');
        triggerToast('Switched to Manual Search mode');
        setTimeout(() => document.getElementById('manual-search-input')?.focus(), 50);
      }
      // Ctrl+/ -> Focus active input
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        if (searchMode === 'barcode') {
          document.getElementById('barcode-scan-input')?.focus();
        } else {
          document.getElementById('manual-search-input')?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchMode]);

  // Selected customer details
  const activeCustomer = useMemo(() => {
    return tenantCustomers.find(c => c.id === selectedCustomerId);
  }, [tenantCustomers, selectedCustomerId]);

  const activeVehicle = useMemo(() => {
    return activeCustomer?.vehicles.find(v => v.id === selectedVehicleId);
  }, [activeCustomer, selectedVehicleId]);

  // Inventory search results (Manual Suggestion Autocomplete)
  const filteredInventory = useMemo(() => {
    if (!searchPartQuery) return [];
    return tenantInventory.filter(item => 
      item.name.toLowerCase().includes(searchPartQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchPartQuery.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchPartQuery.toLowerCase())) ||
      (item.barcode && item.barcode.includes(searchPartQuery)) ||
      item.category.toLowerCase().includes(searchPartQuery.toLowerCase())
    ).slice(0, 5);
  }, [tenantInventory, searchPartQuery]);

  // Quick / Frequent items mapping (displays top 4 items for one-click manual adds)
  const frequentProducts = useMemo(() => {
    return tenantInventory.slice(0, 4);
  }, [tenantInventory]);

  // Real-time calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  const totalGst = useMemo(() => {
    return items.reduce((sum, item) => {
      const rate = item.gstRate || 18;
      const base = item.price * item.quantity;
      return sum + (base * rate) / 100;
    }, 0);
  }, [items]);

  const cgstAmount = useMemo(() => Math.round(totalGst / 2), [totalGst]);
  const sgstAmount = useMemo(() => Math.round(totalGst / 2), [totalGst]);

  const grandTotalBeforeRound = useMemo(() => {
    return Math.max(0, subtotal + totalGst + serviceCharge - discount);
  }, [subtotal, totalGst, serviceCharge, discount]);

  const finalGrandTotal = useMemo(() => Math.round(grandTotalBeforeRound), [grandTotalBeforeRound]);
  const roundOffValue = useMemo(() => Number((finalGrandTotal - grandTotalBeforeRound).toFixed(2)), [finalGrandTotal, grandTotalBeforeRound]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Barcode execution workflow
  const handleBarcodeScan = (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;

    const match = tenantInventory.find(inv => inv.barcode === code);
    if (!match) {
      triggerToast(`Product not found for barcode: "${code}"`);
      setBarcodeInput('');
      return;
    }

    if (match.stock <= 0) {
      triggerToast(`Out of Stock Warning: "${match.name}" has 0 stock.`);
      setBarcodeInput('');
      return;
    }

    // Deduct/Find if item is already added
    const existingIdx = items.findIndex(i => i.productId === match.id && i.type === 'part');
    if (existingIdx > -1) {
      const updated = [...items];
      if (updated[existingIdx].quantity < match.stock) {
        updated[existingIdx].quantity += 1;
        setItems(updated);
        triggerToast(`Increased quantity for ${match.name}`);
        if (match.stock - updated[existingIdx].quantity <= match.threshold) {
          triggerToast(`Low Stock Alert: Only ${match.stock - updated[existingIdx].quantity} left.`);
        }
      } else {
        triggerToast(`Cannot exceed total stock of ${match.stock} units for ${match.name}.`);
      }
    } else {
      setItems([...items, {
        productId: match.id,
        name: match.name,
        quantity: 1,
        price: match.price,
        type: 'part',
        description: match.description || 'Inventory spare part replacement',
        gstRate: match.gstRate || 18
      }]);
      triggerToast(`Added ${match.name} to invoice`);
      if (match.stock - 1 <= match.threshold) {
        triggerToast(`Low Stock Alert: Only ${match.stock - 1} left.`);
      }
    }
    setBarcodeInput('');
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBarcodeScan(barcodeInput);
  };

  // Autocomplete add spare part helper
  const handleAddPart = (part: any) => {
    const existingIndex = items.findIndex(item => item.productId === part.id && item.type === 'part');
    if (existingIndex > -1) {
      const updated = [...items];
      if (updated[existingIndex].quantity < part.stock) {
        updated[existingIndex].quantity += 1;
        setItems(updated);
        triggerToast(`Updated quantity for ${part.name}`);
        if (part.stock - updated[existingIndex].quantity <= part.threshold) {
          triggerToast(`Low Stock Alert: Only ${part.stock - updated[existingIndex].quantity} left.`);
        }
      } else {
        triggerToast(`Max stock reached for ${part.name}`);
      }
    } else {
      setItems([...items, { 
        productId: part.id,
        name: part.name, 
        quantity: 1, 
        price: part.price, 
        type: 'part',
        description: part.description || 'Inventory spare part replacement',
        gstRate: part.gstRate || 18
      }]);
      triggerToast(`Added ${part.name} to list`);
      if (part.stock - 1 <= part.threshold) {
        triggerToast(`Low Stock Alert: Only ${part.stock - 1} left.`);
      }
    }
    setSearchPartQuery('');
  };

  // Quick Select Product Handler
  const handleSelectProduct = (product: any) => {
    handleAddPart(product);
  };

  const handleAddCustomPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPartName || customPartCost <= 0) return;
    setItems([...items, {
      name: customPartName,
      quantity: 1,
      price: customPartCost,
      type: 'part',
      description: customPartDesc || 'Spare part item',
      gstRate: customPartGst
    }]);
    setCustomPartName('');
    setCustomPartDesc('');
    setCustomPartCost(0);
    setCustomPartGst(18);
    setShowCustomPartForm(false);
    triggerToast('Added custom spare part');
  };

  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLaborName || customLaborCost <= 0) return;
    setItems([...items, { 
      name: customLaborName, 
      quantity: 1, 
      price: customLaborCost, 
      type: 'labor',
      description: customLaborDesc || 'Business service labor charge',
      gstRate: customLaborGst
    }]);
    setCustomLaborName('');
    setCustomLaborDesc('');
    setCustomLaborCost(0);
    setCustomLaborGst(18);
    triggerToast('Added custom service labor');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    triggerToast('Item removed from invoice');
  };

  const handleQtyChange = (index: number, qty: number) => {
    const updated = [...items];
    const target = updated[index];
    const newQty = Math.max(1, qty);

    // Quantity stock validation
    if (target.type === 'part' && target.productId) {
      const dbItem = tenantInventory.find(i => i.id === target.productId);
      if (dbItem && newQty > dbItem.stock) {
        triggerToast(`Stock limit: Only ${dbItem.stock} items available for "${dbItem.name}".`);
        target.quantity = dbItem.stock;
        setItems(updated);
        return;
      }
    }

    target.quantity = newQty;
    setItems(updated);
  };

  const handleGstRateChange = (index: number, rate: number) => {
    const updated = [...items];
    updated[index].gstRate = rate;
    setItems(updated);
    triggerToast(`Tax rate updated to ${rate}%`);
  };

  const handleCreateBill = () => {
    if (!selectedCustomerId || items.length === 0) return;

    const invoicePayload: any = {
      customerId: selectedCustomerId,
      customerName: activeCustomer?.name || 'Walk-in Client',
      phone: activeCustomer?.phone || '',
      vehiclePlate: activeVehicle?.plateNumber || 'N/A',
      items: items.map((item, index) => ({ ...item, id: `inv-item-${index}` })),
      subtotal,
      gstAmount: Math.round(totalGst),
      discount,
      serviceCharge,
      roundOff: roundOffValue,
      total: finalGrandTotal,
      paymentMethod,
      isPaid: paymentStatus === 'PAID',
      status: paymentStatus === 'PAID' ? 'Paid' : paymentStatus === 'PARTIAL' ? 'Partially Paid' : 'Pending',
      paymentStatus: paymentStatus,
      paidAmount: paidAmount,
      balanceAmount: Math.max(0, finalGrandTotal - paidAmount),
      dueDate: dueDate,
      remarks: remarks,
      paymentHistory: paidAmount > 0 ? [{
        id: `pay-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: paidAmount,
        method: paymentMethod,
        remarks: 'Initial Payment'
      }] : [],
      dateCreated: new Date().toISOString()
    };

    try {
      const newInvoice = addInvoice(invoicePayload);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      setActiveInvoiceToShow(newInvoice);
      setInvoiceViewMode('preview');

      // Reset editor states
      setItems([]);
      setSelectedCustomerId('');
      setSelectedVehicleId('');
      setDiscount(0);
      setServiceCharge(0);
    } catch (err: any) {
      triggerToast(err.message || 'Verification Error during checkout.');
    }
  };

  // jsPDF high fidelity exporter
  const generatePDFReport = async (invoice: Invoice) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#111827');
    doc.text(settings.shopName || 'Zenwar', 14, 20);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#4b5563');
    doc.text(settings.address || 'Auto Grid Road, NY', 14, 26);
    doc.text(`Phone: ${settings.phone}  |  Email: ${settings.email || 'contact@zenwar.co'}`, 14, 31);
    doc.text(`GSTIN: ${settings.gstNumber}`, 14, 36);
    
    // Invoice Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#0ea5e9');
    doc.text('TAX INVOICE', 145, 20);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#4b5563');
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 145, 26);
    doc.text(`Date Issued: ${invoice.date}`, 145, 31);
    
    if (invoice.paymentStatus === 'PARTIAL') {
      doc.setTextColor('#f97316'); // orange-500
      doc.text(`Status: PARTIAL PAYMENT`, 145, 36);
    } else if (invoice.paymentStatus === 'PENDING') {
      doc.setTextColor('#ef4444'); // red-500
      doc.text(`Status: PAYMENT PENDING`, 145, 36);
    } else {
      doc.setTextColor('#10b981'); // emerald-500
      doc.text(`Status: PAID (${invoice.paymentMethod})`, 145, 36);
    }
    
    doc.setDrawColor('#e5e7eb');
    doc.line(14, 42, 196, 42);
    
    // Customers details
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#111827');
    doc.text('BILLED TO:', 14, 49);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#374151');
    doc.text(invoice.customerName, 14, 54);
    doc.text(`Phone: ${invoice.phone}`, 14, 59);
    
    // Vehicle details
    doc.setFont('Helvetica', 'bold');
    doc.text('VEHICLE DETAILS:', 110, 49);
    
    doc.setFont('Helvetica', 'normal');
    doc.text(`Vehicle Plate: ${invoice.vehiclePlate}`, 110, 54);
    
    doc.line(14, 65, 196, 65);
    
    // Table headers
    const tableTop = 72;
    doc.setFillColor('#f3f4f6');
    doc.rect(14, tableTop, 182, 7, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor('#374151');
    doc.text('Products & Services Name', 16, tableTop + 5);
    doc.text('Type', 90, tableTop + 5);
    doc.text('Qty', 110, tableTop + 5);
    doc.text('Unit Price (Rs)', 128, tableTop + 5);
    doc.text('GST %', 158, tableTop + 5);
    doc.text('Total (Rs)', 178, tableTop + 5);
    
    doc.setFont('Helvetica', 'normal');
    let y = tableTop + 13;
    invoice.items.forEach((item: any) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(item.name, 16, y);
      doc.text(item.type === 'part' ? 'Part' : 'Labor', 90, y);
      doc.text(item.quantity.toString(), 112, y);
      doc.text(item.price.toLocaleString(), 131, y);
      doc.text(`${item.gstRate || 18}%`, 161, y);
      
      const lineTotal = item.price * item.quantity;
      doc.text(lineTotal.toLocaleString(), 180, y);
      
      y += 8;
    });
    
    doc.line(14, y, 196, y);
    y += 6;
    
    // Calculations block
    const calcStart = 135;
    doc.setFontSize(9);
    doc.setTextColor('#4b5563');
    doc.text('Subtotal:', calcStart, y);
    doc.text(invoice.subtotal.toLocaleString(), 180, y);
    y += 5;
    
    if (invoice.discount > 0) {
      doc.text('Discount (-):', calcStart, y);
      doc.text(invoice.discount.toLocaleString(), 180, y);
      y += 5;
    }
    
    if (invoice.serviceCharge && invoice.serviceCharge > 0) {
      doc.text('Service Charge (+):', calcStart, y);
      doc.text(invoice.serviceCharge.toLocaleString(), 180, y);
      y += 5;
    }
    
    const cgst = Math.round(invoice.gstAmount / 2);
    const sgst = Math.round(invoice.gstAmount / 2);
    doc.text('CGST (9%):', calcStart, y);
    doc.text(cgst.toLocaleString(), 180, y);
    y += 5;
    
    doc.text('SGST (9%):', calcStart, y);
    doc.text(sgst.toLocaleString(), 180, y);
    y += 5;
    
    if (invoice.roundOff !== undefined && invoice.roundOff !== 0) {
      doc.text('Round Off:', calcStart, y);
      doc.text(invoice.roundOff.toString(), 180, y);
      y += 5;
    }
    
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor('#111827');
    doc.text('Net Grand Total (Rs):', calcStart, y);
    doc.text(invoice.total.toLocaleString(), 180, y);
    y += 5;

    if (invoice.paymentStatus && invoice.paymentStatus !== 'PAID') {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor('#4b5563');
      doc.text('Paid Amount:', calcStart, y);
      doc.text((invoice.paidAmount || 0).toLocaleString(), 180, y);
      y += 5;

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor('#ef4444');
      doc.text('Balance Due:', calcStart, y);
      doc.text((invoice.balanceAmount || 0).toLocaleString(), 180, y);
      y += 7;
    } else {
      y += 7;
    }
    
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const checkoutLink = `${window.location.origin}${window.location.pathname}#/checkout/${invoice.id}`;
    doc.setTextColor('#0ea5e9');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.textWithLink('Click Here to Pay Online Now', 14, y + 12, { url: checkoutLink });

    // Fetch and draw UPI QR if configured
    const paymentConfig = getWorkshopPaymentConfig(invoice.tenantDomain || 'APEXAUTO');
    if (paymentConfig?.upiEnabled && paymentConfig?.upiId) {
      const qrBase64 = await getQrCodeWithTimeout(paymentConfig.upiId, invoice.total, settings.shopName);
      if (qrBase64) {
        doc.addImage(qrBase64, 'JPEG', 14, y - 18, 28, 28);
        doc.setFontSize(7);
        doc.setTextColor('#6b7280');
        doc.setFont('Helvetica', 'normal');
        doc.text('Scan to Pay (Isolated UPI QR)', 14, y + 14);
      }
    }
    
    y += 18;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    // Signatures and notes
    doc.setFontSize(8);
    doc.setTextColor('#9ca3af');
    doc.text('Terms & Conditions:', 14, y);
    doc.text('1. Warranty claims as per respective spare manufacturers policies.', 14, y + 4);
    doc.text('2. Dispatched services cannot be cancelled or refunded.', 14, y + 8);
    
    doc.setFontSize(9);
    doc.setTextColor('#374151');
    doc.text('Authorized Signatory', 148, y + 12);
    const cleanInvoiceNum = invoice.invoiceNumber.replace(/^(INV-|GF-|SG-)/i, '');
    doc.save(`Zenwar-Invoice-${cleanInvoiceNum}.pdf`);
    triggerToast('PDF downloaded successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const startBillingBarcodeSimulation = () => {
    setBarcodeScannerOpen(true);
    setScannedMsg('Calibrating billing camera...');
    
    setTimeout(() => {
      setScannedMsg('Reading focus area lines...');
    }, 800);

    setTimeout(() => {
      const randomProduct = tenantInventory[Math.floor(Math.random() * tenantInventory.length)];
      if (randomProduct) {
        setScannedMsg(`SCANNED: ${randomProduct.barcode}`);
        handleBarcodeScan(randomProduct.barcode);
      } else {
        setScannedMsg('No items in inventory to simulate scan.');
      }
    }, 1800);

    setTimeout(() => {
      setBarcodeScannerOpen(false);
      setScannedMsg('');
    }, 2800);
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
            Your current assigned role (<span className="text-red-400 font-semibold">{currentUser?.role}</span>) does not have access permissions to view the <strong>Invoicing Terminal</strong>.
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
      {/* Dynamic Print CSS Wrapper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            background: white !important;
            color: black !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <FileText className="text-[var(--color-primary)]" size={28} /> 
            {invoiceViewMode === 'create' ? 'Invoicing & POS Terminal' : 'Invoice Preview'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            {invoiceViewMode === 'create' ? 'Assemble professional A4 parts invoices and labor slips' : `Locked Invoice ${activeInvoiceToShow?.invoiceNumber}`}
          </p>
        </div>

        {invoiceViewMode !== 'create' && (
          <button 
            onClick={() => setInvoiceViewMode('create')}
            className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border-card)] bg-[var(--bg-card)] rounded-xl text-xs text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer hover:border-white/20 active:scale-95"
          >
            <ChevronLeft size={16} /> Create Another Invoice
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {invoiceViewMode === 'create' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 8 COLUMNS - POS VIEW */}
            <div className="xl:col-span-8 space-y-4 no-print">
              
              {/* Step 1: Customer & Vehicle Header */}
              <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-cyan-500/20">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-text-secondary block mb-1 uppercase tracking-wider">Step 1: Select Customer *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => {
                      setSelectedCustomerId(e.target.value);
                      setSelectedVehicleId('');
                    }}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all cursor-pointer font-bold"
                  >
                    <option value="">-- Search / Select Customer --</option>
                    {tenantCustomers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-text-secondary block mb-1 uppercase tracking-wider">Select Vehicle</label>
                  <select
                    disabled={!selectedCustomerId}
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold"
                  >
                    <option value="">-- Walk-in / Select Plate --</option>
                    {activeCustomer?.vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} - {v.plateNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Add Products & Services */}
              <div className="glass-panel p-4 space-y-4 border-cyan-500/20">
                <div className="flex gap-2 border-b border-border-card pb-3">
                  <button
                    type="button"
                    onClick={() => { setShowCustomPartForm(false); setSearchMode('manual'); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${!showCustomPartForm ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)]' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    Inventory Products
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCustomPartForm(true); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${showCustomPartForm ? 'bg-orange-500/20 text-orange-400' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    Custom Services & Labor
                  </button>
                </div>

                {!showCustomPartForm ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" />
                        <input 
                          type="text"
                          id="manual-search-input"
                          value={searchPartQuery}
                          onChange={e => setSearchPartQuery(e.target.value)}
                          placeholder="Search product name, SKU, or click Scan..."
                          className="w-full bg-bg-card border border-border-card rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary font-medium shadow-inner"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={startBillingBarcodeSimulation}
                        className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Barcode size={16} /> Scan
                      </button>
                    </div>

                    {filteredInventory.length > 0 && (
                      <div className="bg-[#0d0e19] border border-border-card rounded-xl overflow-hidden shadow-2xl">
                        {filteredInventory.map(part => (
                          <button
                            key={part.id}
                            type="button"
                            onClick={() => handleAddPart(part)}
                            className="w-full text-left px-4 py-3 border-b border-border-card last:border-0 hover:bg-[var(--color-primary-glow)] transition-colors flex justify-between items-center cursor-pointer group"
                          >
                            <div>
                              <div className="text-text-primary font-bold text-xs group-hover:text-[var(--color-primary)]">{part.name}</div>
                              <div className="text-[10px] text-text-muted font-mono mt-0.5">{part.sku || part.brand} | {part.stock} in stock</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-text-primary text-xs">₹{part.price}</div>
                              <div className="text-[10px] text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Click to Add</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleAddLabor} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <input 
                        type="text" required value={customLaborName} onChange={e => setCustomLaborName(e.target.value)}
                        placeholder="Service / Labor Description"
                        className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-xs text-text-primary focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <input 
                        type="number" required value={customLaborCost || ''} onChange={e => setCustomLaborCost(Number(e.target.value))}
                        placeholder="Rate (₹)"
                        className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-xs text-text-primary focus:border-orange-500 font-mono"
                      />
                    </div>
                    <div>
                      <button type="submit" className="w-full py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-bold rounded-lg text-xs transition-all cursor-pointer">
                        Add Service
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Step 3: Items Grid */}
              <div className="glass-panel p-0 overflow-hidden border-cyan-500/20">
                <div className="p-4 border-b border-border-card bg-white/[0.02]">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Invoice Line Items</h3>
                </div>
                {items.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[var(--text-secondary)] italic">
                    Invoice is empty. Add products or services to begin billing.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-bg-card text-[10px] uppercase tracking-wider text-text-muted">
                        <tr>
                          <th className="px-4 py-3 font-bold">Item Description</th>
                          <th className="px-4 py-3 font-bold text-center w-20">Rate</th>
                          <th className="px-4 py-3 font-bold text-center w-24">Qty</th>
                          <th className="px-4 py-3 font-bold text-center w-20">GST %</th>
                          <th className="px-4 py-3 font-bold text-right w-24">Amount</th>
                          <th className="px-4 py-3 font-bold text-center w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {items.map((item, index) => {
                          const baseTotal = item.price * item.quantity;
                          const lineGst = (baseTotal * (item.gstRate || 18)) / 100;
                          return (
                            <tr key={index} className="text-text-primary hover:bg-white/[0.02] group">
                              <td className="px-4 py-3">
                                <div className="font-bold">{item.name}</div>
                                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${item.type === 'part' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-mono">₹{item.price}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input 
                                    type="number" min={1} value={item.quantity}
                                    onChange={e => handleQtyChange(index, Number(e.target.value))}
                                    className="w-12 bg-bg-card border border-border-card rounded p-1 text-center font-mono text-text-primary focus:border-[var(--color-primary)]"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <select
                                  value={item.gstRate || 18}
                                  onChange={e => handleGstRateChange(index, Number(e.target.value))}
                                  className="bg-transparent border-b border-white/20 text-text-primary pb-0.5 text-center font-mono text-xs cursor-pointer outline-none"
                                >
                                  <option value={0}>0%</option>
                                  <option value={5}>5%</option>
                                  <option value={12}>12%</option>
                                  <option value={18}>18%</option>
                                  <option value={28}>28%</option>
                                </select>
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-[var(--color-primary)]">
                                ₹{(baseTotal + lineGst).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT 4 COLUMNS - PAYMENT SUMMARY SIDEBAR */}
            <div className="xl:col-span-4 space-y-4">
              <div className="glass-panel p-5 space-y-5 border-[var(--color-primary)]/30 sticky top-6">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Payment Summary
                </h3>

                <div className="space-y-3 text-xs font-mono border-b border-border-card pb-4">
                  <div className="flex justify-between text-text-secondary">
                    <span>Items Total:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center group">
                    <span className="text-text-secondary flex items-center gap-1 group-hover:text-cyan-400 transition-colors cursor-pointer">
                      <Percent size={12} /> Discount:
                    </span>
                    <input 
                      type="number" min={0} max={subtotal} value={discount || ''}
                      onChange={e => setDiscount(Number(e.target.value))}
                      placeholder="0"
                      className="w-20 bg-transparent border-b border-white/20 text-right text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="flex justify-between items-center group">
                    <span className="text-text-secondary group-hover:text-orange-400 transition-colors cursor-pointer">Service Chg:</span>
                    <input 
                      type="number" min={0} value={serviceCharge || ''}
                      onChange={e => setServiceCharge(Number(e.target.value))}
                      placeholder="0"
                      className="w-20 bg-transparent border-b border-white/20 text-right text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="flex justify-between text-text-secondary pt-1">
                    <span>Total Tax (GST):</span>
                    <span>₹{Math.round(totalGst).toLocaleString()}</span>
                  </div>
                  
                  {roundOffValue !== 0 && (
                    <div className="flex justify-between text-text-muted">
                      <span>Round Off:</span>
                      <span>₹{roundOffValue}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center bg-[var(--color-primary-glow)] p-3 rounded-xl border border-[var(--color-primary)]/20 shadow-inner">
                  <span className="text-sm font-bold text-text-primary uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-extrabold text-[var(--color-primary)] font-mono">₹{finalGrandTotal.toLocaleString()}</span>
                </div>

                {/* Settlement Method */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Payment Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Cash', 'UPI', 'Card', 'Bank Transfer'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m as any)}
                        className={`py-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${paymentMethod === m ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)] text-[var(--color-primary)]' : 'border-border-card bg-white/5 text-text-secondary hover:text-text-primary'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Payment Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'PAID', label: 'Fully Paid' },
                      { id: 'PARTIAL', label: 'Partial Payment' },
                      { id: 'PENDING', label: 'Pending Payment' }
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setPaymentStatus(s.id as any);
                          if (s.id === 'PAID') {
                            setPaidAmount(finalGrandTotal);
                            setDueDate('');
                          } else if (s.id === 'PENDING') {
                            setPaidAmount(0);
                          } else {
                            setPaidAmount(Math.round(finalGrandTotal / 2));
                          }
                        }}
                        className={`py-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${paymentStatus === s.id ? (s.id === 'PAID' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : s.id === 'PARTIAL' ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-red-500 bg-red-500/20 text-red-400') : 'border-border-card bg-white/5 text-text-secondary hover:text-text-primary'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentStatus !== 'PAID' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {paymentStatus === 'PARTIAL' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Received Amount (₹)</label>
                        <input 
                          type="number" 
                          min="0"
                          max={finalGrandTotal}
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(Number(e.target.value))}
                          className="w-full bg-bg-card border border-border-card rounded-lg p-2 text-text-primary text-sm focus:border-[var(--color-primary)] outline-none"
                        />
                      </div>
                    )}
                    {paymentStatus === 'PENDING' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Balance Due (₹)</label>
                        <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-red-400 text-sm font-bold flex items-center justify-between">
                          <span>{finalGrandTotal.toLocaleString()}</span>
                          <AlertCircle size={14} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Due Date</label>
                      <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-bg-card border border-border-card rounded-lg p-2 text-text-primary text-sm focus:border-[var(--color-primary)] outline-none"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Remarks (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Will pay balance next week"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-bg-card border border-border-card rounded-lg p-2 text-text-primary text-sm focus:border-[var(--color-primary)] outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentStatus === 'PARTIAL' && (
                  <div className="flex justify-between items-center bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 mt-2">
                    <span className="text-xs font-bold text-orange-400">Balance Auto-Calc</span>
                    <span className="text-sm font-extrabold text-orange-400 font-mono">₹{Math.max(0, finalGrandTotal - paidAmount).toLocaleString()}</span>
                  </div>
                )}

                <button
                  onClick={handleCreateBill}
                  disabled={!selectedCustomerId || items.length === 0 || !canCreate}
                  className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Printer size={16} /> GENERATE INVOICE
                </button>
              </div>
            </div>
          </div>
        ) : (
          
          /* LOCKED INVOICE PREVIEW VIEW PAGE */
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* View Mode Action Controls bar */}
            <div className="glass-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-3 no-print">
              <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                Invoice Successfully Locked & Synced to Database!
              </span>

              <div className="flex gap-2 text-xs font-bold w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white/5 border border-border-card hover:bg-hover-bg hover:border-white/20 text-text-primary rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Printer size={14} /> Print Invoice
                </button>
                <button
                  onClick={async () => activeInvoiceToShow && await generatePDFReport(activeInvoiceToShow)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[var(--color-primary-glow)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-black text-[var(--color-primary)] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <FileText size={14} /> Download PDF
                </button>
              </div>
            </div>

            {/* Secondary Action Share Bar */}
            <div className="glass-panel p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 no-print text-center text-xs font-semibold">
              <a
                href={`https://wa.me/${activeInvoiceToShow?.phone}?text=Hello%20${encodeURIComponent(activeInvoiceToShow?.customerName || '')}%2C%20your%20tax%20invoice%20${activeInvoiceToShow?.invoiceNumber}%20of%20Rs.%20${activeInvoiceToShow?.total}%20is%20ready.%20Pay%20online%20here%3A%20${encodeURIComponent(`${window.location.origin}${window.location.pathname}#/checkout/${activeInvoiceToShow?.id}`)}%20.%20Thank%20you%20for%20visiting%20us!`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl border border-green-500/10 hover:bg-green-500/10 text-green-400 flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-green-500/20 active:scale-95"
              >
                <MessageSquare size={16} /> Share via WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  const checkoutLink = `${window.location.origin}${window.location.pathname}#/checkout/${activeInvoiceToShow?.id}`;
                  navigator.clipboard.writeText(checkoutLink);
                  triggerToast('Checkout link copied successfully!');
                }}
                className="p-3 rounded-xl border border-cyan-500/10 hover:bg-cyan-500/10 text-cyan-400 flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-cyan-500/20 active:scale-95"
              >
                <Copy size={16} /> Copy Payment Link
              </button>
              <button
                type="button"
                onClick={() => triggerToast(`Mock SMTP Server: Dispatched invoice copy to ${activeInvoiceToShow?.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`)}
                className="p-3 rounded-xl border border-blue-500/10 hover:bg-blue-500/10 text-blue-400 flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-blue-500/20 active:scale-95"
              >
                <Mail size={16} /> Send via Email
              </button>
            </div>

            {/* PRINT AREA: HIGH-QUALITY A4 SHEET TEMPLATE */}
            <div id="print-area" className="bg-white text-black p-8 sm:p-12 shadow-2xl relative space-y-8 font-sans min-h-[297mm] flex flex-col justify-between">
              <div>
                {/* Branding row */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={branding.emailLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      {settings.shopName}
                    </h2>
                    <p className="text-[9px] text-text-muted mt-2 leading-relaxed font-mono">
                      {settings.address}<br />
                      Phone: {settings.phone} | GSTIN: {settings.gstNumber}<br />
                      Email: {settings.email || 'contact@zenwar.co'}
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">GST TAX INVOICE</h3>
                    <p className="text-[10px] text-text-muted font-mono mt-1">Invoice ID: <strong>{activeInvoiceToShow?.invoiceNumber}</strong></p>
                    <p className="text-[10px] text-text-muted font-mono">Date Issued: {activeInvoiceToShow?.date}</p>
                    <p className="text-[9px] text-text-secondary mt-1 uppercase font-bold">
                      Payment Status: 
                      {activeInvoiceToShow?.paymentStatus === 'PARTIAL' ? (
                        <span className="text-orange-500 font-extrabold ml-1">PARTIAL PAYMENT</span>
                      ) : activeInvoiceToShow?.paymentStatus === 'PENDING' ? (
                        <span className="text-red-500 font-extrabold ml-1">PAYMENT PENDING</span>
                      ) : (
                        <span className="text-emerald-600 font-extrabold ml-1">PAID ({activeInvoiceToShow?.paymentMethod})</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Billed info details */}
                <div className="grid grid-cols-2 gap-8 text-[10px] text-gray-700 py-6 border-b border-gray-100">
                  <div>
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">BILLED TO:</span>
                    <p className="font-bold text-gray-900 text-sm mt-1">{activeInvoiceToShow?.customerName}</p>
                    <p className="mt-0.5">Phone: {activeInvoiceToShow?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-bold">VEHICLE DETAILS:</span>
                    <p className="font-mono text-cyan-700 font-bold text-[11px] mt-1">Plate: {activeInvoiceToShow?.vehiclePlate}</p>
                    <p className="text-text-muted mt-0.5">Business check-in referenced database snapshot.</p>
                  </div>
                </div>

                {/* Table items list */}
                <table className="w-full text-[10px] text-left mt-6">
                  <thead>
                    <tr className="border-b border-gray-200 text-text-secondary font-bold">
                      <th className="pb-3 text-left">Description</th>
                      <th className="pb-3 text-center w-16">Type</th>
                      <th className="pb-3 text-center w-24">Unit Price</th>
                      <th className="pb-3 text-center w-16">Qty</th>
                      <th className="pb-3 text-center w-16">GST %</th>
                      <th className="pb-3 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                    {activeInvoiceToShow?.items.map((item: any, idx: number) => {
                      const base = item.price * item.quantity;
                      const gst = (base * (item.gstRate || 18)) / 100;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-3">
                            <div className="font-bold text-gray-900">{item.name}</div>
                            <div className="text-[9px] text-text-secondary italic font-normal leading-normal">{item.description}</div>
                          </td>
                          <td className="py-3 text-center capitalize">{item.type}</td>
                          <td className="py-3 text-center font-mono">₹{item.price.toLocaleString()}</td>
                          <td className="py-3 text-center font-mono">{item.quantity}</td>
                          <td className="py-3 text-center font-mono">{item.gstRate || 18}%</td>
                          <td className="py-3 text-right font-mono font-bold text-gray-900">₹{(base + gst).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculation ledger */}
              <div className="space-y-6">
                <div className="border-t border-gray-200 pt-6 flex justify-end">
                  <div className="w-72 space-y-2 text-[10px] font-mono text-gray-700">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{activeInvoiceToShow?.subtotal.toLocaleString()}</span>
                    </div>
                    {activeInvoiceToShow?.discount && activeInvoiceToShow.discount > 0 && (
                      <div className="flex justify-between text-red-600 font-bold">
                        <span>Discount (-):</span>
                        <span>- ₹{activeInvoiceToShow.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {activeInvoiceToShow?.serviceCharge && activeInvoiceToShow.serviceCharge > 0 && (
                      <div className="flex justify-between text-blue-600 font-bold">
                        <span>Service Charge (+):</span>
                        <span>₹{activeInvoiceToShow.serviceCharge.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>CGST (9% split):</span>
                      <span>₹{activeInvoiceToShow && Math.round(activeInvoiceToShow.gstAmount / 2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (9% split):</span>
                      <span>₹{activeInvoiceToShow && Math.round(activeInvoiceToShow.gstAmount / 2).toLocaleString()}</span>
                    </div>
                    {activeInvoiceToShow?.roundOff !== undefined && activeInvoiceToShow.roundOff !== 0 && (
                      <div className="flex justify-between text-text-secondary">
                        <span>Round-off:</span>
                        <span>₹{activeInvoiceToShow.roundOff}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-bold text-gray-900 border-t border-gray-200 pt-2.5">
                      <span>GRAND NET TOTAL:</span>
                      <span className="text-gray-900 text-base">₹{activeInvoiceToShow?.total.toLocaleString()}</span>
                    </div>
                    {activeInvoiceToShow?.paymentStatus && activeInvoiceToShow.paymentStatus !== 'PAID' && (
                      <>
                        <div className="flex justify-between text-text-muted mt-2">
                          <span>Paid Amount:</span>
                          <span>₹{(activeInvoiceToShow?.paidAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-red-500 mt-1">
                          <span>BALANCE DUE:</span>
                          <span>₹{(activeInvoiceToShow?.balanceAmount || 0).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer notes & signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100 text-[9px] text-text-secondary leading-relaxed">
                  <div>
                    <h5 className="font-bold text-gray-600 uppercase">Terms & Conditions:</h5>
                    <p className="mt-1">1. Parts are warranted as per respective vendor provisions.<br />2. Service payments are non-refundable once completed.<br />3. Fuel, towing charges are excluded from standard labor packages.</p>
                  </div>
                  <div className="flex flex-col justify-end items-end h-full">
                    <div className="w-36 border-b border-gray-300 mb-1"></div>
                    <span className="font-bold text-gray-600 text-[10px]">Authorized Signatory</span>
                  </div>
                </div>

                <p className="text-center text-[9px] text-text-secondary font-mono uppercase tracking-widest mt-4">!!! Thank you for choosing us. Drive safely !!!</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* WEBCAM CAMERA MODAL IN POS */}
      {barcodeScannerOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-sm w-full border-border-card relative text-center space-y-4 animate-in zoom-in-95 duration-200 bg-[#080910]">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center justify-center gap-2">
              <Barcode size={18} className="text-[var(--color-primary)] animate-pulse" /> Scanner camera feed
            </h3>
            
            <div className="w-full h-44 border border-border-card rounded-xl relative overflow-hidden bg-bg-card flex items-center justify-center">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
              
              <div className="absolute left-4 right-4 h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" style={{ animationDuration: '2s' }} />
              <span className="text-[10px] font-mono text-gray-600 animate-pulse">optical input simulated</span>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-text-secondary font-mono leading-none">{scannedMsg}</p>
              <p className="text-[9px] text-text-muted">Locks barcode matching key to POS ledger</p>
            </div>

            <button 
              type="button"
              onClick={() => setBarcodeScannerOpen(false)}
              className="w-full py-2 bg-white/5 border border-border-card text-text-primary rounded-lg text-xs font-semibold hover:bg-hover-bg cursor-pointer"
            >
              Cancel Camera
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50 no-print">
          <Sparkles size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
