import React, { useState } from 'react';
import { Shield, Plus, Trash2, Users, GripVertical, CheckCircle2 } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const Roles: React.FC = () => {
  const { permissionRules, addCustomRole, deleteCustomRole } = useDatabase();
  const [newRoleName, setNewRoleName] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Drag-and-Drop simulator state
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const [rolePermissionsSimulator, setRolePermissionsSimulator] = useState<Record<string, string[]>>({
    'Business Admin': ['Billing', 'Inventory', 'Reports', 'Salaries'],
    'Manager': ['Billing', 'Inventory', 'Reports'],
    'Accountant': ['Reports', 'Salaries'],
    'Service Advisor': ['Billing', 'Inventory'],
    'Mechanic': ['Inventory'],
    'Receptionist': ['Billing']
  });

  const permissionGroupsList = ['Billing', 'Inventory', 'Reports', 'Salaries'];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    addCustomRole(newRoleName);
    setRolePermissionsSimulator(prev => ({
      ...prev,
      [newRoleName]: ['Billing'] // default group
    }));
    triggerToast(`Custom role "${newRoleName}" created successfully!`);
    setNewRoleName('');
  };

  const handleDeleteRole = (name: string) => {
    deleteCustomRole(name);
    const updated = { ...rolePermissionsSimulator };
    delete updated[name];
    setRolePermissionsSimulator(updated);
    triggerToast(`Role "${name}" deleted.`);
  };

  // Drag Handlers
  const handleDragStart = (group: string) => {
    setDraggedGroup(group);
  };

  const handleDrop = (roleName: string) => {
    if (!draggedGroup) return;
    const current = rolePermissionsSimulator[roleName] || [];
    if (current.includes(draggedGroup)) {
      setDraggedGroup(null);
      return;
    }

    setRolePermissionsSimulator(prev => ({
      ...prev,
      [roleName]: [...current, draggedGroup]
    }));
    triggerToast(`Added ${draggedGroup} rights to ${roleName}`);
    setDraggedGroup(null);
  };

  const removeGroupFromRole = (roleName: string, group: string) => {
    const current = rolePermissionsSimulator[roleName] || [];
    setRolePermissionsSimulator(prev => ({
      ...prev,
      [roleName]: current.filter(g => g !== group)
    }));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
          Custom Role Configurator
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
          Design dynamic staff roles and map core module permission groups via drag-and-drop
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-5 border-border-card space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
              <Plus className="text-cyan-400" size={16} /> Create Custom Role
            </h3>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-text-secondary block mb-1">ROLE ALIAS / DESIGNATION *</label>
                <input 
                  type="text" 
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="e.g. Master Diagnostic Lead"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] placeholder:text-text-muted"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all text-xs cursor-pointer"
              >
                Onboard Custom Role
              </button>
            </form>
          </div>

          {/* Drag & Drop Source container */}
          <div className="glass-panel p-5 border-border-card space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Permission Groups</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Drag any group element into role cards to assign rights.</p>
            </div>

            <div className="flex flex-col gap-2">
              {permissionGroupsList.map(group => (
                <div
                  key={group}
                  draggable
                  onDragStart={() => handleDragStart(group)}
                  className="p-3 rounded-xl border border-border-card bg-white/5 flex items-center justify-between cursor-grab hover:bg-hover-bg transition-colors font-semibold text-xs text-text-primary active:cursor-grabbing"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {group} Access Group
                  </span>
                  <GripVertical size={14} className="text-text-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roles lists with dropping zones */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display flex items-center gap-2">
            <Shield className="text-[var(--color-primary)]" size={16} /> Configured Roles ({permissionRules.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissionRules.map((rule) => {
              const groups = rolePermissionsSimulator[rule.role] || [];
              const isSuper = rule.role === 'Super Admin' || rule.role === 'Business Admin';
              
              return (
                <div
                  key={rule.role}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(rule.role)}
                  className="glass-panel p-5 border-border-card flex flex-col justify-between min-h-[170px] relative group"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-text-secondary" />
                        <h4 className="font-bold text-sm text-text-primary">{rule.role}</h4>
                      </div>
                      
                      {!isSuper && (
                        <button 
                          onClick={() => handleDeleteRole(rule.role)}
                          className="p-1 rounded-lg text-text-muted hover:text-red-400 hover:bg-hover-bg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Dropped groups elements */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {groups.length === 0 ? (
                        <div className="text-[10px] text-text-muted border border-dashed border-border-card rounded-lg p-2 text-center w-full">
                          Drag and Drop permission groups here...
                        </div>
                      ) : (
                        groups.map(g => (
                          <span 
                            key={g} 
                            className="inline-flex items-center gap-1.5 text-[9px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded"
                          >
                            {g}
                            {!isSuper && (
                              <button 
                                onClick={() => removeGroupFromRole(rule.role, g)} 
                                className="hover:text-text-primary cursor-pointer"
                              >
                                &times;
                              </button>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="text-[9px] text-text-muted font-mono pt-3.5 border-t border-border-card mt-4">
                    Mapped in workspace default files
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-cyan-400 px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle2 size={16} className="text-cyan-400" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
