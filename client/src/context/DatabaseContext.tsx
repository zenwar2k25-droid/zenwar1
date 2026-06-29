import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Mechanic,
  InventoryItem,
  Customer,
  JobCard,
  Appointment,
  Invoice,
  Expense,
  Vehicle,
  Business,
  PermissionRule,
  SubscriptionPlan,
  SaAnnouncement,
  SaAuditLog,
  SaBackup,
  PendingRegistration,
  Inquiry,
  WebsiteState, WebsiteVersion, MediaAsset,
  SaPayment,
  SaPaymentSettings,
  SuperAdminUser,
  SuperAdminPermissions,
  BusinessModuleAccess,
  InventoryHistory,
  HeroBanner,
  BranchLocation
} from '../data/seedData';
import * as seedData from '../data/seedData';
import { dbGet, dbSet, dbDelete, dbGetAll, STORES } from '../lib/db';

import {
  seedMechanics,
  seedInventory,
  seedCustomers,
  seedJobCards,
  seedAppointments,
  seedInvoices,
  seedExpenses,
  seedBusinesses,
  seedPermissionRules,
  seedSubscriptionPlans,
  seedSaAnnouncements,
  seedSaAuditLogs,
  seedPendingRegistrations,
  demoBanners,
  demoBranches,
  seedInquiries,
  seedSaBackups,
  defaultWebsiteState,
  demoWorkshopProfile,
  demoSeedMechanics,
  demoSeedInventory,
  demoSeedInventoryHistory,
  demoSeedCustomers,
  demoSeedJobCards,
  demoSeedInvoices,
  seedSuperAdminUsers
} from '../data/seedData';


interface ShopSettings {
  shopName: string;
  tagline: string;
  logoUrl: string;
  gstNumber: string;
  phone: string;
  address: string;
  currency: string;
  defaultGstRate: number;
  email?: string;
}


export interface LandingPageSettings {
  enableRegistration: boolean;
  enableLogin: boolean;
  enableFreeTrial: boolean;
  enablePaidRegistration: boolean;
  enablePaymentGateway: boolean;
  maintenanceMode: boolean;
}

export interface WorkshopPaymentConfig {
  tenantDomain: string;
  upiEnabled: boolean;
  upiId: string;
  upiHolderName?: string;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpaySecret: string;
  razorpayTestMode: boolean;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  defaultMethod: 'UPI' | 'Razorpay' | 'Cash' | 'Card' | 'Bank Transfer';
  termsAndConditions?: string;
}

export interface PaymentAuditLog {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: 'UPI' | 'Razorpay' | 'Cash' | 'Card' | 'Bank Transfer';
  status: 'Pending' | 'Paid' | 'Failed' | 'Partially Paid';
  timestamp: string;
  tenantDomain: string;
}

export interface NotificationMsg {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

interface DatabaseContextType {
  liveWebsiteState: WebsiteState;
  draftWebsiteState: WebsiteState;
  websiteVersions: WebsiteVersion[];
  mediaLibrary: MediaAsset[];
  setMediaLibrary: (lib: MediaAsset[]) => void;
  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'uploadDate'>) => MediaAsset;
  removeMediaAsset: (id: string) => void;
  deleteMediaAsset: (id: string) => void;
  updateMediaAsset: (id: string, updates: Partial<MediaAsset>) => void;
  saveDraft: (newState: Partial<WebsiteState>) => void;
  discardDraft: () => void;
  publishDraft: (versionNotes?: string) => void;
  rollbackToVersion: (versionId: string) => void;
  mechanics: Mechanic[];
  inventory: InventoryItem[];
  customers: Customer[];
  jobCards: JobCard[];
  appointments: Appointment[];
  invoices: Invoice[];
  expenses: Expense[];
  settings: ShopSettings;
  notifications: NotificationMsg[];
  currentUser: { name: string; role: string; mechanicId?: string; businessId?: string; tenantDomain?: string; profilePhoto?: string; isDemoUser?: boolean } | null;

  // Super Admin models
  businesses: Business[];
  permissionRules: PermissionRule[];
  subscriptionPlans: SubscriptionPlan[];
  saAnnouncements: SaAnnouncement[];
  saAuditLogs: SaAuditLog[];
  saBackups: SaBackup[];
  saCredentials: any;
  updateSaCredentials: (updated: any) => void;
  logoutAllSaDevices: () => void;
  transferOwnership: (newOwnerId: string, confirmPass: string) => void;

  // Super Admin Users (multi-admin management)
  superAdminUsers: SuperAdminUser[];
  currentSaUserId: string | null;
  setCurrentSaUserId: (id: string | null) => void;
  addSuperAdminUser: (user: Omit<SuperAdminUser, 'id' | 'createdAt'>) => void;
  updateSuperAdminUser: (id: string, updated: Partial<SuperAdminUser>) => void;
  deleteSuperAdminUser: (id: string) => void;
  getCurrentSaUser: () => SuperAdminUser | null;

  // Module Access Engine
  getEffectiveModuleAccess: (tenantDomain: string) => BusinessModuleAccess;
  updateWorkshopModuleOverrides: (businessId: string, overrides: Partial<BusinessModuleAccess>) => void;
  
  // Auth CRUD
  login: (tenantDomain: string, usernameOrEmail: string, passwordOrRole: string) => { name: string; role: string; tenantDomain: string } | false;
  logout: () => void;
  updateCurrentUserProfile: (updatedData: any, newPassword?: string, currentPassword?: string) => void;

  // Mechanics CRUD
  addMechanic: (mechanic: Omit<Mechanic, 'id' | 'rating' | 'efficiency' | 'tasksAssigned' | 'attendance'>) => void;
  updateMechanic: (id: string, updated: Partial<Mechanic>) => void;
  
