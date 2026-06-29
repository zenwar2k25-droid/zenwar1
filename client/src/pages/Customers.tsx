import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Car, 
  Phone, 
  Mail, 
  Gift, 
  History, 
  MessageSquare, 
  Plus, 
  X,
  FileText
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const Customers: React.FC = () => {
  const { customers, addCustomer, addVehicleToCustomer, invoices, jobCards } = useDatabase();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [vehModalOpen, setVehModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Add Customer form state
  const [newCust, setNewCust] = useState({ name: '', phone: '', email: '' });
  
  // Add Vehicle form state
  const [newVeh, setNewVeh] = useState({ make: '', model: '', plateNumber: '', year: 2022 });

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.vehicles.some(v => v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || v.model.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customers, searchQuery]);

  // Customer transactions history
  const getCustomerHistory = (custId: string) => {
    const customerInvoices = invoices.filter(inv => inv.customerId === custId);
    const customerJobs = jobCards.filter(jc => jc.customerId === custId);
    return { invoices: customerInvoices, jobs: customerJobs };
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) return;
    
    addCustomer({
      name: newCust.name,
      phone: newCust.phone,
      email: newCust.email || 'N/A',
      vehicles: []
    });

    setNewCust({ name: '', phone: '', email: '' });
    setCustModalOpen(false);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !newVeh.make || !newVeh.model || !newVeh.plateNumber) return;

    addVehicleToCustomer(selectedCustomerId, {
      make: newVeh.make,
      model: newVeh.model,
      plateNumber: newVeh.plateNumber.toUpperCase(),
      year: Number(newVeh.year)
    });

    setNewVeh({ make: '', model: '', plateNumber: '', year: 2022 });
    setVehModalOpen(false);
    setSelectedCustomerId(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Customer Directory
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Total registered clients: {customers.length}
          </p>
        </div>

        <button 
          onClick={() => setCustModalOpen(true)}
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all self-start sm:self-center cursor-pointer"
        >
          <UserPlus size={16} /> Register Customer
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter by name, phone, model or plate number..." 
          className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)]"
        />
      </div>

      {/* Customers List / Table cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCustomers.map((cust) => {
          const history = getCustomerHistory(cust.id);
          
          return (
            <div key={cust.id} className="glass-panel p-5 relative flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300">
              <div>
                {/* Header detail */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]">{cust.name}</h3>
                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 text-[11px] text-[var(--text-secondary)] mt-1">
                      <span className="flex items-center gap-1"><Phone size={12} className="text-cyan-400" /> {cust.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={12} className="text-orange-400" /> {cust.email}</span>
                    </div>
                  </div>

                  {/* Loyalty Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold font-mono">
                    <Gift size={13} /> {cust.loyaltyPoints} pts
                  </div>
                </div>

                {/* Registered Vehicles */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                    <span>Registered Vehicles ({cust.vehicles.length})</span>
                    <button 
                      onClick={() => { setSelectedCustomerId(cust.id); setVehModalOpen(true); }}
                      className="text-[var(--color-primary)] hover:underline flex items-center gap-0.5 cursor-pointer font-bold lowercase"
                    >
                      <Plus size={10} /> add vehicle
                    </button>
                  </div>

                  {cust.vehicles.length === 0 ? (
                    <p className="text-[11px] text-[var(--text-secondary)] italic">No vehicles registered yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cust.vehicles.map((v) => (
                        <div key={v.id} className="p-2 rounded-lg bg-white/5 border border-border-card flex items-center gap-2">
                          <Car size={14} className="text-[var(--color-primary)]" />
                          <div className="text-[10px]">
                            <p className="font-semibold text-[var(--text-primary)] leading-tight">{v.make} {v.model}</p>
                            <span className="font-mono text-text-muted">{v.plateNumber} ({v.year})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* History Analytics */}
                <div className="mt-4 pt-3.5 border-t border-border-card flex gap-6 text-[11px] text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <History size={13} className="text-cyan-400" />
                    <span>Jobs Logged: <strong className="text-[var(--text-primary)]">{history.jobs.length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={13} className="text-emerald-400" />
                    <span>Invoices Issued: <strong className="text-[var(--text-primary)]">{history.invoices.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* CRM Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-border-card flex gap-2">
                <a 
                  href={`tel:${cust.phone}`}
                  className="flex-1 py-2 text-center rounded-xl bg-white/5 border border-border-card hover:bg-hover-bg text-xs font-semibold text-text-primary transition-all"
                >
                  Call Client
                </a>
                <a 
                  href={`https://wa.me/${cust.phone}?text=Hello%20${encodeURIComponent(cust.name)}%2C%20this%20is%20Smart%20Garage%20notifying%20you%20regarding%20your%20vehicle...`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 text-center rounded-xl bg-[var(--color-primary-glow)] hover:bg-[var(--color-primary)]/20 border border-cyan-500/20 text-xs font-semibold text-[var(--color-primary)] flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare size={13} /> WhatsApp
                </a>
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="md:col-span-2 py-16 text-center glass-panel border-border-card space-y-2">
            <p className="text-sm text-[var(--text-secondary)]">No customers match your search criteria.</p>
            <button 
              onClick={() => setCustModalOpen(true)}
              className="text-xs text-[var(--color-primary)] underline font-semibold"
            >
              Add customer now
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: REGISTER CUSTOMER */}
      {custModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-md w-full border-border-card relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setCustModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1.5 flex items-center gap-2">
              <UserPlus className="text-[var(--color-primary)]" size={20} /> Register New Customer
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Complete the fields below to create a client profile.</p>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={newCust.name}
                  onChange={e => setNewCust({...newCust, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  maxLength={12}
                  value={newCust.phone}
                  onChange={e => setNewCust({...newCust, phone: e.target.value})}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newCust.email}
                  onChange={e => setNewCust({...newCust, email: e.target.value})}
                  placeholder="e.g. john@doe.com"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setCustModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs hover:bg-hover-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD VEHICLE */}
      {vehModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-md w-full border-border-card relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setVehModalOpen(false); setSelectedCustomerId(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1.5 flex items-center gap-2">
              <Car className="text-[var(--color-primary)]" size={20} /> Register Vehicle
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Associate a new vehicle with this customer's profile.</p>

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Make / Brand *</label>
                  <input 
                    type="text" 
                    required
                    value={newVeh.make}
                    onChange={e => setNewVeh({...newVeh, make: e.target.value})}
                    placeholder="e.g. Honda"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Model Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newVeh.model}
                    onChange={e => setNewVeh({...newVeh, model: e.target.value})}
                    placeholder="e.g. Civic"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Plate Number *</label>
                <input 
                  type="text" 
                  required
                  value={newVeh.plateNumber}
                  onChange={e => setNewVeh({...newVeh, plateNumber: e.target.value})}
                  placeholder="e.g. MH-12-AB-1234"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Manufacturing Year</label>
                <input 
                  type="number" 
                  value={newVeh.year}
                  onChange={e => setNewVeh({...newVeh, year: Number(e.target.value)})}
                  placeholder="e.g. 2022"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all text-text-primary"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setVehModalOpen(false); setSelectedCustomerId(null); }}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs hover:bg-hover-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
