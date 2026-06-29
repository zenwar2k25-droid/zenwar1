import React, { createContext, useContext, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import type { BusinessModuleAccess } from '../data/seedData';

export type WorkshopModule =
  | 'dashboard'
  | 'billing'
  | 'invoices'
  | 'jobCards'
  | 'customers'
  | 'inventory'
  | 'staffs'
  | 'appointments'
  | 'reports'
  | 'settings'
  | 'whatsapp'
  | 'multiBranch'
  | 'advancedAnalytics'
  | 'apiAccess'
  | 'paymentIntegration';

export type LockReason = 'plan' | 'sa_override' | 'suspended' | 'role' | null;

export interface ModuleAccessResult {
  canAccess: boolean;
  isLocked: boolean;
  lockReason: LockReason;
  lockMessage: string;
  upgradeRequired: boolean;
}

interface PermissionContextType {
  /** Check if a business module is accessible for current user's tenant */
  checkModule: (module: WorkshopModule) => ModuleAccessResult;
  /** Full access map for current tenant */
  moduleAccess: BusinessModuleAccess;
  /** Is current user a super admin */
  isSuperAdmin: boolean;
  /** Current plan name */
  currentPlanName: string;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, businesses, subscriptionPlans, getEffectiveModuleAccess } = useDatabase();

  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Get business for current tenant
  const currentWorkshop = useMemo(() => {
    if (!currentUser?.tenantDomain || isSuperAdmin) return null;
    return businesses.find(w =>
      (w.tenantDomain || '').toUpperCase() === (currentUser.tenantDomain || '').toUpperCase()
    ) || null;
  }, [currentUser, businesses, isSuperAdmin]);

  // Current subscription plan
  const currentPlan = useMemo(() => {
    if (!currentWorkshop) return null;
    return subscriptionPlans.find(p => p.id === currentWorkshop.planId) || null;
  }, [currentWorkshop, subscriptionPlans]);

  const currentPlanName = currentPlan?.name || 'Starter Ride';

  // Full effective module access map
  const moduleAccess: BusinessModuleAccess = useMemo(() => {
    if (isSuperAdmin) {
      // Super admins always have full business-panel access when viewing
      return {
        dashboard: true, billing: true, invoices: true, jobCards: true,
        customers: true, inventory: true, staffs: true, appointments: true,
        reports: true, settings: true, whatsapp: true, multiBranch: true,
        advancedAnalytics: true, apiAccess: true, paymentIntegration: true
      };
    }
    if (!currentUser?.tenantDomain) {
      return {
        dashboard: true, billing: true, invoices: true, jobCards: true,
        customers: true, inventory: true, staffs: true, appointments: true,
        reports: true, settings: true, whatsapp: true, multiBranch: true,
        advancedAnalytics: true, apiAccess: true, paymentIntegration: true
      };
    }
    return getEffectiveModuleAccess(currentUser.tenantDomain);
  }, [currentUser, isSuperAdmin, getEffectiveModuleAccess]);

  const checkModule = (module: WorkshopModule): ModuleAccessResult => {
    // Super admins always get access inside business panel
    if (isSuperAdmin) {
      return { canAccess: true, isLocked: false, lockReason: null, lockMessage: '', upgradeRequired: false };
    }

    // Business suspended
    if (currentWorkshop?.status === 'Suspended') {
      return {
        canAccess: false,
        isLocked: true,
        lockReason: 'suspended',
        lockMessage: 'This business is suspended. Contact your Super Admin.',
        upgradeRequired: false
      };
    }

    const hasAccess = moduleAccess[module] === true;

    if (hasAccess) {
      return { canAccess: true, isLocked: false, lockReason: null, lockMessage: '', upgradeRequired: false };
    }

    // Determine lock reason
    const planHasIt = currentPlan?.moduleAccess?.[module] === true;
    const overrideBlocked = currentWorkshop?.moduleOverrides?.[module] === false;

    if (overrideBlocked) {
      return {
        canAccess: false,
        isLocked: true,
        lockReason: 'sa_override',
        lockMessage: 'Access to this module has been restricted by your Super Admin.',
        upgradeRequired: false
      };
    }

    if (!planHasIt) {
      return {
        canAccess: false,
        isLocked: true,
        lockReason: 'plan',
        lockMessage: `This feature requires a higher subscription plan. Upgrade from ${currentPlanName} to unlock.`,
        upgradeRequired: true
      };
    }

    return {
      canAccess: false,
      isLocked: true,
      lockReason: 'plan',
      lockMessage: 'This module is not available on your current plan.',
      upgradeRequired: true
    };
  };

  return (
    <PermissionContext.Provider value={{ checkModule, moduleAccess, isSuperAdmin, currentPlanName }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    // Return a safe default so components don't crash if provider isn't mounted
    return {
      checkModule: (_: WorkshopModule): ModuleAccessResult => ({
        canAccess: true, isLocked: false, lockReason: null as LockReason,
        lockMessage: '', upgradeRequired: false
      }),
      moduleAccess: {
        dashboard: true, billing: true, invoices: true, jobCards: true,
        customers: true, inventory: true, staffs: true, appointments: true,
        reports: true, settings: true, whatsapp: true, multiBranch: true,
        advancedAnalytics: true, apiAccess: true, paymentIntegration: true
      } as BusinessModuleAccess,
      isSuperAdmin: false,
      currentPlanName: 'Starter Ride'
    };
  }
  return context;
};
