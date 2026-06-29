import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import type { PricingPlan } from '../../../data/seedData';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export const PricingEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft, subscriptionPlans } = useDatabase();
  const { confirm } = useModal();
  const data = draftWebsiteState?.pricing || [];

  if (!draftWebsiteState) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleSyncFromBackend = async () => {
    if (await confirm('This will replace your current pricing plans with the core Subscription Plans. Continue?')) {
      const synced: PricingPlan[] = subscriptionPlans.map((plan, i) => ({
        id: `price-${Date.now()}-${i}`,
        name: plan.name,
        monthlyPrice: plan.priceMonthly,
        yearlyPrice: plan.priceYearly,
        description: `Manage up to ${plan.maxUsers} users.`,
        features: plan.features.slice(0, 5),
        userLimit: plan.maxUsers.toString(),
        storage: '10GB',
        businessLimit: '1',
        trialDays: plan.trialDays || 14,
        buttonText: 'Start Free Trial',
        highlightPlan: plan.name.toLowerCase().includes('pro'),
        badge: plan.name.toLowerCase().includes('pro') ? 'Most Popular' : '',
        order: i,
        active: true
      }));
      saveDraft({ pricing: synced });
    }
  };

  const handleAdd = () => {
    const newPlan: PricingPlan = {
      id: `price-${Date.now()}`,
      name: 'New Plan',
      monthlyPrice: 99,
      yearlyPrice: 990,
      description: 'A great starting plan.',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      userLimit: '5',
      storage: '5GB',
      businessLimit: '1',
      trialDays: 14,
      buttonText: 'Get Started',
      highlightPlan: false,
      badge: '',
      order: data.length,
      active: true
    };
    saveDraft({ pricing: [...data, newPlan] });
  };

  const updatePlan = (id: string, field: string, value: any) => {
    saveDraft({ pricing: data.map(p => p.id === id ? { ...p, [field]: value } : p) });
  };

  const removePlan = (id: string) => {
    saveDraft({ pricing: data.filter(p => p.id !== id) });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-white font-bold text-lg">Manage Pricing Plans</h3>
          <p className="text-xs text-text-muted">You can sync these with your core subscription plans or edit them manually for the landing page.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSyncFromBackend} className="px-4 py-2 border border-[var(--border-card)] text-text-secondary font-bold rounded-lg hover:text-white transition-all text-sm">
            Sync from Backend
          </button>
          <button onClick={handleAdd} className="px-4 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2">
            <Plus size={16} /> Add Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.sort((a, b) => a.order - b.order).map((plan) => (
          <div key={plan.id} className={`bg-[var(--bg-app)] border rounded-xl p-5 group ${plan.highlightPlan ? 'border-[var(--color-primary)] shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-[var(--border-card)]'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <GripVertical size={20} className="cursor-grab text-text-muted hover:text-white" />
                <input type="text" value={plan.name} onChange={(e) => updatePlan(plan.id, 'name', e.target.value)} className="bg-transparent border-b border-transparent text-white font-bold text-xl hover:border-[var(--border-card)] focus:border-[var(--color-primary)] outline-none transition-all w-48" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-[var(--color-primary)] font-bold">Highlight</span>
                  <input type="checkbox" checked={plan.highlightPlan} onChange={(e) => updatePlan(plan.id, 'highlightPlan', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
                </label>
                <button onClick={() => removePlan(plan.id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Monthly Price (₹)</label>
                <input type="number" value={plan.monthlyPrice} onChange={(e) => updatePlan(plan.id, 'monthlyPrice', Number(e.target.value))} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Yearly Price (₹)</label>
                <input type="number" value={plan.yearlyPrice} onChange={(e) => updatePlan(plan.id, 'yearlyPrice', Number(e.target.value))} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
              <textarea value={plan.description} onChange={(e) => updatePlan(plan.id, 'description', e.target.value)} rows={2} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-text-secondary px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)] resize-none text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Badge Text</label>
                <input type="text" value={plan.badge} onChange={(e) => updatePlan(plan.id, 'badge', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--color-primary)] text-sm px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" placeholder="e.g. Best Value" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Button Text</label>
                <input type="text" value={plan.buttonText} onChange={(e) => updatePlan(plan.id, 'buttonText', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white text-sm px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <label className="block text-xs font-medium text-text-secondary">Feature List (Comma separated)</label>
              <textarea 
                value={plan.features.join(', ')} 
                onChange={(e) => updatePlan(plan.id, 'features', e.target.value.split(',').map(s => s.trim()))} 
                rows={3} 
                className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)] resize-none text-sm" 
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-card)]">
              <input type="checkbox" checked={plan.active} onChange={(e) => updatePlan(plan.id, 'active', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)]" />
              <span className="text-xs text-text-secondary">Show this plan on website</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
