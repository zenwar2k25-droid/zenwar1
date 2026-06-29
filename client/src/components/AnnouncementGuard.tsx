import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Megaphone, Info, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnnouncementGuardProps {
  children: React.ReactNode;
}

export const AnnouncementGuard: React.FC<AnnouncementGuardProps> = ({ children }) => {
  const { currentUser, saAnnouncements, acknowledgeAnnouncement, businesses } = useDatabase();
  const navigate = useNavigate();

  // If not logged in or is super admin, don't guard
  if (!currentUser || currentUser.role === 'superadmin') {
    return <>{children}</>;
  }

  const tenantDomain = currentUser.tenantDomain || '';
  
  // Get business details to check plan
  const business = businesses?.find(w => w.tenantDomain === tenantDomain);
  const planId = business?.planId || 'starter';

  // Find all announcements that target this user/tenant and have NOT been acknowledged by THIS tenant
  const pendingAnnouncements = saAnnouncements?.filter(ann => {
    // Check if targeted to this tenant
    const targetsThisTenant = 
      ann.target === 'all' || 
      ann.target === planId || 
      ann.target === tenantDomain;

    if (!targetsThisTenant) return false;

    // Check if already acknowledged by this tenant
    // (We treat acknowledgement as a Tenant-wide action. Once one admin clicks it, it clears for the tenant)
    const alreadyAcked = ann.acknowledgements?.some(ack => ack.tenantDomain === tenantDomain);
    
    return !alreadyAcked;
  }) || [];

  // If no pending announcements, render the children (the actual app) normally
  if (pendingAnnouncements.length === 0) {
    return <>{children}</>;
  }

  // If there are pending announcements, show the first one in a blocking modal
  const currentAnn = pendingAnnouncements[0];

  const handleAcknowledge = () => {
    acknowledgeAnnouncement(currentAnn.id, tenantDomain, currentUser.name);
  };

  const handleActionClick = () => {
    // If it has a specific action URL like renewal, route them there
    if (currentAnn.actionUrl) {
      if (currentAnn.actionUrl === 'renewal-flow') {
        // Just mock routing to settings for now or trigger acknowledge then route
        acknowledgeAnnouncement(currentAnn.id, tenantDomain, currentUser.name);
        navigate('/settings'); // Can be dedicated billing route later
      } else {
        window.open(currentAnn.actionUrl, '_blank');
      }
    }
  };

  const getIcon = () => {
    switch (currentAnn.type) {
      case 'alert': return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'maintenance': return <Zap className="w-8 h-8 text-orange-500" />;
      default: return <Megaphone className="w-8 h-8 text-blue-500" />;
    }
  };

  const getColor = () => {
    switch (currentAnn.type) {
      case 'alert': return 'from-red-500/20 to-red-900/20 border-red-500/30';
      case 'maintenance': return 'from-orange-500/20 to-orange-900/20 border-orange-500/30';
      default: return 'from-blue-500/20 to-blue-900/20 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`w-full max-w-lg glass-panel bg-gradient-to-br ${getColor()} border p-8 relative overflow-hidden`}
        >
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            
            {/* Icon Banner */}
            <div className="w-20 h-20 rounded-2xl bg-bg-card border border-border-card flex items-center justify-center shadow-xl">
              {getIcon()}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                {currentAnn.title}
              </h2>
              <div className="text-text-secondary text-sm whitespace-pre-wrap leading-relaxed">
                {currentAnn.message}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full pt-6 flex flex-col sm:flex-row gap-3">
              {currentAnn.actionText && (
                <button
                  onClick={handleActionClick}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-text-primary rounded-xl font-semibold shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {currentAnn.actionText}
                </button>
              )}
              
              <button
                onClick={handleAcknowledge}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  currentAnn.actionText 
                    ? 'bg-white/10 hover:bg-white/20 text-text-primary' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-text-primary shadow-lg shadow-cyan-500/30'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                I Agree & Continue
              </button>
            </div>
            
            {/* Meta */}
            <div className="text-[10px] text-text-muted font-mono mt-4">
              ID: {currentAnn.id} • TARGET: {currentAnn.target.toUpperCase()}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
