import React, { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle2, Send, Building2, User, FileText } from 'lucide-react';
import type { BranchLocation } from '../../data/seedData';
import { useDatabase } from '../../context/DatabaseContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  branches: BranchLocation[];
}

export const ContactSection: React.FC<Props> = ({ branches }) => {
  const { submitInquiry } = useDatabase();
  const hq = branches.find(b => b.order === 0) || branches[0];
  const center = hq ? [hq.lat, hq.lng] : [20.5937, 78.9629];

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    businessType: 'Retail Garage',
    mobileNumber: '',
    email: '',
    district: '',
    state: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      submitInquiry({
        ...formData
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        fullName: '', businessName: '', businessType: 'Retail Garage',
        mobileNumber: '', email: '', district: '', state: '', message: ''
      });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-app to-bg-primary" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-text-primary uppercase tracking-tight mb-4">
            Contact Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">Team</span>
          </h2>
          <p className="text-lg text-text-secondary">
            Submit an inquiry or find us at any of our branches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Inquiry Form */}
          <div className="glass-panel p-8 rounded-2xl border border-border-card relative">
            {isSuccess ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-bg-app/95 backdrop-blur-sm rounded-2xl text-center z-20">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Inquiry Submitted!</h3>
                <p className="text-text-secondary">Your inquiry has been submitted successfully. Our team will contact you shortly.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Submit Another
                </button>
              </div>
            ) : null}

            <div className="flex items-center gap-3 mb-8">
              <Mail className="text-[var(--color-primary)]" size={24} />
              <h3 className="text-2xl font-bold text-white">Send an Inquiry</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Full Name *</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Mobile Number *</label>
                  <input required name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="+91 9876543210" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Business Name (Optional)</label>
                  <input name="businessName" value={formData.businessName} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="Doe Motors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Business Type</label>
                  <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors">
                    <option value="Retail Garage">Retail Garage</option>
                    <option value="Authorized Dealership">Authorized Dealership</option>
                    <option value="Franchise Service">Franchise Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">District *</label>
                  <input required name="district" value={formData.district} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="City Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">State</label>
                  <input name="state" value={formData.state} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="State Name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Message *</label>
                <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none" placeholder="How can we help you?" />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-[var(--color-primary)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send size={18} /> Submit Inquiry</>
                )}
              </button>
            </form>
          </div>

          {/* Live Map */}
          <div className="glass-panel border-border-card h-[680px] rounded-2xl overflow-hidden relative z-0 p-2 bg-gradient-to-tr from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10">
            {branches.length > 0 ? (
              <MapContainer 
                center={center as [number, number]} 
                zoom={hq ? 12 : 4} 
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {branches.map(branch => (
                  <Marker key={branch.id} position={[branch.lat, branch.lng]}>
                    <Popup>
                      <div className="text-xs text-gray-800 p-1">
                        <p className="font-bold text-sm mb-1 text-[var(--color-primary)] uppercase tracking-wider">{branch.name}</p>
                        <p>{branch.address}</p>
                        {branch.mobile && <p className="mt-1 font-semibold">{branch.mobile}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-xl border border-white/10">
                 <p className="text-text-muted">Map temporarily unavailable</p>
               </div>
            )}
          </div>

        </div>

        {/* Branch Directory List */}
        {branches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="text-[var(--color-primary)]" />
              Branch Directory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {branches.map(branch => (
                <div key={branch.id} className={`glass-panel p-6 border transition-all hover:-translate-y-1 ${(branch.order === 0) ? 'border-[var(--color-primary)] shadow-[0_0_20px_rgba(0,240,255,0.1)]' : 'border-border-card hover:border-[var(--color-secondary)]/50'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-text-primary truncate max-w-[200px]">{branch.name}</h3>
                    {(branch.order === 0) && (
                      <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-[var(--color-primary)]/30 shrink-0">
                        HQ
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-text-secondary">
                      <MapPin size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <p className="text-xs line-clamp-2">{branch.address}</p>
                    </div>
                    {branch.mobile && (
                      <div className="flex items-center gap-3 text-text-secondary">
                        <Phone size={16} className="text-[var(--color-secondary)] shrink-0" />
                        <p className="text-xs">{branch.mobile}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
