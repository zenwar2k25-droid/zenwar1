import React from 'react';
import { Target, Award, GripVertical, CheckCircle2 } from 'lucide-react';
import type { AboutPageConfig } from '../../../data/seedData';

interface Props {
  aboutData: AboutPageConfig;
}

export const AboutSection: React.FC<Props> = ({ aboutData }) => {
  if (!aboutData || !aboutData.active) return null;

  return (
    <section id="about" className="bg-[var(--bg-app)]">
      {/* Hero Banner Area */}
      {aboutData.heroBanner && (
         <div className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {aboutData.heroBgImage ? (
                <div className="absolute inset-0 z-0">
                   <img src={aboutData.heroBgImage} className="w-full h-full object-cover opacity-30" alt="Background" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 to-black/80 z-0" />
            )}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                  <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-lg">{aboutData.aboutTitle}</h1>
                  <p className="text-xl text-text-secondary max-w-2xl leading-relaxed">{aboutData.companyDescription}</p>
               </div>
               <div className="flex-1 flex justify-center">
                  <img src={aboutData.heroBanner} className="max-w-full rounded-2xl shadow-2xl drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]" alt="Hero" />
               </div>
            </div>
         </div>
      )}

      {/* Story & History */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
         <div className="flex flex-col md:flex-row gap-16 items-center">
             {aboutData.companyImage && (
                 <div className="flex-1">
                     <img src={aboutData.companyImage} alt="Company" className="w-full rounded-2xl shadow-lg border border-[var(--border-card)]" />
                 </div>
             )}
             <div className="flex-1 space-y-6">
                 <h2 className="text-4xl font-display font-bold">Our Story</h2>
                 <p className="text-text-secondary leading-relaxed text-lg whitespace-pre-wrap">{aboutData.history}</p>
             </div>
         </div>
      </div>

      {/* Mission & Vision */}
      <div className="px-6 max-w-7xl mx-auto py-24 border-t border-[var(--border-card)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-8 rounded-2xl bg-surface-dark border border-[var(--border-card)] group hover:border-[var(--color-primary)] transition-colors overflow-hidden relative">
            {aboutData.missionImage && <img src={aboutData.missionImage} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" alt="Mission" />}
            <div className="relative z-10">
               <Target className="w-12 h-12 text-[var(--color-primary)] mb-6" />
               <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
               <p className="text-text-secondary leading-relaxed">{aboutData.mission}</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-surface-dark border border-[var(--border-card)] group hover:border-[var(--color-primary)] transition-colors overflow-hidden relative">
            {aboutData.visionImage && <img src={aboutData.visionImage} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" alt="Vision" />}
            <div className="relative z-10">
               <Award className="w-12 h-12 text-[var(--color-primary)] mb-6" />
               <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
               <p className="text-text-secondary leading-relaxed">{aboutData.vision}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      {aboutData.coreValues && Array.isArray(aboutData.coreValues) && aboutData.coreValues.length > 0 && (
         <div className="py-24 bg-surface-dark border-t border-[var(--border-card)]">
            <div className="max-w-7xl mx-auto px-6">
               <div className="text-center mb-16">
                 <h2 className="text-4xl font-display font-bold mb-4">Core Values</h2>
                 <p className="text-text-secondary">The principles that guide everything we do.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {aboutData.coreValues.filter(v => v.active).sort((a: any, b: any) => a.order - b.order).map(val => (
                     <div key={val.id} className="bg-black border border-[var(--border-card)] rounded-2xl overflow-hidden relative group">
                        {val.imageUrl && <img src={val.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" alt={val.title} />}
                        <div className="relative z-10 p-8">
                           {val.iconUrl ? (
                              <img src={val.iconUrl} className="w-12 h-12 mb-6 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" alt="Icon" />
                           ) : (
                              <CheckCircle2 className="w-12 h-12 text-[var(--color-primary)] mb-6" />
                           )}
                           <h3 className="text-2xl font-bold text-white mb-4">{val.title}</h3>
                           <p className="text-text-secondary leading-relaxed">{val.description}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* CEO Message */}
      {aboutData.ceoMessage && (
         <div className="py-24 px-6 max-w-7xl mx-auto border-t border-[var(--border-card)]">
            <div className="bg-surface-dark border border-[var(--color-primary)]/30 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none" />
               <div className="relative z-10 flex-1 order-2 md:order-1">
                  <h3 className="text-3xl font-display font-bold mb-8">Message from the Founder</h3>
                  <blockquote className="text-xl text-text-secondary italic border-l-4 border-[var(--color-primary)] pl-6 leading-relaxed">
                     "{aboutData.ceoMessage}"
                  </blockquote>
               </div>
               {aboutData.ceoPhoto && (
                   <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 order-1 md:order-2 rounded-full border-4 border-[var(--border-card)] overflow-hidden shadow-2xl">
                       <img src={aboutData.ceoPhoto} alt="CEO" className="w-full h-full object-cover" />
                   </div>
               )}
            </div>
         </div>
      )}

      {/* Timeline */}
      {aboutData.timeline && Array.isArray(aboutData.timeline) && aboutData.timeline.some(t => t.active) && (
        <div className="px-6 bg-[var(--bg-card)] border-y border-[var(--border-card)] py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-display font-bold mb-16 text-center">Our Journey</h2>
            <div className="space-y-16 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-card)] before:to-transparent">
              {aboutData.timeline.filter(t => t.active).sort((a: any, b: any) => a.order - b.order).map((event: any) => (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-[var(--color-primary)] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <div className="w-2 h-2 bg-black rounded-full" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-surface-dark border border-[var(--border-card)] hover:border-[var(--color-primary)]/50 transition-colors">
                    <div className="text-[var(--color-primary)] font-bold text-xl mb-2">{event.year}</div>
                    <h4 className="text-2xl font-bold text-white mb-4">{event.title}</h4>
                    {event.bannerImage && (
                        <div className="w-full h-32 mb-4 rounded-xl overflow-hidden">
                           <img src={event.bannerImage} className="w-full h-full object-cover" alt="Banner" />
                        </div>
                    )}
                    <p className="text-text-secondary leading-relaxed mb-4">{event.description}</p>
                    {event.images && event.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                           {event.images.map((img: string, i: number) => (
                               <img key={i} src={img} className="w-full h-20 object-cover rounded-lg border border-[var(--border-card)]" alt={`Event ${i}`} />
                           ))}
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leadership */}
      {aboutData.leadership && Array.isArray(aboutData.leadership) && aboutData.leadership.some((l: any) => l.active) && (
        <div className="px-6 max-w-7xl mx-auto py-24 border-b border-[var(--border-card)]">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Leadership Team</h2>
            <p className="text-text-secondary">The minds behind our success.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutData.leadership.filter((l: any) => l.active).sort((a: any, b: any) => a.order - b.order).map((member: any) => (
              <div key={member.id} className="bg-surface-dark border border-[var(--border-card)] rounded-2xl overflow-hidden group hover:border-[var(--color-primary)]/50 transition-all shadow-lg">
                <div className="aspect-square relative overflow-hidden bg-black flex items-center justify-center">
                  {member.photoUrl ? (
                     <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                     <span className="text-text-muted">No Photo</span>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-1 text-white">{member.name}</h4>
                  <div className="text-[var(--color-primary)] text-sm font-medium mb-4">{member.designation}</div>
                  <p className="text-text-secondary text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery & Office & Achievements combined showcase */}
      {((Array.isArray(aboutData.gallery) && aboutData.gallery.length > 0) || aboutData.officeImages?.exterior || (aboutData.achievements && Array.isArray(aboutData.achievements.awards) && aboutData.achievements.awards.length > 0)) && (
          <div className="px-6 max-w-7xl mx-auto py-24 space-y-24">
             {aboutData.gallery && Array.isArray(aboutData.gallery) && aboutData.gallery.length > 0 && (
                 <div>
                    <h2 className="text-4xl font-display font-bold mb-12 text-center">Company Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {aboutData.gallery.map((img: string, i: number) => (
                            <div key={i} className="aspect-video rounded-xl overflow-hidden border border-[var(--border-card)] group">
                               <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Gallery ${i}`} />
                            </div>
                        ))}
                    </div>
                 </div>
             )}

             {aboutData.officeImages && (aboutData.officeImages.exterior || (Array.isArray(aboutData.officeImages.teamPhotos) && aboutData.officeImages.teamPhotos.length > 0)) && (
                 <div>
                    <h2 className="text-4xl font-display font-bold mb-12 text-center">Our Workspace</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {aboutData.officeImages.exterior && (
                           <div className="aspect-square rounded-xl overflow-hidden border border-[var(--border-card)] relative"><img src={aboutData.officeImages.exterior} className="w-full h-full object-cover" /><div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm text-white font-bold text-sm">Exterior</div></div>
                        )}
                        {aboutData.officeImages.interior && (
                           <div className="aspect-square rounded-xl overflow-hidden border border-[var(--border-card)] relative"><img src={aboutData.officeImages.interior} className="w-full h-full object-cover" /><div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm text-white font-bold text-sm">Interior</div></div>
                        )}
                        {aboutData.officeImages.reception && (
                           <div className="aspect-square rounded-xl overflow-hidden border border-[var(--border-card)] relative"><img src={aboutData.officeImages.reception} className="w-full h-full object-cover" /><div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm text-white font-bold text-sm">Reception</div></div>
                        )}
                        {aboutData.officeImages.meetingRoom && (
                           <div className="aspect-square rounded-xl overflow-hidden border border-[var(--border-card)] relative"><img src={aboutData.officeImages.meetingRoom} className="w-full h-full object-cover" /><div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm text-white font-bold text-sm">Meeting Room</div></div>
                        )}
                    </div>
                    {aboutData.officeImages.teamPhotos && Array.isArray(aboutData.officeImages.teamPhotos) && aboutData.officeImages.teamPhotos.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                           {aboutData.officeImages.teamPhotos.map((img: string, i: number) => (
                               <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[var(--border-card)]">
                                  <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                               </div>
                           ))}
                        </div>
                    )}
                 </div>
             )}

             {aboutData.achievements && ((Array.isArray(aboutData.achievements.awards) && aboutData.achievements.awards.length > 0) || (Array.isArray(aboutData.achievements.certificates) && aboutData.achievements.certificates.length > 0)) && (
                 <div>
                    <h2 className="text-4xl font-display font-bold mb-12 text-center">Awards & Recognition</h2>
                    {Array.isArray(aboutData.achievements.awards) && aboutData.achievements.awards.length > 0 && (
                        <div className="mb-12">
                           <h3 className="text-xl font-bold text-[var(--color-primary)] mb-6 text-center">Awards</h3>
                           <div className="flex flex-wrap justify-center gap-6">
                               {aboutData.achievements.awards.map((img: string, i: number) => (
                                   <img key={i} src={img} className="w-48 h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" alt={`Award ${i}`} />
                               ))}
                           </div>
                        </div>
                    )}
                    {Array.isArray(aboutData.achievements.certificates) && aboutData.achievements.certificates.length > 0 && (
                        <div>
                           <h3 className="text-xl font-bold text-[var(--color-primary)] mb-6 text-center">Certifications</h3>
                           <div className="flex flex-wrap justify-center gap-6">
                               {aboutData.achievements.certificates.map((img: string, i: number) => (
                                   <div key={i} className="bg-surface-dark border border-[var(--border-card)] p-2 rounded-xl">
                                      <img src={img} className="w-64 h-auto object-contain" alt={`Certificate ${i}`} />
                                   </div>
                               ))}
                           </div>
                        </div>
                    )}
                 </div>
             )}
          </div>
      )}
    </section>
  );
};
