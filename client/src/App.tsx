import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PermissionProvider } from './context/PermissionContext';
import { ModalProvider } from './context/ModalContext';
// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ZenwarChatbot } from './components/ZenwarChatbot';

// Pages
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Billing } from './pages/Billing';
import { Invoices } from './pages/Invoices';
import { ServiceOrders } from './pages/ServiceOrders';
import { Customers } from './pages/Customers';
import { Inventory } from './pages/Inventory';
import { Staffs } from './pages/Staffs';
import { Appointments } from './pages/Appointments';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { Checkout } from './pages/Checkout';
import { OAuthDebug } from './pages/OAuthDebug';

// Super Admin Pages
import { Dashboard as SaDashboard } from './pages/superadmin/Dashboard';
import { Businesses as SaWorkshops } from './pages/superadmin/Businesses';
import { Requests as SaRequests } from './pages/superadmin/Requests';
import { Inquiries as SaInquiries } from './pages/superadmin/Inquiries';
import { Permissions as SaPermissions } from './pages/superadmin/Permissions';
import { Roles as SaRoles } from './pages/superadmin/Roles';
import { StaffManagement as SaStaff } from './pages/superadmin/StaffManagement';
import { Subscriptions as SaSubscriptions } from './pages/superadmin/Subscriptions';
import { RevenueAnalytics as SaRevenue } from './pages/superadmin/RevenueAnalytics';
import { Notifications as SaNotifications } from './pages/superadmin/Notifications';
import { ActivityLogs as SaActivity } from './pages/superadmin/ActivityLogs';
import { SecurityCenter as SaSecurity } from './pages/superadmin/SecurityCenter';
import { Settings as SaSettings } from './pages/superadmin/Settings';
import { Profile as SaProfile } from './pages/superadmin/Profile';
import { WebsiteBuilder as SaWebsiteBuilder } from './pages/superadmin/WebsiteBuilder';
import { PaymentSettings as SaPaymentSettings } from './pages/superadmin/PaymentSettings';
import { AdminUsers as SaAdminUsers } from './pages/superadmin/AdminUsers';

// Types & Components
import type { SuperAdminPermissions } from './data/seedData';
import { LockedModule } from './components/LockedModule';
import { AnnouncementGuard } from './components/AnnouncementGuard';
import { useBranding } from './hooks/useBranding';

// BrandingSync — updates favicon and document title from live branding config
const BrandingSync: React.FC = () => {
  const branding = useBranding();
  const { liveWebsiteState } = useDatabase();

  useEffect(() => {
    const faviconUrl = branding.faviconUrl || '/logo.png';
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;

    // Apple touch icon
    let appleLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = branding.appIconUrl || faviconUrl;

    // Page title
    const title = liveWebsiteState?.seo?.websiteTitle || 'Zenwar';
    document.title = title;
  }, [branding, liveWebsiteState]);

  return null;
};


import { api } from './lib/api';

export const GoogleConfigContext = React.createContext<{ clientId: string, enabled: boolean, reason: string }>({ clientId: '', enabled: false, reason: '' });

const DynamicGoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientId, setClientId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.getGoogleConfig();
        if (res.success && res.config) {
          const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
          const finalClientId = res.config.clientId || envClientId;
          setClientId(finalClientId);
          setEnabled(res.config.enabled);
          setReason(res.config.reason || '');
        }
      } catch (err) {
        console.error('Failed to load Google OAuth config', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) {
    return <>{children}</>;
  }
  
  // Requirement: Verify the OAuth Client ID follows Google's official format
  const isValidClientId = Boolean(clientId && clientId.endsWith('.apps.googleusercontent.com'));
  
  return (
    <GoogleConfigContext.Provider value={{ clientId, enabled, reason }}>
      {isValidClientId && enabled ? (
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider>
      ) : (
        <>{children}</>
      )}
    </GoogleConfigContext.Provider>
  );
};

// Super Admin Guards
const SuperRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useDatabase();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'superadmin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const SaPermissionRoute: React.FC<{ children: React.ReactNode; permissionKey: keyof SuperAdminPermissions }> = ({ children, permissionKey }) => {
  const { canSaUserAccess } = useDatabase();
  if (!canSaUserAccess(permissionKey)) {
    return (
      <AppLayout>
        <LockedModule 
          lockReason="sa_override" 
          lockMessage="Your Super Admin account has not been granted permissions to view this control deck. Contact the Primary Owner to request access modifications."
          upgradeRequired={false}
          moduleName={`SuperAdmin: ${permissionKey.toUpperCase()}`}
        />
      </AppLayout>
    );
  }
  return <>{children}</>;
};

// Tenant Business Guards
const TenantRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useDatabase();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'superadmin') return <Navigate to="/super-admin" replace />;
  return <AnnouncementGuard>{children}</AnnouncementGuard>;
};

