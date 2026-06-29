import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBranding } from '../hooks/useBranding';
import { 
  LayoutDashboard, 
  Receipt, 
  Wrench, 
  Users, 
  Package, 
  UserCheck, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Shield,
  Bell,
  CheckCircle,
  Mail,
  Lock,
  ClipboardList,
  Globe,
  CreditCard,
  UsersRound
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useTerminology } from '../hooks/useTerminology';
import { usePermissions, type WorkshopModule } from '../context/PermissionContext';
import { LockedOverlay } from './LockedModule';
import type { SuperAdminPermissions } from '../data/seedData';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// Map route paths to module keys for business pages
const routeToModule: Record<string, WorkshopModule> = {
  '/dashboard': 'dashboard',
  '/billing': 'billing',
  '/invoices': 'invoices',
  '/job-cards': 'jobCards',
  '/customers': 'customers',
  '/inventory': 'inventory',
  '/staffs': 'staffs',
  '/appointments': 'appointments',
  '/reports': 'reports',
  '/settings': 'settings',
};

// Map SA route paths to SA permission keys
const saRouteToPermission: Record<string, keyof SuperAdminPermissions> = {
  '/super-admin': 'dashboard',
  '/super-admin/businesses': 'businesses',
  '/super-admin/permissions': 'permissions',
  '/super-admin/staff': 'staff',
  '/super-admin/subscriptions': 'subscriptions',
  '/super-admin/builder': 'builder',
  '/super-admin/revenue': 'revenue',
  '/super-admin/payments': 'payments',
  '/super-admin/notifications': 'notifications',
  '/super-admin/activity-logs': 'activityLogs',
  '/super-admin/security': 'security',
  '/super-admin/settings': 'settings',
  '/super-admin/admin-users': 'adminUsers',
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentUser, logout, settings, canSaUserAccess } = useDatabase();
  const { checkModule, isSuperAdmin } = usePermissions();
  const navigate = useNavigate();
  const t = useTerminology();
  const location = useLocation();
  const branding = useBranding();
  const getTenantMenuItems = () => {
    const businessType = (currentUser as any)?.businessType || 'Auto Workshop';
    
    const baseItems = [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Billing', icon: Receipt, path: '/billing' },
      { name: 'Invoices', icon: ClipboardList, path: '/invoices' },
      { name: t.orders, icon: Wrench, path: '/job-cards' },
      { name: t.customers, icon: Users, path: '/customers' },
      { name: t.inventory, icon: Package, path: '/inventory' },
      { name: t.staffs, icon: UserCheck, path: '/staffs' },
    ];

    if (businessType === 'Auto Workshop') {
      baseItems.push({ name: 'Appointments', icon: Calendar, path: '/appointments' });
    }

    baseItems.push(
      { name: 'Reports', icon: BarChart3, path: '/reports' },
      { name: 'Settings', icon: Settings, path: '/settings' }
    );
    
    return baseItems;
  };

  const menuItems = isSuperAdmin ? [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin' },
    { name: 'Businesses', icon: Users, path: '/super-admin/businesses' },
    { name: 'Requests', icon: CheckCircle, path: '/super-admin/requests' },
    { name: 'Inquiries', icon: Mail, path: '/super-admin/inquiries' },
    { name: 'Admin Users', icon: UsersRound, path: '/super-admin/admin-users' },
    { name: 'Permissions', icon: Shield, path: '/super-admin/permissions' },
    { name: 'Staff Control', icon: UserCheck, path: '/super-admin/staff' },
    { name: 'Subscriptions', icon: Package, path: '/super-admin/subscriptions' },
    { name: 'Website Builder', icon: Globe, path: '/super-admin/builder' },
    { name: 'Revenue P&L', icon: BarChart3, path: '/super-admin/revenue' },
    { name: 'System Payment Settings', icon: CreditCard, path: '/super-admin/payments' },
    { name: 'Broadcast Hub', icon: Bell, path: '/super-admin/notifications' },
    { name: 'Activity Audit', icon: ClipboardList, path: '/super-admin/activity-logs' },
    { name: 'Security Center', icon: Lock, path: '/super-admin/security' },
    { name: 'System Settings', icon: Settings, path: '/super-admin/settings' },
  ] : getTenantMenuItems();

  const allowedDashboardRoles = ['admin', 'accountant', 'superadmin'];
  const hasDashboardAccess = allowedDashboardRoles.includes(currentUser?.role || '');

  
  const isItemLocked = (path: string): { locked: boolean; reason: 'plan' | 'sa_override' | 'sa_perm' | null } => {
    if (isSuperAdmin) {
      // Check SA user permissions
      const saPermKey = saRouteToPermission[path];
      if (saPermKey && !canSaUserAccess(saPermKey)) {
        return { locked: true, reason: 'sa_perm' };
      }
      return { locked: false, reason: null };
    }

    // Business module check
    const moduleKey = routeToModule[path];
    if (moduleKey) {
      const access = checkModule(moduleKey);
      if (access.isLocked) {
        return { locked: true, reason: access.lockReason === 'sa_override' ? 'sa_override' : 'plan' };
      }
    }
    return { locked: false, reason: null };
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.name === 'Dashboard' && !isSuperAdmin) {
      if (!hasDashboardAccess) return false;
    }
    const lockStatus = isItemLocked(item.path);
    return !lockStatus.locked; // Completely hide if locked
  });


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a menu item is locked
  

  return (
    <motion.div 
      className="glass-panel h-screen sticky top-0 flex flex-col justify-between border-y-0 border-l-0 rounded-none z-30 overflow-hidden"
      animate={{ width: collapsed ? '80px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Brand Logo / Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-card)]">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
              <img 
                src={branding.lightLogoUrl} 
                alt="Zenwar" 
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
              />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-bold text-lg tracking-wider text-[var(--text-primary)]">
                  {settings.shopName.includes('Zenwar') ? 'Zenwar' : settings.shopName}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] tracking-widest font-mono">
                  PRO SUITE
                </span>
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg border border-[var(--border-card)] hover:bg-[var(--color-primary-glow)] hover:border-[var(--color-primary)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const lockState = isItemLocked(item.path);
            const isLocked = lockState.locked;
            
            return (
              <div key={item.path} className="relative">
                {isLocked ? (
                  // Locked item — visible but disabled
                  <div
                    className={`
                      flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all relative group cursor-not-allowed border
                      text-[var(--text-secondary)]/40 opacity-50 border-transparent
                    `}
                    onClick={(e) => e.preventDefault()}
                  >
                    <item.icon size={20} className="text-[var(--text-secondary)]/30" />
                    
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-medium text-sm flex-1 text-text-muted"
                      >
                        {item.name}
                      </motion.span>
                    )}

                    {/* Lock icon */}
                    {!collapsed && (
                      <LockedOverlay
                        show={true}
                        reason={lockState.reason === 'sa_perm' ? 'sa_override' : lockState.reason}
                        compact={true}
                      />
                    )}

                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <div className="absolute left-20 bg-[var(--bg-card)] border border-[var(--border-card)] text-text-muted text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50 flex items-center gap-2">
                        <Lock size={10} className="text-amber-400/70" />
                        {item.name}
                      </div>
                    )}
                  </div>
                ) : (
                  // Normal accessible link
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all relative group cursor-pointer border
                      ${isActive ? 'active-sidebar-item font-bold' : 'inactive-sidebar-item text-[var(--text-secondary)] border-transparent'}
                    `}
                  >
                    <item.icon size={20} className={`transition-transform ${isActive ? 'sidebar-icon-active' : 'sidebar-icon-inactive group-hover:scale-110'}`} />
                    
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-medium text-sm"
                      >
                        {item.name}
                      </motion.span>
                    )}
                    
                    {collapsed && (
                      <div className="absolute left-20 bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50">
                        {item.name}
                      </div>
                    )}

                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" 
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-[var(--border-card)]">
        {currentUser && !collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 mb-2 rounded-xl bg-white/5 border border-[var(--border-card)] flex items-center gap-3 overflow-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--color-secondary-glow)] border border-[var(--color-secondary)]/30 flex items-center justify-center text-lg overflow-hidden shrink-0">
              {currentUser.profilePhoto ? (
                <img src={currentUser.profilePhoto} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                currentUser.role === 'admin' ? '⚙️' : '🔧'
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-[var(--text-primary)]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                {currentUser.role}
              </span>
            </div>
          </motion.div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all group cursor-pointer"
        >
          <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-sm">
              Log Out
            </motion.span>
          )}
          {collapsed && (
            <div className="absolute left-20 bg-[var(--bg-card)] border border-[var(--border-card)] text-red-400 text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50">
              Log Out
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};
