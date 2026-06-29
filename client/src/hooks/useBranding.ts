import { useDatabase } from '../context/DatabaseContext';
import type { BrandingConfig } from '../data/seedData';

const ZENWAR_LOGO = '/logo.png';

const defaultBranding: BrandingConfig = {
  logoUrl: ZENWAR_LOGO,
  lightLogoUrl: ZENWAR_LOGO,
  darkLogoUrl: ZENWAR_LOGO,
  faviconUrl: ZENWAR_LOGO,
  appIconUrl: ZENWAR_LOGO,
  emailLogoUrl: ZENWAR_LOGO,
};

export const useBranding = () => {
  const { liveWebsiteState } = useDatabase();
  const branding = liveWebsiteState?.branding || defaultBranding;

  return {
    logoUrl: branding.logoUrl || ZENWAR_LOGO,
    lightLogoUrl: branding.lightLogoUrl || ZENWAR_LOGO,
    darkLogoUrl: branding.darkLogoUrl || ZENWAR_LOGO,
    faviconUrl: branding.faviconUrl || ZENWAR_LOGO,
    appIconUrl: branding.appIconUrl || ZENWAR_LOGO,
    emailLogoUrl: branding.emailLogoUrl || ZENWAR_LOGO,
  };
};

export const useDraftBranding = () => {
  const { draftWebsiteState } = useDatabase();
  const branding = draftWebsiteState?.branding || defaultBranding;
  return {
    logoUrl: branding.logoUrl || ZENWAR_LOGO,
    lightLogoUrl: branding.lightLogoUrl || ZENWAR_LOGO,
    darkLogoUrl: branding.darkLogoUrl || ZENWAR_LOGO,
    faviconUrl: branding.faviconUrl || ZENWAR_LOGO,
    appIconUrl: branding.appIconUrl || ZENWAR_LOGO,
    emailLogoUrl: branding.emailLogoUrl || ZENWAR_LOGO,
  };
};
