import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Printer, 
  FileText, 
  X, 
  Calendar,
  Download,
  Edit3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  DollarSign
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { useDatabase } from '../context/DatabaseContext';
import { useModal } from '../context/ModalContext';
import type { Invoice, InvoiceItem } from '../data/seedData';
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

export const Invoices: React.FC = () => {
  const { 
    invoices, 
    updateInvoice, 
    deleteInvoice, 
    settings,
    currentUser,
    permissionRules,
    mechanics,
    getWorkshopPaymentConfig
  } = useDatabase();
  const { confirm } = useModal();
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

  const hasAccess = activePermissions ? activePermissions.invoices.read : true;
  const canEdit = activePermissions ? activePermissions.invoices.edit : true;
  const canDelete = activePermissions ? activePermissions.invoices.delete : true;
  const isDemo = currentUser?.tenantDomain === 'DEMO001';
  const canExport = isDemo || (activePermissions ? activePermissions.invoices.export : true);
  const canApprove = activePermissions ? activePermissions.invoices.approve : true;

  // Search & List Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue' | 'Failed' | 'Partially Paid'>('All');
  const [methodFilter, setMethodFilter] = useState<'All' | 'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Razorpay'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'invoiceNum'>('date');

  // Date Range Report States
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Selected Invoice Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Edit Form state
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editVehiclePlate, setEditVehiclePlate] = useState('');
  const [editStatus, setEditStatus] = useState<'Paid' | 'Pending' | 'Overdue' | 'Failed' | 'Partially Paid'>('Paid');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Razorpay'>('UPI');
  const [editItems, setEditItems] = useState<InvoiceItem[]>([]);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editServiceCharge, setEditServiceCharge] = useState<number>(0);

  // Collect Balance Modal state
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Bank Transfer' | 'Razorpay'>('Cash');
  const [collectRemarks, setCollectRemarks] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Filtered invoices for list view
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
      const matchesMethod = methodFilter === 'All' || inv.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    }).sort((a, b) => {
      if (sortBy === 'amount') return b.total - a.total;
      if (sortBy === 'invoiceNum') return b.invoiceNumber.localeCompare(a.invoiceNumber);
      // Default: date sorting
      const dateA = new Date(a.dateCreated || a.date).getTime();
      const dateB = new Date(b.dateCreated || b.date).getTime();
      return dateB - dateA;
    });
  }, [invoices, searchQuery, statusFilter, methodFilter, sortBy]);

  // Report Invoices between selected dates
  const reportInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = new Date((inv.dateCreated || inv.date).split('T')[0]).getTime();
      const start = startDate ? new Date(startDate).getTime() : 0;
      const end = endDate ? new Date(endDate).getTime() : Infinity;
      return invDate >= start && invDate <= end;
    });
  }, [invoices, startDate, endDate]);

  // Date Range Sales Report Calculations
  const reportStats = useMemo(() => {
    let totalSales = 0;
    let totalGst = 0;
    let cashPayments = 0;
    let onlinePayments = 0;
    let pendingPayments = 0;

    reportInvoices.forEach(inv => {
      if (inv.status === 'Paid') {
        totalSales += inv.total;
        totalGst += inv.gstAmount;
        if (inv.paymentMethod === 'Cash') {
          cashPayments += inv.total;
        } else {
          onlinePayments += inv.total;
        }
      } else {
        pendingPayments += inv.total;
      }
    });

    return {
      totalSales,
      totalGst,
      cashPayments,
      onlinePayments,
      pendingPayments,
      count: reportInvoices.length
    };
  }, [reportInvoices]);

  // Exporter: Excel CSV
  const handleExportCSV = () => {
    if (!canExport) {
      triggerToast('Access Denied: Exporting records is locked.');
      return;
    }
    const headers = ['Invoice Number', 'Customer Name', 'Vehicle Number', 'Date', 'Payment Type', 'GST Amount', 'Total Amount', 'Status'];
    const rows = reportInvoices.map(inv => [
      inv.invoiceNumber,
      inv.customerName,
      inv.vehiclePlate,
      (inv.dateCreated || inv.date).split('T')[0],
      inv.paymentMethod,
      inv.gstAmount,
      inv.total,
      inv.status || 'Paid'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Excel report download triggered');
  };

  // Exporter: Sales Report PDF
  const handleExportReportPDF = () => {
    if (!canExport) {
      triggerToast('Access Denied: Exporting records is locked.');
      return;
    }
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#111827');
    doc.text(`${settings.shopName} - Sales Analysis Report`, 14, 20);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#4b5563');
    doc.text(`Report Period: ${startDate} to ${endDate}`, 14, 26);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 31);
    
    doc.line(14, 36, 196, 36);

    // Summary Cards block
    doc.setFillColor('#f8fafc');
    doc.rect(14, 42, 182, 35, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#1e293b');
    
    doc.text('REPORT SUMMARY STATISTICS:', 18, 48);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Total Invoices Count: ${reportStats.count}`, 18, 55);
    doc.text(`Total Settled Revenue: Rs. ${reportStats.totalSales.toLocaleString()}`, 18, 61);
    doc.text(`GST Tax Collected: Rs. ${reportStats.totalGst.toLocaleString()}`, 18, 67);
    
    doc.text(`Cash Settlements: Rs. ${reportStats.cashPayments.toLocaleString()}`, 110, 55);
    doc.text(`Online Settlements: Rs. ${reportStats.onlinePayments.toLocaleString()}`, 110, 61);
    doc.text(`Pending Receivables: Rs. ${reportStats.pendingPayments.toLocaleString()}`, 110, 67);

    // Table rows
    const tableTop = 85;
    doc.setFillColor('#e2e8f0');
    doc.rect(14, tableTop, 182, 6, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Invoice ID', 16, tableTop + 4.5);
    doc.text('Customer Name', 45, tableTop + 4.5);
    doc.text('Plate', 90, tableTop + 4.5);
    doc.text('Date', 120, tableTop + 4.5);
    doc.text('Method', 142, tableTop + 4.5);
    doc.text('GST (Rs)', 162, tableTop + 4.5);
    doc.text('Total (Rs)', 180, tableTop + 4.5);

    doc.setFont('Helvetica', 'normal');
    let y = tableTop + 11;
    reportInvoices.forEach(inv => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(inv.invoiceNumber, 16, y);
      doc.text(inv.customerName.length > 20 ? inv.customerName.slice(0, 18) + '..' : inv.customerName, 45, y);
      doc.text(inv.vehiclePlate, 90, y);
      doc.text((inv.dateCreated || inv.date).split('T')[0], 120, y);
      doc.text(inv.paymentMethod, 142, y);
      doc.text(inv.gstAmount.toLocaleString(), 162, y);
      doc.text(inv.total.toLocaleString(), 180, y);
      y += 7;
    });

    doc.save(`Sales_Report_${startDate}_to_${endDate}.pdf`);
    triggerToast('Sales Report PDF downloaded');
  };

  // Open Preview Modal
  const handleOpenPreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPreviewOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (inv: Invoice) => {
    if (!canEdit) {
      triggerToast('Access Denied: Invoice editing is locked for your role.');
      return;
    }
    setSelectedInvoice(inv);
    setEditCustomerName(inv.customerName);
    setEditPhone(inv.phone || '');
    setEditVehiclePlate(inv.vehiclePlate);
    setEditStatus(inv.status || 'Paid');
    setEditPaymentMethod(inv.paymentMethod);
    setEditItems(inv.items);
    setEditDiscount(inv.discount || 0);
    setEditServiceCharge(inv.serviceCharge || 0);
    setEditOpen(true);
  };

  // Edit Item qty changes
  const handleEditItemQty = (idx: number, qty: number) => {
    const updated = [...editItems];
    updated[idx].quantity = Math.max(1, qty);
    setEditItems(updated);
  };

  // Delete invoice with prompt
  const handleDeleteInvoice = async (id: string) => {
    if (!canDelete) {
      triggerToast('Access Denied: Invoice deletion is locked.');
      return;
    }
    if (await confirm('Are you sure you want to permanently delete this invoice? This will rollback database totals.')) {
      deleteInvoice(id);
      setPreviewOpen(false);
      triggerToast('Invoice deleted from registry.');
    }
  };

  const handleOpenCollect = (inv: Invoice) => {
    if (!canEdit) {
      triggerToast('Access Denied: Payment collection is locked for your role.');
      return;
    }
    setSelectedInvoice(inv);
    setCollectAmount(inv.balanceAmount || 0);
    setCollectMethod(inv.paymentMethod || 'Cash');
    setCollectRemarks('');
    setCollectOpen(true);
  };

  const handleCollectBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (collectAmount <= 0 || collectAmount > (selectedInvoice.balanceAmount || 0)) {
      triggerToast('Invalid collection amount');
      return;
    }

    const currentPaid = selectedInvoice.paidAmount || 0;
    const currentBalance = selectedInvoice.balanceAmount || 0;
    const newPaid = currentPaid + collectAmount;
    const newBalance = currentBalance - collectAmount;
    
    const newHistory = [...(selectedInvoice.paymentHistory || [])];
    newHistory.push({
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: collectAmount,
      method: collectMethod,
      remarks: collectRemarks || 'Balance Collection'
    });

    const isFullyPaid = newBalance <= 0;

    updateInvoice(selectedInvoice.id, {
      paidAmount: newPaid,
      balanceAmount: newBalance,
      paymentStatus: isFullyPaid ? 'PAID' : 'PARTIAL',
      status: isFullyPaid ? 'Paid' : 'Partially Paid',
      paymentHistory: newHistory
    });

    setCollectOpen(false);
    setSelectedInvoice(null);
    triggerToast(`Successfully collected ₹${collectAmount.toLocaleString()}`);
  };

  // Save modified invoice details
  const handleSaveEditedInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    // Recalculate
    const subtotal = editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gstAmount = editItems.reduce((sum, item) => {
      const rate = item.gstRate || 18;
      return sum + (item.price * item.quantity * rate) / 100;
    }, 0);

    const totalBeforeRound = Math.max(0, subtotal + gstAmount + editServiceCharge - editDiscount);
    const finalTotal = Math.round(totalBeforeRound);
    const roundOff = Number((finalTotal - totalBeforeRound).toFixed(2));

    updateInvoice(selectedInvoice.id, {
      customerName: editCustomerName,
      phone: editPhone,
      vehiclePlate: editVehiclePlate,
      status: editStatus,
      paymentMethod: editPaymentMethod,
      items: editItems,
      subtotal,
      gstAmount: Math.round(gstAmount),
      discount: editDiscount,
      serviceCharge: editServiceCharge,
      roundOff,
      total: finalTotal
    });

    setEditOpen(false);
    setSelectedInvoice(null);
    triggerToast('Invoice changes updated successfully');
  };

  const handlePrintSelected = () => {
    window.print();
  };

  // jsPDF single preview downloader
  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!canExport) {
      triggerToast('Access Denied: Exporting records is locked.');
      return;
    }
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(settings.shopName, 14, 20);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#4b5563');
    doc.text(settings.address, 14, 26);
    doc.text(`Phone: ${settings.phone}  |  Email: ${settings.email || 'contact@zenwar.co'}`, 14, 31);
    doc.text(`GSTIN: ${settings.gstNumber}`, 14, 36);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#0ea5e9');
    doc.text('TAX INVOICE', 145, 20);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 145, 26);
    doc.text(`Date: ${invoice.date}`, 145, 31);
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
    doc.line(14, 42, 196, 42);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#111827');
    doc.text('BILLED TO:', 14, 49);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#374151');
    doc.text(invoice.customerName, 14, 54);
    doc.text(`Phone: ${invoice.phone}`, 14, 59);
    
    doc.setFont('Helvetica', 'bold');
    doc.text('VEHICLE DETAILS:', 110, 49);
    
    doc.setFont('Helvetica', 'normal');
    doc.text(`Vehicle Plate: ${invoice.vehiclePlate}`, 110, 54);
    
    doc.line(14, 65, 196, 65);
    
    const tableTop = 72;
    doc.setFillColor('#f3f4f6');
    doc.rect(14, tableTop, 182, 7, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor('#374151');
    doc.text('Parts & Services Name', 16, tableTop + 5);
    doc.text('Type', 90, tableTop + 5);
    doc.text('Qty', 110, tableTop + 5);
    doc.text('Unit Price (Rs)', 128, tableTop + 5);
    doc.text('GST %', 158, tableTop + 5);
    doc.text('Total (Rs)', 178, tableTop + 5);
    
    doc.setFont('Helvetica', 'normal');
    let y = tableTop + 13;
    invoice.items.forEach((item: any) => {
      doc.text(item.name, 16, y);
      doc.text(item.type === 'part' ? 'Part' : 'Labor', 90, y);
      doc.text(item.quantity.toString(), 112, y);
      doc.text(item.price.toLocaleString(), 131, y);
      doc.text(`${item.gstRate || 18}%`, 161, y);
      doc.text((item.price * item.quantity).toLocaleString(), 180, y);
      y += 8;
    });
    
    doc.line(14, y, 196, y);
    y += 6;
    
    const calcStart = 135;
    doc.setFontSize(9);
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
    
    doc.text('CGST (9%):', calcStart, y);
    doc.text(Math.round(invoice.gstAmount / 2).toLocaleString(), 180, y);
    y += 5;
    
    doc.text('SGST (9%):', calcStart, y);
    doc.text(Math.round(invoice.gstAmount / 2).toLocaleString(), 180, y);
    y += 5;
    
    if (invoice.roundOff) {
      doc.text('Round Off:', calcStart, y);
      doc.text(invoice.roundOff.toString(), 180, y);
      y += 5;
    }
    
    doc.setFont('Helvetica', 'bold');
    doc.text('Grand Total:', calcStart, y);
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
    y += 12;
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
    
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const handleUpdatePaymentStatus = (id: string, newStatus: any) => {
    if (!canApprove) {
      triggerToast('Access Denied: Changing payment status requires approval permissions.');
      return;
    }
    updateInvoice(id, { status: newStatus });
    triggerToast(`Payment status updated to ${newStatus}`);
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md border-red-500/20 bg-red-950/5 space-y-4 no-print">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <X size={32} />
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">Module Access Restrict</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your current assigned role (<span className="text-red-400 font-semibold">{currentUser?.role}</span>) does not have access permissions to view the <strong>Invoice Registry</strong>.
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
      {/* Dynamic print stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area-invoice, #print-area-invoice * {
            visibility: visible;
          }
          #print-area-invoice {
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

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <FileText className="text-[var(--color-primary)]" size={28} /> Saved Invoices Ledger
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Search, filter, track payments status, and export date-range sales reports.
          </p>
        </div>
      </div>

      {/* Grid: 2-Cols for Date-Range Reporting & Filter list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
        
        {/* LEFT COLUMN 4: Date-Range Export Report Dashboard widget */}
        <div className="lg:col-span-4 glass-panel p-5 space-y-5 border-cyan-500/10">
          <div>
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} /> Date-Range Sales Compiler
            </h3>
            <p className="text-[10px] text-text-muted font-mono mt-0.5">Filter sales logs and export reporting templates</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[9px] font-bold text-text-secondary block mb-1">START DATE *</label>
              <input 
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-text-secondary block mb-1">END DATE *</label>
              <input 
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono cursor-pointer"
              />
            </div>
          </div>

          {/* Aggregated Mini Dashboard */}
          <div className="border-t border-border-card pt-4 space-y-2.5 text-[11px] font-mono">
            <div className="flex justify-between text-text-secondary">
              <span>Total Invoices Count:</span>
              <span className="text-text-primary font-bold">{reportStats.count} bills</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>GST Collections (Tax):</span>
              <span className="text-cyan-400 font-bold">₹{reportStats.totalGst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Online Payments (UPI/Card):</span>
              <span className="text-text-primary font-bold">₹{reportStats.onlinePayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Cash Payments:</span>
              <span className="text-text-primary font-bold">₹{reportStats.cashPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-text-secondary border-b border-border-card pb-2">
              <span>Pending Receivables:</span>
              <span className="text-orange-400 font-bold">₹{reportStats.pendingPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[var(--color-primary)] pt-1">
              <span>TOTAL SALES:</span>
              <span>₹{reportStats.totalSales.toLocaleString()}</span>
            </div>
          </div>

          {/* Export Action triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 pt-2 text-xs font-bold text-center">
            <button
              onClick={handleExportCSV}
              className="py-2 rounded-xl bg-green-500/10 border border-green-500/25 hover:bg-green-500/20 text-green-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95"
            >
              <Download size={13} /> Export Excel (CSV)
            </button>
            <button
              onClick={handleExportReportPDF}
              className="py-2 rounded-xl bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95"
            >
              <FileText size={13} /> Export PDF Report
            </button>
            <button
              onClick={() => {
                triggerToast('Print triggered. Toggle dates to isolate sales rows.');
                window.print();
              }}
              className="py-2 rounded-xl bg-white/5 border border-border-card hover:bg-hover-bg text-text-primary flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95"
            >
              <Printer size={13} /> Print Sales Report
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN 8: Search, Filter Table list */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Query, Status, Method parameters bar */}
          <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search bills, customer, vehicle..." 
                className="w-full bg-bg-card border border-border-card rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-600"
              />
            </div>

            <div className="flex flex-wrap gap-2.5 items-center text-xs font-semibold w-full md:w-auto">
              {/* Status filter selector */}
              <div className="flex items-center gap-1">
                <span className="text-text-muted text-[10px] font-bold uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-[#0b0d16] border border-border-card rounded-lg px-2.5 py-1.5 text-xs text-text-primary cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Failed">Failed</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>

              {/* Method filter selector */}
              <div className="flex items-center gap-1">
                <span className="text-text-muted text-[10px] font-bold uppercase">Method:</span>
                <select
                  value={methodFilter}
                  onChange={e => setMethodFilter(e.target.value as any)}
                  className="bg-[#0b0d16] border border-border-card rounded-lg px-2.5 py-1.5 text-xs text-text-primary cursor-pointer"
                >
                  <option value="All">All Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Razorpay">Razorpay</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1">
                <span className="text-text-muted text-[10px] font-bold uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-[#0b0d16] border border-border-card rounded-lg px-2.5 py-1.5 text-xs text-text-primary cursor-pointer"
                >
                  <option value="date">Date Issued</option>
                  <option value="amount">Bill Total</option>
                  <option value="invoiceNum">Invoice No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices List Display */}
          <div className="glass-panel p-5 space-y-4">
            {filteredInvoices.length === 0 ? (
              <div className="py-20 text-center text-xs text-text-muted border border-dashed border-border-card rounded-xl">
                No invoices found matching query filters in registry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border-card text-[var(--text-secondary)] font-bold">
                      <th className="pb-3 text-left">Invoice No</th>
                      <th className="pb-3 text-left">Customer Name</th>
                      <th className="pb-3 text-center">Date</th>
                      <th className="pb-3 text-right">Total Amount</th>
                      <th className="pb-3 text-right">Paid Amount</th>
                      <th className="pb-3 text-right">Balance</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-text-primary">
                    {filteredInvoices.map((inv) => {
                      const badgeColors = {
                        'Paid': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
                        'Pending': 'bg-red-500/10 text-red-400 border border-red-500/15',
                        'Overdue': 'bg-red-500/10 text-red-400 border border-red-500/15',
                        'Failed': 'bg-red-500/10 text-red-400 border border-red-500/15',
                        'Partially Paid': 'bg-orange-500/10 text-orange-400 border border-orange-500/15'
                      };

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.01]">
                          <td className="py-3.5 font-bold font-mono text-[var(--color-primary)]">{inv.invoiceNumber}</td>
                          <td className="py-3.5 font-semibold">{inv.customerName}</td>
                          <td className="py-3.5 text-center font-mono text-text-secondary">{(inv.dateCreated || inv.date).split('T')[0]}</td>
                          <td className="py-3.5 text-right font-mono font-bold">₹{inv.total.toLocaleString()}</td>
                          <td className="py-3.5 text-right font-mono text-emerald-400">₹{(inv.paidAmount ?? inv.total).toLocaleString()}</td>
                          <td className="py-3.5 text-right font-mono text-red-400 font-bold">₹{(inv.balanceAmount ?? 0).toLocaleString()}</td>
                          <td className="py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-[5px] text-[9px] font-bold uppercase ${badgeColors[inv.status || 'Paid']}`}>
                              {inv.status || 'Paid'}
                            </span>
                          </td>
                          <td className="py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {inv.balanceAmount && inv.balanceAmount > 0 ? (
                                <button
                                  onClick={() => handleOpenCollect(inv)}
                                  className="p-1 text-text-secondary hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-all cursor-pointer"
                                  title="Collect Balance"
                                >
                                  <DollarSign size={13} />
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleOpenPreview(inv)}
                                className="p-1 text-text-secondary hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-glow)] rounded transition-all cursor-pointer"
                                title="Open A4 Preview"
                              >
                                <FileText size={13} />
                              </button>
                              <button
                                onClick={async () => await handleDownloadPDF(inv)}
                                className="p-1 text-text-secondary hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-all cursor-pointer"
                                title="Download PDF Receipt"
                              >
                                <Download size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  const checkoutLink = `${window.location.origin}${window.location.pathname}#/checkout/${inv.id}`;
                                  navigator.clipboard.writeText(checkoutLink);
                                  triggerToast('Payment link copied successfully!');
                                }}
                                className="p-1 text-text-secondary hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-all cursor-pointer"
                                title="Copy Customer Payment Link"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(inv)}
                                className="p-1 text-text-secondary hover:text-orange-400 hover:bg-orange-500/10 rounded transition-all cursor-pointer"
                                title="Edit Invoice Details"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="p-1 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                                title="Permanently Delete Invoice"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
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

      </div>

      {/* RENDER DYNAMIC HIDDEN PRINT LAYOUT AREA FOR BROWSER DIRECT PRINTS */}
      {selectedInvoice && (
        <div id="print-area-invoice" className="hidden bg-white text-black p-12 space-y-6 font-sans">
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">{settings.shopName}</h2>
              <p className="text-[9px] text-text-muted mt-1 font-mono">
                {settings.address}<br />Phone: {settings.phone} | GSTIN: {settings.gstNumber}<br />Email: {settings.email}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-gray-900 uppercase">GST TAX INVOICE</h3>
              <p className="text-[9px] text-text-muted font-mono">Invoice: {selectedInvoice.invoiceNumber}</p>
              <p className="text-[9px] text-text-muted font-mono">Issued: {selectedInvoice.date}</p>
              <p className="text-[8px] font-bold mt-1 text-emerald-600">PAID ({selectedInvoice.paymentMethod})</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[9px] text-gray-700 py-3 border-b border-gray-100">
            <div>
              <span className="font-bold text-text-secondary block uppercase text-[8px]">BILLED TO:</span>
              <p className="font-bold text-gray-900 text-xs mt-0.5">{selectedInvoice.customerName}</p>
              <p>Phone: {selectedInvoice.phone}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-text-secondary block uppercase text-[8px]">VEHICLE DETAILS:</span>
              <p className="font-mono text-cyan-700 font-bold mt-0.5">Plate: {selectedInvoice.vehiclePlate}</p>
            </div>
          </div>
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-text-secondary font-bold">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Type</th>
                <th className="pb-2 text-center">Unit Price</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-center">GST%</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedInvoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2">
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-[8px] text-text-secondary italic">{item.description}</div>
                  </td>
                  <td className="py-2 text-center capitalize">{item.type}</td>
                  <td className="py-2 text-center font-mono">₹{item.price.toLocaleString()}</td>
                  <td className="py-2 text-center font-mono">{item.quantity}</td>
                  <td className="py-2 text-center font-mono">{item.gstRate || 18}%</td>
                  <td className="py-2 text-right font-mono font-bold">₹{(item.price * item.quantity * (1 + (item.gstRate || 18)/100)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-200 pt-4 flex justify-end">
            <div className="w-48 text-[9px] font-mono text-gray-700 space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{selectedInvoice.subtotal.toLocaleString()}</span></div>
              {selectedInvoice.discount > 0 && <div className="flex justify-between"><span>Discount:</span><span>- ₹{selectedInvoice.discount.toLocaleString()}</span></div>}
              {selectedInvoice.serviceCharge && selectedInvoice.serviceCharge > 0 && <div className="flex justify-between"><span>Service Charge:</span><span>₹{selectedInvoice.serviceCharge.toLocaleString()}</span></div>}
              <div className="flex justify-between"><span>CGST:</span><span>₹{Math.round(selectedInvoice.gstAmount / 2).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>SGST:</span><span>₹{Math.round(selectedInvoice.gstAmount / 2).toLocaleString()}</span></div>
              {selectedInvoice.roundOff !== 0 && <div className="flex justify-between"><span>Round Off:</span><span>₹{selectedInvoice.roundOff}</span></div>}
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-900 border-t border-gray-100 pt-1">
                <span>Total Amount:</span><span>₹{selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="text-center text-[8px] text-text-secondary mt-6 pt-4 border-t border-gray-100 font-mono uppercase tracking-wider">
            Thank you for your visit! Drive safely.
          </div>
        </div>
      )}

      {/* A4 MODAL INVOICE PREVIEW VIEW */}
      <AnimatePresence>
        {previewOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel max-w-2xl w-full relative p-6 border-border-card space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setPreviewOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex justify-between items-center pb-2 border-b border-border-card">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-1.5">
                    <FileText className="text-[var(--color-primary)]" size={16} /> Invoice: {selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-[9px] text-text-muted font-mono mt-0.5">Preview locked database invoice details</p>
                </div>
              </div>

              {/* A4 Sheet Preview wrapper inside modal */}
              <div className="bg-white text-black p-6 rounded-lg border border-gray-300 text-[9px] font-sans space-y-4">
                
                {/* Branding row */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <div className="w-8 h-8 rounded overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={branding.emailLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      {settings.shopName}
                    </h4>
                    <p className="text-[8px] text-text-muted font-mono leading-tight mt-0.5">
                      {settings.address}<br />Phone: {settings.phone} | GSTIN: {settings.gstNumber}<br />Email: {settings.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <h5 className="font-bold text-gray-900 uppercase">GST TAX INVOICE</h5>
                    <p className="text-[8px] text-text-muted font-mono mt-0.5">Invoice: {selectedInvoice.invoiceNumber}</p>
                    <p className="text-[8px] text-text-muted font-mono">Date Issued: {selectedInvoice.date}</p>
                  </div>
                </div>

                {/* Clients info */}
                <div className="grid grid-cols-2 gap-4 text-[9px] text-gray-700 pb-1 border-b border-gray-100">
                  <div>
                    <span className="text-[8px] text-text-secondary uppercase tracking-wider block font-bold">BILLED TO:</span>
                    <p className="font-bold text-gray-900 mt-0.5 text-[10px]">{selectedInvoice.customerName}</p>
                    <p>Phone: {selectedInvoice.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-text-secondary uppercase tracking-wider block font-bold">VEHICLE DETAILS:</span>
                    <p className="font-mono text-cyan-700 font-bold mt-0.5 text-[10px]">Plate: {selectedInvoice.vehiclePlate}</p>
                  </div>
                </div>

                {/* Table items */}
                <table className="w-full text-[9px] text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-text-secondary font-bold">
                      <th className="pb-1.5">Description</th>
                      <th className="pb-1.5 text-center">Type</th>
                      <th className="pb-1.5 text-center">Unit Price</th>
                      <th className="pb-1.5 text-center w-10">Qty</th>
                      <th className="pb-1.5 text-center w-10">GST %</th>
                      <th className="pb-1.5 text-right w-16">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {selectedInvoice.items.map((item, idx) => {
                      const base = item.price * item.quantity;
                      const lineGst = base * (item.gstRate || 18) / 100;
                      return (
                        <tr key={idx}>
                          <td className="py-2">
                            <div className="font-bold text-gray-900">{item.name}</div>
                            <div className="text-[8px] text-text-secondary italic font-normal">{item.description}</div>
                          </td>
                          <td className="py-2 text-center capitalize">{item.type}</td>
                          <td className="py-2 text-center font-mono">₹{item.price.toLocaleString()}</td>
                          <td className="py-2 text-center font-mono">{item.quantity}</td>
                          <td className="py-2 text-center font-mono">{item.gstRate || 18}%</td>
                          <td className="py-2 text-right font-mono font-bold text-gray-900">₹{(base + lineGst).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Subtotals Ledger */}
                <div className="border-t border-gray-200 pt-3 flex justify-end">
                  <div className="w-48 text-[9px] font-mono text-gray-700 space-y-1">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₹{selectedInvoice.subtotal.toLocaleString()}</span></div>
                    {selectedInvoice.discount > 0 && <div className="flex justify-between text-red-600 font-bold"><span>Discount (-):</span><span>- ₹{selectedInvoice.discount.toLocaleString()}</span></div>}
                    {selectedInvoice.serviceCharge && selectedInvoice.serviceCharge > 0 && <div className="flex justify-between text-blue-600 font-bold"><span>Service Charge (+):</span><span>₹{selectedInvoice.serviceCharge.toLocaleString()}</span></div>}
                    <div className="flex justify-between"><span>CGST:</span><span>₹{Math.round(selectedInvoice.gstAmount / 2).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>SGST:</span><span>₹{Math.round(selectedInvoice.gstAmount / 2).toLocaleString()}</span></div>
                    {selectedInvoice.roundOff !== 0 && <div className="flex justify-between text-text-secondary"><span>Round Off:</span><span>₹{selectedInvoice.roundOff}</span></div>}
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-900 border-t border-gray-100 pt-1">
                      <span>Grand Total:</span><span>₹{selectedInvoice.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer terms */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-[8px] text-text-secondary">
                  <div>
                    <h5 className="font-bold text-gray-600 uppercase">Terms & Conditions:</h5>
                    <p className="mt-0.5 leading-tight">Respective manufacturer warranty terms apply.<br />Services finalized are non-refundable.</p>
                  </div>
                  <div className="flex flex-col justify-end items-end h-full">
                    <div className="w-24 border-b border-gray-300 mb-0.5"></div>
                    <span className="font-bold text-gray-600">Authorized Signature</span>
                  </div>
                </div>
              </div>

              {/* Status Tracking controller */}
              <div className="p-3 border border-border-card rounded-xl bg-white/[0.02] space-y-2">
                <label className="text-[10px] font-bold text-text-secondary block uppercase tracking-wide">Adjust Settlement & Payment Status</label>
                <div className="flex gap-2 text-xs font-bold">
                  {['Paid', 'Pending', 'Overdue'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdatePaymentStatus(selectedInvoice.id, st as any)}
                      className={`flex-1 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        selectedInvoice.status === st 
                          ? st === 'Paid' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : st === 'Pending' ? 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'
                          : 'border-border-card bg-transparent text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {st === 'Paid' ? <CheckCircle size={12} /> : st === 'Pending' ? <Clock size={12} /> : <AlertTriangle size={12} />}
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 text-xs font-semibold pt-2 border-t border-border-card">
                <button 
                  onClick={handlePrintSelected}
                  className="w-1/4 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} /> Print
                </button>
                <button 
                  onClick={async () => await handleDownloadPDF(selectedInvoice)}
                  className="w-1/4 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download size={14} /> PDF
                </button>
                <button 
                  onClick={() => {
                    handleOpenEdit(selectedInvoice);
                    setPreviewOpen(false);
                  }}
                  className="w-1/4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-400 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button 
                  onClick={() => setPreviewOpen(false)}
                  className="w-1/4 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT INVOICE MODAL */}
      <AnimatePresence>
        {editOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel max-w-xl w-full relative p-6 border-border-card space-y-4 max-h-[90vh] overflow-y-auto bg-bg-app text-xs"
            >
              <button 
                onClick={() => setEditOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-border-card">
                <div className="p-2 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl text-text-primary">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Edit Invoice: {selectedInvoice.invoiceNumber}</h3>
                  <p className="text-[10px] text-text-muted font-mono">Modify customer details, prices, or status</p>
                </div>
              </div>

              <form onSubmit={handleSaveEditedInvoice} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9px] font-bold text-text-secondary block mb-1">CUSTOMER NAME *</label>
                    <input 
                      type="text" 
                      required
                      value={editCustomerName}
                      onChange={e => setEditCustomerName(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-text-secondary block mb-1">MOBILE PHONE</label>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-[9px] font-bold text-text-secondary block mb-1">VEHICLE PLATE *</label>
                    <input 
                      type="text" 
                      required
                      value={editVehiclePlate}
                      onChange={e => setEditVehiclePlate(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-text-secondary block mb-1">PAYMENT STATUS *</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as any)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Failed">Failed</option>
                      <option value="Partially Paid">Partially Paid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-text-secondary block mb-1">SETTLEMENT METHOD *</label>
                    <select
                      value={editPaymentMethod}
                      onChange={e => setEditPaymentMethod(e.target.value as any)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Razorpay">Razorpay</option>
                    </select>
                  </div>
                </div>

                {/* Edit line items summary section */}
                <div className="border-t border-border-card pt-3.5 space-y-2">
                  <span className="text-[9px] font-bold text-text-secondary block uppercase tracking-wide">Adjust Quantities</span>
                  <div className="max-h-36 overflow-y-auto border border-border-card rounded-xl p-2.5 space-y-2">
                    {editItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-text-primary">
                        <span className="truncate max-w-[180px]">{item.name} <strong className="text-text-muted text-[10px] font-mono">({item.price})</strong></span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-text-muted">Qty:</span>
                          <input 
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => handleEditItemQty(idx, Number(e.target.value))}
                            className="w-12 bg-bg-card border border-border-card rounded px-1 text-center"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount and service charge edit inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-border-card pt-3.5">
                  <div>
                    <label className="text-[9px] font-bold text-text-secondary block mb-1">REVISE DISCOUNT (₹)</label>
                    <input 
                      type="number"
                      value={editDiscount || ''}
                      onChange={e => setEditDiscount(Number(e.target.value))}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-text-secondary block mb-1">REVISE SERVICE CHARGE (₹)</label>
                    <input 
                      type="number"
                      value={editServiceCharge || ''}
                      onChange={e => setEditServiceCharge(Number(e.target.value))}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 text-xs font-semibold pt-4 border-t border-border-card">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-text-primary font-bold rounded-xl active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collect Balance Modal */}
      <AnimatePresence>
        {collectOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-5 sm:p-6 w-full max-w-sm rounded-2xl border-[var(--color-primary)]/30 shadow-2xl relative"
            >
              <button 
                onClick={() => setCollectOpen(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h2 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2 uppercase tracking-wide">
                <DollarSign size={16} className="text-emerald-400" />
                Collect Payment
              </h2>
              <div className="text-[10px] text-text-secondary mb-4 font-mono pb-3 border-b border-border-card">
                Invoice: <span className="text-[var(--color-primary)] font-bold">{selectedInvoice.invoiceNumber}</span><br/>
                Balance Due: <span className="text-red-400 font-bold text-base">₹{(selectedInvoice.balanceAmount || 0).toLocaleString()}</span>
              </div>

              <form onSubmit={handleCollectBalance} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Collection Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedInvoice.balanceAmount || 0}
                    value={collectAmount || ''}
                    onChange={(e) => setCollectAmount(Number(e.target.value))}
                    className="w-full bg-bg-card border border-border-card rounded-lg p-2.5 text-text-primary text-sm font-bold focus:border-[var(--color-primary)] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Payment Method</label>
                  <select
                    value={collectMethod}
                    onChange={(e) => setCollectMethod(e.target.value as any)}
                    className="w-full bg-bg-card border border-border-card rounded-lg p-2.5 text-text-primary text-sm focus:border-[var(--color-primary)] outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Remarks (Optional)</label>
                  <input
                    type="text"
                    value={collectRemarks}
                    onChange={(e) => setCollectRemarks(e.target.value)}
                    placeholder="e.g. Paid via PhonePe"
                    className="w-full bg-bg-card border border-border-card rounded-lg p-2.5 text-text-primary text-sm focus:border-[var(--color-primary)] outline-none"
                  />
                </div>

                <div className="flex gap-2 text-xs font-semibold pt-2">
                  <button
                    type="button"
                    onClick={() => setCollectOpen(false)}
                    className="w-1/3 py-3 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 bg-emerald-500 hover:bg-emerald-600 text-text-primary font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex justify-center items-center gap-2"
                  >
                    <CheckCircle size={14} /> Record Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50 no-print">
          <CheckCircle size={14} className="text-[var(--color-primary)] animate-bounce" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
