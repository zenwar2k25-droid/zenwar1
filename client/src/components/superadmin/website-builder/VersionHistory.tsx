import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { useModal } from '../../../context/ModalContext';
import { History, ArrowLeft, Eye } from 'lucide-react';

export const VersionHistory: React.FC = () => {
  const { websiteVersions, rollbackToVersion } = useDatabase();
  const { confirm, alert } = useModal();

  const handleRollback = async (id: string) => {
    if (await confirm('Are you sure you want to rollback the live website to this version?')) {
      rollbackToVersion(id);
      await alert('Rollback successful.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <History className="text-[var(--color-primary)]" size={24} />
        <h3 className="text-white font-bold text-lg">Publish History</h3>
      </div>

      <div className="bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl overflow-hidden">
        {websiteVersions.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No versions published yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border-card)]">
            {websiteVersions.map((version, idx) => (
              <div key={version.id} className="p-5 flex items-center justify-between hover:bg-[var(--bg-card)] transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-bold">{version.versionName}</span>
                    {idx === 0 && <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[var(--color-primary)]/30">CURRENT LIVE</span>}
                  </div>
                  <p className="text-xs text-text-muted">Published by {version.publishedBy} on {new Date(version.publishedAt).toLocaleString()}</p>
                  {version.notes && <p className="text-sm text-text-secondary mt-2">"{version.notes}"</p>}
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="px-3 py-1.5 rounded-lg border border-[var(--border-card)] text-text-secondary hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <Eye size={14} /> View
                  </button>
                  {idx !== 0 && (
                    <button onClick={() => handleRollback(version.id)} className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)] hover:text-black transition-colors flex items-center gap-2 text-sm font-bold">
                      <ArrowLeft size={14} /> Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
