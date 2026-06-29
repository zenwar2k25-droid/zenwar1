import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Mail, 
  MailOpen, 
  Search, 
  Trash2, 
  Phone, 
  MapPin,
  CheckCircle2,
  Clock,
  Building2,
  MoreVertical,
  Filter,
  User,
  Download
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useModal } from '../../context/ModalContext';
import type { Inquiry } from '../../data/seedData';

export const Inquiries: React.FC = () => {
  const { inquiries, markInquiryRead, markInquiryUnread, updateInquiryStatus, deleteInquiry } = useDatabase();
  const { confirm } = useModal();
  
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Read' | 'Today' | 'This Week' | 'This Month'>('All');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Counters
  const unreadCount = inquiries.filter((r: Inquiry) => r.readStatus === 'UNREAD').length;
  const readCount = inquiries.filter((r: Inquiry) => r.readStatus === 'READ').length;

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  const isThisMonth = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  // unique business types
  const businessTypes = ['All', ...Array.from(new Set(inquiries.map((i: Inquiry) => i.businessType).filter(Boolean)))];

  const filteredInquiries = useMemo(() => {
    let result = inquiries;

    // Apply Time/Read Filters
    if (filter === 'Unread') result = result.filter((r: Inquiry) => r.readStatus === 'UNREAD');
    if (filter === 'Read') result = result.filter((r: Inquiry) => r.readStatus === 'READ');
    if (filter === 'Today') result = result.filter((r: Inquiry) => isToday(r.createdAt));
    if (filter === 'This Week') result = result.filter((r: Inquiry) => isThisWeek(r.createdAt));
    if (filter === 'This Month') result = result.filter((r: Inquiry) => isThisMonth(r.createdAt));

    // Apply Business Type filter
    if (businessTypeFilter !== 'All') {
      result = result.filter((r: Inquiry) => r.businessType === businessTypeFilter);
    }

    // Apply Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r: Inquiry) => 
        r.fullName.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.mobileNumber.includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.businessName && r.businessName.toLowerCase().includes(q))
      );
    }

    return result.sort((a: Inquiry, b: Inquiry) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inquiries, filter, businessTypeFilter, searchQuery]);

  const selectedInquiry = inquiries.find((r: Inquiry) => r.id === selectedInquiryId) || null;

  const handleSelectInquiry = (id: string) => {
    setSelectedInquiryId(id);
    const inq = inquiries.find((r: Inquiry) => r.id === id);
    if (inq && inq.readStatus === 'UNREAD') {
      markInquiryRead(id);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getStatusColor = (status: Inquiry['leadStatus']) => {
    switch(status) {
      case 'New': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Contacted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Follow Up': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Converted': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Closed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Full Name', 'Business Name', 'Business Type', 'Mobile', 'Email', 'District', 'State', 'Lead Status', 'Read Status', 'Created At'];
    const rows = filteredInquiries.map((i: Inquiry) => [
      i.id, i.fullName, i.businessName || '', i.businessType || '', i.mobileNumber, i.email || '', i.district, i.state || '', i.leadStatus, i.readStatus, new Date(i.createdAt).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.map((x: any) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inquiries_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-bg-app border border-border-card rounded-2xl overflow-hidden mt-2">
      
      {/* LEFT PANEL: Filters */}
      <div className="w-full md:w-56 bg-[#0f111a] border-r border-border-card flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-border-card">
          <h2 className="text-xl font-bold text-text-primary tracking-wide font-display flex items-center gap-2">
            <Inbox size={20} className="text-cyan-400" />
            Inquiries CRM
          </h2>
        </div>
        
        <div className="p-3 flex-1 overflow-y-auto space-y-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2 mt-2">Inbox Views</div>
          
          <button onClick={() => setFilter('All')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer border-none ${filter === 'All' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-transparent text-text-secondary hover:bg-hover-bg hover:text-text-primary'}`}>
            <div className="flex items-center gap-3"><Inbox size={16} /> All Inquiries</div>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{inquiries.length}</span>
          </button>
          
          <button onClick={() => setFilter('Unread')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer border-none ${filter === 'Unread' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-transparent text-text-secondary hover:bg-hover-bg hover:text-text-primary'}`}>
            <div className="flex items-center gap-3"><Mail size={16} /> Unread</div>
            {unreadCount > 0 && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </button>
          
          <button onClick={() => setFilter('Read')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer border-none ${filter === 'Read' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-transparent text-text-secondary hover:bg-hover-bg hover:text-text-primary'}`}>
            <div className="flex items-center gap-3"><MailOpen size={16} /> Read</div>
          </button>

          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2 mt-6">Timeline</div>
          {['Today', 'This Week', 'This Month'].map(f => (
            <button key={f} onClick={() => setFilter(f as any)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer border-none ${filter === f ? 'bg-white/10 text-text-primary' : 'bg-transparent text-text-secondary hover:bg-hover-bg hover:text-text-primary'}`}>
              <Clock size={16} /> {f}
            </button>
          ))}

          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2 mt-6">Business Type</div>
          {businessTypes.map(type => (
            <button key={type} onClick={() => setBusinessTypeFilter(type as string)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer border-none ${businessTypeFilter === type ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>
              <span className="truncate">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MIDDLE PANEL: List */}
      <div className="w-full md:w-80 lg:w-[400px] border-r border-border-card flex flex-col shrink-0 bg-[#0B0D14]">
        <div className="p-4 border-b border-border-card flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Inquiries List</h3>
            <button onClick={exportCSV} title="Export CSV" className="p-1.5 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded transition-colors">
              <Download size={14} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search inquiries..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-border-card rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredInquiries.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">
              No inquiries found matching criteria.
            </div>
          ) : (
            filteredInquiries.map((inq: Inquiry) => (
              <div 
                key={inq.id}
                onClick={() => handleSelectInquiry(inq.id)}
                className={`p-4 border-b border-border-card cursor-pointer transition-colors relative ${selectedInquiryId === inq.id ? 'bg-cyan-500/10' : 'hover:bg-hover-bg'}`}
              >
                {inq.readStatus === 'UNREAD' && (
                  <div className="absolute top-4 left-3 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                )}
                
                <div className={`pl-4 ${inq.readStatus === 'UNREAD' ? 'opacity-100' : 'opacity-70'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-text-primary truncate max-w-[200px]">
                      {inq.fullName}
                    </h4>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">{formatTimeAgo(inq.createdAt)}</span>
                  </div>
                  {inq.businessName && <div className="text-xs text-text-secondary font-semibold mb-1 truncate">{inq.businessName}</div>}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${getStatusColor(inq.leadStatus)}`}>
                      {inq.leadStatus}
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">{inq.businessType || 'Other'}</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Reader */}
      <div className="flex-1 flex flex-col bg-[#0B0D14] overflow-hidden">
        {selectedInquiry ? (
          <>
            {/* Reader Header */}
            <div className="p-6 border-b border-border-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl font-bold uppercase shrink-0">
                  {selectedInquiry.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">{selectedInquiry.fullName}</h2>
                  {selectedInquiry.businessName && <p className="text-text-secondary text-sm font-semibold">{selectedInquiry.businessName}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {selectedInquiry.readStatus === 'UNREAD' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div> UNREAD
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 size={10} /> READ
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock size={10} /> Submitted: {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <select 
                  value={selectedInquiry.leadStatus}
                  onChange={(e) => updateInquiryStatus(selectedInquiry.id, e.target.value as any)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg border focus:outline-none appearance-none cursor-pointer ${getStatusColor(selectedInquiry.leadStatus)}`}
                >
                  <option value="New">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed">Closed</option>
                </select>

                {selectedInquiry.readStatus === 'READ' ? (
                  <button onClick={() => markInquiryUnread(selectedInquiry.id)} title="Mark as Unread" className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors border border-transparent">
                    <Mail size={16} />
                  </button>
                ) : (
                  <button onClick={() => markInquiryRead(selectedInquiry.id)} title="Mark as Read" className="p-2 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white rounded-lg transition-colors border border-transparent">
                    <MailOpen size={16} />
                  </button>
                )}
                <button 
                  onClick={async () => {
                    if(await confirm('Delete this inquiry?')) {
                      deleteInquiry(selectedInquiry.id);
                      setSelectedInquiryId(null);
                    }
                  }}
                  title="Delete Inquiry"
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Reader Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-black/20 custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#151822] border border-border-card rounded-xl p-5">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><User size={14}/> Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><Phone size={14} className="text-text-muted"/><span className="text-sm font-semibold text-white">{selectedInquiry.mobileNumber}</span></div>
                    {selectedInquiry.email && <div className="flex items-center gap-3"><Mail size={14} className="text-text-muted"/><span className="text-sm text-white">{selectedInquiry.email}</span></div>}
                  </div>
                </div>

                <div className="bg-[#151822] border border-border-card rounded-xl p-5">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><Building2 size={14}/> Business Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><MapPin size={14} className="text-text-muted"/><span className="text-sm text-white">{selectedInquiry.district}{selectedInquiry.state ? `, ${selectedInquiry.state}` : ''}</span></div>
                    {selectedInquiry.businessType && <div className="flex items-center gap-3"><Filter size={14} className="text-text-muted"/><span className="text-sm text-white">{selectedInquiry.businessType}</span></div>}
                  </div>
                </div>
              </div>

              <div className="bg-[#151822] border border-border-card rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Inquiry Message</h3>
                <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <MailOpen size={40} className="text-text-secondary opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No Inquiry Selected</h3>
            <p className="text-sm text-center max-w-sm">
              Select an inquiry from the list on the left to read its full contents and manage its CRM status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
