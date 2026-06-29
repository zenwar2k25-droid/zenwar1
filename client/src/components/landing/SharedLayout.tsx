import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { LandingHeader } from './LandingHeader';
import { useNavigate } from 'react-router-dom';
import { demoFooterConfig } from '../../data/seedData';
import { useBranding } from '../../hooks/useBranding';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  const { liveWebsiteState, draftWebsiteState, login } = useDatabase();
  const navigate = useNavigate();
  const branding = useBranding();

  const isPreview = new URLSearchParams(window.location.search).get('draft') === 'true';
  const data = isPreview ? draftWebsiteState : liveWebsiteState;

  if (!data) return <div className="h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/pricing');
  };

  const safeFooter = data.footer?.copyright ? data.footer : demoFooterConfig;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-text-primary overflow-x-hidden font-sans flex flex-col relative">
      {isPreview && (
        <div className="fixed top-0 left-0 w-full bg-[var(--color-secondary)] text-white text-center text-xs font-bold py-1 z-[100] uppercase tracking-wider">
          Draft Preview Mode
        </div>
      )}

      {/* Global Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-[var(--color-primary)]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-[var(--color-secondary)]/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <LandingHeader isPreview={isPreview} data={data} onLogin={handleLogin} onGetStarted={handleGetStarted} />

      <main className={`flex-1 relative z-10 ${isPreview ? 'mt-[104px]' : 'mt-20'}`}>
        {children}
      </main>

      <footer className="border-t border-[var(--border-card)] bg-[var(--bg-card)] pt-20 pb-10 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src={branding.logoUrl} 
                  alt="Zenwar Logo" 
                  className="h-10 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="font-bold text-xl tracking-wider">{safeFooter.companyName}</span>
              </div>
              <p className="text-text-secondary max-w-sm">{safeFooter.description}</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
                {safeFooter.quickLinks.map((link: any, i: number) => (
                  <li key={i}><a href={link.url} className="text-text-secondary hover:text-[var(--color-primary)] transition-colors">{link.name}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-white">Policies</h4>
              <ul className="space-y-4">
                {safeFooter.policies.map((link: any, i: number) => (
                  <li key={i}><a href={link.url} className="text-text-secondary hover:text-[var(--color-primary)] transition-colors">{link.name}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--border-card)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-text-muted text-sm">
            <p>{safeFooter.copyright}</p>
            <div className="flex items-center gap-4">
              {safeFooter.socialLinks.map((link: any, i: number) => (
                <a key={i} href={link.url} className="hover:text-white transition-colors">{link.platform}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
