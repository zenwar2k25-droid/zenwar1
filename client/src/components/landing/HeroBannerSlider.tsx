import React, { useState, useEffect, useRef } from 'react';
import type { HeroBanner, HeroSliderSettings } from '../../data/seedData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  banners: HeroBanner[];
  settings: HeroSliderSettings;
}

export const HeroBannerSlider: React.FC<Props> = ({ banners, settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const activeBanners = banners.filter(b => b.active).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeBanners.length <= 1 || !settings.autoplay) return;
    if (settings.pauseOnHover && isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (!settings.loop && prev === activeBanners.length - 1) return prev;
        return (prev + 1) % activeBanners.length;
      });
    }, settings.slideDuration || 5000);
    
    return () => clearInterval(interval);
  }, [activeBanners.length, settings, isHovered]);

  if (activeBanners.length === 0) return null;

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => {
      if (!settings.loop && prev === activeBanners.length - 1) return prev;
      return (prev + 1) % activeBanners.length;
    });
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => {
      if (!settings.loop && prev === 0) return prev;
      return prev === 0 ? activeBanners.length - 1 : prev - 1;
    });
  };

  const handleAction = (action?: string) => {
    if (!action || action === 'No Action') return;
    
    if (action === 'Open Starter Plan' || action === 'Open Pro Plan' || action === 'Open Enterprise Plan' || action === 'Open Custom Subscription Plan' || action === 'Open Pricing Section') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'Open Registration Form') {
      navigate('/register');
    } else if (action === 'Scroll to Features') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'Scroll to FAQ') {
      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'Scroll to Contact Section' || action === 'Open Contact Form') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const animationStyle = settings.animationType === 'slide' 
    ? 'transition-transform ease-in-out' 
    : 'transition-opacity ease-in-out';

  return (
    <div 
      className="relative w-full h-[312px] max-w-[820px] mx-auto overflow-hidden rounded-xl shadow-lg group bg-surface-dark/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`w-full h-full flex ${settings.animationType === 'slide' ? animationStyle : ''}`}
        style={
          settings.animationType === 'slide' 
          ? { 
              transform: `translateX(-${currentIndex * 100}%)`,
              transitionDuration: `${settings.transitionSpeed || 1000}ms`
            }
          : undefined
        }
      >
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            onClick={() => handleAction(banner.action)}
            className={`
              ${settings.animationType === 'slide' ? 'min-w-full' : 'absolute inset-0'}
              ${settings.animationType === 'fade' ? (index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none') : ''}
              ${banner.action && banner.action !== 'No Action' ? 'cursor-pointer' : ''}
            `}
            style={
              settings.animationType === 'fade' 
              ? { transitionDuration: `${settings.transitionSpeed || 1000}ms` }
              : undefined
            }
          >
            <img
              src={banner.imageUrl}
              alt={banner.name}
              loading={index === 0 && !settings.lazyLoad ? "eager" : "lazy"}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {settings.showArrows && activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary z-20 ${!settings.loop && currentIndex === 0 ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary z-20 ${!settings.loop && currentIndex === activeBanners.length - 1 ? 'hidden' : ''}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {settings.showDots && activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
