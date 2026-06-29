import React, { useState } from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import type { BranchLocation, BranchDirectoryMapSettings } from '../../../data/seedData';
import { LiveBranchMap } from '../../shared/LiveBranchMap';
import { Plus, Trash2, MapPin, Settings, Copy, Save, X, ChevronLeft, Image as ImageIcon, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

export const BranchDirectoryEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const { confirm } = useModal();
  const config = draftWebsiteState.branchDirectory;

  const [activeTab, setActiveTab] = useState<'branches' | 'settings'>('branches');
  const [editingBranch, setEditingBranch] = useState<BranchLocation | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  if (!config) {
    return <div className="p-8 text-center text-red-500">Branch Directory config missing!</div>;
  }

  const updateConfig = (updates: any) => {
    saveDraft({
      branchDirectory: {
        ...config,
        ...updates
      }
    });
  };

  const updateMapSettings = (settings: Partial<BranchDirectoryMapSettings>) => {
    updateConfig({
      mapSettings: { ...config.mapSettings, ...settings }
    });
  };

  const handleAddBranch = () => {
    const newBranch: BranchLocation = {
      id: `branch-${Date.now()}`,
      name: 'New Branch',
      branchCode: 'NEW',
      district: '',
      state: '',
      country: '',
      address: '',
      lat: config.mapSettings.defaultCenter.lat,
      lng: config.mapSettings.defaultCenter.lng,
      contactPerson: '',
      mobile: '',
      whatsapp: '',
      email: '',
      workingHours: '9 AM - 6 PM',
      businessStatus: 'Open',
      active: true,
      order: config.branches.length,
      pinColor: '#00f0ff'
    };
    updateConfig({ branches: [...config.branches, newBranch] });
    setEditingBranch(newBranch);
    setSelectedBranchId(newBranch.id);
  };

  const handleDeleteBranch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (await confirm('Delete this branch?')) {
      updateConfig({ branches: config.branches.filter((b: BranchLocation) => b.id !== id) });
      if (editingBranch?.id === id) setEditingBranch(null);
      if (selectedBranchId === id) setSelectedBranchId(null);
    }
  };

  const handleDuplicateBranch = (branch: BranchLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBranch = { ...branch, id: `branch-${Date.now()}`, name: `${branch.name} (Copy)` };
    updateConfig({ branches: [...config.branches, newBranch] });
  };

  const saveBranch = () => {
    if (!editingBranch) return;
    const newBranches = config.branches.map((b: BranchLocation) => b.id === editingBranch.id ? editingBranch : b);
    updateConfig({ branches: newBranches });
    setEditingBranch(null);
  };

  const handlePinDragEnd = (branchId: string, lat: number, lng: number) => {
    if (editingBranch && editingBranch.id === branchId) {
      setEditingBranch({ ...editingBranch, lat, lng });
    }
    const newBranches = config.branches.map((b: BranchLocation) => b.id === branchId ? { ...b, lat, lng } : b);
    updateConfig({ branches: newBranches });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left Panel - List / Form / Settings */}
      <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-4">
        
        {/* Tabs */}
        {!editingBranch && (
          <div className="flex gap-2 bg-[var(--bg-app)] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('branches')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'branches' ? 'bg-[var(--color-primary)] text-black' : 'text-text-secondary hover:text-white'}`}
            >
              <div className="flex items-center justify-center gap-2"><MapPin size={16} /> Branches</div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-[var(--color-primary)] text-black' : 'text-text-secondary hover:text-white'}`}
            >
              <div className="flex items-center justify-center gap-2"><Settings size={16} /> Map Settings</div>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[700px]">
          
          {/* BRANCH EDIT FORM */}
          {editingBranch && (
            <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <button onClick={saveBranch} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                  <span className="font-bold">Back to List</span>
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setEditingBranch(null)} className="px-4 py-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors">
                    Cancel
                  </button>
                  <button onClick={saveBranch} className="px-4 py-2 bg-[var(--color-primary)] text-black rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Branch Name</label>
                    <input 
                      type="text" 
                      value={editingBranch.name} 
                      onChange={e => setEditingBranch({ ...editingBranch, name: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Branch Code</label>
                    <input 
                      type="text" 
                      value={editingBranch.branchCode} 
                      onChange={e => setEditingBranch({ ...editingBranch, branchCode: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Contact Person</label>
                    <input 
                      type="text" 
                      value={editingBranch.contactPerson} 
                      onChange={e => setEditingBranch({ ...editingBranch, contactPerson: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editingBranch.email} 
                      onChange={e => setEditingBranch({ ...editingBranch, email: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Mobile</label>
                    <input 
                      type="text" 
                      value={editingBranch.mobile} 
                      onChange={e => setEditingBranch({ ...editingBranch, mobile: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">WhatsApp</label>
                    <input 
                      type="text" 
                      value={editingBranch.whatsapp} 
                      onChange={e => setEditingBranch({ ...editingBranch, whatsapp: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Full Address</label>
                  <textarea 
                    value={editingBranch.address} 
                    onChange={e => setEditingBranch({ ...editingBranch, address: e.target.value })}
                    rows={2}
                    className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">District</label>
                    <input 
                      type="text" 
                      value={editingBranch.district} 
                      onChange={e => setEditingBranch({ ...editingBranch, district: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">State</label>
                    <input 
                      type="text" 
                      value={editingBranch.state} 
                      onChange={e => setEditingBranch({ ...editingBranch, state: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Country</label>
                    <input 
                      type="text" 
                      value={editingBranch.country} 
                      onChange={e => setEditingBranch({ ...editingBranch, country: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Working Hours</label>
                    <input 
                      type="text" 
                      value={editingBranch.workingHours} 
                      onChange={e => setEditingBranch({ ...editingBranch, workingHours: e.target.value })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Business Status</label>
                    <select 
                      value={editingBranch.businessStatus} 
                      onChange={e => setEditingBranch({ ...editingBranch, businessStatus: e.target.value as any })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={editingBranch.lat} 
                      onChange={e => setEditingBranch({ ...editingBranch, lat: parseFloat(e.target.value) })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={editingBranch.lng} 
                      onChange={e => setEditingBranch({ ...editingBranch, lng: parseFloat(e.target.value) })}
                      className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2">Branch Image</label>
                  <ImageUploadField 
                    label="Branch Image"
                    value={editingBranch.imageUrl || ''} 
                    onChange={(url) => setEditingBranch({ ...editingBranch, imageUrl: url })}
                    folder="Branches"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Pin Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={editingBranch.pinColor || '#00f0ff'} 
                        onChange={e => setEditingBranch({ ...editingBranch, pinColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input 
                        type="text" 
                        value={editingBranch.pinColor || '#00f0ff'} 
                        onChange={e => setEditingBranch({ ...editingBranch, pinColor: e.target.value })}
                        className="flex-1 bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors w-full">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={editingBranch.active} 
                          onChange={(e) => setEditingBranch({ ...editingBranch, active: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </div>
                      <span className="font-bold text-sm">Branch Active</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* BRANCHES LIST */}
          {!editingBranch && activeTab === 'branches' && (
            <div className="space-y-3">
              <button onClick={handleAddBranch} className="w-full py-4 border border-dashed border-white/20 hover:border-[var(--color-primary)] rounded-2xl text-text-secondary hover:text-[var(--color-primary)] font-bold transition-colors flex items-center justify-center gap-2 bg-[var(--bg-app)]">
                <Plus size={20} /> Add New Branch
              </button>

              {config.branches.map((branch: BranchLocation) => (
                <div 
                  key={branch.id} 
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`bg-[var(--bg-app)] border rounded-2xl p-4 cursor-pointer transition-all ${selectedBranchId === branch.id ? 'border-[var(--color-primary)] shadow-[0_0_15px_rgba(0,240,255,0.15)] scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className="flex gap-4">
                    {branch.imageUrl ? (
                      <img src={branch.imageUrl} alt={branch.name} className="w-20 h-20 rounded-xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-[var(--bg-card)] border border-white/5 flex items-center justify-center">
                        <MapPin size={24} className="text-text-muted" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white leading-tight">{branch.name}</h4>
                          <span className="text-xs text-[var(--color-primary)] font-semibold">{branch.branchCode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setEditingBranch(branch); }} className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Settings size={16} />
                          </button>
                          <button onClick={(e) => handleDuplicateBranch(branch, e)} className="p-1.5 text-text-muted hover:text-blue-400 hover:bg-white/10 rounded-lg transition-colors">
                            <Copy size={16} />
                          </button>
                          <button onClick={(e) => handleDeleteBranch(branch.id, e)} className="p-1.5 text-text-muted hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{branch.district}, {branch.state}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${branch.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {branch.active ? 'Live' : 'Hidden'}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${branch.businessStatus === 'Open' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {branch.businessStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MAP SETTINGS */}
          {!editingBranch && activeTab === 'settings' && (
            <div className="bg-[var(--bg-app)] border border-white/10 rounded-2xl p-5 space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-bold text-white border-b border-white/10 pb-2">Viewport Settings</h3>
                
                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <div>
                    <span className="font-bold text-sm block">Auto Fit Branches</span>
                    <span className="text-xs text-text-muted">Automatically zoom to fit all branches on screen.</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={config.mapSettings.autoFitBranches} 
                      onChange={(e) => updateMapSettings({ autoFitBranches: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </label>

                {!config.mapSettings.autoFitBranches && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Default Zoom Level ({config.mapSettings.defaultZoom})</label>
                      <input 
                        type="range" min="1" max="18" 
                        value={config.mapSettings.defaultZoom}
                        onChange={(e) => updateMapSettings({ defaultZoom: parseInt(e.target.value) })}
                        className="w-full accent-[var(--color-primary)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Default Lat</label>
                        <input 
                          type="number" step="any"
                          value={config.mapSettings.defaultCenter.lat}
                          onChange={(e) => updateMapSettings({ defaultCenter: { ...config.mapSettings.defaultCenter, lat: parseFloat(e.target.value) } })}
                          className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">Default Lng</label>
                        <input 
                          type="number" step="any"
                          value={config.mapSettings.defaultCenter.lng}
                          onChange={(e) => updateMapSettings({ defaultCenter: { ...config.mapSettings.defaultCenter, lng: parseFloat(e.target.value) } })}
                          className="w-full bg-[var(--bg-card)] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-white border-b border-white/10 pb-2">Appearance</h3>
                
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2">Map Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['dark', 'light', 'satellite'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updateMapSettings({ mapTheme: theme as any })}
                        className={`py-2 rounded-xl border text-sm font-bold capitalize transition-all ${config.mapSettings.mapTheme === theme ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-white/10 text-text-secondary hover:border-white/30 hover:text-white'}`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <span className="font-bold text-sm block">Enable Marker Clustering</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={config.mapSettings.showClusterPins} 
                      onChange={(e) => updateMapSettings({ showClusterPins: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </label>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 min-h-[500px] rounded-2xl border border-white/10 overflow-hidden relative">
        <LiveBranchMap 
          config={config} 
          editMode={!!editingBranch} 
          onPinDragEnd={handlePinDragEnd}
          selectedBranchId={selectedBranchId}
          onBranchClick={(id: string) => {
            setSelectedBranchId(id);
            if (!editingBranch && activeTab === 'branches') {
              // Ensure we are in branches tab
            }
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
