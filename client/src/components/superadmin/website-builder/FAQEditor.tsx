import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import type { FAQ } from '../../../data/seedData';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export const FAQEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.faqs || [];

  if (!draftWebsiteState) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleAdd = () => {
    const newFAQ: FAQ = {
      id: `faq-${Date.now()}`,
      question: 'New Question?',
      answer: 'Answer to the question goes here.',
      category: 'General',
      order: data.length,
      active: true
    };
    saveDraft({ faqs: [...data, newFAQ] });
  };

  const update = (id: string, field: string, value: any) => {
    saveDraft({ faqs: data.map(f => f.id === id ? { ...f, [field]: value } : f) });
  };

  const remove = (id: string) => {
    saveDraft({ faqs: data.filter(f => f.id !== id) });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Manage FAQs</h3>
        <button onClick={handleAdd} className="px-4 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2">
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {data.sort((a, b) => a.order - b.order).map((faq) => (
          <div key={faq.id} className="bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-5 flex gap-4 items-start group">
            <div className="cursor-grab text-text-muted hover:text-white mt-2">
              <GripVertical size={20} />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Question</label>
                  <input type="text" value={faq.question} onChange={(e) => update(faq.id, 'question', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white font-bold px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
                  <input type="text" value={faq.category} onChange={(e) => update(faq.id, 'category', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-text-secondary px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Answer</label>
                <textarea value={faq.answer} onChange={(e) => update(faq.id, 'answer', e.target.value)} rows={3} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-text-secondary px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)] resize-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={faq.active} onChange={(e) => update(faq.id, 'active', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)]" />
                <span className="text-xs text-text-secondary">Active</span>
              </div>
            </div>

            <button onClick={() => remove(faq.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition-colors mt-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
