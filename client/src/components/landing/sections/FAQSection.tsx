import React, { useState } from 'react';
import type { FAQ } from '../../../data/seedData';

interface Props {
  faqs: FAQ[];
}

export const FAQSection: React.FC<Props> = ({ faqs }) => {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24 px-6 bg-[var(--bg-card)] border-y border-[var(--border-card)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-text-secondary">Everything you need to know about the platform.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.filter(f => f.active).sort((a, b) => a.order - b.order).map((faq) => (
            <div key={faq.id} className="border border-[var(--border-card)] rounded-2xl bg-surface-dark overflow-hidden">
              <button 
                onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-left hover:text-[var(--color-primary)] transition-colors"
              >
                {faq.question}
                <span className={`transform transition-transform ${activeFaq === faq.id ? 'rotate-180' : ''}`}>↓</span>
              </button>
              {activeFaq === faq.id && (
                <div className="px-6 pb-4 text-text-secondary">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
