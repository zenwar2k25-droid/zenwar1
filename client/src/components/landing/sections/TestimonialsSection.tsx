import React from 'react';
import { Star } from 'lucide-react';
import type { Testimonial } from '../../../data/seedData';

interface Props {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<Props> = ({ testimonials }) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold mb-4">Trusted by Industry Leaders</h2>
        <p className="text-text-secondary">Don't just take our word for it.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.filter(t => t.active).sort((a, b) => a.order - b.order).map((testimonial) => (
          <div key={testimonial.id} className="p-8 rounded-3xl bg-surface-dark border border-[var(--border-card)] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--color-primary)]/10 transition-colors" />
            <div className="flex gap-1 mb-6">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[var(--color-primary)] text-[var(--color-primary)]" />
              ))}
            </div>
            <p className="text-lg mb-8 flex-1 italic text-text-secondary leading-relaxed">"{testimonial.feedback}"</p>
            <div className="flex items-center gap-4">
              <img src={testimonial.photoUrl} alt={testimonial.customerName} className="w-12 h-12 rounded-full object-cover border-2 border-[var(--border-card)]" />
              <div>
                <h4 className="font-bold text-white">{testimonial.customerName}</h4>
                <div className="text-sm text-text-muted">{testimonial.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
