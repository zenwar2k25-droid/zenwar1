import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Download, 
  Terminal,
  CheckCircle2 
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const ActivityLogs: React.FC = () => {
  const { saAuditLogs } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredLogs = useMemo(() => {
    return saAuditLogs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.adminUser.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = selectedAction === 'all' || log.action.includes(selectedAction);

      return matchesSearch && matchesAction;
    });
  }, [saAuditLogs, searchQuery, selectedAction]);

  const handleExport = (type: 'csv' | 'pdf') => {
    triggerToast(`SaaS activity audit logs successfully exported to ${type.toUpperCase()}!`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display flex items-center gap-2">
            <ClipboardList className="text-[var(--color-primary)]" size={28} /> SaaS Activity Audit Trails
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
            Platform audit registers logging Super Admin configs, tenant allocations and gateway overrides
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-center">
          <button 
            onClick={() => handleExport('csv')}
            className="px-4 py-2.5 bg-white/5 border border-border-card hover:border-cyan-500/30 text-text-primary font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="px-4 py-2.5 bg-white/5 border border-border-card hover:border-cyan-500/30 text-text-primary font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by action, target workspace, operator name..." 
            className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)]"
          />
        </div>

        {/* Dropdown action type */}
        <select
          value={selectedAction}
          onChange={e => setSelectedAction(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
        >
          <option value="all">All Operations Types</option>
          <option value="Business">Business Allocations</option>
          <option value="Permission">Permission overrides</option>
          <option value="Subscription">Subscriptions changes</option>
          <option value="Backup">System backups logs</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="glass-panel border-border-card overflow-hidden">
        <div className="p-4 border-b border-border-card flex justify-between items-center bg-white/[0.01]">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider font-display">
            <Terminal size={14} className="text-cyan-400" /> Platform Security Log
          </div>
          <span className="text-[9px] font-mono text-text-muted">{filteredLogs.length} ENTRIES SHOWN</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-card text-text-muted bg-white/[0.02]">
                <th className="p-4 font-semibold">Logged Timestamp</th>
                <th className="p-4 font-semibold">Action Trigger</th>
                <th className="p-4 font-semibold">Target Entity</th>
                <th className="p-4 font-semibold">Operator Account</th>
                <th className="p-4 font-semibold">IP Address</th>
                <th className="p-4 font-semibold">Device Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-text-primary">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 font-mono text-text-secondary">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-text-primary">{log.action}</td>
                  <td className="p-4 font-mono text-cyan-400 text-[11px]">{log.target}</td>
                  <td className="p-4 text-text-primary">{log.adminUser}</td>
                  <td className="p-4 font-mono text-text-muted">{log.ipAddress}</td>
                  <td className="p-4 font-mono text-text-muted truncate max-w-44">{log.device}</td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[var(--text-secondary)]">
                    No matching SaaS audit logs discovered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
