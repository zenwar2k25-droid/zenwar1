import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { useDatabase } from '../../../context/DatabaseContext';
import type { ContactPageConfig, ContactTeamMember, BranchDirectoryConfig } from '../../../data/seedData';
import { LiveBranchMap } from '../../shared/LiveBranchMap';

interface Props {
  contactData: ContactPageConfig;
  teamData: ContactTeamMember[];
  branchConfig?: BranchDirectoryConfig;
}

export const ContactSection: React.FC<Props> = ({ contactData, teamData, branchConfig }) => {
  const { submitInquiry } = useDatabase();
  const [formData, setFormData] = useState({
    name: '', businessName: '', businessType: '', district: '', phone: '', email: '', message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  if (!contactData || !contactData.active) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    submitInquiry({
      fullName: formData.name,
      businessName: formData.businessName,
      businessType: formData.businessType,
      district: formData.district,
      mobileNumber: formData.phone,
      email: formData.email,
      message: formData.message
    });
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', businessName: '', businessType: '', district: '', phone: '', email: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1000);
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold mb-4">Contact & Support</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">Get in touch with our teams across multiple branches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        <div>
          <h2 className="text-3xl font-display font-bold mb-8">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center text-[var(--color-primary)] shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Phone</h4>
                <p className="text-text-secondary text-sm">{contactData.mobileNumber}</p>
                {contactData.emergencyContact && <p className="text-[var(--color-secondary)] text-sm mt-1">24/7: {contactData.emergencyContact}</p>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center text-[var(--color-secondary)] shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Email</h4>
                <p className="text-text-secondary text-sm">Support: {contactData.supportEmail}</p>
                <p className="text-text-secondary text-sm">Sales: {contactData.salesEmail}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center text-[var(--color-primary)] shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Office</h4>
                <p className="text-text-secondary text-sm">{contactData.officeAddress}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center text-[var(--color-secondary)] shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Hours</h4>
                <p className="text-text-secondary text-sm">{contactData.workingHours}</p>
              </div>
            </div>
          </div>

          {/* Our Team */}
          {teamData && teamData.some((t: any) => t.active) && (
            <div>
              <h3 className="text-2xl font-display font-bold mb-6">Our Support Team</h3>
              <div className="space-y-4">
                {teamData.filter((t: any) => t.active).sort((a: any, b: any) => a.order - b.order).map((member: any) => (
                  <div key={member.id} className="p-4 rounded-xl bg-surface-dark border border-[var(--border-card)] flex items-center gap-4">
                    <img src={member.photoUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{member.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.availability === 'Online' ? 'bg-green-500/20 text-green-500' :
                          member.availability === 'Busy' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {member.availability}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{member.designation} • {member.department}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${member.phone}`} className="p-2 rounded-lg bg-black hover:text-[var(--color-primary)] transition-colors"><Phone className="w-4 h-4" /></a>
                      <a href={`mailto:${member.email}`} className="p-2 rounded-lg bg-black hover:text-[var(--color-secondary)] transition-colors"><Mail className="w-4 h-4" /></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inquiry Form */}
        <div className="bg-surface-dark rounded-3xl p-8 border border-[var(--border-card)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-black">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-display font-bold">Send an Inquiry</h3>
          </div>
          
          {formStatus === 'success' ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl text-center">
              <p className="font-bold mb-2">Message Sent Successfully!</p>
              <p className="text-sm opacity-80">Our team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Full Name *</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Mobile Number *</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Business Name</label>
                  <input name="businessName" value={formData.businessName} onChange={handleInputChange} type="text" className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Business Type</label>
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors">
                    <option value="">Select Type...</option>
                    <option value="Retail">Retail</option>
                    <option value="Service">Service</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">District *</label>
                  <input required name="district" value={formData.district} onChange={handleInputChange} type="text" className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Email Address</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Message *</label>
                <textarea required name="message" value={formData.message} onChange={handleInputChange} rows={4} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-4 py-2.5 text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors"></textarea>
              </div>
              <button type="submit" disabled={formStatus === 'submitting'} className="w-full py-3 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_20px_var(--color-primary-glow)] transition-all flex items-center justify-center gap-2">
                {formStatus === 'submitting' ? 'Sending...' : <><Send className="w-4 h-4" /> Send Inquiry</>}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Branches & Map */}
      {branchConfig && branchConfig.branches.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-display font-bold text-center">Our Branches</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {branchConfig.branches.filter(b => b.active).map(branch => (
                <div key={branch.id} className="p-6 rounded-2xl bg-surface-dark border border-[var(--border-card)]">
                  <h4 className="font-bold text-lg mb-2">{branch.name}</h4>
                  <p className="text-text-secondary text-sm mb-4">{branch.address}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <a href={`tel:${branch.mobile}`} className="flex items-center gap-2 text-white hover:text-[var(--color-primary)] transition-colors"><Phone className="w-4 h-4" /> {branch.mobile || 'N/A'}</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2 h-[600px] rounded-3xl overflow-hidden border border-[var(--border-card)] relative group">
              <LiveBranchMap config={branchConfig} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
