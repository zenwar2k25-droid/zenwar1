import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export const HeroContentEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.heroContent;

  if (!data) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleChange = (field: string, value: any) => {
    saveDraft({ heroContent: { ...data, [field]: value } });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-card)]">
        <div>
          <h3 className="text-white font-bold">Enable Hero Section</h3>
          <p className="text-xs text-text-muted">Show or hide the hero section on the landing page</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={data.enabled} onChange={(e) => handleChange('enabled', e.target.checked)} />
          <div className="w-11 h-6 bg-[var(--border-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Badge Text</label>
          <input type="text" value={data.badgeText} onChange={(e) => handleChange('badgeText', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2.5 rounded-xl focus:border-[var(--color-primary)] outline-none" placeholder="e.g. Enterprise Suite" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Text Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={data.textColor} onChange={(e) => handleChange('textColor', e.target.value)} className="h-10 w-10 rounded cursor-pointer bg-transparent border-0 p-0" />
            <input type="text" value={data.textColor} onChange={(e) => handleChange('textColor', e.target.value)} className="flex-1 bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2.5 rounded-xl focus:border-[var(--color-primary)] outline-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Main Heading</label>
          <input type="text" value={data.mainHeading} onChange={(e) => handleChange('mainHeading', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2.5 rounded-xl focus:border-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Highlight Text</label>
          <input type="text" value={data.highlightText} onChange={(e) => handleChange('highlightText', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--color-primary)] px-4 py-2.5 rounded-xl focus:border-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
          <textarea value={data.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2.5 rounded-xl focus:border-[var(--color-primary)] outline-none resize-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-card)]">
        <div className="space-y-4">
          <h4 className="text-white font-bold border-b border-[var(--border-card)] pb-2">Primary Button</h4>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Button Text</label>
            <input type="text" value={data.primaryButtonText} onChange={(e) => handleChange('primaryButtonText', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-4 py-2 rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Action URL</label>
            <input type="text" value={data.primaryButtonAction} onChange={(e) => handleChange('primaryButtonAction', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-4 py-2 rounded-lg outline-none" />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-white font-bold border-b border-[var(--border-card)] pb-2">Secondary Button</h4>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Button Text</label>
            <input type="text" value={data.secondaryButtonText} onChange={(e) => handleChange('secondaryButtonText', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-4 py-2 rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Action URL</label>
            <input type="text" value={data.secondaryButtonAction} onChange={(e) => handleChange('secondaryButtonAction', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-4 py-2 rounded-lg outline-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Button Style</label>
          <select value={data.buttonStyle} onChange={(e) => handleChange('buttonStyle', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2.5 rounded-xl focus:border-[var(--color-primary)] outline-none">
            <option value="solid">Solid Fill</option>
            <option value="outline">Outline</option>
            <option value="glass">Glassmorphism</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Alignment</label>
          <div className="flex bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-1">
            <button onClick={() => handleChange('alignment', 'left')} className={`flex-1 flex justify-center py-2 rounded-lg ${data.alignment === 'left' ? 'bg-[var(--bg-card)] text-[var(--color-primary)]' : 'text-text-muted hover:text-white'}`}><AlignLeft size={18} /></button>
            <button onClick={() => handleChange('alignment', 'center')} className={`flex-1 flex justify-center py-2 rounded-lg ${data.alignment === 'center' ? 'bg-[var(--bg-card)] text-[var(--color-primary)]' : 'text-text-muted hover:text-white'}`}><AlignCenter size={18} /></button>
            <button onClick={() => handleChange('alignment', 'right')} className={`flex-1 flex justify-center py-2 rounded-lg ${data.alignment === 'right' ? 'bg-[var(--bg-card)] text-[var(--color-primary)]' : 'text-text-muted hover:text-white'}`}><AlignRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
