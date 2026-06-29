import re

with open('src/pages/superadmin/Workshops.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the entire block using regex that matches the start and end precisely, allowing for any whitespace
pattern = re.compile(r'\s*\{shop\.status === \'Active\' && shop\.verified && \(\s*<button[^>]*>\s*<ShieldAlert[^>]*/> Remove Verify\s*</button>\s*\)\}', re.DOTALL)

content = pattern.sub('', content)

# Now, we should add it ONLY in the right place. The right place is right next to the "Verify Workshop" button
# Wait, let's find the Verify Workshop button
verify_button_pattern = re.compile(r'(\{shop\.status === \'Active\' && !shop\.verified && \([\s\S]*?<ShieldCheck size=\{12\} /> Verify Workshop\s*</button>\s*\)\})')

# Let's see if the remove verify block is already there. Since we just removed all, it shouldn't be.
# We will append the Remove verify block right after the Verify Workshop block
remove_verify_block = """
                  {shop.status === 'Active' && shop.verified && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWorkshopVerification(shop.id);
                        setToastMsg('Verification Removed');
                        setTimeout(() => setToastMsg(''), 3000);
                      }}
                      className="flex-1 py-2 text-[10px] font-bold text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/30 rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      <ShieldAlert size={12} /> Remove Verify
                    </button>
                  )}"""

content = verify_button_pattern.sub(r'\1' + remove_verify_block, content)

with open('src/pages/superadmin/Workshops.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned duplicate blocks")
