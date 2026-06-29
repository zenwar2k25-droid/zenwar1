import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  X,
  ShieldAlert
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const SecurityCenter: React.FC = () => {
  const { saBackups, createSaBackup, restoreSaBackup, deleteSaBackup } = useDatabase();
  const [toastMsg, setToastMsg] = useState('');
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [newBackupName, setNewBackupName] = useState('');

  // 2FA Security Switches
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [ipRestrictedMode, setIpRestrictedMode] = useState(false);

  // Simulated IP blacklist registry
  const [bannedIps, setBannedIps] = useState<string[]>(['103.24.51.12', '185.220.101.44']);
  const [newIpToBan, setNewIpToBan] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCreateBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBackupName) return;

    createSaBackup(newBackupName);
    triggerToast(`Database backup snapshot "${newBackupName}.sql" created successfully!`);
    setNewBackupName('');
    setBackupModalOpen(false);
  };

  const handleRestore = (id: string, name: string) => {
    restoreSaBackup(id);
    triggerToast(`System state restored successfully to backup point: ${name}`);
  };

  const handleDelete = (id: string, name: string) => {
    deleteSaBackup(id);
    triggerToast(`Backup file "${name}" deleted.`);
  };

  const handleBanIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpToBan) return;
    if (bannedIps.includes(newIpToBan)) {
      triggerToast('IP address is already banned.');
      return;
    }
    setBannedIps([...bannedIps, newIpToBan]);
    triggerToast(`IP ${newIpToBan} successfully blacklisted.`);
    setNewIpToBan('');
  };

  const handleUnbanIp = (ip: string) => {
    setBannedIps(bannedIps.filter(item => item !== ip));
    triggerToast(`Banned IP ${ip} released.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
          <ShieldCheck className="text-[var(--color-primary)]" size={28} /> Platform Security Center
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
          Orchestrate automated database backups, enforce multi-factor authentication (2FA), and manage IP restrictions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Security Enforcements */}
        <div className="space-y-6 lg:col-span-1">
          {/* Policy Settings */}
          <div className="glass-panel p-5 border-border-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
              <Lock className="text-cyan-400" size={16} /> Security Policies
            </h3>

            <div className="space-y-4 text-xs font-semibold text-text-secondary">
              {/* Enforce 2FA Switch */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-text-primary block">Enforce 2FA Verification</span>
                  <span className="text-[10px] text-text-muted font-mono">SMS/Email OTP on admin logins</span>
                </div>
                <button 
                  onClick={() => setMfaEnforced(!mfaEnforced)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${mfaEnforced ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${mfaEnforced ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Session timeout */}
              <div>
                <label className="block mb-1.5">Max Session Timeout</label>
                <select
                  value={sessionTimeout}
                  onChange={e => setSessionTimeout(e.target.value)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="15m">15 Minutes of Inactivity</option>
                  <option value="30m">30 Minutes of Inactivity</option>
                  <option value="1h">1 Hour of Inactivity</option>
                  <option value="12h">12 Hours of Inactivity</option>
                </select>
              </div>

              {/* IP Restricted login mode */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-text-primary block">Restricted IP Address mode</span>
                  <span className="text-[10px] text-text-muted font-mono">Block login attempts from outside whitelists</span>
                </div>
                <button 
                  onClick={() => setIpRestrictedMode(!ipRestrictedMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${ipRestrictedMode ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${ipRestrictedMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* IP Blacklist Manager */}
          <div className="glass-panel p-5 border-border-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
              <ShieldAlert className="text-red-400" size={16} /> IP Blacklist Controls
            </h3>

            <form onSubmit={handleBanIp} className="flex gap-2">
              <input 
                type="text"
                required
                value={newIpToBan}
                onChange={e => setNewIpToBan(e.target.value)}
                placeholder="e.g. 192.168.1.99"
                className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-600"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Ban
              </button>
            </form>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
              {bannedIps.map(ip => (
                <div key={ip} className="flex justify-between items-center p-2.5 rounded-xl border border-border-card bg-white/[0.01]">
                  <span className="font-mono text-text-primary">{ip}</span>
                  <button 
                    onClick={() => handleUnbanIp(ip)}
                    className="text-[10px] text-text-muted hover:text-text-primary hover:underline cursor-pointer"
                  >
                    Release Ban
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns: Backups manager */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
              <Database className="text-cyan-400" size={16} /> Database Snapshot Backups ({saBackups.length})
            </h3>
            
            <button 
              onClick={() => setBackupModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-[10px] uppercase rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={14} /> Create Snapshot
            </button>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {saBackups.map((bak) => (
              <div 
                key={bak.id}
                className="glass-panel p-4 border border-border-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-cyan-500/20 transition-all"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-text-muted" />
                    <h4 className="font-bold text-text-primary font-mono">{bak.name}</h4>
                  </div>
                  <div className="flex gap-4 text-[10px] text-text-muted font-mono">
                    <span>Date: {new Date(bak.dateCreated).toLocaleString()}</span>
                    <span>Size: {bak.sizeKb} KB</span>
                    <span>Release: {bak.version}</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleRestore(bak.id, bak.name)}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white/5 border border-border-card hover:border-cyan-500/30 text-text-primary hover:text-cyan-400 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RefreshCw size={11} /> Restore
                  </button>
                  <button 
                    onClick={() => handleDelete(bak.id, bak.name)}
                    className="p-2 bg-white/5 border border-border-card hover:border-red-500/30 text-text-muted hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: CREATE SNAPSHOT BACKUP */}
      <AnimatePresence>
        {backupModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 border-border-card max-w-sm w-full relative space-y-4"
            >
              <button 
                onClick={() => setBackupModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
                <Database className="text-[var(--color-primary)]" size={18} /> Create Database Backup
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Generate an encrypted SQL snapshot backup of the current database models (Businesses, Invoices, Job Cards, and Context states).
              </p>

              <form onSubmit={handleCreateBackup} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">SNAPSHOT FILENAME *</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      value={newBackupName}
                      onChange={e => setNewBackupName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder="e.g. zenwar_snapshot_manual"
                      className="w-full bg-bg-card border border-border-card rounded-xl pl-4 pr-12 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">.sql</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => setBackupModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs hover:bg-hover-bg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    Generate Backup
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
