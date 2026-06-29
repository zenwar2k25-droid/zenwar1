import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';

export const SEOEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.seo;

  if (!data) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleChange = (field: string, value: string) => {
    saveDraft({ seo: { ...data, [field]: value } });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg border-b border-[var(--border-card)] pb-2">Global Meta Tags</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Website Title</label>
            <input type="text" value={data.websiteTitle} onChange={(e) => handleChange('websiteTitle', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Meta Title</label>
            <input type="text" value={data.metaTitle} onChange={(e) => handleChange('metaTitle', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Meta Description</label>
            <textarea value={data.metaDescription} onChange={(e) => handleChange('metaDescription', e.target.value)} rows={3} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Keywords (comma separated)</label>
            <input type="text" value={data.keywords} onChange={(e) => handleChange('keywords', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg border-b border-[var(--border-card)] pb-2">Open Graph (Social Sharing)</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">OG Title</label>
            <input type="text" value={data.ogTitle} onChange={(e) => handleChange('ogTitle', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">OG Description</label>
            <textarea value={data.ogDescription} onChange={(e) => handleChange('ogDescription', e.target.value)} rows={2} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none resize-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-bold text-lg border-b border-[var(--border-card)] pb-2">Tracking & Advanced</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Google Analytics ID</label>
            <input type="text" value={data.googleAnalyticsId} onChange={(e) => handleChange('googleAnalyticsId', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none" placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Facebook Pixel ID</label>
            <input type="text" value={data.facebookPixelId} onChange={(e) => handleChange('facebookPixelId', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-4 py-2 rounded-xl focus:border-[var(--color-primary)] outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Robots.txt</label>
            <textarea value={data.robotsTxt} onChange={(e) => handleChange('robotsTxt', e.target.value)} rows={4} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white font-mono text-xs px-4 py-3 rounded-xl focus:border-[var(--color-primary)] outline-none resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
