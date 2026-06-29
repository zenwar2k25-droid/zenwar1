import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { api } from '../../lib/api';

export const GoogleAuthSettingsEditor: React.FC = () => {
  const [data, setData] = useState({
    clientId: '',
    redirectUri: '',
    enabled: false,
    reason: ''
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.getGoogleConfig();
      if (res.success && res.config) {
        setData({
          clientId: res.config.clientId || '',
          redirectUri: res.config.redirectUri || '',
          enabled: res.config.enabled || false,
          reason: res.config.reason || ''
        });
      }
    } catch (err) {
      console.error('Failed to load Google OAuth config', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-text-muted">Loading Google OAuth Settings...</div>;

  return (
    <div className="glass-panel p-5 border-border-card space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">Google Login Settings (Environment)</h3>
            <p className="text-xs text-text-muted">Managed securely via backend .env configuration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {data.enabled ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
              <CheckCircle2 size={14} /> Enabled
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
              <XCircle size={14} /> Disabled
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {!data.enabled && data.reason && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Configuration Error</p>
              <p className="mt-1">{data.reason}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 rounded-xl">
            <label className="block text-xs font-medium text-text-muted mb-1">Google Client ID</label>
            <div className="text-sm text-white break-all">
              {data.clientId ? data.clientId : <span className="text-red-400 italic">Missing</span>}
            </div>
          </div>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 rounded-xl">
            <label className="block text-xs font-medium text-text-muted mb-1">Redirect URI / Authorized Origin</label>
            <div className="text-sm text-white break-all">
              {data.redirectUri ? data.redirectUri : <span className="text-red-400 italic">Missing</span>}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200">
            <p className="font-medium mb-1 text-blue-300">How to configure Google Login</p>
            <p className="opacity-80">
              Google OAuth settings are strictly managed via environment variables for security. 
              To enable Google Sign-In, please edit the <code className="bg-black/30 px-1 py-0.5 rounded">.env</code> file on the server and set the following variables:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 opacity-80">
              <li><code className="bg-black/30 px-1 py-0.5 rounded">GOOGLE_CLIENT_ID</code></li>
              <li><code className="bg-black/30 px-1 py-0.5 rounded">GOOGLE_CLIENT_SECRET</code> (Never exposed to frontend)</li>
              <li><code className="bg-black/30 px-1 py-0.5 rounded">GOOGLE_CALLBACK_URL</code></li>
            </ul>
            <p className="mt-2 opacity-80">
              Once all variables are correctly formatted, the system will automatically validate them on startup and enable the login option.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