  // Inventory CRUD
  inventoryHistory: InventoryHistory[];
  addInventoryHistory: (history: Omit<InventoryHistory, 'id' | 'date'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updated: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  useInventoryItems: (items: { id: string; quantity: number }[]) => boolean;
  bulkAddInventoryItems: (items: Omit<InventoryItem, 'id'>[]) => void;
  bulkUpdateInventoryItems: (items: (Partial<InventoryItem> & { sku: string })[]) => void;
  bulkUpdateInventoryStock: (updates: { sku: string; stock: number }[]) => void;

  // Customers CRUD
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints'>) => Customer;
  updateCustomer: (id: string, updated: Partial<Customer>) => void;
  addVehicleToCustomer: (customerId: string, vehicle: Omit<Vehicle, 'id'>) => void;

  // Job Cards CRUD
  addJobCard: (jobCard: Omit<JobCard, 'id' | 'dateCreated' | 'status' | 'beforeImage' | 'afterImage'>) => JobCard;
  updateJobCard: (id: string, updated: Partial<JobCard>) => void;
  
  // Appointments CRUD
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointment: (id: string, updated: Partial<Appointment>) => void;

  // Billing CRUD
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => Invoice;
  updateInvoice: (id: string, updated: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Expenses CRUD
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  deleteExpense: (id: string) => void;

  // Settings CRUD
  updateSettings: (updated: Partial<ShopSettings>) => void;

  // Notifications
  addNotification: (title: string, message: string, type: 'info' | 'warning' | 'success') => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Super Admin CRUD
  pendingRegistrations: PendingRegistration[];
  inquiries: Inquiry[];
  submitInquiry: (req: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'readStatus' | 'leadStatus' | 'source'>) => void;
  markInquiryRead: (id: string) => void;
  markInquiryUnread: (id: string) => void;
  updateInquiryStatus: (id: string, status: Inquiry['leadStatus']) => void;
  deleteInquiry: (id: string) => void;
  addPendingRegistration: (reg: Omit<PendingRegistration, 'registrationId' | 'createdAt'>) => string;
  updatePendingRegistrationStatus: (id: string, status: 'PENDING_PAYMENT' | 'FAILED' | 'PAID') => void;
  approveRegistrationRequest: (id: string) => void;
  rejectRegistrationRequest: (id: string, reason: string) => void;
  completeRegistrationPayment: (id: string) => void;
  deletePendingRegistration: (id: string) => void;
  verifyWorkshop: (id: string) => void;
  removeWorkshopVerification: (id: string) => void;
  addWorkshop: (business: Omit<Business, 'id' | 'registeredDate' | 'activeUsers' | 'usage' | 'smsCredits' | 'whatsappCredits' | 'loginHistory' | 'deviceActivity'>) => void;
  updateWorkshop: (id: string, updated: Partial<Business>) => void;
  deleteWorkshop: (id: string) => void;
  updatePermissionRules: (rules: PermissionRule[]) => void;
  addCustomRole: (roleName: string) => void;
  deleteCustomRole: (roleName: string) => void;
  addSaAnnouncement: (announcement: Omit<SaAnnouncement, 'id' | 'date'>) => void;
  acknowledgeAnnouncement: (announcementId: string, tenantDomain: string, userId?: string) => void;
  deleteSaAnnouncement: (id: string) => void;
  addSaAuditLog: (action: string, target: string) => void;
  createSaBackup: (name: string) => void;
  restoreSaBackup: (id: string) => void;
  deleteSaBackup: (id: string) => void;
  resetWorkshopAdminPassword: (id: string, newPass: string) => void;
  toggleLoginAccess: (id: string) => void;
  forceLogoutSessions: (id: string) => void;
  changeSubscriptionPlan: (id: string, planId: string) => void;
  deleteWorkshopPermanently: (id: string) => void;
  resetWorkshopData: (tenantDomain: string) => void;
  toggleWorkshopStatus: (id: string) => void;
  impersonateTenant: (tenantDomain: string, businessId: string) => void;

  // New Subscription CRUD
  addSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'archived'>) => void;
  updateSubscriptionPlan: (id: string, updated: Partial<SubscriptionPlan>) => void;
  deleteSubscriptionPlan: (id: string) => void;
  duplicateSubscriptionPlan: (id: string) => void;

  // Landing Page CMS Builder
  
  

  // SaaS Payment parameters
  saPaymentSettings: SaPaymentSettings;
  saPayments: SaPayment[];
  updateSaPaymentSettings: (updated: Partial<SaPaymentSettings>) => void;

  landingPageSettings: LandingPageSettings;
  updateLandingPageSettings: (updated: Partial<LandingPageSettings>) => void;

  addSaPayment: (payment: Omit<SaPayment, 'id' | 'date'>) => void;
  refundSaPayment: (id: string) => void;
  resetDemoWorkshopData: (tenantDomain: string) => void;
  restoreSession: (session: any) => void;

  // Business Payment Settings CRUD
  workshopPaymentConfigs: Record<string, WorkshopPaymentConfig>;
  paymentAuditLogs: PaymentAuditLog[];
  getWorkshopPaymentConfig: (tenantDomain: string) => WorkshopPaymentConfig;
  updateWorkshopPaymentConfig: (tenantDomain: string, updated: Partial<WorkshopPaymentConfig>) => void;
  addPaymentAuditLog: (log: Omit<PaymentAuditLog, 'id' | 'timestamp'>) => void;

  // SA Page Access Check
  canSaUserAccess: (page: keyof SuperAdminPermissions) => boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const defaultSettings: ShopSettings = {
  shopName: 'Zenwar',
  tagline: 'Smart Business & Billing Management',
  logoUrl: '⚡',
  gstNumber: '27AAACG1234F1Z5',
  phone: '+1 (555) 762-4369',
  address: 'Auto Grid Road, Block 4, Industrial Bay 12, NY',
  currency: 'INR',
  defaultGstRate: 18,
  email: 'contact@zenwar.co',
};

const initialNotifications: NotificationMsg[] = [
  { id: 'n-1', title: 'Low Stock Alert', message: 'Premium Ceramic Brake Pads is running low (8 items remaining).', time: '10 mins ago', read: false, type: 'warning' },
  { id: 'n-2', title: 'Appointment Booked', message: 'Emma Watson scheduled a Tesla Model S Diagnostic.', time: '1 hr ago', read: false, type: 'info' },
  { id: 'n-3', title: 'Invoice Paid', message: 'Invoice SG-2026-1002 (Robert Downey) of ₹14,132 cleared.', time: '2 hrs ago', read: true, type: 'success' }
];

const mergeWebsiteState = (savedStr: string | null): WebsiteState => {
  const defaultState = seedData.defaultWebsiteState;
  if (!savedStr) return defaultState;
  try {
    const saved = JSON.parse(savedStr);
    if (!saved || typeof saved !== 'object') return defaultState;
    return {
      ...defaultState,
      ...saved,
      heroContent: saved.heroContent ? {
        ...defaultState.heroContent,
        ...saved.heroContent
      } : defaultState.heroContent,
      heroSliderSettings: saved.heroSliderSettings ? {
        ...defaultState.heroSliderSettings,
        ...saved.heroSliderSettings
      } : defaultState.heroSliderSettings,
      aboutPage: saved.aboutPage ? {
        ...defaultState.aboutPage,
        ...saved.aboutPage,
        coreValues: Array.isArray(saved.aboutPage.coreValues) ? saved.aboutPage.coreValues : (defaultState.aboutPage?.coreValues || []),
        timeline: Array.isArray(saved.aboutPage.timeline) ? saved.aboutPage.timeline : (defaultState.aboutPage?.timeline || []),
        leadership: Array.isArray(saved.aboutPage.leadership) ? saved.aboutPage.leadership : (defaultState.aboutPage?.leadership || []),
        gallery: Array.isArray(saved.aboutPage.gallery) ? saved.aboutPage.gallery : (defaultState.aboutPage?.gallery || []),
        officeImages: {
          ...defaultState.aboutPage?.officeImages,
          ...(saved.aboutPage?.officeImages || {}),
          teamPhotos: Array.isArray(saved.aboutPage?.officeImages?.teamPhotos) 
            ? saved.aboutPage.officeImages.teamPhotos 
            : (defaultState.aboutPage?.officeImages?.teamPhotos || [])
        },
        achievements: {
          ...defaultState.aboutPage?.achievements,
          ...(saved.aboutPage?.achievements || {}),
          awards: Array.isArray(saved.aboutPage?.achievements?.awards) 
            ? saved.aboutPage.achievements.awards 
            : (defaultState.aboutPage?.achievements?.awards || []),
          certificates: Array.isArray(saved.aboutPage?.achievements?.certificates) 
            ? saved.aboutPage.achievements.certificates 
            : (defaultState.aboutPage?.achievements?.certificates || []),
          eventPhotos: Array.isArray(saved.aboutPage?.achievements?.eventPhotos) 
            ? saved.aboutPage.achievements.eventPhotos 
            : (defaultState.aboutPage?.achievements?.eventPhotos || [])
        }
      } : defaultState.aboutPage,
      contactPage: saved.contactPage ? {
        ...defaultState.contactPage,
        ...saved.contactPage
      } : defaultState.contactPage,
      featuresPage: saved.featuresPage ? {
        ...defaultState.featuresPage,
        ...saved.featuresPage
      } : defaultState.featuresPage,
      pricingPage: saved.pricingPage ? {
        ...defaultState.pricingPage,
        ...saved.pricingPage
      } : defaultState.pricingPage,
      branchDirectory: saved.branchDirectory ? {
        ...defaultState.branchDirectory,
        ...saved.branchDirectory,
        branches: Array.isArray(saved.branchDirectory.branches) ? saved.branchDirectory.branches : (defaultState.branchDirectory?.branches || []),
        mapSettings: saved.branchDirectory.mapSettings ? {
          ...defaultState.branchDirectory?.mapSettings,
          ...saved.branchDirectory.mapSettings
        } : defaultState.branchDirectory?.mapSettings
      } : defaultState.branchDirectory,
      branding: saved.branding ? {
        ...defaultState.branding,
        ...saved.branding
      } : defaultState.branding,
      footer: saved.footer ? {
        ...defaultState.footer,
        ...saved.footer
      } : defaultState.footer,
      seo: saved.seo ? {
        ...defaultState.seo,
        ...saved.seo
      } : defaultState.seo
    };
  } catch (e) {
    console.error("Error parsing website state, falling back to default", e);
    return defaultState;
  }
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [liveWebsiteState, setLiveWebsiteState] = useState<WebsiteState>(mergeWebsiteState(null));
  const [draftWebsiteState, setDraftWebsiteState] = useState<WebsiteState>(mergeWebsiteState(null));
  const [websiteVersions, setWebsiteVersions] = useState<WebsiteVersion[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([]);

  // Async Hydration from IndexedDB
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const liveDoc = await dbGet<{id: string, state: WebsiteState}>(STORES.CMS, 'live');
        if (liveDoc?.state) setLiveWebsiteState(mergeWebsiteState(JSON.stringify(liveDoc.state)));
        else setLiveWebsiteState(mergeWebsiteState(null));

        const draftDoc = await dbGet<{id: string, state: WebsiteState}>(STORES.CMS, 'draft');
        if (draftDoc?.state) setDraftWebsiteState(mergeWebsiteState(JSON.stringify(draftDoc.state)));
        else setDraftWebsiteState(mergeWebsiteState(null));

        const versions = await dbGetAll<WebsiteVersion>(STORES.VERSIONS);
        setWebsiteVersions(versions.sort((a,b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));

        const media = await dbGetAll<MediaAsset>(STORES.MEDIA);
        if (media.length === 0) {
          // Seed demo media
          setMediaLibrary(seedData.demoMediaAssets);
          for (const m of seedData.demoMediaAssets) {
            await dbSet(STORES.MEDIA, m);
          }
        } else {
          setMediaLibrary(media.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
        }
      } catch (err) {
        console.error("Failed to load IndexedDB data", err);
      } finally {
        setIsDbLoaded(true);
      }
    };
    loadFromDB();
  }, []);

  const addMediaAsset = (asset: Omit<MediaAsset, 'id' | 'uploadDate'>) => {
    const newAsset: MediaAsset = {
      ...asset,
      id: `media-${Date.now()}`,
      uploadDate: new Date().toISOString()
    };
    setMediaLibrary(prev => [newAsset, ...prev]);
    dbSet(STORES.MEDIA, newAsset).catch(console.error);
    return newAsset;
  };

  const updateMediaAsset = (id: string, updates: Partial<MediaAsset>) => {
    setMediaLibrary(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...updates } : m);
      const asset = updated.find(m => m.id === id);
      if (asset) dbSet(STORES.MEDIA, asset).catch(console.error);
      return updated;
    });
  };

  const deleteMediaAsset = (id: string) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
    dbDelete(STORES.MEDIA, id).catch(console.error);
  };

  const removeMediaAsset = deleteMediaAsset;
  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    const saved = localStorage.getItem('zenwar_mechanics');
    return saved ? JSON.parse(saved) : seedMechanics;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('zenwar_inventory');
    return saved ? JSON.parse(saved) : seedInventory;
  });

  const [inventoryHistory, setInventoryHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('zenwar_inventory_history');
    return saved ? JSON.parse(saved) : [];
  });

  const addInventoryHistory = (history: any) => {
    const newHistory = {
      ...history,
      id: `history-${Date.now()}`,
      date: new Date().toISOString()
    };
    setInventoryHistory(prev => [newHistory, ...prev]);
  };

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('zenwar_customers');
    return saved ? JSON.parse(saved) : seedCustomers;
  });

  const [jobCards, setJobCards] = useState<JobCard[]>(() => {
    const saved = localStorage.getItem('zenwar_jobcards');
    return saved ? JSON.parse(saved) : seedJobCards;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('zenwar_appointments');
    return saved ? JSON.parse(saved) : seedAppointments;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('zenwar_invoices');
    return saved ? JSON.parse(saved) : seedInvoices;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('zenwar_expenses');
    return saved ? JSON.parse(saved) : seedExpenses;
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('zenwar_config');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [notifications, setNotifications] = useState<NotificationMsg[]>(() => {
    const saved = localStorage.getItem('zenwar_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; mechanicId?: string; businessId?: string; tenantDomain?: string; profilePhoto?: string } | null>(() => {
    const saved = localStorage.getItem('zenwarAuth');
    return saved ? JSON.parse(saved) : null;
  });

  const [saCredentials, setSaCredentials] = useState(() => {
    const saved = localStorage.getItem('zenwar_sa_credentials');
    return saved ? JSON.parse(saved) : {
      username: 'zenwar_admin',
      password: 'Smart@123',
      email: 'zenwar_admin@zenwar.com',
      phone: '+1 (555) 100-3000',
      twoFactorEnabled: false,
      loginActivity: [
        { id: '1', timestamp: new Date().toISOString(), ip: '192.168.1.100', device: 'Chrome / Windows 11', location: 'New York, USA', status: 'Active' }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('zenwar_sa_credentials', JSON.stringify(saCredentials));
  }, [saCredentials]);

  const updateSaCredentials = (updated: any) => {
    setSaCredentials((prev: any) => ({ ...prev, ...updated }));
    if (currentUser?.role === 'superadmin') {
      setCurrentUser(prev => prev ? { ...prev, name: updated.username || prev.name } : null);
    }
  };

  const logoutAllSaDevices = () => {
    setSaCredentials((prev: any) => ({
      ...prev,
      loginActivity: prev.loginActivity.filter((log: any) => log.status === 'Active')
    }));
  };

  // Super Admin Users State
  const [superAdminUsers, setSuperAdminUsers] = useState<SuperAdminUser[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_users');
    let parsed = saved ? JSON.parse(saved) : seedSuperAdminUsers;
    
    // UNLOCK ADMIN USERS FOR ALL ROLES: Force adminUsers permission to true globally
    parsed = parsed.map((u: SuperAdminUser) => {
      if (!u.permissions.adminUsers) {
        return { ...u, permissions: { ...u.permissions, adminUsers: true } };
      }
      return u;
    });

    // EMERGENCY RECOVERY FOR SA-1: Force sa-1 to be owner on load if it was accidentally transferred
    const sa1 = parsed.find((u: SuperAdminUser) => u.id === 'sa-1');
    if (sa1 && sa1.role !== 'owner') {
      parsed = parsed.map((u: SuperAdminUser) => {
        if (u.id === 'sa-1') {
          return {
            ...u,
            role: 'owner',
            status: 'Active',
            permissions: {
              dashboard: true, businesses: true, permissions: true, staff: true,
              subscriptions: true, builder: true, revenue: true, payments: true,
              security: true, settings: true, activityLogs: true, adminUsers: true, notifications: true
            }
          };
        }
        if (u.role === 'owner') return { ...u, role: 'operations' };
        return u;
      });
      // Save it immediately so they don't get stuck
      localStorage.setItem('zenwar_sa_users', JSON.stringify(parsed));
    }
    
    return parsed;
  });

  const [currentSaUserId, setCurrentSaUserId] = useState<string | null>(() => {
    return localStorage.getItem('zenwar_sa_current_user_id') || null;
  });

  useEffect(() => {
    localStorage.setItem('zenwar_sa_users', JSON.stringify(superAdminUsers));
  }, [superAdminUsers]);

  useEffect(() => {
    if (currentSaUserId) {
      localStorage.setItem('zenwar_sa_current_user_id', currentSaUserId);
    } else {
      localStorage.removeItem('zenwar_sa_current_user_id');
    }
  }, [currentSaUserId]);

  const getCurrentSaUser = (): SuperAdminUser | null => {
    if (currentSaUserId) {
      return superAdminUsers.find(u => u.id === currentSaUserId) || null;
    }
    // Default to first owner admin
    return superAdminUsers.find(u => u.role === 'owner') || superAdminUsers[0] || null;
  };

  const canSaUserAccess = (page: keyof SuperAdminPermissions): boolean => {
    const saUser = getCurrentSaUser();
    if (!saUser) return true; // default allow if no SA user system set up
    if (saUser.role === 'owner') return true; // owner has full access
    return saUser.permissions[page] === true;
  };

  const addSuperAdminUser = (user: Omit<SuperAdminUser, 'id' | 'createdAt'>) => {
    const currentOwner = getCurrentSaUser();
    if (user.role === 'owner' && (!currentOwner || currentOwner.role !== 'owner')) return;

    if (user.permissions) {
      const allTrue = Object.values(user.permissions).every(val => val === true);
      if (allTrue && user.role !== 'owner' && (!currentOwner || currentOwner.role !== 'owner')) {
        return; // Reject: non-owner cannot grant all permissions
      }
    }

    const newUser: SuperAdminUser = {
      ...user,
      id: `sa-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSuperAdminUsers(prev => [...prev, newUser]);
    addSaAuditLog('Super Admin User Created', `${newUser.name} (${newUser.role})`);
  };

  const updateSuperAdminUser = (id: string, updated: Partial<SuperAdminUser>) => {
    const targetUser = superAdminUsers.find(u => u.id === id);
    const currentOwner = getCurrentSaUser();

    if (updated.role === 'owner' && (!currentOwner || currentOwner.role !== 'owner')) {
        return;
    }

    if (updated.permissions) {
      const allTrue = Object.values(updated.permissions).every(val => val === true);
      const isTargetOwner = targetUser?.role === 'owner' || updated.role === 'owner';
      if (allTrue && !isTargetOwner && (!currentOwner || currentOwner.role !== 'owner')) {
        return; // Reject: non-owner cannot grant all permissions to a non-owner
      }
    }

    if (targetUser?.role === 'owner') {
      // PROTECTED: Owner role and permissions cannot be changed by standard update
      const safeUpdate = { ...updated };
      delete safeUpdate.role;
      delete safeUpdate.status;
      delete safeUpdate.permissions;
      setSuperAdminUsers(prev => prev.map(u => u.id === id ? { ...u, ...safeUpdate } : u));
      addSaAuditLog('Owner Super Admin Profile Updated', `ID: ${id}`);
      return;
    }
    setSuperAdminUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    addSaAuditLog('Super Admin User Updated', `ID: ${id}`);
  };

  const deleteSuperAdminUser = (id: string) => {
    const user = superAdminUsers.find(u => u.id === id);
    if (user?.role === 'owner') return; // Cannot delete owner
    setSuperAdminUsers(prev => prev.filter(u => u.id !== id));
    addSaAuditLog('Super Admin User Deleted', `ID: ${id}`);
  };



  const transferOwnership = (newOwnerId: string, confirmPass: string) => {
    const currentOwner = getCurrentSaUser();
    if (!currentOwner || currentOwner.role !== 'owner' || currentOwner.password !== confirmPass) {
      return false; // Invalid transfer
    }
    
    setSuperAdminUsers(prev => prev.map(u => {
      if (u.id === newOwnerId) {
        return { 
          ...u, 
          role: 'owner',
          permissions: {
            dashboard: true, businesses: true, permissions: true, staff: true,
            subscriptions: true, builder: true, revenue: true, payments: true,
            security: true, settings: true, activityLogs: true, adminUsers: true, notifications: true
          }
        };
      }
      if (u.id === currentOwner.id) {
        return { ...u, role: 'operations' }; // Demote old owner
      }
      return u;
    }));
    addSaAuditLog('SECURITY: Ownership Transferred', `From ${currentOwner.id} to ${newOwnerId}`);
    return true;
  };

  // Module Access Engine
  const getEffectiveModuleAccess = (tenantDomain: string): BusinessModuleAccess => {
    const fullAccess: BusinessModuleAccess = {
      dashboard: true, billing: true, invoices: true, jobCards: true, customers: true,
      inventory: true, staffs: true, appointments: true, reports: true, settings: true,
      whatsapp: true, multiBranch: true, advancedAnalytics: true, apiAccess: true, paymentIntegration: true
    };
    const business = businesses.find(w => (w.tenantDomain || '').toUpperCase() === (tenantDomain || '').toUpperCase());
    if (!business) return fullAccess;

    // Get plan-level access
    const plan = subscriptionPlans.find(p => p.id === business.planId);
    const planAccess: BusinessModuleAccess = plan?.moduleAccess ? { ...plan.moduleAccess } : { ...fullAccess };

    // Merge SA per-tenant overrides (SA overrides take priority)
    const overrides = business.moduleOverrides || {};
    return { ...planAccess, ...overrides };
  };

  const updateWorkshopModuleOverrides = (businessId: string, overrides: Partial<BusinessModuleAccess>) => {
    setWorkshops(prev => prev.map(w => {
      if (w.id === businessId) {
        return { ...w, moduleOverrides: { ...(w.moduleOverrides || {}), ...overrides } };
      }
      return w;
    }));
    addSaAuditLog('Module Access Updated', `Business ID: ${businessId}`);
  };

  // Super Admin Local States
  const [businesses, setWorkshops] = useState<Business[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_workshops');
    return saved ? JSON.parse(saved) : seedBusinesses;
  });

  const [permissionRules, setPermissionRules] = useState<PermissionRule[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_permission_rules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((rule: any) => ({
          ...rule,
          billing: { read: true, create: false, edit: false, delete: false, export: false, approve: false, ...rule.billing },
          invoices: { read: true, create: false, edit: false, delete: false, export: false, approve: false, ...rule.invoices },
          inventory: { read: true, create: false, edit: false, delete: false, export: false, approve: false, ...rule.inventory },
          reports: { read: true, create: false, edit: false, delete: false, export: false, approve: false, ...rule.reports },
          dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false, ...rule.dashboard }
        }));
      } catch (e) {
        return seedPermissionRules;
      }
    }
    return seedPermissionRules;
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_subscription_plans');
    return saved ? JSON.parse(saved) : seedSubscriptionPlans;
  });

  useEffect(() => {
    localStorage.setItem('zenwar_sa_subscription_plans', JSON.stringify(subscriptionPlans));
  }, [subscriptionPlans]);

  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>(seedPendingRegistrations);
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_contact_requests');
    return saved ? JSON.parse(saved) : seedInquiries;
  });

  useEffect(() => {
    localStorage.setItem('zenwar_sa_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);
  const [saAnnouncements, setSaAnnouncements] = useState<SaAnnouncement[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_announcements');
    return saved ? JSON.parse(saved) : seedSaAnnouncements;
  });

  const [saAuditLogs, setSaAuditLogs] = useState<SaAuditLog[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_audit_logs');
    return saved ? JSON.parse(saved) : seedSaAuditLogs;
  });

  const [saBackups, setSaBackups] = useState<SaBackup[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_backups');
    return saved ? JSON.parse(saved) : seedSaBackups;
  });

  
const defaultLandingPageSettings: LandingPageSettings = {
  enableRegistration: true,
  enableLogin: true,
  enableFreeTrial: true,
  enablePaidRegistration: true,
  enablePaymentGateway: true,
  maintenanceMode: false
};

const defaultSaPaymentSettings: SaPaymentSettings = {
    razorpayKeyId: 'rzp_test_51Mz2H7S',
    razorpaySecretKey: 'sec_test_abc123XYZ',
    razorpayTestMode: true,
    razorpayWebhookUrl: 'https://zenwar.co/api/v1/webhooks/payments',
    razorpayWebhookSecret: 'whsec_rzp12345ABC',
    razorpayCurrency: 'INR',
    razorpayEnabled: true,
    upiId: 'zenwar@upi',
    upiHolderName: 'Zenwar Inc',
    upiEnabled: true,
    activeMethods: ['UPI', 'Razorpay', 'Card', 'Net Banking'],
    trialEnabled: true,
    trialDays: 14,
    autoVerification: true,
    pollingInterval: 5,
    taxRatePercent: 18,
    taxInvoicePrefix: 'TXN-SaaS-'
  };

  const seedSaPayments: SaPayment[] = [
    { id: 'tx-1', tenantDomain: 'APEXAUTO', businessName: 'Apex Auto Center', planId: 'enterprise', planName: 'Enterprise Flow', billingPeriod: 'monthly', amount: 29999, paymentMethod: 'Razorpay', status: 'Paid', date: '2026-05-25T14:20:00Z', transactionId: 'pay_P1028192', paymentType: 'onboarding', taxAmount: 4576 },
    { id: 'tx-2', tenantDomain: 'ELITEAUTO', businessName: 'Elite Motors', planId: 'enterprise', planName: 'Enterprise Flow', billingPeriod: 'monthly', amount: 29999, paymentMethod: 'UPI', status: 'Paid', date: '2026-05-24T10:15:00Z', transactionId: 'upi_89301129', upiId: 'elitemotors@okhdfc', paymentType: 'renewal', taxAmount: 4576 },
    { id: 'tx-3', tenantDomain: 'PRECIBIKE', businessName: 'Precision Bikes', planId: 'starter', planName: 'Starter Ride', billingPeriod: 'monthly', amount: 4999, paymentMethod: 'Card', status: 'Paid', date: '2026-05-23T16:45:00Z', transactionId: 'txn_7612293', paymentType: 'onboarding', taxAmount: 762 },
    { id: 'tx-4', tenantDomain: 'CARBONSPIED', businessName: 'Carbon Speed Shop', planId: 'growth', planName: 'Growth Speedster', billingPeriod: 'monthly', amount: 12999, paymentMethod: 'UPI', status: 'Pending', date: '2026-05-22T11:30:00Z', transactionId: 'upi_6591102', upiId: 'carbonspeed@upi', paymentType: 'onboarding', taxAmount: 1983 },
    { id: 'tx-5', tenantDomain: 'METROCARE', businessName: 'Metro Car Care', planId: 'growth', planName: 'Growth Speedster', billingPeriod: 'monthly', amount: 12999, paymentMethod: 'Razorpay', status: 'Failed', date: '2026-05-18T09:00:00Z', transactionId: 'pay_F912019', paymentType: 'onboarding', taxAmount: 1983 }
  ];

  // Encrypt / Decrypt helpers for payment configurations
  const encryptData = (data: string) => {
    return btoa(encodeURIComponent(data));
  };

  const decryptData = (encrypted: string) => {
    try {
      if (encrypted.trim().startsWith('{')) {
        return encrypted;
      }
      return decodeURIComponent(atob(encrypted));
    } catch (e) {
      return encrypted;
    }
  };

  
  const [landingPageSettings, setLandingPageSettings] = useState<LandingPageSettings>(() => {
    const saved = localStorage.getItem('zenwar_landing_page_settings');
    return saved ? JSON.parse(saved) : defaultLandingPageSettings;
  });

  useEffect(() => {
    localStorage.setItem('zenwar_landing_page_settings', JSON.stringify(landingPageSettings));
  }, [landingPageSettings]);

  const updateLandingPageSettings = (updated: Partial<LandingPageSettings>) => {
    setLandingPageSettings(prev => ({ ...prev, ...updated }));
    addSaAuditLog('SETTINGS_UPDATE', 'Landing page settings updated');
  };

  const [saPaymentSettings, setSaPaymentSettings] = useState<SaPaymentSettings>(() => {
    const saved = localStorage.getItem('zenwar_sa_payment_settings');
    if (saved) {
      try {
        const decrypted = decryptData(saved);
        return JSON.parse(decrypted);
      } catch (e) {
        console.error('Failed to decrypt payment settings', e);
      }
    }
    return defaultSaPaymentSettings;
  });

  const [saPayments, setSaPayments] = useState<SaPayment[]>(() => {
    const saved = localStorage.getItem('zenwar_sa_payments');
    return saved ? JSON.parse(saved) : seedSaPayments;
  });

  const [workshopPaymentConfigs, setWorkshopPaymentConfigs] = useState<Record<string, WorkshopPaymentConfig>>(() => {
    const saved = localStorage.getItem('zenwar_tenant_payment_settings');
    if (saved) {
      try {
        const decrypted = decryptData(saved);
        return JSON.parse(decrypted);
      } catch (e) {
        console.error('Failed to decrypt business payment settings', e);
      }
    }
    return {};
  });

  const [paymentAuditLogs, setPaymentAuditLogs] = useState<PaymentAuditLog[]>(() => {
    const saved = localStorage.getItem('zenwar_tenant_payment_audit_logs');
    if (saved) {
      try {
        const decrypted = decryptData(saved);
        return JSON.parse(decrypted);
      } catch (e) {
        console.error('Failed to decrypt payment audit logs', e);
      }
    }
    return [];
  });

  useEffect(() => { 
    localStorage.setItem('zenwar_sa_payment_settings', encryptData(JSON.stringify(saPaymentSettings))); 
  }, [saPaymentSettings]);
  useEffect(() => { localStorage.setItem('zenwar_sa_payments', JSON.stringify(saPayments)); }, [saPayments]);

  useEffect(() => {
    localStorage.setItem('zenwar_tenant_payment_settings', encryptData(JSON.stringify(workshopPaymentConfigs)));
  }, [workshopPaymentConfigs]);

  useEffect(() => {
    localStorage.setItem('zenwar_tenant_payment_audit_logs', encryptData(JSON.stringify(paymentAuditLogs)));
  }, [paymentAuditLogs]);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('zenwar_mechanics', JSON.stringify(mechanics)); }, [mechanics]);
  useEffect(() => { localStorage.setItem('zenwar_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('zenwar_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('zenwar_jobcards', JSON.stringify(jobCards)); }, [jobCards]);
  useEffect(() => { localStorage.setItem('zenwar_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('zenwar_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('zenwar_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('zenwar_config', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('zenwar_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('zenwarAuth', JSON.stringify(currentUser)); }, [currentUser]);

  // Super Admin Syncs
  useEffect(() => { localStorage.setItem('zenwar_sa_workshops', JSON.stringify(businesses)); }, [businesses]);
  useEffect(() => { localStorage.setItem('zenwar_sa_permission_rules', JSON.stringify(permissionRules)); }, [permissionRules]);
  useEffect(() => { localStorage.setItem('zenwar_sa_announcements', JSON.stringify(saAnnouncements)); }, [saAnnouncements]);
  useEffect(() => { localStorage.setItem('zenwar_sa_audit_logs', JSON.stringify(saAuditLogs)); }, [saAuditLogs]);
  useEffect(() => { localStorage.setItem('zenwar_sa_backups', JSON.stringify(saBackups)); }, [saBackups]);

  // Auth Functions
  const login = (tenantDomain: string, usernameOrEmail: string, passwordOrRole: string): { name: string; role: string; tenantDomain: string } | false => {
    const domainUpper = tenantDomain.trim().toUpperCase();
    const userLower = usernameOrEmail.trim().toLowerCase();

    // Sandbox Demo Tenant Bypass
    if (domainUpper === 'DEMO001') {
      resetDemoWorkshopData('DEMO001');
      const userObj = { 
        name: 'Demo Manager', 
        role: 'admin', 
        businessId: 'w-demo',
        tenantDomain: 'DEMO001',
        profilePhoto: '⚡',
        isDemoUser: true
      };
      setCurrentUser(userObj);
      setSettings({
        shopName: 'Zenwar Demo',
        tagline: 'Premium Auto Care & Detailing Sandbox',
        logoUrl: '⚡',
        gstNumber: '27AAAAA1111A1Z1',
        phone: '+91 99999 88888',
        address: 'Demo Industrial Hub, Suite 101, IN',
        currency: 'INR',
        defaultGstRate: 18,
        email: 'demo@zenwar.co'
      });
      return userObj as any;
    }

    // 1. Super Admin Login
    if (domainUpper === 'SYSTEM') {
      const matchedAdmin = superAdminUsers.find(u => 
        ((u.username || '').trim().toLowerCase() === userLower || (u.email || '').trim().toLowerCase() === userLower) && 
        u.password === passwordOrRole &&
        u.status === 'Active'
      );
      
      // Fallback to legacy default bypass just in case of complete lockout during testing
      const isLegacyBypass = !matchedAdmin && (userLower === 'superadmin@zenwar.com' && passwordOrRole === 'superadmin');

      if (!matchedAdmin && !isLegacyBypass) {
        const userExists = superAdminUsers.find(u => (u.username || '').trim().toLowerCase() === userLower || (u.email || '').trim().toLowerCase() === userLower);
        if (!userExists) {
           throw new Error(`Admin account '${usernameOrEmail}' not found.`);
        } else if (userExists.status !== 'Active') {
           throw new Error(`Account is ${userExists.status}. Please contact the Owner.`);
        } else {
           throw new Error(`Incorrect password for ${usernameOrEmail}.`);
        }
      }

      if (matchedAdmin || isLegacyBypass) {
        // Record active session
        const newSession = {
          id: `sess-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ip: '192.168.1.' + Math.floor(100 + Math.random() * 150),
          device: 'Chrome / Windows 11',
          location: 'New York, USA',
          status: 'Active' as const
        };
        setSaCredentials((prev: any) => ({
          ...prev,
          loginActivity: [newSession, ...(prev.loginActivity || []).map((x: any) => ({ ...x, status: 'Inactive' as const }))]
        }));

        if (matchedAdmin) {
          setCurrentSaUserId(matchedAdmin.id);
        }

        const userObj = { 
          name: matchedAdmin ? matchedAdmin.name : 'System Admin', 
          role: 'superadmin', 
          tenantDomain: 'SYSTEM' 
        };
        setCurrentUser(userObj);
        return userObj;
      }
    }

    // 2. Direct role mappings for testing/mocking
    if (['admin', 'mechanic', 'superadmin'].includes(passwordOrRole)) {
      const matchedW = businesses.find(w => (w.tenantDomain || '').toUpperCase() === domainUpper);
      const activeWId = domainUpper === 'SYSTEM' ? undefined : (matchedW?.id || 'w-1');
      const userObj = {
        name: usernameOrEmail,
        role: passwordOrRole,
        businessId: activeWId,
        tenantDomain: domainUpper === 'SYSTEM' ? 'SYSTEM' : (matchedW?.tenantDomain || 'APEXAUTO'),
        profilePhoto: passwordOrRole === 'admin' ? matchedW?.profilePhoto : undefined
      };
      setCurrentUser(userObj);
      return userObj as any;
    }

    // 3. Find matching business by tenantDomain
    const matchedShop = businesses.find(w => (w.tenantDomain || '').toUpperCase() === domainUpper);
    if (!matchedShop) {
      return false;
    }

    if (matchedShop.status === 'Suspended') {
      throw new Error('This business account is suspended. Please contact Super Admin.');
    }
    if (matchedShop.loginAccessDisabled) {
      throw new Error('Login access is temporarily disabled for this business.');
    }

    // Check if credentials match a business admin
    if (
      (matchedShop.username?.toLowerCase() === userLower || 
       matchedShop.email.toLowerCase() === userLower) && 
      matchedShop.password === passwordOrRole
    ) {
      const userObj = { 
        name: matchedShop.ownerName + ' (Admin)', 
        role: 'admin', 
        businessId: matchedShop.id,
        tenantDomain: matchedShop.tenantDomain,
        profilePhoto: matchedShop.profilePhoto
      };
      // Log in as Business Admin
      setCurrentUser(userObj);

      // Update shop identity settings dynamically to match this tenant
      setSettings({
        shopName: matchedShop.name,
        tagline: 'Smart Business & Billing Management',
        logoUrl: matchedShop.logoUrl || '⚡',
        gstNumber: matchedShop.gstNumber || '27AAACG1234F1Z5',
        phone: matchedShop.phone,
        address: 'Auto Grid Road',
        currency: 'INR',
        defaultGstRate: 18,
        email: 'contact@zenwar.co'
      });

      // Add to login history logs
      const updatedHistory = [
        { timestamp: new Date().toISOString(), ip: '192.168.1.15', device: 'Chrome / Web Portal', location: 'Office', success: true },
        ...(matchedShop.loginHistory || [])
      ];
      setWorkshops(prev => prev.map(w => w.id === matchedShop.id ? { ...w, loginHistory: updatedHistory } : w));

      return userObj as any;
    }

    // Check if credentials match a staff/mechanic account
    const matchedStaff = mechanics.find(m => 
      m.businessId === matchedShop.id &&
      m.username && 
      m.username.toLowerCase() === userLower && 
      m.password === passwordOrRole
    );

    if (matchedStaff) {
      if (matchedStaff.loginAccessDisabled) {
        throw new Error('Your staff login access has been disabled by the admin.');
      }
      
      const userObj = {
        name: matchedStaff.name,
        role: matchedStaff.role.toLowerCase() || 'mechanic',
        mechanicId: matchedStaff.id,
        businessId: matchedShop.id,
        tenantDomain: matchedShop.tenantDomain,
        profilePhoto: matchedStaff.profilePhoto
      };
      
      setCurrentUser(userObj);

      // Synchronize settings for this business
      setSettings({
        shopName: matchedShop.name,
        tagline: 'Smart Business & Billing Management',
        logoUrl: matchedShop.logoUrl || '⚡',
        gstNumber: matchedShop.gstNumber || '27AAACG1234F1Z5',
        phone: matchedShop.phone,
        address: 'Auto Grid Road',
        currency: 'INR',
        defaultGstRate: 18,
        email: 'contact@zenwar.co'
      });

      return userObj as any;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUserProfile = (updatedData: any, newPassword?: string, currentPassword?: string) => {
    if (!currentUser) return;

    const performPasswordCheck = (storedHash: string | undefined) => {
      if (newPassword && storedHash !== currentPassword) {
        throw new Error('Current password does not match. Profile update failed.');
      }
    };

    if (currentUser.role === 'superadmin' || currentUser.tenantDomain === 'SYSTEM') {
      const saUserId = currentSaUserId || 'sa-1';
      const saUser = superAdminUsers.find(u => u.id === saUserId);
      if (saUser) {
        performPasswordCheck(saUser.password);
        const updates: Partial<SuperAdminUser> = {
          name: updatedData.name || saUser.name,
          username: updatedData.username || saUser.username,
          email: updatedData.email || saUser.email,
          phone: updatedData.phone || saUser.phone,
          profilePhoto: updatedData.profilePhoto !== undefined ? updatedData.profilePhoto : saUser.profilePhoto,
          designation: updatedData.designation !== undefined ? updatedData.designation : saUser.designation,
          bio: updatedData.bio !== undefined ? updatedData.bio : saUser.bio,
        };
        if (newPassword) updates.password = newPassword;
        updateSuperAdminUser(saUserId, updates);
        setCurrentUser(prev => prev ? { ...prev, name: updates.name as string, profilePhoto: updates.profilePhoto } : null);
      }
    } else if (currentUser.role === 'admin' && currentUser.businessId) {
      const business = businesses.find(b => b.id === currentUser.businessId);
      if (business) {
        performPasswordCheck(business.password);
        const updates: Partial<Business> = {
          ownerName: updatedData.name || business.ownerName,
          username: updatedData.username || business.username,
          phone: updatedData.phone || business.phone,
          email: updatedData.email || business.email,
          profilePhoto: updatedData.profilePhoto !== undefined ? updatedData.profilePhoto : business.profilePhoto,
        };
        if (newPassword) updates.password = newPassword;
        setWorkshops(prev => prev.map(w => w.id === business.id ? { ...w, ...updates } : w));
        setCurrentUser(prev => prev ? { ...prev, name: updates.ownerName as string, profilePhoto: updates.profilePhoto } : null);
      }
    } else if (currentUser.mechanicId) {
      const mechanic = mechanics.find(m => m.id === currentUser.mechanicId);
      if (mechanic) {
        performPasswordCheck(mechanic.password);
        const updates: Partial<Mechanic> = {
          name: updatedData.name || mechanic.name,
          mobileNumber: updatedData.phone || mechanic.mobileNumber,
          email: updatedData.email || mechanic.email,
          profilePhoto: updatedData.profilePhoto !== undefined ? updatedData.profilePhoto : mechanic.profilePhoto,
        };
        if (newPassword) updates.password = newPassword;
        updateMechanic(mechanic.id, updates);
        setCurrentUser(prev => prev ? { ...prev, name: updates.name as string, profilePhoto: updates.profilePhoto } : null);
      }
    }
  };

  // Mechanics CRUD
  const addMechanic = (m: Omit<Mechanic, 'id' | 'rating' | 'efficiency' | 'tasksAssigned' | 'attendance'>) => {
    const newMech: Mechanic = {
      ...m,
      id: m.staffId || `m-${Date.now()}`,
      rating: 5.0,
      efficiency: 100,
      tasksAssigned: 0,
      attendance: 'Present',
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    };
    setMechanics(prev => [...prev, newMech]);
    addSaAuditLog('Staff Created', `${newMech.name} (Role: ${newMech.role})`);
  };

  const updateMechanic = (id: string, updated: Partial<Mechanic>) => {
    setMechanics(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    // Sync current logged in staff session
    if (currentUser?.mechanicId === id) {
      setCurrentUser(prev => prev ? { 
        ...prev, 
        name: updated.name || prev.name,
        profilePhoto: updated.profilePhoto !== undefined ? updated.profilePhoto : prev.profilePhoto
      } : null);
    }
  };

  // Inventory CRUD
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItemId = `p-${Date.now()}`;
    const newItem: InventoryItem = {
      ...item,
      id: newItemId,
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    };
    setInventory(prev => [newItem, ...prev]);
    addNotification('New Item Added', `Part "${item.name}" registered in inventory.`, 'success');
    
    if (newItem.stock > 0) {
      addInventoryHistory({
        productId: newItem.id,
        productName: newItem.name,
        sku: newItem.sku || 'N/A',
        changeType: 'Import',
        quantityChange: newItem.stock,
        newStockLevel: newItem.stock,
        notes: 'Initial stock added',
        tenantDomain: newItem.tenantDomain
      });
    }
  };

  const updateInventoryItem = (id: string, updated: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id && item.tenantDomain === currentUser?.tenantDomain) {
        const result = { ...item, ...updated };
        
        if (updated.stock !== undefined && updated.stock !== item.stock) {
          addInventoryHistory({
            productId: item.id,
            productName: item.name,
            sku: item.sku || 'N/A',
            changeType: 'Manual Adjust',
            quantityChange: updated.stock - item.stock,
            newStockLevel: updated.stock,
            notes: 'Stock manually updated',
            tenantDomain: item.tenantDomain
          });
        }

        // Trigger notification if stock drops below threshold
        if (result.stock <= result.threshold && item.stock > item.threshold) {
          addNotification('Low Stock Alert', `Stock of "${result.name}" has fallen below safety threshold (${result.stock} units left).`, 'warning');
        }
        return result;
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => !(item.id === id && item.tenantDomain === currentUser?.tenantDomain)));
  };

  const useInventoryItems = (items: { id: string; quantity: number }[]): boolean => {
    // Validate if items have sufficient stock
    let ok = true;
    items.forEach(req => {
      const dbItem = inventory.find(i => i.id === req.id && i.tenantDomain === currentUser?.tenantDomain);
      if (!dbItem || dbItem.stock < req.quantity) ok = false;
    });

    if (!ok) return false;

    // Deduct stock
    setInventory(prev => prev.map(item => {
      if (item.tenantDomain === currentUser?.tenantDomain) {
        const match = items.find(req => req.id === item.id);
        if (match) {
          const newStock = item.stock - match.quantity;
          
          addInventoryHistory({
            productId: item.id,
            productName: item.name,
            sku: item.sku || 'N/A',
            changeType: 'Invoice Sold',
            quantityChange: -match.quantity,
            newStockLevel: newStock,
            notes: 'Used in Invoice/Job Card',
            tenantDomain: item.tenantDomain
          });

          if (newStock <= item.threshold) {
            addNotification('Low Stock Alert', `Stock of "${item.name}" has fallen below safety threshold (${newStock} units left).`, 'warning');
          }
          return { ...item, stock: newStock };
        }
      }
      return item;
    }));
    return true;
  };

  const bulkAddInventoryItems = (items: Omit<InventoryItem, 'id'>[]) => {
    const newItems: InventoryItem[] = items.map((item, index) => ({
      ...item,
      id: `p-${Date.now()}-${index}`,
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    }));
    setInventory(prev => [...newItems, ...prev]);
    addNotification('Bulk Import Success', `${items.length} new parts registered in inventory.`, 'success');
  };

  const bulkUpdateInventoryItems = (items: (Partial<InventoryItem> & { sku: string })[]) => {
    setInventory(prev => prev.map(dbItem => {
      if (dbItem.tenantDomain === currentUser?.tenantDomain) {
        const update = items.find(i => i.sku === dbItem.sku);
        if (update) {
          return { ...dbItem, ...update };
        }
      }
      return dbItem;
    }));
    addNotification('Bulk Update Success', `Updated ${items.length} existing parts in inventory.`, 'success');
  };

  const bulkUpdateInventoryStock = (updates: { sku: string; stock: number }[]) => {
    setInventory(prev => prev.map(dbItem => {
      if (dbItem.tenantDomain === currentUser?.tenantDomain) {
        const match = updates.find(u => u.sku === dbItem.sku);
        if (match) {
          const newStock = match.stock;
          return { ...dbItem, stock: newStock };
        }
      }
      return dbItem;
    }));
    addNotification('Stock Sync Complete', `Stock levels updated for ${updates.length} items.`, 'success');
  };

  // Customers CRUD
  const addCustomer = (customer: Omit<Customer, 'id' | 'loyaltyPoints'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: `c-${Date.now()}`,
      loyaltyPoints: 0,
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const addVehicleToCustomer = (customerId: string, vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `v-${Date.now()}`
    };
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, vehicles: [...c.vehicles, newVehicle] };
      }
      return c;
    }));
  };

  // Job Cards CRUD
  const addJobCard = (jobCard: Omit<JobCard, 'id' | 'dateCreated' | 'status' | 'beforeImage' | 'afterImage'>): JobCard => {
    const newJob: JobCard = {
      ...jobCard,
      id: `jc-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Diagnosing',
      dateCreated: new Date().toISOString(),
      beforeImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
      afterImage: '',
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    };
    
    setJobCards(prev => [newJob, ...prev]);

    // Track task for assigned mechanic
    if (jobCard.assignedMechanicId) {
      setMechanics(prev => prev.map(m => 
        m.id === jobCard.assignedMechanicId 
          ? { ...m, tasksAssigned: m.tasksAssigned + 1 }
          : m
      ));
    }

    addNotification('Job Card Created', `New job card ${newJob.id} registered for ${newJob.vehicleMake} ${newJob.vehicleModel}.`, 'info');
    return newJob;
  };

  const updateJobCard = (id: string, updated: Partial<JobCard>) => {
    let oldMechanicId = '';
    let newMechanicId = '';
    let oldStatus = '';
    let newStatus = '';
    
    setJobCards(prev => prev.map(jc => {
      if (jc.id === id) {
        oldMechanicId = jc.assignedMechanicId;
        newMechanicId = updated.assignedMechanicId !== undefined ? updated.assignedMechanicId : jc.assignedMechanicId;
        oldStatus = jc.status;
        newStatus = updated.status !== undefined ? updated.status : jc.status;
        
        return { ...jc, ...updated } as JobCard;
      }
      return jc;
    }));

    // Adjust assigned task counters for mechanics
    if (updated.assignedMechanicId !== undefined && oldMechanicId !== newMechanicId) {
      setMechanics(prev => prev.map(m => {
        if (m.id === oldMechanicId) return { ...m, tasksAssigned: Math.max(0, m.tasksAssigned - 1) };
        if (m.id === newMechanicId) return { ...m, tasksAssigned: m.tasksAssigned + 1 };
        return m;
      }));
    }

    // If status completed/delivered, decrement mechanic task counter
    if (newStatus === 'Delivered' && oldStatus !== 'Delivered' && newMechanicId) {
      setMechanics(prev => prev.map(m => 
        m.id === newMechanicId ? { ...m, tasksAssigned: Math.max(0, m.tasksAssigned - 1) } : m
      ));
    }

    // Trigger status transition notification
    if (newStatus && oldStatus !== newStatus) {
      addNotification('Job Status Updated', `Job card ${id} is now: ${newStatus}`, 'success');
    }
  };

  // Appointments CRUD
  const addAppointment = (appointment: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `ap-${Date.now()}`,
      status: 'Scheduled',
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    };
    setAppointments(prev => [newAppointment, ...prev]);
    addNotification('Appointment Booked', `Slot booked for ${appointment.customerName} on ${appointment.date}.`, 'info');
  };

  const updateAppointment = (id: string, updated: Partial<Appointment>) => {
    setAppointments(prev => prev.map(ap => ap.id === id ? { ...ap, ...updated } : ap));
  };

  // Billing CRUD
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>): Invoice => {
    const nextNum = 1000 + invoices.length + 1;
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `GF-2026-${nextNum}`,
      date: new Date().toISOString().split('T')[0],
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Update Customer loyalty points (1 point per ₹100 spent)
    const pointsGained = Math.floor(invoice.total / 100);
    setCustomers(prev => prev.map(c => 
      c.id === invoice.customerId 
        ? { ...c, loyaltyPoints: c.loyaltyPoints + pointsGained } 
        : c
    ));

    // Deduct stock for parts sold in billing
    const partsUsed = invoice.items
      .filter(item => item.type === 'part')
      .map(item => {
        const match = item.productId
          ? inventory.find(inv => inv.id === item.productId && inv.tenantDomain === currentUser?.tenantDomain)
          : inventory.find(inv => inv.name.toLowerCase() === item.name.toLowerCase() && inv.tenantDomain === currentUser?.tenantDomain);
        return match ? { id: match.id, quantity: item.quantity } : null;
      })
      .filter((x): x is { id: string; quantity: number } => x !== null);

    if (partsUsed.length > 0) {
      const success = useInventoryItems(partsUsed);
      if (!success) {
        throw new Error('Insufficient stock for one or more parts.');
      }
    }

    // Resolve any job cards associated with this plate/customer to "Delivered"
    setJobCards(prev => prev.map(jc => 
      (jc.customerId === invoice.customerId && jc.status !== 'Delivered') 
        ? { ...jc, status: 'Delivered' } 
        : jc
    ));

    addNotification('Invoice Created', `Invoice ${newInvoice.invoiceNumber} (₹${invoice.total}) issued successfully.`, 'success');
    return newInvoice;
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } as Invoice : inv));
    addNotification('Invoice Updated', 'Invoice saved successfully.', 'success');
  };

  // Expenses CRUD
  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      businessId: currentUser?.businessId || 'w-1',
      tenantDomain: currentUser?.tenantDomain || 'APEXAUTO',
      createdBy: currentUser?.name || 'System',
      role: currentUser?.role || 'admin'
    };
    setExpenses(prev => [newExpense, ...prev]);
    addNotification('Expense Logged', `Logged ₹${expense.amount} under ${expense.category}.`, 'info');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Settings CRUD
  const updateSettings = (updated: Partial<ShopSettings>) => {
    setSettings(prev => ({ ...prev, ...updated }));
    addNotification('Settings Saved', 'Business preferences successfully updated.', 'success');
  };

  // Notifications CRUD
  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success') => {
    const newNotification: NotificationMsg = {
      id: `n-${Date.now()}`,
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Super Admin CRUD Implementation
  const addWorkshop = (w: Omit<Business, 'id' | 'registeredDate' | 'activeUsers' | 'usage' | 'smsCredits' | 'whatsappCredits' | 'loginHistory' | 'deviceActivity'>) => {
    const plan = subscriptionPlans.find(p => p.id === w.planId) || {
      maxStorageMb: w.planId === 'starter' ? 100 : w.planId === 'growth' ? 1024 : 10240,
      maxInvoices: w.planId === 'starter' ? 500 : w.planId === 'growth' ? 2000 : 10000,
      smsCredits: 500,
      whatsappCredits: 200
    };

    const newWorkshop: Business = {
      ...w,
      id: `w-${Date.now()}`,
      registeredDate: new Date().toISOString().split('T')[0],
      activeUsers: 1,
      smsCredits: (plan as any).smsCredits ?? 500,
      whatsappCredits: (plan as any).whatsappCredits ?? 200,
      usage: { 
        storageMb: 10, 
        storageLimit: plan.maxStorageMb, 
        invoicesCount: 0, 
        invoicesLimit: plan.maxInvoices 
      },
      loginHistory: [],
      deviceActivity: []
    };
    setWorkshops(prev => [newWorkshop, ...prev]);
    addSaAuditLog('Business Created', `${newWorkshop.name} (Plan: ${newWorkshop.planId})`);
  };

  const updateWorkshop = (id: string, updated: Partial<Business>) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
    addSaAuditLog('Business Updated', `ID ${id} details updated`);
    // Sync current logged in admin business session
    if (currentUser?.businessId === id && currentUser?.role === 'admin') {
      setCurrentUser(prev => prev ? { 
        ...prev, 
        name: (updated.ownerName ? `${updated.ownerName} (Admin)` : prev.name),
        profilePhoto: updated.profilePhoto !== undefined ? updated.profilePhoto : prev.profilePhoto
      } : null);
    }
  };


  const submitInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'readStatus' | 'leadStatus' | 'source'>) => {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      source: 'Landing Page',
      leadStatus: 'New',
      readStatus: 'UNREAD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const markInquiryRead = (id: string) => {
    setInquiries(prev => prev.map(inq => 
      inq.id === id ? { ...inq, readStatus: 'READ', updatedAt: new Date().toISOString() } : inq
    ));
    addSaAuditLog('REQUEST_OPENED', `Inquiry ${id} was read.`);
  };

  const markInquiryUnread = (id: string) => {
    setInquiries(prev => prev.map(inq => 
      inq.id === id ? { ...inq, readStatus: 'UNREAD', updatedAt: new Date().toISOString() } : inq
    ));
  };

  const updateInquiryStatus = (id: string, status: Inquiry['leadStatus']) => {
    setInquiries(prev => prev.map(inq => 
      inq.id === id ? { ...inq, leadStatus: status, updatedAt: new Date().toISOString() } : inq
    ));
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(inq => inq.id !== id));
  };

  const addPendingRegistration = (reg: any) => {
    const id = 'reg-' + Date.now().toString();
    const newReg: PendingRegistration = {
      ...reg,
      registrationId: id,
      createdAt: new Date().toISOString()
    };
    setPendingRegistrations(prev => [...prev, newReg]);
    return id;
  };

  const updatePendingRegistrationStatus = (id: string, status: 'PENDING_PAYMENT' | 'FAILED' | 'PAID') => {
    setPendingRegistrations(prev => prev.map(r => r.registrationId === id ? { ...r, paymentStatus: status } : r));
  };

  const approveRegistrationRequest = (id: string) => {
    setPendingRegistrations(prev => prev.map(req => req.registrationId === id ? { ...req, requestStatus: 'Approved' } : req));
    addSaAuditLog('REQUEST_APPROVED', `Registration request ${id} approved.`);
  };

  const rejectRegistrationRequest = (id: string, reason: string) => {
    setPendingRegistrations(prev => prev.map(req => req.registrationId === id ? { ...req, requestStatus: 'Rejected', rejectionReason: reason } : req));
    addSaAuditLog('REQUEST_REJECTED', `Registration request ${id} rejected. Reason: ${reason}`);
  };

  const completeRegistrationPayment = (id: string) => {
    let request: any = null;
    setPendingRegistrations(prev => {
      const idx = prev.findIndex(r => r.registrationId === id);
      if (idx > -1) request = prev[idx];
      return prev.map(req => req.registrationId === id ? { ...req, requestStatus: 'Business Created', paymentStatus: 'PAID' } : req);
    });
    
    setTimeout(() => {
        if (!request) return;
        const today = new Date();
        let renewalDate = new Date();
        if (request.subscriptionType === 'Monthly') {
          renewalDate.setMonth(renewalDate.getMonth() + request.duration);
        } else {
          renewalDate.setFullYear(renewalDate.getFullYear() + request.duration);
        }

        addWorkshop({
          name: request.businessName,
          tenantDomain: request.tenantDomain,
          ownerName: request.ownerName,
          email: request.email,
          phone: request.mobile,
          planId: request.selectedPlan,
          status: 'Active',
          trialDays: 0,
          renewalDate: renewalDate.toISOString()
        });

        addSaAuditLog('REQUEST_PAID', `Registration request ${id} completed. Business created.`);
    }, 100);
  };

  const deletePendingRegistration = (id: string) => {
    setPendingRegistrations(prev => prev.filter(r => r.registrationId !== id));
  };

  const verifyWorkshop = (id: string) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { 
      ...w, 
      verified: true, 
      verifiedAt: new Date().toISOString(),
      verifiedBy: currentSaUserId || 'Super Admin',
      verificationStatus: 'VERIFIED'
    } : w));
    addSaAuditLog('BUSINESS_VERIFIED', `Business ID ${id} was verified`);
  };

  const removeWorkshopVerification = (id: string) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { 
      ...w, 
      verified: false, 
      verifiedAt: undefined,
      verifiedBy: undefined,
      verificationStatus: 'PENDING'
    } : w));
    addSaAuditLog('VERIFICATION_REMOVED', `Verification removed for Business ID ${id}`);
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops(prev => prev.filter(w => w.id !== id));
    addSaAuditLog('Business Deleted / Suspended', `ID ${id} removed`);
  };

  const updatePermissionRules = (rules: PermissionRule[]) => {
    setPermissionRules(rules);
    addSaAuditLog('Permissions Matrix Saved', 'SaaS role matrix updated');
  };

  const addCustomRole = (roleName: string) => {
    const exists = permissionRules.some(r => r.role.toLowerCase() === roleName.toLowerCase());
    if (exists) return;

    const newRule: PermissionRule = {
      role: roleName,
      billing: { read: true, create: false, edit: false, delete: false, export: false, approve: false },
      inventory: { read: true, create: false, edit: false, delete: false, export: false, approve: false },
      reports: { read: false, create: false, edit: false, delete: false, export: false, approve: false },
      invoices: { read: true, create: false, edit: false, delete: false, export: false, approve: false },
      dashboard: { read: true, create: false, edit: false, delete: false, export: false, approve: false }
    };
    setPermissionRules(prev => [...prev, newRule]);
    addSaAuditLog('Custom Role Created', `Role: ${roleName}`);
  };

  const deleteCustomRole = (roleName: string) => {
    setPermissionRules(prev => prev.filter(r => r.role !== roleName));
    addSaAuditLog('Custom Role Deleted', `Role: ${roleName}`);
  };

  const addSaAnnouncement = (announcement: Omit<SaAnnouncement, 'id' | 'date'>) => {
    setSaAnnouncements(prev => [{
      ...announcement,
      id: `sa-ann-${Date.now()}`,
      date: new Date().toISOString(),
      acknowledgements: []
    }, ...prev]);
  };

  const acknowledgeAnnouncement = (announcementId: string, tenantDomain: string, userId?: string) => {
    setSaAnnouncements(prev => prev.map(ann => {
      if (ann.id === announcementId) {
        const acks = ann.acknowledgements || [];
        // Prevent duplicate acks
        if (!acks.find(a => a.tenantDomain === tenantDomain && a.userId === userId)) {
          return {
            ...ann,
            acknowledgements: [...acks, { tenantDomain, userId, date: new Date().toISOString() }]
          };
        }
      }
      return ann;
    }));
  };

  // --- AUTOMATED EXPIRY WATCHDOG (Cron Simulation) ---
  useEffect(() => {
    if (!businesses || businesses.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    businesses.forEach(business => {
      if (!business.renewalDate || business.status === 'Expired') return;

      const renewalD = new Date(business.renewalDate);
      renewalD.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((renewalD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const triggerDays = [7, 3, 1];
      if (triggerDays.includes(daysLeft)) {
        // Check if an announcement already exists for this exact day trigger for this tenant
        const titleMatch = `[SYSTEM] Subscription Expires in ${daysLeft} Days!`;
        const existing = saAnnouncements.find(a => a.target === business.tenantDomain && a.title === titleMatch);
        
        if (!existing) {
          addSaAnnouncement({
            title: titleMatch,
            message: `Dear ${business.ownerName},\n\nYour Zenwar subscription for ${business.name} will expire in ${daysLeft} days.\nPlease renew your subscription to avoid service interruption and data access restrictions.\n\nThank you,\nZenwar Billing Team`,
            target: business.tenantDomain,
            type: 'alert',
            actionText: 'Renew Now',
            actionUrl: 'renewal-flow'
          });
          addSaAuditLog('System Announcement', `Created ${daysLeft}-day expiry notice for ${business.tenantDomain}`);
        }
      }
    });
  }, [businesses, saAnnouncements]);

  const deleteSaAnnouncement = (id: string) => {
    setSaAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  function addSaAuditLog(action: string, target: string) {
    const newLog: SaAuditLog = {
      id: `log-${Date.now()}`,
      action,
      adminUser: currentUser?.name || 'SuperAdmin',
      target,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      device: 'Chrome / Windows 11'
    };
    setSaAuditLogs(prev => [newLog, ...prev]);
  }

  const createSaBackup = (name: string) => {
    const newBackup: SaBackup = {
      id: `bak-${Date.now()}`,
      name: name.endsWith('.sql') ? name : `${name}.sql`,
      dateCreated: new Date().toISOString(),
      sizeKb: Math.floor(1000 + Math.random() * 2000),
      version: 'v2.4.0'
    };
    setSaBackups(prev => [newBackup, ...prev]);
    addSaAuditLog('Database Backup Created', newBackup.name);
  };

  const restoreSaBackup = (id: string) => {
    const bak = saBackups.find(b => b.id === id);
    if (bak) {
      addSaAuditLog('Database Restored', bak.name);
    }
  };

  const deleteSaBackup = (id: string) => {
    setSaBackups(prev => prev.filter(b => b.id !== id));
  };

  const resetWorkshopAdminPassword = (id: string, newPass: string) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { ...w, password: newPass } : w));
    addSaAuditLog('Password Reset', `Business ID ${id} admin password reset`);
  };

  const toggleLoginAccess = (id: string) => {
    setWorkshops(prev => prev.map(w => {
      if (w.id === id) {
        const nextState = !w.loginAccessDisabled;
        addSaAuditLog(nextState ? 'Access Disabled' : 'Access Enabled', `Business ID ${id} access toggled`);
        return { ...w, loginAccessDisabled: nextState };
      }
      return w;
    }));
  };

  const forceLogoutSessions = (id: string) => {
    setWorkshops(prev => prev.map(w => {
      if (w.id === id) {
        addSaAuditLog('Sessions Terminated', `Business ID ${id} forced logout`);
        return { ...w, deviceActivity: [] };
      }
      return w;
    }));
  };

  const changeSubscriptionPlan = (id: string, planId: string) => {
    setWorkshops(prev => prev.map(w => {
      if (w.id === id) {
        const plan = subscriptionPlans.find(p => p.id === planId) || {
          maxStorageMb: planId === 'starter' ? 100 : planId === 'growth' ? 1024 : 10240,
          maxInvoices: planId === 'starter' ? 500 : planId === 'growth' ? 2000 : 10000
        };
        addSaAuditLog('Subscription Changed', `Business ID ${id} plan set to ${planId}`);
        return { 
          ...w, 
          planId,
          usage: {
            ...w.usage,
            storageLimit: plan.maxStorageMb,
            invoicesLimit: plan.maxInvoices
          }
        };
      }
      return w;
    }));
  };

  const deleteWorkshopPermanently = (id: string) => {
    setWorkshops(prev => prev.filter(w => w.id !== id));
    
    // Purge associated tenant tables
    setCustomers(prev => prev.filter(c => c.businessId !== id));
    setInventory(prev => prev.filter(i => i.businessId !== id));
    setJobCards(prev => prev.filter(j => j.businessId !== id));
    setAppointments(prev => prev.filter(a => a.businessId !== id));
    setInvoices(prev => prev.filter(inv => inv.businessId !== id));
    setExpenses(prev => prev.filter(e => e.businessId !== id));
    setMechanics(prev => prev.filter(m => m.businessId !== id));
    
    addSaAuditLog('Business Purged', `Business ID ${id} permanently deleted`);
  };

  const impersonateTenant = (tenantDomain: string, businessId: string) => {
    const matchedShop = businesses.find(w => w.id === businessId);
    if (matchedShop) {
      setCurrentUser({
        name: matchedShop.ownerName + ' (Impersonated)',
        role: 'admin',
        businessId: matchedShop.id,
        tenantDomain: matchedShop.tenantDomain
      });
      setSettings({
        shopName: matchedShop.name,
        tagline: 'Smart Business & Billing Management',
        logoUrl: matchedShop.logoUrl || '⚡',
        gstNumber: matchedShop.gstNumber || '27AAACG1234F1Z5',
        phone: matchedShop.phone,
        address: 'Auto Grid Road',
        currency: 'INR',
        defaultGstRate: 18,
        email: 'contact@zenwar.co'
      });
      addSaAuditLog('Super Admin Impersonation', `Switched to Tenant Domain ${tenantDomain}`);
    }
  };

  const resetWorkshopData = (tenantDomain: string) => {
    const domainUpper = tenantDomain.toUpperCase();
    setCustomers(prev => prev.filter(c => c.tenantDomain?.toUpperCase() !== domainUpper));
    setInventory(prev => prev.filter(i => i.tenantDomain?.toUpperCase() !== domainUpper));
    setJobCards(prev => prev.filter(j => j.tenantDomain?.toUpperCase() !== domainUpper));
    setAppointments(prev => prev.filter(a => a.tenantDomain?.toUpperCase() !== domainUpper));
    setInvoices(prev => prev.filter(inv => inv.tenantDomain?.toUpperCase() !== domainUpper));
    setExpenses(prev => prev.filter(e => e.tenantDomain?.toUpperCase() !== domainUpper));
    setMechanics(prev => prev.filter(m => m.tenantDomain?.toUpperCase() !== domainUpper));
    addSaAuditLog('Business Data Reset', `Tenant Domain ${tenantDomain} records cleared`);
  };

  const toggleWorkshopStatus = (id: string) => {
    setWorkshops(prev => prev.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === 'Suspended' ? 'Active' : 'Suspended';
        addSaAuditLog(nextStatus === 'Suspended' ? 'Business Suspended' : 'Business Activated', `Business ID ${id} status toggled`);
        return { ...w, status: nextStatus };
      }
      return w;
    }));
  };

  // SaaS Payment Helper Methods
  const updateSaPaymentSettings = (updated: Partial<SaPaymentSettings>) => {
    setSaPaymentSettings(prev => ({ ...prev, ...updated }));
  };

  const addSaPayment = (payment: Omit<SaPayment, 'id' | 'date'>) => {
    const plan = subscriptionPlans.find(p => p.id === payment.planId);
    const taxRate = plan?.taxPercentage || saPaymentSettings.taxRatePercent || 18;
    const computedTax = payment.taxAmount !== undefined 
      ? payment.taxAmount 
      : Math.round(payment.amount - (payment.amount / (1 + taxRate / 100)));

    const isRenewal = saPayments.some(p => p.tenantDomain === payment.tenantDomain && p.status === 'Paid');

    const newPayment: SaPayment = {
      ...payment,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      taxAmount: computedTax,
      paymentType: payment.paymentType || (isRenewal ? 'renewal' : 'onboarding')
    };
    setSaPayments(prev => [newPayment, ...prev]);
  };

  const refundSaPayment = (id: string) => {
    setSaPayments(prev => prev.map(tx => {
      if (tx.id === id) {
        const updatedTx = { ...tx, status: 'Refunded' as const };
        setWorkshops(prevW => prevW.map(w => w.tenantDomain === tx.tenantDomain ? { ...w, status: 'Suspended' as const } : w));
        addSaAuditLog('SaaS Payment Refunded', `Transaction: ${id}, Tenant: ${tx.tenantDomain}`);
        return updatedTx;
      }
      return tx;
    }));
  };

  const resetDemoWorkshopData = (domain: string) => {
    const domainUpper = domain.toUpperCase();
    if (domainUpper === 'DEMO001') {
      setMechanics(prev => [
        ...prev.filter(m => m.tenantDomain !== 'DEMO001'),
        ...demoSeedMechanics
      ]);
      setInventory(prev => [
        ...prev.filter(i => i.tenantDomain !== 'DEMO001'),
        ...demoSeedInventory
      ]);
      setCustomers(prev => [
        ...prev.filter(c => c.tenantDomain !== 'DEMO001'),
        ...demoSeedCustomers
      ]);
      setJobCards(prev => [
        ...prev.filter(jc => jc.tenantDomain !== 'DEMO001'),
        ...demoSeedJobCards
      ]);
      setInvoices(prev => [
        ...prev.filter(inv => inv.tenantDomain !== 'DEMO001'),
        ...demoSeedInvoices
      ]);

      setWorkshops(prev => {
        const exists = prev.some(w => w.tenantDomain === 'DEMO001');
        if (exists) {
          return prev.map(w => w.tenantDomain === 'DEMO001' ? { ...w, ...demoWorkshopProfile } : w);
        }
        return [...prev, demoWorkshopProfile as any];
      });

      localStorage.setItem('zenwar_demo_last_reset', Date.now().toString());
      addSaAuditLog('Demo Data Reset', 'Sandbox business DEMO001 auto reset complete');
    }
  };

  const restoreSession = (session: any) => {
    setCurrentUser(session);
    
    // Synchronize settings if it is a business admin/staff
    const domainUpper = (session.tenantDomain || '').trim().toUpperCase();
    if (domainUpper !== 'SYSTEM' && domainUpper !== 'DEMO001') {
      const matchedShop = businesses.find(w => (w.tenantDomain || '').toUpperCase() === domainUpper);
      if (matchedShop) {
        setSettings({
          shopName: matchedShop.name,
          tagline: 'Smart Business & Billing Management',
          logoUrl: matchedShop.logoUrl || '⚡',
          gstNumber: matchedShop.gstNumber || '27AAACG1234F1Z5',
          phone: matchedShop.phone,
          address: 'Auto Grid Road',
          currency: 'INR',
          defaultGstRate: 18,
          email: 'contact@zenwar.co'
        });
      }
    } else if (domainUpper === 'DEMO001') {
      setSettings({
        shopName: 'Zenwar Demo',
        tagline: 'Premium Auto Care & Detailing Sandbox',
        logoUrl: '⚡',
        gstNumber: '27AAAAA1111A1Z1',
        phone: '+91 99999 88888',
        address: 'Demo Industrial Hub, Suite 101, IN',
        currency: 'INR',
        defaultGstRate: 18,
        email: 'demo@zenwar.co'
      });
    }
  };

  // Subscription Plan CRUD
  const addSubscriptionPlan = (plan: Omit<SubscriptionPlan, 'archived'>) => {
    const newPlan: SubscriptionPlan = {
      ...plan,
      archived: false,
      enabled: plan.enabled !== undefined ? plan.enabled : true
    };
    setSubscriptionPlans(prev => [...prev, newPlan]);
    addSaAuditLog('Subscription Plan Created', `Plan: ${plan.name}`);
  };

  const updateSubscriptionPlan = (id: string, updated: Partial<SubscriptionPlan>) => {
    setSubscriptionPlans(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    addSaAuditLog('Subscription Plan Updated', `Plan ID: ${id}`);
  };

  const deleteSubscriptionPlan = (id: string) => {
    setSubscriptionPlans(prev => prev.filter(p => p.id !== id));
    addSaAuditLog('Subscription Plan Deleted', `Plan ID: ${id}`);
  };

  const duplicateSubscriptionPlan = (id: string) => {
    const existing = subscriptionPlans.find(p => p.id === id);
    if (!existing) return;
    const duplicated: SubscriptionPlan = {
      ...existing,
      id: `${existing.id}-copy-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      enabled: false
    };
    setSubscriptionPlans(prev => [...prev, duplicated]);
    addSaAuditLog('Subscription Plan Duplicated', `Original ID: ${id}`);
  };

  // Landing Page CMS

  const saveDraft = (newState: Partial<WebsiteState>) => {
    setDraftWebsiteState(prev => {
      const updated = { ...prev, ...newState };
      dbSet(STORES.CMS, { id: 'draft', state: updated }).catch(console.error);
      return updated;
    });
  };

  const discardDraft = () => {
    setDraftWebsiteState(liveWebsiteState);
  };

  const publishDraft = (versionNotes: string = "Published via Website Builder") => {
    const newVersion: WebsiteVersion = {
      id: `v-${Date.now()}`,
      versionName: `Version ${websiteVersions.length + 1}`,
      publishedAt: new Date().toISOString(),
      publishedBy: currentUser?.name || 'System Admin',
      notes: versionNotes,
      state: draftWebsiteState
    };
    
    setWebsiteVersions(prev => [newVersion, ...prev]);
    setLiveWebsiteState(draftWebsiteState);
    
    // Async save to IndexedDB
    dbSet(STORES.CMS, { id: 'live', state: draftWebsiteState }).catch(console.error);
    dbSet(STORES.VERSIONS, newVersion).catch(console.error);
    
    addSaAuditLog('Website Configuration Published', versionNotes);
  };

  const rollbackToVersion = (versionId: string) => {
    const version = websiteVersions.find(v => v.id === versionId);
    if (version) {
      setLiveWebsiteState(version.state);
      setDraftWebsiteState(version.state);
      
      dbSet(STORES.CMS, { id: 'draft', state: version.state }).catch(console.error);
      dbSet(STORES.CMS, { id: 'live', state: version.state }).catch(console.error);
    }
  };

  const getWorkshopPaymentConfig = (domain: string): WorkshopPaymentConfig => {
    const domainUpper = (domain || '').trim().toUpperCase();
    const config = workshopPaymentConfigs[domainUpper];
    if (config) return config;

    return {
      tenantDomain: domainUpper,
      upiEnabled: false,
      upiId: '',
      razorpayEnabled: false,
      razorpayKeyId: '',
      razorpaySecret: '',
      razorpayTestMode: true,
      bankName: '',
      bankAccount: '',
      bankIfsc: '',
      defaultMethod: 'Cash',
      termsAndConditions: 'Respective manufacturer warranty terms apply. Services finalized are non-refundable.'
    };
  };

  const updateWorkshopPaymentConfig = (domain: string, updated: Partial<WorkshopPaymentConfig>) => {
    const domainUpper = (domain || '').trim().toUpperCase();
    setWorkshopPaymentConfigs(prev => {
      const current = prev[domainUpper] || getWorkshopPaymentConfig(domainUpper);
      return {
        ...prev,
        [domainUpper]: {
          ...current,
          ...updated,
          tenantDomain: domainUpper
        }
      };
    });
  };

  const addPaymentAuditLog = (log: Omit<PaymentAuditLog, 'id' | 'timestamp'>) => {
    const newLog: PaymentAuditLog = {
      ...log,
      id: `pay-log-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setPaymentAuditLogs(prev => [newLog, ...prev]);
  };

  // Dynamic Tenant Data Partitioning
  const activeTenantDomain = currentUser?.tenantDomain || 'APEXAUTO';

  const filteredMechanics = useMemo(() => {
    if (currentUser?.role === 'superadmin') return mechanics;
    return mechanics.filter(m => m.tenantDomain === activeTenantDomain);
  }, [mechanics, currentUser, activeTenantDomain]);

  const filteredInventory = useMemo(() => {
    if (currentUser?.role === 'superadmin') return inventory;
    return inventory.filter(i => i.tenantDomain === activeTenantDomain);
  }, [inventory, currentUser, activeTenantDomain]);

  const filteredCustomers = useMemo(() => {
    if (currentUser?.role === 'superadmin') return customers;
    return customers.filter(c => c.tenantDomain === activeTenantDomain);
  }, [customers, currentUser, activeTenantDomain]);

  const filteredJobCards = useMemo(() => {
    if (currentUser?.role === 'superadmin') return jobCards;
    return jobCards.filter(j => j.tenantDomain === activeTenantDomain);
  }, [jobCards, currentUser, activeTenantDomain]);

  const filteredAppointments = useMemo(() => {
    if (currentUser?.role === 'superadmin') return appointments;
    return appointments.filter(a => a.tenantDomain === activeTenantDomain);
  }, [appointments, currentUser, activeTenantDomain]);

  const filteredInvoices = useMemo(() => {
    if (currentUser?.role === 'superadmin') return invoices;
    return invoices.filter(i => i.tenantDomain === activeTenantDomain);
  }, [invoices, currentUser, activeTenantDomain]);

  const filteredExpenses = useMemo(() => {
    if (currentUser?.role === 'superadmin') return expenses;
    return expenses.filter(e => e.tenantDomain === activeTenantDomain);
  }, [expenses, currentUser, activeTenantDomain]);

  

  if (!isDbLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-mono text-sm animate-pulse">Initializing Enterprise Database...</p>
        </div>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={{
      liveWebsiteState,
      draftWebsiteState,
      websiteVersions,
      mediaLibrary,
        setMediaLibrary,
      saveDraft,
      discardDraft,
      publishDraft,
      rollbackToVersion,
      mechanics: filteredMechanics,
      inventory: filteredInventory,
      customers: filteredCustomers,
      jobCards: filteredJobCards,
      appointments: filteredAppointments,
      invoices: filteredInvoices,
      expenses: filteredExpenses,
      settings,
      notifications,
      currentUser,
      businesses,
      permissionRules,
      subscriptionPlans,
      saAnnouncements,
      saAuditLogs,
      saBackups,
      saCredentials,
      updateSaCredentials,
      logoutAllSaDevices,
      login,
      logout,
      addMechanic,
      updateMechanic,
      inventoryHistory,
      addInventoryHistory,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      useInventoryItems,
      bulkAddInventoryItems,
      bulkUpdateInventoryItems,
      bulkUpdateInventoryStock,
      addCustomer,
      updateCustomer,
      addVehicleToCustomer,
      addJobCard,
      updateJobCard,
      addAppointment,
      updateAppointment,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addExpense,
      deleteExpense,
      updateSettings,
    landingPageSettings,
    updateLandingPageSettings,
      addNotification,
      markNotificationAsRead,
      clearAllNotifications,
      addWorkshop,
      pendingRegistrations,
      inquiries,
      submitInquiry,
      markInquiryRead,
      markInquiryUnread,
      updateInquiryStatus,
      deleteInquiry,
      addPendingRegistration,
      updatePendingRegistrationStatus,
      approveRegistrationRequest,
      rejectRegistrationRequest,
      completeRegistrationPayment,
      deletePendingRegistration,
      verifyWorkshop,
      removeWorkshopVerification,
      updateWorkshop,
      deleteWorkshop,
      updatePermissionRules,
      addCustomRole,
      deleteCustomRole,
      addSaAnnouncement,
      acknowledgeAnnouncement,
      deleteSaAnnouncement,
      addSaAuditLog,
      createSaBackup,
      restoreSaBackup,
      deleteSaBackup,
      resetWorkshopAdminPassword,
      toggleLoginAccess,
      forceLogoutSessions,
      changeSubscriptionPlan,
      deleteWorkshopPermanently,
      resetWorkshopData,
      toggleWorkshopStatus,
      impersonateTenant,
      addSubscriptionPlan,
      updateSubscriptionPlan,
      deleteSubscriptionPlan,
      duplicateSubscriptionPlan,
      saPaymentSettings,
      saPayments,
      updateSaPaymentSettings,
      addSaPayment,
      refundSaPayment,
      resetDemoWorkshopData,
      restoreSession,
      workshopPaymentConfigs,
      paymentAuditLogs,
      getWorkshopPaymentConfig,
      updateWorkshopPaymentConfig,
      addPaymentAuditLog,
      superAdminUsers,
      currentSaUserId,
      setCurrentSaUserId,
      addSuperAdminUser,
      updateSuperAdminUser,
      deleteSuperAdminUser,
      getCurrentSaUser,
      getEffectiveModuleAccess,
      transferOwnership,
      updateWorkshopModuleOverrides,
      canSaUserAccess,
      updateCurrentUserProfile,
      addMediaAsset,
      removeMediaAsset,
      deleteMediaAsset,
      updateMediaAsset
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
