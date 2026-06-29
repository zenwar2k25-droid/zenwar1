import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X, Trash2 } from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ 
  label, value, onChange, folder = 'About', className = '' 
}) => {
  const [showLibrary, setShowLibrary] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      
      <div className="relative group rounded-xl border-2 border-dashed border-[var(--border-card)] bg-surface-dark overflow-hidden transition-all hover:border-[var(--color-primary)]">
        {value ? (
          <div className="relative w-full aspect-video flex items-center justify-center bg-black">
            <img src={value} alt={label} className="max-w-full max-h-full object-contain" />
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
              <button 
                onClick={() => setShowLibrary(true)}
                className="px-4 py-2 bg-[var(--color-primary)] text-black text-sm font-bold rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Upload size={16} /> Replace
              </button>
              <button 
                onClick={() => onChange('')}
                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setShowLibrary(true)}
            className="w-full aspect-video flex flex-col items-center justify-center cursor-pointer text-text-muted hover:text-[var(--color-primary)] transition-colors p-6 text-center"
          >
            <ImageIcon size={32} className="mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm font-bold">Browse or Upload</span>
            <span className="text-xs mt-1">PNG, JPG, WEBP, SVG</span>
          </div>
        )}
      </div>

      {showLibrary && (
        <MediaLibrary 
          onClose={() => setShowLibrary(false)} 
          defaultFolder={folder}
          onSelect={(url) => {
            onChange(url);
            setShowLibrary(false);
          }} 
        />
      )}
    </div>
  );
};
