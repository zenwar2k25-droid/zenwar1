import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { MapPin } from 'lucide-react';

export const LiveBranchMapEditor: React.FC = () => {
  const { businesses } = useDatabase();
  const branches = businesses.map(b => ({ id: b.id, name: b.name, domain: b.tenantDomain, status: b.status }));

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-primary" />
        Live Branch Map
      </h3>
      <p className="text-text-muted mb-6">
        Branches are automatically generated from registered tenant businesses.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div key={branch.id} className="bg-surface-dark border border-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-white">{branch.name}</h4>
            <p className="text-sm text-text-muted">{branch.domain}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${branch.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {branch.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
