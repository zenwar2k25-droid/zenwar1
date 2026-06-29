import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Save, 
  Key, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  LogOut, 
  Eye, 
  EyeOff, 
  Lock, 
  Fingerprint
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const Profile: React.FC = () => {
  const { 
    saCredentials, 
    updateSaCredentials, 
    logoutAllSaDevices, 
    addSaAuditLog 
  } = useDatabase();

  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Profile fields state
  const [saUsername, setSaUsername] = useState(saCredentials.username || 'zenwar_admin');
  const [saEmail, setSaEmail] = useState(saCredentials.email || 'zenwar_admin@zenwar.com');
  const [saPhone, setSaPhone] = useState(saCredentials.phone || '+1 (555) 100-3000');

  // Password fields state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Modals state
  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [reAuthPassword, setReAuthPassword] = useState('');
  const [reAuthAction, setReAuthAction] = useState<'profile' | 'password' | null>(null);

  // 2FA variables
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(saCredentials.twoFactorEnabled || false);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [mfaOtp, setMfaOtp] = useState('');
  const [mfaError, setMfaError] = useState('');

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Password strength check
  const strengthResult = useMemo(() => {
    if (!newPassword) return { score: 0, text: 'Empty', color: 'bg-white/10', textColor: 'text-text-muted' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score += 1;
    
    if (score <= 1) return { score, text: 'Weak Security', color: 'bg-red-500/80', textColor: 'text-red-400' };
    if (score <= 3) return { score, text: 'Medium Strength', color: 'bg-orange-500/80', textColor: 'text-orange-400' };
    return { score, text: 'Strong Credentials', color: 'bg-emerald-400', textColor: 'text-emerald-400' };
  }, [newPassword]);

  // Open re-auth modal prior to modifying credentials
  const initiateSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setReAuthAction('profile');
    setReAuthPassword('');
    setReAuthOpen(true);
  };

  const initiateSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      triggerToast('Error: Passwords do not match.', 'error');
      return;
    }
    if (strengthResult.score < 2) {
      triggerToast('Error: New password is too weak.', 'error');
      return;
    }
    setReAuthAction('password');
    setReAuthPassword('');
    setReAuthOpen(true);
  };

  // Process verified saving
  const handleVerifyReAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (reAuthPassword !== saCredentials.password) {
      triggerToast('Error: Invalid current password verification.', 'error');
      return;
    }
    
    setReAuthOpen(false);

    if (reAuthAction === 'profile') {
      updateSaCredentials({
        username: saUsername,
        email: saEmail,
        phone: saPhone
      });
      addSaAuditLog('Super Admin Profile Edit', `Updated username/email/mobile for ${saUsername}`);
      triggerToast('Profile contact details updated successfully.');
    } else if (reAuthAction === 'password') {
      updateSaCredentials({
        password: newPassword
      });
      addSaAuditLog('Super Admin Password Reset', 'Updated authentication credentials passkey');
      
      // Clear inputs
      setNewPassword('');
      setConfirmPassword('');
      
      triggerToast('Authentication credentials updated successfully.');
    }
    
    setReAuthAction(null);
  };

  // Toggle 2FA switch
  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      // Disabling
      updateSaCredentials({ twoFactorEnabled: false });
      setTwoFactorEnabled(false);
      addSaAuditLog('2FA Protection Disabled', 'Super Admin multi-factor auth disabled');
      triggerToast('Multi-Factor Authentication disabled.');
    } else {
      // Setup flow
      setMfaOtp('');
      setMfaError('');
      setMfaSetupOpen(true);
    }
  };

  const handleVerifyMfaSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaOtp !== '240255') {
      setMfaError('Incorrect verification token. Enter code 240255 to verify.');
      return;
    }
    updateSaCredentials({ twoFactorEnabled: true });
    setTwoFactorEnabled(true);
    setMfaSetupOpen(false);
    addSaAuditLog('2FA Protection Enforced', 'Super Admin dynamic OTP verification enabled');
    triggerToast('Multi-Factor Authentication enforced successfully!');
  };

  const handleLogoutOthers = () => {
    logoutAllSaDevices();
    addSaAuditLog('Forced Sessions Logout', 'Super Admin terminated all other active device states');
    triggerToast('Terminated all other active device sessions.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
          <Fingerprint className="text-[var(--color-primary)]" size={28} /> Cybersecurity & Identity Console
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
          Configure multi-factor tokens, update administrative credentials, and audit active sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & 2FA (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Form */}
          <div className="glass-panel p-5 border-border-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-1.5">
              <User size={16} className="text-cyan-400" /> Administrative Identity
            </h3>

            <form onSubmit={initiateSaveProfile} className="space-y-4 text-xs font-semibold text-text-secondary">
              <div>
                <label className="block mb-1">SUPER ADMIN USERNAME *</label>
                <input 
                  type="text"
                  required
                  value={saUsername}
                  onChange={e => setSaUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block mb-1">EMAIL ADDRESS *</label>
                <input 
                  type="email"
                  required
                  value={saEmail}
                  onChange={e => setSaEmail(e.target.value)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block mb-1">SECURE MOBILE PHONE *</label>
                <input 
                  type="text"
                  required
                  value={saPhone}
                  onChange={e => setSaPhone(e.target.value)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold py-2.5 rounded-xl shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Save size={14} /> Update Contact Info
              </button>
            </form>
          </div>

          {/* 2FA Protection */}
          <div className="glass-panel p-5 border-border-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-1.5">
                <Smartphone className="text-cyan-400" size={16} /> Multi-Factor Auth (2FA)
              </h3>
              <button 
                onClick={handleToggle2FA}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${twoFactorEnabled ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <p className="text-[11px] text-text-muted leading-normal">
              Inject an additional layer of verification. Enabling requires scanning a TOTP setup token using your authentication device.
            </p>

            <div className="p-3.5 rounded-xl bg-white/[0.01] border border-border-card text-[11px] font-semibold flex items-center justify-between text-text-secondary">
              <span>OTP Mode:</span>
              <span className={`font-bold font-mono px-2 py-0.5 rounded ${twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-text-muted'}`}>
                {twoFactorEnabled ? 'TOTP ACTIVE' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Passwords & Active Logs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Change Password Card */}
          <div className="glass-panel p-5 border-border-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-1.5">
              <Key size={16} className="text-cyan-400" /> Passkey Configuration
            </h3>

            <form onSubmit={initiateSavePassword} className="space-y-4 text-xs font-semibold text-text-secondary">
              <div>
                <label className="block mb-1">NEW ACCESS CODE *</label>
                <div className="relative">
                  <input 
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>Entropy Check:</span>
                      <span className={`font-bold ${strengthResult.textColor}`}>{strengthResult.text}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 transition-all duration-300 ${strengthResult.score >= 1 ? strengthResult.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all duration-300 ${strengthResult.score >= 3 ? strengthResult.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 transition-all duration-300 ${strengthResult.score >= 4 ? strengthResult.color : 'bg-transparent'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1">CONFIRM NEW ACCESS CODE *</label>
                <div className="relative">
                  <input 
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-orange-600 hover:brightness-110 text-text-primary font-bold py-2.5 rounded-xl shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Key size={14} /> Update Access Password
              </button>
            </form>
          </div>

          {/* Sessions & Active Devices */}
          <div className="glass-panel p-5 border-border-card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-1.5">
                <Laptop className="text-cyan-400" size={16} /> Device Session Audit
              </h3>
              {saCredentials.loginActivity && saCredentials.loginActivity.length > 1 && (
                <button
                  onClick={handleLogoutOthers}
                  className="text-[10px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer font-bold uppercase font-mono"
                >
                  <LogOut size={12} /> Terminate Others
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {saCredentials.loginActivity && saCredentials.loginActivity.map((log: any) => (
                <div key={log.id} className="p-3 rounded-xl border border-border-card bg-white/[0.01] flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-text-primary flex items-center gap-1.5 font-mono">
                      {log.device.includes('iPhone') || log.device.includes('Android') ? <Smartphone size={13} className="text-cyan-400" /> : <Laptop size={13} className="text-cyan-400" />}
                      {log.device}
                    </h5>
                    <p className="text-[10px] text-text-muted font-mono">IP: {log.ip} • Near {log.location}</p>
                    <p className="text-[9px] text-gray-600 font-mono">Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border ${log.status === 'Active' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-border-card text-text-muted'}`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RE-AUTHENTICATION DRAWER MODAL */}
      <AnimatePresence>
        {reAuthOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 border-border-card max-w-sm w-full relative space-y-4"
            >
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
                <Lock className="text-[var(--color-primary)]" size={18} /> Credentials Unlock Check
              </h3>
              <p className="text-xs text-text-secondary leading-normal">
                To commit changes to Super Admin settings, please verify your current password.
              </p>

              <form onSubmit={handleVerifyReAuth} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">CURRENT PASSWORD *</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={reAuthPassword}
                      onChange={e => setReAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-10 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 text-xs font-bold">
                  <button 
                    type="button"
                    onClick={() => { setReAuthOpen(false); setReAuthAction(null); }}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    Unlock & Commit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MFA SETUP MODAL */}
      <AnimatePresence>
        {mfaSetupOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 border-border-card max-w-sm w-full relative space-y-4 bg-bg-app"
            >
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
                <Smartphone className="text-[var(--color-primary)]" size={18} /> Enforce 2FA Protection
              </h3>
              
              <div className="space-y-3 text-xs text-text-secondary">
                <p>1. Scan this QR Code with your Google Authenticator or Microsoft Authenticator app:</p>
                <div className="w-40 h-40 bg-white p-2.5 rounded-xl mx-auto flex items-center justify-center border border-border-card shadow-inner">
                  {/* High Fidelity QR Code mockup */}
                  <div className="w-full h-full bg-bg-card flex flex-col items-center justify-center text-center p-1 rounded-lg">
                    <span className="text-[10px] text-cyan-400 font-bold font-mono tracking-tighter">ZENWAR SECURE</span>
                    <span className="text-[8px] text-text-muted font-mono mt-0.5">SYSTEM/SUPERADMIN</span>
                    <div className="mt-2 text-xs">🔒 QR DATA TOKEN</div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-text-muted block">Or enter key manually:</span>
                  <code className="text-cyan-400 font-bold select-all tracking-wider font-mono">SGSA 4492 SYS LOCK</code>
                </div>
                <p className="pt-1">2. Enter the 6-digit verification OTP code generated by your app:</p>
              </div>

              {mfaError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold">
                  ⚠️ {mfaError}
                </div>
              )}

              <form onSubmit={handleVerifyMfaSetup} className="space-y-4">
                <input 
                  type="text"
                  maxLength={6}
                  required
                  value={mfaOtp}
                  onChange={e => setMfaOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Code: Type 240255 to verify"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-center text-sm text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono tracking-widest"
                />
                
                <div className="flex gap-2 text-xs font-bold">
                  <button 
                    type="button"
                    onClick={() => setMfaSetupOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    Verify & Active
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`fixed bottom-6 right-6 glass-panel px-4 py-3 shadow-2xl flex items-center gap-2 z-50 border ${
              toastMsg.type === 'error' ? 'border-red-500/40 text-red-400' : 'border-[var(--color-primary)] text-text-primary'
            }`}
          >
            <CheckCircle2 size={16} className={toastMsg.type === 'error' ? 'text-red-400' : 'text-[var(--color-primary)]'} />
            <span className="text-xs font-semibold">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
