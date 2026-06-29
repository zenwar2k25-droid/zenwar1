import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  HardDrive, 
  FileSpreadsheet, 
  X, 
  Key, 
  Lock, 
  Unlock, 
  Trash2, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Mail, 
  MessageSquare,
  Sparkles,
  Database,
  Eye,
  EyeOff,
  Edit,
  Globe,
  CreditCard,
  Shield,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useModal } from '../../context/ModalContext';
import type { Business, BusinessModuleAccess } from '../../data/seedData';
import confetti from 'canvas-confetti';

export const Businesses: React.FC = () => {
  const { 
    businesses, 
    addWorkshop, 
    updateWorkshop,
    forceLogoutSessions, 
    changeSubscriptionPlan, 
    deleteWorkshopPermanently,
    subscriptionPlans,
    saPayments,
    resetWorkshopData,
    toggleWorkshopStatus,
    impersonateTenant,
    getWorkshopPaymentConfig,
    updateWorkshopPaymentConfig,
    verifyWorkshop,
    removeWorkshopVerification
  } = useDatabase();
  const { confirm } = useModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Newly Arrived' | 'Verified' | 'Expired' | 'Suspended'>('All');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Business | null>(null);
  const [workshopToVerify, setWorkshopToVerify] = useState<Business | null>(null);
  const [workshopToUnverify, setWorkshopToUnverify] = useState<Business | null>(null);
  
  // Premium Edit Panel States
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<'info' | 'creds' | 'subscription' | 'permissions' | 'payment' | 'security'>('info');

  const [editName, setEditName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGst, setEditGst] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editLogoType, setEditLogoType] = useState<'emoji' | 'upload'>('emoji');
  const [editLogoFileBase64, setEditLogoFileBase64] = useState('');
  const [editBrandColor, setEditBrandColor] = useState('');
  const [editTheme, setEditTheme] = useState('dark');

  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editForceReset, setEditForceReset] = useState(false);

  const [editPlan, setEditPlan] = useState('starter');
  const [editTrialDays, setEditTrialDays] = useState(14);
  const [editRenewalDate, setEditRenewalDate] = useState('');
  const [editInvoiceLimit, setEditInvoiceLimit] = useState(500);
  const [editStaffLimit, setEditStaffLimit] = useState(5);
  const [editStorageLimit, setEditStorageLimit] = useState(100);

  const [editModuleOverrides, setEditModuleOverrides] = useState<Partial<BusinessModuleAccess>>({});

  const [editUpiEnabled, setEditUpiEnabled] = useState(false);
  const [editUpiId, setEditUpiId] = useState('');
  const [editUpiHolderName, setEditUpiHolderName] = useState('');
  const [editRazorpayEnabled, setEditRazorpayEnabled] = useState(false);
  const [editRazorpayKeyId, setEditRazorpayKeyId] = useState('');
  const [editRazorpaySecret, setEditRazorpaySecret] = useState('');

  const [editStatus, setEditStatus] = useState<Business['status']>('Active');
  const [editLoginAccessDisabled, setEditLoginAccessDisabled] = useState(false);

  // Manage credentials modal states
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [credShop, setCredShop] = useState<Business | null>(null);
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credForceReset, setCredForceReset] = useState(false);
  const [credShowPass, setCredShowPass] = useState(false);
  const [credError, setCredError] = useState('');


  // Toast
  const [toastMsg, setToastMsg] = useState('');
  
  // Onboarding Step state
  const [wizardStep, setWizardStep] = useState(1);
  const [launching, setLaunching] = useState(false);
  const [launchText, setLaunchText] = useState('');

  // 1. Business Info
  const [newShopName, setNewShopName] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGstNumber, setNewGstNumber] = useState('');

  const handleGenerateDomain = () => {
    if (!newShopName) {
      triggerToast('Please enter the Business Name first to generate a domain.');
      return;
    }
    const initials = newShopName
      .split(/\s+/)
      .map(w => w.charAt(0))
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
      
    const cleanInitials = initials.slice(0, 5);
    let suffix = 1;
    let candidate = `${cleanInitials}${String(suffix).padStart(3, '0')}`;
    
    while (businesses.some(w => w.tenantDomain.toUpperCase() === candidate)) {
      suffix += 1;
      candidate = `${cleanInitials}${String(suffix).padStart(3, '0')}`;
    }
    
    setNewTenantDomain(candidate);
    setDomainError('');
    triggerToast(`Auto-generated Domain Code: ${candidate}`);
  };

  const handleDomainChange = (val: string) => {
    const clean = val.toUpperCase().replace(/\s/g, '');
    setNewTenantDomain(clean);
    
    if (clean.length < 4) {
      setDomainError('Domain Code must be at least 4 characters long.');
      return;
    }
    
    if (/[^A-Z0-9]/.test(clean)) {
      setDomainError('Domain Code must contain alphanumeric characters only.');
      return;
    }
    
    const taken = businesses.some(w => w.tenantDomain.toUpperCase() === clean);
    if (taken) {
      setDomainError('This Domain Code is already taken by another business.');
      return;
    }
    
    setDomainError('');
  };
  
  // 2. Login Credentials
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 3. Subscription & Features
  const [newPlan, setNewPlan] = useState<string>('starter');

  // 4. Branding & Theme Setup
  const [newLogo, setNewLogo] = useState('🚗');
  const [logoType, setLogoType] = useState<'emoji' | 'upload'>('emoji');
  const [logoFileBase64, setLogoFileBase64] = useState<string>('');
  const [logoUploadProgress, setLogoUploadProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newColor, setNewColor] = useState('#00f0ff');
  const [newBranches, setNewBranches] = useState(1);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    let file: File | null = null;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if (e.type === 'drop' && 'dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast('Error: Logo image size cannot exceed 1.5 MB.');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      triggerToast('Error: Unsupported file format. Please upload PNG, JPG, or SVG.');
      return;
    }

    setLogoUploadProgress(10);
    const interval = setInterval(() => {
      setLogoUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTimeout(() => {
          const base64 = event.target!.result as string;
          setLogoFileBase64(base64);
          setNewLogo(base64);
          triggerToast('Branding logo uploaded successfully!');
          setLogoUploadProgress(0);
        }, 500);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredWorkshops = useMemo(() => {
    return businesses.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            w.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            w.tenantDomain.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (filterStatus === 'Newly Arrived') matchesFilter = !w.verified && w.status !== 'Expired' && w.status !== 'Suspended';
      else if (filterStatus === 'Verified') matchesFilter = !!w.verified;
      else if (filterStatus === 'Expired') matchesFilter = w.status === 'Expired';
      else if (filterStatus === 'Suspended') matchesFilter = w.status === 'Suspended';
      
      return matchesSearch && matchesFilter;
    });
  }, [businesses, searchQuery, filterStatus]);

  // Username suggester based on owner name and suffix digits
  const handleOwnerNameChange = (val: string) => {
    setNewOwner(val);
    if (val) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      setNewUsername(`${clean}${randomSuffix}`);
    }
  };

  // Password strength checker
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, text: 'No Password', color: 'bg-white/10' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[!@#]/.test(newPassword)) score += 1;

    if (score <= 2) return { score, text: 'Weak Credentials', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Medium Strength', color: 'bg-orange-500' };
    return { score, text: 'Strong Security', color: 'bg-emerald-400' };
  }, [newPassword]);

  // Generate random secure password
  const handleGeneratePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#';
    const all = uppercase + lowercase + numbers + symbols;

    let generated = '';
    generated += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    generated += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    generated += numbers.charAt(Math.floor(Math.random() * numbers.length));
    generated += symbols.charAt(Math.floor(Math.random() * symbols.length));

    for (let i = 0; i < 8; i++) {
      generated += all.charAt(Math.floor(Math.random() * all.length));
    }
    setNewPassword(generated);
    triggerToast('Generated secure random password!');
  };

  const handleCopyCredentials = () => {
    const credText = `Business: ${newShopName}\nUsername: ${newUsername}\nPassword: ${newPassword}\nWorkspace URL: http://localhost:5173/#/login`;
    navigator.clipboard.writeText(credText);
    triggerToast('Credentials copied to clipboard!');
  };

  const handleOpenWizard = () => {
    setWizardStep(1);
    setNewShopName('');
    setNewTenantDomain('');
    setDomainError('');
    setNewOwner('');
    setNewEmail('');
    setNewPhone('');
    setNewGstNumber('27' + Math.random().toString(36).substring(2, 7).toUpperCase() + '1234' + Math.random().toString(36).substring(2, 3).toUpperCase() + '1Z5');
    setNewUsername('');
    setNewPassword('');
    setNewPlan('starter');
    setNewLogo('🚗');
    setLogoType('emoji');
    setLogoFileBase64('');
    setLogoUploadProgress(0);
    setNewColor('#00f0ff');
    setNewBranches(1);
    setWizardOpen(true);
  };

  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName || !newUsername || !newPassword || !newTenantDomain || domainError) {
      triggerToast('Please complete and validate all steps first.');
      return;
    }

    setLaunching(true);
    setLaunchText('Provisioning Isolated Database Schema...');

    setTimeout(() => {
      setLaunchText('Registering Workspace Credentials...');
    }, 850);

    setTimeout(() => {
      setLaunchText('Configuring Default Access Permission Matrix...');
    }, 1500);

    setTimeout(() => {
      addWorkshop({
        name: newShopName,
        tenantDomain: newTenantDomain,
        ownerName: newOwner,
        email: newEmail,
        phone: newPhone,
        planId: newPlan,
        status: 'Active',
        branches: newBranches,
        logoUrl: newLogo,
        brandColor: newColor,
        username: newUsername,
        password: newPassword,
        gstNumber: newGstNumber,
        loginAccessDisabled: false
      });

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setLaunching(false);
      setWizardOpen(false);
      triggerToast(`Workspace "${newShopName}" launched successfully!`);
    }, 2200);
  };



  const credPasswordStrength = useMemo(() => {
    if (!credPassword) return { score: 0, text: 'No Password', color: 'bg-white/10' };
    let score = 0;
    if (credPassword.length >= 6) score += 1;
    if (credPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(credPassword)) score += 1;
    if (/[0-9]/.test(credPassword)) score += 1;
    if (/[!@#]/.test(credPassword)) score += 1;

    if (score <= 2) return { score, text: 'Weak Credentials', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Medium Strength', color: 'bg-orange-500' };
    return { score, text: 'Strong Security', color: 'bg-emerald-400' };
  }, [credPassword]);

  const handleGenerateCredPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#';
    const all = uppercase + lowercase + numbers + symbols;

    let generated = '';
    generated += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    generated += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    generated += numbers.charAt(Math.floor(Math.random() * numbers.length));
    generated += symbols.charAt(Math.floor(Math.random() * symbols.length));

    for (let i = 0; i < 8; i++) {
      generated += all.charAt(Math.floor(Math.random() * all.length));
    }
    setCredPassword(generated);
    triggerToast('Generated secure random password!');
  };

  const handleCopyCreds = () => {
    if (!credShop) return;
    const credText = `Business: ${credShop.name}\nUsername: ${credUsername}\nPassword: ${credPassword}\nWorkspace URL: http://localhost:5173/#/login`;
    navigator.clipboard.writeText(credText);
    triggerToast('Credentials copied to clipboard!');
  };

  const handleSendCreds = (method: 'email' | 'whatsapp') => {
    if (!credShop) return;
    triggerToast(`Sent credentials notification for ${credShop.name} via ${method === 'email' ? 'Email' : 'WhatsApp'}!`);
  };

  // handleOpenCredsModal retained for future standalone creds modal usage
  const _handleOpenCredsModal = (shop: Business) => {
    setCredShop(shop);
    setCredUsername(shop.username || '');
    setCredPassword(shop.password || '');
    setCredForceReset(shop.forcePasswordReset || false);
    setCredShowPass(false);
    setCredError('');
    setCredModalOpen(true);
  };
  void _handleOpenCredsModal; // suppress unused warning

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credShop) return;
    setCredError('');

    if (!credUsername || !credPassword) {
      setCredError('Username and password are required.');
      return;
    }

    // Duplicate username check
    const duplicate = businesses.some(w => w.id !== credShop.id && w.username?.toLowerCase() === credUsername.toLowerCase());
    if (duplicate) {
      setCredError('This username is already taken by another business.');
      return;
    }

    updateWorkshop(credShop.id, {
      username: credUsername,
      password: credPassword,
      forcePasswordReset: credForceReset,
      passwordUpdatedAt: new Date().toISOString()
    });

    setCredModalOpen(false);
    triggerToast(`Successfully saved secure credentials for ${credShop.name}!`);
  };

  const handleOpenEditPanel = (shop: Business) => {
    setSelectedWorkshop(shop);
    setActiveEditTab('info');

    setEditName(shop.name || '');
    setEditOwner(shop.ownerName || '');
    setEditPhone(shop.phone || '');
    setEditEmail(shop.email || '');
    setEditAddress(shop.address || '');
    setEditGst(shop.gstNumber || '');
    setEditDomain(shop.tenantDomain || '');
    setEditLogo(shop.logoUrl || '🚗');
    if (shop.logoUrl && shop.logoUrl.startsWith('data:image/')) {
      setEditLogoType('upload');
      setEditLogoFileBase64(shop.logoUrl);
    } else {
      setEditLogoType('emoji');
      setEditLogoFileBase64('');
    }
    setEditBrandColor(shop.brandColor || '#00f0ff');
    setEditTheme(shop.theme || 'dark');

    setEditUsername(shop.username || '');
    setEditPassword(shop.password || '');
    setEditForceReset(shop.forcePasswordReset || false);

    setEditPlan(shop.planId || 'starter');
    setEditTrialDays(shop.trialDays ?? 14);
    setEditRenewalDate(shop.renewalDate ? shop.renewalDate.split('T')[0] : '');
    setEditInvoiceLimit((shop.usage as any)?.invoicesLimit ?? 500);
    setEditStaffLimit(shop.staffLimit ?? 5);
    setEditStorageLimit((shop.usage as any)?.storageLimit ?? 100);

    setEditModuleOverrides(shop.moduleOverrides || {});

    // Load payment config
    const payConfig = getWorkshopPaymentConfig(shop.tenantDomain);
    setEditUpiEnabled(payConfig.upiEnabled);
    setEditUpiId(payConfig.upiId);
    setEditUpiHolderName(payConfig.upiHolderName || '');
    setEditRazorpayEnabled(payConfig.razorpayEnabled);
    setEditRazorpayKeyId(payConfig.razorpayKeyId || '');
    setEditRazorpaySecret(payConfig.razorpaySecret || '');

    setEditStatus(shop.status);
    setEditLoginAccessDisabled(shop.loginAccessDisabled || false);

    setEditPanelOpen(true);
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshop) return;

    // Check duplicate username if changed
    if (editUsername !== selectedWorkshop.username) {
      const duplicate = businesses.some(w => w.id !== selectedWorkshop.id && w.username?.toLowerCase() === editUsername.toLowerCase());
      if (duplicate) {
        triggerToast('Error: This username is already taken by another business.');
        return;
      }
    }

    // Check duplicate domain if changed
    if (editDomain !== selectedWorkshop.tenantDomain) {
      const duplicate = businesses.some(w => w.id !== selectedWorkshop.id && w.tenantDomain?.toLowerCase() === editDomain.toLowerCase());
      if (duplicate) {
        triggerToast('Error: This domain / tenant code is already taken.');
        return;
      }
    }

    // Update main business state
    updateWorkshop(selectedWorkshop.id, {
      name: editName,
      ownerName: editOwner,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      gstNumber: editGst,
      tenantDomain: editDomain,
      logoUrl: editLogo,
      brandColor: editBrandColor,
      theme: editTheme,
      username: editUsername,
      password: editPassword,
      forcePasswordReset: editForceReset,
      planId: editPlan,
      trialDays: editTrialDays,
      renewalDate: editRenewalDate ? new Date(editRenewalDate).toISOString() : undefined,
      staffLimit: editStaffLimit,
      status: editStatus,
      loginAccessDisabled: editLoginAccessDisabled,
      moduleOverrides: editModuleOverrides,
      usage: {
        ...selectedWorkshop?.usage,
        invoicesLimit: editInvoiceLimit,
        storageLimit: editStorageLimit
      }
    });

    // Save payment config
    updateWorkshopPaymentConfig(editDomain, {
      upiEnabled: editUpiEnabled,
      upiId: editUpiId,
      upiHolderName: editUpiHolderName,
      razorpayEnabled: editRazorpayEnabled,
      razorpayKeyId: editRazorpayKeyId,
      razorpaySecret: editRazorpaySecret
    });

    triggerToast(`Business "${editName}" updated successfully!`);
    setEditPanelOpen(false);
  };

  const handleGenerateEditPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#';
    const all = uppercase + lowercase + numbers + symbols;

    let generated = '';
    generated += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    generated += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    generated += numbers.charAt(Math.floor(Math.random() * numbers.length));
    generated += symbols.charAt(Math.floor(Math.random() * symbols.length));

    for (let i = 0; i < 8; i++) {
      generated += all.charAt(Math.floor(Math.random() * all.length));
    }
    setEditPassword(generated);
    triggerToast('Generated secure random password for edit!');
  };

  const handleEditLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast('Error: Logo image size cannot exceed 1.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        setEditLogoFileBase64(base64);
        setEditLogo(base64);
        triggerToast('Branding logo uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };


  const triggerShareWhatsApp = () => {
    triggerToast('WhatsApp API dispatch: Sent login instructions message.');
  };

  const triggerShareEmail = () => {
    triggerToast('SMTP Server: Auth instructions dispatched to admin mailbox.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <Database className="text-[var(--color-primary)]" size={28} /> Businesses Control Center
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
            Onboard new tenant accounts, provision databases, and monitor billing limits
          </p>
        </div>

        <button 
          onClick={handleOpenWizard}
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus size={16} /> Provision New Business
        </button>
      </div>

      {/* Roster Search bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by business name, contact owner, email..." 
          className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)] text-text-primary font-medium"
        />
      </div>

      {/* Roster list Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkshops.map((shop) => {
          const isSuspended = shop.status === 'Suspended';
          const isBlocked = shop.loginAccessDisabled;

          let daysLeft = 0;
          let daysLeftColor = 'text-emerald-400';
          let daysLeftLabel = 'Active';
          if (shop.renewalDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const renewal = new Date(shop.renewalDate);
            renewal.setHours(0, 0, 0, 0);
            daysLeft = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 0 || shop.status === 'Expired') {
              daysLeftColor = 'text-red-600 font-bold';
              daysLeftLabel = 'Expired';
            } else if (daysLeft <= 3) {
              daysLeftColor = 'text-red-400 font-bold';
              daysLeftLabel = 'Expiring Soon';
            } else if (daysLeft <= 7) {
              daysLeftColor = 'text-orange-400 font-bold';
              daysLeftLabel = 'Warning';
            }
          }

          return (
            <div 
              key={shop.id}
              className={`glass-panel p-5 relative border flex flex-col justify-between min-h-[360px] transition-all group ${
                isSuspended 
                  ? 'border-red-500/20 bg-red-950/5' 
                  : isBlocked
                  ? 'border-orange-500/20 bg-orange-950/5'
                  : 'border-border-card hover:border-[var(--color-primary)]/40 hover:shadow-glow'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner overflow-hidden"
                      style={{ backgroundColor: `${shop.brandColor}15`, border: `1px solid ${shop.brandColor}30` }}
                    >
                      {shop.logoUrl && shop.logoUrl.startsWith('data:image/') ? (
                        <img src={shop.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                      ) : (
                        shop.logoUrl || '⚙️'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-text-primary truncate max-w-44">{shop.name}</h3>
                      <span className="text-[10px] text-text-muted font-mono block">Workspace ID: {shop.id}</span>
                      <span className="text-[10px] text-cyan-400 font-mono block font-bold">Domain: {shop.tenantDomain}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
                      shop.status === 'Active' 
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                        : 'border-red-500/20 text-red-400 bg-red-500/5'
                    }`}>
                      {shop.status}
                    </span>
                      {shop.status === 'Active' && !shop.verified && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-orange-500/30 text-orange-400 bg-orange-500/10 uppercase flex items-center gap-1">
                        <ShieldAlert size={10} /> Pending Verification
                      </span>
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="mt-4 pt-3.5 border-t border-border-card space-y-2 text-xs text-[var(--text-secondary)] font-semibold">
                  <div className="flex justify-between">
                    <span>Tenant Domain:</span>
                    <span className="text-cyan-400 font-mono font-bold">{shop.tenantDomain}</span>
                  </div>
                  {shop.renewalDate && (
                    <>
                      <div className="flex justify-between">
                        <span>Expiry Date:</span>
                        <span className="text-text-primary font-mono">{new Date(shop.renewalDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days Remaining:</span>
                        <span className={`${daysLeftColor} font-mono`}>{daysLeft > 0 ? `${daysLeft} Days` : 'Expired'} ({daysLeftLabel})</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Admin User:</span>
                    <span className="text-text-primary font-mono">{shop.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Updated:</span>
                    <span className="text-text-primary font-mono">
                      {shop.passwordUpdatedAt ? new Date(shop.passwordUpdatedAt).toLocaleDateString() : 'Initial'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Active:</span>
                    <span className="text-text-primary truncate max-w-36 font-mono">
                      {shop.loginHistory && shop.loginHistory.length > 0 
                        ? new Date(shop.loginHistory[0].timestamp).toLocaleDateString() 
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Login Status:</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      shop.loginAccessDisabled 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {shop.loginAccessDisabled ? 'Disabled' : 'Enabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Person:</span>
                    <span className="text-text-primary truncate max-w-36">{shop.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GSTIN Code:</span>
                    <span className="text-text-primary font-mono">{shop.gstNumber || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Subscription Plan:</span>
                    <select
                      value={shop.planId}
                      onChange={e => changeSubscriptionPlan(shop.id, e.target.value as any)}
                      className="bg-[#0b0d16] border border-border-card rounded px-2 py-0.5 text-[10px] font-bold text-cyan-400 focus:outline-none cursor-pointer"
                    >
                      <option value="starter">Starter Plan</option>
                      <option value="growth">Growth Plan</option>
                      <option value="enterprise">Enterprise Plan</option>
                    </select>
                  </div>
                </div>

                {/* Usage limit visual progress bars */}
                <div className="mt-4 pt-3 border-t border-border-card space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-text-muted">
                      <span className="flex items-center gap-1"><HardDrive size={10} /> Storage Space:</span>
                      <span>{shop.usage?.storageMb || 0}MB / {(shop.usage as any)?.storageLimit || 0}MB</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400"
                        style={{ width: `${Math.min(100, ((shop.usage?.storageMb || 0) / ((shop.usage as any)?.storageLimit || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-text-muted">
                      <span className="flex items-center gap-1"><FileSpreadsheet size={10} /> POS Invoices:</span>
                      <span>{shop.usage?.invoicesCount || 0} / {(shop.usage as any)?.invoicesLimit || 0} limit</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-400"
                        style={{ width: `${Math.min(100, ((shop.usage?.invoicesCount || 0) / ((shop.usage as any)?.invoicesLimit || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-border-card space-y-2">
                <button
                  onClick={() => {
                    impersonateTenant(shop.tenantDomain, shop.id);
                    triggerToast(`Impersonating ${shop.name} in APEXAUTO scope.`);
                    window.location.hash = '/dashboard'; // Redirect to dashboard
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/25 hover:to-blue-600/25 text-cyan-400 hover:text-text-primary border border-cyan-500/30 hover:border-cyan-400 font-bold text-[10px] uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={11} /> Switch To Tenant
                </button>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEditPanel(shop)}
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)]/10 to-blue-600/10 hover:from-[var(--color-primary)]/20 hover:to-blue-600/20 text-[var(--color-primary)] hover:text-text-primary border border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/50 font-bold text-[10px] uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Edit size={11} /> Edit Business
                  </button>
                  <button 
                    onClick={() => { setSelectedWorkshop(shop); setDetailsOpen(true); }}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-hover-bg text-text-primary font-bold text-[10px] uppercase transition-all cursor-pointer text-center flex items-center justify-center"
                    title="Overview & Security Logs"
                  >
                    Logs
                  </button>
                </div>

                                <div className="flex gap-2">
                  {shop.status === 'Active' && !shop.verified && (
                    <button 
                      onClick={() => setWorkshopToVerify(shop)}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 font-bold text-[9px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                    >
                      <ShieldCheck size={11} /> Verify Business
                    </button>
                  )}
                  {shop.status === 'Active' && shop.verified && (
                    <button 
                      onClick={() => setWorkshopToUnverify(shop)}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-hover-bg text-text-secondary hover:text-orange-400 border border-transparent hover:border-orange-500/30 font-bold text-[9px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ShieldAlert size={11} /> Remove Verification
                    </button>
                  )}
                </div>

<div className="flex gap-2">
                  <button 
                    onClick={() => {
                      toggleWorkshopStatus(shop.id);
                      triggerToast(shop.status === 'Suspended' ? 'Business enabled!' : 'Business suspended!');
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-bold text-[9px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isSuspended 
                        ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10' 
                        : 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    {isSuspended ? <Unlock size={11} /> : <Lock size={11} />}
                    {isSuspended ? 'Activate' : 'Suspend'}
                  </button>

                  <button 
                    onClick={async () => {
                      if(await confirm(`Are you absolutely sure you want to permanently delete "${shop.name}" and purge all its customer and invoice data?`)) {
                        deleteWorkshopPermanently(shop.id);
                        triggerToast(`Purged business workspace.`);
                      }
                    }}
                    className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-text-primary rounded-lg transition-all cursor-pointer"
                    title="Permanently Delete Workspace"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6-STEP ONBOARDING WIZARD */}
      <AnimatePresence>
        {wizardOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 border-border-card max-w-lg w-full relative space-y-5 bg-bg-app"
            >
              {/* Close Button */}
              {!launching && (
                <button 
                  onClick={() => setWizardOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}

              {/* Launching Loading Overlay */}
              {launching && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 space-y-4 z-40 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider animate-pulse">{launchText}</h3>
                  <p className="text-[10px] text-text-muted font-mono">Do not close this modal. Provisioning virtual clusters...</p>
                </div>
              )}

              <div>
                <span className="text-[9px] font-mono text-[var(--color-primary)] font-bold tracking-widest uppercase">STEP {wizardStep} OF 6</span>
                <h3 className="text-lg font-bold text-text-primary font-display mt-0.5">SaaS Workspace Provisioning</h3>
                <p className="text-xs text-[var(--text-secondary)]">Create isolated business environment with dedicated admin logins</p>
              </div>

              {/* Progress dots bar */}
              <div className="flex gap-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`h-full flex-1 transition-colors ${wizardStep >= i ? 'bg-[var(--color-primary)]' : 'bg-transparent'}`} />
                ))}
              </div>

              <form onSubmit={handleCreateWorkshop} className="space-y-4">
                
                {/* STEP 1: BUSINESS INFO */}
                {wizardStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-200 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary block mb-1">BUSINESS NAME *</label>
                      <input 
                        type="text" 
                        required
                        value={newShopName}
                        onChange={e => setNewShopName(e.target.value)}
                        placeholder="e.g. Apex Performance Garage"
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-text-secondary">DOMAIN / TENANT CODE *</label>
                        <button 
                          type="button"
                          onClick={handleGenerateDomain}
                          className="text-[9px] text-[var(--color-primary)] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <Sparkles size={11} /> Auto Generate
                        </button>
                      </div>
                      <input 
                        type="text" 
                        required
                        value={newTenantDomain}
                        onChange={e => handleDomainChange(e.target.value)}
                        placeholder="e.g. APEXAUTO"
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono uppercase"
                      />
                      {domainError ? (
                        <span className="text-[10px] text-red-400 mt-1 block font-semibold">{domainError}</span>
                      ) : newTenantDomain && !domainError ? (
                        <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">✓ Domain Code is available and valid</span>
                      ) : null}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary block mb-1">OWNER CONTACT NAME *</label>
                      <input 
                        type="text" 
                        required
                        value={newOwner}
                        onChange={e => handleOwnerNameChange(e.target.value)}
                        placeholder="e.g. Steve Austin"
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary block mb-1">EMAIL ADDRESS *</label>
                        <input 
                          type="email" 
                          required
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                          placeholder="owner@apexauto.com"
                          className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary block mb-1">MOBILE NUMBER *</label>
                        <input 
                          type="tel" 
                          required
                          value={newPhone}
                          onChange={e => setNewPhone(e.target.value)}
                          placeholder="+1 (555) 762-4369"
                          className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary block mb-1">GSTIN CODE *</label>
                      <input 
                        type="text" 
                        required
                        value={newGstNumber}
                        onChange={e => setNewGstNumber(e.target.value.toUpperCase())}
                        placeholder="27AAACG1234F1Z5"
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono uppercase"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: CREDENTIALS CREATION */}
                {wizardStep === 2 && (
                  <div className="space-y-4.5 animate-in fade-in duration-200 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary block mb-1">BUSINESS ADMIN USERNAME *</label>
                      <input 
                        type="text" 
                        required
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                        placeholder="e.g. apexadmin"
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                      />
                      <span className="text-[9px] text-text-muted font-mono mt-1 block">Auto-suggested from Owner Name credentials</span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-text-secondary">ADMIN ACCOUNT PASSWORD *</label>
                        <button 
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-[9px] text-[var(--color-primary)] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles size={11} /> Generate Secure Pass
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-16 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-[9px] font-bold font-mono cursor-pointer"
                        >
                          {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>

                      {/* Password strength visual bar */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-text-muted">
                          <span>Security Check:</span>
                          <span className={passwordStrength.score >= 4 ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}>{passwordStrength.text}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border-card flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        disabled={!newUsername || !newPassword}
                        className="flex-1 py-2 border border-border-card hover:border-cyan-500/20 text-text-primary hover:text-cyan-400 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <Copy size={12} /> Copy
                      </button>
                      <button
                        type="button"
                        onClick={triggerShareWhatsApp}
                        disabled={!newUsername || !newPassword}
                        className="flex-1 py-2 border border-border-card hover:border-emerald-500/20 text-text-primary hover:text-emerald-400 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <MessageSquare size={12} /> WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={triggerShareEmail}
                        disabled={!newUsername || !newPassword}
                        className="flex-1 py-2 border border-border-card hover:border-purple-500/20 text-text-primary hover:text-purple-400 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <Mail size={12} /> Email
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: SUBSCRIPTION & FEATURES */}
                {wizardStep === 3 && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">SELECT SUBSCRIPTION LICENSE TIER</label>
                    <div className="space-y-2.5">
                      {subscriptionPlans.map(plan => (
                        <div
                          key={plan.id}
                          onClick={() => setNewPlan(plan.id)}
                          className={`p-3.5 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                            newPlan === plan.id 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]/10 shadow-glow' 
                              : 'border-border-card bg-white/[0.01] hover:border-border-card'
                          }`}
                        >
                          <div>
                            <h4 className="font-bold text-xs text-text-primary">{plan.name}</h4>
                            <span className="text-[10px] text-text-muted font-mono block mt-0.5">
                              Limits: {plan.maxInvoices.toLocaleString()} invoices • {plan.maxUsers} Users • {plan.maxStorageMb >= 1024 ? `${plan.maxStorageMb/1024}GB` : `${plan.maxStorageMb}MB`} storage
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[var(--color-primary)]">₹{plan.priceMonthly.toLocaleString()}/mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: ACCESS PERMISSIONS MATRIX PREVIEW */}
                {wizardStep === 4 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <label className="text-[10px] font-bold text-text-secondary block">DEFAULT ACCESS CONTROLS PROVISIONING</label>
                    <p className="text-[11px] text-text-muted leading-normal">
                      The portal will automatically construct default tenant roles (Mechanic, Accountant, Service Advisor) with predefined access control boundaries.
                    </p>

                    <div className="p-4 rounded-xl border border-border-card bg-white/[0.01] space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-text-primary">⚙️ Business Admin</span>
                        <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">FULL CONTROLS</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-text-primary">💼 Manager</span>
                        <span className="text-[9px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">NO DELETE ACTIONS</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-text-primary">🔧 Mechanic</span>
                        <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">CHECKLISTS ONLY</span>
                      </div>
                    </div>
                    
                    <span className="text-[9px] text-text-muted font-mono mt-1.5 block text-center">Customize default access settings anytime in the RBAC matrix page.</span>
                  </div>
                )}

                {/* STEP 5: BRANDING & THEME SETUP */}
                {wizardStep === 5 && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary block mb-2">BUSINESS LOGO FORMAT</label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-border-card rounded-xl mb-3">
                        <button
                          type="button"
                          onClick={() => { setLogoType('emoji'); setNewLogo('🚗'); }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${logoType === 'emoji' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                          Emoji Shortcut
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLogoType('upload'); setNewLogo(logoFileBase64 || '⚡'); }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${logoType === 'upload' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                          Custom Upload (PNG/JPG/SVG)
                        </button>
                      </div>

                      {logoType === 'emoji' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-muted block mb-1">SELECT EMOJI SHORTCUT</label>
                          <div className="flex gap-2.5">
                            {['🚗', '🏍️', '🔧', '⚡', '🔌', '🔥'].map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => setNewLogo(emoji)}
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg active:scale-95 transition-all cursor-pointer ${
                                  newLogo === emoji 
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]/20 shadow-glow' 
                                    : 'border-border-card bg-white/5 hover:bg-hover-bg'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text-muted block mb-1">UPLOAD LOGO IMAGE (MAX 1.5MB)</label>
                          
                          {logoFileBase64 ? (
                            <div className="flex items-center gap-4 p-3 rounded-xl border border-border-card bg-white/[0.02]">
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-border-card flex items-center justify-center overflow-hidden shrink-0">
                                <img src={logoFileBase64} alt="Upload Preview" className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] text-text-secondary block font-mono truncate">{newTenantDomain || 'TENANT'}/workshopAssets/logo/logo.png</span>
                                <button
                                  type="button"
                                  onClick={() => { setLogoFileBase64(''); setNewLogo('⚡'); }}
                                  className="text-[9px] text-red-400 hover:underline font-bold mt-1 cursor-pointer"
                                >
                                  Remove Logo
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                              onDragLeave={() => setIsDragOver(false)}
                              onDrop={handleLogoFileChange}
                              className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[100px] ${
                                isDragOver ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]/10' : 'border-white/15 bg-white/[0.01] hover:border-white/30'
                              }`}
                              onClick={() => document.getElementById('logo-file-input')?.click()}
                            >
                              <input 
                                type="file"
                                id="logo-file-input"
                                className="hidden"
                                accept=".png,.jpg,.jpeg,.svg"
                                onChange={handleLogoFileChange}
                              />
                              {logoUploadProgress > 0 ? (
                                <div className="space-y-2 w-full max-w-[150px]">
                                  <span className="text-[10px] text-text-muted font-mono block">Reading File... {logoUploadProgress}%</span>
                                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--color-primary)]" style={{ width: `${logoUploadProgress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-xl mb-1">📁</span>
                                  <span className="text-[10px] text-text-secondary block">Drag & Drop Logo or <span className="text-[var(--color-primary)] underline">Browse</span></span>
                                  <span className="text-[8px] text-gray-600 block mt-0.5 font-mono">PNG, JPG, SVG up to 1.5MB</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-secondary block mb-2.5">WORKSPACE CSS ACCENT GLOW</label>
                      <div className="flex gap-3">
                        {['#00f0ff', '#ff5e00', '#10b981', '#8b5cf6', '#ec4899'].map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewColor(color)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                              newColor === color ? 'border-white scale-115 shadow-lg' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-text-secondary block mb-1.5">INITIAL REGISTERED BRANCHES</label>
                      <select 
                        value={newBranches}
                        onChange={e => setNewBranches(Number(e.target.value))}
                        className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                      >
                        <option value={1}>1 Branch (Single Bay / Local Shop)</option>
                        <option value={2}>2 Branches (Regional expansion)</option>
                        <option value={3}>3 Branches (Franchise network)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 6: FINAL REVIEW & LAUNCH */}
                {wizardStep === 6 && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                    <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/5 space-y-3.5">
                      <h4 className="font-extrabold text-sm text-cyan-400 flex items-center gap-1.5">
                        <Sparkles size={16} /> Final Launch Overview
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                        <div>
                          <span className="text-text-muted block">BUSINESS</span>
                          <strong className="text-text-primary">{newShopName}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">DOMAIN CODE</span>
                          <strong className="text-cyan-400 font-mono">{newTenantDomain}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">OWNER</span>
                          <strong className="text-text-primary">{newOwner}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">ADMIN USERNAME</span>
                          <strong className="text-text-primary font-mono">{newUsername}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">GST NUMBER</span>
                          <strong className="text-text-primary font-mono">{newGstNumber}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">SELECTED PLAN</span>
                          <strong className="text-[var(--color-primary)] uppercase">{newPlan}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">BRANCHES</span>
                          <strong className="text-text-primary">{newBranches} locations</strong>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-muted leading-normal text-center">
                      Confirming launch will immediately boot virtual tenant databases and construct initial settings states.
                    </p>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex gap-2.5 pt-4 border-t border-border-card text-xs font-semibold">
                  {wizardStep > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {wizardStep < 6 ? (
                    <button 
                      type="button" 
                      onClick={() => {
                        if (wizardStep === 1 && (!newTenantDomain || domainError)) {
                          triggerToast('Please provide a valid, unique Domain Code.');
                          return;
                        }
                        setWizardStep(prev => prev + 1);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Continue Step
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-orange-600 text-text-primary font-bold transition-all shadow-lg cursor-pointer"
                    >
                      Initialize Business
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* MANAGE CREDENTIALS MODAL */}
      <AnimatePresence>
        {credModalOpen && credShop && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 border-border-card max-w-md w-full relative space-y-4 shadow-2xl shadow-cyan-500/5"
            >
              <button 
                onClick={() => setCredModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-1.5">
                  <Key className="text-[var(--color-primary)]" size={16} /> Manage Credentials
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">
                  Configure login username and password credentials for {credShop.name}
                </p>
              </div>

              {credError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold">
                  ⚠️ {credError}
                </div>
              )}

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">ADMIN USERNAME *</label>
                  <input 
                    type="text"
                    required
                    value={credUsername}
                    onChange={e => setCredUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                </div>

                {/* Password Input with eye toggle & generate */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-text-secondary block">SECURITY PASSWORD *</label>
                    <button 
                      type="button"
                      onClick={handleGenerateCredPassword}
                      className="text-[9px] text-[var(--color-primary)] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Sparkles size={10} /> Generate Secure
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={credShowPass ? 'text' : 'password'}
                      required
                      value={credPassword}
                      onChange={e => setCredPassword(e.target.value)}
                      placeholder="Enter credentials password"
                      className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setCredShowPass(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {credShowPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {credPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-text-muted">Strength:</span>
                        <span className={`font-bold ${
                          credPasswordStrength.score <= 2 ? 'text-red-400' : credPasswordStrength.score <= 4 ? 'text-orange-400' : 'text-emerald-400'
                        }`}>{credPasswordStrength.text}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 rounded-l transition-all duration-300 ${
                          credPasswordStrength.score >= 1 ? credPasswordStrength.color : 'bg-transparent'
                        }`} />
                        <div className={`h-full flex-1 transition-all duration-300 ${
                          credPasswordStrength.score >= 3 ? credPasswordStrength.color : 'bg-transparent'
                        }`} />
                        <div className={`h-full flex-1 rounded-r transition-all duration-300 ${
                          credPasswordStrength.score >= 5 ? credPasswordStrength.color : 'bg-transparent'
                        }`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Force Reset Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none py-1 group">
                  <input 
                    type="checkbox"
                    checked={credForceReset}
                    onChange={e => setCredForceReset(e.target.checked)}
                    className="rounded border-border-card bg-bg-card text-[var(--color-primary)] focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer h-3.5 w-3.5"
                  />
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-text-secondary block">Force Password Reset on Next Login</span>
                    <span className="text-[9px] text-text-muted block leading-tight">Business user will be prompted to reset their credentials upon signing in.</span>
                  </div>
                </label>

                {/* Share Credentials & Copy */}
                <div className="pt-3 border-t border-border-card space-y-2">
                  <span className="text-[9px] font-bold text-text-muted block uppercase tracking-wider">Share Credentials</span>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                    <button 
                      type="button"
                      onClick={handleCopyCreds}
                      className="py-2 rounded-xl bg-white/5 border border-border-card hover:bg-hover-bg text-text-primary flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Copy size={11} /> Copy
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSendCreds('whatsapp')}
                      className="py-2 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <MessageSquare size={11} /> WhatsApp
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleSendCreds('email')}
                      className="py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Mail size={11} /> Email
                    </button>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex gap-2 text-xs font-semibold pt-2 border-t border-border-card">
                  <button 
                    type="button"
                    onClick={() => setCredModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold cursor-pointer"
                  >
                    Save Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREMIUM MULTI-TAB EDIT PANEL DRAWER */}
      <AnimatePresence>
        {editPanelOpen && selectedWorkshop && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-end text-left">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="glass-panel w-full max-w-2xl h-screen border-y-0 border-r-0 rounded-none p-6 overflow-y-auto space-y-6 flex flex-col justify-between bg-bg-app text-text-primary"
            >
              <div className="space-y-6 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-border-card shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white/5 border border-border-card shrink-0">
                      {editLogo && editLogo.startsWith('data:image/') ? (
                        <img src={editLogo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <span className="text-lg">{editLogo || '⚙️'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-text-primary">Edit Business Settings</h3>
                      <p className="text-[10px] text-text-muted font-mono">Domain: {selectedWorkshop.tenantDomain} • ID: {selectedWorkshop.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditPanelOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1 p-1 bg-white/5 border border-border-card rounded-xl text-xs font-bold overflow-x-auto shrink-0 select-none">
                  {(['info', 'creds', 'subscription', 'permissions', 'payment', 'security'] as const).map(tab => {
                    const label = {
                      info: 'Info',
                      creds: 'Logins',
                      subscription: 'Plan',
                      permissions: 'Access',
                      payment: 'Gateway',
                      security: 'Security'
                    }[tab];
                    
                    const Icon = {
                      info: Globe,
                      creds: Key,
                      subscription: HardDrive,
                      permissions: Shield,
                      payment: CreditCard,
                      security: Lock
                    }[tab];

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveEditTab(tab)}
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          activeEditTab === tab 
                            ? 'bg-[var(--color-primary-glow)]/25 text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20' 
                            : 'text-text-secondary hover:text-text-primary border border-transparent'
                        }`}
                      >
                        <Icon size={12} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Form Area */}
                <div className="flex-1 overflow-y-auto pr-1 py-1 text-xs">
                  <form onSubmit={handleSaveWorkshop} className="space-y-4">
                    {/* TAB A: BUSINESS INFORMATION */}
                    {activeEditTab === 'info' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary block mb-1">BUSINESS NAME</label>
                          <input 
                            type="text" 
                            required
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">OWNER CONTACT NAME</label>
                            <input 
                              type="text" 
                              required
                              value={editOwner}
                              onChange={e => setEditOwner(e.target.value)}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">DOMAIN / TENANT CODE</label>
                            <input 
                              type="text" 
                              required
                              value={editDomain}
                              onChange={e => setEditDomain(e.target.value.toUpperCase().replace(/\s/g, ''))}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono uppercase"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">EMAIL ADDRESS</label>
                            <input 
                              type="email" 
                              required
                              value={editEmail}
                              onChange={e => setEditEmail(e.target.value)}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">MOBILE NUMBER</label>
                            <input 
                              type="tel" 
                              required
                              value={editPhone}
                              onChange={e => setEditPhone(e.target.value)}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-text-secondary block mb-1">ADDRESS</label>
                          <textarea 
                            value={editAddress}
                            onChange={e => setEditAddress(e.target.value)}
                            rows={2}
                            placeholder="Full physical business address"
                            className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">GST NUMBER</label>
                            <input 
                              type="text" 
                              required
                              value={editGst}
                              onChange={e => setEditGst(e.target.value.toUpperCase())}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono uppercase"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">BRAND ACCENT COLOR</label>
                            <div className="flex gap-2 items-center h-[38px]">
                              <input 
                                type="color" 
                                value={editBrandColor}
                                onChange={e => setEditBrandColor(e.target.value)}
                                className="w-10 h-[38px] bg-transparent border-0 rounded cursor-pointer shrink-0"
                              />
                              <input 
                                type="text"
                                value={editBrandColor}
                                onChange={e => setEditBrandColor(e.target.value)}
                                className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-text-primary font-mono text-[11px] focus:outline-none focus:border-[var(--color-primary)]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Branding Logo selector/upload */}
                        <div className="p-4 bg-white/[0.02] border border-border-card rounded-xl space-y-3">
                          <label className="text-[10px] font-bold text-text-secondary block">BRAND LOGO CONFIGURATION</label>
                          <div className="flex gap-2 p-1 bg-white/5 border border-border-card rounded-xl max-w-xs">
                            <button
                              type="button"
                              onClick={() => { setEditLogoType('emoji'); setEditLogo('🚗'); }}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${editLogoType === 'emoji' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)]' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                              Emoji
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditLogoType('upload'); setEditLogo(editLogoFileBase64 || '⚡'); }}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${editLogoType === 'upload' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)]' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                              Upload Image
                            </button>
                          </div>

                          {editLogoType === 'emoji' ? (
                            <div className="flex gap-2">
                              {['🚗', '🏍️', '🔧', '⚡', '🔌', '🔥', '⚙️', '🛠️'].map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setEditLogo(emoji)}
                                  className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base active:scale-95 transition-all cursor-pointer ${
                                    editLogo === emoji 
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]/20 shadow-glow' 
                                      : 'border-border-card bg-white/5 hover:bg-hover-bg'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-white/5 border border-border-card flex items-center justify-center overflow-hidden shrink-0">
                                {editLogoFileBase64 ? (
                                  <img src={editLogoFileBase64} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-text-muted">📁</span>
                                )}
                              </div>
                              <input 
                                type="file"
                                accept=".png,.jpg,.jpeg,.svg"
                                onChange={handleEditLogoFileChange}
                                className="text-[10px] text-text-secondary file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white/10 file:text-text-primary hover:file:bg-white/20 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB B: LOGIN CREDENTIALS */}
                    {activeEditTab === 'creds' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary block mb-1">ADMIN LOGIN USERNAME</label>
                          <input 
                            type="text" 
                            required
                            value={editUsername}
                            onChange={e => setEditUsername(e.target.value)}
                            className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono font-semibold"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-text-secondary block">LOGIN PASSWORD</label>
                            <button 
                              type="button"
                              onClick={handleGenerateEditPassword}
                              className="text-[9px] text-[var(--color-primary)] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <Sparkles size={11} /> Generate Secure
                            </button>
                          </div>
                          <input 
                            type="text" 
                            required
                            value={editPassword}
                            onChange={e => setEditPassword(e.target.value)}
                            className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono font-semibold"
                          />
                        </div>

                        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border-card bg-white/[0.01] cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={editForceReset}
                            onChange={e => setEditForceReset(e.target.checked)}
                            className="rounded border-border-card bg-bg-card text-[var(--color-primary)] focus:ring-0 focus:ring-offset-0 cursor-pointer mt-0.5"
                          />
                          <div>
                            <span className="text-[11px] font-bold text-text-primary block">Force Password Reset on Next Login</span>
                            <span className="text-[9px] text-text-muted block leading-tight">Tenant will be prompted to choose a new password upon their next sign-in.</span>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* TAB C: SUBSCRIPTION DETAILS & LIMITS */}
                    {activeEditTab === 'subscription' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">SUBSCRIPTION PLAN</label>
                            <select 
                              value={editPlan}
                              onChange={e => setEditPlan(e.target.value)}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-bold text-cyan-400 cursor-pointer"
                            >
                              <option value="starter">Starter Plan</option>
                              <option value="growth">Growth Plan</option>
                              <option value="enterprise">Enterprise Plan</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">STATUS</label>
                            <select 
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value as any)}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-bold text-orange-400 cursor-pointer"
                            >
                              <option value="Active">Active</option>
                              <option value="Trial">Trial Mode</option>
                              <option value="Pending Payment">Pending Payment</option>
                              <option value="Expired">Expired</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">TRIAL DAYS COUNT</label>
                            <input 
                              type="number" 
                              value={editTrialDays}
                              onChange={e => setEditTrialDays(Number(e.target.value))}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-text-secondary block mb-1">RENEWAL / EXPIRY DATE</label>
                            <input 
                              type="date" 
                              value={editRenewalDate}
                              onChange={e => setEditRenewalDate(e.target.value)}
                              className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none font-semibold"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-white/[0.02] border border-border-card rounded-xl space-y-3">
                          <span className="text-[10px] font-bold text-cyan-400 block uppercase tracking-wider">Custom Plan Limits Overrides</span>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[9px] font-bold text-text-muted block mb-1">MAX INVOICES</label>
                              <input 
                                type="number" 
                                value={editInvoiceLimit}
                                onChange={e => setEditInvoiceLimit(Number(e.target.value))}
                                className="w-full bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-text-primary font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-text-muted block mb-1">MAX STAFFS</label>
                              <input 
                                type="number" 
                                value={editStaffLimit}
                                onChange={e => setEditStaffLimit(Number(e.target.value))}
                                className="w-full bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-text-primary font-mono text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-text-muted block mb-1">STORAGE (MB)</label>
                              <input 
                                type="number" 
                                value={editStorageLimit}
                                onChange={e => setEditStorageLimit(Number(e.target.value))}
                                className="w-full bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-text-primary font-mono text-[11px]"
                              />
                            </div>
                          </div>
                          <span className="text-[8px] text-text-muted block leading-tight font-mono">Modifying these limits lets you grant custom quotas to this specific business without changing the global package defaults.</span>
                        </div>
                      </div>
                    )}

                    {/* TAB D: MODULE PERMISSIONS */}
                    {activeEditTab === 'permissions' && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center mb-1 text-left">
                          <div>
                            <span className="text-[10px] font-bold text-text-primary block">TENANT MODULE ACCESS matrix</span>
                            <span className="text-[9px] text-text-muted block">Manage feature toggles. Redefine plan-level defaults.</span>
                          </div>
                        </div>

                        <div className="border border-border-card rounded-xl overflow-hidden bg-white/[0.01]">
                          <div className="grid grid-cols-3 bg-white/5 p-2 font-bold text-[9px] uppercase tracking-wider text-text-secondary border-b border-border-card text-left">
                            <span className="col-span-2 pl-2">Module</span>
                            <span className="text-center">Access Rule</span>
                          </div>
                          
                          <div className="divide-y divide-white/5 max-h-90 overflow-y-auto pr-1">
                            {[
                              { id: 'dashboard', label: 'Dashboard Access' },
                              { id: 'billing', label: 'Billing Engine' },
                              { id: 'invoices', label: 'Invoices & POS' },
                              { id: 'jobCards', label: 'Job Cards & Work orders' },
                              { id: 'customers', label: 'Customer Relations (CRM)' },
                              { id: 'inventory', label: 'Inventory & Parts Stock' },
                              { id: 'staffs', label: 'Staff Management' },
                              { id: 'appointments', label: 'Appointments Bookings' },
                              { id: 'reports', label: 'Reports & Analytics' },
                              { id: 'settings', label: 'System Settings' },
                              { id: 'whatsapp', label: 'WhatsApp Automation' },
                              { id: 'multiBranch', label: 'Multi-Branch Sync' },
                              { id: 'advancedAnalytics', label: 'Advanced Metrics' },
                              { id: 'apiAccess', label: 'Developer API Access' },
                              { id: 'paymentIntegration', label: 'Payment Gateway Integration' }
                            ].map(mod => {
                              const overrideVal = editModuleOverrides[mod.id as keyof BusinessModuleAccess];
                              const statusStr = overrideVal === true 
                                ? 'enabled' 
                                : overrideVal === false 
                                ? 'disabled' 
                                : 'inherit';

                              return (
                                <div key={mod.id} className="grid grid-cols-3 items-center py-2 px-2 hover:bg-white/[0.02] text-left">
                                  <span className="col-span-2 text-text-primary font-medium pl-2">{mod.label}</span>
                                  <select
                                    value={statusStr}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setEditModuleOverrides(prev => ({
                                        ...prev,
                                        [mod.id]: val === 'enabled' ? true : val === 'disabled' ? false : undefined
                                      }));
                                    }}
                                    className={`bg-bg-card border border-border-card rounded px-1.5 py-1 text-[10px] font-bold focus:outline-none cursor-pointer text-center ${
                                      statusStr === 'enabled' ? 'text-emerald-400' : statusStr === 'disabled' ? 'text-red-400' : 'text-text-secondary'
                                    }`}
                                  >
                                    <option value="inherit">Inherit Plan</option>
                                    <option value="enabled">Override: ON</option>
                                    <option value="disabled">Override: OFF</option>
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB E: PAYMENT SETTINGS */}
                    {activeEditTab === 'payment' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {/* UPI Config */}
                        <div className="p-4 bg-white/[0.02] border border-border-card rounded-xl space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                            <input 
                              type="checkbox"
                              checked={editUpiEnabled}
                              onChange={e => setEditUpiEnabled(e.target.checked)}
                              className="rounded border-border-card bg-bg-card text-[var(--color-primary)] focus:ring-0 cursor-pointer h-3.5 w-3.5"
                            />
                            UPI PAYMENT SETTINGS
                          </label>

                          {editUpiEnabled && (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200 text-left">
                              <div>
                                <label className="text-[9px] font-bold text-text-muted block mb-1">UPI ID (VPA)</label>
                                <input 
                                  type="text" 
                                  value={editUpiId}
                                  onChange={e => setEditUpiId(e.target.value)}
                                  placeholder="e.g. business@upi"
                                  className="w-full bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-text-primary font-mono text-[11px] font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-text-muted block mb-1">UPI MERCHANT NAME</label>
                                <input 
                                  type="text" 
                                  value={editUpiHolderName}
                                  onChange={e => setEditUpiHolderName(e.target.value)}
                                  placeholder="e.g. Apex Auto LLC"
                                  className="w-full bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-text-primary text-[11px] font-semibold"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Razorpay Config */}
                        <div className="p-4 bg-white/[0.02] border border-border-card rounded-xl space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                            <input 
                              type="checkbox"
                              checked={editRazorpayEnabled}
                              onChange={e => setEditRazorpayEnabled(e.target.checked)}
                              className="rounded border-border-card bg-bg-card text-[var(--color-primary)] focus:ring-0 cursor-pointer h-3.5 w-3.5"
                            />
                            RAZORPAY GATEWAY CONFIG
                          </label>

                          {editRazorpayEnabled && (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200 text-left">
                              <div>
                                <label className="text-[9px] font-bold text-text-muted block mb-1">RAZORPAY KEY ID</label>
                                <input 
                                  type="text" 
                                  value={editRazorpayKeyId}
                                  onChange={e => setEditRazorpayKeyId(e.target.value)}
                                  placeholder="rzp_test_..."
                                  className="w-full bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-text-primary font-mono text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-text-muted block mb-1">RAZORPAY SECRET KEY</label>
                                <input 
                                  type="password" 
                                  value={editRazorpaySecret}
                                  onChange={e => setEditRazorpaySecret(e.target.value)}
                                  placeholder="••••••••••••••"
                                  className="w-full bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-text-primary font-mono text-[11px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Subscription payments list */}
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-bold text-text-muted block uppercase tracking-wider">Subscription Billing History</span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {saPayments.filter(tx => tx.tenantDomain?.toUpperCase() === selectedWorkshop.tenantDomain?.toUpperCase()).length > 0 ? (
                              saPayments
                                .filter(tx => tx.tenantDomain?.toUpperCase() === selectedWorkshop.tenantDomain?.toUpperCase())
                                .map(tx => (
                                  <div key={tx.id} className="p-2.5 bg-white/[0.01] border border-border-card rounded-lg flex justify-between items-center text-[10px]">
                                    <div className="space-y-0.5 text-left">
                                      <span className="font-bold text-text-primary uppercase">{tx.planId} plan • {tx.paymentMethod}</span>
                                      <span className="text-text-muted block font-mono text-[9px]">{tx.transactionId || tx.id} • {new Date(tx.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-cyan-400 block">₹{tx.amount.toLocaleString()}</span>
                                      <span className={`text-[8px] font-extrabold px-1 rounded uppercase ${
                                        tx.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                      }`}>{tx.status}</span>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="p-3 border border-dashed border-border-card rounded-lg text-center text-[9px] text-text-muted">
                                No subscription payments logged for this tenant domain.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB F: SECURITY ACTIONS */}
                    {activeEditTab === 'security' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Lock / Suspend switches */}
                        <div className="p-4 bg-white/[0.02] border border-border-card rounded-xl space-y-3 text-left">
                          <span className="text-[10px] font-bold text-text-secondary block uppercase tracking-wider">Access Status</span>
                          
                          <div className="flex justify-between items-center py-1">
                            <div>
                              <strong className="text-text-primary block">Suspend Tenant Status</strong>
                              <span className="text-[9px] text-text-muted font-medium">Blocks all tenant access and returns 'Suspended' screen.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditStatus(prev => prev === 'Suspended' ? 'Active' : 'Suspended')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border cursor-pointer transition-all ${
                                editStatus === 'Suspended' 
                                  ? 'border-red-500/30 bg-red-500/10 text-red-400' 
                                  : 'border-border-card bg-white/5 text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              {editStatus === 'Suspended' ? 'Suspended' : 'Suspend'}
                            </button>
                          </div>

                          <div className="flex justify-between items-center py-1 border-t border-border-card pt-3">
                            <div>
                              <strong className="text-text-primary block font-bold">Disable Login Access</strong>
                              <span className="text-[9px] text-text-muted font-medium">Lock the workspace logins temporarily (displays locks).</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditLoginAccessDisabled(prev => !prev)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border cursor-pointer transition-all ${
                                editLoginAccessDisabled 
                                  ? 'border-orange-500/30 bg-orange-500/10 text-orange-400 font-bold' 
                                  : 'border-border-card bg-white/5 text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              {editLoginAccessDisabled ? 'Locked' : 'Lock Account'}
                            </button>
                          </div>
                        </div>

                        {/* Force Sessions Logout */}
                        <div className="p-4 bg-white/[0.02] border border-border-card rounded-xl flex justify-between items-center text-left">
                          <div>
                            <strong className="text-text-primary block">Force Session Expiry</strong>
                            <span className="text-[9px] text-text-muted font-medium">Forcibly log out all active mobile/web sessions for this tenant.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              forceLogoutSessions(selectedWorkshop.id);
                              triggerToast('Dispatched session termination command successfully.');
                            }}
                            className="px-3 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 font-bold uppercase text-[9px] cursor-pointer transition-all"
                          >
                            Force Logout
                          </button>
                        </div>

                        {/* Reset / Purge Data */}
                        <div className="p-4 bg-red-950/10 border border-red-500/25 rounded-xl flex justify-between items-center text-left">
                          <div>
                            <strong className="text-red-400 block font-bold">Purge Tenant Database</strong>
                            <span className="text-[9px] text-text-muted font-medium">Wipe clean all jobs, parts, invoices, and logs from domain partition.</span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (await confirm(`Are you absolutely sure you want to RESET ALL data for business "${selectedWorkshop.name}" (${selectedWorkshop.tenantDomain})? This will clear all customers, parts, job cards, invoices, and expenses. This action is permanent and cannot be undone.`)) {
                                resetWorkshopData(selectedWorkshop.id);
                                triggerToast(`All operational data for ${selectedWorkshop.name} has been purged.`);
                              }
                            }}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-all cursor-pointer shadow-sm text-xs"
                          >
                            Reset Workshop Data
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer Submit Buttons (for all tabs) */}
                    <div className="flex gap-3.5 pt-4 border-t border-border-card font-semibold shrink-0">
                      <button 
                        type="button"
                        onClick={() => setEditPanelOpen(false)}
                        className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer text-center text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold cursor-pointer text-center text-xs"
                      >
                        Save All Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL DRAWER OVERVIEW & SESSION MONITOR */}
      <AnimatePresence>
        {detailsOpen && selectedWorkshop && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="glass-panel w-full max-w-lg h-screen border-y-0 border-r-0 rounded-none p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-border-card">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-border-card shrink-0">
                      {selectedWorkshop.logoUrl && selectedWorkshop.logoUrl.startsWith('data:image/') ? (
                        <img src={selectedWorkshop.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <span className="text-lg">{selectedWorkshop.logoUrl || '⚙️'}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-text-primary">{selectedWorkshop.name} Overview</h3>
                  </div>
                  <button 
                    onClick={() => setDetailsOpen(false)}
                    className="p-1 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Sub-Branch list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-muted block uppercase tracking-wider">Tenant Branch Locations</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 text-left rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
                      📍 Primary Main Bay
                    </button>
                    {((selectedWorkshop.branches || 1) || 1) > 1 ? (
                      <button className="p-3 text-left rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
                        📍 Secondary East Annex
                      </button>
                    ) : (
                      <button className="p-3 text-center border-dashed border border-border-card rounded-xl text-[10px] text-text-muted flex items-center justify-center gap-1 cursor-pointer">
                        <Plus size={12} /> Add branch bay
                      </button>
                    )}
                  </div>
                </div>

                {/* Active device sessions list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-text-muted block uppercase tracking-wider">Active Device Sessions</span>
                    {selectedWorkshop.deviceActivity && selectedWorkshop.deviceActivity.length > 0 && (
                      <button 
                        onClick={() => {
                          forceLogoutSessions(selectedWorkshop.id);
                          // Update local copy
                          setSelectedWorkshop(prev => prev ? { ...prev, deviceActivity: [] } : null);
                          triggerToast('Forced logout on all active sessions!');
                        }}
                        className="text-[9px] text-red-400 font-bold hover:underline cursor-pointer"
                      >
                        Force Logout All
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {selectedWorkshop.deviceActivity && selectedWorkshop.deviceActivity.length > 0 ? (
                      selectedWorkshop.deviceActivity.map((dev) => (
                        <div key={dev.deviceId} className="p-3 rounded-xl border border-border-card bg-white/[0.01] text-xs flex justify-between items-center">
                          <div className="space-y-0.5">
                            <h5 className="font-bold text-text-primary flex items-center gap-1.5">
                              <Smartphone size={13} className="text-cyan-400" /> {dev.name}
                            </h5>
                            <p className="text-[10px] text-text-muted font-mono">IP: {dev.ip} • Last Active: {dev.lastActive}</p>
                          </div>
                          <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {dev.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-dashed border-border-card rounded-xl text-center text-[10px] text-text-muted">
                        No active login sessions monitored currently.
                      </div>
                    )}
                  </div>
                </div>

                {/* Login history logs */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-text-muted block uppercase tracking-wider">Security Access Logs</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedWorkshop.loginHistory && selectedWorkshop.loginHistory.length > 0 ? (
                      selectedWorkshop.loginHistory.map((log, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl border border-border-card bg-white/[0.01] text-[10px] space-y-1">
                          <div className="flex justify-between text-text-muted font-mono text-[9px]">
                            <span>{log.device}</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-text-primary font-medium">Logged in successfully from {log.location}</span>
                            <span className={`text-[8px] font-bold font-mono ${log.success ? 'text-emerald-400' : 'text-red-400'}`}>
                              {log.success ? 'SUCCESS' : 'DENIED'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-dashed border-border-card rounded-xl text-center text-[10px] text-text-muted">
                        No login history registered yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Backups & Storage Monitor */}
                <div className="space-y-3 pt-4 border-t border-border-card">
                  <span className="text-[10px] font-bold text-text-muted block uppercase tracking-wider">Backups & Storage Monitor</span>
                  <div className="glass-panel p-3.5 border-border-card space-y-3 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-text-secondary">Total Allocated Storage:</span>
                      <span className="text-text-primary font-mono font-bold">{selectedWorkshop?.usage?.storageMb}MB / {(selectedWorkshop?.usage as any)?.storageLimit}MB</span>
                    </div>
                    
                    {/* Mock Backup Roster */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-text-muted block font-semibold">Backup History (Daily Archives)</span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 font-mono text-[10px]">
                        {[
                          { name: `backup_${selectedWorkshop.tenantDomain.toLowerCase()}_2026_05_25.sql`, size: '1,424 KB', date: 'May 25, 2026' },
                          { name: `backup_${selectedWorkshop.tenantDomain.toLowerCase()}_2026_05_24.sql`, size: '1,401 KB', date: 'May 24, 2026' }
                        ].map((bak, idx) => (
                          <div key={idx} className="p-2 rounded bg-white/[0.02] border border-border-card flex justify-between items-center">
                            <div>
                              <span className="text-text-secondary block truncate max-w-44">{bak.name}</span>
                              <span className="text-[9px] text-text-muted">{bak.date} • {bak.size}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button 
                                type="button"
                                onClick={() => triggerToast('Backup downloaded successfully!')}
                                className="text-[9px] text-cyan-400 hover:underline cursor-pointer"
                              >
                                Download
                              </button>
                              <button 
                                type="button"
                                onClick={() => triggerToast('System database restored to backup snapshot.')}
                                className="text-[9px] text-emerald-400 hover:underline cursor-pointer"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations Section */}
                <div className="space-y-2 pt-4 border-t border-border-card">
                  <span className="text-[10px] font-bold text-text-muted block uppercase tracking-wider">Dangerous Tenant Operations</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (await confirm(`Are you absolutely sure you want to RESET ALL data for business "${selectedWorkshop.name}" (${selectedWorkshop.tenantDomain})? This will clear all customers, parts, job cards, invoices, and expenses for this tenant. This action is permanent and cannot be undone.`)) {
                          resetWorkshopData(selectedWorkshop.id);
                          triggerToast(`All operational data for ${selectedWorkshop.name} has been purged via Logs Panel.`);
                        }
                      }}
                      className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[10px] uppercase transition-all cursor-pointer text-center shadow-sm"
                    >
                      Reset Workshop Data
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setDetailsOpen(false)}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-hover-bg text-text-primary font-bold text-xs uppercase transition-colors cursor-pointer mt-4"
              >
                Close Drawer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}

        {/* Verify Modal */}
        {workshopToVerify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f111a] border border-border-card rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              <div className="p-5">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-cyan-400" size={16} /> Verify Business
                </h3>
                <div className="space-y-3 bg-black/20 p-3 rounded-xl border border-border-card mb-5 text-xs">
                  <div>
                    <span className="text-text-muted block mb-0.5">Business:</span>
                    <span className="text-text-primary font-bold">{workshopToVerify.name}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block mb-0.5">Domain:</span>
                    <span className="text-cyan-400 font-mono font-bold">{workshopToVerify.tenantDomain}</span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-6">
                  Are you sure you want to verify this business? Verified businesses are considered fully onboarded.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setWorkshopToVerify(null)}
                    className="flex-1 py-2 rounded-xl border border-border-card hover:bg-hover-bg text-text-secondary text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      verifyWorkshop(workshopToVerify.id);
                      triggerToast(`${workshopToVerify.name} has been verified.`);
                      setWorkshopToVerify(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Verify Modal */}
        {workshopToUnverify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f111a] border border-border-card rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              <div className="p-5">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-orange-400" size={16} /> Remove Verification
                </h3>
                <div className="space-y-3 bg-black/20 p-3 rounded-xl border border-border-card mb-5 text-xs">
                  <div>
                    <span className="text-text-muted block mb-0.5">Business:</span>
                    <span className="text-text-primary font-bold">{workshopToUnverify.name}</span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mb-6">
                  Remove verification status from this business? It will be moved back to the "Newly Arrived" pool.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setWorkshopToUnverify(null)}
                    className="flex-1 py-2 rounded-xl border border-border-card hover:bg-hover-bg text-text-secondary text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      removeWorkshopVerification(workshopToUnverify.id);
                      triggerToast(`Verification removed for ${workshopToUnverify.name}.`);
                      setWorkshopToUnverify(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
