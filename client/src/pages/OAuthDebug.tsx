import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, XCircle, ArrowLeft, RefreshCw, Server, Key, Database, Globe } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const OAuthDebug: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'superadmin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/debug');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setDebugData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend debug endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'superadmin') {
      fetchDebugInfo();
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'superadmin') return null;

  return (
    <div className="min-h-screen bg-bg-app p-6 font-sans text-text-primary">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/super-admin')}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">OAuth Diagnostics</h1>
              <p className="text-text-secondary text-sm">System configuration and backend connectivity tests</p>
            </div>
          </div>
          <button 
            onClick={fetchDebugInfo}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-1">Connection Error</h3>
              <p className="text-red-400/80 text-sm">{error}</p>
              <p className="text-red-400/80 text-sm mt-2">Make sure the backend server is running.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Server Status */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Server size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Backend Server</h3>
                  <p className="text-xs text-text-secondary">API Connectivity</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">Status</span>
                  {loading ? <span className="text-xs text-text-muted">Testing...</span> : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                      <CheckCircle2 size={14} /> ONLINE
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">Server Time</span>
                  <span className="text-xs text-text-secondary font-mono">
                    {debugData?.serverTime ? new Date(debugData.serverTime).toLocaleTimeString() : '--:--:--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Google OAuth Config */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Key size={20} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Google Credentials</h3>
                  <p className="text-xs text-text-secondary">Environment Variables</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">Client ID</span>
                  {loading ? <span className="text-xs text-text-muted">Testing...</span> : (
                    debugData?.googleClientIdConfigured ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-500"><CheckCircle2 size={14} /> CONFIGURED</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-500"><XCircle size={14} /> MISSING</span>
                    )
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">Client Secret</span>
                  {loading ? <span className="text-xs text-text-muted">Testing...</span> : (
                    debugData?.googleClientSecretConfigured ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-500"><CheckCircle2 size={14} /> CONFIGURED</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-500"><XCircle size={14} /> MISSING</span>
                    )
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">Redirect URI</span>
                  {loading ? <span className="text-xs text-text-muted">Testing...</span> : (
                    <span className="text-xs text-text-secondary font-mono truncate max-w-[200px]" title={debugData?.redirectUri || 'Not set'}>
                      {debugData?.redirectUri || 'Not set'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Google API Connection */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Globe size={20} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Google API</h3>
                  <p className="text-xs text-text-secondary">Network Reachability</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">Connection</span>
                  {loading ? <span className="text-xs text-text-muted">Testing...</span> : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-500">
                      <AlertCircle size={14} /> REQUIRES LOGIN TEST
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted px-2">
                  To fully test the Google API integration, attempt a login from the Auth page and check the node.js console logs.
                </p>
              </div>
            </div>
            
            {/* Database Connection */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Database size={20} className="text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Database</h3>
                  <p className="text-xs text-text-secondary">User Lookup</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-sm">Status</span>
                  {loading ? <span className="text-xs text-text-muted">Testing...</span> : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-500">
                      <AlertCircle size={14} /> VERIFY LOGS
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted px-2">
                  Check backend terminal logs for "Searching Database..." after Google OAuth exchange.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
