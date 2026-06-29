import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import type { Feature } from '../../../data/seedData';
import { Plus, Trash2, GripVertical, Zap, Package, Shield, Settings, Activity } from 'lucide-react';

const AVAILABLE_ICONS = ['Zap', 'Package', 'Shield', 'Settings', 'Activity', 'Award', 'MapPin', 'BarChart'];

export const FeaturesEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.features || [];

  if (!draftWebsiteState) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleAdd = () => {
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      title: 'New Feature',
      description: 'Describe what this feature does.',
      icon: 'Zap',
      order: data.length,
      active: true
    };
    saveDraft({ features: [...data, newFeature] });
  };

  const updateFeature = (id: string, field: string, value: any) => {
    saveDraft({ features: data.map(f => f.id === id ? { ...f, [field]: value } : f) });
  };

  const removeFeature = (id: string) => {
    saveDraft({ features: data.filter(f => f.id !== id) });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Manage Features</h3>
        <button onClick={handleAdd} className="px-4 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2">
          <Plus size={16} /> Add Feature
        </button>
      </div>

      <div className="space-y-4">
        {data.sort((a, b) => a.order - b.order).map((feature) => (
          <div key={feature.id} className="bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-5 flex gap-4 items-start group">
            <div className="cursor-grab text-text-muted hover:text-white mt-2">
              <GripVertical size={20} />
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3 space-y-3">
                <label className="block text-xs font-medium text-text-secondary">Icon</label>
                <select value={feature.icon} onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none">
                  {AVAILABLE_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" checked={feature.active} onChange={(e) => updateFeature(feature.id, 'active', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)]" />
                  <span className="text-xs text-text-secondary">Active Feature</span>
                </div>
              </div>
              
              <div className="md:col-span-9 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
                  <input type="text" value={feature.title} onChange={(e) => updateFeature(feature.id, 'title', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white font-bold px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                  <textarea value={feature.description} onChange={(e) => updateFeature(feature.id, 'description', e.target.value)} rows={2} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-text-secondary px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)] resize-none" />
                </div>
              </div>
            </div>

            <button onClick={() => removeFeature(feature.id)} className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition-colors mt-6">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