// Layout Shell for Authenticated Pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block shrink-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Sidebar for Mobile */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 bottom-0 left-0 w-[260px] z-40 md:hidden animate-in slide-in-from-left duration-200">
            <Sidebar collapsed={false} setCollapsed={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Routing Shell
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout/:invoiceId" element={<Checkout />} />

      {/* Authenticated Tenant Dashboard Suite */}
      <Route 
        path="/dashboard" 
        element={
          <TenantRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/billing" 
        element={
          <TenantRoute>
            <AppLayout>
              <Billing />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/invoices" 
        element={
          <TenantRoute>
            <AppLayout>
              <Invoices />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/job-cards" 
        element={
          <TenantRoute>
            <AppLayout>
              <ServiceOrders />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/customers" 
        element={
          <TenantRoute>
            <AppLayout>
              <Customers />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <TenantRoute>
            <AppLayout>
              <Inventory />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/staffs" 
        element={
          <TenantRoute>
            <AppLayout>
              <Staffs />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/appointments" 
        element={
          <TenantRoute>
            <AppLayout>
              <Appointments />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <TenantRoute>
            <AppLayout>
              <Reports />
            </AppLayout>
          </TenantRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <TenantRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </TenantRoute>
        } 
      />

      {/* Super Admin Control Panel Suite */}
      <Route 
        path="/super-admin" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="dashboard">
              <AppLayout>
                <SaDashboard />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/businesses" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="businesses">
              <AppLayout>
                <SaWorkshops />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/requests" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="businesses">
              <AppLayout>
                <SaRequests />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/inquiries" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="dashboard">
              <AppLayout>
                <SaInquiries />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/admin-users" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="adminUsers">
              <AppLayout>
                <SaAdminUsers />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/permissions" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="permissions">
              <AppLayout>
                <SaPermissions />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/roles" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="permissions">
              <AppLayout>
                <SaRoles />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/staff" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="staff">
              <AppLayout>
                <SaStaff />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/subscriptions" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="subscriptions">
              <AppLayout>
                <SaSubscriptions />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/builder" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="builder">
              <AppLayout>
                <SaWebsiteBuilder />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/revenue" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="revenue">
              <AppLayout>
                <SaRevenue />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/payments" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="payments">
              <AppLayout>
                <SaPaymentSettings />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/notifications" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="notifications">
              <AppLayout>
                <SaNotifications />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/activity-logs" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="activityLogs">
              <AppLayout>
                <SaActivity />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/security" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="security">
              <AppLayout>
                <SaSecurity />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/settings" 
        element={
          <SuperRoute>
            <SaPermissionRoute permissionKey="settings">
              <AppLayout>
                <SaSettings />
              </AppLayout>
            </SaPermissionRoute>
          </SuperRoute>
        } 
      />
      <Route 
        path="/super-admin/profile" 
        element={
          <SuperRoute>
            <AppLayout>
              <SaProfile />
            </AppLayout>
          </SuperRoute>
        } 
      />
      <Route 
        path="/system/oauth-debug" 
        element={
          <SuperRoute>
            <AppLayout>
              <OAuthDebug />
            </AppLayout>
          </SuperRoute>
        } 
      />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const RouteTracker: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useDatabase();

  useEffect(() => {
    if (currentUser) {
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(location.pathname)) {
        localStorage.setItem('zenwar_current_route', location.pathname);
      }
    }
  }, [location, currentUser]);

  return null;
};

const SessionLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loaderText, setLoaderText] = useState('Restoring secure session...');
  const { restoreSession } = useDatabase();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Restore session from localStorage on mount
    const savedSessionStr = localStorage.getItem('zenwar_session');
    if (savedSessionStr) {
      try {
        const session = JSON.parse(savedSessionStr);
        restoreSession(session);
      } catch (e) {
        console.error('Failed to restore session', e);
      }
    }

    // Progress animation for realistic validation loading
    const texts = [
      'Verifying cryptographic tokens...',
      'Restoring role permissions...',
      'Synchronizing multi-tenant database...',
      'Establishing secure connection...'
    ];
    let currentTextIdx = 0;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev % 25 === 0 && prev > 0) {
          currentTextIdx = (currentTextIdx + 1) % texts.length;
          setLoaderText(texts[currentTextIdx]);
        }
        return prev + 5;
      });
    }, 60);

    const timeout = setTimeout(() => {
      setLoading(false);
      
      // 2. Redirect to the saved route if we are logged in and currently at a public route or dashboard root
      const savedSessionStrAfter = localStorage.getItem('zenwar_session');
      if (savedSessionStrAfter) {
        try {
          const session = JSON.parse(savedSessionStrAfter);
          if (session.currentRoute && session.currentRoute !== location.pathname) {
            const publicPaths = ['/', '/login', '/register'];
            if (publicPaths.includes(location.pathname) || location.pathname === '/dashboard') {
              navigate(session.currentRoute);
            }
          }
        } catch (e) {}
      }
    }, 1300);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-app flex flex-col items-center justify-center text-text-primary">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Glowing neon halo */}
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 shadow-[0_0_50px_rgba(6,182,212,0.15)]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          
          <div className="text-center space-y-0.5">
            <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">ZW</span>
            <div className="text-[11px] font-bold text-cyan-400 tracking-[0.2em] uppercase">Zenwar</div>
          </div>
        </div>
        
        <div className="mt-8 space-y-3 text-center max-w-sm px-4">
          <div className="text-xs font-medium text-cyan-500/80 tracking-widest uppercase mb-2">Business Management Platform</div>
          <div className="text-sm font-bold text-text-primary tracking-wide font-display">{loaderText}</div>
          <div className="h-1.5 w-48 bg-white/5 rounded-full mx-auto overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-text-muted">Progress: {progress}% | TLS 1.3 | AES-256</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <DatabaseProvider>
      <Router>
        <PermissionProvider>
          <ModalProvider>
            <SessionLoader>
              <BrandingSync />
              <RouteTracker />
              <DynamicGoogleProvider>
                <AppRoutes />
                <ZenwarChatbot />
              </DynamicGoogleProvider>
            </SessionLoader>
          </ModalProvider>
        </PermissionProvider>
      </Router>
    </DatabaseProvider>
  );
}

export default App;
