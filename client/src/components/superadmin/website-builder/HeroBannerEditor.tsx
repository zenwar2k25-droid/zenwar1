import React, { useState, useRef } from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import type { HeroBanner, HeroBannerAction } from '../../../data/seedData';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Settings, Upload, MoveUp, MoveDown } from 'lucide-react';

const BANNER_ACTIONS: HeroBannerAction[] = [
  'No Action',
  'Open Starter Plan',
  'Open Pro Plan',
  'Open Enterprise Plan',
  'Open Custom Subscription Plan',
  'Open Contact Form',
  'Open Registration Form',
  'Open Pricing Section',
  'Scroll to Features',
  'Scroll to FAQ',
  'Scroll to Contact Section'
];

export const HeroBannerEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft, addMediaAsset } = useDatabase();
  const { alert } = useModal();
  const data = draftWebsiteState?.heroBanners || [];
  const settings = draftWebsiteState?.heroSliderSettings;
  const [activeTab, setActiveTab] = useState<'banners' | 'settings'>('banners');
  const [isUploading, setIsUploading] = useState<string | null>(null);

  if (!draftWebsiteState) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleAddBanner = async () => {
    if (data.length >= 10) return await alert('Maximum 10 banners allowed.');
    const newBanner: HeroBanner = {
      id: `banner-${Date.now()}`,
      name: `Banner ${data.length + 1}`,
      imageUrl: '', // Blank initially
      order: data.length,
      action: 'No Action',
      active: true
    };
    saveDraft({ heroBanners: [...data, newBanner] });
  };

  const updateBanner = (id: string, field: keyof HeroBanner, value: any) => {
    const updated = data.map(b => b.id === id ? { ...b, [field]: value } : b);
    saveDraft({ heroBanners: updated });
  };

  const removeBanner = (id: string) => {
    saveDraft({ heroBanners: data.filter(b => b.id !== id) });
  };

  const moveBanner = (id: string, direction: 'up' | 'down') => {
    const currentIndex = data.findIndex(b => b.id === id);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === data.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newData = [...data];
    const temp = newData[currentIndex];
    newData[currentIndex] = newData[newIndex];
    newData[newIndex] = temp;

    // Update order property
    const reorderedData = newData.map((b, i) => ({ ...b, order: i }));
    saveDraft({ heroBanners: reorderedData });
  };

  const updateSettings = (field: string, value: any) => {
    if (settings) {
      saveDraft({ heroSliderSettings: { ...settings, [field]: value } });
    }
  };

  const processImageUpload = async (file: File, bannerId: string) => {
    if (!file.type.startsWith('image/')) {
      await alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      await alert('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(bannerId);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compress using Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export compressed base64 (WEBP format is highly efficient)
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          
          // Save to media library
          const sizeKb = Math.round((dataUrl.length * (3/4)) / 1024);
          const newMedia = addMediaAsset({
            name: file.name,
            url: dataUrl,
            folder: 'Hero',
            sizeKb
          });

          // Update banner
          const updated = data.map(b => b.id === bannerId ? { ...b, imageUrl: dataUrl, mediaId: newMedia.id } : b);
          saveDraft({ heroBanners: updated });
          setIsUploading(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex border-b border-[var(--border-card)]">
        <button onClick={() => setActiveTab('banners')} className={`px-6 py-3 font-bold border-b-2 transition-all ${activeTab === 'banners' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-text-secondary hover:text-white'}`}>Banners</button>
        <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 font-bold border-b-2 transition-all ${activeTab === 'settings' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-text-secondary hover:text-white'}`}>Slider Settings</button>
      </div>

      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl border border-[var(--border-card)]">
            <div>
              <h3 className="text-white font-bold text-lg">Manage Banners ({data.length}/10)</h3>
              <p className="text-xs text-text-muted mt-1">Recommended size: 820×312 pixels. Max 5MB per image.</p>
            </div>
            <button onClick={handleAddBanner} disabled={data.length >= 10} className="px-4 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus size={16} /> Add Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.sort((a, b) => a.order - b.order).map((banner, index) => (
              <div key={banner.id} className="bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-4 flex gap-4 items-start group">
                <div className="flex flex-col gap-2 mt-1">
                  <button onClick={() => moveBanner(banner.id, 'up')} disabled={index === 0} className="text-text-muted hover:text-white disabled:opacity-30">
                    <MoveUp size={16} />
                  </button>
                  <div className="text-text-muted text-center text-xs">{index + 1}</div>
                  <button onClick={() => moveBanner(banner.id, 'down')} disabled={index === data.length - 1} className="text-text-muted hover:text-white disabled:opacity-30">
                    <MoveDown size={16} />
                  </button>
                </div>
                
                <div className="w-32 h-20 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden shrink-0 flex items-center justify-center relative group/img">
                  {banner.imageUrl ? (
                    <>
                      <img src={banner.imageUrl} alt={banner.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <label className="cursor-pointer text-[var(--color-primary)] font-bold text-xs flex flex-col items-center gap-1">
                          <Upload size={14} /> Replace
                          <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => e.target.files?.[0] && processImageUpload(e.target.files[0], banner.id)} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-text-muted hover:text-[var(--color-primary)] transition-colors">
                      {isUploading === banner.id ? (
                        <span className="text-xs animate-pulse">Uploading...</span>
                      ) : (
                        <>
                          <Upload size={20} className="mb-1" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Browse</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => e.target.files?.[0] && processImageUpload(e.target.files[0], banner.id)} />
                    </label>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <input type="text" value={banner.name} onChange={(e) => updateBanner(banner.id, 'name', e.target.value)} className="w-full bg-transparent border-b border-[var(--border-card)] text-white font-bold px-1 py-1 focus:border-[var(--color-primary)] outline-none" placeholder="Banner Name" />
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">On Click Action</label>
                    <select 
                      value={banner.action || 'No Action'} 
                      onChange={(e) => updateBanner(banner.id, 'action', e.target.value)}
                      className="w-full text-xs bg-[var(--bg-card)] border border-[var(--border-card)] text-white px-2 py-1.5 rounded outline-none"
                    >
                      {BANNER_ACTIONS.map(act => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-card)]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={banner.active} onChange={(e) => updateBanner(banner.id, 'active', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
                      <span className="text-xs text-text-secondary font-medium">Publish Live</span>
                    </label>
                    <button onClick={() => removeBanner(banner.id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-[var(--border-card)] pb-2 flex items-center gap-2">
              <Settings size={18} className="text-[var(--color-primary)]" /> Playback & Controls
            </h4>
            <div className="flex items-center justify-between bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-card)]">
              <span className="text-sm text-white">Autoplay Slider</span>
              <input type="checkbox" checked={settings.autoplay} onChange={(e) => updateSettings('autoplay', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
            </div>
            <div className="flex items-center justify-between bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-card)]">
              <span className="text-sm text-white">Infinite Loop</span>
              <input type="checkbox" checked={settings.loop} onChange={(e) => updateSettings('loop', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
            </div>
            <div className="flex items-center justify-between bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-card)]">
              <span className="text-sm text-white">Pause on Hover</span>
              <input type="checkbox" checked={settings.pauseOnHover} onChange={(e) => updateSettings('pauseOnHover', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
            </div>
            <div className="flex items-center justify-between bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-card)]">
              <span className="text-sm text-white">Show Previous/Next Arrows</span>
              <input type="checkbox" checked={settings.showArrows} onChange={(e) => updateSettings('showArrows', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
            </div>
            <div className="flex items-center justify-between bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-card)]">
              <span className="text-sm text-white">Show Pagination Dots</span>
              <input type="checkbox" checked={settings.showDots} onChange={(e) => updateSettings('showDots', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-[var(--border-card)] pb-2">Timing, Effects & Optimization</h4>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Slide Duration (ms)</label>
              <input type="number" value={settings.slideDuration} onChange={(e) => updateSettings('slideDuration', Number(e.target.value))} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none" min={1000} step={500} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Transition Speed (ms)</label>
              <input type="number" value={settings.transitionSpeed} onChange={(e) => updateSettings('transitionSpeed', Number(e.target.value))} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none" min={100} step={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Animation Type</label>
              <select value={settings.animationType} onChange={(e) => updateSettings('animationType', e.target.value)} className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white px-3 py-2 rounded-lg outline-none">
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
              </select>
            </div>
            <div className="flex items-center justify-between bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-card)] mt-4">
              <span className="text-sm text-white">Enable Lazy Loading (SEO)</span>
              <input type="checkbox" checked={settings.lazyLoad} onChange={(e) => updateSettings('lazyLoad', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
            </div>
            <div className="flex items-center justify-between bg-[var(--bg-app)] p-3 rounded-lg border border-[var(--border-card)]">
              <span className="text-sm text-white">Mobile Optimized</span>
              <input type="checkbox" checked={settings.mobileOptimized} onChange={(e) => updateSettings('mobileOptimized', e.target.checked)} className="rounded border-[var(--border-card)] text-[var(--color-primary)] bg-[var(--bg-card)] focus:ring-[var(--color-primary)]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
