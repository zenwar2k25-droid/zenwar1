import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { PricingPlan } from '../../../data/seedData';
import { useNavigate } from 'react-router-dom';

interface Props {
  pricing: PricingPlan[];
}

export const PricingSection: React.FC<Props> = ({ pricing }) => {
  const navigate = useNavigate();
  if (!pricing || pricing.length === 0) return null;

  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto bg-[var(--bg-card)] border-y border-[var(--border-card)]">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold mb-4">Choose Your Plan</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">Transparent pricing for businesses of all sizes. No hidden fees.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricing.filter(p => p.active).sort((a, b) => a.order - b.order).map((plan) => (
          <div key={plan.id} className={`relative p-8 rounded-3xl border ${plan.highlightPlan ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--border-card)] bg-surface-dark'} flex flex-col`}>
            {plan.highlightPlan && plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black text-xs font-bold uppercase tracking-wider">
                {plan.badge}
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-display font-bold">₹{plan.monthlyPrice}</span>
                <span className="text-text-secondary">/mo</span>
              </div>
              <div className="text-sm text-text-secondary">or ₹{plan.yearlyPrice}/year</div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-sm">Up to {plan.userLimit} Users</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-sm">{plan.businessLimit} Businesses</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-sm">{plan.storage} Storage</span>
              </div>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                  <span className="text-sm text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/register')} className={`w-full py-4 rounded-xl font-bold transition-all ${plan.highlightPlan ? 'bg-[var(--color-primary)] text-black hover:shadow-[0_0_20px_var(--color-primary-glow)]' : 'bg-black text-white hover:bg-surface border border-[var(--border-card)]'}`}>
              {plan.buttonText}
            </button>
            
            {plan.trialDays > 0 && (
              <p className="text-center text-xs text-text-secondary mt-4">
                Includes {plan.trialDays}-day free trial
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
