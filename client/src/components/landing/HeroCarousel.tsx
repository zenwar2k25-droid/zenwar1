import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Flame } from 'lucide-react';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta1: string;
  cta2: string;
}

interface HeroCarouselProps {
  banners: Banner[];
  badge: string;
  onCta1Click: () => void;
  onCta2Click: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  badge,
  onCta1Click,
  onCta2Click
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-36 flex flex-col items-center text-center overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[var(--color-primary)]/10 filter blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-[var(--color-secondary)]/10 filter blur-[80px] pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 1.05 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl relative z-10 w-full"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-border-card text-xs font-semibold text-[var(--color-primary)] tracking-wide">
            <Flame size={12} className="animate-pulse" />
            {badge}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-text-primary font-display min-h-[140px] md:min-h-[160px] flex items-center justify-center">
            <span>
              {currentBanner.title.split('. ').map((part, i) => (
                <React.Fragment key={i}>
                  {i === 1 ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">{part}</span> : part}
                  {i < currentBanner.title.split('. ').length - 1 && '. '}
                </React.Fragment>
              ))}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-light min-h-[60px]">
            {currentBanner.subtitle}
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onCta1Click}
              className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-115 text-text-primary font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer border-none"
            >
              {currentBanner.cta1} <ArrowRight size={20} />
            </button>
            <button
              onClick={onCta2Click}
              className="w-full sm:w-auto bg-white/5 hover:bg-hover-bg border border-border-card text-text-primary font-semibold px-8 py-4 rounded-xl transition-all cursor-pointer"
            >
              {currentBanner.cta2}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 md:mt-24 w-full max-w-5xl rounded-2xl border border-border-card bg-bg-card/60 p-2.5 backdrop-blur-xl relative shadow-2xl shadow-cyan-900/10 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
        <div className="rounded-xl overflow-hidden border border-border-card relative bg-[#090a10] h-[300px] md:h-[500px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={currentBanner.image}
              alt="Banner Showcase"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 z-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-[var(--color-primary)] w-8' : 'bg-white/20 hover:bg-white/40'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
