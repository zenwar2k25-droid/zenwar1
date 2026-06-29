import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { demoContactPageConfig } from '../../../data/seedData';

export const ContactPageEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();

  const config = draftWebsiteState?.contactPage || demoContactPageConfig;

  const handleUpdate = (updates: Partial<typeof config>) => {
    saveDraft({ contactPage: { ...config, ...updates } });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleUpdate({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display">Contact Page Settings</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <span className={config.active ? 'text-white' : ''}>{config.active ? 'Enabled' : 'Disabled'}</span>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${config.active ? 'bg-[var(--color-primary)]' : 'bg-surface-dark'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${config.active ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" className="hidden" checked={config.active} onChange={(e) => handleUpdate({ active: e.target.checked })} />
          </label>
        </div>
      </div>

      <div className="bg-surface-dark p-6 rounded-xl border border-[var(--border-card)] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Company Name</label>
            <input type="text" name="companyName" value={config.companyName || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Working Hours</label>
            <input type="text" name="workingHours" value={config.workingHours || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Support Email</label>
            <input type="email" name="supportEmail" value={config.supportEmail || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Sales Email</label>
            <input type="email" name="salesEmail" value={config.salesEmail || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Mobile Number</label>
            <input type="text" name="mobileNumber" value={config.mobileNumber || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Emergency Contact</label>
            <input type="text" name="emergencyContact" value={config.emergencyContact || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Office Address</label>
            <textarea name="officeAddress" value={config.officeAddress || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white h-20" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Google Map Link / Query</label>
            <input type="text" name="googleMapLink" value={config.googleMapLink || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Background Banner URL</label>
            <input type="text" name="backgroundBanner" value={config.backgroundBanner || ''} onChange={handleChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
