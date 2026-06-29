import React, { useState, useMemo } from 'react';
import { 
  Printer, Search, RotateCcw, FileSpreadsheet, CheckCircle2,
  TrendingUp, TrendingDown, DollarSign, Calendar, Users, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useModal } from '../../context/ModalContext';
import { 
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';

export const RevenueAnalytics: React.FC = () => {
  const { businesses, subscriptionPlans, saPayments, invoices = [], expenses = [] } = useDatabase();
  const { alert } = useModal();

  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'gst'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  
  // Safe default arrays if not loaded or empty
  const safePayments = saPayments || [];
  const safeBusinesses = businesses || [];
  const safePlans = subscriptionPlans || [];
  const safeInvoices = invoices || [];
  const safeExpenses = expenses || [];

  const metrics = useMemo(() => {
    const totalIncome = safePayments
      .filter(tx => tx.status === 'Paid')
      .reduce((sum, tx) => sum + tx.amount, 0) + 
      safeInvoices
      .filter((inv: any) => inv.status === 'Paid')
      .reduce((sum: number, inv: any) => sum + inv.total, 0);

    const totalExpense = safeExpenses
      .filter((exp: any) => exp.status === 'Paid' || exp.status === 'Completed')
      .reduce((sum: number, exp: any) => sum + exp.amount, 0);

    const netProfit = totalIncome - totalExpense;

    const mrr = safeBusinesses
      .filter(w => w.status === 'Active')
      .reduce((sum, w) => {
        const plan = safePlans.find(p => p.id === w.planId);
        return sum + (plan?.priceMonthly || 0);
      }, 0);

    const arr = mrr * 12;

    const renewalRevenue = safePayments
      .filter(tx => tx.status === 'Paid' && tx.paymentType === 'renewal')
      .reduce((sum, tx) => sum + tx.amount, 0);

    return { totalIncome, totalExpense, netProfit, mrr, arr, renewalRevenue };
  }, [safePayments, safeBusinesses, safePlans, safeInvoices, safeExpenses]);

  const filteredTransactions = useMemo(() => {
    return safePayments.filter(tx => {
      const matchSearch = 
        (tx.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.tenantDomain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || tx.status === statusFilter;
      const matchMethod = methodFilter === 'All' || tx.paymentMethod === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [safePayments, searchTerm, statusFilter, methodFilter]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => {
      // Dummy logic for previous months + current MRR for demo
      return {
        name: month,
        income: Math.floor(Math.random() * 50000) + 20000,
        expense: Math.floor(Math.random() * 20000) + 5000
      };
    });
  }, []);

  const revenueByTier = useMemo(() => {
    const counts = { starter: 0, growth: 0, enterprise: 0, custom: 0 };
    safePayments.filter(tx => tx.status === 'Paid').forEach(tx => {
      if (tx.planId === 'starter') counts.starter += tx.amount;
      else if (tx.planId === 'growth') counts.growth += tx.amount;
      else if (tx.planId === 'enterprise') counts.enterprise += tx.amount;
      else counts.custom += tx.amount;
    });

    return [
      { name: 'Enterprise', value: counts.enterprise, color: '#8b5cf6' },
      { name: 'Growth', value: counts.growth, color: '#ff5e00' },
      { name: 'Starter', value: counts.starter, color: '#00f0ff' },
      { name: 'Custom', value: counts.custom, color: '#10b981' }
    ].filter(item => item.value > 0);
  }, [safePayments]);

  const handleExportCSV = async () => {
    if (filteredTransactions.length === 0) return await alert('No data to export');
    const headers = ['Date', 'Business', 'Domain', 'Plan', 'Payment Method', 'Transaction ID', 'Amount', 'Status'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      `"${tx.businessName}"`,
      tx.tenantDomain,
      tx.planName,
      tx.paymentMethod,
      tx.transactionId || 'N/A',
      tx.amount,
      tx.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revenue_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    await alert('PDF Export simulated successfully.');
  };

  if (safePayments.length === 0 && safeInvoices.length === 0 && safeExpenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <BarChart3 className="w-16 h-16 mb-4 text-[var(--color-primary)] opacity-50" />
        <h2 className="text-xl font-bold mb-2 text-white">No Revenue Data Available</h2>
        <p>No transactions, invoices, or expenses found in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-[var(--color-primary)]" />
            Revenue P&L Dashboard
          </h1>
          <p className="text-text-muted mt-1 text-sm">Real-time profit & loss analytics and ledger</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="px-4 py-2 border border-[var(--border-card)] text-text-secondary hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm bg-[var(--bg-app)]">
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button onClick={handleExportPDF} className="px-4 py-2 border border-[var(--border-card)] text-text-secondary hover:text-white rounded-lg transition-colors flex items-center gap-2 text-sm bg-[var(--bg-app)]">
            <Printer size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[var(--border-card)] pb-4">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[var(--color-primary)] text-black' : 'bg-[var(--bg-card)] text-text-secondary hover:text-white'}`}>Financial Overview</button>
        <button onClick={() => setActiveTab('ledger')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ledger' ? 'bg-[var(--color-primary)] text-black' : 'bg-[var(--bg-card)] text-text-secondary hover:text-white'}`}>Transaction Ledger</button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2 text-text-secondary">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">Total Income</span>
              </div>
              <div className="text-3xl font-display font-bold text-white">₹{metrics.totalIncome.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2 text-text-secondary">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium">Total Expenses</span>
              </div>
              <div className="text-3xl font-display font-bold text-white">₹{metrics.totalExpense.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-2 text-[var(--color-primary)]">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-bold">Net Profit</span>
              </div>
              <div className="text-3xl font-display font-bold text-[var(--color-primary)]">₹{metrics.netProfit.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2 text-text-secondary">
                <Calendar className="w-5 h-5 text-[var(--color-secondary)]" />
                <span className="text-sm font-medium">Monthly Recurring (MRR)</span>
              </div>
              <div className="text-3xl font-display font-bold text-white">₹{metrics.mrr.toLocaleString()}</div>
              <div className="text-xs text-text-muted mt-2">ARR: ₹{metrics.arr.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Graph */}
            <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-card)] p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Income vs Expense (Monthly)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                    <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={value => `₹${value/1000}k`} />
                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ff5e00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-6 rounded-2xl flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6">Revenue by Plan</h3>
              {revenueByTier.length > 0 ? (
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueByTier} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {revenueByTier.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString()}`} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-text-muted text-xs uppercase font-bold tracking-widest">Total</span>
                    <span className="text-white font-display font-bold text-lg">
                      ₹{revenueByTier.reduce((a,b) => a+b.value, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted">No plan data</div>
              )}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {revenueByTier.map(tier => (
                  <div key={tier.name} className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                    {tier.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-[var(--border-card)] flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search by business, domain, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-[var(--border-card)] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-[var(--color-primary)] outline-none"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black border border-[var(--border-card)] rounded-lg px-4 py-2 text-sm text-white focus:border-[var(--color-primary)] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <select 
              value={methodFilter} 
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-black border border-[var(--border-card)] rounded-lg px-4 py-2 text-sm text-white focus:border-[var(--color-primary)] outline-none"
            >
              <option value="All">All Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="sticky top-0 bg-[var(--bg-app)] z-10">
                <tr>
                  <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-[var(--border-card)]">Date</th>
                  <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-[var(--border-card)]">Business</th>
                  <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-[var(--border-card)]">Plan</th>
                  <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-[var(--border-card)]">Amount</th>
                  <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-[var(--border-card)]">Status</th>
                  <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-[var(--border-card)]">Method</th>
                  <th className="p-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-[var(--border-card)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-card)]">
                {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm text-text-secondary">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-white">{tx.businessName}</div>
                      <div className="text-xs text-text-muted">{tx.tenantDomain}</div>
                    </td>
                    <td className="p-4 text-sm text-text-secondary capitalize">{tx.planName}</td>
                    <td className="p-4 text-sm font-bold text-white">₹{tx.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        tx.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                        tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-secondary">{tx.paymentMethod}</td>
                    <td className="p-4 text-right">
                      {tx.status === 'Paid' && (
                        <button className="p-2 text-text-muted hover:text-white bg-surface-dark rounded-lg border border-[var(--border-card)] hover:border-white/20 transition-all">
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary">No transactions found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
