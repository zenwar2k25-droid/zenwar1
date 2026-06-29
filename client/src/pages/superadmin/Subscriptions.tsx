import React, { useState } from 'react';
import { 
  Package, 
  HardDrive, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Edit,
  Power,
  X
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useModal } from '../../context/ModalContext';
import type { SubscriptionPlan, PlanModuleAccess } from '../../data/seedData';
import { motion, AnimatePresence } from 'framer-motion';

const defaultModuleAccess: PlanModuleAccess = {
  dashboard: true,
  billing: true,
  invoices: true,
  jobCards: true,
  customers: true,
  inventory: true,
  staffs: true,
  appointments: true,
  reports: true,
  settings: true,
  whatsapp: true,
  multiBranch: true,
  advancedAnalytics: true,
  apiAccess: true,
  paymentIntegration: true
};

export const Subscriptions: React.FC = () => {
  const { 
    subscriptionPlans, 
    addSubscriptionPlan, 
    updateSubscriptionPlan, 
    deleteSubscriptionPlan, 
    duplicateSubscriptionPlan 
  } = useDatabase();
  const { confirm, alert } = useModal();

  const [toastMsg, setToastMsg] = useState('');
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Feature text inputs
  const [newFeatureText, setNewFeatureText] = useState('');
  
  // State for temporary new plan form
  const [newPlanForm, setNewPlanForm] = useState<Omit<SubscriptionPlan, 'archived'>>({
    id: '',
    name: '',
    priceMonthly: 0,
    priceYearly: 0,
    maxUsers: 1,
    maxStorageMb: 100,
    maxInvoices: 100,
    trialDays: 14,
    whatsappCredits: 0,
    smsCredits: 0,
    customBranding: false,
    apiAccess: false,
    multiBranchSupport: false,
    features: [],
    badge: '',
    isPopular: false,
    enabled: true,
    trialEnabled: true,
    setupFee: 0,
    renewalAmount: 0,
    taxPercentage: 18,
    moduleAccess: defaultModuleAccess
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleTogglePlan = (plan: SubscriptionPlan) => {
    updateSubscriptionPlan(plan.id, { enabled: !plan.enabled });
    triggerToast(`Plan "${plan.name}" status updated successfully!`);
  };

  const handleDeletePlan = async (id: string) => {
    if (await confirm('Are you sure you want to delete this subscription plan? Existing businesses under this plan will remain but new signups will not be able to choose it.')) {
      deleteSubscriptionPlan(id);
      triggerToast('Subscription plan deleted from records.');
    }
  };

  const handleDuplicatePlan = (id: string) => {
    duplicateSubscriptionPlan(id);
    triggerToast('Duplicated subscription plan successfully (saved as inactive copy).');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updateSubscriptionPlan(editingPlan.id, editingPlan);
    setEditingPlan(null);
    triggerToast(`Plan "${editingPlan.name}" updated successfully.`);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.id || !newPlanForm.name) {
      await alert('Please fill out the Plan ID and Plan Name.');
      return;
    }
    
    // Check if ID is unique
    const exists = subscriptionPlans.some(p => p.id.toLowerCase() === newPlanForm.id.toLowerCase());
    if (exists) {
      await alert('Plan ID already exists. Please choose a unique alphanumeric identifier.');
      return;
    }

    addSubscriptionPlan(newPlanForm);
    setIsCreateModalOpen(false);
    // Reset form
    setNewPlanForm({
      id: '',
      name: '',
      priceMonthly: 0,
      priceYearly: 0,
      maxUsers: 1,
      maxStorageMb: 100,
      maxInvoices: 100,
      trialDays: 14,
      whatsappCredits: 0,
      smsCredits: 0,
      customBranding: false,
      apiAccess: false,
      multiBranchSupport: false,
      features: [],
      badge: '',
      isPopular: false,
      enabled: true,
      trialEnabled: true,
      setupFee: 0,
      renewalAmount: 0,
      taxPercentage: 18
    });
    triggerToast(`New Subscription Plan "${newPlanForm.name}" created!`);
  };

  const addFeature = (isEdit: boolean) => {
    if (!newFeatureText.trim()) return;
    if (isEdit && editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: [...editingPlan.features, newFeatureText.trim()]
      });
    } else {
      setNewPlanForm({
        ...newPlanForm,
        features: [...newPlanForm.features, newFeatureText.trim()]
      });
    }
    setNewFeatureText('');
  };

  const removeFeature = (isEdit: boolean, index: number) => {
    if (isEdit && editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: editingPlan.features.filter((_, i) => i !== index)
      });
    } else {
      setNewPlanForm({
        ...newPlanForm,
        features: newPlanForm.features.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-text-primary">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <Package className="text-[var(--color-primary)]" size={28} /> SaaS Subscription Hub
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
            Manage multi-tenant plans, allocate system quotas, messaging credits, and premium whitelabel limits.
          </p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all self-start sm:self-center cursor-pointer border-none"
        >
          <Plus size={16} /> Create Custom Plan
        </button>
      </div>

      {/* Plans Config Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => {
          const shadowGlow = plan.enabled 
            ? 'border-cyan-500/20 hover:border-cyan-400/50 shadow-cyan-500/5' 
            : 'border-border-card opacity-60';

          return (
            <div 
              key={plan.id}
              className={`glass-panel p-6 border flex flex-col justify-between min-h-[460px] transition-all group relative ${shadowGlow}`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 text-[9px] font-extrabold text-text-primary uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-lg text-text-primary flex items-center gap-2">
                      {plan.name}
                      {plan.isPopular && <Sparkles size={14} className="text-yellow-400" />}
                    </h3>
                    <span className="text-[9px] text-text-muted font-mono uppercase tracking-widest">{plan.id} plan</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePlan(plan)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${plan.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 border-border-card text-text-muted hover:text-text-primary'}`}
                      title={plan.enabled ? 'Deactivate Plan' : 'Activate Plan'}
                    >
                      <Power size={13} />
                    </button>
                  </div>
                </div>

                {/* Price indicators */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#0b0c14] border border-border-card">
                  <div>
                    <span className="text-[8px] text-text-muted font-mono block">MONTHLY</span>
                    <span className="text-sm font-extrabold text-text-primary">₹{plan.priceMonthly.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-text-muted font-mono block">YEARLY</span>
                    <span className="text-sm font-extrabold text-[var(--color-primary)]">₹{(plan.priceYearly/12).toFixed(0).toLocaleString()}/mo</span>
                  </div>
                </div>

                {/* Limit fields */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                    <span className="flex items-center gap-1.5"><HardDrive size={13} className="text-cyan-400" /> Storage Limit</span>
                    <span className="font-mono text-text-primary font-semibold">{plan.maxStorageMb >= 1024 ? `${(plan.maxStorageMb/1024).toFixed(0)} GB` : `${plan.maxStorageMb} MB`}</span>
                  </div>

                  <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                    <span className="flex items-center gap-1.5"><Users size={13} className="text-cyan-400" /> Users Limit</span>
                    <span className="font-mono text-text-primary font-semibold">{plan.maxUsers === 99 ? 'Unlimited' : `${plan.maxUsers} Users`}</span>
                  </div>

                  <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                    <span className="flex items-center gap-1.5"><Package size={13} className="text-cyan-400" /> Invoices Limit</span>
                    <span className="font-mono text-text-primary font-semibold">{plan.maxInvoices.toLocaleString()} /mo</span>
                  </div>

                  <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                    <span className="flex items-center gap-1.5"><MessageSquare size={13} className="text-cyan-400" /> WhatsApp & SMS</span>
                    <span className="font-mono text-text-primary font-semibold">{plan.whatsappCredits}/{plan.smsCredits} credits</span>
                  </div>

                  <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                    <span className="flex items-center gap-1.5 text-xs">Custom Branding</span>
                    <span className={`font-mono text-xs font-semibold ${plan.customBranding ? 'text-emerald-400' : 'text-text-muted'}`}>{plan.customBranding ? 'Whitelabel' : 'No'}</span>
                  </div>

                  <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                    <span className="flex items-center gap-1.5 text-xs">Trial Period</span>
                    <span className={`font-mono text-xs font-semibold ${plan.trialEnabled !== false ? 'text-cyan-400' : 'text-text-muted'}`}>
                      {plan.trialEnabled !== false ? `${plan.trialDays} Days` : 'Disabled'}
                    </span>
                  </div>

                  {plan.setupFee !== undefined && plan.setupFee > 0 && (
                    <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                      <span className="flex items-center gap-1.5 text-xs">Setup Fee</span>
                      <span className="font-mono text-text-primary font-semibold">₹{plan.setupFee.toLocaleString()}</span>
                    </div>
                  )}

                  {plan.renewalAmount !== undefined && plan.renewalAmount > 0 && (
                    <div className="flex justify-between items-center text-text-secondary border-b border-border-card pb-1.5">
                      <span className="flex items-center gap-1.5 text-xs">Renewal Amount</span>
                      <span className="font-mono text-text-primary font-semibold">₹{plan.renewalAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-text-secondary pb-1.5">
                    <span className="flex items-center gap-1.5 text-xs">Tax Rate</span>
                    <span className="font-mono text-text-primary font-semibold">{(plan.taxPercentage !== undefined ? plan.taxPercentage : 18)}% GST</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="pt-2 border-t border-border-card space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <span className="text-[9px] font-bold text-text-muted tracking-wider block">FEATURE SUITE</span>
                  {plan.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                    <span className="text-[10px] text-text-muted italic block pl-4">+{plan.features.length - 4} more features</span>
                  )}
                </div>
              </div>

              {/* Action Buttons panel */}
              <div className="pt-4 border-t border-border-card mt-4 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-hover-bg text-text-primary font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Edit size={12} /> Edit Plan
                </button>
                <button
                  onClick={() => handleDuplicatePlan(plan.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-hover-bg text-text-secondary hover:text-text-primary cursor-pointer border-none"
                  title="Duplicate Plan"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer border-none"
                  title="Delete Plan"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Form Modal - CREATE / EDIT */}
      <AnimatePresence>
        {(isCreateModalOpen || editingPlan) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-[#10121d] border border-border-card rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/10 text-text-primary"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingPlan(null);
                }}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary hover:bg-hover-bg rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary mb-6">
                {editingPlan ? `Configure: ${editingPlan.name}` : 'Create New Subscription Plan'}
              </h2>

              <form onSubmit={editingPlan ? handleSaveEdit : handleCreatePlan} className="space-y-6">
                {/* 1. Basic Fields */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Plan ID (Unique)</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingPlan}
                      value={editingPlan ? editingPlan.id : newPlanForm.id}
                      onChange={e => setNewPlanForm({ ...newPlanForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="e.g. advanced-pro"
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Plan Name</label>
                    <input
                      type="text"
                      required
                      value={editingPlan ? editingPlan.name : newPlanForm.name}
                      onChange={e => {
                        const val = e.target.value;
                        if (editingPlan) setEditingPlan({ ...editingPlan, name: val });
                        else setNewPlanForm({ ...newPlanForm, name: val });
                      }}
                      placeholder="e.g. Professional Hub"
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Badge Text (Optional)</label>
                    <input
                      type="text"
                      value={editingPlan ? (editingPlan.badge || '') : (newPlanForm.badge || '')}
                      onChange={e => {
                        const val = e.target.value;
                        if (editingPlan) setEditingPlan({ ...editingPlan, badge: val });
                        else setNewPlanForm({ ...newPlanForm, badge: val });
                      }}
                      placeholder="e.g. Best Offer"
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* 2. Pricing and Trial */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Monthly Cost (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.priceMonthly : newPlanForm.priceMonthly}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, priceMonthly: val });
                        else setNewPlanForm({ ...newPlanForm, priceMonthly: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Yearly Cost (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.priceYearly : newPlanForm.priceYearly}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, priceYearly: val });
                        else setNewPlanForm({ ...newPlanForm, priceYearly: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Trial Validity Days</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.trialDays : newPlanForm.trialDays}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, trialDays: val });
                        else setNewPlanForm({ ...newPlanForm, trialDays: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Setup Fee (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? (editingPlan.setupFee ?? 0) : (newPlanForm.setupFee ?? 0)}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, setupFee: val });
                        else setNewPlanForm({ ...newPlanForm, setupFee: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Renewal Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? (editingPlan.renewalAmount ?? 0) : (newPlanForm.renewalAmount ?? 0)}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, renewalAmount: val });
                        else setNewPlanForm({ ...newPlanForm, renewalAmount: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Tax Percentage (%)</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? (editingPlan.taxPercentage ?? 18) : (newPlanForm.taxPercentage ?? 18)}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, taxPercentage: val });
                        else setNewPlanForm({ ...newPlanForm, taxPercentage: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingPlan ? (editingPlan.trialEnabled ?? true) : (newPlanForm.trialEnabled ?? true)}
                        onChange={e => {
                          const val = e.target.checked;
                          if (editingPlan) setEditingPlan({ ...editingPlan, trialEnabled: val });
                          else setNewPlanForm({ ...newPlanForm, trialEnabled: val });
                        }}
                        className="rounded text-cyan-400 bg-black border-border-card w-4 h-4"
                      />
                      <span className="text-xs text-text-secondary">Enable Trial Period</span>
                    </label>
                  </div>
                </div>

                {/* 3. System Quotas */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Max Staff Users</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.maxUsers : newPlanForm.maxUsers}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, maxUsers: val });
                        else setNewPlanForm({ ...newPlanForm, maxUsers: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Max Storage Allocation (MB)</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.maxStorageMb : newPlanForm.maxStorageMb}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, maxStorageMb: val });
                        else setNewPlanForm({ ...newPlanForm, maxStorageMb: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Max Invoices per Month</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.maxInvoices : newPlanForm.maxInvoices}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, maxInvoices: val });
                        else setNewPlanForm({ ...newPlanForm, maxInvoices: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                </div>

                {/* 4. Communication Credits */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Trial SMS Credits</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.smsCredits : newPlanForm.smsCredits}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, smsCredits: val });
                        else setNewPlanForm({ ...newPlanForm, smsCredits: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">Trial WhatsApp Credits</label>
                    <input
                      type="number"
                      required
                      value={editingPlan ? editingPlan.whatsappCredits : newPlanForm.whatsappCredits}
                      onChange={e => {
                        const val = Number(e.target.value);
                        if (editingPlan) setEditingPlan({ ...editingPlan, whatsappCredits: val });
                        else setNewPlanForm({ ...newPlanForm, whatsappCredits: val });
                      }}
                      className="w-full bg-bg-app border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono"
                    />
                  </div>
                </div>

                {/* 5. Toggles */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-border-card grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPlan ? editingPlan.customBranding : newPlanForm.customBranding}
                      onChange={e => {
                        const val = e.target.checked;
                        if (editingPlan) setEditingPlan({ ...editingPlan, customBranding: val });
                        else setNewPlanForm({ ...newPlanForm, customBranding: val });
                      }}
                      className="rounded text-cyan-400 bg-black border-border-card w-4 h-4"
                    />
                    <span className="text-xs text-text-secondary">Custom Branding</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPlan ? editingPlan.apiAccess : newPlanForm.apiAccess}
                      onChange={e => {
                        const val = e.target.checked;
                        if (editingPlan) setEditingPlan({ ...editingPlan, apiAccess: val });
                        else setNewPlanForm({ ...newPlanForm, apiAccess: val });
                      }}
                      className="rounded text-cyan-400 bg-black border-border-card w-4 h-4"
                    />
                    <span className="text-xs text-text-secondary">API Access</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPlan ? editingPlan.multiBranchSupport : newPlanForm.multiBranchSupport}
                      onChange={e => {
                        const val = e.target.checked;
                        if (editingPlan) setEditingPlan({ ...editingPlan, multiBranchSupport: val });
                        else setNewPlanForm({ ...newPlanForm, multiBranchSupport: val });
                      }}
                      className="rounded text-cyan-400 bg-black border-border-card w-4 h-4"
                    />
                    <span className="text-xs text-text-secondary">Multi-Branch</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingPlan ? editingPlan.isPopular : newPlanForm.isPopular}
                      onChange={e => {
                        const val = e.target.checked;
                        if (editingPlan) setEditingPlan({ ...editingPlan, isPopular: val });
                        else setNewPlanForm({ ...newPlanForm, isPopular: val });
                      }}
                      className="rounded text-cyan-400 bg-black border-border-card w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-text-secondary">Highlight (Popular)</span>
                  </label>
                </div>

                {/* 5b. Plan Modules Access Matrix */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-border-card space-y-3">
                  <span className="text-xs font-semibold text-cyan-400 block uppercase tracking-wider">Allocated Modules (Feature Locks)</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { id: 'dashboard', label: 'Dashboard Page' },
                      { id: 'billing', label: 'Billing Engine' },
                      { id: 'invoices', label: 'Invoices & POS' },
                      { id: 'jobCards', label: 'Job Cards Control' },
                      { id: 'customers', label: 'Customers CRM' },
                      { id: 'inventory', label: 'Inventory Spares' },
                      { id: 'staffs', label: 'Staff Accounts' },
                      { id: 'appointments', label: 'Live Appointments' },
                      { id: 'reports', label: 'Reports & Export' },
                      { id: 'settings', label: 'Settings Control' },
                      { id: 'whatsapp', label: 'WhatsApp Alerts' },
                      { id: 'multiBranch', label: 'Multi-Branch Sync' },
                      { id: 'advancedAnalytics', label: 'Advanced Analytics' },
                      { id: 'apiAccess', label: 'Developer API' },
                      { id: 'paymentIntegration', label: 'Payment Gateway' }
                    ].map(mod => {
                      const isChecked = editingPlan 
                        ? (editingPlan.moduleAccess?.[mod.id as keyof PlanModuleAccess] ?? true)
                        : (newPlanForm.moduleAccess?.[mod.id as keyof PlanModuleAccess] ?? true);

                      return (
                        <label key={mod.id} className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              const val = e.target.checked;
                              if (editingPlan) {
                                setEditingPlan({
                                  ...editingPlan,
                                  moduleAccess: {
                                    ...(editingPlan.moduleAccess || defaultModuleAccess),
                                    [mod.id]: val
                                  }
                                });
                              } else {
                                setNewPlanForm({
                                  ...newPlanForm,
                                  moduleAccess: {
                                    ...(newPlanForm.moduleAccess || defaultModuleAccess),
                                    [mod.id]: val
                                  }
                                });
                              }
                            }}
                            className="rounded text-cyan-400 bg-black border-border-card w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs text-text-secondary">{mod.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Feature Suite builder */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary">Included Features Checklist</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={e => setNewFeatureText(e.target.value)}
                      placeholder="e.g. Automated GST filing report export"
                      className="flex-1 bg-bg-app border border-border-card rounded-xl px-4 py-2 text-xs text-text-primary"
                    />
                    <button
                      type="button"
                      onClick={() => addFeature(!!editingPlan)}
                      className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-4 rounded-xl flex items-center justify-center cursor-pointer border-none text-xs"
                    >
                      Add Feature
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(editingPlan ? editingPlan.features : newPlanForm.features).map((feat, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white/5 border border-border-card px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-text-secondary animate-in fade-in zoom-in-95 duration-150"
                      >
                        <span>{feat}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(!!editingPlan, idx)}
                          className="text-text-muted hover:text-red-400 bg-transparent border-none cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {(editingPlan ? editingPlan.features : newPlanForm.features).length === 0 && (
                      <span className="text-xs text-text-muted italic">No features specified yet. Add some features above.</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border-card">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setEditingPlan(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-hover-bg text-text-primary font-bold text-xs cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-400 to-blue-600 text-text-primary font-bold px-6 py-2.5 rounded-xl shadow-md shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer border-none text-xs"
                  >
                    {editingPlan ? 'Save Settings' : 'Create Subscription Plan'}
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
          <CheckCircle2 size={16} className="text-cyan-400" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
