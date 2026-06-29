import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  Plus, 
  User, 
  LogOut, 
  Check, 
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  CalendarCheck,
  Settings,
  Lock,
  Palette,
  Globe,
  IdCard
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { UserProfileModal } from './UserProfileModal';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications, 
    currentUser, 
    logout,
    settings,
    superAdminUsers,
    currentSaUserId,
    businesses,
    mechanics
  } = useDatabase();
  
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('zenwar_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  
  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'security' | 'appearance' | 'language'>('profile');

  // Helper to get user email
  const getUserEmail = () => {
    if (!currentUser) return '';
    if (currentUser.role === 'superadmin' || currentUser.tenantDomain === 'SYSTEM') {
      return superAdminUsers.find(u => u.id === (currentSaUserId || 'sa-1'))?.email || '';
    } else if (currentUser.role === 'admin' && currentUser.businessId) {
      return businesses.find(b => b.id === currentUser.businessId)?.email || '';
    } else if (currentUser.mechanicId) {
      return mechanics.find(m => m.id === currentUser.mechanicId)?.email || '';
    }
    return '';
  };

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zenwar_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleQuickAction = (route: string) => {
    setQuickActionOpen(false);
    navigate(route);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-[var(--border-card)] px-6 flex items-center justify-between sticky top-0 bg-[var(--bg-app)]/80 backdrop-blur-md z-20">
      {/* Left side: Hamburger & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-hover-bg cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <span className="font-bold text-sm tracking-wide text-[var(--text-primary)] md:hidden">
          {settings.shopName}
        </span>

        <div className="relative max-w-md w-full hidden md:block">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Quick search commands (Ctrl + K)..." 
            className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)]"
          />
        </div>
      </div>

      {/* Right side: Actions, Theme, Notifs, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <div className="relative">
          <button 
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-medium text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {quickActionOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setQuickActionOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 glass-panel shadow-2xl p-2 z-50 border border-[var(--border-card)] animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Create New...
                </div>
                <button 
                  onClick={() => handleQuickAction('/billing')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={16} /> Generate Invoice
                </button>
                <button 
                  onClick={() => handleQuickAction('/job-cards')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CalendarCheck size={16} /> Create Job Card
                </button>
                <button 
                  onClick={() => handleQuickAction('/customers')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User size={16} /> Add Customer
                </button>
                <button 
                  onClick={() => handleQuickAction('/reports')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Plus size={16} /> Log Expense
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggler */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-hover-bg active:scale-95 transition-all cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-hover-bg active:scale-95 transition-all relative cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-secondary)] text-text-primary text-[10px] font-bold flex items-center justify-center animate-pulse border-2 border-[var(--bg-app)]">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 glass-panel shadow-2xl z-50 border border-[var(--border-card)] max-h-96 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-[var(--border-card)] flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[var(--text-primary)]">Notifications</h4>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[10px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Clear all
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto max-h-64 divide-y divide-[var(--border-card)]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
                      No notifications to display.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3.5 flex gap-3 transition-colors ${notif.read ? 'opacity-60 bg-transparent' : 'bg-[var(--color-primary-glow)]/20'}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'warning' && <AlertTriangle className="text-[var(--color-secondary)]" size={16} />}
                          {notif.type === 'success' && <Check className="text-[var(--color-success)]" size={16} />}
                          {notif.type === 'info' && <Info className="text-[var(--color-primary)]" size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{notif.title}</p>
                            <span className="text-[9px] text-[var(--text-secondary)] whitespace-nowrap ml-2">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{notif.message}</p>
                          {!notif.read && (
                            <button 
                              onClick={() => markNotificationAsRead(notif.id)}
                              className="text-[9px] text-[var(--color-primary)] hover:underline mt-1 block cursor-pointer"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:bg-hover-bg active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-blue-500 flex items-center justify-center text-sm font-semibold text-text-primary overflow-hidden shrink-0">
              {currentUser?.profilePhoto ? (
                <img src={currentUser.profilePhoto} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                currentUser?.name.charAt(0) || 'A'
              )}
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] hidden md:inline truncate max-w-24">
              {currentUser?.name || 'Admin'}
            </span>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 glass-panel shadow-2xl p-2 z-50 border border-[var(--border-card)] animate-in fade-in slide-in-from-top-2 duration-150 rounded-xl">
                <div className="px-3 py-3 border-b border-[var(--border-card)] mb-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500 flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0">
                    {currentUser?.profilePhoto ? (
                      <img src={currentUser.profilePhoto} className="w-full h-full object-cover" alt="avatar" />
                    ) : (
                      currentUser?.name.charAt(0) || 'A'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser?.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] capitalize font-semibold mt-0.5">{currentUser?.role}</p>
                    <p className="text-[9px] text-[var(--text-muted)] truncate mt-0.5">{getUserEmail()}</p>
                  </div>
                </div>
                
                <div className="py-1">
                  <button 
                    onClick={() => { setProfileOpen(false); setProfileModalTab('profile'); setProfileModalOpen(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <IdCard size={15} /> My Profile
                  </button>
                  <button 
                    onClick={() => { setProfileOpen(false); setProfileModalTab('security'); setProfileModalOpen(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Lock size={15} /> Security
                  </button>
                  <button 
                    onClick={() => { setProfileOpen(false); setProfileModalTab('appearance'); setProfileModalOpen(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Palette size={15} /> Appearance
                  </button>
                  <button 
                    onClick={() => { setProfileOpen(false); setProfileModalTab('language'); setProfileModalOpen(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--color-primary-glow)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition-colors cursor-pointer mb-1"
                  >
                    <Globe size={15} /> Language
                  </button>
                </div>
                
                <div className="border-t border-[var(--border-card)] pt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <UserProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
        initialTab={profileModalTab}
      />
    </header>
  );
};
