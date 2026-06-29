import React, { useState } from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import type { MediaAsset } from '../../../data/seedData';
import { UploadCloud, Folder, Search, Grid, List, Trash2, Link as LinkIcon } from 'lucide-react';

export const MediaLibraryEditor: React.FC = () => {
  const { mediaLibrary, setMediaLibrary } = useDatabase();
  const { alert } = useModal();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // This is just a simulated UI, in a real app it would upload to a server.
  const handleSimulatedUpload = async () => {
    await alert("Simulated upload successful.");
  };

  const filteredMedia = mediaLibrary.filter(m => 
    (filter === 'all' || m.folder.toLowerCase() === filter.toLowerCase()) && 
    (m.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Media Library</h3>
        <button onClick={handleSimulatedUpload} className="px-4 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2">
          <UploadCloud size={16} /> Upload New
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-64 shrink-0 space-y-2">
          <h4 className="text-text-secondary font-bold text-xs uppercase tracking-wider mb-3">Folders</h4>
          {['all', 'Hero', 'About', 'Gallery', 'Team', 'Branches', 'Testimonials', 'Features', 'Icons', 'Logos', 'Other'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${filter === f ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold' : 'text-text-secondary hover:bg-[var(--bg-app)] hover:text-white'}`}
            >
              <Folder size={16} className={filter === f ? 'text-[var(--color-primary)]' : 'text-text-muted'} />
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="w-full bg-[var(--bg-app)] border border-[var(--border-card)] text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div className="flex bg-[var(--bg-app)] border border-[var(--border-card)] rounded-lg p-1">
              <button className="p-1.5 bg-[var(--bg-card)] text-[var(--color-primary)] rounded"><Grid size={16} /></button>
              <button className="p-1.5 text-text-muted hover:text-white rounded"><List size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMedia.map(asset => (
              <div key={asset.id} className="bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl overflow-hidden group">
                <div className="h-32 bg-[var(--bg-card)] relative">
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors" title="Copy Link"><LinkIcon size={16} /></button>
                    <button className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500 text-white transition-colors" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{asset.sizeKb} KB • {new Date(asset.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {filteredMedia.length === 0 && (
              <div className="col-span-full py-12 text-center text-text-muted">
                No media found in this folder.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
