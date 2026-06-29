import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useDatabase();

  return (
    <div className="bg-bg-app min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--color-secondary)]/5 filter blur-[80px] pointer-events-none" />

      <div className="text-center space-y-6 max-w-md relative z-10">
        {/* Animated warning icon */}
        <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-orange-500/5 animate-bounce">
          ⚠️
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold font-display tracking-tight text-text-primary">404</h1>
          <h2 className="text-lg font-bold text-orange-400 uppercase tracking-widest font-mono">Engine Stall / Page Not Found</h2>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
          The ignition sequence failed. The request routing path you are trying to pull has stalled or does not exist in the dashboard module register.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => navigate(currentUser?.role === 'superadmin' ? '/super-admin' : '/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/5 hover:bg-hover-bg border border-border-card text-text-primary font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Landing Hub
          </button>
        </div>
      </div>
    </div>
  );
};
