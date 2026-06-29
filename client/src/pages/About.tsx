import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { SharedLayout } from '../components/landing/SharedLayout';
import { SharedHero } from '../components/landing/SharedHero';
import { AboutSection } from '../components/landing/sections/AboutSection';
import { demoAboutPageConfig } from '../data/seedData';

export const About: React.FC = () => {
  const { liveWebsiteState } = useDatabase();

  const aboutPage = liveWebsiteState?.aboutPage || demoAboutPageConfig;

  return (
    <SharedLayout>
      <SharedHero 
        title={aboutPage.aboutTitle}
        subtitle={aboutPage.companyDescription}
        backgroundImage={aboutPage.heroBanner || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c'}
      />
      <AboutSection aboutData={aboutPage} />
    </SharedLayout>
  );
};
