import re

with open('src/pages/superadmin/Workshops.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

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
                    onClick={() => {"""

# Replace exactly above toggleWorkshopStatus.
# Use regex to match irrespective of CRLF
pattern = re.compile(r'(\s*<div className="flex gap-2">\s*<button[^>]*>\s*toggleWorkshopStatus\(shop\.id\);)', re.DOTALL)

# Let's ensure it isn't already there
if 'Verify Workshop' not in content:
    # We will replace the pattern with our new buttons + the matched pattern
    # Wait, the verify_button string already includes `<div className="flex gap-2">\n                  <button \n                    onClick={() => {`
    
    # Better approach: Just find `toggleWorkshopStatus(shop.id);` and insert right before the parent `div`
    # Let's use `content.find('toggleWorkshopStatus(shop.id);')`
    idx = content.find('toggleWorkshopStatus(shop.id);')
    if idx != -1:
        # Find the preceding `<div className="flex gap-2">`
        div_idx = content.rfind('<div className="flex gap-2">', 0, idx)
        if div_idx != -1:
            # Insert verify_button string but remove the overlapping parts from verify_button
            # Actually, I'll just insert the buttons inside a new div right before this one
            new_div = """                <div className="flex gap-2">
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
                </div>\n\n"""
            
            content = content[:div_idx] + new_div + content[div_idx:]

with open('src/pages/superadmin/Workshops.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected verify buttons")
