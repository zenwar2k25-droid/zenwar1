import React, { useMemo } from 'react';
import { 
  Users,
  Mail, 
  CreditCard, 
  Activity, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { StatCard } from '../../components/StatCard';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { businesses, saAuditLogs, subscriptionPlans, pendingRegistrations, inquiries } = useDatabase();

  const stats = useMemo(() => {
    const total = businesses.length;
    const active = businesses.filter(w => w.status === 'Active').length;
    
    // Verification metrics
    const newlyArrived = businesses.filter(w => !w.verified && w.status === 'Active').length;
    const verifiedWorkshops = businesses.filter(w => w.verified && w.status === 'Active').length;
    const pendingVerification = pendingRegistrations.length;
    const expiredWorkshops = businesses.filter(w => w.status === 'Expired').length;

    
    // MRR Calculation
    const mrr = businesses
      .filter(w => w.status === 'Active')
      .reduce((sum, w) => {
        const plan = subscriptionPlans.find(p => p.id === w.planId);
        return sum + (plan?.priceMonthly || 0);
      }, 0);

    const online = businesses.reduce((sum, w) => sum + (w.status === 'Active' ? w.activeUsers : 0), 0);
    const leadsTotal = inquiries.length;
    const leadsUnread = inquiries.filter(c => c.readStatus === 'UNREAD').length;

    return { total, active, mrr, online, newlyArrived, verifiedWorkshops, pendingVerification, expiredWorkshops, leadsTotal, leadsUnread };
  }, [businesses, subscriptionPlans, pendingRegistrations, inquiries]);

  // Chart data: Monthly Signups
  const signupData = [
    { name: 'Dec', signups: 2 },
    { name: 'Jan', signups: 5 },
    { name: 'Feb', signups: 8 },
    { name: 'Mar', signups: 11 },
    { name: 'Apr', signups: 14 },
    { name: 'May', signups: businesses.length }
  ];

  // Chart data: Revenue Growth
  const revenueData = [
    { name: 'Dec', revenue: 25000 },
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 75000 },
    { name: 'Mar', revenue: 105000 },
    { name: 'Apr', revenue: 120000 },
    { name: 'May', revenue: stats.mrr }
  ];

  // Chart data: Module utilization
  const moduleData = [
    { name: 'Billing', value: 45, color: '#00f0ff' },
    { name: 'Job Cards', value: 30, color: '#ff5e00' },
    { name: 'Inventory', value: 15, color: '#10b981' },
    { name: 'Reports', value: 10, color: '#8b5cf6' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] font-mono uppercase">
          <Cpu size={14} className="animate-spin text-cyan-400" /> Platform Controller Enabled
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display mt-1">
          Super Admin Hub
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
          System-wide SaaS telemetry, tenant operations & global access control
        </p>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Total Businesses" 
          value={stats.total} 
          icon={Users} 
          trend={{ value: '+24%', isPositive: true }}
          description="Registered business tenants"
          accentColor="blue"
          delay={0.1}
        />
        <StatCard 
          title="Active Subscriptions" 
          value={`${stats.active} / ${stats.total}`} 
          icon={CheckCircle2} 
          trend={{ value: '+12%', isPositive: true }}
          description="Non-suspended accounts"
          accentColor="green"
          delay={0.2}
        />
        <StatCard 
          title="Platform MRR" 
          value={`₹${stats.mrr.toLocaleString()}`} 
          icon={CreditCard} 
          trend={{ value: '+18.5%', isPositive: true }}
          description="Monthly Recurring Revenue"
          accentColor="orange"
          delay={0.3}
        />
        <StatCard 
          title="Active Operator Staff" 
          value={stats.online} 
          icon={Activity} 
          trend={{ value: '+45%', isPositive: true }}
          description="Live users active in businesses"
          accentColor="blue"
          delay={0.4}
        />
        <StatCard 
          title="Total Leads" 
          value={stats.leadsTotal} 
          icon={Users} 
          trend={{ value: '+15%', isPositive: true }}
          description="Inquiries from Landing Page"
          accentColor="blue"
          delay={0.5}
        />
        <StatCard 
          title="Unread Inquiries" 
          value={stats.leadsUnread} 
          icon={Mail} 
          trend={{ value: 'Action Required', isPositive: false }}
          description="Pending super admin review"
          accentColor="orange"
          delay={0.6}
        />
      </div>

      {/* Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signups Chart */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">SaaS Growth Telemetry</h3>
            <span className="text-[10px] text-[var(--color-primary)] bg-[var(--color-primary-glow)]/20 px-2 py-0.5 rounded font-mono font-bold">LIVE SIGNUPS</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupData}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="signups" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Smart Insight & Recommendations */}
        <div className="glass-panel p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-400/5 filter blur-[40px] pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-primary)] animate-pulse" />
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">AI Insights & System Health</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">SMS CREDITS EXPENDITURE</span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Precision Bikes is projected to exhaust their SMS credit quota in 4 days. Suggest an autotopup plan trigger.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-1">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block font-mono">REVENUE PREDICTION</span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  MRR is up by 18.5% this month, driven by Enterprise signups. Expected growth next month is +₹45,000.
                </p>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-[10px] uppercase rounded-xl transition-all shadow-md cursor-pointer">
            View Optimization Recommendations
          </button>
        </div>
      </div>

      {/* Revenue & Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">Revenue Growth Curve</h3>
            <span className="text-[10px] text-[var(--color-secondary)] bg-[var(--color-secondary-glow)]/20 px-2 py-0.5 rounded font-mono font-bold">MRR STACK</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-secondary)" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modules Utilisation */}
        <div className="glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display mb-2">Module Utilization Map</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Telemetry showing which SaaS tools businesses utilize the most.</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={moduleData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {moduleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border-card pt-3">
            {moduleData.map((mod) => (
              <div key={mod.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: mod.color }} />
                <span className="text-[var(--text-secondary)] font-medium truncate">{mod.name} ({mod.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live System Activity Feed */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-border-card pb-3">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-display">System Operations Log</h3>
          </div>
          <span className="text-[9px] font-mono text-text-muted">POLLING AT INTERVALS</span>
        </div>

        <div className="space-y-3.5 max-h-56 overflow-y-auto">
          {saAuditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2 p-3 rounded-xl bg-white/[0.01] border border-border-card text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <div>
                  <span className="font-semibold text-text-primary">{log.action}</span>
                  <span className="text-text-muted mx-2">on</span>
                  <span className="font-mono text-text-secondary">{log.target}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-text-muted font-mono self-end sm:self-auto">
                <span>By: {log.adminUser}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
