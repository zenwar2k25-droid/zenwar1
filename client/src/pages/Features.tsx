import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { SharedLayout } from '../components/landing/SharedLayout';
import { SharedHero } from '../components/landing/SharedHero';
import { FeaturesSection } from '../components/landing/sections/FeaturesSection';
import { demoFeaturesPageConfig } from '../data/seedData';

export const Features: React.FC = () => {
  const { liveWebsiteState } = useDatabase();

  const featuresPage = liveWebsiteState?.featuresPage || demoFeaturesPageConfig;
  const features = liveWebsiteState?.features || [];

  return (
    <SharedLayout>
      <SharedHero 
        title={featuresPage.title}
        subtitle={featuresPage.subtitle}
        backgroundImage={featuresPage.backgroundImage}
      />
      <FeaturesSection features={features} />
    </SharedLayout>
  );
};
