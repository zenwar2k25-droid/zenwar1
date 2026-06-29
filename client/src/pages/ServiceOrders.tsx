import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  ClipboardCheck, 
  Upload, 
  X
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useTerminology } from '../hooks/useTerminology';
import type { ChecklistItem } from '../data/seedData';

export const ServiceOrders: React.FC = () => {
  const { 
    jobCards, 
    mechanics, 
    customers, 
    addJobCard, 
    updateJobCard 
  } = useDatabase();

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected job card panel
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobCards[0]?.id || null);

  // Modal / Creator State
  const [creatorOpen, setCreatorOpen] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [complaints, setComplaints] = useState<string[]>([]);
  const [assignedMechanicId, setAssignedMechanicId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [costEstimation, setCostEstimation] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Image Upload Animation Simulators
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const activeJob = useMemo(() => {
    return jobCards.find(jc => jc.id === selectedJobId) || null;
  }, [jobCards, selectedJobId]);

  const filteredJobs = useMemo(() => {
    return jobCards.filter(jc => 
      jc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jc.id.includes(searchQuery)
    );
  }, [jobCards, searchQuery]);

  // Handle customer select in form
  const formCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleAddComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText) return;
    setComplaints([...complaints, complaintText]);
    setComplaintText('');
  };

  const handleRemoveComplaint = (idx: number) => {
    setComplaints(complaints.filter((_, i) => i !== idx));
  };

  const handleCreateJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedVehicleId || !assignedMechanicId) return;

    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    const selectedVeh = selectedCust?.vehicles.find(v => v.id === selectedVehicleId);

    const initialChecklist: ChecklistItem[] = [
      { id: 'chk-t-1', label: 'OBD Diagnostics Scan', checked: false },
      { id: 'chk-t-2', label: 'Fluid Levels Checked', checked: false },
      { id: 'chk-t-3', label: 'Brake Wear Inspection', checked: false },
      { id: 'chk-t-4', label: 'Electrical Wiring Audit', checked: false },
      { id: 'chk-t-5', label: 'Wiper & Light Functional Check', checked: false },
    ];

    const newJob = addJobCard({
      customerId: selectedCustomerId,
      customerName: selectedCust?.name || '',
      phone: selectedCust?.phone || '',
      vehicleId: selectedVehicleId,
      vehicleMake: selectedVeh?.make || '',
      vehicleModel: selectedVeh?.model || '',
      plateNumber: selectedVeh?.plateNumber || '',
      complaints: complaints.length > 0 ? complaints : ['General inspection'],
      assignedMechanicId,
      checklist: initialChecklist,
      deliveryDate: deliveryDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      costEstimation: costEstimation || 2500,
      notes: notes || 'N/A'
    });

    // Reset Form
    setSelectedCustomerId('');
    setSelectedVehicleId('');
    setComplaints([]);
    setAssignedMechanicId('');
    setDeliveryDate('');
    setCostEstimation(0);
    setNotes('');
    setCreatorOpen(false);
    setSelectedJobId(newJob.id);
  };

  const handleChecklistToggle = (itemId: string, currentVal: boolean) => {
    if (!activeJob) return;
    const updatedChecklist = activeJob.checklist.map(chk => 
      chk.id === itemId ? { ...chk, checked: !currentVal } : chk
    );
    updateJobCard(activeJob.id, { checklist: updatedChecklist });
  };

  const handleStatusTransition = (nextStatus: 'Diagnosing' | 'In Progress' | 'Quality Check' | 'Ready' | 'Delivered') => {
    if (!activeJob) return;
    updateJobCard(activeJob.id, { status: nextStatus });
  };

  // Image Upload System (Refs & Handlers)
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const triggerImageUpload = (type: 'before' | 'after') => {
    if (type === 'before') {
      beforeInputRef.current?.click();
    } else {
      afterInputRef.current?.click();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    if (!activeJob || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (type === 'before') {
      setUploadingBefore(true);
    } else {
      setUploadingAfter(true);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setTimeout(() => {
        if (type === 'before') {
          setUploadingBefore(false);
          updateJobCard(activeJob.id, { beforeImage: dataUrl });
        } else {
          setUploadingAfter(false);
          updateJobCard(activeJob.id, { afterImage: dataUrl });
        }
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const getStatusStepIndex = (status: string) => {
    const steps = ['Diagnosing', 'In Progress', 'Quality Check', 'Ready', 'Delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header and Creator Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-display">
            Active Job Cards
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Track repair progressions & mechanics assignments
          </p>
        </div>

        <button 
          onClick={() => setCreatorOpen(true)}
          className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:brightness-110 text-text-primary font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus size={16} /> Open Intake Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Cards List & Search */}
        <div className="space-y-4 lg:col-span-1">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, plate..." 
              className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[var(--color-primary)] transition-all placeholder:text-[var(--text-secondary)]"
            />
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredJobs.map((job) => {
              const isActive = job.id === selectedJobId;
              const statusColors = {
                'Diagnosing': 'border-blue-500/30 text-blue-400 bg-blue-500/5',
                'In Progress': 'border-orange-500/30 text-orange-400 bg-orange-500/5',
                'Quality Check': 'border-purple-500/30 text-purple-400 bg-purple-500/5',
                'Ready': 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
                'Delivered': 'border-gray-500/30 text-text-secondary bg-gray-500/5',
              };

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`glass-panel p-4 cursor-pointer transition-all border ${isActive ? 'border-[var(--color-primary)] bg-[var(--color-primary-glow)]/10 shadow-glow' : 'border-border-card hover:border-border-card'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-text-muted font-mono font-bold uppercase">{job.id}</span>
                      <h4 className="font-bold text-xs text-[var(--text-primary)] mt-0.5">{job.vehicleMake} {job.vehicleModel}</h4>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">Client: {job.customerName}</p>
                  <div className="flex justify-between items-center text-[10px] text-text-muted mt-3 pt-2.5 border-t border-border-card font-mono">
                    <span>Plate: <strong className="text-cyan-400">{job.plateNumber}</strong></span>
                    <span>Est: ₹{job.costEstimation.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="py-12 text-center text-xs text-[var(--text-secondary)] glass-panel border-border-card">
                No job cards found matching queries.
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Active Job Card Details Board */}
        <div className="lg:col-span-2">
          {activeJob ? (
            <div className="glass-panel p-5 sm:p-6 space-y-6">
              {/* Detailed panel header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-border-card pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-text-muted">{activeJob.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Logged on {new Date(activeJob.dateCreated).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-xl font-bold text-text-primary mt-1">{activeJob.vehicleMake} {activeJob.vehicleModel}</h2>
                  <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">Registration Plate: <strong className="text-cyan-400">{activeJob.plateNumber}</strong></p>
                </div>

                {/* Status operations panel */}
                <div className="flex flex-wrap gap-2">
                  {activeJob.status === 'Diagnosing' && (
                    <button onClick={() => handleStatusTransition('In Progress')} className="bg-[var(--color-secondary-glow)] border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)] hover:text-text-primary text-[var(--color-secondary)] font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer">
                      Start Repairs →
                    </button>
                  )}
                  {activeJob.status === 'In Progress' && (
                    <button onClick={() => handleStatusTransition('Quality Check')} className="bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500 hover:text-text-primary text-purple-400 font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer">
                      Submit for QA check →
                    </button>
                  )}
                  {activeJob.status === 'Quality Check' && (
                    <button onClick={() => handleStatusTransition('Ready')} className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-text-primary text-emerald-400 font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer">
                      Mark Ready for Delivery ✓
                    </button>
                  )}
                  {activeJob.status === 'Ready' && (
                    <button onClick={() => handleStatusTransition('Delivered')} className="bg-gray-500/10 border border-gray-500/20 hover:bg-gray-700 hover:text-text-primary text-text-secondary font-bold text-[10px] px-3 py-2 rounded-xl transition-all cursor-pointer">
                      Dispatch & Deliver Slip ✓
                    </button>
                  )}
                  {activeJob.status === 'Delivered' && (
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] px-3 py-2 rounded-xl">
                      Delivered & Invoiced
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="grid grid-cols-5 text-center relative pt-4">
                <div className="absolute top-7 left-[10%] right-[10%] h-[2px] bg-white/5 z-0" />
                <div 
                  className="absolute top-7 left-[10%] h-[2px] bg-[var(--color-primary)] transition-all duration-500 z-0"
                  style={{ width: `${(getStatusStepIndex(activeJob.status) / 4) * 80}%` }}
                />
                
                {['Diagnosing', 'In Progress', 'QA Check', 'Ready', 'Delivered'].map((step, idx) => {
                  const currentIdx = getStatusStepIndex(activeJob.status);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${isDone ? 'border-[var(--color-primary)] bg-[var(--bg-app)] text-[var(--color-primary)] shadow-glow' : 'border-border-card bg-[#0a0b12] text-gray-600'} ${isCurrent ? 'scale-110 border-orange-500 text-orange-400' : ''}`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[9px] mt-2.5 font-bold uppercase tracking-wider hidden sm:block ${isCurrent ? 'text-orange-400' : isDone ? 'text-[var(--text-primary)]' : 'text-gray-600'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>

              {/* Complaints & Notes & Mechanics allocation info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-card pt-5 text-xs">
                {/* Mechanic & Customer details */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px]">Business Allocations</h4>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-border-card space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Assigned Mechanic:</span>
                      <span className="font-semibold text-text-primary">
                        {mechanics.find(m => m.id === activeJob.assignedMechanicId)?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Client:</span>
                      <span className="font-semibold text-text-primary">{activeJob.customerName} ({activeJob.phone})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Target Delivery:</span>
                      <span className="font-semibold text-orange-400 flex items-center gap-1"><Calendar size={13} /> {activeJob.deliveryDate}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] mb-2">Customer Complaints</h4>
                    <ul className="space-y-2">
                      {activeJob.complaints.map((comp, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-xs text-text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          <span>{comp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Service checklist controls */}
                <div className="space-y-4">
                  <h4 className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <ClipboardCheck size={14} className="text-[var(--color-primary)]" /> Diagnostic Checklist
                  </h4>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-border-card space-y-3">
                    {activeJob.checklist.map((chk) => (
                      <label 
                        key={chk.id}
                        className={`flex items-center gap-3 py-1 text-xs cursor-pointer select-none transition-all ${chk.checked ? 'text-text-secondary line-through' : 'text-text-primary hover:text-[var(--color-primary)]'}`}
                      >
                        <input 
                          type="checkbox"
                          checked={chk.checked}
                          disabled={activeJob.status === 'Delivered'}
                          onChange={() => handleChecklistToggle(chk.id, chk.checked)}
                          className="rounded border-border-card text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                        />
                        <span>{chk.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Before/After upload simulation block */}
              <div className="border-t border-border-card pt-5 space-y-4 text-xs">
                <h4 className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px]">Before / After Visual Audits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before card */}
                  <div className="p-3.5 rounded-xl border border-border-card bg-white/[0.01] flex flex-col items-center justify-center min-h-[140px] text-center relative group overflow-hidden">
                    {activeJob.beforeImage ? (
                      <>
                        <img src={activeJob.beforeImage} alt="Before repairs" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-bg-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => triggerImageUpload('before')} className="px-3 py-1.5 bg-white text-black font-bold text-[10px] rounded-lg cursor-pointer">Re-upload Before</button>
                        </div>
                        <span className="absolute bottom-2.5 left-2.5 bg-black/60 border border-border-card px-2 py-0.5 rounded text-[9px] font-bold text-text-primary tracking-widest uppercase">BEFORE REPAIR</span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        {uploadingBefore ? (
                          <div className="space-y-2">
                            <span className="animate-spin text-cyan-400 block text-lg font-bold">⚙️</span>
                            <span className="text-[10px] text-text-muted">Transmitting photo...</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={22} className="text-text-muted mb-2" />
                            <button onClick={() => triggerImageUpload('before')} className="text-[11px] text-[var(--color-primary)] hover:underline font-bold cursor-pointer">Upload Intake Photo</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* After card */}
                  <div className="p-3.5 rounded-xl border border-border-card bg-white/[0.01] flex flex-col items-center justify-center min-h-[140px] text-center relative group overflow-hidden">
                    {activeJob.afterImage ? (
                      <>
                        <img src={activeJob.afterImage} alt="After repairs" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-bg-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => triggerImageUpload('after')} className="px-3 py-1.5 bg-white text-black font-bold text-[10px] rounded-lg cursor-pointer">Re-upload After</button>
                        </div>
                        <span className="absolute bottom-2.5 left-2.5 bg-black/60 border border-border-card px-2 py-0.5 rounded text-[9px] font-bold text-text-primary tracking-widest uppercase">AFTER REPAIR (QA)</span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        {uploadingAfter ? (
                          <div className="space-y-2">
                            <span className="animate-spin text-cyan-400 block text-lg font-bold">⚙️</span>
                            <span className="text-[10px] text-text-muted">Transmitting photo...</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={22} className="text-text-muted mb-2" />
                            <button 
                              disabled={activeJob.status === 'Diagnosing'}
                              onClick={() => triggerImageUpload('after')} 
                              className="text-[11px] text-[var(--color-primary)] hover:underline font-bold cursor-pointer disabled:opacity-40 disabled:no-underline"
                            >
                              Upload Outgoing Photo
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center glass-panel border-border-card text-xs text-[var(--text-secondary)]">
              No active job cards. Register new ones or check queries.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE JOB CARD INTAKE */}
      {creatorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 max-w-lg w-full border-border-card relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setCreatorOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-hover-bg text-[var(--text-secondary)] hover:text-text-primary transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1.5 flex items-center gap-2">
              <Plus className="text-[var(--color-primary)]" size={20} /> Open Job Card Intake
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Initialize diagnosis cards for vehicles entering shop bays.</p>

            <form onSubmit={handleCreateJobCard} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer selection */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Select Customer *</label>
                  <select
                    value={selectedCustomerId}
                    required
                    onChange={e => {
                      setSelectedCustomerId(e.target.value);
                      setSelectedVehicleId('');
                    }}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Select Vehicle Plate *</label>
                  <select
                    value={selectedVehicleId}
                    required
                    disabled={!selectedCustomerId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all disabled:opacity-40"
                  >
                    <option value="">-- Choose Plate --</option>
                    {formCustomer?.vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} — {v.plateNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mechanic Allocator */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Assign Service Tech *</label>
                <select
                  value={assignedMechanicId}
                  required
                  onChange={e => setAssignedMechanicId(e.target.value)}
                  className="w-full bg-bg-card border border-border-card rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                >
                  <option value="">-- Choose Mechanic --</option>
                  {mechanics.filter(m => m.attendance === 'Present' || m.attendance === 'Late').map(mech => (
                    <option key={mech.id} value={mech.id}>{mech.name} ({mech.role} — active tasks: {mech.tasksAssigned})</option>
                  ))}
                </select>
              </div>

              {/* Customer Complaints add logic */}
              <div className="space-y-2 border-t border-border-card pt-3">
                <label className="text-xs font-semibold text-text-secondary block">Customer Complaints & Symptoms</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={complaintText}
                    onChange={e => setComplaintText(e.target.value)}
                    placeholder="e.g. White smoke from exhaust / engine knocking"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAddComplaint}
                    className="px-3.5 py-2 bg-[var(--color-primary-glow)] border border-cyan-500/20 text-[var(--color-primary)] rounded-xl text-xs font-bold hover:bg-[var(--color-primary)]/20 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {complaints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-border-card bg-white/[0.01]">
                    {complaints.map((comp, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-[10px] font-medium bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg">
                        {comp}
                        <button type="button" onClick={() => handleRemoveComplaint(idx)} className="text-red-400 hover:text-red-200 cursor-pointer"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-card pt-3">
                {/* Cost Estimation */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Estimated Cost (₹)</label>
                  <input 
                    type="number"
                    value={costEstimation || ''}
                    onChange={e => setCostEstimation(Number(e.target.value))}
                    placeholder="e.g. 5000"
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Target Delivery Date</label>
                  <input 
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
              </div>

              {/* Extra Notes */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Diagnostic Intake Notes</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional inspection specifications..."
                  className="w-full bg-bg-card border border-border-card rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-border-card">
                <button 
                  type="button" 
                  onClick={() => setCreatorOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-border-card text-text-primary font-semibold text-xs hover:bg-hover-bg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-text-primary font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Open Intake Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden file inputs for image uploads */}
      <input 
        type="file" 
        ref={beforeInputRef}
        onChange={(e) => handleImageFileChange(e, 'before')}
        accept="image/*"
        className="hidden"
      />
      <input 
        type="file" 
        ref={afterInputRef}
        onChange={(e) => handleImageFileChange(e, 'after')}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
