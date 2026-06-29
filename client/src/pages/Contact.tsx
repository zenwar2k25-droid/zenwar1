import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { SharedLayout } from '../components/landing/SharedLayout';
import { SharedHero } from '../components/landing/SharedHero';
import { ContactSection } from '../components/landing/sections/ContactSection';
import { demoContactPageConfig, demoBranchDirectoryConfig } from '../data/seedData';

export const Contact: React.FC = () => {
  const { liveWebsiteState } = useDatabase();

  const contactPage = liveWebsiteState?.contactPage || demoContactPageConfig;
  const contactTeam = liveWebsiteState?.contactTeam || [];
  const branchConfig = liveWebsiteState?.branchDirectory || demoBranchDirectoryConfig;

  return (
    <SharedLayout>
      <SharedHero 
        title={contactPage.companyName}
        subtitle={contactPage.officeAddress}
        backgroundImage={contactPage.backgroundBanner || 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a'}
      />
      <ContactSection contactData={contactPage} teamData={contactTeam} branchConfig={branchConfig} />
    </SharedLayout>
  );
};
