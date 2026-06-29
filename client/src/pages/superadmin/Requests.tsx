import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard, 
  FileText, 
  Users, 
  Search,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const Requests: React.FC = () => {
  const { pendingRegistrations, approveRegistrationRequest, rejectRegistrationRequest, subscriptionPlans, completeRegistrationPayment } = useDatabase();
  
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected' | 'Payment Pending' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [requestToApprove, setRequestToApprove] = useState<any | null>(null);
  const [requestToReject, setRequestToReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Quick payment simulation for dev/testing
  const [requestToPay, setRequestToPay] = useState<any | null>(null);

  const filteredRequests = pendingRegistrations.filter(req => {
    if (filter === 'Pending' && req.requestStatus !== 'Submitted' && req.requestStatus !== 'Under Review') return false;
    if (filter === 'Approved' && req.requestStatus !== 'Approved') return false;
    if (filter === 'Rejected' && req.requestStatus !== 'Rejected') return false;
    if (filter === 'Payment Pending' && req.requestStatus !== 'Approved' && req.paymentStatus === 'PENDING_PAYMENT') return false; 
    if (filter === 'Completed' && req.requestStatus !== 'Business Created') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!req.businessName.toLowerCase().includes(q) &&
          !req.ownerName.toLowerCase().includes(q) &&
          !req.mobile.includes(q) &&
          !req.email.toLowerCase().includes(q) &&
          !req.tenantDomain.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const stats = {
    total: pendingRegistrations.length,
    pending: pendingRegistrations.filter(r => r.requestStatus === 'Pending Approval').length,
    approved: pendingRegistrations.filter(r => r.requestStatus === 'Approved').length,
    rejected: pendingRegistrations.filter(r => r.requestStatus === 'Rejected').length,
    paymentPending: pendingRegistrations.filter(r => r.paymentStatus === 'PENDING_PAYMENT').length,
    converted: pendingRegistrations.filter(r => r.requestStatus === 'Business Created').length
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Submitted':
      case 'Under Review': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Business Created': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      default: return 'text-text-secondary bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-wide font-display">Registration Requests</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage, approve, and track incoming SaaS business registrations.</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <FileText size={20} className="text-text-secondary mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Total Requests</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <Clock size={20} className="text-orange-400 mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.pending}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Pending Review</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <CheckCircle2 size={20} className="text-emerald-400 mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.approved}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Approved</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <XCircle size={20} className="text-red-400 mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.rejected}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Rejected</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
          <CreditCard size={20} className="text-yellow-400 mb-2" />
          <div className="text-2xl font-bold text-text-primary">{stats.paymentPending}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Pending Payment</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center border-cyan-500/30">
          <Users size={20} className="text-cyan-400 mb-2" />
          <div className="text-2xl font-bold text-cyan-400">{stats.converted}</div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">Converted</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-[var(--surface-light)] rounded-xl p-1 border border-border-card overflow-x-auto w-full sm:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected', 'Payment Pending', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
                filter === tab 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-text-primary shadow-sm border border-border-card' 
                  : 'bg-transparent text-[var(--text-secondary)] hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-light)] border border-border-card rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRequests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-panel p-12 text-center flex flex-col items-center justify-center border-border-card"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <FileText size={24} className="text-text-muted" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">No Requests Found</h3>
              <p className="text-sm text-text-secondary">There are no registration requests matching your filters.</p>
            </motion.div>
          ) : (
            filteredRequests.map((req) => {
              const plan = subscriptionPlans.find(p => p.id === req.selectedPlan);
              return (
                <motion.div
                  key={req.registrationId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel p-5 border border-border-card hover:border-border-card transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div>
                      <div className="text-xs text-text-muted mb-1 uppercase tracking-widest font-bold">Business</div>
                      <div className="font-bold text-text-primary">{req.businessName}</div>
                      <div className="text-xs text-cyan-400 font-mono mt-0.5">{req.tenantDomain}</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1 uppercase tracking-widest font-bold">Applicant</div>
                      <div className="text-sm text-text-secondary">{req.ownerName}</div>
                      <div className="text-xs text-text-secondary mt-0.5">{req.mobile}</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1 uppercase tracking-widest font-bold">Subscription</div>
                      <div className="text-sm text-text-primary font-bold uppercase">{plan?.name || req.selectedPlan}</div>
                      <div className="text-xs text-violet-400 mt-0.5">{req.duration} {req.subscriptionType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1 uppercase tracking-widest font-bold">Amount</div>
                      <div className="text-sm text-text-primary font-mono font-bold">₹{req.totalAmount?.toLocaleString() || 0}</div>
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusColor(req.requestStatus || 'Pending Approval')}`}>
                          {req.requestStatus || 'Pending Approval'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-border-card pt-4 md:pt-0">
                    {(req.requestStatus === 'Pending Approval') && (
                      <>
                        <button
                          onClick={() => setRequestToApprove(req)}
                          className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setRequestToReject(req)}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                    
                    {req.requestStatus === 'Approved' && (
                      <button
                        onClick={() => setRequestToPay(req)}
                        className="flex-1 md:flex-none px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CreditCard size={14} /> Simulate Payment
                      </button>
                    )}

                    {req.requestStatus === 'Business Created' && (
                      <button
                        className="flex-1 md:flex-none px-4 py-2 bg-white/5 text-text-secondary border border-border-card rounded-lg text-xs font-bold uppercase opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {requestToApprove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRequestToApprove(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f111a] border border-border-card rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary text-center mb-2">Approve Business & Create Tenant?</h3>
              <p className="text-sm text-text-secondary text-center mb-6">Are you sure you want to approve this request? This will create a production tenant database and activate the business.</p>
              
              <div className="bg-black/30 p-4 rounded-xl border border-border-card mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Business</span>
                  <span className="text-text-primary font-bold">{requestToApprove.businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Plan</span>
                  <span className="text-text-primary font-bold uppercase">{requestToApprove.selectedPlan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Duration</span>
                  <span className="text-text-primary font-bold">{requestToApprove.duration} {requestToApprove.subscriptionType}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRequestToApprove(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border-card text-text-primary font-bold hover:bg-hover-bg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    approveRegistrationRequest(requestToApprove.registrationId);
                    setRequestToApprove(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reject Modal */}
        {requestToReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRequestToReject(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f111a] border border-border-card rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <AlertCircle className="text-red-400" />
                  Reject Request
                </h3>
                <button onClick={() => setRequestToReject(null)} className="text-text-muted hover:text-text-primary cursor-pointer"><X size={20} /></button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Reason For Rejection</label>
                  <select 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-black/30 border border-border-card rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Invalid Information">Invalid Information</option>
                    <option value="Duplicate Business">Duplicate Business</option>
                    <option value="Spam/Bot">Spam / Bot Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRequestToReject(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border-card text-text-primary font-bold hover:bg-hover-bg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectionReason}
                  onClick={() => {
                    rejectRegistrationRequest(requestToReject.registrationId, rejectionReason);
                    setRequestToReject(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-50 text-text-primary font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Simulate Payment Modal */}
        {requestToPay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRequestToPay(null)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f111a] border border-border-card rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 mx-auto">
                <CreditCard size={30} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Process Payment & Create Business</h3>
              <p className="text-sm text-text-secondary mb-6">In a real scenario, the user pays via link. This simulates a successful payment and executes the final Tenant creation.</p>
              
              <button
                onClick={() => {
                  completeRegistrationPayment(requestToPay.registrationId);
                  setRequestToPay(null);
                }}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] cursor-pointer"
              >
                Simulate Success
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
