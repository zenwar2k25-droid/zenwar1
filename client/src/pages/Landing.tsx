import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { SharedLayout } from '../components/landing/SharedLayout';
import { FeaturesSection } from '../components/landing/sections/FeaturesSection';
import { PricingSection } from '../components/landing/sections/PricingSection';
import { AboutSection } from '../components/landing/sections/AboutSection';
import { ContactSection } from '../components/landing/sections/ContactSection';
import { FAQSection } from '../components/landing/sections/FAQSection';
import { TestimonialsSection } from '../components/landing/sections/TestimonialsSection';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import {
  demoFeaturesPageConfig,
  demoPricingPageConfig,
  demoAboutPageConfig,
  demoContactPageConfig,
  demoBranches
} from '../data/seedData';
import type { HeroBanner } from '../data/seedData';

export const Landing: React.FC = () => {
  const { liveWebsiteState } = useDatabase();
  const navigate = useNavigate();

  const data = liveWebsiteState || {
    heroContent: {
      badgeText: 'Mechanic Billing Software v2.0',
      mainHeading: 'Manage Your Auto Repair Shop with Precision',
      description: 'The complete solution for mechanics to manage invoicing, inventory, customer relationships, and staff tracking in one powerful platform.',
      primaryButtonText: 'Start Free Trial',
      primaryButtonAction: 'Open Register',
      secondaryButtonText: 'Watch Demo',
      secondaryButtonAction: 'Open Demo',
      alignment: 'center'
    },
    heroBanners: [] as HeroBanner[],
    features: [],
    pricing: [],
    aboutPage: demoAboutPageConfig,
    contactPage: demoContactPageConfig,
    contactTeam: [],
    testimonials: [],
    faqs: []
  };

  const branches = demoBranches;;

  const onRegister = () => navigate('/register');

  return (
    <SharedLayout>
      {/* Hero Content Section */}
      <section className={`pt-32 pb-24 px-6 max-w-7xl mx-auto relative ${data.heroContent.alignment === 'center' ? 'text-center' : data.heroContent.alignment === 'right' ? 'text-right' : 'text-left'}`}>
        {data.heroContent.badgeText && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md ${data.heroContent.alignment === 'center' ? 'mx-auto' : data.heroContent.alignment === 'right' ? 'ml-auto' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-sm font-medium tracking-wide text-white/90">{data.heroContent.badgeText}</span>
          </div>
        )}
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight leading-tight">
          {data.heroContent.mainHeading}
        </h1>
        <p className={`text-xl text-text-secondary mb-12 max-w-3xl leading-relaxed ${data.heroContent.alignment === 'center' ? 'mx-auto' : data.heroContent.alignment === 'right' ? 'ml-auto' : ''}`}>
          {data.heroContent.description}
        </p>
        <div className={`flex flex-col sm:flex-row items-center gap-4 ${data.heroContent.alignment === 'center' ? 'justify-center' : data.heroContent.alignment === 'right' ? 'justify-end' : ''}`}>
          <button onClick={onRegister} className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2 w-full sm:w-auto justify-center group">
            {data.heroContent.primaryButtonText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
            <PlayCircle className="w-5 h-5" />
            {data.heroContent.secondaryButtonText}
          </button>
        </div>
      </section>

      {/* Hero Banner Slider Section */}
      {data.heroBanners && data.heroBanners.length > 0 && data.heroBanners.some((b: any) => b.active) && (
        <section className="px-6 max-w-[1400px] mx-auto mb-24 relative z-10">
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative aspect-[16/9] md:aspect-[21/9]">
            <img src={data.heroBanners.find((b: any) => b.active)?.imageUrl || ''} alt="Hero Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-app)] via-transparent to-transparent opacity-80" />
          </div>
        </section>
      )}

      {/* Reusable Sections */}
      <FeaturesSection features={data.features} />
      <PricingSection pricing={data.pricing} />
      <AboutSection aboutData={data.aboutPage || demoAboutPageConfig} />
      <ContactSection 
        contactData={data.contactPage || demoContactPageConfig } 
        teamData={data.contactTeam || []} 
        branchConfig={data.branchDirectory || undefined} 
      />
      <TestimonialsSection testimonials={data.testimonials} />
      <FAQSection faqs={data.faqs} />
      
    </SharedLayout>
  );
};
