import re

with open('src/pages/superadmin/Workshops.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State changes: add workshopToVerify and workshopToUnverify
state_marker = "const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);"
new_state = state_marker + """
  const [workshopToVerify, setWorkshopToVerify] = useState<Workshop | null>(null);
  const [workshopToUnverify, setWorkshopToUnverify] = useState<Workshop | null>(null);"""

if "workshopToVerify" not in content:
    content = content.replace(state_marker, new_state)

# 2. Update filteredWorkshops logic
filtered_old = """  const filteredWorkshops = useMemo(() => {
    return workshops.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workshops, searchQuery]);"""

filtered_new = """  const filteredWorkshops = useMemo(() => {
    return workshops.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            w.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            w.tenantDomain.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = true;
      if (filterStatus === 'Newly Arrived') matchesFilter = !w.verified && w.status !== 'Expired' && w.status !== 'Suspended';
      else if (filterStatus === 'Verified') matchesFilter = !!w.verified;
      else if (filterStatus === 'Expired') matchesFilter = w.status === 'Expired';
      else if (filterStatus === 'Suspended') matchesFilter = w.status === 'Suspended';
      
      return matchesSearch && matchesFilter;
    });
  }, [workshops, searchQuery, filterStatus]);"""

if "matchesFilter = true" not in content:
    content = content.replace(filtered_old, filtered_new)

# 3. Add badges to card
badges_old = """                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
                      shop.status === 'Active' 
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                        : 'border-red-500/20 text-red-400 bg-red-500/5'
                    }`}>
                      {shop.status}
                    </span>
                  </div>"""

badges_new = """                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${
                      shop.status === 'Active' 
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                        : 'border-red-500/20 text-red-400 bg-red-500/5'
                    }`}>
                      {shop.status}
                    </span>
                    {shop.status === 'Active' && shop.verified && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 uppercase flex items-center gap-1">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    )}
                    {shop.status === 'Active' && !shop.verified && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-orange-500/30 text-orange-400 bg-orange-500/10 uppercase flex items-center gap-1">
                        <ShieldAlert size={10} /> Pending Verification
                      </span>
                    )}
                  </div>"""

if "Pending Verification" not in content:
    content = content.replace(badges_old, badges_new)

# 4. Action Buttons Injection
actions_marker = """                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      toggleWorkshopStatus(shop.id);
                      triggerToast(shop.status === 'Suspended' ? 'Workshop enabled!' : 'Workshop suspended!');
                    }}"""

verify_button = """                <div className="flex gap-2">
                  {shop.status === 'Active' && !shop.verified && (
                    <button 
                      onClick={() => setWorkshopToVerify(shop)}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 font-bold text-[9px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                    >
                      <ShieldCheck size={11} /> Verify Workshop
                    </button>
                  )}
                  {shop.status === 'Active' && shop.verified && (
                    <button 
                      onClick={() => setWorkshopToUnverify(shop)}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-orange-400 border border-transparent hover:border-orange-500/30 font-bold text-[9px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ShieldAlert size={11} /> Remove Verification
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      toggleWorkshopStatus(shop.id);
                      triggerToast(shop.status === 'Suspended' ? 'Workshop enabled!' : 'Workshop suspended!');
                    }}"""

if "Verify Workshop" not in content and "setWorkshopToVerify" not in content:
    content = content.replace(actions_marker, verify_button)

# 5. Add Modals at the end of AnimatePresence
modals = """
        {/* Verify Modal */}
        {workshopToVerify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <div className="p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-cyan-400" size={16} /> Verify Workshop
                </h3>
                <div className="space-y-3 bg-black/20 p-3 rounded-xl border border-white/5 mb-5 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Workshop:</span>
                    <span className="text-white font-bold">{workshopToVerify.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Domain:</span>
                    <span className="text-cyan-400 font-mono font-bold">{workshopToVerify.tenantDomain}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Are you sure you want to verify this workshop? Verified workshops are considered fully onboarded.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setWorkshopToVerify(null)}
                    className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      verifyWorkshop(workshopToVerify.id);
                      triggerToast(`${workshopToVerify.name} has been verified.`);
                      setWorkshopToVerify(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Remove Verify Modal */}
        {workshopToUnverify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <div className="p-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-orange-400" size={16} /> Remove Verification
                </h3>
                <div className="space-y-3 bg-black/20 p-3 rounded-xl border border-white/5 mb-5 text-xs">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Workshop:</span>
                    <span className="text-white font-bold">{workshopToUnverify.name}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Remove verification status from this workshop? It will be moved back to the "Newly Arrived" pool.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setWorkshopToUnverify(null)}
                    className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      removeWorkshopVerification(workshopToUnverify.id);
                      triggerToast(`Verification removed for ${workshopToUnverify.name}.`);
                      setWorkshopToUnverify(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/50 text-xs font-bold transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
"""

end_presence = "      </AnimatePresence>\n    </div>"
if "workshopToUnverify &&" not in content:
    content = content.replace(end_presence, modals + end_presence)

with open('src/pages/superadmin/Workshops.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Workshops.tsx")
