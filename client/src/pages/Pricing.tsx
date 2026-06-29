import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { SharedLayout } from '../components/landing/SharedLayout';
import { SharedHero } from '../components/landing/SharedHero';
import { PricingSection } from '../components/landing/sections/PricingSection';
import { demoPricingPageConfig } from '../data/seedData';

export const Pricing: React.FC = () => {
  const { liveWebsiteState } = useDatabase();

  const pricingPage = liveWebsiteState?.pricingPage || demoPricingPageConfig;
  const pricing = liveWebsiteState?.pricing || [];

  return (
    <SharedLayout>
      <SharedHero 
        title={pricingPage.title}
        subtitle={pricingPage.subtitle}
        backgroundImage={pricingPage.backgroundImage}
      />
      <PricingSection pricing={pricing} />
    </SharedLayout>
  );
};
