import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { Plus, Trash2 } from 'lucide-react';

export const FooterEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.footer;

  if (!data) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleChange = (field: string, value: any) => {
    saveDraft({ footer: { ...data, [field]: value } });
  };

  const addLink = (type: 'quickLinks' | 'policies' | 'socialLinks') => {
    saveDraft({ footer: { ...data, [type]: [...data[type], { name: 'New Link', url: '#' }] } });
  };

  const updateLink = (type: 'quickLinks' | 'policies' | 'socialLinks', index: number, field: string, value: string) => {
    const arr = [...data[type]];
    arr[index] = { ...arr[index], [field]: value };
    saveDraft({ footer: { ...data, [type]: arr } });
  };

  const removeLink = (type: 'quickLinks' | 'policies' | 'socialLinks', index: number) => {
    const arr = [...data[type]];
    arr.splice(index, 1);
    saveDraft({ footer: { ...data, [type]: arr } });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Company Name</label>
          <input type="text" value={data.companyName} onChange={(e) => handleChange('companyName', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Copyright Text</label>
          <input type="text" value={data.copyright} onChange={(e) => handleChange('copyright', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-text-secondary mb-1">Short Description</label>
          <textarea value={data.description} onChange={(e) => handleChange('description', e.target.value)} rows={2} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)] resize-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--border-card)]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">Quick Links</h4>
            <button onClick={() => addLink('quickLinks')} className="text-xs text-[var(--color-primary)] hover:text-white flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-3">
            {data.quickLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" value={link.name} onChange={(e) => updateLink('quickLinks', idx, 'name', e.target.value)} className="w-1/3 bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-2 py-1.5 rounded outline-none" placeholder="Name" />
                <input type="text" value={link.url} onChange={(e) => updateLink('quickLinks', idx, 'url', e.target.value)} className="flex-1 bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-2 py-1.5 rounded outline-none" placeholder="URL" />
                <button onClick={() => removeLink('quickLinks', idx)} className="text-red-400 hover:text-red-300 p-1.5"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold">Policies</h4>
            <button onClick={() => addLink('policies')} className="text-xs text-[var(--color-primary)] hover:text-white flex items-center gap-1"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-3">
            {data.policies.map((link, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" value={link.name} onChange={(e) => updateLink('policies', idx, 'name', e.target.value)} className="w-1/3 bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-2 py-1.5 rounded outline-none" placeholder="Name" />
                <input type="text" value={link.url} onChange={(e) => updateLink('policies', idx, 'url', e.target.value)} className="flex-1 bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-2 py-1.5 rounded outline-none" placeholder="URL" />
                <button onClick={() => removeLink('policies', idx)} className="text-red-400 hover:text-red-300 p-1.5"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
