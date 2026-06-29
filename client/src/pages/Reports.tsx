import React, { useState, useMemo } from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle,
  X
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const Reports: React.FC = () => {
  const { invoices, expenses, addExpense, deleteExpense, currentUser, permissionRules, mechanics } = useDatabase();

  const activePermissions = useMemo(() => {
    if (!currentUser) return null;
    
    // 1. Check if logged in as a staff member with granular matrix permissions
    if (currentUser.mechanicId) {
      const staff = mechanics.find(m => m.id === currentUser.mechanicId);
      if (staff?.permissions) {
        return staff.permissions;
      }
    }
    
    // 2. Otherwise fall back to global role-based rule mapping
    let searchRole = currentUser.role;
    if (searchRole === 'admin') searchRole = 'Business Admin';
    if (searchRole === 'mechanic') searchRole = 'Mechanic';
    const rule = permissionRules.find(r => r.role.toLowerCase() === searchRole.toLowerCase()) || 
                 permissionRules.find(r => r.role.toLowerCase() === currentUser.role.toLowerCase());
                 
    if (rule) {
      return {
        billing: { read: rule.billing.read, create: rule.billing.create, edit: rule.billing.edit, delete: rule.billing.delete, export: rule.billing.export || false, approve: rule.billing.approve || false },
        invoices: { read: rule.invoices.read, create: rule.invoices.create, edit: rule.invoices.edit, delete: rule.invoices.delete, export: rule.invoices.export || false, approve: rule.invoices.approve || false },
        inventory: { read: rule.inventory.read, create: rule.inventory.create, edit: rule.inventory.edit, delete: rule.inventory.delete, export: rule.inventory.export || false, approve: rule.inventory.approve || false },
        reports: { read: rule.reports.read, create: rule.reports.create, edit: rule.reports.edit, delete: rule.reports.delete, export: rule.reports.export || false, approve: rule.reports.approve || false },
        dashboard: { read: rule.dashboard?.read || true, create: false, edit: false, delete: false, export: false, approve: false },
      };
    }
    
    return null;
  }, [currentUser, permissionRules, mechanics]);

  const hasAccess = activePermissions ? activePermissions.reports.read : true;
  const canCreate = activePermissions ? activePermissions.reports.create : true;
  const canDelete = activePermissions ? activePermissions.reports.delete : true;
  const canExport = activePermissions ? activePermissions.reports.export : true;
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<'Rent' | 'Utility' | 'Tools' | 'Salary' | 'Marketing' | 'Other'>('Other');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const financials = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalCollections = invoices.reduce((sum, inv) => sum + (inv.paidAmount ?? inv.total), 0);
    const outstandingBalance = invoices.reduce((sum, inv) => sum + (inv.balanceAmount ?? 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    
    return { totalRevenue, totalExpenses, netProfit, totalCollections, outstandingBalance };
  }, [invoices, expenses]);

  // Pie chart data for sales category breakdown
  const salesDistribution = useMemo(() => {
    let partsVal = 0;
    let laborVal = 0;

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.type === 'part') partsVal += (item.price * item.quantity);
        else laborVal += (item.price * item.quantity);
      });
    });

    return [
      { name: 'Spare Parts Sales', value: partsVal || 65000, color: 'var(--color-primary)' },
      { name: 'Labor Services', value: laborVal || 45000, color: 'var(--color-secondary)' }
    ];
  }, [invoices]);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || amount <= 0) return;

    addExpense({
      description: desc,
      amount,
      category
    });

    setDesc('');
    setAmount(0);
    setCategory('Other');
    setExpenseModalOpen(false);
    triggerToast('Expense item successfully logged in ledger!');
  };

  const triggerExportSim = (format: 'Excel' | 'PDF') => {
    if (!canExport) {
      triggerToast('Access Denied: Exporting financial reports is locked.');
      return;
    }
    triggerToast(`Packaging files... compiling database records.`);
    setTimeout(() => {
      triggerToast(`Success! Zenwar_${format}_Report downloaded.`);
    }, 1500);
  };

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center">
        <div className="glass-panel p-8 text-center max-w-md border-red-500/20 bg-red-950/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <X size={32} />
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">Module Access Restrict</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your current assigned role (<span className="text-red-400 font-semibold">{currentUser?.role}</span>) does not have access permissions to view the <strong>Reports & Analytics</strong> module.
          </p>
          <div className="p-3 bg-bg-card rounded-xl border border-border-card text-[10px] text-text-muted font-mono">
            Security Policy enforced by Super Admin access matrix.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and exports */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Reports & Analytics
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Audits profit spreads, expense categories, and exports records
          </p>
        </div>

        <div className="flex gap-2.5 self-start sm:self-center">
          <button 
            onClick={() => triggerExportSim('Excel')}
            className="p-3 border border-[var(--border-card)] bg-[var(--bg-card)] rounded-xl text-xs text-[var(--text-secondary)] hover:text-text-primary flex items-center justify-center gap-2 transition-all cursor-pointer font-bold"
          >
            <Download size={15} /> Export Excel
          </button>
          
          {canCreate && (
            <button 
              onClick={() => setExpenseModalOpen(true)}
              className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} /> Log Expense
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full filter blur-xl pointer-events-none" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Total Billed Revenue</span>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary mt-1.5 font-mono flex items-center gap-1">
            ₹{financials.totalRevenue.toLocaleString()}
            <TrendingUp size={18} className="text-blue-400 shrink-0" />
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-mono">Accumulated invoice clearings</p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full filter blur-xl pointer-events-none" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Total Collections</span>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary mt-1.5 font-mono flex items-center gap-1">
            ₹{financials.totalCollections.toLocaleString()}
            <TrendingUp size={18} className="text-emerald-400 shrink-0" />
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-mono">Actual money received</p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full filter blur-xl pointer-events-none" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Outstanding Balance</span>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary mt-1.5 font-mono flex items-center gap-1">
            ₹{financials.outstandingBalance.toLocaleString()}
            <TrendingDown size={18} className="text-orange-400 shrink-0" />
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-mono">Pending collections</p>
        </div>
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full filter blur-xl pointer-events-none" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Business Expenditures</span>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-text-primary mt-1.5 font-mono flex items-center gap-1">
            ₹{financials.totalExpenses.toLocaleString()}
            <TrendingDown size={18} className="text-red-400 shrink-0" />
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-mono">Logged shop expenses</p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden border-[var(--color-primary)] shadow-glow">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-primary)]/10 rounded-full filter blur-xl pointer-events-none" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Net Income Spread</span>
          <h3 className={`text-xl sm:text-2xl font-bold font-display text-text-primary mt-1.5 font-mono ${financials.netProfit >= 0 ? 'text-[var(--color-primary)]' : 'text-red-400'}`}>
            ₹{financials.netProfit.toLocaleString()}
          </h3>
          <p className="text-[10px] text-text-muted mt-2 font-mono">Total profit / loss margin</p>
        </div>
      </div>

      {/* Chart and Expense lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart distributions */}
        <div className="glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Sales Segments</h3>
            <p className="text-[10px] text-[var(--text-secondary)]">Revenue shares of spares vs labor</p>
          </div>

          <div className="h-60 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', color: 'var(--text-primary)' }} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                <Pie
                  data={salesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Table list */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Expenditure Ledger</h3>
              <p className="text-[10px] text-[var(--text-secondary)]">Itemized log of bills, rent, and payouts</p>
            </div>
          </div>

          <div className="overflow-x-auto divide-y divide-white/5 max-h-64 overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs text-text-primary uppercase">{exp.description}</h4>
                  <div className="flex gap-4 text-[10px] text-text-muted font-mono mt-1">
                    <span>Category: <strong className="text-text-secondary">{exp.category}</strong></span>
                    <span>Date: {exp.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-red-400">- ₹{exp.amount.toLocaleString()}</span>
                  {canDelete && (
                    <button 
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="py-16 text-center text-xs text-[var(--text-secondary)]">
                No expense reports logged in current cycle.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOG EXPENSE MODAL */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-sm w-full border-border-card relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setExpenseModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1.5 flex items-center gap-2">
              <DollarSign className="text-[var(--color-secondary)]" size={20} /> Log Shop Expense
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 font-mono">Deduct shop expenditures from financial ledger.</p>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Expense Description *</label>
                <input 
                  type="text" 
                  required
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="e.g. Workspace Electricity / Compressors rent"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Cost Amount (₹) *</label>
                  <input 
                    type="number" 
                    required
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    placeholder="e.g. 5000"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utility">Utility</option>
                    <option value="Tools">Tools</option>
                    <option value="Salary">Salary</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setExpenseModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs hover:bg-hover-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-orange-600 text-text-primary font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle size={15} className="text-[var(--color-primary)] animate-bounce" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
