import React from 'react';
import { Zap, Package, Shield, Settings, Activity, Award, MapPin, BarChart } from 'lucide-react';
import type { Feature } from '../../../data/seedData';

const ICONS: Record<string, any> = { Zap, Package, Shield, Settings, Activity, Award, MapPin, BarChart };

interface Props {
  features: Feature[];
}

export const FeaturesSection: React.FC<Props> = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold mb-4">Powerful Business Features</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">Everything you need to manage your multi-branch operations efficiently.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.filter(f => f.active).sort((a, b) => a.order - b.order).map((feature) => {
          const Icon = ICONS[feature.icon] || Settings;
          return (
            <div key={feature.id} className="p-6 rounded-2xl bg-surface-dark border border-[var(--border-card)] hover:border-[var(--color-primary)] transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-black border border-[var(--border-card)] flex items-center justify-center text-[var(--color-primary)] mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
