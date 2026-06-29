import React from 'react';

interface SharedHeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

export const SharedHero: React.FC<SharedHeroProps> = ({ title, subtitle, backgroundImage, children }) => {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden min-h-[400px] flex items-center justify-center text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 z-10" />
      {backgroundImage && (
        <img 
          src={backgroundImage} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}
      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
          {subtitle}
        </p>
        {children && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
