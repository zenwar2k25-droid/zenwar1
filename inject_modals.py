import os

def inject_modal():
    file_path = 'src/pages/superadmin/Workshops.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modals = """
        {/* Verify Modal */}
        {workshopToVerify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
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
                    className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      verifyWorkshop(workshopToVerify.id);
                      triggerToast(`${workshopToVerify.name} has been verified.`);
                      setWorkshopToVerify(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Verify Modal */}
        {workshopToUnverify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
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
                    className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      removeWorkshopVerification(workshopToUnverify.id);
                      triggerToast(`Verification removed for ${workshopToUnverify.name}.`);
                      setWorkshopToUnverify(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
"""

    if "workshopToVerify &&" not in content:
        idx = content.rfind('      {toastMsg && (')
        if idx != -1:
            content = content[:idx] + modals + "\n" + content[idx:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Successfully injected modals.")
        else:
            print("Could not find insertion point.")
    else:
        print("Modals already exist.")

inject_modal()
