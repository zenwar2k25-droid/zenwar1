import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Lock, User, Palette, Globe, 
  CheckCircle2, ShieldCheck, Upload
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'security' | 'appearance' | 'language';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'profile'
}) => {
  const { 
    currentUser, 
    currentSaUserId, 
    superAdminUsers, 
    businesses, 
    mechanics,
    updateCurrentUserProfile 
  } = useDatabase();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [toastMsg, setToastMsg] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    profilePhoto: '',
    designation: '',
    bio: ''
  });

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Theme & Language
  const [theme, setTheme] = useState(localStorage.getItem('zenwar_theme') || 'system');
  const [language, setLanguage] = useState(localStorage.getItem('zenwar_language') || 'english');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadUserData();
    }
  }, [isOpen, initialTab, currentUser]);

  const loadUserData = () => {
    if (!currentUser) return;
    
    if (currentUser.role === 'superadmin' || currentUser.tenantDomain === 'SYSTEM') {
      const saUser = superAdminUsers.find(u => u.id === (currentSaUserId || 'sa-1'));
      if (saUser) {
        setFormData({
          name: saUser.name || '',
          username: saUser.username || '',
          email: saUser.email || '',
          phone: saUser.phone || '',
          profilePhoto: saUser.profilePhoto || '',
          designation: saUser.designation || '',
          bio: saUser.bio || ''
        });
      }
    } else if (currentUser.role === 'admin' && currentUser.businessId) {
      const business = businesses.find(b => b.id === currentUser.businessId);
      if (business) {
        setFormData({
          name: business.ownerName || '',
          username: business.username || '',
          email: business.email || '',
          phone: business.phone || '',
          profilePhoto: business.profilePhoto || '',
          designation: '',
          bio: ''
        });
      }
    } else if (currentUser.mechanicId) {
      const mechanic = mechanics.find(m => m.id === currentUser.mechanicId);
      if (mechanic) {
        setFormData({
          name: mechanic.name || '',
          username: mechanic.username || '',
          email: mechanic.email || '',
          phone: mechanic.mobileNumber || '',
          profilePhoto: mechanic.profilePhoto || '',
          designation: '',
          bio: ''
        });
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast('Image exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateCurrentUserProfile(formData);
      triggerToast('Profile updated successfully.');
    } catch (err: any) {
      triggerToast(err.message || 'Update failed');
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    try {
      updateCurrentUserProfile(formData, newPassword, currentPassword);
      triggerToast('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('zenwar_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    triggerToast(`Theme set to ${newTheme}`);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('zenwar_language', lang);
    triggerToast(`Language changed to ${lang}`);
  };

  const isSA = currentUser?.role === 'superadmin' || currentUser?.tenantDomain === 'SYSTEM';
  const isAdmin = currentUser?.role === 'admin';
  const isStaff = !!currentUser?.mechanicId;

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px]"
        >
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-card)] flex flex-col shrink-0">
            <div className="p-6 border-b border-[var(--border-card)]">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)] font-display">Account Settings</h2>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">Manage your personal profile</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
              >
                <User size={18} /> My Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'security' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
              >
                <Lock size={18} /> Security
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'appearance' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
              >
                <Palette size={18} /> Appearance
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('language')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'language' ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
              >
                <Globe size={18} /> Language
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-[var(--bg-card)] relative">
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-white/5 hover:bg-white/10 rounded-lg transition-colors z-10 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">My Profile</h3>
                  
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    {/* Photo Upload */}
                    <div className="flex items-center gap-6 pb-6 border-b border-[var(--border-card)]">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-2 border-[var(--color-primary)] overflow-hidden bg-white/5 flex items-center justify-center">
                          {formData.profilePhoto ? (
                            <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-[var(--text-muted)]" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-2 bg-[var(--color-primary)] text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
                          <Camera size={14} />
                          <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handlePhotoUpload} />
                        </label>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">Profile Photo</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">Upload a professional image. Max size 2MB (JPG, PNG, WEBP).</p>
                        {formData.profilePhoto && (
                          <button type="button" onClick={() => setFormData(p => ({...p, profilePhoto: ''}))} className="text-xs text-red-400 hover:text-red-300 mt-2 font-semibold cursor-pointer">
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Full Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Username</label>
                        <input type="text" required value={formData.username} disabled={isStaff} onChange={e => setFormData(p => ({...p, username: e.target.value}))} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none disabled:opacity-50 disabled:cursor-not-allowed" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Email Address</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Mobile Number</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      </div>
                    </div>

                    {isSA && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Designation</label>
                          <input type="text" value={formData.designation} onChange={e => setFormData(p => ({...p, designation: e.target.value}))} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Bio (Optional)</label>
                          <textarea rows={3} value={formData.bio} onChange={e => setFormData(p => ({...p, bio: e.target.value}))} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none resize-none" />
                        </div>
                      </>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-card)]">
                      <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">Cancel</button>
                      <button type="submit" className="px-6 py-2.5 text-xs font-bold bg-[var(--color-primary)] hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer">Save Changes</button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-[var(--color-primary)]" /> Password Management
                  </h3>
                  
                  {passwordError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSave} className="space-y-5 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Current Password</label>
                      <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                    </div>
                    
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">New Password</label>
                      <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                      <div className="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden flex">
                        <div className={`h-full transition-all ${newPassword.length > 0 ? (newPassword.length > 7 ? 'w-full bg-green-500' : 'w-1/2 bg-yellow-500') : 'w-0'}`} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Confirm New Password</label>
                      <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none" />
                    </div>

                    <div className="pt-6">
                      <button type="submit" className="w-full px-6 py-3 text-xs font-bold bg-[var(--color-primary)] hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer">Update Password</button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Theme Preferences</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button type="button" onClick={() => handleThemeChange('light')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${theme === 'light' ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]' : 'border-[var(--border-card)] hover:border-white/20'}`}>
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-800">
                        <Palette size={20} />
                      </div>
                      <span className="font-semibold text-sm text-[var(--text-primary)]">Light Theme</span>
                    </button>
                    <button type="button" onClick={() => handleThemeChange('dark')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${theme === 'dark' ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]' : 'border-[var(--border-card)] hover:border-white/20'}`}>
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white">
                        <Palette size={20} />
                      </div>
                      <span className="font-semibold text-sm text-[var(--text-primary)]">Dark Theme</span>
                    </button>
                    <button type="button" onClick={() => handleThemeChange('system')} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${theme === 'system' ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]' : 'border-[var(--border-card)] hover:border-white/20'}`}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-800 flex items-center justify-center text-white">
                        <Palette size={20} />
                      </div>
                      <span className="font-semibold text-sm text-[var(--text-primary)]">System Auto</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* LANGUAGE TAB */}
              {activeTab === 'language' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Regional Settings</h3>
                  
                  <div className="max-w-md space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Display Language</label>
                    <select value={language} onChange={handleLanguageChange} className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-card)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none cursor-pointer">
                      <option value="english">English (US)</option>
                      <option value="tamil">தமிழ் (Tamil)</option>
                      <option value="kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="hindi">हिन्दी (Hindi)</option>
                    </select>
                    <p className="text-xs text-[var(--text-muted)] mt-2">More languages will be added in future updates.</p>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[var(--bg-card)] border border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-[70] rounded-xl">
          <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">{toastMsg}</span>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
