import React, { useState, useEffect } from 'react';
import { Settings, Server, Globe, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useModal } from '../../context/ModalContext';
import { AIAssistantSettings } from './settings/AIAssistantSettings';
import { GoogleAuthSettingsEditor } from '../../components/superadmin/GoogleAuthSettingsEditor';

export const SettingsPage: React.FC = () => {
  const [toastMsg, setToastMsg] = useState('');
  const { landingPageSettings, updateLandingPageSettings } = useDatabase();
  
  // Settings Form state
  const [platformName, setPlatformName] = useState('Zenwar Platform');
  const [smtpServer, setSmtpServer] = useState('smtp.postmarkapp.com');
  const [smsGatewayUrl, setSmsGatewayUrl] = useState('https://api.twilio.com/2010-04-01/...');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [whitelabelEnabled, setWhitelabelEnabled] = useState(true);
  const [landingSettings, setLandingSettings] = useState(landingPageSettings);
  
  useEffect(() => {
    setLandingSettings(landingPageSettings);
  }, [landingPageSettings]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateLandingPageSettings(landingSettings);
    triggerToast('Platform-wide system configuration settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <Settings className="text-[var(--color-primary)]" size={28} /> System Settings
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
            Configure system configurations, SMS configurations, gateways and whitelabeling parameters
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-semibold text-text-secondary">
        {/* Core parameters */}
        <div className="glass-panel p-5 border-border-card space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
            <Globe className="text-cyan-400" size={16} /> Global Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">PLATFORM SaaS BRAND NAME *</label>
              <input 
                type="text"
                required
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block mb-1">DEFAULT CURRENCY SYMBOL *</label>
              <select
                value={defaultCurrency}
                onChange={e => setDefaultCurrency(e.target.value)}
                className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border-card">
            <div>
              <span className="text-text-primary block">Enterprise Whitelabeling (Custom Branding)</span>
              <span className="text-[10px] text-text-muted font-mono">Allow custom logo and theme configuration for Enterprise accounts</span>
            </div>
            <button 
              type="button"
              onClick={() => setWhitelabelEnabled(!whitelabelEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${whitelabelEnabled ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${whitelabelEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Server & API Gateways */}
        <div className="glass-panel p-5 border-border-card space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
            <Server className="text-orange-400" size={16} /> SMTP & SMS Gateways
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block mb-1">SMTP SERVER URL</label>
              <input 
                type="text"
                value={smtpServer}
                onChange={e => setSmtpServer(e.target.value)}
                className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>

            <div>
              <label className="block mb-1">SMS GATEWAY Webhook URL</label>
              <input 
                type="text"
                value={smsGatewayUrl}
                onChange={e => setSmsGatewayUrl(e.target.value)}
                className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Landing Page Settings */}
        <div className="glass-panel p-5 border-border-card space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
            <Globe className="text-[var(--color-primary)]" size={16} /> Landing Page Controls
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div>
                <span className="text-text-primary block">Enable Registration</span>
                <span className="text-[10px] text-text-muted font-mono">Allow new businesses to register via the landing page</span>
              </div>
              <button 
                type="button"
                onClick={() => setLandingSettings(s => ({...s, enableRegistration: !s.enableRegistration}))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${landingSettings.enableRegistration ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${landingSettings.enableRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div>
                <span className="text-text-primary block">Enable Login</span>
                <span className="text-[10px] text-text-muted font-mono">Show the Sign In button and allow access to the /login route</span>
              </div>
              <button 
                type="button"
                onClick={() => setLandingSettings(s => ({...s, enableLogin: !s.enableLogin}))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${landingSettings.enableLogin ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${landingSettings.enableLogin ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div>
                <span className="text-text-primary block">Enable Free Trial</span>
                <span className="text-[10px] text-text-muted font-mono">Allow users to select free trial during registration</span>
              </div>
              <button 
                type="button"
                onClick={() => setLandingSettings(s => ({...s, enableFreeTrial: !s.enableFreeTrial}))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${landingSettings.enableFreeTrial ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${landingSettings.enableFreeTrial ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div>
                <span className="text-text-primary block">Enable Paid Registration</span>
                <span className="text-[10px] text-text-muted font-mono">Allow users to purchase paid subscriptions directly from landing page</span>
              </div>
              <button 
                type="button"
                onClick={() => setLandingSettings(s => ({...s, enablePaidRegistration: !s.enablePaidRegistration}))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${landingSettings.enablePaidRegistration ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${landingSettings.enablePaidRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div>
                <span className="text-text-primary block">Enable Payment Gateway</span>
                <span className="text-[10px] text-text-muted font-mono">Turn on real payment processing instead of simulation</span>
              </div>
              <button 
                type="button"
                onClick={() => setLandingSettings(s => ({...s, enablePaymentGateway: !s.enablePaymentGateway}))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${landingSettings.enablePaymentGateway ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${landingSettings.enablePaymentGateway ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-red-500/20">
              <div>
                <span className="text-red-400 block font-bold">Maintenance Mode</span>
                <span className="text-[10px] text-red-400/80 font-mono">Take the entire landing page and registration offline</span>
              </div>
              <button 
                type="button"
                onClick={() => setLandingSettings(s => ({...s, maintenanceMode: !s.maintenanceMode}))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${landingSettings.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${landingSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          Save Configuration
        </button>
      </form>

      {/* AI Assistant Settings Section */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <AIAssistantSettings />
      </div>
      
      {/* Authentication Settings Section */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <ShieldAlert className="text-cyan-400" size={24} /> Authentication Settings
        </h2>
        <GoogleAuthSettingsEditor />
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
export { SettingsPage as Settings };
