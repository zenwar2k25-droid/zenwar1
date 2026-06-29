import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import type { Testimonial } from '../../../data/seedData';
import { Plus, Trash2, GripVertical, Star } from 'lucide-react';

export const TestimonialsEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.testimonials || [];

  if (!draftWebsiteState) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleAdd = () => {
    const newTestimonial: Testimonial = {
      id: `test-${Date.now()}`,
      customerName: 'New Customer',
      company: 'Company Ltd',
      designation: 'CEO',
      rating: 5,
      feedback: 'Great platform, highly recommended.',
      photoUrl: 'https://ui-avatars.com/api/?name=New+Customer&background=random',
      order: data.length,
      active: true
    };
    saveDraft({ testimonials: [...data, newTestimonial] });
  };

  const update = (id: string, field: string, value: any) => {
    saveDraft({ testimonials: data.map(t => t.id === id ? { ...t, [field]: value } : t) });
  };

  const remove = (id: string) => {
    saveDraft({ testimonials: data.filter(t => t.id !== id) });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Manage Testimonials</h3>
        <button onClick={handleAdd} className="px-4 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.sort((a, b) => a.order - b.order).map((testimonial) => (
          <div key={testimonial.id} className="bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-5 flex gap-5 items-start group">
            <div className="cursor-grab text-text-muted hover:text-white mt-8">
              <GripVertical size={20} />
            </div>

            <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden shrink-0 mt-2">
              <img src={testimonial.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Customer Name</label>
                  <input type="text" value={testimonial.customerName} onChange={(e) => update(testimonial.id, 'customerName', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Company</label>
                  <input type="text" value={testimonial.company} onChange={(e) => update(testimonial.id, 'company', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Designation</label>
                  <input type="text" value={testimonial.designation} onChange={(e) => update(testimonial.id, 'designation', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-10">
                  <label className="block text-xs font-medium text-text-secondary mb-1">Feedback</label>
                  <textarea value={testimonial.feedback} onChange={(e) => update(testimonial.id, 'feedback', e.target.value)} rows={3} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-text-secondary px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)] resize-none" />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Rating (1-5)</label>
                    <input type="number" min={1} max={5} value={testimonial.rating} onChange={(e) => update(testimonial.id, 'rating', Number(e.target.value))} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input type="checkbox" checked={testimonial.active} onChange={(e) => update(testimonial.id, 'active', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)]" />
                    <span className="text-xs text-text-secondary">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => remove(testimonial.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition-colors mt-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
