import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Save, 
  Lock, 
  Unlock,
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  Receipt, 
  BarChart3, 
  ArrowRight,
  ChevronRight,
  Package
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import type { PermissionRule } from '../../data/seedData';

export const Permissions: React.FC = () => {
  const { permissionRules, updatePermissionRules } = useDatabase();
  const [localRules, setLocalRules] = useState<PermissionRule[]>(JSON.parse(JSON.stringify(permissionRules)));
  const [toastMsg, setToastMsg] = useState('');
  
  // Selected role for the live mobile screen preview
  const [previewRole, setPreviewRole] = useState<string>('Mechanic');

  // Global System locks state
  const [invoiceLock, setInvoiceLock] = useState(true);
  const [priceEditingLock, setPriceEditingLock] = useState(true);
  const [stockDeductionControl, setStockDeductionControl] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCellToggle = (
    roleName: string, 
    category: 'billing' | 'inventory' | 'reports' | 'invoices' | 'dashboard', 
    field: string
  ) => {
    setLocalRules(prev => prev.map(rule => {
      if (rule.role === roleName) {
        const catObj = { ...rule[category] } as any;
        catObj[field] = !catObj[field];
        return {
          ...rule,
          [category]: catObj
        };
      }
      return rule;
    }));
  };

  const handleSave = () => {
    updatePermissionRules(localRules);
    triggerToast('Role-based access matrix successfully saved!');
  };

  const activePreviewRule = useMemo(() => {
    return localRules.find(r => r.role === previewRole) || localRules[0];
  }, [localRules, previewRole]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <Shield className="text-[var(--color-primary)]" size={28} /> Global Access Policies
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
            Configure Tenant RBAC matrices, visual permissions trees, and global module overrides
          </p>
        </div>

        <button 
          onClick={handleSave}
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all self-start sm:self-center cursor-pointer"
        >
          <Save size={16} /> Save Security Policies
        </button>
      </div>

      {/* Warning Notice Box */}
      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-3">
        <AlertTriangle className="text-[var(--color-secondary)] shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="font-bold text-xs text-text-primary">System Security Override</h4>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            Role-Based Access Control matrix maps capabilities dynamically. Toggling access gates here will lock corresponding components inside standard tenant screens instantly.
          </p>
        </div>
      </div>

      {/* ROLE HIERARCHY TREE VISUALIZATION */}
      <div className="glass-panel p-5 border-border-card space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
          <ShieldCheck className="text-cyan-400" size={15} /> Platform Role hierarchy structures
        </h3>

        {/* Tree Grid nodes */}
        <div className="grid grid-cols-5 gap-3 relative text-center pt-2 font-mono text-[10px] font-bold text-text-muted">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-500/20 bg-purple-950/5 relative">
            <span className="text-lg mb-1">👑</span>
            <span className="text-purple-400 font-semibold block uppercase">Super Admin</span>
            <span className="text-[8px] text-gray-600 block mt-0.5">Platform Owner</span>
          </div>
          
          <div className="flex items-center justify-center text-cyan-400">
            <ArrowRight size={18} className="animate-pulse" />
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/5 relative">
            <span className="text-lg mb-1">⚙️</span>
            <span className="text-cyan-400 font-semibold block uppercase">Business Admin</span>
            <span className="text-[8px] text-gray-600 block mt-0.5">Full Tenant Access</span>
          </div>

          <div className="flex items-center justify-center text-cyan-400">
            <ArrowRight size={18} className="animate-pulse" />
          </div>

          <div className="grid grid-rows-3 gap-2 w-full">
            <div className="flex items-center justify-center p-1.5 rounded-lg border border-orange-500/10 bg-orange-950/5 text-orange-400">
              Manager
            </div>
            <div className="flex items-center justify-center p-1.5 rounded-lg border border-emerald-500/10 bg-emerald-950/5 text-emerald-400">
              Advisor / Accountant
            </div>
            <div className="flex items-center justify-center p-1.5 rounded-lg border border-border-card bg-white/[0.01] text-text-secondary">
              Staff / Reception
            </div>
          </div>
        </div>
      </div>

      {/* Global Module Lock Override Switches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-4 flex justify-between items-center border-border-card">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5"><Lock size={13} /> Invoice Editing Lock</h4>
            <p className="text-[10px] text-text-muted">Prevent editing invoices once issued and paid.</p>
          </div>
          <button 
            onClick={() => setInvoiceLock(!invoiceLock)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${invoiceLock ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${invoiceLock ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="glass-panel p-4 flex justify-between items-center border-border-card">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5"><Lock size={13} /> Price Editing Lock</h4>
            <p className="text-[10px] text-text-muted">Only Admins can override parts pricing during checkout.</p>
          </div>
          <button 
            onClick={() => setPriceEditingLock(!priceEditingLock)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${priceEditingLock ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${priceEditingLock ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="glass-panel p-4 flex justify-between items-center border-border-card">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5"><Lock size={13} /> Stock Override Lock</h4>
            <p className="text-[10px] text-text-muted">Block checking out if inventory stock levels are zero.</p>
          </div>
          <button 
            onClick={() => setStockDeductionControl(!stockDeductionControl)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${stockDeductionControl ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${stockDeductionControl ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* MATRIX & LIVE PHONE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkbox Matrix editor (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel border-border-card overflow-hidden">
            <div className="p-4 border-b border-border-card flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">Role Permissions Matrix</h3>
              <span className="text-[9px] font-mono text-text-muted">TOGGLE CAPABILITIES</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-card text-text-muted bg-white/[0.02] font-semibold">
                    <th className="p-4">User Role</th>
                    <th className="p-4 text-center">Billing Read</th>
                    <th className="p-4 text-center">Billing Create</th>
                    <th className="p-4 text-center">Billing Edit</th>
                    <th className="p-4 text-center">Billing Delete</th>
                    <th className="p-4 text-center">Inventory Edit</th>
                    <th className="p-4 text-center">Inventory Delete</th>
                    <th className="p-4 text-center">P&L Reports</th>
                    <th className="p-4 text-center">Invoices Approve</th>
                    <th className="p-4 text-center">Dashboard Read</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-text-primary">
                  {localRules.map((rule) => {
                    const isSuper = rule.role === 'Super Admin';
                    const isSelected = rule.role === previewRole;
                    
                    return (
                      <tr 
                        key={rule.role} 
                        onClick={() => setPreviewRole(rule.role)}
                        className={`hover:bg-white/[0.01] transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-500/[0.03] border-l-2 border-[var(--color-primary)]' : ''
                        }`}
                      >
                        <td className="p-4 font-bold text-text-primary flex items-center gap-1.5">
                          {rule.role}
                          {isSelected && <ChevronRight size={12} className="text-[var(--color-primary)]" />}
                        </td>
                        
                        {/* Billing Read */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.billing.read}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'billing', 'read')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* Billing Create */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.billing.create}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'billing', 'create')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* Billing Edit */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.billing.edit}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'billing', 'edit')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* Billing Delete */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.billing.delete}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'billing', 'delete')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* Inventory Edit */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.inventory.edit}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'inventory', 'edit')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* Inventory Delete */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.inventory.delete}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'inventory', 'delete')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* P&L Reports */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.reports.read}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'reports', 'read')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* Invoices Approve */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.invoices.approve}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'invoices', 'approve')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        
                        {/* Dashboard Read */}
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={rule.dashboard.read}
                            disabled={isSuper}
                            onChange={() => handleCellToggle(rule.role, 'dashboard', 'read')}
                            className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer disabled:opacity-40"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live UI Mobile phone Screen Preview (1 column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Live permission UI preview</span>
            <select 
              value={previewRole}
              onChange={e => setPreviewRole(e.target.value)}
              className="bg-[#0b0d16] border border-border-card rounded px-2.5 py-1 text-[10px] font-bold text-cyan-400 focus:outline-none cursor-pointer"
            >
              {localRules.map(r => (
                <option key={r.role} value={r.role}>{r.role}</option>
              ))}
            </select>
          </div>

          {/* Styled Phone chassis mockup */}
          <div className="w-full max-w-[280px] h-[480px] mx-auto border-8 border-gray-800 rounded-[36px] bg-bg-card relative shadow-2xl overflow-hidden flex flex-col justify-between p-3.5">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-gray-800 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-bg-card mr-1" />
              <div className="w-8 h-1 rounded-full bg-black/20" />
            </div>

            {/* Status bar */}
            <div className="flex justify-between items-center text-[8px] text-text-muted font-mono pt-1 pb-2 border-b border-border-card z-10">
              <span>09:41 AM</span>
              <span className="flex items-center gap-1">5G 🔋</span>
            </div>

            {/* Mocked Workspace Menu links */}
            <div className="flex-1 py-4 space-y-3 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-gray-600 block uppercase tracking-widest pl-2">Client Workspace</span>

              {/* Invoicing Terminal Link */}
              <div className="p-2.5 rounded-xl border border-border-card bg-white/[0.01] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-primary">
                  <Receipt size={12} className="text-cyan-400" /> POS Billing
                </span>
                {!activePreviewRule.billing.read ? (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5"><Lock size={8} /> Hidden</span>
                ) : !activePreviewRule.billing.create ? (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-0.5"><Eye size={8} /> View Only</span>
                ) : (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5"><Unlock size={8} /> Granted</span>
                )}
              </div>

              {/* Inventory spares link */}
              <div className="p-2.5 rounded-xl border border-border-card bg-white/[0.01] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-primary">
                  <Package size={12} className="text-orange-400" /> Inventory Spares
                </span>
                {!activePreviewRule.inventory.read ? (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5"><Lock size={8} /> Hidden</span>
                ) : !activePreviewRule.inventory.edit ? (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-0.5"><Eye size={8} /> View Only</span>
                ) : (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5"><Unlock size={8} /> Granted</span>
                )}
              </div>

              {/* Reports Ledger Link */}
              <div className="p-2.5 rounded-xl border border-border-card bg-white/[0.01] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-primary">
                  <BarChart3 size={12} className="text-purple-400" /> Reports Ledger
                </span>
                {!activePreviewRule.reports.read ? (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5"><Lock size={8} /> Restricted</span>
                ) : (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5"><Unlock size={8} /> Active</span>
                )}
              </div>

              {/* Dashboard Analytics Link */}
              <div className="p-2.5 rounded-xl border border-border-card bg-white/[0.01] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-primary">
                  <BarChart3 size={12} className="text-purple-400" /> Dashboard Analytics
                </span>
                {!activePreviewRule.dashboard.read ? (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5"><Lock size={8} /> Locked</span>
                ) : (
                  <span className="text-[7px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5"><Unlock size={8} /> Active</span>
                )}
              </div>
            </div>

            {/* Bottom device bar */}
            <div className="w-full flex flex-col items-center pt-2">
              <span className="text-[7px] font-mono text-gray-600 block mb-1">Simulated Preview for {previewRole}</span>
              <div className="w-24 h-1 bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-emerald-500 px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
