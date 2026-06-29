import React, { useState, useRef, useMemo } from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import { X, Upload, Search, Filter, Trash2, Image as ImageIcon, Folder, Check, FileEdit } from 'lucide-react';

interface MediaLibraryProps {
  onClose: () => void;
  onSelect: (url: string) => void;
  defaultFolder?: string;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onClose, onSelect, defaultFolder = 'About' }) => {
  const { mediaLibrary, addMediaAsset, deleteMediaAsset } = useDatabase();
  const { alert } = useModal();
  const [activeFolder, setActiveFolder] = useState<string>(defaultFolder);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const folders = ['All', 'Hero', 'About', 'Gallery', 'Team', 'Branches', 'Testimonials', 'Features', 'Icons', 'Logos', 'Other'];

  const filteredMedia = useMemo(() => {
    return mediaLibrary.filter(asset => {
      const matchFolder = activeFolder === 'All' || asset.folder === activeFolder;
      const matchSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFolder && matchSearch;
    });
  }, [mediaLibrary, activeFolder, searchTerm]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    
    // Max 10MB limit (10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      await alert('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      // For SVG, just save it directly to preserve vector quality
      if (file.type === 'image/svg+xml') {
        const dataUrl = event.target?.result as string;
        const sizeKb = Math.round((dataUrl.length * (3/4)) / 1024);
        addMediaAsset({
          name: file.name,
          url: dataUrl,
          folder: activeFolder === 'All' ? 'Other' : activeFolder as any,
          sizeKb
        });
        setIsUploading(false);
        return;
      }

      // For other images, use Canvas compression
      const img = new Image();
      img.onload = () => {
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
          const dataUrl = canvas.toDataURL('image/webp', 0.85); // Convert to WEBP
          const sizeKb = Math.round((dataUrl.length * (3/4)) / 1024);
          
          addMediaAsset({
            name: file.name,
            url: dataUrl,
            folder: activeFolder === 'All' ? 'Other' : activeFolder as any,
            sizeKb
          });
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-[var(--bg-app)] border border-[var(--border-card)] w-full max-w-6xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-card)] flex justify-between items-center bg-black/40">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="text-[var(--color-primary)]" />
              Media Library
            </h2>
            <p className="text-sm text-text-muted">Manage your website's images and assets locally</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-white bg-surface-dark rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Folders */}
          <div className="w-64 border-r border-[var(--border-card)] bg-black/20 p-4 flex flex-col gap-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 px-2">Folders</h3>
            {folders.map(folder => (
              <button 
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFolder === folder ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-text-secondary hover:text-white hover:bg-surface-dark'
                }`}
              >
                <Folder size={16} />
                {folder}
                {folder !== 'All' && (
                  <span className="ml-auto text-[10px] bg-surface-dark px-1.5 py-0.5 rounded text-text-muted">
                    {mediaLibrary.filter(m => m.folder === folder).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-[var(--bg-app)] overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-[var(--border-card)] flex items-center justify-between gap-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-[var(--border-card)] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              <div className="flex gap-3">
                <label className={`cursor-pointer px-4 py-2 bg-[var(--color-primary)] text-black font-bold text-sm rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isUploading ? (
                    <span className="animate-pulse flex items-center gap-2"><Upload size={16} /> Uploading...</span>
                  ) : (
                    <><Upload size={16} /> Upload New</>
                  )}
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              {filteredMedia.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-[var(--border-card)] rounded-2xl p-8">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <h3 className="text-white font-bold mb-1">No images found</h3>
                  <p className="text-sm">Upload an image to get started</p>
                  
                  <label className="mt-6 cursor-pointer px-6 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-sm rounded-xl hover:bg-[var(--color-primary)] hover:text-black transition-all flex items-center gap-2">
                    <Upload size={18} /> Browse Computer
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/svg+xml" onChange={handleFileUpload} />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredMedia.map(asset => (
                    <div key={asset.id} className="group relative bg-surface-dark border border-[var(--border-card)] rounded-xl overflow-hidden hover:border-[var(--color-primary)] transition-colors">
                      <div className="aspect-square bg-black p-2 flex items-center justify-center">
                        <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="p-3 border-t border-[var(--border-card)] bg-surface-dark">
                        <p className="text-xs text-white font-medium truncate" title={asset.name}>{asset.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{asset.sizeKb} KB • {new Date(asset.uploadDate).toLocaleDateString()}</p>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                        <button onClick={() => onSelect(asset.url)} className="px-4 py-2 bg-[var(--color-primary)] text-black text-xs font-bold rounded-lg flex items-center gap-2 hover:scale-105 transition-transform">
                          <Check size={14} /> Select Image
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => deleteMediaAsset(asset.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
