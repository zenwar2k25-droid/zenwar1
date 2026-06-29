import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  Megaphone, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const Notifications: React.FC = () => {
  const { saAnnouncements, addSaAnnouncement, deleteSaAnnouncement } = useDatabase();
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'enterprise' | 'growth' | 'starter' | 'custom'>('all');
  const [customTarget, setCustomTarget] = useState('');
  const [type, setType] = useState<'announcement' | 'maintenance' | 'alert'>('announcement');
  const { businesses } = useDatabase();

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    if (target === 'custom' && !customTarget) {
      triggerToast('Please enter a target Tenant Domain');
      return;
    }

    addSaAnnouncement({
      title,
      message,
      target: target === 'custom' ? customTarget.toUpperCase() : target,
      type
    });

    triggerToast('Broadcast announcement sent to targeted client business accounts!');
    setTitle('');
    setMessage('');
    setTarget('all');
    setCustomTarget('');
    setType('announcement');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
          <Bell className="text-[var(--color-primary)]" size={28} /> Communication Broadcast Center
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
          Dispatch platform announcements, maintenance alerts, and targeted broadcast messages to tenants
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create broadcast form */}
        <div className="glass-panel p-5 border-border-card space-y-4 lg:col-span-1 h-fit">
          <div className="flex items-center gap-2">
            <Megaphone className="text-cyan-400" size={18} />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">New Broadcast Template</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs font-semibold text-text-secondary">
            <div>
              <label className="block mb-1">ANNOUNCEMENT TITLE *</label>
              <input 
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Schedule Maintenance Notice"
                className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block mb-1">MESSAGE BODY *</label>
              <textarea 
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type the message contents that will appear in the client notification center..."
                className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">TARGET TIER *</label>
                <select 
                  value={target}
                  onChange={e => setTarget(e.target.value as any)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="all">All Businesses</option>
                  <option value="enterprise">Enterprise Tiers</option>
                  <option value="growth">Growth Tiers</option>
                  <option value="starter">Starter Tiers</option>
                  <option value="custom">Specific Tenant Domain</option>
                </select>
              </div>

              {target === 'custom' && (
                <div className="col-span-2">
                  <label className="block mb-1">TENANT DOMAIN *</label>
                  <input 
                    type="text"
                    required
                    value={customTarget}
                    onChange={e => setCustomTarget(e.target.value)}
                    placeholder="e.g. SBM001"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] placeholder:text-gray-600 uppercase"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1">ALERT TYPE *</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="announcement">Announcement</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="alert">Critical Alert</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={14} /> Send Broadcast Campaign
            </button>
          </form>
        </div>

        {/* Right Columns: Active Broadcast Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Active Campaigns / Broadcasts</h3>
            <span className="text-[10px] text-text-muted font-mono">Running telemetries</span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {saAnnouncements.map((ann) => {
              const colors = {
                announcement: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
                maintenance: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400',
                alert: 'border-red-500/20 bg-red-500/5 text-red-400'
              };
              
              return (
                <div 
                  key={ann.id}
                  className="glass-panel p-5 border border-border-card relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${colors[ann.type as keyof typeof colors]}`}>
                          {ann.type}
                        </span>
                        <h4 className="font-bold text-sm text-text-primary pt-1">{ann.title}</h4>
                      </div>
                      
                      <button 
                        onClick={() => deleteSaAnnouncement(ann.id)}
                        className="p-1 rounded-lg text-text-muted hover:text-red-400 hover:bg-hover-bg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {ann.message}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-card mt-4">
                    <div className="flex justify-between items-center text-[10px] text-text-muted font-mono mb-2">
                      <span className="flex items-center gap-1"><Clock size={11} /> Sent on {new Date(ann.date).toLocaleDateString()}</span>
                      <span>Target: <strong className="text-cyan-400 uppercase">{ann.target}</strong></span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-black/20 rounded p-2 border border-border-card text-[10px] font-mono">
                      <div>
                        <span className="text-text-muted">Acknowledged: </span>
                        <span className="text-emerald-400 font-bold">{ann.acknowledgements?.length || 0}</span>
                      </div>
                      <div className="flex gap-2">
                        {ann.acknowledgements?.slice(0, 3).map((ack, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded" title={`Acknowledged by ${ack.userId} at ${new Date(ack.date).toLocaleString()}`}>
                            {ack.tenantDomain}
                          </span>
                        ))}
                        {(ann.acknowledgements?.length || 0) > 3 && (
                          <span className="px-1.5 py-0.5 bg-white/5 text-text-secondary rounded">+{ann.acknowledgements!.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {saAnnouncements.length === 0 && (
              <div className="py-16 text-center text-xs text-[var(--text-secondary)] glass-panel border-border-card">
                No active announcements currently broadcasted.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-emerald-500 px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
