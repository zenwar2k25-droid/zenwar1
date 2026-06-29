import React, { useState } from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { Shield, Mail, CheckCircle2, XCircle } from 'lucide-react';

export const AuthSettingsEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();
  const data = draftWebsiteState?.authSettings || {
    googleEnabled: false,
    googleClientId: '',
    googleClientSecret: '',
    authorizedOrigin: 'http://localhost:5173',
    authorizedRedirect: 'http://localhost:5173/auth/google/callback',
    emailEnabled: true,
    microsoftEnabled: false,
    appleEnabled: false,
    facebookEnabled: false,
  };
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!data) return <div className="p-8 text-center text-text-muted">Loading editor...</div>;

  const handleChange = (field: string, value: any) => {
    saveDraft({ authSettings: { ...data, [field]: value } });
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Verifying OAuth Configuration...');
    
    if (!data.googleClientId || !data.googleClientSecret) {
      setTestStatus('failed');
      setTestMessage('Google Client ID and Client Secret are required.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/test-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: data.googleClientId, 
          clientSecret: data.googleClientSecret,
          redirectUri: data.authorizedRedirect
        })
      });
      const result = await res.json();
      
      if (result.success) {
        setTestStatus('success');
        setTestMessage('🟢 Connection Successful! Google Login is Ready.');
      } else {
        setTestStatus('failed');
        setTestMessage(result.message || 'Configuration Error');
      }
    } catch (err) {
      setTestStatus('failed');
      setTestMessage('Could not connect to backend server');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Master Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="flex items-center justify-between bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-card)] opacity-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/10 text-gray-400 rounded-lg">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold">Email Login</h3>
              <p className="text-xs text-text-muted">Standard email & password</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={data.emailEnabled} onChange={(e) => handleChange('emailEnabled', e.target.checked)} disabled />
            <div className="w-11 h-6 bg-[var(--color-primary)] rounded-full peer after:translate-x-full after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"></div>
          </label>
        </div>
      </div>


      
      {/* Future Providers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {['Microsoft', 'Apple', 'Facebook'].map(provider => (
          <div key={provider} className="flex flex-col items-center justify-center bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-card)] opacity-40 grayscale pointer-events-none">
            <h4 className="text-white font-bold mb-2">{provider} Login</h4>
            <div className="px-3 py-1 bg-gray-800 rounded-full text-[10px] text-gray-400 font-bold uppercase">Coming Soon</div>
          </div>
        ))}
      </div>
    </div>
  );
};
