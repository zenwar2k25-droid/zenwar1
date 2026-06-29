import React from 'react';
import { useDatabase } from '../../../context/DatabaseContext';
import { Plus, Trash2, Edit2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { demoContactTeam } from '../../../data/seedData';
import type { ContactTeamMember } from '../../../data/seedData';

export const ContactTeamEditor: React.FC = () => {
  const { draftWebsiteState, saveDraft } = useDatabase();

  const team = draftWebsiteState?.contactTeam || demoContactTeam;

  const handleUpdate = (updates: ContactTeamMember[]) => {
    saveDraft({ contactTeam: updates });
  };

  const addMember = () => {
    const nt: ContactTeamMember = {
      id: Date.now().toString(),
      name: 'New Member',
      designation: 'Role',
      department: 'Dept',
      phone: '',
      whatsapp: '',
      email: '',
      availability: 'Online',
      photoUrl: '',
      order: team.length + 1,
      active: true
    };
    handleUpdate([...team, nt]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display">Contact Team</h2>
        <button onClick={addMember} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-black font-bold text-sm">
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {team.sort((a: any, b: any) => a.order - b.order).map((member: any) => (
          <div key={member.id} className="bg-surface-dark border border-[var(--border-card)] p-4 rounded-xl flex gap-4">
            <div className="w-24 shrink-0 flex flex-col gap-2">
              <div className="w-full aspect-square bg-black border border-[var(--border-card)] rounded-lg overflow-hidden flex items-center justify-center">
                {member.photoUrl ? <img src={member.photoUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-text-secondary" />}
              </div>
              <input type="text" placeholder="Photo URL" value={member.photoUrl} onChange={(e) => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, photoUrl: e.target.value } : m));
              }} className="w-full bg-black border border-[var(--border-card)] rounded-lg px-2 py-1 text-white text-[10px]" />
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input type="text" placeholder="Name" value={member.name} onChange={(e) => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, name: e.target.value } : m));
              }} className="bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
              <input type="text" placeholder="Designation" value={member.designation} onChange={(e) => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, designation: e.target.value } : m));
              }} className="bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
              <input type="text" placeholder="Department" value={member.department} onChange={(e) => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, department: e.target.value } : m));
              }} className="bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
              <select value={member.availability} onChange={(e) => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, availability: e.target.value as any } : m));
              }} className="bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm">
                <option value="Online">Online</option>
                <option value="Busy">Busy</option>
                <option value="Offline">Offline</option>
              </select>
              <input type="text" placeholder="Phone" value={member.phone} onChange={(e) => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, phone: e.target.value } : m));
              }} className="bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
              <input type="email" placeholder="Email" value={member.email} onChange={(e) => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, email: e.target.value } : m));
              }} className="bg-black border border-[var(--border-card)] rounded-lg px-3 py-1.5 text-white text-sm" />
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => {
                handleUpdate(team.map((m: any) => m.id === member.id ? { ...m, active: !m.active } : m));
              }} className={`px-3 py-1.5 rounded text-xs font-bold ${member.active ? 'bg-green-500/20 text-green-500' : 'bg-surface text-text-secondary'}`}>
                {member.active ? 'On' : 'Off'}
              </button>
              <button onClick={() => {
                handleUpdate(team.filter((m: any) => m.id !== member.id));
              }} className="px-3 py-1.5 bg-red-500/20 text-red-500 rounded text-xs font-bold mt-auto">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
