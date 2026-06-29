import React, { useState } from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { demoAboutPageConfig } from '../../../data/seedData';
import { ImageUploadField } from './ImageUploadField';

export const AboutPageEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const { alert } = useModal();
  const [activeTab, setActiveTab] = useState('hero');

  const config = draftWebsiteState?.aboutPage || demoAboutPageConfig;

  const handleUpdate = async (updates: Partial<typeof config>) => {
    await saveDraft({ aboutPage: { ...config, ...updates } });
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleUpdate({ [name]: value });
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'story', label: 'Company Story' },
    { id: 'history', label: 'History & Timeline' },
    { id: 'mission', label: 'Mission & Vision' },
    { id: 'values', label: 'Core Values' },
    { id: 'ceo', label: 'CEO & Founder' },
    { id: 'leadership', label: 'Leadership Team' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'office', label: 'Office Images' },
    { id: 'achievements', label: 'Achievements' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display">About Page Settings</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <span className={config.active ? 'text-white' : ''}>{config.active ? 'Enabled' : 'Disabled'}</span>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${config.active ? 'bg-[var(--color-primary)]' : 'bg-surface-dark'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${config.active ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" className="hidden" checked={config.active} onChange={(e) => handleUpdate({ active: e.target.checked })} />
          </label>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-card)] pb-4 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[var(--color-primary)] text-black' : 'bg-surface-dark text-text-secondary hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'hero' && (
        <div className="space-y-6 bg-surface-dark p-6 rounded-xl border border-[var(--border-card)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField 
              label="Hero Banner Image (Foreground)" 
              value={config.heroBanner || ''} 
              onChange={(url) => handleUpdate({ heroBanner: url })}
              folder="Hero"
            />
            <ImageUploadField 
              label="Hero Background Image" 
              value={config.heroBgImage || ''} 
              onChange={(url) => handleUpdate({ heroBgImage: url })}
              folder="Hero"
            />
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Page Title</label>
              <input type="text" name="aboutTitle" value={config.aboutTitle || ''} onChange={handleGeneralChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Company Description</label>
              <textarea name="companyDescription" value={config.companyDescription || ''} onChange={handleGeneralChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white h-24" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'story' && (
        <div className="space-y-6 bg-surface-dark p-6 rounded-xl border border-[var(--border-card)]">
          <ImageUploadField 
            label="Company Image" 
            value={config.companyImage || ''} 
            onChange={(url) => handleUpdate({ companyImage: url })}
            folder="About"
          />
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Company History Text</label>
            <textarea name="history" value={config.history || ''} onChange={handleGeneralChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white h-48" />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <p className="text-text-secondary text-sm">Add and edit events in the company's journey.</p>
          {(config.timeline || []).sort((a: any, b: any) => a.order - b.order).map((event: any, index: number) => (
            <div key={event.id} className="bg-surface-dark border border-[var(--border-card)] p-4 rounded-xl flex gap-4">
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => {
                    if (index === 0) return;
                    const nt = [...config.timeline];
                    const temp = nt[index];
                    nt[index] = nt[index - 1];
                    nt[index - 1] = temp;
                    nt.forEach((t, i) => t.order = i);
                    handleUpdate({ timeline: nt });
                  }} 
                  className="text-text-muted hover:text-white"
                >↑</button>
                <GripVertical className="w-5 h-5 text-text-secondary cursor-move" />
                <button 
                  onClick={() => {
                    if (index === config.timeline.length - 1) return;
                    const nt = [...config.timeline];
                    const temp = nt[index];
                    nt[index] = nt[index + 1];
                    nt[index + 1] = temp;
                    nt.forEach((t, i) => t.order = i);
                    handleUpdate({ timeline: nt });
                  }} 
                  className="text-text-muted hover:text-white"
                >↓</button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <input type="text" placeholder="Year" value={event.year} onChange={(e) => {
                    const nt = config.timeline.map((t: any) => t.id === event.id ? { ...t, year: e.target.value } : t);
                    handleUpdate({ timeline: nt });
                  }} className="col-span-1 bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
                  <input type="text" placeholder="Title" value={event.title} onChange={(e) => {
                    const nt = config.timeline.map((t: any) => t.id === event.id ? { ...t, title: e.target.value } : t);
                    handleUpdate({ timeline: nt });
                  }} className="col-span-3 bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
                </div>
                <textarea placeholder="Description" value={event.description} onChange={(e) => {
                  const nt = config.timeline.map((t: any) => t.id === event.id ? { ...t, description: e.target.value } : t);
                  handleUpdate({ timeline: nt });
                }} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm h-20" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploadField 
                    label="Timeline Banner Image" 
                    value={event.bannerImage || ''} 
                    onChange={(url) => {
                      const nt = config.timeline.map((t: any) => t.id === event.id ? { ...t, bannerImage: url } : t);
                      handleUpdate({ timeline: nt });
                    }}
                    folder="About"
                  />
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Additional Images (Max 3)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map(imgIdx => (
                        <ImageUploadField 
                          key={imgIdx}
                          label={`Img ${imgIdx + 1}`} 
                          value={event.images?.[imgIdx] || ''} 
                          onChange={(url) => {
                            const newImages = [...(event.images || [])];
                            newImages[imgIdx] = url;
                            const nt = config.timeline.map((t: any) => t.id === event.id ? { ...t, images: newImages.filter(Boolean) } : t);
                            handleUpdate({ timeline: nt });
                          }}
                          folder="About"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => {
                  const nt = config.timeline.map((t: any) => t.id === event.id ? { ...t, active: !t.active } : t);
                  handleUpdate({ timeline: nt });
                }} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${event.active ? 'bg-green-500/20 text-green-500' : 'bg-surface text-text-secondary'}`}>
                  {event.active ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => {
                  handleUpdate({ timeline: config.timeline.filter((t: any) => t.id !== event.id) });
                }} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/20 text-red-500">
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => {
            const nt = [...(config.timeline || []), { id: Date.now().toString(), year: '2026', title: 'New Event', description: '', bannerImage: '', images: [], order: (config.timeline?.length || 0) + 1, active: true }];
            handleUpdate({ timeline: nt });
          }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--border-card)] text-text-secondary hover:text-white hover:border-white transition-colors">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      )}

      {activeTab === 'mission' && (
        <div className="space-y-6 bg-surface-dark p-6 rounded-xl border border-[var(--border-card)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Mission Statement</label>
              <textarea name="mission" value={config.mission || ''} onChange={handleGeneralChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white h-32" />
              <ImageUploadField 
                label="Mission Image" 
                value={config.missionImage || ''} 
                onChange={(url) => handleUpdate({ missionImage: url })}
                folder="About"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Vision Statement</label>
              <textarea name="vision" value={config.vision || ''} onChange={handleGeneralChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white h-32" />
              <ImageUploadField 
                label="Vision Image" 
                value={config.visionImage || ''} 
                onChange={(url) => handleUpdate({ visionImage: url })}
                folder="About"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'values' && (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">Add company core values with icons and optional images.</p>
          {(config.coreValues || []).sort((a: any, b: any) => a.order - b.order).map((val: any, index: number) => (
             <div key={val.id} className="bg-surface-dark border border-[var(--border-card)] p-4 rounded-xl flex gap-4">
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <input type="text" placeholder="Title" value={val.title} onChange={(e) => {
                      const nv = config.coreValues.map((v: any) => v.id === val.id ? { ...v, title: e.target.value } : v);
                      handleUpdate({ coreValues: nv });
                    }} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
                    <textarea placeholder="Description" value={val.description} onChange={(e) => {
                      const nv = config.coreValues.map((v: any) => v.id === val.id ? { ...v, description: e.target.value } : v);
                      handleUpdate({ coreValues: nv });
                    }} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm h-24" />
                 </div>
                 <div className="space-y-4">
                   <ImageUploadField 
                      label="Icon (SVG recommended)" 
                      value={val.iconUrl || ''} 
                      onChange={(url) => {
                        const nv = config.coreValues.map((v: any) => v.id === val.id ? { ...v, iconUrl: url } : v);
                        handleUpdate({ coreValues: nv });
                      }}
                      folder="Icons"
                   />
                   <ImageUploadField 
                      label="Background Image (Optional)" 
                      value={val.imageUrl || ''} 
                      onChange={(url) => {
                        const nv = config.coreValues.map((v: any) => v.id === val.id ? { ...v, imageUrl: url } : v);
                        handleUpdate({ coreValues: nv });
                      }}
                      folder="About"
                   />
                 </div>
               </div>
               <button onClick={() => {
                  handleUpdate({ coreValues: config.coreValues.filter((v: any) => v.id !== val.id) });
                }} className="self-start p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 size={16} />
                </button>
             </div>
          ))}
          <button onClick={() => {
            const nv = [...(config.coreValues || []), { id: Date.now().toString(), title: 'New Value', description: '', iconUrl: '', imageUrl: '', order: (config.coreValues?.length || 0) + 1, active: true }];
            handleUpdate({ coreValues: nv });
          }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--border-card)] text-text-secondary hover:text-white hover:border-white transition-colors">
            <Plus className="w-4 h-4" /> Add Core Value
          </button>
        </div>
      )}

      {activeTab === 'ceo' && (
        <div className="space-y-6 bg-surface-dark p-6 rounded-xl border border-[var(--border-card)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ImageUploadField 
                label="CEO / Founder Photo" 
                value={config.ceoPhoto || ''} 
                onChange={(url) => handleUpdate({ ceoPhoto: url })}
                folder="Team"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Message from CEO</label>
              <textarea name="ceoMessage" value={config.ceoMessage || ''} onChange={handleGeneralChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white h-48" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leadership' && (
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">Manage the leadership team shown on the About page.</p>
          <button onClick={() => {
            const nt = [...(config.leadership || []), { id: Date.now().toString(), name: 'New Leader', designation: 'Role', description: '', photoUrl: '', socialLinks: { linkedin: '', twitter: '' }, order: (config.leadership?.length || 0) + 1, active: true }];
            handleUpdate({ leadership: nt });
          }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-black font-bold text-sm">
            <Plus className="w-4 h-4" /> Add Leader
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(config.leadership || []).sort((a: any, b: any) => a.order - b.order).map((leader: any) => (
              <div key={leader.id} className="bg-surface-dark border border-[var(--border-card)] p-4 rounded-xl flex gap-4">
                <div className="flex-1 space-y-3">
                  <input type="text" placeholder="Name" value={leader.name} onChange={(e) => {
                    const nl = config.leadership.map((l: any) => l.id === leader.id ? { ...l, name: e.target.value } : l);
                    handleUpdate({ leadership: nl });
                  }} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
                  <input type="text" placeholder="Designation" value={leader.designation} onChange={(e) => {
                    const nl = config.leadership.map((l: any) => l.id === leader.id ? { ...l, designation: e.target.value } : l);
                    handleUpdate({ leadership: nl });
                  }} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
                  <textarea placeholder="Description" value={leader.description} onChange={(e) => {
                    const nl = config.leadership.map((l: any) => l.id === leader.id ? { ...l, description: e.target.value } : l);
                    handleUpdate({ leadership: nl });
                  }} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm h-16" />
                </div>
                <div className="w-32 shrink-0 flex flex-col gap-2">
                  <ImageUploadField 
                    label="Profile Photo" 
                    value={leader.photoUrl || ''} 
                    onChange={(url) => {
                      const nl = config.leadership.map((l: any) => l.id === leader.id ? { ...l, photoUrl: url } : l);
                      handleUpdate({ leadership: nl });
                    }}
                    folder="Team"
                  />
                  <div className="flex gap-1 mt-auto">
                    <button onClick={() => {
                      handleUpdate({ leadership: config.leadership.filter((l: any) => l.id !== leader.id) });
                    }} className="flex-1 px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-bold">Del</button>
                    <button onClick={() => {
                      const nl = config.leadership.map((l: any) => l.id === leader.id ? { ...l, active: !l.active } : l);
                      handleUpdate({ leadership: nl });
                    }} className={`flex-1 px-2 py-1 rounded text-xs font-bold ${leader.active ? 'bg-green-500/20 text-green-500' : 'bg-surface text-text-secondary'}`}>
                      {leader.active ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-surface-dark p-4 rounded-xl border border-[var(--border-card)]">
             <div>
                <h3 className="text-white font-bold text-lg">Company Gallery ({config.gallery?.length || 0}/30)</h3>
                <p className="text-xs text-text-muted mt-1">Upload up to 30 images. Drag to reorder.</p>
             </div>
             <button onClick={async () => {
                if ((config.gallery?.length || 0) >= 30) return await alert('Maximum 30 images allowed.');
                const ng = [...(config.gallery || []), '']; // Add placeholder
                handleUpdate({ gallery: ng });
             }} className="px-4 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg flex items-center gap-2 text-sm">
                <Plus size={16} /> Add Image
             </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {(config.gallery || []).map((url: string, index: number) => (
               <div key={index} className="relative group">
                  <ImageUploadField 
                    label={`Gallery Image ${index + 1}`} 
                    value={url} 
                    onChange={(newUrl) => {
                      const ng = [...config.gallery];
                      ng[index] = newUrl;
                      handleUpdate({ gallery: ng });
                    }}
                    folder="Gallery"
                  />
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                     <button onClick={() => {
                        const ng = [...config.gallery];
                        ng.splice(index, 1);
                        handleUpdate({ gallery: ng });
                     }} className="p-1 bg-red-500 text-white rounded-full shadow-lg">
                        <Trash2 size={12} />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'office' && (
        <div className="space-y-6 bg-surface-dark p-6 rounded-xl border border-[var(--border-card)]">
          <p className="text-text-secondary text-sm mb-4">Upload pictures of your workspace.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ImageUploadField 
               label="Office Exterior" 
               value={config.officeImages?.exterior || ''} 
               onChange={(url) => handleUpdate({ officeImages: { ...config.officeImages, exterior: url } as any })}
               folder="About"
             />
             <ImageUploadField 
               label="Office Interior" 
               value={config.officeImages?.interior || ''} 
               onChange={(url) => handleUpdate({ officeImages: { ...config.officeImages, interior: url } as any })}
               folder="About"
             />
             <ImageUploadField 
               label="Reception Area" 
               value={config.officeImages?.reception || ''} 
               onChange={(url) => handleUpdate({ officeImages: { ...config.officeImages, reception: url } as any })}
               folder="About"
             />
             <ImageUploadField 
               label="Meeting Room" 
               value={config.officeImages?.meetingRoom || ''} 
               onChange={(url) => handleUpdate({ officeImages: { ...config.officeImages, meetingRoom: url } as any })}
               folder="About"
             />
          </div>
          <div>
            <div className="flex justify-between items-center mb-4 mt-8 border-t border-[var(--border-card)] pt-6">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Team Photos (Max 10)</label>
                <button onClick={() => {
                    const tp = [...(config.officeImages?.teamPhotos || []), ''];
                    handleUpdate({ officeImages: { ...config.officeImages, teamPhotos: tp } as any });
                }} className="text-[var(--color-primary)] text-xs font-bold flex items-center gap-1">
                    <Plus size={14} /> Add Team Photo
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {(config.officeImages?.teamPhotos || []).map((url: string, index: number) => (
                 <div key={index} className="relative group">
                    <ImageUploadField 
                      label={`Photo ${index + 1}`} 
                      value={url} 
                      onChange={(newUrl) => {
                        const tp = [...(config.officeImages?.teamPhotos || [])];
                        tp[index] = newUrl;
                        handleUpdate({ officeImages: { ...config.officeImages, teamPhotos: tp } as any });
                      }}
                      folder="Team"
                    />
                    <button onClick={() => {
                        const tp = [...(config.officeImages?.teamPhotos || [])];
                        tp.splice(index, 1);
                        handleUpdate({ officeImages: { ...config.officeImages, teamPhotos: tp } as any });
                    }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10">
                        <Trash2 size={12} />
                    </button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6 bg-surface-dark p-6 rounded-xl border border-[var(--border-card)]">
          <div>
             <div className="flex justify-between items-center mb-4">
                 <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Awards</label>
                 <button onClick={() => {
                     const arr = [...(config.achievements?.awards || []), ''];
                     handleUpdate({ achievements: { ...config.achievements, awards: arr } as any });
                 }} className="text-[var(--color-primary)] text-xs font-bold flex items-center gap-1"><Plus size={14} /> Add</button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {(config.achievements?.awards || []).map((url: string, index: number) => (
                    <div key={index} className="relative group">
                       <ImageUploadField label={`Award ${index + 1}`} value={url} folder="Other" onChange={(newUrl) => {
                           const arr = [...(config.achievements?.awards || [])];
                           arr[index] = newUrl;
                           handleUpdate({ achievements: { ...config.achievements, awards: arr } as any });
                       }} />
                       <button onClick={() => {
                           const arr = [...(config.achievements?.awards || [])];
                           arr.splice(index, 1);
                           handleUpdate({ achievements: { ...config.achievements, awards: arr } as any });
                       }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10"><Trash2 size={12} /></button>
                    </div>
                 ))}
             </div>
          </div>
          
          <div className="border-t border-[var(--border-card)] pt-6">
             <div className="flex justify-between items-center mb-4">
                 <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Certificates</label>
                 <button onClick={() => {
                     const arr = [...(config.achievements?.certificates || []), ''];
                     handleUpdate({ achievements: { ...config.achievements, certificates: arr } as any });
                 }} className="text-[var(--color-primary)] text-xs font-bold flex items-center gap-1"><Plus size={14} /> Add</button>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {(config.achievements?.certificates || []).map((url: string, index: number) => (
                    <div key={index} className="relative group">
                       <ImageUploadField label={`Certificate ${index + 1}`} value={url} folder="Other" onChange={(newUrl) => {
                           const arr = [...(config.achievements?.certificates || [])];
                           arr[index] = newUrl;
                           handleUpdate({ achievements: { ...config.achievements, certificates: arr } as any });
                       }} />
                       <button onClick={() => {
                           const arr = [...(config.achievements?.certificates || [])];
                           arr.splice(index, 1);
                           handleUpdate({ achievements: { ...config.achievements, certificates: arr } as any });
                       }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 z-10"><Trash2 size={12} /></button>
                    </div>
                 ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
