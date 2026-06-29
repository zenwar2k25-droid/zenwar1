import React, { useState } from 'react';
import { 
  Save, 
  Store, 
  Percent, 
  Printer, 
  Languages, 
  ShieldCheck, 
  CheckCircle,
  Image,
  Key,
  Users,
  UserPlus,
  Unlock,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CreditCard,
  Smartphone,
  Activity,
  Copy,
  Check,
  Wifi,
  Coins,
  Building,
  QrCode,
  Download,
  Bell,
  Clock,
  Megaphone
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface StaffRowProps {
  mechanic: any;
  onUpdate: (id: string, updated: any) => void;
  triggerToast: (msg: string) => void;
}

const StaffRow: React.FC<StaffRowProps> = ({ mechanic, onUpdate, triggerToast }) => {
  const [isAddingLogin, setIsAddingLogin] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleAddLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    onUpdate(mechanic.id, {
      username,
      password,
      loginAccessDisabled: false
    });
    setIsAddingLogin(false);
    setUsername('');
    setPassword('');
    triggerToast(`Login access created for ${mechanic.name}`);
  };

  const handleResetPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    onUpdate(mechanic.id, {
      password: newPassword
    });
    setIsResettingPass(false);
    setNewPassword('');
    triggerToast(`Password reset successfully for ${mechanic.name}`);
  };

  const toggleAccess = () => {
    const nextVal = !mechanic.loginAccessDisabled;
    onUpdate(mechanic.id, {
      loginAccessDisabled: nextVal
    });
    triggerToast(`Login access ${nextVal ? 'disabled' : 'enabled'} for ${mechanic.name}`);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(mechanic.id, {
      role: e.target.value
    });
    triggerToast(`${mechanic.name} role set to ${e.target.value}`);
  };

  const hasLogin = !!mechanic.username && !!mechanic.password;

  return (
    <div className="border border-border-card bg-white/[0.01] hover:bg-white/[0.02] rounded-xl p-4 transition-all space-y-3 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-border-card flex items-center justify-center text-xl">
            {mechanic.avatar || '🔧'}
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-xs">{mechanic.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono text-text-muted">{mechanic.phone}</span>
              {hasLogin && (
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${mechanic.loginAccessDisabled ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {mechanic.loginAccessDisabled ? 'Suspended' : 'Active'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Role dropdown */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted font-mono">Role:</span>
            <select
              value={mechanic.role}
              onChange={handleRoleChange}
              className="bg-bg-card border border-border-card rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono cursor-pointer"
            >
              <option value="Manager">Manager</option>
              <option value="Advisor">Advisor</option>
              <option value="Mechanic">Mechanic</option>
            </select>
          </div>

          {hasLogin ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResettingPass(!isResettingPass)}
                className="px-2.5 py-1.5 rounded-lg border border-border-card bg-white/5 hover:border-[var(--color-primary)] text-text-primary hover:text-[var(--color-primary)] text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
              >
                <Key size={10} /> Reset Pass
              </button>
              <button
                type="button"
                onClick={toggleAccess}
                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${mechanic.loginAccessDisabled ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'}`}
              >
                {mechanic.loginAccessDisabled ? <Unlock size={10} /> : <Lock size={10} />}
                {mechanic.loginAccessDisabled ? 'Enable' : 'Disable'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingLogin(!isAddingLogin)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={10} /> Create Login
            </button>
          )}
        </div>
      </div>

      {/* Sub-form: Add Login Credentials */}
      {isAddingLogin && (
        <form onSubmit={handleAddLoginSubmit} className="bg-[#05060b] border border-border-card p-3.5 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="text-[10px] font-bold text-text-secondary font-mono flex items-center gap-1 pb-1 border-b border-border-card">
            <UserPlus size={11} className="text-[var(--color-primary)]" /> Set Credentials for {mechanic.name}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-text-muted block mb-0.5">Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s+/g, ''))}
                placeholder="e.g. jsmith"
                className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-text-primary focus:outline-none text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-0.5">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-text-primary focus:outline-none text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => setIsAddingLogin(false)}
              className="px-2.5 py-1 rounded bg-white/5 text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-[var(--color-primary)] text-text-primary font-bold"
            >
              Save Credentials
            </button>
          </div>
        </form>
      )}

      {/* Sub-form: Reset Password */}
      {isResettingPass && (
        <form onSubmit={handleResetPassSubmit} className="bg-[#05060b] border border-border-card p-3.5 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="text-[10px] font-bold text-text-secondary font-mono flex items-center gap-1 pb-1 border-b border-border-card">
            <Key size={11} className="text-[var(--color-primary)]" /> Reset Password for {mechanic.name}
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-0.5">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-bg-card border border-border-card rounded-lg px-3 py-2 text-text-primary focus:outline-none text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => setIsResettingPass(false)}
              className="px-2.5 py-1 rounded bg-white/5 text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-[var(--color-primary)] text-text-primary font-bold"
            >
              Update Password
            </button>
          </div>
        </form>
      )}


    </div>
  );
};

export const Settings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    currentUser, 
    businesses, 
    updateWorkshop, 
    mechanics, 
    updateMechanic,
    getWorkshopPaymentConfig,
    updateWorkshopPaymentConfig,
    paymentAuditLogs,
    saAnnouncements
  } = useDatabase();
  const [successToast, setSuccessToast] = useState('');

  const currentWorkshop = businesses.find(w => w.id === currentUser?.businessId);
  const currentStaff = mechanics.find(m => m.id === currentUser?.mechanicId);

  // Profile Form States
  const isStaff = !!currentUser?.mechanicId;
  const isWorkshopAdmin = currentUser?.role === 'admin';

  const [profileName, setProfileName] = useState(
    isWorkshopAdmin ? (currentWorkshop?.ownerName || '') : (currentStaff?.name || '')
  );
  const [profileEmail, setProfileEmail] = useState(
    isWorkshopAdmin ? (currentWorkshop?.email || '') : (currentStaff?.email || '')
  );
  const [profilePhone, setProfilePhone] = useState(
    isWorkshopAdmin ? (currentWorkshop?.phone || '') : (currentStaff?.phone || '')
  );
  const [profilePhoto, setProfilePhoto] = useState(
    isWorkshopAdmin ? (currentWorkshop?.profilePhoto || '') : (currentStaff?.profilePhoto || '')
  );

  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [showProfilePass, setShowProfilePass] = useState(false);
  const [profileDragOver, setProfileDragOver] = useState(false);

  // Form states mapping database settings
  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultGstRate, setDefaultGstRate] = useState(settings.defaultGstRate);
  
  // Custom states
  const [language, setLanguage] = useState<'en' | 'es' | 'hi'>('en');
  const [printSize, setPrintSize] = useState<'a4' | '80mm' | '58mm'>('80mm');
  const [allowTechReport, setAllowTechReport] = useState(false);
  const [allowAutoStockDeduct, setAllowAutoStockDeduct] = useState(true);

  // Admin account security states
  const [ownerName, setOwnerName] = useState(currentWorkshop?.ownerName || '');
  const [email, setEmail] = useState(currentWorkshop?.email || '');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  const activeTenant = currentUser?.tenantDomain || 'APEXAUTO';
  const paymentConfig = getWorkshopPaymentConfig(activeTenant);

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'payments' | 'notifications'>('profile');
  const showPaymentsTab = isWorkshopAdmin || currentUser?.role === 'manager' || currentUser?.role === 'advisor';
  
  const myAnnouncements = saAnnouncements?.filter(ann => 
    ann.target === 'all' || 
    ann.target === currentWorkshop?.planId || 
    ann.target === activeTenant
  ) || [];

  // Payment states
  const [upiEnabled, setUpiEnabled] = useState(paymentConfig.upiEnabled);
  const [upiId, setUpiId] = useState(paymentConfig.upiId);
  const [razorpayEnabled, setRazorpayEnabled] = useState(paymentConfig.razorpayEnabled);
  const [razorpayKeyId, setRazorpayKeyId] = useState(paymentConfig.razorpayKeyId);
  const [razorpaySecret, setRazorpaySecret] = useState(paymentConfig.razorpaySecret);
  const [razorpayTestMode, setRazorpayTestMode] = useState(paymentConfig.razorpayTestMode);
  const [bankName, setBankName] = useState(paymentConfig.bankName);
  const [bankAccount, setBankAccount] = useState(paymentConfig.bankAccount);
  const [bankIfsc, setBankIfsc] = useState(paymentConfig.bankIfsc);
  const [defaultMethod, setDefaultMethod] = useState(paymentConfig.defaultMethod);
  const [termsAndConditions, setTermsAndConditions] = useState(paymentConfig.termsAndConditions || '');

  // Payment UI helpers
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const handleDownloadQR = async () => {
    if (!upiId) return;
    try {
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(settings.shopName)}&am=0&cu=INR`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${settings.shopName.replace(/\s+/g, '_')}_UPI_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Downloaded UPI QR code successfully!');
    } catch (e) {
      triggerToast('Failed to download QR code');
    }
  };

  const handlePrintQR = () => {
    if (!upiId) return;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(settings.shopName)}&am=0&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print UPI QR - ${settings.shopName}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
              img { width: 300px; height: 300px; border: 1px solid #ccc; padding: 10px; border-radius: 10px; }
              h2 { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h2>${settings.shopName}</h2>
            <img src="${qrUrl}" />
            <p>Scan to pay using any UPI App</p>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopyPaymentLink = () => {
    const checkoutLink = `${window.location.origin}${window.location.pathname}#/checkout/test-invoice-id`;
    navigator.clipboard.writeText(checkoutLink);
    triggerToast('Copied test checkout link to clipboard!');
  };

  const handleVerifyRazorpay = () => {
    setVerifyStatus('testing');
    setTimeout(() => {
      if (razorpayKeyId.startsWith('rzp_') && razorpaySecret.length > 5) {
        setVerifyStatus('success');
        triggerToast('Razorpay Connection verified successfully!');
      } else {
        setVerifyStatus('failed');
        triggerToast('Verification failed: Invalid API credentials format.');
      }
    }, 1500);
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser?.tenantDomain === 'DEMO001') {
      triggerToast('Demo Mode Restriction: Payment configurations cannot be modified in the live demo business.');
      return;
    }

    if (!isWorkshopAdmin) {
      triggerToast('Access Denied: Only Business Admins can edit payment settings.');
      return;
    }

    updateWorkshopPaymentConfig(activeTenant, {
      upiEnabled,
      upiId,
      razorpayEnabled,
      razorpayKeyId,
      razorpaySecret,
      razorpayTestMode,
      bankName,
      bankAccount,
      bankIfsc,
      defaultMethod,
      termsAndConditions
    });
    triggerToast('Payment integration settings saved successfully!');
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setProfileDragOver(false);

    let file: File | null = null;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if (e.type === 'drop' && 'dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast('Error: Profile image size cannot exceed 1.5 MB.');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      triggerToast('Error: Supported image formats are PNG, JPG, WEBP.');
      return;
    }

    setInterval(() => {
      // simulate progress
    }, 100);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTimeout(() => {
          setProfilePhoto(event.target!.result as string);
          triggerToast('Profile photo loaded successfully!');
        }, 300);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePersonalProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser?.tenantDomain === 'DEMO001') {
      triggerToast('Demo Mode Restriction: Personal profile cannot be modified in the live demo business.');
      return;
    }

    if (profilePassword && profilePassword !== profileConfirmPassword) {
      triggerToast('Error: Personal passwords do not match!');
      return;
    }

    if (isWorkshopAdmin && currentUser?.businessId) {
      const updatedDetails: any = {
        ownerName: profileName,
        email: profileEmail,
        phone: profilePhone,
        profilePhoto
      };
      if (profilePassword) {
        updatedDetails.password = profilePassword;
      }
      updateWorkshop(currentUser.businessId, updatedDetails);
      triggerToast('Admin profile updated successfully.');
      setProfilePassword('');
      setProfileConfirmPassword('');
    } else if (isStaff && currentUser?.mechanicId) {
      const updatedDetails: any = {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        profilePhoto
      };
      if (profilePassword) {
        updatedDetails.password = profilePassword;
      }
      updateMechanic(currentUser.mechanicId, updatedDetails);
      triggerToast('Profile updated successfully.');
      setProfilePassword('');
      setProfileConfirmPassword('');
    }
  };

  const handleUpdateStaff = (id: string, updated: any) => {
    if (currentUser?.tenantDomain === 'DEMO001') {
      triggerToast('Demo Mode Restriction: Staff credentials cannot be modified in the live demo business.');
      return;
    }
    updateMechanic(id, updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser?.tenantDomain === 'DEMO001') {
      triggerToast('Demo Mode Restriction: Business settings cannot be modified in the live demo business.');
      return;
    }

    // Save Admin Security details if business is active
    if (currentUser?.role === 'admin' && currentUser?.businessId) {
      if (adminPassword && adminPassword !== confirmAdminPassword) {
        triggerToast('Error: Admin passwords do not match!');
        return;
      }
      
      const updatedDetails: any = { ownerName, email };
      if (adminPassword) {
        updatedDetails.password = adminPassword;
      }
      
      updateWorkshop(currentUser.businessId, updatedDetails);
      setAdminPassword('');
      setConfirmAdminPassword('');
    }

    updateSettings({
      shopName,
      tagline,
      logoUrl,
      gstNumber,
      phone,
      address,
      currency,
      defaultGstRate
    });
    triggerToast('Business settings updated successfully.');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Warning Banner for Demo User */}
      {currentUser?.tenantDomain === 'DEMO001' && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-200">
          <AlertCircle size={18} className="text-orange-400 shrink-0" />
          <div>
            <span className="font-bold text-text-primary block mb-0.5">Demo Mode Sandbox Restriction</span>
            Core system settings, passwords, logo branding, and staff login credentials cannot be modified in the Try Live Demo business. Feel free to explore other features!
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Settings Console
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            {isWorkshopAdmin ? 'Customize invoice layout parameters, branding & staff rules' : 'Update your personal profile, credentials, and avatar'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border-card pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'profile' ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' : 'border-transparent text-[var(--text-secondary)] hover:text-text-primary'}`}
        >
          My Profile
        </button>
        {isWorkshopAdmin && (
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'business' ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' : 'border-transparent text-[var(--text-secondary)] hover:text-text-primary'}`}
          >
            Business Settings
          </button>
        )}
        {showPaymentsTab && (
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'payments' ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' : 'border-transparent text-[var(--text-secondary)] hover:text-text-primary'}`}
          >
            Payment Integrations
          </button>
        )}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'notifications' ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold' : 'border-transparent text-[var(--text-secondary)] hover:text-text-primary'}`}
        >
          Notifications
        </button>
      </div>

      {/* 1. PERSONAL PROFILE CARD */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
          <User size={15} className="text-[var(--color-primary)]" /> My Personal Profile Settings
        </h3>

        <form onSubmit={handleSavePersonalProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Upload Column */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="relative group w-28 h-28 rounded-full border-2 border-[var(--color-primary)]/40 overflow-hidden bg-white/5 flex items-center justify-center">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-text-muted font-bold uppercase">{profileName.charAt(0) || 'U'}</span>
                )}
                {/* Drag over overlay */}
                {profileDragOver && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[10px] text-cyan-400">Drop Here</div>
                )}
              </div>

              {profilePhoto ? (
                <button
                  type="button"
                  onClick={() => setProfilePhoto('')}
                  className="text-[10px] text-red-400 hover:underline font-semibold cursor-pointer"
                >
                  Remove Photo
                </button>
              ) : (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setProfileDragOver(true); }}
                  onDragLeave={() => setProfileDragOver(false)}
                  onDrop={handleProfilePhotoChange}
                  onClick={() => document.getElementById('profile-photo-input')?.click()}
                  className="border border-dashed border-border-card rounded-xl p-2 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors w-full"
                >
                  <input 
                    type="file" 
                    id="profile-photo-input" 
                    className="hidden" 
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleProfilePhotoChange}
                  />
                  <span className="text-[10px] text-text-secondary block">Drag & Drop or <span className="text-[var(--color-primary)] font-bold font-sans">Browse</span></span>
                  <span className="text-[8px] text-gray-600 block mt-0.5 font-mono">PNG, JPG, WEBP (Max 1.5MB)</span>
                </div>
              )}
              <span className="text-[8px] text-gray-600 font-mono block">Storage: {currentUser?.tenantDomain || 'TENANT'}/users/profilePhotos/</span>
            </div>

            {/* Fields Column */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-text-secondary block mb-1">Full Display Name *</label>
                  <input 
                    type="text" 
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-secondary block mb-1">Contact Telephone *</label>
                  <input 
                    type="text" 
                    required
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-text-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-card">
                <div>
                  <label className="text-text-secondary block mb-1 flex items-center justify-between">
                    <span>New Password</span>
                    {profilePassword && (
                      <span className={`text-[8px] font-bold ${profilePassword.length >= 8 ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {profilePassword.length >= 8 ? 'Strong' : 'Short'}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input 
                      type={showProfilePass ? 'text' : 'password'} 
                      value={profilePassword}
                      onChange={e => setProfilePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2 text-text-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfilePass(!showProfilePass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showProfilePass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-text-secondary block mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={profileConfirmPassword}
                    onChange={e => setProfileConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Save size={13} /> Update Personal Profile
              </button>
            </div>
          </div>
        </form>
      </div>
      )}

      {activeTab === 'business' && isWorkshopAdmin && (
        <>
          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* Row 1: Shop Branding Profile */}
            <div className="glass-panel p-5 space-y-4">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
                <Store size={15} className="text-[var(--color-primary)]" /> Business Identity Profile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-text-secondary block mb-1">Business Branding Name *</label>
                  <input 
                    type="text" 
                    required
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-secondary block mb-1">Company Slogan / Tagline</label>
                  <input 
                    type="text" 
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                  />
                </div>
                {/*
                <div>
                  <label className="text-text-secondary block mb-1 flex items-center gap-1"><Image size={13} /> Logo Emoji Shortcut *</label>
                  <input 
                    type="text" 
                    required
                    maxLength={2}
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="e.g. ⚡"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none text-center font-bold text-sm"
                  />
                </div>
                */}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary block mb-1">Business Phone Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-secondary block mb-1">Business Address Details</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Invoicing details & GST parameters */}
            <div className="glass-panel p-5 space-y-4">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
                <Percent size={15} className="text-[var(--color-primary)]" /> GST & Tax Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-text-secondary block mb-1">Merchant GSTIN Code *</label>
                  <input 
                    type="text" 
                    required
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-text-secondary block mb-1">Default GST Rate (%)</label>
                  <input 
                    type="number" 
                    value={defaultGstRate}
                    onChange={e => setDefaultGstRate(Number(e.target.value))}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-text-secondary block mb-1">Currency Code</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2.5 text-text-primary focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Printer preferences & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
                  <Printer size={15} className="text-[var(--color-primary)]" /> Receipt Format Templates
                </h3>
                
                <div className="space-y-3">
                  <label className="text-text-secondary block">Configure Primary Print Output Sizing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'a4', label: 'Standard A4' },
                      { id: '80mm', label: 'Thermal 80mm' },
                      { id: '58mm', label: 'Thermal 58mm' }
                    ].map(size => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setPrintSize(size.id as any)}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${printSize === size.id ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)] text-[var(--color-primary)] font-bold' : 'border-border-card bg-white/5 text-[var(--text-secondary)] hover:text-text-primary'}`}
                      >
                        <span className="text-[10px]">{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
                  <Languages size={15} className="text-[var(--color-primary)]" /> Multi-Language Translation
                </h3>
                
                <div className="space-y-3">
                  <label className="text-text-secondary block">Select Portal System Language</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'en', label: 'English (US)' },
                      { id: 'es', label: 'Español' },
                      { id: 'hi', label: 'Hindi (हिन्दी)' }
                    ].map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setLanguage(lang.id as any)}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${language === lang.id ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)] text-[var(--color-primary)] font-bold' : 'border-border-card bg-white/5 text-[var(--text-secondary)] hover:text-text-primary'}`}
                      >
                        <span className="text-[10px]">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Roles & Permissions */}
            <div className="glass-panel p-5 space-y-4">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
                <ShieldCheck size={15} className="text-[var(--color-primary)]" /> Access Role Permissions
              </h3>
              
              <div className="space-y-4.5">
                <div className="flex justify-between items-center py-1">
                  <div>
                    <h5 className="font-bold text-text-primary">Technician Salary Visibility</h5>
                    <p className="text-[10px] text-text-muted leading-normal mt-0.5">Allows mechanics and service staff to check salary structures directly</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={allowTechReport}
                    onChange={e => setAllowTechReport(e.target.checked)}
                    className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-t border-border-card pt-4">
                  <div>
                    <h5 className="font-bold text-text-primary">Auto Stock Deduction</h5>
                    <p className="text-[10px] text-text-muted leading-normal mt-0.5">Deduct spare parts volumes automatically from stock list upon POS checkout completions</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={allowAutoStockDeduct}
                    onChange={e => setAllowAutoStockDeduct(e.target.checked)}
                    className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Security & Admin Credentials Panel */}
            {currentUser?.role === 'admin' && currentWorkshop && (
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
                  <Key size={15} className="text-[var(--color-primary)]" /> Security & Admin Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-secondary block mb-1">Owner Name *</label>
                    <input 
                      type="text" 
                      required
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary block mb-1">Admin Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-text-secondary block mb-1">New Admin Password (leave blank to keep current)</label>
                    <input 
                      type="password" 
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary block mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmAdminPassword}
                      onChange={e => setConfirmAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Save size={16} /> Save Configurations
            </button>
          </form>

          {/* Staff Login & Credentials Control Panel */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
              <Users size={15} className="text-[var(--color-primary)]" /> Staff Login & Credentials Control
            </h3>
            
            <div className="space-y-4">
              {mechanics.map(m => (
                <StaffRow key={m.id} mechanic={m} onUpdate={handleUpdateStaff} triggerToast={triggerToast} />
              ))}
              {mechanics.length === 0 && (
                <p className="text-text-muted font-mono text-center py-4">No staff members registered in this business.</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'payments' && showPaymentsTab && (
        <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs animate-in fade-in duration-200">
          
          {/* UPI Payment Configuration Card */}
          <div className="glass-panel p-5 space-y-4 border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
            <div className="flex justify-between items-center border-b border-border-card pb-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={15} className="text-cyan-400" /> UPI Instant Payments QR Configuration
              </h3>
              <span className="text-[10px] text-text-muted font-mono">Isolated VPA checkout</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* UPI VPA Form details */}
              <div className="md:col-span-8 space-y-4">
                <div className="flex justify-between items-center py-1">
                  <div>
                    <h5 className="font-bold text-text-primary">Enable UPI QR Payments</h5>
                    <p className="text-[10px] text-text-muted leading-normal mt-0.5">Generate dynamic QR codes for client invoices and WhatsApp shares</p>
                  </div>
                  <input 
                    type="checkbox"
                    disabled={!isWorkshopAdmin}
                    checked={upiEnabled}
                    onChange={e => setUpiEnabled(e.target.checked)}
                    className="rounded border-border-card text-cyan-500 focus:ring-cyan-500 cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border-card">
                  <label className="text-text-secondary block mb-1">Business UPI ID (VPA) *</label>
                  <input 
                    type="text" 
                    disabled={!isWorkshopAdmin}
                    required={upiEnabled}
                    value={upiId}
                    onChange={e => setUpiId(e.target.value.trim().toLowerCase())}
                    placeholder="e.g. sbmotors@upi"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-xs disabled:opacity-50"
                  />
                  <span className="text-[9px] text-gray-600 font-mono">This UPI handle will receive customer invoice payments and remains hidden from the customer's raw view.</span>
                </div>

                {upiId && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      className="px-3 py-1.5 rounded-lg border border-border-card bg-white/5 hover:border-cyan-500 text-text-primary hover:text-cyan-400 text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} /> Download QR
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintQR}
                      className="px-3 py-1.5 rounded-lg border border-border-card bg-white/5 hover:border-cyan-500 text-text-primary hover:text-cyan-400 text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Printer size={12} /> Print QR
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPaymentLink}
                      className="px-3 py-1.5 rounded-lg border border-border-card bg-white/5 hover:border-cyan-500 text-text-primary hover:text-cyan-400 text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={12} /> Copy Payment Link
                    </button>
                  </div>
                )}
              </div>

              {/* Live Preview Widget */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-bg-card border border-border-card space-y-2.5 min-h-[200px]">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">Live QR Preview</span>
                {upiEnabled && upiId ? (
                  <div className="p-2 bg-white rounded-lg shadow-lg relative group">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(settings.shopName)}&am=0&cu=INR`)}`}
                      alt="UPI QR Code Preview"
                      className="w-[130px] h-[130px]"
                    />
                    <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-cyan-400 font-bold p-2 text-center pointer-events-none">
                      Scan to test connection
                    </div>
                  </div>
                ) : (
                  <div className="w-[130px] h-[130px] rounded-lg border border-dashed border-border-card flex flex-col items-center justify-center text-center p-2 text-gray-600">
                    <QrCode size={30} className="stroke-1 mb-1.5" />
                    <span className="text-[9px]">UPI QR Disabled</span>
                  </div>
                )}
                <span className="text-[8px] text-cyan-500/70 font-mono text-center">{upiEnabled ? 'Dynamic Checkout QR Active' : 'Enter VPA and toggle enabled'}</span>
              </div>
            </div>
          </div>

          {/* Razorpay Integration Settings Card */}
          <div className="glass-panel p-5 space-y-4 border-cyan-500/20 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-border-card pb-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={15} className="text-cyan-400" /> Razorpay Online Collection Settings
              </h3>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${razorpayEnabled ? 'bg-cyan-400 animate-ping' : 'bg-gray-500'}`} />
                <span className="text-[10px] text-text-muted font-mono">{razorpayEnabled ? 'API Hook Set' : 'Inactive'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-1">
                <div>
                  <h5 className="font-bold text-text-primary">Enable Razorpay Collections</h5>
                  <p className="text-[10px] text-text-muted leading-normal mt-0.5">Support card, netbanking, wallets, and automated credit settlements</p>
                </div>
                <input 
                  type="checkbox"
                  disabled={!isWorkshopAdmin}
                  checked={razorpayEnabled}
                  onChange={e => setRazorpayEnabled(e.target.checked)}
                  className="rounded border-border-card text-cyan-500 focus:ring-cyan-500 cursor-pointer disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-card">
                <div className="space-y-1">
                  <label className="text-text-secondary block mb-1">Razorpay Key ID *</label>
                  <input 
                    type="text" 
                    disabled={!isWorkshopAdmin}
                    required={razorpayEnabled}
                    value={razorpayKeyId}
                    onChange={e => setRazorpayKeyId(e.target.value.trim())}
                    placeholder="rzp_test_..."
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-xs disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-text-secondary block mb-1">Razorpay Secret Key *</label>
                  <div className="relative">
                    <input 
                      type={showRazorpaySecret ? 'text' : 'password'} 
                      disabled={!isWorkshopAdmin}
                      required={razorpayEnabled}
                      value={razorpaySecret}
                      onChange={e => setRazorpaySecret(e.target.value.trim())}
                      placeholder="••••••••••••••••••••"
                      className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-xs disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showRazorpaySecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div className="flex items-center gap-4">
                  <label className="text-text-secondary">Gateway Execution Mode:</label>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      disabled={!isWorkshopAdmin}
                      onClick={() => setRazorpayTestMode(true)}
                      className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${razorpayTestMode ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'border-border-card text-text-muted hover:text-text-primary'}`}
                    >
                      Test mode
                    </button>
                    <button
                      type="button"
                      disabled={!isWorkshopAdmin}
                      onClick={() => setRazorpayTestMode(false)}
                      className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${!razorpayTestMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-border-card text-text-muted hover:text-text-primary'}`}
                    >
                      Live production
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyRazorpay}
                    disabled={verifyStatus === 'testing' || !razorpayKeyId || !razorpaySecret}
                    className="px-4 py-2 border border-border-card bg-white/5 hover:border-cyan-500 text-text-primary hover:text-cyan-400 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {verifyStatus === 'testing' ? (
                      <>
                        <div className="w-3 h-3 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <Wifi size={12} /> Verify Connection
                      </>
                    )}
                  </button>

                  {verifyStatus === 'success' && (
                    <span className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1 font-mono">
                      <Check size={12} /> Verified
                    </span>
                  )}
                  {verifyStatus === 'failed' && (
                    <span className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-1 font-mono">
                      <AlertCircle size={12} /> Error
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Transfer Details Card */}
          <div className="glass-panel p-5 space-y-4 border-cyan-500/20 relative overflow-hidden">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
              <Building size={15} className="text-cyan-400" /> Direct Bank Settlement Accounts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-text-secondary block mb-1">Beneficiary Bank Name</label>
                <input 
                  type="text" 
                  disabled={!isWorkshopAdmin}
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 text-xs disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">BankAccount Number</label>
                <input 
                  type="text" 
                  disabled={!isWorkshopAdmin}
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. 501002391028"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-xs disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">IFSC / Routing Code</label>
                <input 
                  type="text" 
                  disabled={!isWorkshopAdmin}
                  value={bankIfsc}
                  onChange={e => setBankIfsc(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. HDFC0000102"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 font-mono text-xs disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Checkout Preference card */}
          <div className="glass-panel p-5 space-y-4 border-cyan-500/20 relative overflow-hidden">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
              <Coins size={15} className="text-cyan-400" /> Default Payment Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary block mb-1">Default Settlement Method</label>
                <select
                  disabled={!isWorkshopAdmin}
                  value={defaultMethod}
                  onChange={e => setDefaultMethod(e.target.value as any)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50"
                >
                  <option value="Cash">Cash (Manual)</option>
                  <option value="UPI">UPI QR (Online)</option>
                  <option value="Razorpay">Razorpay (Gateway)</option>
                  <option value="Card">Card Swipe (POS)</option>
                  <option value="Bank Transfer">Bank Transfer (Manual)</option>
                </select>
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Invoice Payment Notes / Terms</label>
                <textarea
                  disabled={!isWorkshopAdmin}
                  rows={2}
                  value={termsAndConditions}
                  onChange={e => setTermsAndConditions(e.target.value)}
                  placeholder="Warranty and service guidelines displayed on invoice footer..."
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-text-primary focus:outline-none focus:border-cyan-500 text-xs disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Transaction Logs Audit */}
          <div className="glass-panel p-5 space-y-4 border-cyan-500/20 relative overflow-hidden">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3">
              <Activity size={15} className="text-cyan-400" /> Business Collection Logs
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {paymentAuditLogs.filter(log => log.tenantDomain === activeTenant).map((log) => {
                const badgeColor = {
                  'Paid': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                  'Pending': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
                  'Failed': 'bg-red-500/10 text-red-400 border border-red-500/20',
                  'Partially Paid': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }[log.status || 'Paid'];

                return (
                  <div key={log.id} className="flex justify-between items-center p-3 rounded-lg border border-border-card bg-white/[0.01] font-mono text-[10px] text-text-secondary hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-text-primary font-bold">{log.invoiceNumber}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/5 border border-border-card text-text-secondary">{log.paymentMethod}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-text-primary">₹{log.amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-[5px] text-[8px] font-bold uppercase ${badgeColor}`}>{log.status}</span>
                    </div>
                  </div>
                );
              })}
              {paymentAuditLogs.filter(log => log.tenantDomain === activeTenant).length === 0 && (
                <p className="text-text-muted font-mono text-center py-6">No online transaction logs registered for this business.</p>
              )}
            </div>
          </div>

          {/* Form save button */}
          {isWorkshopAdmin && (
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/15 active:scale-95 transition-all cursor-pointer"
            >
              <Save size={16} /> Save Payment Integration Settings
            </button>
          )}
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="glass-panel p-5">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 border-b border-border-card pb-3 mb-4">
              <Bell size={15} className="text-[var(--color-primary)]" /> Message Center
            </h3>
            
            <div className="space-y-4">
              {myAnnouncements.map((ann) => {
                const colors = {
                  announcement: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
                  maintenance: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
                  alert: 'border-red-500/20 bg-red-500/5 text-red-400'
                };
                
                const isAcked = ann.acknowledgements?.some(ack => ack.tenantDomain === activeTenant);
                
                return (
                  <div key={ann.id} className="border border-border-card bg-white/[0.01] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors[ann.type as keyof typeof colors]}`}>
                          {ann.type === 'alert' ? <AlertCircle size={14} /> : ann.type === 'maintenance' ? <Clock size={14} /> : <Megaphone size={14} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary text-sm">{ann.title}</h4>
                          <span className="text-[10px] text-text-muted font-mono">
                            Received: {new Date(ann.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${isAcked ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-orange-500/20 text-orange-400 bg-orange-500/5'}`}>
                        {isAcked ? 'Acknowledged' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary leading-relaxed pl-11">
                      {ann.message}
                    </div>
                  </div>
                );
              })}
              
              {myAnnouncements.length === 0 && (
                <div className="text-center text-xs text-text-muted py-10 font-mono">
                  No announcements or messages found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success logs toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle size={15} className="text-[var(--color-primary)] animate-bounce" />
          <span className="text-xs font-semibold text-text-primary">{successToast}</span>
        </div>
      )}
    </div>
  );
};
