import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  X, 
  Send, 
  Plus, 
  Smartphone,
  CheckCircle
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const Appointments: React.FC = () => {
  const { 
    appointments, 
    addAppointment, 
    updateAppointment, 
    addJobCard,
    mechanics 
  } = useDatabase();

  // Active date filter state
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modal Creator States
  const [bookOpen, setBookOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [smsPreview, setSmsPreview] = useState<{ isOpen: boolean; phone: string; name: string; text: string } | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [serviceType, setServiceType] = useState('Standard Lubricant Maintenance');
  const [slotTime, setSlotTime] = useState('09:00 AM - 10:30 AM');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const timeSlots = [
    '09:00 AM - 10:30 AM',
    '10:30 AM - 12:00 PM',
    '12:00 PM - 01:30 PM',
    '02:30 PM - 04:00 PM',
    '04:00 PM - 05:30 PM',
    '05:30 PM - 07:00 PM'
  ];

  // Group appointments by date
  const filteredAppointments = useMemo(() => {
    return appointments.filter(ap => ap.date === selectedDate);
  }, [appointments, selectedDate]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone || !vehicleInfo) return;

    addAppointment({
      customerName: clientName,
      phone,
      vehicleInfo,
      serviceType,
      date: selectedDate,
      slot: slotTime
    });

    setClientName('');
    setPhone('');
    setVehicleInfo('');
    setBookOpen(false);
    triggerToast('Appointment slot scheduled successfully!');
  };

  const handleDispatchSms = (ap: any) => {
    const textMsg = `Hi ${ap.customerName}, your service appointment at Zenwar is confirmed for ${ap.date} at ${ap.slot.split(' ')[0]}. Support hotline: +1 (555) 762-4369.`;
    setSmsPreview({
      isOpen: true,
      phone: ap.phone,
      name: ap.customerName,
      text: textMsg
    });
  };

  const triggerMockSmsSend = () => {
    setSmsPreview(null);
    triggerToast('SMS Reminder successfully transmitted to network node.');
  };

  const handleCheckIn = (ap: any) => {
    updateAppointment(ap.id, { status: 'Checked In' });
    
    // Auto-convert to a Job Card!
    // Try to split vehicleInfo e.g. "Audi R8 (MH-12)"
    const plates = ap.vehicleInfo.match(/\(([^)]+)\)/);
    const plateNum = plates ? plates[1] : 'MOCK-REG';
    const makeModel = ap.vehicleInfo.replace(/\([^)]+\)/, '').trim();

    addJobCard({
      customerId: 'c-1', // Fallback default
      customerName: ap.customerName,
      phone: ap.phone,
      vehicleId: `v-${Date.now()}`,
      vehicleMake: makeModel.split(' ')[0] || 'Car',
      vehicleModel: makeModel.split(' ').slice(1).join(' ') || 'Model',
      plateNumber: plateNum,
      complaints: [ap.serviceType],
      assignedMechanicId: mechanics[0]?.id || 'm-1',
      checklist: [
        { id: 'ap-chk-1', label: 'Initial Booking Diagnostic Check', checked: true },
        { id: 'ap-chk-2', label: 'Brake pads inspection', checked: false }
      ],
      deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      costEstimation: 3500,
      notes: `Spawned automatically from Checked-In Appointment ${ap.id}.`
    });

    triggerToast(`Customer checked in. Job Card spawned automatically!`);
  };

  // Helper date lists for tabs (next 5 days)
  const dateTabs = useMemo(() => {
    const list = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        fullIso: d.toISOString().split('T')[0]
      });
    }
    return list;
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Service Scheduler
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Allocate entry slots & trigger reminder dispatches
          </p>
        </div>

        <button 
          onClick={() => setBookOpen(true)}
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus size={16} /> Block Booking Slot
        </button>
      </div>

      {/* Date tabs select bar */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full">
        {dateTabs.map((dt) => (
          <button
            key={dt.fullIso}
            onClick={() => setSelectedDate(dt.fullIso)}
            className={`px-4 py-3 rounded-xl flex flex-col items-center justify-center min-w-[70px] transition-all cursor-pointer border ${selectedDate === dt.fullIso 
              ? 'bg-[var(--color-primary-glow)] text-[var(--color-primary)] border-cyan-500/30 shadow-glow' 
              : 'bg-white/5 border-transparent text-[var(--text-secondary)] hover:text-text-primary'}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider">{dt.dayStr}</span>
            <span className="text-base font-extrabold mt-1 font-mono">{dt.dateNum}</span>
          </button>
        ))}
      </div>

      {/* Slots details lists grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timeSlots.map((slot) => {
          // Check if slot has a booking
          const bookedAp = filteredAppointments.find(ap => ap.slot === slot);
          
          return (
            <div 
              key={slot}
              className={`glass-panel p-4 flex flex-col justify-between min-h-[160px] border ${bookedAp 
                ? bookedAp.status === 'Checked In' ? 'border-cyan-500/25 bg-cyan-950/5'
                  : bookedAp.status === 'Completed' ? 'border-emerald-500/25 bg-emerald-950/5'
                  : 'border-border-card'
                : 'border-border-card border-dashed border-2 hover:border-[var(--color-primary)] bg-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-text-muted font-mono flex items-center gap-1">
                  <Clock size={11} className="text-[var(--color-primary)] shrink-0" /> {slot}
                </span>

                {bookedAp ? (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${bookedAp.status === 'Checked In' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : bookedAp.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-gray-500/10 text-text-secondary border border-gray-500/20'}`}>
                    {bookedAp.status}
                  </span>
                ) : (
                  <span className="text-[9px] text-emerald-400 font-bold uppercase font-mono">VACANT</span>
                )}
              </div>

              {bookedAp ? (
                /* Booked card detail */
                <div className="mt-3.5 space-y-2">
                  <div>
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5"><User size={12} className="text-cyan-400" /> {bookedAp.customerName}</h4>
                    <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">{bookedAp.vehicleInfo}</p>
                  </div>
                  <div className="text-[10px] text-text-secondary leading-normal bg-white/[0.01] p-2 rounded-lg border border-border-card truncate">
                    {bookedAp.serviceType}
                  </div>
                </div>
              ) : (
                /* Vacant click to schedule */
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => { setSlotTime(slot); setBookOpen(true); }}
                    className="text-[10px] text-[var(--color-primary)] hover:underline font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <Plus size={11} /> Allocate Slot
                  </button>
                </div>
              )}

              {/* Card Action options */}
              {bookedAp && (
                <div className="mt-4 pt-3.5 border-t border-border-card flex gap-2">
                  {bookedAp.status === 'Scheduled' && (
                    <>
                      <button 
                        onClick={() => handleCheckIn(bookedAp)}
                        className="flex-1 py-1.5 rounded-lg bg-[var(--color-primary-glow)] hover:bg-[var(--color-primary)]/20 border border-cyan-500/20 text-[9px] font-extrabold text-[var(--color-primary)] transition-all cursor-pointer"
                      >
                        Check In & Card
                      </button>
                      <button 
                        onClick={() => handleDispatchSms(bookedAp)}
                        className="p-1.5 rounded-lg bg-white/5 border border-border-card hover:bg-hover-bg text-text-secondary hover:text-text-primary transition-all cursor-pointer flex items-center justify-center"
                        title="Send Reminder"
                      >
                        <Smartphone size={13} />
                      </button>
                    </>
                  )}
                  {bookedAp.status === 'Checked In' && (
                    <button 
                      onClick={() => updateAppointment(bookedAp.id, { status: 'Completed' })}
                      className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-[9px] font-extrabold text-emerald-400 transition-all cursor-pointer"
                    >
                      Mark Finished
                    </button>
                  )}
                  {bookedAp.status === 'Completed' && (
                    <div className="w-full text-center text-[9px] font-bold text-text-muted uppercase flex items-center justify-center gap-1 py-1">
                      <CheckCircle size={10} className="text-emerald-400" /> repairs completed
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SMS MODAL PREVIEW SIMULATOR */}
      {smsPreview && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="glass-panel p-6 max-w-sm w-full border-border-card relative text-center space-y-4 animate-in zoom-in-95 duration-200 bg-[#080911]">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Smartphone size={15} className="text-[var(--color-primary)]" /> SMS Dispatch Terminal
            </h4>
            
            {/* Phone screen simulation */}
            <div className="p-4 rounded-2xl bg-black border border-border-card text-left font-sans space-y-3">
              <div className="text-[10px] text-gray-600 font-mono flex justify-between">
                <span>To: {smsPreview.phone}</span>
                <span>Carrier Mock</span>
              </div>
              <div className="p-3 bg-[#1e293b] rounded-2xl rounded-tl-none text-[11px] leading-relaxed text-text-primary">
                {smsPreview.text}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button 
                onClick={() => setSmsPreview(null)}
                className="w-1/3 py-2 bg-white/5 border border-border-card text-text-primary rounded-lg text-xs font-semibold hover:bg-hover-bg cursor-pointer"
              >
                Dismiss
              </button>
              <button 
                onClick={triggerMockSmsSend}
                className="w-2/3 py-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Send size={12} /> Dispatch SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-md w-full border-border-card relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setBookOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1.5 flex items-center gap-2">
              <Calendar className="text-[var(--color-primary)]" size={20} /> Block Timing Slot
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Book a repair bay and time for Date: {selectedDate}</p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Customer Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g. Emma Watson"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Mobile Contact Phone *</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 8765432109"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Vehicle Description *</label>
                <input 
                  type="text" 
                  required
                  value={vehicleInfo}
                  onChange={e => setVehicleInfo(e.target.value)}
                  placeholder="e.g. Tesla Model S (DL-3C-AS-4567)"
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Timing Grid Slot</label>
                  <select
                    value={slotTime}
                    onChange={e => setSlotTime(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Service category</label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none"
                  >
                    <option value="Periodic Oil Refill Package">Periodic Oil Refill</option>
                    <option value="Brake system diagnostics">Brake Servicing</option>
                    <option value="Electrical Tuning & HVAC check">Electrical & HVAC</option>
                    <option value="Suspension Alignment check">Suspension Check</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-border-card">
                <button 
                  type="button" 
                  onClick={() => setBookOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs hover:bg-hover-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 glass-panel border-[var(--color-primary)] px-4 py-3 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 z-50">
          <CheckCircle size={15} className="text-[var(--color-primary)] animate-bounce" />
          <span className="text-xs font-semibold text-text-primary">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
