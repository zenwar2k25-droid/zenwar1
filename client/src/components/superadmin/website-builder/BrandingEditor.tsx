import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import { ImageUploadField } from './ImageUploadField';
import { Save } from 'lucide-react';
import type { BrandingConfig } from '../../../data/seedData';

export const BrandingEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft, publishDraft } = useDatabase();
  const { confirm } = useModal();
  const config = draftWebsiteState.branding;

  if (!config) {
    return <div className="p-8 text-center text-red-500">Branding config missing!</div>;
  }

  const updateConfig = (updates: Partial<BrandingConfig>) => {
    saveDraft({
      branding: {
        ...config,
        ...updates
      }
    });
  };

  const handlePublish = async () => {
    if (await confirm('Are you sure you want to publish these branding changes to the live site?')) {
      await publishDraft('Branding Update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold">Brand Identity</h2>
          <p className="text-text-secondary text-sm">Manage logos and brand assets globally across the platform.</p>
        </div>
        <button 
          onClick={handlePublish}
          className="px-6 py-2.5 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all flex items-center gap-2"
        >
          <Save size={18} /> Publish Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Logo */}
        <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-1">Primary Logo</h3>
          <p className="text-xs text-text-secondary mb-4">Used on light backgrounds (Landing page, documents).</p>
          <ImageUploadField 
            label="Primary Logo"
            value={config.logoUrl || ''} 
            onChange={(url) => updateConfig({ logoUrl: url })}
            folder="Branding"
          />
        </div>

        {/* Light Logo */}
        <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-1">Light Logo (For Dark Mode)</h3>
          <p className="text-xs text-text-secondary mb-4">Used on dark backgrounds (Dark mode portals, auth screens).</p>
          <ImageUploadField 
            label="Light Logo"
            value={config.lightLogoUrl || ''} 
            onChange={(url) => updateConfig({ lightLogoUrl: url })}
            folder="Branding"
          />
        </div>

        {/* Dark Logo */}
        <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-1">Dark Logo (For Light Mode)</h3>
          <p className="text-xs text-text-secondary mb-4">Used on very light backgrounds.</p>
          <ImageUploadField 
            label="Dark Logo"
            value={config.darkLogoUrl || ''} 
            onChange={(url) => updateConfig({ darkLogoUrl: url })}
            folder="Branding"
          />
        </div>

        {/* Email Logo */}
        <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-1">Email Logo</h3>
          <p className="text-xs text-text-secondary mb-4">Optimized for email templates.</p>
          <ImageUploadField 
            label="Email Logo"
            value={config.emailLogoUrl || ''} 
            onChange={(url) => updateConfig({ emailLogoUrl: url })}
            folder="Branding"
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4 border-b border-white/10 pb-2">Browser & Application Icons</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favicon */}
        <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-1">Favicon</h3>
          <p className="text-xs text-text-secondary mb-4">Browser tab icon (16x16 / 32x32 / 48x48).</p>
          <ImageUploadField 
            label="Favicon"
            value={config.faviconUrl || ''} 
            onChange={(url) => updateConfig({ faviconUrl: url })}
            folder="Branding"
          />
        </div>

        {/* App Icon */}
        <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-1">PWA / App Icon</h3>
          <p className="text-xs text-text-secondary mb-4">Used when installed on mobile/desktop (192x192 / 512x512).</p>
          <ImageUploadField 
            label="App Icon"
            value={config.appIconUrl || ''} 
            onChange={(url) => updateConfig({ appIconUrl: url })}
            folder="Branding"
          />
        </div>
      </div>
      
    </div>
  );
};
