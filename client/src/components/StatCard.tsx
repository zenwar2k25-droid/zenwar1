import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  accentColor?: 'blue' | 'orange' | 'green' | 'red';
  delay?: number;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accentColor = 'blue',
  delay = 0,
  onClick
}) => {
  const accentClasses = {
    blue: {
      glow: 'shadow-[0_0_20px_rgba(0,240,255,0.06)] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] border-cyan-500/10 hover:border-[var(--color-primary)]',
      iconBg: 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] border-cyan-500/20',
      lightGlow: 'bg-[var(--color-primary)]/5',
    },
    orange: {
      glow: 'shadow-[0_0_20px_rgba(255,98,0,0.06)] hover:shadow-[0_0_20px_rgba(255,98,0,0.15)] border-orange-500/10 hover:border-[var(--color-secondary)]',
      iconBg: 'bg-[var(--color-secondary-glow)] text-[var(--color-secondary)] border-orange-500/20',
      lightGlow: 'bg-[var(--color-secondary)]/5',
    },
    green: {
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.06)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] border-emerald-500/10 hover:border-[var(--color-success)]',
      iconBg: 'bg-[var(--color-success-glow)] text-[var(--color-success)] border-emerald-500/20',
      lightGlow: 'bg-[var(--color-success)]/5',
    },
    red: {
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.06)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] border-red-500/10 hover:border-red-500',
      iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      lightGlow: 'bg-red-500/5',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      onClick={onClick}
      className={`glass-panel p-5 relative overflow-hidden transition-all duration-300 ${accentClasses[accentColor].glow} ${onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-95' : ''}`}
    >
      {/* Decorative gradient overlay */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] pointer-events-none opacity-20 ${accentColor === 'blue' ? 'bg-[var(--color-primary)]' : accentColor === 'orange' ? 'bg-[var(--color-secondary)]' : accentColor === 'red' ? 'bg-red-500' : 'bg-[var(--color-success)]'}`} />

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-[var(--text-primary)]">
            {value}
          </h3>
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${accentClasses[accentColor].iconBg}`}>
          <Icon size={22} className="shrink-0" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        {trend && (
          <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-lg ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend.isPositive ? <ArrowUpRight size={14} className="mr-0.5 shrink-0" /> : <ArrowDownRight size={14} className="mr-0.5 shrink-0" />}
            {trend.value}
          </div>
        )}
        {description && (
          <span className="text-xs text-[var(--text-secondary)] truncate">
            {description}
          </span>
        )}
      </div>
    </motion.div>
  );
};
