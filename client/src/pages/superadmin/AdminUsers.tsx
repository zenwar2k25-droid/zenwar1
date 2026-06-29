import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Shield, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useModal } from '../../context/ModalContext';
import type { SuperAdminUser, SuperAdminRole, SuperAdminPermissions } from '../../data/seedData';

const ROLE_BADGES: Record<SuperAdminRole, { label: string; style: string }> = {
  owner: { label: '👑 OWNER SUPER ADMIN', style: 'border-[#ffcf30]/30 text-[#ffcf30] bg-[#ffcf30]/10 shadow-[0_0_10px_rgba(255,207,48,0.2)]' },
  operations: { label: 'Operations Lead', style: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
  support: { label: 'Support Operator', style: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
  billing: { label: 'Billing & Finance', style: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
  marketing: { label: 'Growth / Marketing', style: 'border-pink-500/20 text-pink-400 bg-pink-500/5' }
};

const PERMISSION_KEYS: { id: keyof SuperAdminPermissions; label: string; desc: string }[] = [
  { id: 'dashboard', label: 'Overview Metrics', desc: 'Allows viewing of platform-wide revenue graphs and tenant rosters summaries.' },
  { id: 'businesses', label: 'Business CRUD & Edit', desc: 'Allows provisioning new businesses, database schema clearance, and limits custom resets.' },
  { id: 'subscriptions', label: 'SaaS Plans Pricing', desc: 'Allows editing pricing plans, feature allocation grids, and package updates.' },
  { id: 'payments', label: 'Subscription Payments', desc: 'Allows access to billing ledger, manual refunds, and billing history inspection.' },
  { id: 'security', label: 'Platform Security Center', desc: 'Enables access to security logs, lock status parameters, and threat analysis.' },
  { id: 'settings', label: 'System Configuration', desc: 'Allows changing system landing page configuration, global gateway APIs, and webhooks.' },
  { id: 'activityLogs', label: 'Operator Audit Trails', desc: 'Grants log review privileges to track operations executed by administrators.' },
  { id: 'adminUsers', label: 'Super Admin Access', desc: 'Allows modifying Super Admin list, changing roles, and custom overrides.' },
  { id: 'staff', label: 'SaaS Staff Management', desc: 'Allows editing internal platform support staff accounts and assignments.' },
  { id: 'revenue', label: 'Financial Analytics', desc: 'Allows access to advanced revenue projections and subscription growth rates.' },
  { id: 'builder', label: 'Landing Page Builder', desc: 'Allows updating live sections of the landing page via CMS controls.' },
  { id: 'notifications', label: 'Global Notifications', desc: 'Allows dispatching notifications and announcements to businesses.' }
];

export const AdminUsers: React.FC = () => {
  const { 
    superAdminUsers, 
    addSuperAdminUser, 
    updateSuperAdminUser, 
    deleteSuperAdminUser,
    transferOwnership,
    getCurrentSaUser
  } = useDatabase();
  const { confirm } = useModal();
  
  const activeSaUser = getCurrentSaUser() || superAdminUsers[0];
  const isOwner = activeSaUser.role === 'owner';
  
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferUserId, setTransferUserId] = useState('');
  const [transferPassword, setTransferPassword] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SuperAdminUser | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<SuperAdminRole>('support');
  const [formStatus, setFormStatus] = useState<SuperAdminUser['status']>('Active');
  const [formPermissions, setFormPermissions] = useState<SuperAdminPermissions>({
    dashboard: false, businesses: false, permissions: false, staff: false,
    subscriptions: false, builder: false, revenue: false, payments: false,
    notifications: false, activityLogs: false, security: false, settings: false, adminUsers: false
  });

  const [formError, setFormError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filteredUsers = useMemo(() => {
    return superAdminUsers.filter(u => {
      if (!isOwner && u.role === 'owner') return false;
      return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [superAdminUsers, searchQuery, isOwner]);


  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormRole('support');
    setFormStatus('Active');
    setFormPermissions({
      dashboard: false, businesses: false, permissions: false, staff: false,
      subscriptions: false, builder: false, revenue: false, payments: false,
      notifications: false, activityLogs: false, security: false, settings: false, adminUsers: false
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (user: SuperAdminUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPermissions(user.permissions);
    setFormError('');
    setModalOpen(true);
  };

  const handleRoleChange = (role: SuperAdminRole) => {
    const wasOwner = formRole === 'owner';
    setFormRole(role);
    
    if (role === 'owner') {
      setFormPermissions({
        dashboard: true, businesses: true, permissions: true, staff: true,
        subscriptions: true, builder: true, revenue: true, payments: true,
        notifications: true, activityLogs: true, security: true, settings: true, adminUsers: true
      });
    } else if (wasOwner) {
      setFormPermissions({
        dashboard: false, businesses: false, permissions: false, staff: false,
        subscriptions: false, builder: false, revenue: false, payments: false,
        notifications: false, activityLogs: false, security: false, settings: false, adminUsers: false
      });
    }
    // If not transitioning from/to owner, keep current selections so user doesn't lose manual choices
  };

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
    setFormPassword(generated);
    triggerToast('Generated secure admin credentials password.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formUsername || !formEmail || !formPassword) {
      setFormError('Please complete all required fields.');
      return;
    }

    const duplicateUsername = superAdminUsers.some(u => 
      u.username.toLowerCase() === formUsername.toLowerCase() && 
      (!editingUser || u.id !== editingUser.id)
    );
    if (duplicateUsername) {
      setFormError('This username is already taken by another administrator.');
      return;
    }

    const duplicateEmail = superAdminUsers.some(u => 
      u.email.toLowerCase() === formEmail.toLowerCase() && 
      (!editingUser || u.id !== editingUser.id)
    );
    if (duplicateEmail) {
      setFormError('This email is already registered.');
      return;
    }

    if (editingUser) {
      updateSuperAdminUser(editingUser.id, {
        name: formName,
        username: formUsername,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        role: formRole,
        status: formStatus,
        permissions: formPermissions
      });
      triggerToast(`Successfully updated details for Admin ${formName}`);
    } else {
      addSuperAdminUser({
        name: formName,
        username: formUsername,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        role: formRole,
        status: formStatus,
        permissions: formPermissions,
        avatar: formRole === 'owner' ? '👑' : formRole === 'operations' ? '⚙' : formRole === 'support' ? '🎧' : '👤'
      });
      triggerToast(`SaaS Super Admin "${formName}" created successfully!`);
    }
    setModalOpen(false);
  };

  const handleTransferSubmit = () => {
    if (!transferUserId) return triggerToast('Please select an admin.');
    if (!transferPassword) return triggerToast('Password confirmation is required.');
    
    transferOwnership(transferUserId, transferPassword);
    triggerToast('Ownership transferred securely.');
    setTransferModalOpen(false);
    setTransferPassword('');
  };
  
  const handleDelete = async (user: SuperAdminUser) => {
    if (user.role === 'owner') {
      triggerToast('Error: Primary owner account cannot be deleted.');
      return;
    }
    if (user.id === activeSaUser.id) {
      triggerToast('Error: Cannot delete the currently logged in administrator.');
      return;
    }
    if (await confirm(`Are you absolutely sure you want to delete administrator account "${user.name}"? This action will immediately purge their credentials access.`)) {
      deleteSuperAdminUser(user.id);
      triggerToast(`Account for admin "${user.name}" deleted.`);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">


      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <Shield className="text-[var(--color-primary)]" size={28} /> Super Admin Security Roster
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
            Configure multi-admin credentials accounts, partition dashboard scopes, and audit custom permission matrices
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {isOwner && (
            <button 
              onClick={() => setTransferModalOpen(true)}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              Transfer Ownership
            </button>
          )}
          {isOwner && (
            <button 
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} /> Create Admin Account
            </button>
          )}
        </div>
      </div>

      {/* Searchbar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by admin name, email, username or role..." 
          className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)] text-text-primary font-medium"
        />
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const badge = ROLE_BADGES[user.role] || { label: 'Support Operator', style: 'border-border-card text-text-primary bg-white/5' };
          const isSuspended = user.status === 'Suspended' || user.status === 'Inactive';

          return (
            <div 
              key={user.id}
              className={`glass-panel p-5 relative border flex flex-col justify-between min-h-[280px] transition-all group ${
                isSuspended 
                  ? 'border-red-500/20 bg-red-950/5' 
                  : 'border-border-card hover:border-[var(--color-primary)]/40 hover:shadow-glow'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner overflow-hidden bg-white/5 border border-border-card shrink-0"
                    >
                      {user.avatar || '👤'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-text-primary truncate max-w-44">{user.name}</h3>
                      <span className="text-[10px] text-text-muted font-mono block">Username: @{user.username}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    user.status === 'Active' 
                      ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                      : 'border-red-500/20 text-red-400 bg-red-500/5'
                  }`}>
                    {user.status}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="mt-3.5">
                  <span className={`text-[9px] font-extrabold px-2 py-1 rounded border uppercase tracking-wider ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 pt-3.5 border-t border-border-card space-y-2 text-[11px] text-[var(--text-secondary)] font-semibold">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-text-primary truncate max-w-48 font-mono">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile:</span>
                    <span className="text-text-primary font-mono">{user.phone || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registered:</span>
                    <span className="text-text-primary font-mono">{user.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Login:</span>
                    <span className="text-text-primary font-mono">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Quick permissions preview */}
                <div className="mt-4 pt-3 border-t border-border-card space-y-1.5">
                  <span className="text-[9px] font-bold text-text-muted block uppercase tracking-wider">Scoped privileges</span>
                  <div className="flex flex-wrap gap-1">
                    {PERMISSION_KEYS.filter(p => user.permissions[p.id] === true).slice(0, 4).map(p => (
                      <span key={p.id} className="text-[8px] bg-white/5 border border-border-card rounded px-1.5 py-0.5 text-text-secondary font-medium">
                        {p.label.split(' ')[0]}
                      </span>
                    ))}
                    {Object.values(user.permissions).filter(Boolean).length > 4 && (
                      <span className="text-[8px] text-[var(--color-primary)] font-bold px-1 py-0.5">
                        +{Object.values(user.permissions).filter(Boolean).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-border-card flex gap-2">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-hover-bg text-text-primary font-bold text-[10px] uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-1 border border-border-card"
                >
                  <Edit2 size={11} /> Modify Profile
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  disabled={user.role === 'owner'}
                  className="p-2 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-text-primary rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-red-400"
                  title="Purge Administrator Credentials"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT ADMIN MODAL DRAWER */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-end text-left">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="glass-panel w-full max-w-2xl h-screen border-y-0 border-r-0 rounded-none p-6 overflow-y-auto space-y-6 flex flex-col justify-between bg-bg-app text-text-primary"
            >
              <div className="space-y-5 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-border-card shrink-0">
                  <div className="flex items-center gap-2">
                    <Shield className="text-[var(--color-primary)]" size={20} />
                    <h3 className="font-extrabold text-base text-text-primary">
                      {editingUser ? `Modify Admin Profile: ${editingUser.name}` : 'Provision Super Admin Account'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                    <AlertCircle size={14} /> {formError}
                  </div>
                )}

                {/* Form Elements */}
                <div className="flex-1 overflow-y-auto pr-1 py-1 text-xs space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary block mb-1">FULL NAME *</label>
                        <input 
                          type="text" 
                          required
                          value={formName}
                          onChange={e => setFormName(e.target.value)}
                          placeholder="e.g. John Miller"
                          className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary block mb-1">LOGIN USERNAME *</label>
                        <input 
                          type="text" 
                          required
                          value={formUsername}
                          onChange={e => setFormUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                          placeholder="e.g. jmiller"
                          className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary block mb-1">EMAIL ADDRESS *</label>
                        <input 
                          type="email" 
                          required
                          value={formEmail}
                          onChange={e => setFormEmail(e.target.value)}
                          placeholder="miller@zenwar.com"
                          className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary block mb-1">MOBILE CONTACT</label>
                        <input 
                          type="tel" 
                          value={formPhone}
                          onChange={e => setFormPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-text-secondary block">SECURITY PASSWORD *</label>
                          <button 
                            type="button"
                            onClick={handleGeneratePassword}
                            className="text-[9px] text-[var(--color-primary)] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Sparkles size={11} /> Generate
                          </button>
                        </div>
                        <input 
                          type="text" 
                          required
                          value={formPassword}
                          onChange={e => setFormPassword(e.target.value)}
                          placeholder="Choose secure password"
                          className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary block mb-1">ADMIN ROLE *</label>
                          <select 
                            value={formRole}
                            onChange={e => handleRoleChange(e.target.value as SuperAdminRole)}
                            disabled={editingUser?.role === 'owner'}
                            className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2.5 text-text-primary font-bold text-cyan-400 focus:outline-none cursor-pointer"
                          >
                            {isOwner && <option value="owner">Owner</option>}
                            <option value="operations">Operations</option>
                            <option value="support">Support</option>
                            <option value="billing">Billing</option>
                            <option value="marketing">Marketing</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary block mb-1">STATUS *</label>
                          <select 
                            value={formStatus}
                            onChange={e => setFormStatus(e.target.value as any)}
                            disabled={editingUser?.role === 'owner'}
                            className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2.5 text-text-primary font-bold text-orange-400 focus:outline-none cursor-pointer"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Permissions Matrix */}
                    <div className="p-4 bg-white/[0.02] border border-border-card rounded-xl space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 block uppercase tracking-wider">Super Admin Page Privileges Matrix</span>
                        <span className="text-[9px] text-text-muted block leading-tight mt-0.5">Toggle which modules this super admin is allowed to view and manage in the side roster panel.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                        {PERMISSION_KEYS.map(pk => {
                          const isChecked = formPermissions[pk.id] === true;

                          return (
                            <label 
                              key={pk.id} 
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                                isChecked 
                                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]/10 shadow-sm' 
                                  : 'border-border-card bg-white/[0.01] hover:border-border-card'
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                disabled={formRole === 'owner'} // Owner permissions always forced true
                                onChange={e => {
                                  setFormPermissions(prev => ({
                                    ...prev,
                                    [pk.id]: e.target.checked
                                  }));
                                }}
                                className="rounded border-border-card bg-bg-card text-[var(--color-primary)] focus:ring-0 cursor-pointer h-3.5 w-3.5 mt-0.5 disabled:opacity-55"
                              />
                              <div>
                                <strong className="text-[10.5px] text-text-primary block">{pk.label}</strong>
                                <span className="text-[8px] text-text-muted block leading-tight font-medium mt-0.5">{pk.desc}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      {formRole === 'owner' && (
                        <div className="p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[10px] font-semibold flex items-start gap-2">
                          <Info size={14} className="shrink-0 mt-0.5" />
                          <div>
                            <strong>Owner Unrestricted Access:</strong>
                            <span className="block mt-0.5 font-medium leading-relaxed">Owner accounts automatically have all permissions enabled and locked. Owner has unrestricted platform access.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3.5 pt-4 border-t border-border-card font-semibold shrink-0">
                      <button 
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg cursor-pointer text-center text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold cursor-pointer text-center text-xs"
                      >
                        Save Administrator account
                      </button>
                    </div>
                  </form>
                </div>
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
