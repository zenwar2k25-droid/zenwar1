import React, { useState } from 'react';
import { 
  Globe, CheckCircle2, Layout, Image, Star, HelpCircle, Phone, MapPin, 
  Search, Map, MessageSquare, Zap, IndianRupee, FileImage, 
  MonitorSmartphone, History, Palette
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useModal } from '../../context/ModalContext';

// Import new editors
import { HeroContentEditor } from '../../components/superadmin/website-builder/HeroContentEditor';
import { HeroBannerEditor } from '../../components/superadmin/website-builder/HeroBannerEditor';
import { FeaturesEditor } from '../../components/superadmin/website-builder/FeaturesEditor';
import { PricingEditor } from '../../components/superadmin/website-builder/PricingEditor';
import { TestimonialsEditor } from '../../components/superadmin/website-builder/TestimonialsEditor';
import { FAQEditor } from '../../components/superadmin/website-builder/FAQEditor';
import { ContactEditor } from '../../components/superadmin/website-builder/ContactEditor';
import { BranchDirectoryEditor } from '../../components/superadmin/website-builder/BranchDirectoryEditor';
import { BrandingEditor } from '../../components/superadmin/website-builder/BrandingEditor';
import { LiveBranchMapEditor } from '../../components/superadmin/website-builder/LiveBranchMapEditor';
import { FooterEditor } from '../../components/superadmin/website-builder/FooterEditor';
import { SEOEditor } from '../../components/superadmin/website-builder/SEOEditor';
import { MediaLibraryEditor } from '../../components/superadmin/website-builder/MediaLibraryEditor';
import { VersionHistory } from '../../components/superadmin/website-builder/VersionHistory';
import { PagePreview } from '../../components/superadmin/website-builder/PagePreview';
import { AboutPageEditor } from '../../components/superadmin/website-builder/AboutPageEditor';
import { ContactPageEditor } from '../../components/superadmin/website-builder/ContactPageEditor';
import { ContactTeamEditor } from '../../components/superadmin/website-builder/ContactTeamEditor';
import { AuthSettingsEditor } from '../../components/superadmin/website-builder/AuthSettingsEditor';
import { Users, PhoneCall, Shield } from 'lucide-react';

const MODULES = [
  { id: 'branding', name: 'Branding', icon: Palette },
  { id: 'auth-settings', name: 'Google Login', icon: Shield },
  { id: 'hero-content', name: 'Hero Content', icon: Layout },
  { id: 'hero-banner', name: 'Hero Banner Slider', icon: Image },
  { id: 'features', name: 'Features', icon: Zap },
  { id: 'pricing', name: 'Pricing', icon: IndianRupee },
  { id: 'testimonials', name: 'Testimonials', icon: Star },
  { id: 'faq', name: 'FAQ', icon: HelpCircle },
  { id: 'about-page', name: 'About Page', icon: Users },
  { id: 'contact', name: 'Contact Page', icon: Phone },
  { id: 'contact-team', name: 'Contact Team', icon: PhoneCall },
  { id: 'branch-directory', name: 'Branch Directory', icon: MapPin },
  { id: 'branch-map', name: 'Live Branch Map', icon: Map },
  { id: 'footer', name: 'Footer', icon: MessageSquare },
  { id: 'seo', name: 'SEO', icon: Search },
  { id: 'media-library', name: 'Media Library', icon: FileImage },
  { id: 'page-preview', name: 'Page Preview', icon: MonitorSmartphone },
  { id: 'version-history', name: 'Version History', icon: History },
];

export const WebsiteBuilder: React.FC = () => {
  const { 
    saveDraft, 
    discardDraft, 
    publishDraft 
  } = useDatabase();
  const { confirm } = useModal();

  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePublish = async () => {
    if (await confirm('Are you sure you want to push these changes to the live website?')) {
      publishDraft('Published via Website Builder');
      triggerToast('Website published successfully!');
    }
  };

  const handleDiscard = async () => {
    if (await confirm('Are you sure you want to discard all un-published draft changes?')) {
      discardDraft();
      triggerToast('Draft discarded successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-black px-6 py-3 rounded-xl font-bold shadow-2xl z-50 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-wide">WEBSITE BUILDER</h1>
            <p className="text-sm text-text-muted mt-1">Manage enterprise landing page features</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDiscard}
            className="px-5 py-2.5 rounded-xl border border-[var(--border-card)] text-text-secondary hover:text-white hover:border-[var(--color-primary)]/50 transition-all flex items-center gap-2 text-sm font-bold bg-[var(--bg-app)]"
          >
            DISCARD DRAFT
          </button>
          <button 
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-black font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            <CheckCircle2 size={16} />
            PUBLISH LIVE
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Vertical Tabs Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 flex flex-col gap-1 sticky top-6">
            {MODULES.map(module => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group
                    ${isActive 
                      ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)]' 
                      : 'border border-transparent text-text-secondary hover:bg-[var(--hover-bg)] hover:text-white'}
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-[var(--color-primary)]' : 'text-text-muted group-hover:text-white transition-colors'} />
                  <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {module.name.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 min-h-[600px]">
            <div className="mb-6 pb-4 border-b border-[var(--border-card)]">
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                {MODULES.find(m => m.id === activeModule)?.name.replace(' ', '')}
              </h2>
            </div>
            
            {activeModule === 'hero-content' && <HeroContentEditor />}
            {activeModule === 'hero-banner' && <HeroBannerEditor />}
            {activeModule === 'features' && <FeaturesEditor />}
            {activeModule === 'pricing' && <PricingEditor />}
            {activeModule === 'testimonials' && <TestimonialsEditor />}
            {activeModule === 'faq' && <FAQEditor />}
            {activeModule === 'about-page' && <AboutPageEditor />}
            {activeModule === 'contact' && <ContactPageEditor />}
            {activeModule === 'contact-team' && <ContactTeamEditor />}
            {activeModule === 'branding' && <BrandingEditor />}
            {activeModule === 'auth-settings' && <AuthSettingsEditor />}
            {activeModule === 'branch-directory' && <BranchDirectoryEditor />}
            {activeModule === 'branch-map' && <LiveBranchMapEditor />}
            {activeModule === 'footer' && <FooterEditor />}
            {activeModule === 'seo' && <SEOEditor />}
            {activeModule === 'media-library' && <MediaLibraryEditor />}
            {activeModule === 'version-history' && <VersionHistory />}
            {activeModule === 'page-preview' && <PagePreview />}
          </div>
        </div>
      </div>
    </div>
  );
};
