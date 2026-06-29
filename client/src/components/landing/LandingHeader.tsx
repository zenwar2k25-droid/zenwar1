import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import type { WebsiteState } from '../../data/seedData';
import { demoSEOConfig } from '../../data/seedData';
import { useBranding } from '../../hooks/useBranding';
import { useDatabase } from '../../context/DatabaseContext';

interface Props {
  isPreview: boolean;
  data: WebsiteState;
  onLogin: (e: React.MouseEvent) => void;
  onGetStarted: (e: React.MouseEvent) => void;
}

export const LandingHeader: React.FC<Props> = ({ isPreview, data, onLogin, onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const branding = useBranding();
  const { landingPageSettings } = useDatabase();

  const seo = data.seo || demoSEOConfig;

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToPage = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-card)] ${isPreview ? 'mt-6' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToPage('/')}>
            <img 
              src={branding.logoUrl} 
              alt="Zenwar Logo" 
              className="h-10 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="font-display font-bold text-2xl tracking-wide">{seo.websiteTitle || 'ZENWAR'}</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigateToPage('/')} className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Home</button>
            <button onClick={() => navigateToPage('/features')} className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Features</button>
            <button onClick={() => navigateToPage('/pricing')} className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Pricing</button>
            <button onClick={() => navigateToPage('/about')} className="text-sm font-medium text-text-secondary hover:text-white transition-colors">About</button>
            <button onClick={() => navigateToPage('/contact')} className="text-sm font-medium text-text-secondary hover:text-white transition-colors">Contact</button>
          </div>


          <div className="hidden md:flex items-center gap-4">
            {(!landingPageSettings || landingPageSettings.enableLogin) && (
              <button onClick={onLogin} className="px-6 py-2.5 text-sm font-bold text-white hover:text-[var(--color-primary)] transition-colors">
                Sign In
              </button>
            )}
            {(!landingPageSettings || landingPageSettings.enableRegistration) && (
              <button onClick={onGetStarted} className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black rounded-xl hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all">
                Get Started
              </button>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-text-secondary hover:text-white">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden pt-24 px-6 pb-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <button onClick={() => navigateToPage('/')} className="text-2xl font-display font-bold text-left hover:text-[var(--color-primary)] transition-colors">Home</button>
            <button onClick={() => navigateToPage('/features')} className="text-2xl font-display font-bold text-left hover:text-[var(--color-primary)] transition-colors">Features</button>
            <button onClick={() => navigateToPage('/pricing')} className="text-2xl font-display font-bold text-left hover:text-[var(--color-primary)] transition-colors">Pricing</button>
            <button onClick={() => navigateToPage('/about')} className="text-2xl font-display font-bold text-left hover:text-[var(--color-primary)] transition-colors">About</button>
            <button onClick={() => navigateToPage('/contact')} className="text-2xl font-display font-bold text-left hover:text-[var(--color-primary)] transition-colors">Contact</button>
            
            <div className="h-px bg-white/10 my-4" />
            

            {(!landingPageSettings || landingPageSettings.enableLogin) && (
              <button onClick={onLogin} className="w-full px-6 py-4 text-center font-bold text-white bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                Sign In
              </button>
            )}
            {(!landingPageSettings || landingPageSettings.enableRegistration) && (
              <button onClick={onGetStarted} className="w-full px-6 py-4 text-center font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black rounded-xl hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all">
                Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
