import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Laptop, 
  X, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const StaffManagement: React.FC = () => {
  const { mechanics } = useDatabase();
  const [toastMsg, setToastMsg] = useState('');

  // Password reset dialog state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{ id: string; name: string } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Mock Active Sessions tracking
  const deviceHistory = [
    { user: 'Alex Rivera', role: 'Mechanic', device: 'iPhone 15 / Safari', ip: '192.168.1.12', time: '10 mins ago', location: 'Main Bay' },
    { user: 'Steve Austin', role: 'Business Admin', device: 'Windows PC / Chrome', ip: '192.168.1.45', time: '2 mins ago', location: 'Office' },
    { user: 'Marcus Chen', role: 'Mechanic', device: 'iPad Pro / Chrome', ip: '192.168.1.18', time: '1 hr ago', location: 'Bay 2' },
    { user: 'Markus Aurelius', role: 'Super Admin', device: 'MacBook Pro / Safari', ip: '192.168.1.100', time: 'Active now', location: 'Platform Admin' }
  ];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePasswordReset = (id: string, name: string) => {
    setSelectedStaff({ id, name });
    // Generate a secure temp password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';
    let tempPass = '';
    for (let i = 0; i < 10; i++) {
      tempPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(tempPass);
    setResetModalOpen(true);
  };

  const confirmPasswordReset = () => {
    triggerToast(`Password successfully reset for ${selectedStaff?.name}! Temporary credentials saved.`);
    setResetModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
          Staff & Session Directory
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
          Oversee platform-wide users, issue credential resets, and monitor active user sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Staff directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Active Staff Members</h3>
            <span className="text-[10px] text-text-muted font-mono">Synced to local databases</span>
          </div>

          <div className="glass-panel border-border-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-card text-text-muted bg-white/[0.02]">
                    <th className="p-4 font-semibold">User Details</th>
                    <th className="p-4 font-semibold">Assigned Role</th>
                    <th className="p-4 font-semibold">Status / Shifts</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-text-primary">
                  {/* Super admin user representation */}
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm">👑</div>
                      <div>
                        <h4 className="font-bold text-text-primary">Markus Aurelius</h4>
                        <span className="text-[10px] text-text-muted font-mono">zenwar_admin@zenwar.com</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-purple-500/30 text-purple-400 bg-purple-500/5 uppercase font-mono">Super Admin</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Present</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] text-gray-600 font-mono">System Owner</span>
                    </td>
                  </tr>

                  {/* Seed Mechanics representations */}
                  {mechanics.map((mech) => (
                    <tr key={mech.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-sm">{mech.avatar}</div>
                        <div>
                          <h4 className="font-bold text-text-primary">{mech.name}</h4>
                          <span className="text-[10px] text-text-muted font-mono">{mech.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 uppercase font-mono">{mech.role}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 ${
                          mech.attendance === 'Present' 
                            ? 'text-emerald-400' 
                            : mech.attendance === 'Late'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            mech.attendance === 'Present' 
                              ? 'bg-emerald-400' 
                              : mech.attendance === 'Late'
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`} />
                          {mech.attendance}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handlePasswordReset(mech.id, mech.name)}
                          className="px-2.5 py-1 bg-white/5 border border-border-card hover:border-[var(--color-primary)] text-text-primary hover:text-[var(--color-primary)] rounded font-semibold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Key size={11} /> Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Columns: Active Sessions tracking */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-1.5">
              <Laptop size={15} className="text-cyan-400 animate-pulse" /> Active Device Sessions
            </h3>
            <span className="text-[9px] font-mono text-text-muted">LIVE SESSIONS</span>
          </div>

          <div className="glass-panel border-border-card p-4 space-y-3.5">
            {deviceHistory.map((dev, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border-card bg-white/[0.01] text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-text-primary">{dev.user}</h4>
                    <span className="text-[10px] text-text-muted font-mono uppercase">{dev.role}</span>
                  </div>
                  <span className="text-[9px] text-[var(--color-primary)] font-bold bg-[var(--color-primary-glow)]/10 px-2 py-0.5 rounded font-mono">
                    {dev.time}
                  </span>
                </div>
                <div className="pt-2 border-t border-border-card flex justify-between items-center text-[10px] text-text-muted font-mono">
                  <span>Device: <strong>{dev.device}</strong></span>
                  <span>IP: <strong>{dev.ip}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: PASSWORD RESET DETAILS */}
      <AnimatePresence>
        {resetModalOpen && selectedStaff && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 border-border-card max-w-sm w-full relative space-y-5"
            >
              <button 
                onClick={() => setResetModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                  <Lock size={20} />
                </div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display mt-3">Reset Staff Credentials</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">Generate temporary one-time password bypass credentials for <strong>{selectedStaff.name}</strong></p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a0c14] border border-border-card text-center space-y-1">
                <span className="text-[9px] text-text-muted font-mono tracking-widest uppercase block">TEMPORARY CODE</span>
                <span className="text-lg font-mono font-bold text-[var(--color-primary)] tracking-wide">{generatedPassword}</span>
              </div>

              <div className="flex gap-2 text-xs font-semibold">
                <button 
                  onClick={() => setResetModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmPasswordReset}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold transition-all shadow-md cursor-pointer"
                >
                  Apply & Send SMS
                </button>
              </div>
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
