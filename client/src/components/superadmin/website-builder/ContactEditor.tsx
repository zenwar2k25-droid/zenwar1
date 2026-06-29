import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';

export const ContactEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.contact;

  if (!data) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleChange = (field: string, value: any) => {
    saveDraft({ contact: { ...data, [field]: value } });
  };

  const handleSocialChange = (platform: string, value: string) => {
    saveDraft({ contact: { ...data, socialMedia: { ...data.socialMedia, [platform]: value } } });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-card)]">
        <div>
          <h3 className="text-white font-bold">Enable Contact Section</h3>
          <p className="text-xs text-text-muted">Show or hide the contact & branch directory section</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={data.enabled} onChange={(e) => handleChange('enabled', e.target.checked)} />
          <div className="w-11 h-6 bg-[var(--border-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
          <input type="text" value={data.title} onChange={(e) => handleChange('title', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Subtitle</label>
          <input type="text" value={data.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
      </div>

      <h4 className="text-white font-bold border-b border-[var(--border-card)] pb-2 mt-6">Contact Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Support Email</label>
          <input type="email" value={data.supportEmail} onChange={(e) => handleChange('supportEmail', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Support Number</label>
          <input type="text" value={data.supportNumber} onChange={(e) => handleChange('supportNumber', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">WhatsApp Number</label>
          <input type="text" value={data.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Office Hours</label>
          <input type="text" value={data.officeHours} onChange={(e) => handleChange('officeHours', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
      </div>

      <h4 className="text-white font-bold border-b border-[var(--border-card)] pb-2 mt-6">Social Media</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Facebook URL</label>
          <input type="text" value={data.socialMedia.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Twitter (X) URL</label>
          <input type="text" value={data.socialMedia.twitter} onChange={(e) => handleSocialChange('twitter', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Instagram URL</label>
          <input type="text" value={data.socialMedia.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">LinkedIn URL</label>
          <input type="text" value={data.socialMedia.linkedin} onChange={(e) => handleSocialChange('linkedin', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
        </div>
      </div>
    </div>
  );
};
