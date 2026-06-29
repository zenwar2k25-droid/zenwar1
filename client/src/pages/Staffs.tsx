import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Zap, 
  CheckCircle, 
  Terminal,
  X,
  UserPlus,
  Smartphone,
  Mail,
  Briefcase,
  MapPin,
  DollarSign,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import type { Mechanic, StaffPermissions } from '../data/seedData';

export const Staffs: React.FC = () => {
  const { mechanics, updateMechanic, addMechanic, login } = useDatabase();
  const [editingTechId, setEditingTechId] = useState<string | null>(null);
  const [tempSalary, setTempSalary] = useState<number>(0);
  const [successToast, setSuccessToast] = useState('');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Permissions Modal State
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedStaffForPerm, setSelectedStaffForPerm] = useState<Mechanic | null>(null);
  const [currentPermState, setCurrentPermState] = useState<StaffPermissions | null>(null);

  const buildDefaultPermissions = (roleName: string): StaffPermissions => {
    const isManager = roleName.toLowerCase() === 'manager' || roleName.toLowerCase() === 'admin';
    const isAccountant = roleName.toLowerCase() === 'accountant';
    return {
      billing: {
        read: isManager || isAccountant,
        create: isManager,
        edit: isManager,
        delete: isManager,
        export: isManager || isAccountant,
        approve: isManager
      },
      invoices: {
        read: isManager || isAccountant,
        create: isManager,
        edit: isManager,
        delete: isManager,
        export: isManager || isAccountant,
        approve: isManager
      },
      inventory: {
        read: true,
        create: isManager,
        edit: isManager,
        delete: isManager,
        export: isManager,
        approve: isManager
      },
      reports: {
        read: isManager || isAccountant,
        create: isManager,
        edit: isManager,
        delete: isManager,
        export: isManager || isAccountant,
        approve: isManager
      },
      dashboard: {
        read: isManager || isAccountant,
        create: false,
        edit: false,
        delete: false,
        export: isManager || isAccountant,
        approve: false
      }
    };
  };

  const openPermissionsModal = (staff: Mechanic) => {
    setSelectedStaffForPerm(staff);
    setCurrentPermState(staff.permissions || buildDefaultPermissions(staff.role));
    setPermissionsModalOpen(true);
  };

  const savePermissions = () => {
    if (!selectedStaffForPerm || !currentPermState) return;
    updateMechanic(selectedStaffForPerm.id, { permissions: currentPermState });
    setPermissionsModalOpen(false);
    triggerToast(`Permissions updated for ${selectedStaffForPerm.name}`);
  };

  // Add Staff Form Fields
  const [staffName, setStaffName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Mechanic');
  const [department, setDepartment] = useState('Mechanical');
  const [branch, setBranch] = useState('Main Bay');
  const [salary, setSalary] = useState('');

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleAttendanceChange = (id: string, newStatus: any) => {
    updateMechanic(id, { attendance: newStatus });
    const staffMember = mechanics.find(m => m.id === id);
    triggerToast(`Attendance logged: ${staffMember?.name} is now ${newStatus}`);
  };

  const startSalaryEdit = (id: string, currentVal: number) => {
    setEditingTechId(id);
    setTempSalary(currentVal);
  };

  const saveSalaryEdit = (id: string) => {
    updateMechanic(id, { salary: tempSalary });
    setEditingTechId(null);
    triggerToast(`Salary package updated successfully.`);
  };

  const handleConsoleToggle = (tech: any) => {
    try {
      if (tech.loginAccessDisabled) {
        triggerToast(`Error: ${tech.name}'s account is disabled by the admin.`);
        return;
      }
      login(tech.name, 'mechanic', tech.id);
      triggerToast(`Console perspective shifted to: ${tech.name}`);
    } catch (err: any) {
      triggerToast(err.message || 'Shift console failed.');
    }
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffId || !phone || !email || !username || !password || !salary) {
      triggerToast('Please fill in all required fields.');
      return;
    }

    addMechanic({
      name: staffName,
      staffId,
      phone,
      email,
      username,
      password,
      role,
      department,
      branch,
      salary: Number(salary),
      avatar: role === 'Manager' ? '👔' : role === 'Advisor' ? '📋' : role === 'Accountant' ? '💼' : '🔧',
      loginAccessDisabled: false,
      permissions: buildDefaultPermissions(role)
    });

    // Reset Form
    setStaffName('');
    setStaffId('');
    setPhone('');
    setEmail('');
    setUsername('');
    setPassword('');
    setRole('Mechanic');
    setDepartment('Mechanical');
    setBranch('Main Bay');
    setSalary('');
    setModalOpen(false);
    
    triggerToast(`Successfully onboarded staff member: ${staffName}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Staff Management Board
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage business employees, attendance, payroll, tasks, and access controls.
          </p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all self-start sm:self-center cursor-pointer"
        >
          <UserPlus size={15} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.map((tech) => {
          const isEditing = editingTechId === tech.id;
          const hasLogin = !!tech.username && !!tech.password;
          
          return (
            <div key={tech.id} className="glass-panel p-5 relative flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300">
              <div>
                {/* Avatar and name header */}
                <div className="flex items-center justify-between border-b border-border-card pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border-card flex items-center justify-center text-2xl shadow-sm">
                      {tech.avatar || '🔧'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                        {tech.name}
                        {hasLogin && (
                          <span className={`px-1.5 py-0.5 rounded-[5px] text-[7px] font-bold font-mono uppercase ${tech.loginAccessDisabled ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'}`}>
                            {tech.loginAccessDisabled ? 'Suspended' : 'Login Active'}
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-text-muted font-mono mt-0.5">{tech.role}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-gray-600 bg-white/5 border border-border-card rounded-lg px-2 py-0.5">
                    ID: {tech.staffId || tech.id}
                  </span>
                </div>

                {/* Performance stats row */}
                <div className="grid grid-cols-3 gap-2 text-center py-3 border-b border-border-card">
                  <div className="bg-white/[0.01] border border-border-card rounded-xl p-2 flex flex-col justify-center">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Rating</span>
                    <span className="text-xs font-bold text-text-primary flex items-center justify-center gap-0.5 mt-0.5 font-mono">
                      <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" /> {tech.rating || 5.0}
                    </span>
                  </div>
                  <div className="bg-white/[0.01] border border-border-card rounded-xl p-2 flex flex-col justify-center">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Efficiency</span>
                    <span className="text-xs font-bold text-text-primary flex items-center justify-center gap-0.5 mt-0.5 font-mono">
                      <Zap size={11} className="text-cyan-400 shrink-0" /> {tech.efficiency || 100}%
                    </span>
                  </div>
                  <div className="bg-white/[0.01] border border-border-card rounded-xl p-2 flex flex-col justify-center">
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Active Tasks</span>
                    <span className="text-xs font-extrabold text-orange-400 mt-0.5 font-mono">
                      {tech.tasksAssigned} jobs
                    </span>
                  </div>
                </div>

                {/* Operations inputs list */}
                <div className="space-y-3 py-4 text-xs">
                  {/* Attendance Select */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Duty Log</span>
                    <div className="flex gap-1 bg-white/5 border border-border-card rounded-lg p-0.5">
                      {['Present', 'Late', 'Absent'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleAttendanceChange(tech.id, status as any)}
                          className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${tech.attendance === status 
                            ? status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : status === 'Late' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'text-text-muted hover:text-text-primary bg-transparent'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Salary packages adjustments */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Salary Ledger</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 font-mono">
                        <input 
                          type="number"
                          value={tempSalary}
                          onChange={e => setTempSalary(Number(e.target.value))}
                          className="w-20 bg-bg-card border border-border-card rounded px-1.5 py-0.5 text-right text-xs"
                        />
                        <button onClick={() => saveSalaryEdit(tech.id)} className="text-emerald-400 hover:underline text-[10px] font-bold">Save</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-text-primary font-semibold">₹{tech.salary.toLocaleString()}</span>
                        <button onClick={() => startSalaryEdit(tech.id, tech.salary)} className="text-[var(--color-primary)] hover:underline text-[9px]">Edit</button>
                      </div>
                    )}
                  </div>

                  {/* Department & Branch badges */}
                  <div className="flex justify-between items-center text-[10px] text-text-muted">
                    <span>Placement:</span>
                    <div className="flex gap-1.5 font-mono text-[9px]">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 flex items-center gap-0.5">
                        <Briefcase size={9} /> {tech.department || 'Repair'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/10 flex items-center gap-0.5">
                        <MapPin size={9} /> {tech.branch || 'Main'}
                      </span>
                    </div>
                  </div>

                  {/* Phone contact details */}
                  <div className="flex justify-between items-center text-text-muted font-mono text-[10px]">
                    <span>Contact Info:</span>
                    <span className="text-text-primary flex items-center gap-1"><Smartphone size={11} className="text-cyan-400" /> {tech.phone}</span>
                  </div>

                  {/* Email contact details */}
                  <div className="flex justify-between items-center text-text-muted font-mono text-[10px]">
                    <span>Email Address:</span>
                    <span className="text-text-primary flex items-center gap-1"><Mail size={11} className="text-cyan-400" /> {tech.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons split */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleConsoleToggle(tech)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-border-card hover:bg-[var(--color-primary-glow)] hover:border-[var(--color-primary)] text-text-primary hover:text-[var(--color-primary)] font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Terminal size={11} /> Console
                </button>
                <button
                  onClick={() => openPermissionsModal(tech)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-border-card hover:bg-[var(--color-secondary-glow)] hover:border-[var(--color-secondary)] text-text-primary hover:text-[var(--color-secondary)] font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Shield size={11} /> Permissions
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD STAFF MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 border-border-card max-w-lg w-full relative space-y-4 bg-bg-app text-xs max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-border-card">
                <div className="p-2 bg-gradient-to-tr from-[var(--color-primary)] to-blue-500 rounded-xl text-text-primary">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Onboard Staff Member</h3>
                  <p className="text-[10px] text-text-muted font-mono">Create payroll catalog details and portal access keys</p>
                </div>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">STAFF FULL NAME *</label>
                    <input 
                      type="text" 
                      required
                      value={staffName}
                      onChange={e => setStaffName(e.target.value)}
                      placeholder="e.g. Liam Neeson"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">STAFF MEMBER ID *</label>
                    <input 
                      type="text" 
                      required
                      value={staffId}
                      onChange={e => setStaffId(e.target.value.replace(/\s+/g, ''))}
                      placeholder="e.g. GF-STAFF-12"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">MOBILE NUMBER *</label>
                    <input 
                      type="text" 
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 762-4369"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">EMAIL ADDRESS *</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. liam@zenwar.co"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border-card">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">PORTAL LOGIN USERNAME *</label>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                      placeholder="e.g. lneeson"
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">PORTAL LOGIN PASSWORD *</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 pr-10 text-text-primary focus:outline-none focus:border-[var(--color-primary)]"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-card">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">WAGE TYPE ROLE *</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono cursor-pointer"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Advisor">Advisor</option>
                      <option value="Mechanic">Mechanic</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Receptionist">Receptionist</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">DEPARTMENT *</label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono cursor-pointer"
                    >
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Detials & Paint">Detailing</option>
                      <option value="Front Office">Front Office</option>
                      <option value="Accounts">Accounts</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary block mb-1">ASSIGNED BRANCH *</label>
                    <select
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="w-full bg-bg-card border border-border-card rounded-xl px-3.5 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono cursor-pointer"
                    >
                      <option value="Main Bay">Main Bay</option>
                      <option value="East Bay Annex">East Bay Annex</option>
                      <option value="North Business">North Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-secondary block mb-1">MONTHLY SALARY LEDGER (₹) *</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="number"
                      required
                      value={salary}
                      onChange={e => setSalary(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full bg-bg-card border border-border-card rounded-xl pl-9 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-[var(--color-primary)] font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 text-xs font-semibold pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/3 py-3 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Onboard Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permissions Modal */}
      <AnimatePresence>
        {permissionsModalOpen && selectedStaffForPerm && currentPermState && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-6 border-border-card max-w-2xl w-full relative space-y-6 bg-bg-app text-xs max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setPermissionsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 pb-3 border-b border-border-card">
                <div className="p-2 bg-gradient-to-tr from-[var(--color-primary)] to-blue-500 rounded-xl text-text-primary">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">
                    Granular Access Matrix
                  </h3>
                  <p className="text-[10px] text-text-muted font-mono">
                    Configure Read/Write controls for {selectedStaffForPerm.name} ({selectedStaffForPerm.role})
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] text-text-secondary">
                  <thead>
                    <tr className="border-b border-border-card text-text-primary font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5">Module / Scope</th>
                      <th className="py-2.5 text-center">Read</th>
                      <th className="py-2.5 text-center">Create</th>
                      <th className="py-2.5 text-center">Edit</th>
                      <th className="py-2.5 text-center">Delete</th>
                      <th className="py-2.5 text-center">Export</th>
                      <th className="py-2.5 text-center">Approve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(['billing', 'invoices', 'inventory', 'reports', 'dashboard'] as const).map(module => (
                      <tr key={module} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-semibold text-text-primary capitalize">{module}</td>
                        {(['read', 'create', 'edit', 'delete', 'export', 'approve'] as const).map(action => (
                          <td key={action} className="py-3 text-center">
                            <input
                              type="checkbox"
                              checked={currentPermState[module][action]}
                              onChange={e => {
                                const checked = e.target.checked;
                                setCurrentPermState(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    [module]: {
                                      ...prev[module],
                                      [action]: checked
                                    }
                                  };
                                });
                              }}
                              className="w-4 h-4 rounded border-border-card bg-bg-card text-[var(--color-primary)] focus:ring-0 focus:ring-offset-0 accent-[var(--color-primary)] cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-border-card">
                <button
                  onClick={() => setPermissionsModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary hover:bg-hover-bg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={savePermissions}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold rounded-xl shadow-lg shadow-cyan-500/10 active:scale-95 transition-all text-xs cursor-pointer text-center"
                >
                  Save Access Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success logs toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle size={15} className="text-[var(--color-primary)] animate-bounce" />
          <span className="text-xs font-semibold text-text-primary">{successToast}</span>
        </div>
      )}
    </div>
  );
};
