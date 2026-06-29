import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';

export const PagePreview: React.FC = () => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const getWidth = () => {
    switch(device) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      case 'desktop': return 'w-full';
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center bg-[var(--bg-app)] border border-[var(--border-card)] rounded-lg p-1">
          <button 
            onClick={() => setDevice('desktop')} 
            className={`px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors ${device === 'desktop' ? 'bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm' : 'text-text-muted hover:text-white'}`}
          >
            <Monitor size={16} /> Desktop
          </button>
          <button 
            onClick={() => setDevice('tablet')} 
            className={`px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors ${device === 'tablet' ? 'bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm' : 'text-text-muted hover:text-white'}`}
          >
            <Tablet size={16} /> Tablet
          </button>
          <button 
            onClick={() => setDevice('mobile')} 
            className={`px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors ${device === 'mobile' ? 'bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm' : 'text-text-muted hover:text-white'}`}
          >
            <Smartphone size={16} /> Mobile
          </button>
        </div>
        
        <a href="/?draft=true" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors border border-[var(--border-card)] rounded-lg bg-[var(--bg-app)]">
          Open in New Tab <ExternalLink size={14} />
        </a>
      </div>

      <div className="flex-1 bg-black/40 rounded-xl border border-[var(--border-card)] overflow-hidden flex items-center justify-center p-4">
        <div className={`${getWidth()} h-full bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ring-1 ring-white/10 relative`}>
          {/* We load the landing page with draft=true to render the draft state */}
          <iframe 
            src="/?draft=true" 
            className="w-full h-full border-none" 
            title="Landing Page Preview"
          />
        </div>
      </div>
    </div>
  );
};
