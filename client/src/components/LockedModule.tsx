import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, ShieldAlert, MessageCircle, Zap } from 'lucide-react';
import type { LockReason } from '../context/PermissionContext';

interface LockedModuleProps {
  lockReason: LockReason;
  lockMessage: string;
  upgradeRequired: boolean;
  moduleName?: string;
  currentPlan?: string;
}

export const LockedModule: React.FC<LockedModuleProps> = ({
  lockReason,
  lockMessage,
  upgradeRequired,
  moduleName = 'Module',
  currentPlan = 'Starter'
}) => {
  return (
    <div className="relative w-full h-full min-h-[70vh] flex items-center justify-center p-6">
      {/* Blurred background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c1a]/95 via-[#0d1025]/90 to-[#0a0c1a]/95" />
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Main lock card */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#0d1025]/80 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

          {/* Lock icon area */}
          <div className="pt-10 pb-4 flex justify-center">
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(0,240,255,0.1)',
                  '0 0 40px rgba(0,240,255,0.2)',
                  '0 0 20px rgba(0,240,255,0.1)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 flex items-center justify-center"
            >
              {lockReason === 'suspended' ? (
                <ShieldAlert size={36} className="text-red-400" />
              ) : lockReason === 'sa_override' ? (
                <ShieldAlert size={36} className="text-amber-400" />
              ) : (
                <Lock size={36} className="text-cyan-400" />
              )}
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 text-center space-y-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1">
                {lockReason === 'suspended' ? 'Business Suspended' :
                 lockReason === 'sa_override' ? 'Access Restricted' :
                 'Upgrade Required'}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-border-card text-xs text-text-secondary font-mono">
                <Lock size={10} />
                {moduleName}
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              {lockMessage}
            </p>

            {/* Current plan badge */}
            {upgradeRequired && (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-[10px] uppercase tracking-wider text-text-muted">Current Plan</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-text-secondary">
                  {currentPlan}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 space-y-2.5">
              {upgradeRequired && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-text-primary bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Crown size={16} />
                  Upgrade Plan
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-text-secondary bg-white/5 border border-border-card hover:bg-hover-bg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Contact Admin
              </motion.button>
            </div>

            {/* Feature list */}
            {upgradeRequired && (
              <div className="pt-4 border-t border-border-card">
                <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Unlocked with upgrade</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Full Reports', 'Inventory Control', 'Staff Management', 'API Access'].map(feat => (
                    <div key={feat} className="flex items-center gap-1.5 text-text-muted">
                      <Zap size={10} className="text-cyan-500/60" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cyan-500/5 rounded-full blur-[40px]" />
      </motion.div>
    </div>
  );
};

// Compact inline lock overlay for sidebar items and smaller components
export const LockedOverlay: React.FC<{
  show: boolean;
  reason?: LockReason;
  compact?: boolean;
  onUpgrade?: () => void;
  onContact?: () => void;
}> = ({ show, reason, compact, onUpgrade, onContact }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!show) return null;

  if (compact) {
    return (
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center justify-center w-5 h-5 rounded bg-white/5 border border-border-card">
          <Lock size={10} className={reason === 'sa_override' ? 'text-amber-400/70' : 'text-cyan-400/70'} />
        </div>
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute z-50 left-8 top-0 w-52 p-3 rounded-xl bg-[#0d1025] border border-border-card shadow-2xl shadow-black/60"
            >
              <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
                {reason === 'sa_override' ? 'Restricted' : reason === 'suspended' ? 'Suspended' : 'Upgrade Required'}
              </div>
              <p className="text-xs text-text-secondary mb-2">
                {reason === 'sa_override'
                  ? 'Access restricted by admin'
                  : reason === 'suspended'
                  ? 'Business suspended'
                  : 'Upgrade your plan to unlock'}
              </p>
              <div className="flex gap-1.5">
                {reason === 'plan' && (
                  <button
                    onClick={onUpgrade}
                    className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                  >
                    Upgrade
                  </button>
                )}
                <button
                  onClick={onContact}
                  className="text-[10px] px-2 py-1 rounded bg-white/5 text-text-secondary hover:bg-hover-bg transition-colors"
                >
                  Contact
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};
